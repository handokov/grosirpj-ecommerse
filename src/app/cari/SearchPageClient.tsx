'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, type Product, type Category } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Star, ShoppingCart, Eye, Search, Grid3X3, List, Package } from 'lucide-react';
import { formatRupiah, calculateDiscount } from '@/lib/format';
import ProductImage from '@/components/ui/product-image';

interface Props {
  initialQuery: string;
}

export default function SearchPageClient({ initialQuery }: Props) {
  const { addToCart } = useStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popular');
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page: page.toString(), limit: '20' });
      if (localSearch) params.set('q', localSearch);
      if (filterCategory && filterCategory !== 'all') params.set('category', filterCategory);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [localSearch, filterCategory, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/cari?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-emerald-800 transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Pencarian</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {localSearch ? `Hasil pencarian "${localSearch}"` : 'Cari Produk'}
          </h1>
          <p className="text-muted-foreground text-sm">{totalProducts} produk ditemukan</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Cari baju anak, dress remaja..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="pl-10 rounded-xl" />
            </div>
            <Button type="submit" variant="default" className="rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950">Cari</Button>
          </form>
          <div className="flex gap-2">
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Urutkan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Terpopuler</SelectItem>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="price-low">Harga Terendah</SelectItem>
                <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                <SelectItem value="rating">Rating Tertinggi</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex border rounded-xl overflow-hidden">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className={`rounded-none ${viewMode === 'grid' ? 'bg-emerald-800 hover:bg-emerald-900' : ''}`} onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className={`rounded-none ${viewMode === 'list' ? 'bg-emerald-800 hover:bg-emerald-900' : ''}`} onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button variant={filterCategory === 'all' ? 'default' : 'outline'} size="sm" className={`rounded-full ${filterCategory === 'all' ? 'bg-gradient-to-r from-emerald-700 to-emerald-900' : ''}`} onClick={() => { setFilterCategory('all'); setPage(1); }}>Semua</Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={filterCategory === cat.id ? 'default' : 'outline'} size="sm" className={`rounded-full ${filterCategory === cat.id ? 'bg-gradient-to-r from-emerald-700 to-emerald-900' : ''}`} onClick={() => { setFilterCategory(cat.id); setPage(1); }}>{cat.name}</Button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden"><div className="aspect-square bg-gray-200 animate-pulse" /><CardContent className="p-3"><div className="h-4 bg-gray-200 rounded animate-pulse mb-2" /><div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" /></CardContent></Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">Produk Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-4">Coba ubah kata kunci atau filter pencarian</p>
            <Button variant="outline" className="rounded-xl" onClick={() => { setFilterCategory('all'); setLocalSearch(''); setPage(1); }}>Reset Filter</Button>
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
            {products.map((product) => {
              const discount = calculateDiscount(product.price, product.wholesalePrice);
              const productUrl = `/${product.categorySlug}/${product.slug}`;
              return (
                <Link key={product.id} href={productUrl}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-0">
                      <div className={`${viewMode === 'grid' ? 'aspect-square' : 'aspect-video'} relative overflow-hidden bg-gray-100`}>
                        <ProductImage src={product.images} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        {discount > 0 && <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2">-{discount}%</Badge>}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <Button size="icon" className="h-10 w-10 rounded-full bg-white text-gray-900 hover:bg-emerald-800 hover:text-white shadow-lg" onClick={(e) => { e.preventDefault(); addToCart(product, product.minOrder); }}><ShoppingCart className="h-4 w-4" /></Button>
                          <Button size="icon" className="h-10 w-10 rounded-full bg-white text-gray-900 hover:bg-emerald-800 hover:text-white shadow-lg"><Eye className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
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

        {totalProducts > 20 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" className="rounded-xl" disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
            <span className="text-sm text-muted-foreground">Hal {page} dari {Math.ceil(totalProducts / 20)}</span>
            <Button variant="outline" className="rounded-xl" disabled={page >= Math.ceil(totalProducts / 20)} onClick={() => setPage(page + 1)}>Selanjutnya</Button>
          </div>
        )}
      </div>
    </section>
  );
}
