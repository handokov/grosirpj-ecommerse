import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'
import { validateBody, updateProductSchema } from '@/lib/validations'
import { requireAdmin, isAdminError } from '@/lib/auth-guard'

// GET - Single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: { category: { select: { name: true, slug: true } } },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const { id } = await params
    const data = await validateBody(request, updateProductSchema)
    if (data instanceof NextResponse) return data

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) {
      updateData.name = data.name
      updateData.slug = generateSlug(data.name)
    }
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = data.price
    if (data.wholesalePrice !== undefined) updateData.wholesalePrice = data.wholesalePrice
    if (data.minOrder !== undefined) updateData.minOrder = data.minOrder
    if (data.stock !== undefined) updateData.stock = data.stock
    if (data.images !== undefined) updateData.images = data.images
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.featured !== undefined) updateData.featured = data.featured
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.weight !== undefined) updateData.weight = data.weight
    if (data.sizes !== undefined) updateData.sizes = data.sizes
    if (data.supplierName !== undefined) updateData.supplierName = data.supplierName || null
    if (data.supplierLink !== undefined) updateData.supplierLink = data.supplierLink || null
    if (data.supplierPhone !== undefined) updateData.supplierPhone = data.supplierPhone || null

    // Check slug uniqueness if name changed
    if (updateData.slug) {
      const existing = await db.product.findFirst({
        where: { slug: updateData.slug as string, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Nama produk sudah digunakan, gunakan nama berbeda' },
          { status: 409 }
        )
      }
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: { category: { select: { name: true } } },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE - Soft delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const { id } = await params

    // Wrap cart item delete + product soft-delete in a transaction
    await db.$transaction(async (tx) => {
      // Remove cart items referencing this product
      await tx.cartItem.deleteMany({ where: { productId: id } })

      // Soft delete: set deletedAt timestamp instead of hard deleting
      // This preserves order history (OrderItems stay intact)
      await tx.product.update({
        where: { id },
        data: { deletedAt: new Date(), stock: 0, featured: false },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
