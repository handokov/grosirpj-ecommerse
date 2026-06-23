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

    // Validate order number format (GPJ-YYYYMMDD-XXXXXXXX)
    // Suffix is seq (4+ digits) + rand (4+ digits), so total 8+ digits.
    // Use \d{4,} to accept any suffix length >= 4 (future-proof for high-volume days).
    if (!/^GPJ-\d{8}-\d{4,}[A-Z]?$/.test(orderNumber)) {
      return NextResponse.json({ error: 'Nomor order tidak valid' }, { status: 400 })
    }

    const order = await db.order.findFirst({
      where: { orderNumber, deletedAt: null },
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
      paymentProof: order.paymentProof,
      paymentNotes: order.paymentNotes,
      totalAmount: order.totalAmount,
      shippingCost: order.shippingCost,
      courier: order.courier,
      courierService: order.courierService,
      destinationCity: order.destinationCity,
      note: order.note,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        variant: item.variant,
        price: item.price,
        productName: item.productName,
        productImage: item.productImage,
        product: item.product ? { name: item.product.name, images: item.product.images } : { name: item.productName, images: item.productImage },
      })),
    }

    return NextResponse.json({ order: safeOrder })
  } catch (error) {
    console.error('Order lookup error:')
    return NextResponse.json({ error: 'Failed to lookup order' }, { status: 500 })
  }
}
