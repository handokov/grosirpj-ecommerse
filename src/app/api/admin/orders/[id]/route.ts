import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBody, updateOrderSchema } from '@/lib/validations'
import { requireAdmin, isAdminError } from '@/lib/auth-guard'

// GET - Single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

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

    if (!order || order.deletedAt) {
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
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const { id } = await params
    const data = await validateBody(request, updateOrderSchema)
    if (data instanceof NextResponse) return data

    // Build update data with proper types
    const updateData: {
      status?: string
      paymentStatus?: string
      paymentMethod?: string
      note?: string
      customerName?: string
      customerPhone?: string
      customerAddr?: string
    } = {}
    if (data.status !== undefined) updateData.status = data.status
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod
    if (data.note !== undefined) updateData.note = data.note
    if (data.customerName !== undefined) updateData.customerName = data.customerName
    if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone
    if (data.customerAddr !== undefined) updateData.customerAddr = data.customerAddr

    // When status changes to 'cancelled', restore stock in a transaction
    if (data.status === 'cancelled') {
      const order = await db.$transaction(async (tx) => {
        // Fetch the current order to check old status
        const existingOrder = await tx.order.findUnique({
          where: { id },
          include: { items: { include: { product: { select: { deletedAt: true } } } } },
        })

        if (!existingOrder || existingOrder.deletedAt) {
          throw new Error('Order not found')
        }

        // Prevent double-cancellation race condition
        if (existingOrder.status === 'cancelled') {
          throw new Error('Order sudah dibatalkan')
        }

        // Prevent cancelling completed orders (already shipped/received)
        if (existingOrder.status === 'completed') {
          throw new Error('Order yang sudah selesai tidak dapat dibatalkan')
        }

        // If old status is NOT cancelled and new status IS cancelled, restore stock
        // Only restore stock for products that are NOT soft-deleted
        for (const item of existingOrder.items) {
          // Skip soft-deleted products (they already have stock: 0 from soft-delete)
          if (item.product?.deletedAt) continue

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              sold: { decrement: item.quantity },
            },
          })
        }

        const updated = await tx.order.update({
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

        return updated
      })

      return NextResponse.json({ order })
    }

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
    const message = error instanceof Error ? error.message : 'Failed to update order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - Soft delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const { id } = await params

    await db.$transaction(async (tx) => {
      // Soft delete: set deletedAt instead of hard deleting
      await tx.order.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
