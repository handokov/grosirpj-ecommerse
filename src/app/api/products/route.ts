import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const revalidate = 300;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const categorySlug = searchParams.get('categorySlug');
    const featured = searchParams.get('featured');
    const search = (searchParams.get('q') || '').slice(0, 200);
    const sort = searchParams.get('sort') || 'popular';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: Record<string, unknown> = { deletedAt: null };

    if (category) {
      where.categoryId = category;
    } else if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.wholesalePrice = {};
      const minPriceVal = minPrice ? parseInt(minPrice) : NaN;
      const maxPriceVal = maxPrice ? parseInt(maxPrice) : NaN;
      if (minPrice && !isNaN(minPriceVal)) (where.wholesalePrice as Record<string, number>).gte = minPriceVal;
      if (maxPrice && !isNaN(maxPriceVal)) (where.wholesalePrice as Record<string, number>).lte = maxPriceVal;
    }

    let orderBy: Record<string, string> = {};
    switch (sort) {
      case 'price-low':
        orderBy = { wholesalePrice: 'asc' };
        break;
      case 'price-high':
        orderBy = { wholesalePrice: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'popular':
      default:
        orderBy = { sold: 'desc' };
        break;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map(({ supplierName, supplierLink, supplierPhone, ...p }) => ({
        ...p,
        categoryName: p.category.name,
        categorySlug: p.category.slug,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty data instead of 500 to prevent frontend crash
    return NextResponse.json({
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  }
}
