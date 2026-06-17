'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore, type Product } from '@/store/useStore';
import { useWishlist } from '@/store/useWishlist';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Star, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus, Package, BarChart3, Weight, ChevronLeft, ChevronRight, Heart,
} from 'lucide-react';
import { formatRupiah, calculateDiscount } from '@/lib/format';
import { toast } from 'sonner';
import ProductImage, { getAllImageUrls, getOptimizedImageUrl } from '@/components/ui/product-image';
import { ProductCard } from '@/components/shared/ProductCard';
import SizeChart from '@/components/product/SizeChart';

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const { addToCart } = useStore();
  const inWishlist = useWishlist((s) => s.isInWishlist(product.id));
  const toggleWishlist = useWishlist((s) => s.toggleWishlist);
  const [quantity, setQuantity] = useState(product.minOrder);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const discount = calculateDiscount(product.price, product.wholesalePrice);
  const sizeList = product.sizes ? product.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
  const colorList = product.colors ? product.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
  const variantList = product.variants ? product.variants.split(',').map(v => v.trim()).filter(Boolean) : [];
  const variantLabel = product.variantName || 'Varian';
  const allImages = getAllImageUrls(product.images);
  const hasMultipleImages = allImages.length > 1;

  const goToImage = useCallback((index: number) => {
    if (index === selectedImageIndex) return;
    setSlideDirection(index > selectedImageIndex ? 'left' : 'right');
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedImageIndex(index);
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection(null);
      }, 50);
    }, 200);
  }, [selectedImageIndex]);

  const goNext = useCallback(() => {
    if (isTransitioning) return;
    setSlideDirection('left');
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection(null);
      }, 50);
    }, 200);
  }, [allImages.length, isTransitioning]);

  const goPrev = useCallback(() => {
    if (isTransitioning) return;
    setSlideDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection(null);
      }, 50);
    }, 200);
  }, [allImages.length, isTransitioning]);

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
    addToCart(product, quantity, selectedSize || undefined, selectedColor || undefined, selectedVariant || undefined);
    const details = [
      selectedSize ? `Ukuran ${selectedSize}` : null,
      selectedColor ? `Warna ${selectedColor}` : null,
      selectedVariant ? `${variantLabel} ${selectedVariant}` : null,
    ].filter(Boolean).join(' - ');
    toast.success(`${product.name} ditambahkan ke keranjang`, {
      description: `${quantity} pcs${details ? ` - ${details}` : ''} - ${formatRupiah(product.wholesalePrice * quantity)}`,
    });
  };

  const handleToggleWishlist = () => {
    const wasInWishlist = inWishlist;
    toggleWishlist(product);
    if (wasInWishlist) {
      toast.success('Dihapus dari Favorit', {
        description: product.name,
      });
    } else {
      toast.success('Ditambahkan ke Favorit', {
        description: product.name,
      });
    }
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
              className="relative aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 group select-none mx-auto w-full max-w-[420px]"
              onTouchStart={hasMultipleImages ? handleTouchStart : undefined}
              onTouchMove={hasMultipleImages ? handleTouchMove : undefined}
              onTouchEnd={hasMultipleImages ? handleTouchEnd : undefined}
            >
              {allImages.length > 0 ? (
                <div
                  className={`w-full h-full transition-all duration-200 ease-out ${
                    isTransitioning
                      ? slideDirection === 'left'
                        ? 'opacity-0 translate-x-[-8%] scale-95'
                        : 'opacity-0 translate-x-[8%] scale-95'
                      : 'opacity-100 translate-x-0 scale-100'
                  }`}
                >
                  <Image
                    key={selectedImageIndex}
                    src={getOptimizedImageUrl(allImages[selectedImageIndex] || allImages[0], { width: 800, quality: 'auto' })}
                    alt={`${product.name} - ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority={selectedImageIndex === 0}
                    unoptimized={allImages[selectedImageIndex]?.startsWith('http')}
                  />
                </div>
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


            </div>

            {/* Thumbnail gallery */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin max-w-[420px] mx-auto w-full">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToImage(idx)}
                    className={`relative w-20 h-20 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      idx === selectedImageIndex
                        ? 'border-emerald-600 shadow-md ring-2 ring-emerald-600/30'
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
            <Badge variant="secondary" className="mb-2 text-xs">{product.categoryName}</Badge>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

            <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                ))}
                <span className="font-medium ml-0.5">{product.rating}</span>
              </div>
              <Separator orientation="vertical" className="h-3" />
              <span>{product.reviewCount} ulasan</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{product.sold.toLocaleString()} terjual</span>
            </div>

            {/* Price */}
            <div className="bg-emerald-50 rounded-xl p-3 mb-4">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-2xl md:text-3xl font-bold text-emerald-900">{formatRupiah(product.wholesalePrice)}</span>
                {discount > 0 && <Badge className="bg-red-500 text-white text-xs">HEMAT {discount}%</Badge>}
              </div>
              {discount > 0 && (
                <p className="text-xs text-muted-foreground">Harga eceran: <span className="line-through">{formatRupiah(product.price)}</span></p>
              )}
              <p className="text-xs text-emerald-800 font-medium mt-0.5">Harga grosir • Min. order {product.minOrder} pcs</p>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Deskripsi Produk</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Size selection */}
            {sizeList.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">Pilih Ukuran</h3>
                  <SizeChart
                    categorySlug={product.categorySlug}
                    triggerLabel="Panduan Ukuran"
                    triggerClassName="h-7 px-2.5 text-xs"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sizeList.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      size="sm"
                      className={`rounded-lg h-8 text-xs px-3 ${selectedSize === size ? 'bg-emerald-800 hover:bg-emerald-900' : 'hover:border-emerald-300 hover:text-emerald-900'}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selection */}
            {colorList.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">Pilih Warna</h3>
                <div className="flex flex-wrap gap-1.5">
                  {colorList.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'default' : 'outline'}
                      size="sm"
                      className={`rounded-lg h-8 text-xs px-3 ${selectedColor === color ? 'bg-emerald-800 hover:bg-emerald-900' : 'hover:border-emerald-300 hover:text-emerald-900'}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom variant selection */}
            {variantList.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">Pilih {variantLabel}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {variantList.map((v) => (
                    <Button
                      key={v}
                      variant={selectedVariant === v ? 'default' : 'outline'}
                      size="sm"
                      className={`rounded-lg h-8 text-xs px-3 ${selectedVariant === v ? 'bg-emerald-800 hover:bg-emerald-900' : 'hover:border-emerald-300 hover:text-emerald-900'}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Size chart link — shown when no sizes exist for this product */}
            {sizeList.length === 0 && (
              <div className="mb-4">
                <SizeChart
                  categorySlug={product.categorySlug}
                  triggerLabel="Lihat Panduan Ukuran"
                  triggerClassName="h-8 px-3 text-xs"
                />
              </div>
            )}

            {/* Specs */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4">
              {product.weight && (
                <span className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" />{product.weight}</span>
              )}
              <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />Stok: <b className="text-emerald-800">{product.stock}</b></span>
              <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />Terjual: <b>{product.sold.toLocaleString()}</b></span>
            </div>

            {/* Quantity & Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button variant="ghost" size="icon" className="rounded-none h-9 w-9" onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))} disabled={quantity <= product.minOrder}><Minus className="h-3.5 w-3.5" /></Button>
                <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                <Button variant="ghost" size="icon" className="rounded-none h-9 w-9" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}><Plus className="h-3.5 w-3.5" /></Button>
              </div>
              <span className="text-xs text-muted-foreground">Subtotal: <span className="font-bold text-emerald-900 text-sm">{formatRupiah(product.wholesalePrice * quantity)}</span></span>
            </div>

            <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white font-semibold text-sm" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Tambah ke Keranjang
            </Button>

            <Button
              variant="outline"
              className={`w-full h-11 rounded-xl font-semibold text-sm mt-2 transition-colors ${
                inWishlist
                  ? 'border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700'
                  : 'border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800'
              }`}
              onClick={handleToggleWishlist}
              aria-pressed={inWishlist}
            >
              <Heart className={`h-4 w-4 mr-2 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              {inWishlist ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
            </Button>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                <Truck className="h-4 w-4 text-emerald-800 mb-0.5" />
                <span className="text-[10px] font-medium">COD Jakarta</span>
                <span className="text-[9px] text-muted-foreground">Bayar di Tempat</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                <Shield className="h-4 w-4 text-emerald-800 mb-0.5" />
                <span className="text-[10px] font-medium">Garansi 100%</span>
                <span className="text-[9px] text-muted-foreground">Uang Kembali</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                <RotateCcw className="h-4 w-4 text-emerald-800 mb-0.5" />
                <span className="text-[10px] font-medium">Easy Return</span>
                <span className="text-[9px] text-muted-foreground">7 Hari</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Produk Serupa</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((rp) => (
                <ProductCard
                  key={rp.id}
                  product={rp}
                  fallbackCategorySlug={product.categorySlug}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
