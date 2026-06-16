'use client';

import Link from 'next/link';
import { Heart, Trash2, ChevronRight, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/shared/ProductCard';
import { useWishlist, useWishlistHydrated } from '@/store/useWishlist';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function WishlistClient() {
  const hydrated = useWishlistHydrated();
  const items = useWishlist((s) => s.items);
  const clearWishlist = useWishlist((s) => s.clearWishlist);

  const count = items.length;

  const handleClear = () => {
    clearWishlist();
    toast.success('Semua favorit telah dihapus');
  };

  return (
    <section className="py-8 md:py-12 flex-1">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-emerald-800 transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> Beranda
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium">Favorit</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center">
              <Heart className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Favorit Saya</h1>
              <p className="text-sm text-muted-foreground">
                {hydrated
                  ? `${count} produk tersimpan`
                  : 'Memuat…'}
              </p>
            </div>
          </div>

          {hydrated && count > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Hapus Semua
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus semua favorit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus semua {count} produk dari daftar favorit Anda. Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClear}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Ya, Hapus Semua
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Content */}
        {!hydrated ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <CardContent className="p-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : count === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
      <CardContent className="flex flex-col items-center justify-center text-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <Heart className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Belum ada favorit</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Mulai simpan produk yang Anda suka dengan menekan ikon hati pada produk. Produk favorit akan muncul di sini.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="bg-emerald-700 hover:bg-emerald-800 text-white">
            <Link href="/">
              <ShoppingBag className="h-4 w-4 mr-2" /> Mulai Belanja
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cari">Lihat Semua Produk</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
