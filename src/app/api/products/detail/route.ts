import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!id && !slug) {
      return NextResponse.json({ error: 'Product ID or slug required' }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: id ? { id } : { slug: slug! },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const related = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      orderBy: { sold: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({
      product: {
        ...product,
        categoryName: product.category.name,
        categorySlug: product.category.slug,
      },
      related: related.map((p) => ({
        ...p,
        categoryName: p.category.name,
        categorySlug: p.category.slug,
      })),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
