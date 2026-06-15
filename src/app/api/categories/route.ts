import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isValidSlug } from '@/lib/validations';

export const revalidate = 300;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Validate slug format to prevent injection
      if (!isValidSlug(slug)) {
        return NextResponse.json({ error: 'Format slug tidak valid' }, { status: 400 });
      }

      const category = await db.category.findUnique({
        where: { slug },
        include: {
          _count: {
            select: { products: { where: { deletedAt: null } } },
          },
        },
      });

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      return NextResponse.json({
        ...category,
        productCount: category._count.products,
      });
    }

    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
    });

    return NextResponse.json(
      categories.map((c) => ({
        ...c,
        productCount: c._count.products,
      }))
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array instead of 500 to prevent frontend crash
    return NextResponse.json([]);
  }
}
