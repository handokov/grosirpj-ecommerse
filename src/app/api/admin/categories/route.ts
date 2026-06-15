import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-guard'
import { createCategorySchema } from '@/lib/validations'

// GET - List categories
export async function GET() {
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({ categories: [] })
  }
}

// POST - Create category
export async function POST(request: NextRequest) {
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const body = await request.json()
    
    // Validate input
    const result = createCategorySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) },
        { status: 400 }
      )
    }
    const data = result.data

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

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
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
