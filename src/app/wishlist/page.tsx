import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/store-config';
import WishlistClient from './WishlistClient';

export const metadata: Metadata = {
  title: `Favorit Saya - ${STORE_NAME}`,
  description: `Lihat produk favorit yang Anda simpan di ${STORE_NAME}. Simpan produk yang Anda suka untuk dibeli nanti.`,
  openGraph: {
    title: `Favorit Saya - ${STORE_NAME}`,
    description: `Lihat produk favorit yang Anda simpan di ${STORE_NAME}.`,
    url: 'https://grosirpj.com/wishlist',
    siteName: STORE_NAME,
    type: 'website',
    locale: 'id_ID',
  },
  alternates: {
    canonical: 'https://grosirpj.com/wishlist',
  },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
