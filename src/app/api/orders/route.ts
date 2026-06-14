import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Create order from public checkout (generates invoice)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customerName, customerPhone, customerEmail, customerAddr, note } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items required' }, { status: 400 })
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: 'Customer name and phone required' }, { status: 400 })
    }

    // Generate order number: GPJ-YYYYMMDD-XXXXX
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const orderCount = await db.order.count()
    const seq = String(orderCount + 1).padStart(4, '0')
    const orderNumber = `GPJ-${dateStr}-${seq}`

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        customerAddr: customerAddr || '',
        status: 'pending',
        paymentMethod: 'transfer',
        paymentStatus: 'unpaid',
        totalAmount,
        shippingCost: parseFloat(body.shippingCost) || 0,
        note: note || '',
        items: {
          create: items.map((item: { productId: string; quantity: number; size?: string; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size || '',
            price: item.price,
          })),
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

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
