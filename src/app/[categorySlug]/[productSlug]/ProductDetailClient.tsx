'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore, type Product } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Star, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus, Package, BarChart3, Weight,
} from 'lucide-react';
import { formatRupiah, calculateDiscount } from '@/lib/format';
import { toast } from 'sonner';
import ProductImage from '@/components/ui/product-image';

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(product.minOrder);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const discount = calculateDiscount(product.price, product.wholesalePrice);
  const sizeList = product.sizes ? product.sizes.split(',') : [];

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
          {/* Product image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <ProductImage src={product.images} alt={product.name} className="w-full h-full object-cover" priority={true} />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1">-{discount}% OFF</Badge>
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
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Pilih Ukuran</h3>
                <div className="flex flex-wrap gap-1.5">
                  {sizeList.map((size) => (
                    <Button
                      key={size.trim()}
                      variant={selectedSize === size.trim() ? 'default' : 'outline'}
                      size="sm"
                      className={`rounded-lg h-8 text-xs px-3 ${selectedSize === size.trim() ? 'bg-emerald-800 hover:bg-emerald-900' : 'hover:border-emerald-300 hover:text-emerald-900'}`}
                      onClick={() => setSelectedSize(size.trim())}
                    >
                      {size.trim()}
                    </Button>
                  ))}
                </div>
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
