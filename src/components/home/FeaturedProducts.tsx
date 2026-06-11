'use client';

import { useEffect, useState } from 'react';
import { useStore, type Product } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Eye, TrendingUp } from 'lucide-react';
import { formatRupiah, calculateDiscount } from '@/lib/format';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { viewProduct, addToCart, viewCategory } = useStore();

  useEffect(() => {
    fetch('/api/products?featured=true&limit=8')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600 uppercase">Produk Unggulan</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Pilihan Terbaik Minggu Ini
            </h2>
          </div>
          <Button
            variant="outline"
            className="hidden sm:flex border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => viewCategory(null!)}
          >
            Lihat Semua
          </Button>
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
              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={product.images}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {discount > 0 && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2">
                          -{discount}%
                        </Badge>
                      )}
                      {product.featured && (
                        <Badge className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-xs px-2">
                          <Star className="h-3 w-3 fill-current mr-0.5" />
                          TOP
                        </Badge>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white text-gray-900 hover:bg-emerald-600 hover:text-white shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, product.minOrder);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white text-gray-900 hover:bg-emerald-600 hover:text-white shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewProduct(product);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                      <h3
                        className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-emerald-700 transition-colors"
                        onClick={() => viewProduct(product)}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-sm font-bold text-emerald-700">
                          {formatRupiah(product.wholesalePrice)}
                        </span>
                        {discount > 0 && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatRupiah(product.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          {product.rating}
                        </span>
                        <span>Min. {product.minOrder} pcs</span>
                        <span>{product.sold > 999 ? `${(product.sold / 1000).toFixed(1)}rb` : product.sold} terjual</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-6 sm:hidden">
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => viewCategory(null!)}
          >
            Lihat Semua Produk
          </Button>
        </div>
      </div>
    </section>
  );
}
