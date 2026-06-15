import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Lookup order by orderNumber (for invoice)
// This is a public endpoint but rate-limited via middleware.
// Only returns safe order data — no internal IDs or admin info.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params

    // Validate order number format (GPJ-YYYYMMDD-XXXX)
    if (!/^GPJ-\d{8}-\d{4}$/.test(orderNumber)) {
      return NextResponse.json({ error: 'Nomor order tidak valid' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true } },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    // Return only safe, buyer-relevant data
    const safeOrder = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddr: order.customerAddr,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      shippingCost: order.shippingCost,
      courier: order.courier,
      courierService: order.courierService,
      destinationCity: order.destinationCity,
      note: order.note,
      createdAt: order.createdAt,
      items: order.items.map(({ product, ...item }) => ({
        quantity: item.quantity,
        size: item.size,
        price: item.price,
        product: { name: product.name, images: product.images },
      })),
    }

    return NextResponse.json({ order: safeOrder })
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json({ error: 'Failed to lookup order' }, { status: 500 })
  }
}
