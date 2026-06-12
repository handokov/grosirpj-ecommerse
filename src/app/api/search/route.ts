import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Dynamic import to ensure db is only loaded server-side
    const { db } = await import('@/lib/db');

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { tags: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        wholesalePrice: true,
        images: true,
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 8,
      orderBy: { sold: 'desc' },
    });

    return NextResponse.json({
      suggestions: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        wholesalePrice: p.wholesalePrice,
        images: p.images,
        categoryName: p.category.name,
        categorySlug: p.category.slug,
      })),
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ suggestions: [], error: 'Search failed' }, { status: 500 });
  }
}
