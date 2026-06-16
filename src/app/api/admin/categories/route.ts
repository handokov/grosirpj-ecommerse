import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'
import { validateBody, createCategorySchema } from '@/lib/validations'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

// GET - List categories
export async function GET() {
  try {
    const session = await requireAdmin()

    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Categories API error:')
    return NextResponse.json({ categories: [] })
  }
}

// POST - Create category
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const data = await validateBody(request, createCategorySchema)
    if (data instanceof NextResponse) return data

    const slug = generateSlug(data.name)

    // Check slug uniqueness
    const existing = await db.category.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Nama kategori sudah digunakan' },
        { status: 409 }
      )
    }

    const category = await db.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        image: data.image,
        order: data.order,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Create category error:')
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
