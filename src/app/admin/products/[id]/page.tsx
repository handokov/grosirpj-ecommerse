'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ProductForm, { type ProductInitialData } from '@/components/admin/ProductForm'
import { type AdminCategory } from '@/types'
import { type UploadedImage } from '@/components/admin/ImageUploader'
import { useCategories } from '@/hooks/use-categories'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const { categories, loading: loadingCategories } = useCategories()
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [initialData, setInitialData] = useState<ProductInitialData | null>(null)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)

  const fetchProduct = useCallback(async () => {
    setLoadingProduct(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`)
      if (!res.ok) throw new Error('Produk tidak ditemukan')
      const data = await res.json()
      const product = data.product

      setInitialData({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description,
        price: product.price.toString(),
        wholesalePrice: product.wholesalePrice.toString(),
        minOrder: product.minOrder.toString(),
        stock: product.stock.toString(),
        sizes: product.sizes || '',
        colors: product.colors || '',
        variantName: product.variantName || '',
        variants: product.variants || '',
        weight: product.weight || '',
        tags: product.tags || '',
        featured: product.featured,
        supplierName: product.supplierName || '',
        supplierLink: product.supplierLink || '',
        supplierPhone: product.supplierPhone || '',
      })

      // Set existing images
      if (product.images) {
        const existingImages = product.images
          .split(',')
          .filter(Boolean)
          .map((url: string) => ({
            url: url.trim(),
            publicId: '',
          }))
        setImages(existingImages)
      }
    } catch {
      toast.error('Produk tidak ditemukan')
      router.push('/admin/products')
    } finally {
      setLoadingProduct(false)
    }
  }, [productId, router])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  if (loadingProduct) {
    return (
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
        </div>
        <Card className="p-5 border-0 shadow-sm">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>
        <Card className="p-5 border-0 shadow-sm">
          <Skeleton className="h-8 w-36 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <ProductForm
      mode="edit"
      productId={productId}
      initialData={initialData}
      categories={categories as AdminCategory[]}
      loadingCategories={loadingCategories}
      images={images}
      onImagesChange={setImages}
      uploading={uploading}
      setUploading={setUploading}
      onSuccess={() => router.push('/admin/products')}
    />
  )
}
