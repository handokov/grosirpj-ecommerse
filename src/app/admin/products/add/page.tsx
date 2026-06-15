'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProductForm, { type Category } from '@/components/admin/ProductForm'
import { type UploadedImage } from '@/components/admin/ImageUploader'
import { useCategories } from '@/hooks/use-categories'

export default function AddProductPage() {
  const router = useRouter()
  const { categories, loading: loadingCategories } = useCategories()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)

  return (
    <ProductForm
      mode="add"
      categories={categories as Category[]}
      loadingCategories={loadingCategories}
      images={images}
      onImagesChange={setImages}
      uploading={uploading}
      setUploading={setUploading}
      onSuccess={() => router.push('/admin/products')}
    />
  )
}
