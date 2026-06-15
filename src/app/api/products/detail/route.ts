import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const revalidate = 300;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug || slug.length > 200 || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug is required and must be valid' }, { status: 400 });
    }

    // Use findFirst with deletedAt: null instead of findUnique + JS check
    const product = await db.product.findFirst({
      where: { slug, deletedAt: null },
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
