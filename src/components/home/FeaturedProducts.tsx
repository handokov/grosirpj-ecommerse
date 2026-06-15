'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type Product } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { ProductCard, ProductCardSkeletonGrid } from '@/components/shared/ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/products?featured=true&limit=8')
      .then((r) => r.json())
      .then((data) => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-800" />
              <span className="text-sm font-semibold text-emerald-800 uppercase">Best Seller</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Pilihan Terlaris</h2>
          </div>
          <Link href="/cari" className="hidden sm:block">
            <Button variant="outline" className="border-emerald-200 text-emerald-900 hover:bg-emerald-50">
              Lihat Semua
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <ProductCardSkeletonGrid count={8} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-6 sm:hidden">
          <Link href="/cari">
            <Button variant="outline" className="border-emerald-200 text-emerald-900 hover:bg-emerald-50">
              Lihat Semua Produk
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
