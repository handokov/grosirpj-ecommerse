import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicCreateOrderSchema } from '@/lib/validations'

// POST - Create order from public checkout (generates invoice)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod (NO price from client!)
    const result = publicCreateOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) },
        { status: 400 }
      )
    }
    const data = result.data

    // ===== SERVER-SIDE PRICE CALCULATION =====
    // Fetch all products from the database to get real prices
    // This prevents price manipulation from the client
    const productIds = data.items.map(item => item.productId)
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        stock: { gt: 0 }, // Only in-stock products
        deletedAt: null,   // Exclude soft-deleted products
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

    // Build a lookup map
    const productMap = new Map(products.map(p => [p.id, p]))

    // Validate each item and calculate prices server-side
    const orderItems: { productId: string; quantity: number; size: string; price: number; productName: string; productImage: string }[] = []
    let totalAmount = 0
    const errors: string[] = []

    for (const item of data.items) {
      const product = productMap.get(item.productId)

      if (!product) {
        errors.push(`Produk ${item.productId} tidak ditemukan atau stok habis`)
        continue
      }

      // Check min order
      if (item.quantity < product.minOrder) {
        errors.push(`Minimal order untuk ${product.name} adalah ${product.minOrder}`)
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

      // Extract first image from product's images field (comma-separated or single URL)
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
      return NextResponse.json({ error: errors.join('. ') }, { status: 400 })
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'Tidak ada item yang valid untuk dipesan' }, { status: 400 })
    }

    // Add shipping cost
    totalAmount += data.shippingCost

    // Generate order number INSIDE transaction for atomicity
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

    const order = await db.$transaction(async (tx) => {
      // Count today's orders INSIDE the transaction to prevent race conditions
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayCount = await tx.order.count({ where: { createdAt: { gte: todayStart } } })

      // Generate unique order number with retry on collision
      let orderNumber = ''
      let attempts = 0
      do {
        const seq = String(todayCount + 1 + attempts).padStart(4, '0')
        const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
        orderNumber = `GPJ-${dateStr}-${seq}${rand}`
        attempts++
      } while (await tx.order.findUnique({ where: { orderNumber } }))

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
          shippingCost: data.shippingCost,
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

      // ===== DEDUCT STOCK & INCREMENT SOLD (atomic within transaction) =====
      for (const item of orderItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        })
        if (updated.count === 0) {
          const prod = productMap.get(item.productId)
          throw new Error(`Stok tidak cukup untuk produk ${prod?.name || item.productId}`)
        }
      }

      return newOrder
    })

    // Strip supplier info from response (buyer-facing)
    const safeOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product ? { name: item.product.name, images: item.product.images } : { name: item.productName, images: item.productImage },
      })),
    }

    return NextResponse.json({ order: safeOrder }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
