'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Heart } from 'lucide-react'
import { formatRupiah, calculateDiscount } from '@/lib/format'
import ProductImage from '@/components/ui/product-image'
import { useWishlist, useWishlistHydrated } from '@/store/useWishlist'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    images: string
    price: number
    wholesalePrice: number
    minOrder: number
    sold: number
    rating: number
    featured?: boolean
    categoryName?: string
    categorySlug?: string
  }
  /** Default category slug to use when product.categorySlug is missing */
  fallbackCategorySlug?: string
  /** Aspect ratio for the image area */
  aspectRatio?: 'square' | 'video'
  /** Whether to show category name and stats */
  variant?: 'full' | 'compact'
}

export function ProductCard({
  product,
  fallbackCategorySlug,
  aspectRatio = 'square',
  variant = 'full',
}: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.wholesalePrice)
  const productUrl = `/${product.categorySlug || fallbackCategorySlug}/${product.slug}`

  // Wishlist — hydrated guard avoids hydration mismatch with persisted localStorage
  const hydrated = useWishlistHydrated()
  const inWishlist = useWishlist((s) => s.isInWishlist(product.id))
  const toggleWishlist = useWishlist((s) => s.toggleWishlist)

  const isSaved = hydrated && inWishlist

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <Link href={productUrl}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
        <CardContent className="p-0">
          <div className={`${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'} relative overflow-hidden bg-gray-100`}>
            <ProductImage
              src={product.images}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 z-[5]">
                -{discount}%
              </Badge>
            )}
            {product.featured && variant === 'full' && (
              <Badge className="absolute top-2 left-12 bg-amber-500 text-gray-900 text-xs px-2 z-[5]">
                <Star className="h-3 w-3 fill-current mr-0.5" />TOP
              </Badge>
            )}
            {/* Wishlist heart button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-label={isSaved ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
              aria-pressed={isSaved}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 z-10"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isSaved
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-500 hover:text-red-500'
                }`}
              />
            </button>
          </div>
          <div className="p-3">
            {variant === 'full' && product.categoryName && (
              <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
            )}
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-emerald-900 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-sm font-bold text-emerald-900">
                {formatRupiah(product.wholesalePrice)}
              </span>
              {discount > 0 && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatRupiah(product.price)}
                </span>
              )}
            </div>
            {variant === 'full' && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  {product.rating}
                </span>
                <span>Min. {product.minOrder} pcs</span>
                <span>
                  {product.sold > 999
                    ? `${(product.sold / 1000).toFixed(1)}rb`
                    : product.sold}{' '}
                  terjual
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <CardContent className="p-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
      </CardContent>
    </Card>
  )
}

export function ProductCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </>
  )
}
