import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-guard'
import { createOrderSchema } from '@/lib/validations'

// GET - List orders with filters
export async function GET(request: NextRequest) {
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
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

// POST - Create order
export async function POST(request: NextRequest) {
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const body = await request.json()

    // Validate input
    const result = createOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) },
        { status: 400 }
      )
    }
    const data = result.data

    // Generate order number
    const orderCount = await db.order.count()
    const orderNumber = `GPJ-${String(orderCount + 1).padStart(6, '0')}`

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerAddr: data.customerAddr,
        status: 'pending',
        paymentMethod: data.paymentMethod,
        paymentStatus: 'unpaid',
        totalAmount: data.totalAmount,
        note: data.note,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
