'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { type Product, type Category } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, Grid3X3, List, Package } from 'lucide-react';
import { ProductCard, ProductCardSkeletonGrid } from '@/components/shared/ProductCard';

interface Props {
  category: Category;
  initialProducts: Product[];
  initialTotal: number;
  searchQuery: string;
}

function CategoryPageContent({ category, initialProducts, initialTotal, searchQuery: initialSearchQuery }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL params
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');
  const [totalProducts, setTotalProducts] = useState(initialTotal);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || initialSearchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page: page.toString(), limit: '20', categorySlug: category.slug });
      if (localSearch) params.set('q', localSearch);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [category.slug, sort, page, localSearch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Update URL when page/sort/search changes (without full navigation)
  const updateUrl = useCallback((newPage: number, newSort: string, newSearch?: string) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', newPage.toString());
    if (newSort && newSort !== 'popular') params.set('sort', newSort);
    if (newSearch) params.set('q', newSearch);
    const queryString = params.toString();
    const url = `/${category.slug}${queryString ? `?${queryString}` : ''}`;
    router.replace(url, { scroll: false });
  }, [category.slug, router]);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
    updateUrl(1, newSort, localSearch || undefined);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl(newPage, sort, localSearch || undefined);
    // Scroll to top of product grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateUrl(1, sort, localSearch || undefined);
    fetchProducts();
  };

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-emerald-800 transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {category.name}
          </h1>
          <p className="text-muted-foreground text-sm">{totalProducts} produk ditemukan</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Cari di kategori ini..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="pl-10 rounded-xl" aria-label="Cari di kategori ini" />
            </div>
            <Button type="submit" variant="default" className="rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950">Cari</Button>
          </form>
          <div className="flex gap-2">
            <Select value={sort} onValueChange={handleSortChange}>
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

        {/* Product grid */}
        {loading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
            <ProductCardSkeletonGrid count={8} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">Produk Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-4">Coba ubah kata kunci atau filter pencarian</p>
            <Button variant="outline" className="rounded-xl" onClick={() => { setLocalSearch(''); setPage(1); updateUrl(1, sort); }}>Reset Filter</Button>
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                fallbackCategorySlug={category.slug}
                aspectRatio={viewMode === 'grid' ? 'square' : 'video'}
              />
            ))}
          </div>
        )}

        {totalProducts > 20 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" className="rounded-xl" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>Sebelumnya</Button>
            <span className="text-sm text-muted-foreground">Hal {page} dari {Math.ceil(totalProducts / 20)}</span>
            <Button variant="outline" className="rounded-xl" disabled={page >= Math.ceil(totalProducts / 20)} onClick={() => handlePageChange(page + 1)}>Selanjutnya</Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function CategoryPageClient(props: Props) {
  return (
    <Suspense>
      <CategoryPageContent {...props} />
    </Suspense>
  );
}
