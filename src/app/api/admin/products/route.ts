import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'
import { validateBody, createProductSchema } from '@/lib/validations'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

// GET - List products with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
    const search = (searchParams.get('search') || '').slice(0, 200)
    const categoryId = searchParams.get('categoryId') || ''
    const featured = searchParams.get('featured')
    const showDeleted = searchParams.get('showDeleted') === 'true'

    const where: Record<string, unknown> = {}
    
    // By default, exclude soft-deleted products (unless explicitly requested)
    if (!showDeleted) where.deletedAt = null
    
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
    if (isAuthError(error)) return error.toResponse()
    console.error('Products API error:')
    return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 0 })
  }
}

// POST - Create product
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const data = await validateBody(request, createProductSchema)
    if (data instanceof NextResponse) return data

    // Generate slug from name
    const slug = generateSlug(data.name)

    // Check slug uniqueness
    const existing = await db.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Nama produk sudah digunakan, gunakan nama berbeda' },
        { status: 409 }
      )
    }

    const product = await db.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        wholesalePrice: data.wholesalePrice,
        minOrder: data.minOrder,
        stock: data.stock,
        images: data.images,
        categoryId: data.categoryId,
        rating: 0,
        reviewCount: 0,
        sold: 0,
        featured: data.featured,
        tags: data.tags,
        weight: data.weight,
        sizes: data.sizes,
        colors: data.colors,
        variantName: data.variantName,
        variants: data.variants,
        supplierName: data.supplierName,
        supplierLink: data.supplierLink,
        supplierPhone: data.supplierPhone,
      },
      include: { category: { select: { name: true } } },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
