import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Lookup order by orderNumber (for invoice)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json({ error: 'Failed to lookup order' }, { status: 500 })
  }
}
