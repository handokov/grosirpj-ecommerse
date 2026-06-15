import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/store-config';
import SearchPageClient from './SearchPageClient';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Hasil pencarian "${q}" - ${STORE_NAME}` : `Cari Produk - ${STORE_NAME}`,
    description: `Cari produk grosir baju anak dan baby kids di ${STORE_NAME}${q ? ` untuk "${q}"` : ''}. Harga grosir termurah, kualitas terbaik.`,
    openGraph: {
      title: q ? `Hasil pencarian "${q}" - ${STORE_NAME}` : `Cari Produk - ${STORE_NAME}`,
      description: `Cari produk grosir baju anak dan baby kids${q ? ` untuk "${q}"` : ''}.`,
      url: `https://grosirpj.com/cari${q ? `?q=${encodeURIComponent(q)}` : ''}`,
      siteName: STORE_NAME,
      type: 'website',
      locale: 'id_ID',
    },
    alternates: {
      canonical: `https://grosirpj.com/cari${q ? `?q=${encodeURIComponent(q)}` : ''}`,
    },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  return <SearchPageClient initialQuery={q || ''} />;
}
