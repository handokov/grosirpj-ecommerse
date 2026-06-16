'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ChevronLeft,
  Upload,
  CheckCircle,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import ProductImage from '@/components/ui/product-image';
import ShippingCalculator, { type SelectedShipping } from '@/components/shipping/ShippingCalculator';
import { WA_NUMBER, BCA_REKENING, getWhatsAppLink } from '@/lib/store-config';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

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
  const debouncedSearch = useDebounce(localSearch, 300);
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

  // Search suggestions — triggered by debounced search value
  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      let cancelled = false
      fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) {
            setSuggestions(data.suggestions)
            setShowSuggestions(true)
          }
        })
        .catch(() => {
          if (!cancelled) setSuggestions([])
        })
      return () => { cancelled = true }
    } else {
      // Clear suggestions when search is too short — use a timeout to avoid synchronous setState
      const timer = setTimeout(() => {
        setSuggestions([])
        setShowSuggestions(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [debouncedSearch]);

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
              <Image
                src="/logo.png"
                alt="GrosirPJ"
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-contain group-hover:scale-105 transition-transform"
                priority
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
                <SheetContent className="w-full sm:w-[420px] p-0 [&>button.absolute]:hidden">
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
          <Image src="/logo.png" alt="GrosirPJ" width={40} height={40} className="h-10 w-10 rounded-lg object-contain" priority />
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
  const { cartItems, removeFromCart, updateCartQuantity, getCartTotal, clearCart, setIsCartOpen } = useStore();
  const total = getCartTotal();

  // Step: 'cart' | 'form' | 'invoice'
  const [step, setStep] = useState<'cart' | 'form' | 'invoice'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoice, setInvoice] = useState<{
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    shippingCost: number;
    courier: string;
    courierService: string;
    destinationCity: string;
    items: { name: string; quantity: number; size?: string; price: number }[];
    createdAt: string;
  } | null>(null);

  // Customer form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddr, setCustAddr] = useState('');
  const [custNote, setCustNote] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState<SelectedShipping | null>(null);

  // Payment proof upload
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);

  // Use centralized config
  const grandTotal = total + shippingCost;

  // Calculate total weight from cart items
  const totalWeight = cartItems.reduce((sum, item) => {
    const itemWeight = parseInt(item.product.weight || '250') || 250; // default 250g per item
    return sum + itemWeight * item.quantity;
  }, 0);

  // Handle shipping selection from ShippingCalculator
  const handleShippingSelected = (shipping: SelectedShipping | null) => {
    setSelectedShipping(shipping);
    setShippingCost(shipping?.cost || 0);
  };

  const handleSubmitOrder = async () => {
    if (!custName.trim() || !custPhone.trim()) return;
    // Validate phone format
    const phoneValid = /^0[0-9]{9,12}$/.test(custPhone) || /^62[0-9]{9,12}$/.test(custPhone);
    if (!phoneValid) return;
    setIsSubmitting(true);

    try {
      const orderItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size || '',
        price: item.product.wholesalePrice,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: custName.trim(),
          customerPhone: custPhone.trim(),
          customerAddr: custAddr.trim(),
          note: custNote.trim(),
          shippingCost,
          courier: selectedShipping?.courier || '',
          courierService: selectedShipping?.service?.code || '',
          destinationCity: selectedShipping?.destinationName || '',
          items: orderItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat pesanan');

      // Safely extract order data
      const order = data.order;
      if (!order || !order.orderNumber) throw new Error('Invalid response from server');

      setInvoice({
        orderNumber: order.orderNumber || '',
        customerName: order.customerName || custName.trim(),
        customerPhone: order.customerPhone || custPhone.trim(),
        totalAmount: order.totalAmount || 0,
        shippingCost: order.shippingCost ?? shippingCost,
        courier: order.courier || selectedShipping?.courier || '',
        courierService: order.courierService || selectedShipping?.service?.code || '',
        destinationCity: order.destinationCity || selectedShipping?.destinationName || '',
        items: Array.isArray(order.items)
          ? order.items.map((i: Record<string, unknown>) => ({
              name: (i.product as Record<string, string>)?.name || 'Produk',
              quantity: (i.quantity as number) || 0,
              size: (i.size as string) || undefined,
              price: (i.price as number) || 0,
            }))
          : [],
        createdAt: order.createdAt || new Date().toISOString(),
      });

      setStep('invoice');
      clearCart();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Order error:', err);
      toast.error('Gagal membuat pesanan', { description: 'Silakan coba lagi atau hubungi kami via WhatsApp.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    if (!invoice) return;

    let message = `🧾 *INVOICE ${invoice.orderNumber}*\n`;
    message += 'GrosirPJ - Harga OK Kualitas OK\n';
    message += '━━━━━━━━━━━━━━━━━━━━━\n\n';
    message += `👤 ${invoice.customerName}\n`;
    message += `📱 ${invoice.customerPhone}\n`;
    if (invoice.destinationCity) message += `📍 ${invoice.destinationCity}\n`;
    message += '\n';
    message += '📦 *Detail Pesanan:*\n';

    invoice.items.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name}\n`;
      if (item.size) message += `   Ukuran: ${item.size}\n`;
      message += `   ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(item.price * item.quantity)}\n`;
    });

    message += '\n━━━━━━━━━━━━━━━━━━━━━\n';
    message += `📦 Subtotal: ${formatRupiah(invoice.totalAmount)}\n`;
    if (invoice.courier && invoice.courier !== 'manual') {
      message += `🚚 Estimasi Ongkir (${invoice.courier.toUpperCase()} ${invoice.courierService}): ${invoice.shippingCost > 0 ? formatRupiah(invoice.shippingCost) : 'Akan dikonfirmasi'}\n`;
    } else {
      message += `🚚 Estimasi Ongkir: ${invoice.shippingCost > 0 ? formatRupiah(invoice.shippingCost) : 'Akan dikonfirmasi'}\n`;
    }
    message += `💰 *TOTAL BAYAR: ${formatRupiah(invoice.totalAmount + invoice.shippingCost)}*\n\n`;
    message += '💳 *Pembayaran:*\n';
    message += 'Transfer BCA\n';
    message += `🏦 ${BCA_REKENING} a.n. Rahmawati\n\n`;
    message += `Nomor Invoice: *${invoice.orderNumber}*\n\n`;
    message += 'Mohon kirim bukti transfer dengan menyertakan nomor invoice ini. Terima kasih 🙏';

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File terlalu besar. Maksimal 10MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP');
      return;
    }
    setPaymentFile(file);
    setPaymentPreview(URL.createObjectURL(file));
  };

  const handleUploadProof = async () => {
    if (!paymentFile || !invoice) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', paymentFile);
      if (paymentNotes.trim()) formData.append('paymentNotes', paymentNotes.trim());

      const res = await fetch(`/api/orders/${invoice.orderNumber}/payment-proof`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal upload');

      setProofUploaded(true);
      toast.success('Bukti pembayaran berhasil dikirim!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal upload bukti pembayaran');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setStep('cart');
    setInvoice(null);
    setCustName('');
    setCustPhone('');
    setCustAddr('');
    setCustNote('');
    setShippingCost(0);
    setSelectedShipping(null);
    setPaymentFile(null);
    setPaymentPreview(null);
    setPaymentNotes('');
    setUploading(false);
    setProofUploaded(false);
    setIsCartOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step !== 'cart' && (
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setStep(step === 'invoice' ? 'form' : 'cart')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-lg font-bold text-emerald-950">
              {step === 'cart' ? 'Keranjang Belanja' : step === 'form' ? 'Data Pemesan' : 'Invoice'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {step === 'cart' && cartItems.length > 0 && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">{cartItems.length} item</Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Step: Cart */}
      {step === 'cart' && (
        <>
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
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.size)} disabled={item.quantity <= item.product.minOrder}>-</Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.size)} disabled={item.quantity >= item.product.stock}>+</Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item.product.id, item.size)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.product.minOrder > 1 && <p className="text-[10px] text-muted-foreground mt-0.5">Min. {item.product.minOrder} pcs</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-emerald-900">{formatRupiah(total)}</span>
                </div>
                <Button onClick={() => setStep('form')} className="w-full bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white h-11 rounded-xl font-semibold">
                  Checkout
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">Min. order sesuai ketentuan produk</p>
              </div>
            </>
          )}
        </>
      )}

      {/* Step: Customer Form */}
      {step === 'form' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Order summary */}
            <div className="bg-emerald-50 rounded-xl p-3 mb-2">
              <p className="text-xs font-semibold text-emerald-900 mb-2">Ringkasan Pesanan</p>
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 truncate flex-1">{item.product.name} x{item.quantity}</span>
                  <span className="font-medium ml-2">{formatRupiah(item.product.wholesalePrice * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-emerald-200 mt-2 pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-800">Subtotal</span>
                  <span className="font-medium">{formatRupiah(total)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-800">Estimasi Ongkir</span>
                  <span className="font-medium">{shippingCost > 0 ? formatRupiah(shippingCost) : 'Akan dikonfirmasi'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-sm font-bold text-emerald-900">Total Bayar</span>
                  <span className="text-sm font-bold text-emerald-900">{formatRupiah(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Customer data */}
            <div>
              <label htmlFor="cust-name" className="text-sm font-medium text-gray-700 mb-1 block">Nama Lengkap *</label>
              <Input
                id="cust-name"
                placeholder="Masukkan nama Anda"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <label htmlFor="cust-phone" className="text-sm font-medium text-gray-700 mb-1 block">No. WhatsApp *</label>
              <Input
                id="cust-phone"
                placeholder="08xxxxxxxxxx"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                className={`h-10 ${custPhone && !/^0[0-9]{9,12}$/.test(custPhone) && !/^62[0-9]{9,12}$/.test(custPhone) ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                type="tel"
              />
              {custPhone && !/^0[0-9]{9,12}$/.test(custPhone) && !/^62[0-9]{9,12}$/.test(custPhone) && (
                <p className="text-xs text-red-500 mt-1">Format: 08xx atau 62xxx (10-13 digit)</p>
              )}
            </div>
            <div>
              <label htmlFor="cust-addr" className="text-sm font-medium text-gray-700 mb-1 block">Alamat Pengiriman</label>
              <Input
                id="cust-addr"
                placeholder="Alamat lengkap (opsional)"
                value={custAddr}
                onChange={(e) => setCustAddr(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Shipping calculator */}
            <ShippingCalculator
              totalWeight={totalWeight}
              onShippingSelected={handleShippingSelected}
              currentShippingCost={shippingCost}
            />

            <div>
              <label htmlFor="cust-note" className="text-sm font-medium text-gray-700 mb-1 block">Catatan</label>
              <Input
                id="cust-note"
                placeholder="Catatan pesanan (opsional)"
                value={custNote}
                onChange={(e) => setCustNote(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <div className="border-t p-4 bg-gray-50">
            <Button
              onClick={handleSubmitOrder}
              disabled={!custName.trim() || !custPhone.trim() || !(/^0[0-9]{9,12}$/.test(custPhone) || /^62[0-9]{9,12}$/.test(custPhone)) || isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white h-11 rounded-xl font-semibold"
            >
              {isSubmitting ? 'Memproses...' : 'Buat Invoice'}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">Invoice akan digenerate otomatis</p>
          </div>
        </>
      )}

      {/* Step: Invoice */}
      {step === 'invoice' && invoice && (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              {/* Invoice header */}
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-4 text-center">
                <h3 className="text-lg font-bold">INVOICE</h3>
                <p className="text-emerald-200 text-sm font-mono">{invoice.orderNumber}</p>
              </div>

              <div className="p-4 space-y-4">
                {/* Customer info */}
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs">Pemesan</p>
                  <p className="font-semibold">{invoice.customerName}</p>
                  <p className="text-muted-foreground">{invoice.customerPhone}</p>
                  {invoice.destinationCity && (
                    <p className="text-muted-foreground text-xs mt-0.5">📍 {invoice.destinationCity}</p>
                  )}
                </div>

                <div className="border-t" />

                {/* Items */}
                <div className="space-y-2">
                  {invoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {formatRupiah(item.price)}
                          {item.size ? ` • ${item.size}` : ''}
                        </p>
                      </div>
                      <p className="font-medium">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t" />

                {/* Subtotal + Ongkir + Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal Produk</span>
                    <span className="font-medium">{formatRupiah(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Estimasi Ongkir
                      {invoice.courier && invoice.courier !== 'manual' && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({invoice.courier.toUpperCase()} {invoice.courierService})
                        </span>
                      )}
                    </span>
                    <span className="font-medium">{invoice.shippingCost > 0 ? formatRupiah(invoice.shippingCost) : 'Akan dikonfirmasi'}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-900">TOTAL BAYAR</span>
                    <span className="text-xl font-bold text-emerald-900">{formatRupiah(invoice.totalAmount + invoice.shippingCost)}</span>
                  </div>
                </div>

                <div className="border-t" />

                {/* Payment info */}
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="font-semibold text-blue-900 text-sm mb-2">💳 Pembayaran Transfer BCA</p>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Nomor Rekening</p>
                    <p className="text-2xl font-bold font-mono text-blue-900 tracking-wider">{BCA_REKENING}</p>
                    <p className="text-sm text-muted-foreground">a.n. Rahmawati</p>
                  </div>
                  <p className="text-xs text-blue-800 mt-2">
                    ⚠️ Harap sertakan <b>nomor invoice {invoice.orderNumber}</b> saat kirim bukti transfer
                  </p>
                </div>

                {/* Upload Bukti Pembayaran */}
                {!proofUploaded ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-sm text-gray-800">📷 Upload Bukti Pembayaran</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer relative">
                      {paymentPreview ? (
                        <div className="space-y-2">
                          <img src={paymentPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                          <p className="text-xs text-gray-500">Klik untuk ganti foto</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600 font-medium">Klik untuk pilih foto</p>
                          <p className="text-[10px] text-gray-400">JPG, PNG, WebP • Maks. 10MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <Input
                      placeholder="Catatan pembayaran (opsional)"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="h-9 text-xs"
                    />
                    {paymentFile && (
                      <Button
                        onClick={handleUploadProof}
                        disabled={uploading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs"
                      >
                        {uploading ? 'Mengupload...' : 'Kirim Bukti Pembayaran'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <p className="text-xs font-semibold text-emerald-800">Bukti pembayaran berhasil dikirim</p>
                    </div>
                    <p className="text-[10px] text-emerald-700">Admin akan memverifikasi pembayaran Anda</p>
                  </div>
                )}

                {/* Status */}
                {proofUploaded ? (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-xs font-medium text-blue-800">Bukti Terkirim — Menunggu Verifikasi</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-yellow-50 rounded-lg p-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-yellow-800">Menunggu Pembayaran</span>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground text-center">
                  {new Date(invoice.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} {new Date(invoice.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t p-4 bg-gray-50 space-y-2">
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white h-11 rounded-xl font-semibold"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Kirim Bukti via WhatsApp
            </Button>
            <p className="text-xs text-center text-muted-foreground">Atau upload bukti di atas & kirim via WhatsApp sebagai backup</p>
          </div>
        </>
      )}
    </div>
  );
}
