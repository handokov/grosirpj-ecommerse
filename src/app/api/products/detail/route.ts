import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { slug },
      include: { category: { select: { name: true, slug: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Strip supplier data from buyer-facing API
    const { supplierName, supplierLink, supplierPhone, category, ...publicData } = product;

    return NextResponse.json({
      ...publicData,
      categoryName: category.name,
      categorySlug: category.slug,
    });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
