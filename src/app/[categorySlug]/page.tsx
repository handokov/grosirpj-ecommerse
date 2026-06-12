import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CategoryPageClient from './CategoryPageClient';

interface Props {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await db.category.findUnique({ where: { slug: categorySlug } });

  if (!category) {
    return { title: 'Kategori Tidak Ditemukan - GrosirPJ' };
  }

  return {
    title: `${category.name} - GrosirPJ | Grosir Baju Anak & Remaja`,
    description: category.description || `Beli grosir ${category.name.toLowerCase()} berkualitas dengan harga termurah di GrosirPJ. Fashion bayi, balita, anak-anak, dan remaja. Gratis ongkir & garansi 100%.`,
    openGraph: {
      title: `${category.name} - GrosirPJ`,
      description: category.description || `Grosir ${category.name.toLowerCase()} berkualitas dengan harga termurah. Belanja sekarang!`,
      url: `https://grosirpj.com/${categorySlug}`,
      siteName: 'GrosirPJ',
      type: 'website',
      locale: 'id_ID',
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
    },
    alternates: {
      canonical: `https://grosirpj.com/${categorySlug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug } = await params;
  const { q } = await searchParams;

  const category = await db.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    notFound();
  }

  // Fetch initial products for this category
  const products = await db.product.findMany({
    where: {
      categoryId: category.id,
      ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }, { tags: { contains: q } }] } : {}),
    },
    include: {
      category: { select: { name: true, slug: true } },
    },
    orderBy: { sold: 'desc' },
    take: 20,
  });

  const total = await db.product.count({
    where: {
      categoryId: category.id,
      ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }, { tags: { contains: q } }] } : {}),
    },
  });

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
