'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  PackageOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
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
  rating: number
  reviewCount: number
  sold: number
  featured: boolean
  tags: string | null
  weight: string | null
  sizes: string | null
  createdAt: string
  updatedAt: string
  category: { name: string; slug: string }
}

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const limit = 20

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        categoryId,
      })
      const res = await fetch(`/api/admin/products?${params}`)
      if (!res.ok) throw new Error('Gagal memuat produk')
      const data: ProductsResponse = await res.json()
      setProducts(data.products)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      toast.error('Gagal memuat daftar produk')
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryId])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Gagal memuat kategori')
      const data = await res.json()
      setCategories(data.categories)
    } catch {
      toast.error('Gagal memuat kategori')
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async () => {
    if (!deletingProduct) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Gagal menghapus produk')
      toast.success(`Produk "${deletingProduct.name}" berhasil dihapus`)
      setDeleteDialogOpen(false)
      setDeletingProduct(null)
      fetchProducts()
    } catch {
      toast.error('Gagal menghapus produk')
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryId(value === 'all' ? '' : value)
    setPage(1)
  }

  const getFirstImage = (images: string) => {
    if (!images) return ''
    return images.split(',')[0] || ''
  }

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return 'destructive'
    if (stock <= 10) return 'secondary'
    return 'outline'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola semua produk toko Anda
          </p>
        </div>
        <Link href="/admin/products/add">
          <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2">
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama produk, slug, atau tag..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryId || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[70px]">Gambar</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead className="hidden md:table-cell">Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead className="hidden sm:table-cell">Harga Grosir</TableHead>
                <TableHead className="hidden lg:table-cell">Stok</TableHead>
                <TableHead className="hidden lg:table-cell">Terjual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-12 w-12 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-[50px]" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-[50px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[60px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                      <PackageOpen className="h-16 w-16" />
                      <div>
                        <p className="text-lg font-medium text-gray-600">
                          Belum ada produk
                        </p>
                        <p className="text-sm mt-1">
                          Mulai tambahkan produk pertama Anda
                        </p>
                      </div>
                      <Link href="/admin/products/add">
                        <Button
                          variant="outline"
                          className="mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Produk
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const firstImage = getFirstImage(product.images)
                  return (
                    <TableRow key={product.id} className="group">
                      <TableCell>
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                              <PackageOpen className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Min. {product.minOrder} pcs
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs font-normal">
                          {product.category?.name || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-emerald-900">
                          {formatRupiah(product.price)}
                        </p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className="text-sm text-emerald-700">
                          {formatRupiah(product.wholesalePrice)}
                        </p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={getStockBadgeVariant(product.stock)} className="text-xs">
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-gray-600">
                          {product.sold}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {product.featured && (
                            <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Featured
                            </Badge>
                          )}
                          {product.stock === 0 && (
                            <Badge variant="destructive" className="text-xs">
                              Habis
                            </Badge>
                          )}
                          {!product.featured && product.stock > 0 && (
                            <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200">
                              Aktif
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="cursor-pointer gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => openDeleteDialog(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              Menampilkan {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} dari{' '}
              {total} produk
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, current, and adjacent pages
                  if (totalPages <= 7) return true
                  if (p === 1 || p === totalPages) return true
                  if (Math.abs(p - page) <= 1) return true
                  return false
                })
                .map((p, i, arr) => {
                  const prev = arr[i - 1]
                  const showEllipsis = prev && p - prev > 1
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-1 text-gray-400 text-sm">...</span>
                      )}
                      <Button
                        variant={p === page ? 'default' : 'outline'}
                        size="icon"
                        className={cn(
                          'h-8 w-8 text-sm',
                          p === page && 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        )}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </span>
                  )
                })}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk{' '}
              <span className="font-semibold text-gray-900">
                &quot;{deletingProduct?.name}&quot;
              </span>
              ? Tindakan ini tidak dapat dibatalkan dan semua data produk akan
              dihapus secara permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
