'use client';

import { useEffect, useState } from 'react';
import { useStore, type Product } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Package,
  Tag,
  BarChart3,
  Weight,
  Ruler,
} from 'lucide-react';
import { formatRupiah, calculateDiscount } from '@/lib/format';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { selectedProduct, viewProduct, addToCart, viewCategory, goHome } = useStore();
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(selectedProduct?.minOrder ?? 1);

  useEffect(() => {
    if (selectedProduct) {
      fetch(`/api/products/detail?id=${selectedProduct.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.related) setRelated(data.related);
        })
        .catch(() => {});
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const discount = calculateDiscount(product.price, product.wholesalePrice);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} ditambahkan ke keranjang`, {
      description: `${quantity} pcs - ${formatRupiah(product.wholesalePrice * quantity)}`,
    });
  };

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={goHome} className="hover:text-emerald-600 transition-colors">Beranda</button>
          <span>/</span>
          {product.categoryName && (
            <>
              <button
                className="hover:text-emerald-600 transition-colors"
                onClick={() => viewCategory(product.categoryId)}
              >
                {product.categoryName}
              </button>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>

        {/* Product main section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={product.images}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1">
                  -{discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Product info */}
          <div>
            <Badge variant="secondary" className="mb-3">
              {product.categoryName}
            </Badge>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Rating & Sold */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-sm font-medium ml-1">{product.rating}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">
                {product.reviewCount} ulasan
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">
                {product.sold.toLocaleString()} terjual
              </span>
            </div>

            {/* Price */}
            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-emerald-700">
                  {formatRupiah(product.wholesalePrice)}
                </span>
                {discount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    HEMAT {discount}%
                  </Badge>
                )}
              </div>
              {discount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Harga eceran: <span className="line-through">{formatRupiah(product.price)}</span>
                </p>
              )}
              <p className="text-sm text-emerald-600 font-medium mt-1">
                Harga grosir • Min. order {product.minOrder} pcs
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Deskripsi Produk</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.weight && (
                <div className="flex items-center gap-2 text-sm">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Berat:</span>
                  <span className="font-medium">{product.weight}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Dimensi:</span>
                  <span className="font-medium">{product.dimensions}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Stok:</span>
                <span className="font-medium text-emerald-600">{product.stock} pcs</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Terjual:</span>
                <span className="font-medium">{product.sold.toLocaleString()}</span>
              </div>
            </div>

            {/* Quantity & Add to cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-xl overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-11 w-11"
                  onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
                  disabled={quantity <= product.minOrder}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-14 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-11 w-11"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                Subtotal: <span className="font-bold text-emerald-700">{formatRupiah(product.wholesalePrice * quantity)}</span>
              </span>
            </div>

            <Button
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Tambah ke Keranjang
            </Button>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <Truck className="h-5 w-5 text-emerald-600 mb-1" />
                <span className="text-xs font-medium">Gratis Ongkir</span>
                <span className="text-[10px] text-muted-foreground">Min. 5 Juta</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <Shield className="h-5 w-5 text-emerald-600 mb-1" />
                <span className="text-xs font-medium">Garansi 100%</span>
                <span className="text-[10px] text-muted-foreground">Uang Kembali</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <RotateCcw className="h-5 w-5 text-emerald-600 mb-1" />
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
                return (
                  <Card
                    key={rp.id}
                    className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => viewProduct(rp)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={rp.images}
                          alt={rp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {rDiscount > 0 && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2">
                            -{rDiscount}%
                          </Badge>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">
                          {rp.name}
                        </h3>
                        <span className="text-sm font-bold text-emerald-700">
                          {formatRupiah(rp.wholesalePrice)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
