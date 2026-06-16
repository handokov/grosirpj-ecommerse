import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'
import { validateBody, updateCategorySchema, isCuid } from '@/lib/validations'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

// GET - Single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()

    const { id } = await params
    if (!isCuid(id)) {
      return NextResponse.json({ error: 'ID kategori tidak valid' }, { status: 400 })
    }
    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Get category error:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()

    const { id } = await params
    if (!isCuid(id)) {
      return NextResponse.json({ error: 'ID kategori tidak valid' }, { status: 400 })
    }
    const data = await validateBody(request, updateCategorySchema)
    if (data instanceof NextResponse) return data

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) {
      updateData.name = data.name
      updateData.slug = generateSlug(data.name)
    }
    if (data.description !== undefined) updateData.description = data.description
    if (data.icon !== undefined) updateData.icon = data.icon
    if (data.image !== undefined) updateData.image = data.image
    if (data.order !== undefined) updateData.order = data.order

    // Check slug uniqueness if name changed
    if (updateData.slug) {
      const existing = await db.category.findFirst({
        where: { slug: updateData.slug as string, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Nama kategori sudah digunakan' },
          { status: 409 }
        )
      }
    }

    const category = await db.category.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ category })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()

    const { id } = await params
    if (!isCuid(id)) {
      return NextResponse.json({ error: 'ID kategori tidak valid' }, { status: 400 })
    }

    // Wrap count check + delete in a transaction for atomicity
    await db.$transaction(async (tx) => {
      // Check if category has products
      const productCount = await tx.product.count({ where: { categoryId: id, deletedAt: null } })
      if (productCount > 0) {
        throw new Error(`Kategori ini masih memiliki ${productCount} produk. Pindahkan atau hapus produk terlebih dahulu.`)
      }

      await tx.category.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Delete category error:', error)
    if (error instanceof Error && error.message.includes('Kategori ini masih memiliki')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
