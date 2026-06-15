import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBody, createOrderSchema, isCuid } from '@/lib/validations'
import { requireAdmin, isAdminError } from '@/lib/auth-guard'

// GET - List orders with filters
export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
    const status = searchParams.get('status') || ''
    const search = (searchParams.get('search') || '').slice(0, 200)

    // Validate status parameter
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    const where: Record<string, unknown> = { deletedAt: null }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ]
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { name: true, images: true, supplierName: true, supplierLink: true, supplierPhone: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 })
  }
}

// POST - Create order (admin)
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const data = await validateBody(request, createOrderSchema)
    if (data instanceof NextResponse) return data

    // Validate product IDs are CUIDs
    for (const item of data.items) {
      if (!isCuid(item.productId)) {
        return NextResponse.json({ error: 'Product ID tidak valid' }, { status: 400 })
      }
    }

    // ===== EVERYTHING INSIDE TRANSACTION FOR ATOMICITY =====
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

    const order = await db.$transaction(async (tx) => {
      // Fetch products INSIDE the transaction for consistent reads
      const productIds = data.items.map(item => item.productId)
      const products = await tx.product.findMany({
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
        },
      })

      const productMap = new Map(products.map(p => [p.id, p]))

      // Calculate prices server-side
      const orderItems: { productId: string; quantity: number; size: string; price: number; productName: string; productImage: string }[] = []
      let totalAmount = 0
      const errors: string[] = []

      for (const item of data.items) {
        const product = productMap.get(item.productId)

        if (!product) {
          errors.push(`Produk tidak ditemukan atau sudah dihapus`)
          continue
        }

        // Check stock
        if (item.quantity > product.stock) {
          errors.push(`Stok ${product.name} tidak mencukupi (tersedia: ${product.stock})`)
          continue
        }

        // Use wholesale price if quantity meets min order, otherwise retail price
        const unitPrice = item.quantity >= product.minOrder ? product.wholesalePrice : product.price
        totalAmount += unitPrice * item.quantity

        // Extract first image from product's images field
        const firstImage = product.images ? product.images.split(',')[0].trim() : ''

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
        throw Object.assign(new Error(errors.join('. ')), { statusCode: 400 })
      }

      if (orderItems.length === 0) {
        throw Object.assign(new Error('Tidak ada item yang valid untuk dipesan'), { statusCode: 400 })
      }

      // Add shipping cost
      const shippingCost = data.shippingCost ?? 0
      totalAmount += shippingCost

      // Generate order number with crypto-safe random
      const { randomInt } = await import('crypto')
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayCount = await tx.order.count({ where: { createdAt: { gte: todayStart } } })

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

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          customerAddr: data.customerAddr,
          status: 'pending',
          paymentMethod: data.paymentMethod,
          paymentStatus: 'unpaid',
          totalAmount,
          shippingCost,
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

      // ===== DEDUCT STOCK & INCREMENT SOLD (atomic within transaction) =====
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

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)

    // Check if this is a controlled validation error with statusCode
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode
      return NextResponse.json({ error: error.message }, { status: statusCode })
    }

    // Generic error — never expose internal details
    return NextResponse.json({ error: 'Gagal membuat pesanan. Silakan coba lagi.' }, { status: 500 })
  }
}
