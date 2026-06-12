import type { Metadata } from 'next';
import SearchPageClient from './SearchPageClient';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Hasil pencarian "${q}" - GrosirPJ` : 'Cari Produk - GrosirPJ',
    description: `Cari produk grosir baju anak dan baby kids di GrosirPJ${q ? ` untuk "${q}"` : ''}. Harga grosir termurah, kualitas terbaik.`,
    openGraph: {
      title: q ? `Hasil pencarian "${q}" - GrosirPJ` : 'Cari Produk - GrosirPJ',
      description: `Cari produk grosir baju anak dan baby kids${q ? ` untuk "${q}"` : ''}.`,
      url: `https://grosirpj.com/cari${q ? `?q=${encodeURIComponent(q)}` : ''}`,
      siteName: 'GrosirPJ',
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
