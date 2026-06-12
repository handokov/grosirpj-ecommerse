'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type Product } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp } from 'lucide-react';
import { formatRupiah, calculateDiscount } from '@/lib/format';
import ProductImage from '@/components/ui/product-image';

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
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <CardContent className="p-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const discount = calculateDiscount(product.price, product.wholesalePrice);
              const productUrl = `/${product.categorySlug}/${product.slug}`;
              return (
                <Link key={product.id} href={productUrl} prefetch={true}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <ProductImage src={product.images} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        {discount > 0 && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2">-{discount}%</Badge>
                        )}
                        {product.featured && (
                          <Badge className="absolute top-2 right-2 bg-amber-500 text-gray-900 text-xs px-2">
                            <Star className="h-3 w-3 fill-current mr-0.5" />TOP
                          </Badge>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-emerald-900 transition-colors">
                          {product.name}
                        </h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-sm font-bold text-emerald-900">{formatRupiah(product.wholesalePrice)}</span>
                        {discount > 0 && <span className="text-xs text-muted-foreground line-through">{formatRupiah(product.price)}</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{product.rating}</span>
                        <span>Min. {product.minOrder} pcs</span>
                        <span>{product.sold > 999 ? `${(product.sold / 1000).toFixed(1)}rb` : product.sold} terjual</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              );
            })}
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
