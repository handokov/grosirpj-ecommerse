'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Package,
  DollarSign,
  Tag,
  Settings2,
  ImageIcon,
  Star,
} from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ImageUploader, { type UploadedImage } from '@/components/admin/ImageUploader'

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  price: z.string().min(1, 'Harga wajib diisi'),
  wholesalePrice: z.string().min(1, 'Harga grosir wajib diisi'),
  minOrder: z.string().min(1, 'Min. order wajib diisi'),
  stock: z.string().min(1, 'Stok wajib diisi'),
  sizes: z.string().optional().default(''),
  weight: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  featured: z.boolean().optional().default(false),
})

type ProductFormData = z.infer<typeof productSchema>

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

interface UploadedImage {
  url: string
  publicId: string
  file?: File
  preview?: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  wholesalePrice: number
  minOrder: number
  stock: number
  images: string
  categoryId: string
  featured: boolean
  tags: string | null
  weight: string | null
  sizes: string | null
  category: { name: string; slug: string }
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      description: '',
      price: '',
      wholesalePrice: '',
      minOrder: '1',
      stock: '',
      sizes: '',
      weight: '',
      tags: '',
      featured: false,
    },
  })

  const featured = watch('featured')

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true)
    try {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Gagal memuat kategori')
      const data = await res.json()
      setCategories(data.categories)
    } catch {
      toast.error('Gagal memuat kategori')
    } finally {
      setLoadingCategories(false)
    }
  }, [])

  const fetchProduct = useCallback(async () => {
    setLoadingProduct(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`)
      if (!res.ok) throw new Error('Produk tidak ditemukan')
      const data = await res.json()
      const product: Product = data.product

      // Set form values
      reset({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description,
        price: product.price.toString(),
        wholesalePrice: product.wholesalePrice.toString(),
        minOrder: product.minOrder.toString(),
        stock: product.stock.toString(),
        sizes: product.sizes || '',
        weight: product.weight || '',
        tags: product.tags || '',
        featured: product.featured,
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
  }, [productId, reset, router])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  // Image handling is now done by ImageUploader component

  const onSubmit = async (data: ProductFormData) => {
    const imageUrls = images.filter((img) => img.url).map((img) => img.url)
    const pendingImages = images.filter((img) => !img.url)

    if (pendingImages.length > 0) {
      toast.error('Tunggu hingga semua gambar selesai diupload')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images: imageUrls.join(','),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Gagal mengupdate produk')
      }

      toast.success('Produk berhasil diperbarui!')
      router.push('/admin/products')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengupdate produk')
    } finally {
      setSubmitting(false)
    }
  }

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
    <div className="space-y-5 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="border-gray-200 h-8 w-8"
          onClick={() => router.push('/admin/products')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Edit Produk</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Perbarui informasi produk Anda
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Section 1: Informasi Umum */}
        <Card className="p-5 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
              <Package className="h-4 w-4 text-emerald-700" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Informasi Umum</h2>
          </div>
          <Separator className="mb-5" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Produk <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contoh: Baju Anak Laki-laki Koko Muslim"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Kategori <span className="text-red-500">*</span>
              </Label>
              {loadingCategories ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={watch('categoryId')}
                  onValueChange={(val) => setValue('categoryId', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Jelaskan detail produk Anda..."
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Section 2: Harga & Stok */}
        <Card className="p-5 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100">
              <DollarSign className="h-4 w-4 text-amber-700" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Harga & Stok</h2>
          </div>
          <Separator className="mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Harga Ecer <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  Rp
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  className="pl-9"
                  {...register('price')}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="wholesalePrice">
                Harga Grosir <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  Rp
                </span>
                <Input
                  id="wholesalePrice"
                  type="number"
                  placeholder="0"
                  className="pl-9"
                  {...register('wholesalePrice')}
                />
              </div>
              {errors.wholesalePrice && (
                <p className="text-sm text-red-500">{errors.wholesalePrice.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrder">
                Min. Order <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minOrder"
                type="number"
                placeholder="1"
                {...register('minOrder')}
              />
              {errors.minOrder && (
                <p className="text-sm text-red-500">{errors.minOrder.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">
                Stok <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                {...register('stock')}
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock.message}</p>
              )}
            </div>
          </div>
          {/* Price preview */}
          {watch('price') && watch('wholesalePrice') && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-sm text-emerald-800">
                <span className="font-medium">Hemat grosir:</span>{' '}
                {formatRupiah(parseFloat(watch('price') || '0') - parseFloat(watch('wholesalePrice') || '0'))}{' '}
                per item (
                {Math.round(
                  ((parseFloat(watch('price') || '0') - parseFloat(watch('wholesalePrice') || '0')) /
                    parseFloat(watch('price') || '1')) *
                    100
                )}
                %)
              </p>
            </div>
          )}
        </Card>

        {/* Section 3: Varian */}
        <Card className="p-5 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100">
              <Settings2 className="h-4 w-4 text-sky-700" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Varian</h2>
          </div>
          <Separator className="mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sizes">Ukuran (comma-separated)</Label>
              <Input
                id="sizes"
                placeholder="S, M, L, XL, XXL"
                {...register('sizes')}
              />
              <p className="text-xs text-gray-400">
                Pisahkan dengan koma, contoh: S, M, L, XL
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Berat</Label>
              <Input
                id="weight"
                placeholder="200g"
                {...register('weight')}
              />
              <p className="text-xs text-gray-400">
                Masukkan berat produk (gram)
              </p>
            </div>
          </div>
        </Card>

        {/* Section 4: Media */}
        <Card className="p-5 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100">
              <ImageIcon className="h-4 w-4 text-purple-700" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Media</h2>
          </div>
          <Separator className="mb-5" />
          <ImageUploader
            images={images}
            onImagesChange={setImages}
            uploading={uploadingImage}
            setUploading={setUploadingImage}
          />
        </Card>

        {/* Section 5: Lainnya */}
        <Card className="p-5 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100">
              <Tag className="h-4 w-4 text-rose-700" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Lainnya</h2>
          </div>
          <Separator className="mb-5" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="baju anak, muslim, koko"
                {...register('tags')}
              />
              <p className="text-xs text-gray-400">
                Pisahkan dengan koma untuk memudahkan pencarian
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                  <Star className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <Label className="text-sm font-medium cursor-pointer">
                    Produk Featured
                  </Label>
                  <p className="text-xs text-gray-400">
                    Produk akan ditampilkan di halaman utama
                  </p>
                </div>
              </div>
              <Switch
                checked={featured}
                onCheckedChange={(checked) => setValue('featured', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
            disabled={submitting}
            className="text-xs border-gray-200"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={submitting || uploadingImage}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm shadow-emerald-200 min-w-[140px]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
