import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicCreateOrderSchema, isCuid } from '@/lib/validations'
import { verifyShippingCost } from '@/lib/shipping-calc'
import { notifyAdminNewOrder } from '@/lib/whatsapp-notify'

// POST - Create order from public checkout (generates invoice)
export async function POST(request: NextRequest) {
  try {
    // Safely parse JSON body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 })
    }

    // Validate input with Zod (NO price from client!)
    const result = publicCreateOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) },
        { status: 400 }
      )
    }
    const data = result.data

    // Validate product IDs are CUIDs (prevent injection)
    for (const item of data.items) {
      if (!isCuid(item.productId)) {
        return NextResponse.json({ error: 'Product ID tidak valid' }, { status: 400 })
      }
    }

    // ===== PRE-TRANSACTION: Shipping cost verification (read-only, outside tx) =====
    // Calculate total weight from products (lightweight query)
    const productIds = data.items.map(item => item.productId)
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null,
      },
      select: {
        id: true,
        wholesalePrice: true,
        price: true,
        minOrder: true,
        stock: true,
        name: true,
        images: true,
        weight: true,
      },
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    // Validate products and build order items BEFORE transaction
    const orderItems: { productId: string; quantity: number; size: string; price: number; productName: string; productImage: string }[] = []
    let productAmount = 0
    const errors: string[] = []
    let totalWeightGrams = 0

    for (const item of data.items) {
      const product = productMap.get(item.productId)

      if (!product) {
        errors.push(`Produk tidak ditemukan atau sudah dihapus`)
        continue
      }

      if (product.stock <= 0) {
        errors.push(`Produk ${product.name} sudah habis`)
        continue
      }

      if (item.quantity < product.minOrder) {
        errors.push(`Minimal order untuk ${product.name} adalah ${product.minOrder}`)
        continue
      }

      if (item.quantity > product.stock) {
        errors.push(`Stok ${product.name} tidak mencukupi (tersedia: ${product.stock})`)
        continue
      }

      const unitPrice = item.quantity >= product.minOrder ? product.wholesalePrice : product.price
      productAmount += unitPrice * item.quantity

      const firstImage = product.images ? product.images.split(',')[0].trim() : ''

      // Calculate weight
      const parsed = parseWeight(product.weight || '250')
      totalWeightGrams += parsed * item.quantity

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        price: unitPrice,
        productName: product.name,
        productImage: firstImage,
      })
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('. ') }, { status: 400 })
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'Tidak ada item yang valid untuk dipesan' }, { status: 400 })
    }

    if (totalWeightGrams === 0) totalWeightGrams = 250

    // Verify shipping cost OUTSIDE the transaction (read-only operation)
    const clientShippingCost = data.shippingCost ?? 0
    const verification = await verifyShippingCost(
      data.destinationProvince || data.destinationCity || '',
      data.courier || '',
      data.courierService || '',
      totalWeightGrams,
      clientShippingCost
    )
    const shippingCost = verification.cost

    if (verification.adjusted) {
      console.log(
        `[orders] Shipping cost adjusted: client=${clientShippingCost} → server=${shippingCost} (${verification.source})`
      )
    }

    const totalAmount = productAmount + shippingCost

    // ===== LEAN TRANSACTION: Only the essential writes =====
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

    const order = await db.$transaction(async (tx) => {
      // Re-check stock inside transaction to prevent race conditions
      for (const item of orderItems) {
        const currentProduct = await tx.product.findFirst({
          where: { id: item.productId, deletedAt: null },
          select: { stock: true, name: true },
        })
        if (!currentProduct || currentProduct.stock < item.quantity) {
          throw Object.assign(
            new Error(`Stok ${currentProduct?.name || 'produk'} tidak mencukupi. Pesanan lain baru saja menghabiskan stok ini.`),
            { statusCode: 409 }
          )
        }
      }

      // Count today's orders for sequence number
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayCount = await tx.order.count({ where: { createdAt: { gte: todayStart } } })

      // Generate unique order number
      const { randomInt } = await import('crypto')
      let orderNumber = ''
      let attempts = 0
      do {
        const seq = String(todayCount + 1 + attempts).padStart(4, '0')
        const rand = String(randomInt(0, 10000)).padStart(4, '0')
        orderNumber = `GPJ-${dateStr}-${seq}${rand}`
        attempts++
        if (attempts > 10) {
          throw Object.assign(new Error('Gagal membuat nomor order unik. Coba lagi.'), { statusCode: 503 })
        }
      } while (await tx.order.findUnique({ where: { orderNumber } }))

      // Create the order with items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          customerAddr: data.customerAddr,
          status: 'pending',
          paymentMethod: 'transfer',
          paymentStatus: 'unpaid',
          totalAmount,
          shippingCost,
          courier: data.courier,
          courierService: data.courierService,
          destinationCity: data.destinationCity,
          note: data.note,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: { select: { name: true, images: true } },
            },
          },
        },
      })

      // Deduct stock & increment sold
      for (const item of orderItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity }, deletedAt: null },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        })
        if (updated.count === 0) {
          throw Object.assign(
            new Error('Stok tidak mencukupi. Pesanan lain baru saja menghabiskan stok ini.'),
            { statusCode: 409 }
          )
        }
      }

      return newOrder
    })

    // Strip supplier info from response
    const safeOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product ? { name: item.product.name, images: item.product.images } : { name: item.productName, images: item.productImage },
      })),
    }

    // Send WhatsApp notification to admin (non-blocking)
    notifyAdminNewOrder({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      shippingCost: order.shippingCost,
      destinationCity: order.destinationCity ?? undefined,
      paymentStatus: order.paymentStatus,
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      createdAt: order.createdAt,
    }).catch(err =>
      console.warn('[orders] WhatsApp notification failed:', err)
    )

    return NextResponse.json({ order: safeOrder }, { status: 201 })
  } catch (error) {
    // Log FULL error details for debugging (visible in Vercel logs)
    const errorType = error?.constructor?.name || 'Unknown'
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[orders] CREATE ORDER FAILED: type=${errorType} message="${errorMessage}"`)

    // Log the full Prisma error if available
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code?: string; meta?: unknown }
      console.error(`[orders] Prisma error code: ${prismaError.code}, meta:`, prismaError.meta)
    }

    // Check if this is a controlled validation error with statusCode
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode
      return NextResponse.json({ error: error.message }, { status: statusCode })
    }

    // Detect specific errors and give helpful messages
    if (errorMessage.includes('no such column') || errorMessage.includes('SQLITE_ERROR')) {
      return NextResponse.json({
        error: 'Sistem sedang diperbarui. Silakan coba lagi dalam 1-2 menit.',
      }, { status: 503 })
    }

    if (errorMessage.includes('does not exist') || errorMessage.includes('no such table')) {
      return NextResponse.json({
        error: 'Sistem sedang diperbarui. Silakan coba lagi dalam 1-2 menit.',
      }, { status: 503 })
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('Timed out')) {
      return NextResponse.json({
        error: 'Server sedang sibuk. Silakan coba lagi dalam beberapa detik.',
      }, { status: 504 })
    }

    // Generic error — do NOT expose internal error details to client
    return NextResponse.json({
      error: 'Gagal membuat pesanan. Silakan coba lagi.',
    }, { status: 500 })
  }
}

/**
 * Parse product weight string to grams.
 */
function parseWeight(weightStr: string): number {
  if (!weightStr || typeof weightStr !== 'string') return 250

  const normalized = weightStr.trim().toLowerCase()

  const kgMatch = normalized.match(/^([\d.]+)\s*kg$/)
  if (kgMatch) {
    const val = parseFloat(kgMatch[1])
    return isNaN(val) ? 250 : Math.round(val * 1000)
  }

  const gMatch = normalized.match(/^([\d.]+)\s*g$/)
  if (gMatch) {
    const val = parseFloat(gMatch[1])
    return isNaN(val) ? 250 : Math.round(val)
  }

  const numVal = parseFloat(normalized)
  if (!isNaN(numVal) && numVal > 0) {
    return numVal < 10 ? Math.round(numVal * 1000) : Math.round(numVal)
  }

  return 250
}
