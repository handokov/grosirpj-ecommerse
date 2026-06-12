'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Loader2,
  Search,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  _count: { products: number }
}

interface CategoryForm {
  name: string
  description: string
  icon: string
  order: number
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<CategoryForm>({
    name: '',
    description: '',
    icon: '',
    order: 0,
  })

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Gagal memuat kategori')
      const data = await res.json()
      setCategories(data.categories)
    } catch {
      toast.error('Gagal memuat kategori')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openAddDialog = () => {
    setEditingCategory(null)
    setForm({ name: '', description: '', icon: '', order: 0 })
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      order: category.order,
    })
    setDialogOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nama kategori wajib diisi')
      return
    }

    setSaving(true)
    try {
      if (editingCategory) {
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Gagal mengupdate kategori')
        }
        toast.success('Kategori berhasil diperbarui')
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Gagal membuat kategori')
        }
        toast.success('Kategori berhasil ditambahkan')
      }
      setDialogOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menghapus kategori')
      }
      toast.success('Kategori berhasil dihapus')
      setDeleteDialogOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setDeleting(false)
    }
  }

  const filteredCategories = categories.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori Produk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola kategori produk toko Anda
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari kategori..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FolderOpen className="w-12 h-12 mb-3" />
              <p className="text-sm">
                {search ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden md:table-cell">Slug</TableHead>
                    <TableHead className="text-center">Jumlah Produk</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Urutan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category, index) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium text-gray-500">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {category.icon && (
                            <span className="text-lg">{category.icon}</span>
                          )}
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'gap-1',
                            category._count.products > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          )}
                        >
                          <Package className="w-3 h-3" />
                          {category._count.products}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        {category.order}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                            className="text-gray-500 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(category)}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Perbarui informasi kategori'
                : 'Isi data kategori baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nama Kategori *</Label>
              <Input
                id="cat-name"
                placeholder="Contoh: Baju Anak"
                value={form.name}
                onChange={e => {
                  setForm(prev => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }}
              />
              {form.name && (
                <p className="text-xs text-gray-500">
                  Slug: <code className="bg-gray-100 px-1 rounded">{generateSlug(form.name)}</code>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Deskripsi</Label>
              <Textarea
                id="cat-desc"
                placeholder="Deskripsi singkat kategori (opsional)"
                value={form.description}
                onChange={e =>
                  setForm(prev => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-icon">Ikon</Label>
              <Input
                id="cat-icon"
                placeholder="Contoh: 👕 atau nama ikon"
                value={form.icon}
                onChange={e =>
                  setForm(prev => ({ ...prev, icon: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-order">Urutan</Label>
              <Input
                id="cat-order"
                type="number"
                min={0}
                value={form.order}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori{' '}
              <span className="font-semibold text-gray-900">
                {deletingCategory?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
