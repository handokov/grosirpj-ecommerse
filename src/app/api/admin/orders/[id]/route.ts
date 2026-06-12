import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, price: true } },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PUT - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod
    if (body.note !== undefined) updateData.note = body.note
    if (body.customerName !== undefined) updateData.customerName = body.customerName
    if (body.customerPhone !== undefined) updateData.customerPhone = body.customerPhone
    if (body.customerAddr !== undefined) updateData.customerAddr = body.customerAddr

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true } },
          },
        },
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.orderItem.deleteMany({ where: { orderId: id } })
    await db.order.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
