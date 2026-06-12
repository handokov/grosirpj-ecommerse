import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List categories
export async function GET() {
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
  try {
    const body = await request.json()
    
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const category = await db.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description || '',
        icon: body.icon || '',
        image: body.image || '',
        order: body.order || 0,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
