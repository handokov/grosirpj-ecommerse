'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore, type Product } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Star, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus, Package, BarChart3, Weight, Ruler, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { formatRupiah, calculateDiscount } from '@/lib/format';
import { toast } from 'sonner';
import ProductImage, { getAllImageUrls, getOptimizedImageUrl } from '@/components/ui/product-image';

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(product.minOrder);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);

  const discount = calculateDiscount(product.price, product.wholesalePrice);
  const sizeList = product.sizes ? product.sizes.split(',') : [];
  const allImages = getAllImageUrls(product.images);
  const hasMultipleImages = allImages.length > 1;

  const goToImage = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setSelectedImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    setSelectedImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  }, [allImages.length]);

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const diff = Math.abs(touchStartX.current - touchEndX.current);
    if (diff > 10) isSwiping.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (diff > minSwipeDistance) {
      goNext();
    } else if (diff < -minSwipeDistance) {
      goPrev();
    }
  }, [goNext, goPrev]);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || undefined);
    toast.success(`${product.name} ditambahkan ke keranjang`, {
      description: `${quantity} pcs${selectedSize ? ` - Ukuran ${selectedSize}` : ''} - ${formatRupiah(product.wholesalePrice * quantity)}`,
    });
  };

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-emerald-800 transition-colors">Beranda</Link>
          <span>/</span>
          {product.categoryName && product.categorySlug && (
            <><Link href={`/${product.categorySlug}`} className="hover:text-emerald-800 transition-colors">{product.categoryName}</Link><span>/</span></>
          )}
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product images */}
          <div>
            {/* Main image with swipe support */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 group select-none"
              onTouchStart={hasMultipleImages ? handleTouchStart : undefined}
              onTouchMove={hasMultipleImages ? handleTouchMove : undefined}
              onTouchEnd={hasMultipleImages ? handleTouchEnd : undefined}
            >
              {allImages.length > 0 ? (
                <Image
                  key={selectedImageIndex}
                  src={getOptimizedImageUrl(allImages[selectedImageIndex] || allImages[0], { width: 800, quality: 'auto' })}
                  alt={`${product.name} - ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover"
                  priority={selectedImageIndex === 0}
                  unoptimized={allImages[selectedImageIndex]?.startsWith('http')}
                />
              ) : (
                <ProductImage src="" alt={product.name} className="w-full h-full object-cover" priority={true} />
              )}
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 z-10">-{discount}% OFF</Badge>
              )}

              {/* Navigation arrows - always visible on mobile, hover on desktop */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-800 transition-all md:opacity-0 md:group-hover:opacity-100 z-10"
                    aria-label="Gambar sebelumnya"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-emerald-800 transition-all md:opacity-0 md:group-hover:opacity-100 z-10"
                    aria-label="Gambar selanjutnya"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full z-10">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              )}

              {/* Swipe hint on mobile */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 right-3 md:hidden bg-black/40 text-white/70 text-[10px] px-2 py-0.5 rounded-full z-10">
                  ← Geser →
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToImage(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      idx === selectedImageIndex
                        ? 'border-emerald-600 shadow-md'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <Image
                      src={getOptimizedImageUrl(img, { width: 100, quality: 'auto' })}
                      alt={`${product.name} thumb ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={img.startsWith('http')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <Badge variant="secondary" className="mb-3">{product.categoryName}</Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                ))}
                <span className="text-sm font-medium ml-1">{product.rating}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">{product.reviewCount} ulasan</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">{product.sold.toLocaleString()} terjual</span>
            </div>

            {/* Price */}
            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-emerald-900">{formatRupiah(product.wholesalePrice)}</span>
                {discount > 0 && <Badge className="bg-red-500 text-white">HEMAT {discount}%</Badge>}
              </div>
              {discount > 0 && (
                <p className="text-sm text-muted-foreground">Harga eceran: <span className="line-through">{formatRupiah(product.price)}</span></p>
              )}
              <p className="text-sm text-emerald-800 font-medium mt-1">Harga grosir • Min. order {product.minOrder} pcs</p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Deskripsi Produk</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Size selection */}
            {sizeList.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Pilih Ukuran</h3>
                <div className="flex flex-wrap gap-2">
                  {sizeList.map((size) => (
                    <Button
                      key={size.trim()}
                      variant={selectedSize === size.trim() ? 'default' : 'outline'}
                      size="sm"
                      className={`rounded-lg ${selectedSize === size.trim() ? 'bg-emerald-800 hover:bg-emerald-900' : 'hover:border-emerald-300 hover:text-emerald-900'}`}
                      onClick={() => setSelectedSize(size.trim())}
                    >
                      {size.trim()}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.weight && (
                <div className="flex items-center gap-2 text-sm">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Berat:</span>
                  <span className="font-medium">{product.weight}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Stok:</span>
                <span className="font-medium text-emerald-800">{product.stock} pcs</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Terjual:</span>
                <span className="font-medium">{product.sold.toLocaleString()}</span>
              </div>
              {product.sizes && (
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ukuran:</span>
                  <span className="font-medium">{product.sizes}</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-xl overflow-hidden">
                <Button variant="ghost" size="icon" className="rounded-none h-11 w-11" onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))} disabled={quantity <= product.minOrder}><Minus className="h-4 w-4" /></Button>
                <span className="w-14 text-center font-semibold">{quantity}</span>
                <Button variant="ghost" size="icon" className="rounded-none h-11 w-11" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}><Plus className="h-4 w-4" /></Button>
              </div>
              <span className="text-sm text-muted-foreground">Subtotal: <span className="font-bold text-emerald-900">{formatRupiah(product.wholesalePrice * quantity)}</span></span>
            </div>

            <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white font-semibold text-base" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5 mr-2" /> Tambah ke Keranjang
            </Button>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <Truck className="h-5 w-5 text-emerald-800 mb-1" />
                <span className="text-xs font-medium">COD Jakarta</span>
                <span className="text-[10px] text-muted-foreground">Bayar di Tempat</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <Shield className="h-5 w-5 text-emerald-800 mb-1" />
                <span className="text-xs font-medium">Garansi 100%</span>
                <span className="text-[10px] text-muted-foreground">Uang Kembali</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <RotateCcw className="h-5 w-5 text-emerald-800 mb-1" />
                <span className="text-xs font-medium">Easy Return</span>
                <span className="text-[10px] text-muted-foreground">7 Hari</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Produk Serupa</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((rp) => {
                const rDiscount = calculateDiscount(rp.price, rp.wholesalePrice);
                const rpUrl = `/${rp.categorySlug || product.categorySlug}/${rp.slug}`;
                return (
                  <Link key={rp.id} href={rpUrl}>
                    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <ProductImage src={rp.images} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          {rDiscount > 0 && <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2">-{rDiscount}%</Badge>}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">{rp.name}</h3>
                          <span className="text-sm font-bold text-emerald-900">{formatRupiah(rp.wholesalePrice)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
