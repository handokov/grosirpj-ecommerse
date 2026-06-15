import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBody, createOrderSchema } from '@/lib/validations'
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
    return NextResponse.json({ orders: [], total: 0, page: 1, totalPages: 0 })
  }
}

// POST - Create order (admin)
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const data = await validateBody(request, createOrderSchema)
    if (data instanceof NextResponse) return data

    // ===== SERVER-SIDE PRICE CALCULATION =====
    // Fetch products from DB — don't trust client prices
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
        errors.push(`Produk ${item.productId} tidak ditemukan`)
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
      return NextResponse.json({ error: errors.join('. ') }, { status: 400 })
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'Tidak ada item yang valid untuk dipesan' }, { status: 400 })
    }

    // Add shipping cost
    totalAmount += data.shippingCost ?? 0

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
          paymentMethod: data.paymentMethod,
          paymentStatus: 'unpaid',
          totalAmount,
          shippingCost: data.shippingCost ?? 0,
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

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
