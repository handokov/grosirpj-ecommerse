'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStore, type Product } from '@/store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Package,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import ProductImage from '@/components/ui/product-image';

export default function Header() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    getCartItemCount,
  } = useStore();

  const [localSearch, setLocalSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const cartItemCount = getCartItemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (localSearch.trim().length >= 2) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(localSearch)}`);
          const data = await res.json();
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [localSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/cari?q=${encodeURIComponent(localSearch.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    const url = `/${product.categorySlug}/${product.slug}`;
    router.push(url);
    setLocalSearch('');
    setShowSuggestions(false);
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Jakarta, Indonesia
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>🚚 COD Jakarta Area</span>
            <span>|</span>
            <span>👗 Grosir Baju Anak & Baby Kids Terpercaya</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src="/logo.png"
                alt="GrosirPJ Logo"
                className="h-10 w-10 rounded-lg object-contain group-hover:scale-105 transition-transform"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-emerald-900 leading-tight">
                  GrosirPJ
                </h1>
                <p className="text-[11px] text-emerald-700 font-medium leading-tight">
                  Harga OK Kualitas OK
                </p>
              </div>
            </Link>

            {/* Search */}
            <div ref={searchRef} className="flex-1 max-w-2xl relative">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari baju anak, dress bayi, kaos anak..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-600 focus:ring-emerald-600/20 rounded-full"
                />
              </form>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left"
                    >
                      <ProductImage src={s.images} alt={s.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="text-xs text-emerald-800 font-semibold">{formatRupiah(s.wholesalePrice)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative h-10 w-10 rounded-full border-gray-200 hover:bg-emerald-50 hover:border-emerald-400"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[420px] p-0">
                  <SheetTitle className="sr-only">Keranjang Belanja</SheetTitle>
                  <CartDrawer />
                </SheetContent>
              </Sheet>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 rounded-full">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                  <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                  <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Category nav desktop */}
        <div className="hidden md:block border-t bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-1 h-10 overflow-x-auto">
              <Link
                href="/cari"
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  pathname === '/cari'
                    ? 'text-emerald-900 bg-emerald-100'
                    : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                Semua Kategori
              </Link>
              <CategoryNavItems currentPath={pathname} />
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}

function CategoryNavItems({ currentPath }: { currentPath: string }) {
  const [categories, setCategories] = useState<import('@/store/useStore').Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/${cat.slug}`}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            currentPath === `/${cat.slug}` || currentPath.startsWith(`/${cat.slug}/`)
              ? 'text-emerald-900 bg-emerald-100'
              : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [categories, setCategories] = useState<(import('@/store/useStore').Category & { productCount?: number })[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gradient-to-r from-emerald-700 to-emerald-900 text-white">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="GrosirPJ Logo" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <h2 className="text-lg font-bold">GrosirPJ</h2>
            <p className="text-xs text-emerald-200">Harga OK Kualitas OK</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-2">
        <Link
          href="/"
          onClick={onClose}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-50 text-gray-700 font-medium"
        >
          Beranda
        </Link>
        <div className="my-2 border-t" />
        <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Kategori</p>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${cat.slug}`}
            onClick={onClose}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-emerald-50 text-gray-700 text-sm"
          >
            {cat.name}
            {cat.productCount !== undefined && (
              <Badge variant="secondary" className="text-xs">{cat.productCount}</Badge>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Jakarta, Indonesia</span>
        </div>
      </div>
    </div>
  );
}

function CartDrawer() {
  const { cartItems, removeFromCart, updateCartQuantity, getCartTotal, clearCart } = useStore();
  const total = getCartTotal();

  const handleCheckout = () => {
    const WA_NUMBER = '6281281756262';
    const BCA_REKENING = '4130327970';

    let message = '🛒 *PESANAN BARU - GrosirPJ*\n';
    message += '━━━━━━━━━━━━━━━━━━━━━\n\n';

    cartItems.forEach((item, idx) => {
      message += `${idx + 1}. *${item.product.name}*\n`;
      if (item.size) message += `   Ukuran: ${item.size}\n`;
      message += `   ${item.quantity} x ${formatRupiah(item.product.wholesalePrice)} = ${formatRupiah(item.product.wholesalePrice * item.quantity)}\n\n`;
    });

    message += '━━━━━━━━━━━━━━━━━━━━━\n';
    message += `💰 *TOTAL: ${formatRupiah(total)}*\n\n`;
    message += '💳 *Metode Pembayaran:*\n';
    message += 'Transfer BCA\n';
    message += `🏦 BCA: ${BCA_REKENING}\n`; 
    message += '   a.n. GrosirPJ\n\n';
    message += 'Mohon kirim bukti transfer setelah pembayaran. Terima kasih! 🙏';

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer');
    clearCart();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-emerald-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950">Keranjang Belanja</h2>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">{cartItems.length} item</Badge>
        </div>
      </div>
      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-600 mb-1">Keranjang Kosong</h3>
          <p className="text-sm text-muted-foreground">Mulai belanja fashion anak & baby kids</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.map((item, idx) => (
              <div key={`${item.product.id}-${item.size}-${idx}`} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <ProductImage src={item.product.images} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  {item.size && <p className="text-xs text-muted-foreground">Ukuran: {item.size}</p>}
                  <p className="text-sm text-emerald-800 font-semibold">{formatRupiah(item.product.wholesalePrice)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.size)}>-</Button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.size)}>+</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item.product.id, item.size)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-emerald-900">{formatRupiah(total)}</span>
            </div>
            <Button onClick={handleCheckout} className="w-full bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white h-11 rounded-xl font-semibold">
              <MessageCircle className="h-4 w-4 mr-2" /> Checkout via WhatsApp
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">Min. order sesuai ketentuan produk</p>
          </div>
        </>
      )}
    </div>
  );
}
