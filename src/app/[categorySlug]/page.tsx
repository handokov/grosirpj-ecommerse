import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/store-config';
import CategoryPageClient from './CategoryPageClient';
import { cache } from 'react';

// Revalidate every 5 minutes instead of force-dynamic
export const revalidate = 300;

// Deduplicate category queries between generateMetadata and page component
const getCategory = cache(async (slug: string) => {
  return db.category.findUnique({ where: { slug: slug } });
});

interface Props {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;

  try {
    const category = await getCategory(categorySlug);

    if (!category) {
      return { title: `Kategori Tidak Ditemukan - ${STORE_NAME}` };
    }

    return {
      title: `${category.name} - ${STORE_NAME} | Grosir Baju Anak & Baby Kids`,
      description: category.description || `Beli grosir ${category.name.toLowerCase()} berkualitas dengan harga termurah di ${STORE_NAME}. Fashion bayi, balita, dan anak-anak. COD Jakarta & garansi 100%.`,
      openGraph: {
        title: `${category.name} - ${STORE_NAME}`,
        description: category.description || `Grosir ${category.name.toLowerCase()} berkualitas dengan harga termurah. Belanja sekarang!`,
        url: `https://grosirpj.com/${categorySlug}`,
        siteName: STORE_NAME,
        type: 'website',
        locale: 'id_ID',
        images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
      },
      alternates: {
        canonical: `https://grosirpj.com/${categorySlug}`,
      },
    };
  } catch {
    return { title: `${STORE_NAME} - Grosir Baju Anak & Baby Kids` };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug } = await params;
  const { q, page: pageParam, sort } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || '1') || 1);
  const sortField = sort || 'popular';

  const category = await getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  // Build orderBy based on sort
  let orderBy: Record<string, string> = { sold: 'desc' };
  switch (sortField) {
    case 'newest': orderBy = { createdAt: 'desc' }; break;
    case 'price-low': orderBy = { wholesalePrice: 'asc' }; break;
    case 'price-high': orderBy = { wholesalePrice: 'desc' }; break;
    case 'rating': orderBy = { rating: 'desc' }; break;
  }

  const skip = (page - 1) * 20;

  // Fetch initial products for this category
  const [products, total] = await Promise.all([
    db.product.findMany({
      where: {
        categoryId: category.id,
        deletedAt: null,
        ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }, { tags: { contains: q } }] } : {}),
      },
      include: {
        category: { select: { name: true, slug: true } },
      },
      orderBy,
      skip,
      take: 20,
    }),
    db.product.count({
      where: {
        categoryId: category.id,
        deletedAt: null,
        ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }, { tags: { contains: q } }] } : {}),
      },
    }),
  ]);

  const serializedProducts = products.map((p) => ({
    ...p,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
  }));

  return (
    <CategoryPageClient
      category={JSON.parse(JSON.stringify(category))}
      initialProducts={serializedProducts}
      initialTotal={total}
      searchQuery={q || ''}
    />
  );
}
