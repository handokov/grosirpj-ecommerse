import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBody, updateOrderSchema, isCuid } from '@/lib/validations'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

// Valid order status transitions — enforced server-side to prevent invalid state
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed', 'cancelled'],
  completed: [], // Terminal state — no transitions allowed
  cancelled: [], // Terminal state — no transitions allowed
}

// GET - Single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()

    const { id } = await params

    // Validate ID format
    if (!isCuid(id)) {
      return NextResponse.json({ error: 'ID order tidak valid' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data order' }, { status: 500 })
  }
}

// PUT - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()

    const { id } = await params

    // Validate ID format
    if (!isCuid(id)) {
      return NextResponse.json({ error: 'ID order tidak valid' }, { status: 400 })
    }

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

    // When status changes, validate the transition
    if (data.status !== undefined) {
      const existingOrder = await db.order.findUnique({
        where: { id },
        select: { status: true, deletedAt: true },
      })

      if (!existingOrder || existingOrder.deletedAt) {
        return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
      }

      // Validate status transition
      const allowedNextStatuses = VALID_TRANSITIONS[existingOrder.status]
      if (!allowedNextStatuses || !allowedNextStatuses.includes(data.status)) {
        return NextResponse.json(
          { error: `Transisi status dari "${existingOrder.status}" ke "${data.status}" tidak valid. Status yang diizinkan: ${allowedNextStatuses.length > 0 ? allowedNextStatuses.join(', ') : 'tidak ada (status final)'}` },
          { status: 400 }
        )
      }
    }

    // When status changes to 'cancelled', restore stock in a transaction
    if (data.status === 'cancelled') {
      const order = await db.$transaction(async (tx) => {
        // Fetch the current order to check old status
        const existingOrder = await tx.order.findUnique({
          where: { id },
          include: { items: { include: { product: { select: { deletedAt: true } } } } },
        })

        if (!existingOrder || existingOrder.deletedAt) {
          throw Object.assign(new Error('Order tidak ditemukan'), { statusCode: 404 })
        }

        // Prevent double-cancellation race condition
        if (existingOrder.status === 'cancelled') {
          throw Object.assign(new Error('Order sudah dibatalkan'), { statusCode: 400 })
        }

        // Validate transition server-side (redundant with earlier check, but safe inside tx)
        const allowedNextStatuses = VALID_TRANSITIONS[existingOrder.status]
        if (!allowedNextStatuses || !allowedNextStatuses.includes('cancelled')) {
          throw Object.assign(
            new Error(`Order dengan status "${existingOrder.status}" tidak dapat dibatalkan`),
            { statusCode: 400 }
          )
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
    if (isAuthError(error)) return error.toResponse()
    console.error('Update order error:', error)

    // Check if this is a controlled validation error with statusCode
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode
      return NextResponse.json({ error: error.message }, { status: statusCode })
    }

    return NextResponse.json({ error: 'Gagal mengupdate order' }, { status: 500 })
  }
}

// DELETE - Soft delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()

    const { id } = await params

    // Validate ID format
    if (!isCuid(id)) {
      return NextResponse.json({ error: 'ID order tidak valid' }, { status: 400 })
    }

    await db.$transaction(async (tx) => {
      // Check order exists
      const order = await tx.order.findUnique({ where: { id } })
      if (!order || order.deletedAt) {
        throw Object.assign(new Error('Order tidak ditemukan'), { statusCode: 404 })
      }

      // Soft delete: set deletedAt instead of hard deleting
      await tx.order.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Delete order error:', error)

    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode
      return NextResponse.json({ error: error.message }, { status: statusCode })
    }

    return NextResponse.json({ error: 'Gagal menghapus order' }, { status: 500 })
  }
}
