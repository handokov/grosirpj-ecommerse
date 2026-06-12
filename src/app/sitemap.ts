import { db } from '@/lib/db';
import type { MetadataRoute } from 'next';

// Make this route dynamic so it doesn't try to build at deploy time
export const dynamic = 'force-dynamic';

const BASE_URL = 'https://grosirpj.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [categories, products] = await Promise.all([
      db.category.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { order: 'asc' },
      }),
      db.product.findMany({
        select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${BASE_URL}/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const productEntries: MetadataRoute.Sitemap = products.map((prod) => ({
      url: `${BASE_URL}/${prod.category.slug}/${prod.slug}`,
      lastModified: prod.updatedAt,
      changeFrequency: 'daily',
      priority: 0.6,
    }));

    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${BASE_URL}/cari`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      ...categoryEntries,
      ...productEntries,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${BASE_URL}/cari`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
    ];
  }
}
