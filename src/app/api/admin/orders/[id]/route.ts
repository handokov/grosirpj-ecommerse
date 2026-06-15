import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-guard'
import { updateOrderSchema } from '@/lib/validations'

// GET - Single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const { id } = await params
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, price: true, supplierName: true, supplierLink: true, supplierPhone: true } },
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
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const result = updateOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) },
        { status: 400 }
      )
    }
    const data = result.data

    const updateData: Record<string, unknown> = {}
    if (data.status !== undefined) updateData.status = data.status
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod
    if (data.note !== undefined) updateData.note = data.note
    if (data.customerName !== undefined) updateData.customerName = data.customerName
    if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone
    if (data.customerAddr !== undefined) updateData.customerAddr = data.customerAddr

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, supplierName: true, supplierLink: true, supplierPhone: true } },
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
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

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
