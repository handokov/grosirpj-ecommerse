import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const featured = searchParams.get('featured')

    const where: Record<string, unknown> = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { tags: { contains: search } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (featured !== null && featured !== '') where.featured = featured === 'true'

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 0 })
  }
}

// POST - Create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const product = await db.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || '',
        price: parseFloat(body.price),
        wholesalePrice: parseFloat(body.wholesalePrice),
        minOrder: parseInt(body.minOrder) || 1,
        stock: parseInt(body.stock),
        images: body.images || '',
        categoryId: body.categoryId,
        rating: 0,
        reviewCount: 0,
        sold: 0,
        featured: body.featured || false,
        tags: body.tags || '',
        weight: body.weight || '',
        sizes: body.sizes || '',
        supplierName: body.supplierName || null,
        supplierLink: body.supplierLink || null,
        supplierPhone: body.supplierPhone || null,
      },
      include: { category: { select: { name: true } } },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
