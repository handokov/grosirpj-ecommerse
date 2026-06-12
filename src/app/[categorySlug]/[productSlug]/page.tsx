import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

// Force dynamic rendering - don't try to statically generate
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;

  try {
    const product = await db.product.findUnique({
      where: { slug: productSlug },
      include: { category: true },
    });

    if (!product) {
      return { title: 'Produk Tidak Ditemukan - GrosirPJ' };
    }

    return {
      title: `${product.name} - GrosirPJ | Grosir Baju Anak & Baby Kids`,
      description: product.description.slice(0, 160) || `Beli grosir ${product.name} berkualitas dengan harga termurah. Harga grosir mulai ${product.wholesalePrice}. Min. order ${product.minOrder} pcs.`,
      openGraph: {
        title: `${product.name} - GrosirPJ`,
        description: product.description.slice(0, 160) || `Grosir ${product.name} berkualitas. Belanja sekarang!`,
        url: `https://grosirpj.com/${product.category.slug}/${product.slug}`,
        siteName: 'GrosirPJ',
        type: 'website',
        locale: 'id_ID',
        images: product.images ? [{ url: product.images, alt: product.name }] : undefined,
      },
      alternates: {
        canonical: `https://grosirpj.com/${product.category.slug}/${product.slug}`,
      },
    };
  } catch {
    return { title: 'GrosirPJ - Grosir Baju Anak & Baby Kids' };
  }
}

export default async function ProductPage({ params }: Props) {
  const { productSlug } = await params;
  const product = await db.product.findUnique({
    where: { slug: productSlug },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products
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

  const serializedProduct = {
    ...product,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
  };

  const serializedRelated = related.map((p) => ({
    ...p,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
  }));

  // JSON-LD Product schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'GrosirPJ',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'IDR',
      lowPrice: product.wholesalePrice,
      highPrice: product.price,
      offerCount: 1,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={JSON.parse(JSON.stringify(serializedProduct))}
        related={JSON.parse(JSON.stringify(serializedRelated))}
      />
    </>
  );
}
