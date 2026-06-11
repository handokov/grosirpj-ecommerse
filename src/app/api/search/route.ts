import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
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
          select: { name: true },
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
        price: p.wholesalePrice,
        image: p.images,
        category: p.category.name,
      })),
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
