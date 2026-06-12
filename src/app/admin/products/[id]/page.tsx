'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Upload,
  X,
  ImagePlus,
  Loader2,
  Package,
  DollarSign,
  Tag,
  Settings2,
  ImageIcon,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'grosirpj/products')
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload gagal')
      const data = await res.json()
      return { url: data.url, publicId: data.publicId }
    } catch {
      toast.error(`Gagal upload gambar: ${file.name}`)
      return null
    }
  }

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
    )

    if (fileArray.length === 0) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.')
      return
    }

    const newImages: UploadedImage[] = fileArray.map((file) => ({
      url: '',
      publicId: '',
      file,
      preview: URL.createObjectURL(file),
    }))

    setImages((prev) => [...prev, ...newImages])

    setUploadingImage(true)
    for (let i = 0; i < fileArray.length; i++) {
      const result = await uploadFile(fileArray[i])
      if (result) {
        setImages((prev) => {
          const updated = [...prev]
          const index = prev.findIndex(
            (img) => img.preview === newImages[i].preview
          )
          if (index !== -1) {
            updated[index] = { ...result, preview: newImages[i].preview }
          }
          return updated
        })
      }
    }
    setUploadingImage(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index]
      if (img.preview) URL.revokeObjectURL(img.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

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
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
        </div>
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>
        <Card className="p-6">
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
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => router.push('/admin/products')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Perbarui informasi produk Anda
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Informasi Umum */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <Package className="h-4 w-4 text-emerald-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informasi Umum</h2>
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
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <DollarSign className="h-4 w-4 text-emerald-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Harga & Stok</h2>
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
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <Settings2 className="h-4 w-4 text-emerald-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Varian</h2>
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
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <ImageIcon className="h-4 w-4 text-emerald-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Media</h2>
          </div>
          <Separator className="mb-5" />
          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
                dragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                  dragActive ? 'bg-emerald-100' : 'bg-gray-100'
                )}
              >
                <Upload
                  className={cn(
                    'h-6 w-6',
                    dragActive ? 'text-emerald-600' : 'text-gray-400'
                  )}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Drag & drop gambar di sini
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  atau klik untuk memilih file (JPG, PNG, WebP, GIF)
                </p>
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Mengupload...</span>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    <img
                      src={img.preview || img.url}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {!img.url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                      </div>
                    )}
                    {index === 0 && img.url && (
                      <Badge className="absolute top-1.5 left-1.5 bg-emerald-700 text-white text-[10px] px-1.5 py-0">
                        Utama
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {/* Add more images button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-emerald-300 bg-gray-50 hover:bg-emerald-50 flex flex-col items-center justify-center gap-1.5 transition-colors"
                >
                  <ImagePlus className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Tambah</span>
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Section 5: Lainnya */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <Tag className="h-4 w-4 text-emerald-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Lainnya</h2>
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
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={submitting || uploadingImage}
            className="bg-emerald-700 hover:bg-emerald-800 text-white min-w-[140px]"
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
