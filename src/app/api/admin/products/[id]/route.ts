import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deleteImage } from '@/lib/cloudinary'

// GET - Single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) {
      updateData.name = body.name
      updateData.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.wholesalePrice !== undefined) updateData.wholesalePrice = parseFloat(body.wholesalePrice)
    if (body.minOrder !== undefined) updateData.minOrder = parseInt(body.minOrder)
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock)
    if (body.images !== undefined) updateData.images = body.images
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.weight !== undefined) updateData.weight = body.weight
    if (body.sizes !== undefined) updateData.sizes = body.sizes

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

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete related cart items first
    await db.cartItem.deleteMany({ where: { productId: id } })
    await db.orderItem.deleteMany({ where: { productId: id } })

    const product = await db.product.delete({ where: { id } })

    // Try to delete Cloudinary images
    if (product.images) {
      try {
        const publicIds = product.images.split(',').map(img => {
          const match = img.match(/grosirpj\/[^.]+/)
          return match ? match[0] : null
        }).filter(Boolean) as string[]

        for (const publicId of publicIds) {
          await deleteImage(publicId)
        }
      } catch {
        // Image deletion failure shouldn't block product deletion
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
