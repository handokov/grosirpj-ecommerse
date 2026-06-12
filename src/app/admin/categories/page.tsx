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
  GripVertical,
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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kategori Produk</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola kategori produk toko Anda
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm shadow-emerald-200 w-fit"
          size="sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Tambah Kategori
        </Button>
      </div>

      {/* Search */}
      <Card className="p-3 border-0 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Cari kategori..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-gray-50 border-gray-200"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
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
            <p className="text-xs font-medium">
              {search ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-gray-100">
                  <TableHead className="w-12 text-[11px] font-semibold text-gray-500 uppercase">No</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 uppercase">Nama</TableHead>
                  <TableHead className="hidden md:table-cell text-[11px] font-semibold text-gray-500 uppercase">Slug</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold text-gray-500 uppercase">Produk</TableHead>
                  <TableHead className="text-center hidden sm:table-cell text-[11px] font-semibold text-gray-500 uppercase">Urutan</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-gray-500 uppercase">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category, index) => (
                  <TableRow key={category.id} className="hover:bg-gray-50/50 border-gray-50">
                    <TableCell className="font-medium text-gray-400 text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {category.icon && (
                          <span className="text-base">{category.icon}</span>
                        )}
                        <span className="text-xs font-semibold text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'gap-1 text-[10px] font-bold',
                          category._count.products > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <Package className="w-3 h-3" />
                        {category._count.products}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell text-xs text-gray-500">
                      {category.order}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                          className="text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 h-7 w-7 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(category)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingCategory
                ? 'Perbarui informasi kategori'
                : 'Isi data kategori baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name" className="text-xs font-semibold">Nama Kategori *</Label>
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
                className="text-xs h-9"
              />
              {form.name && (
                <p className="text-[10px] text-gray-500">
                  Slug: <code className="bg-gray-100 px-1 rounded">{generateSlug(form.name)}</code>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc" className="text-xs font-semibold">Deskripsi</Label>
              <Textarea
                id="cat-desc"
                placeholder="Deskripsi singkat kategori (opsional)"
                value={form.description}
                onChange={e =>
                  setForm(prev => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-icon" className="text-xs font-semibold">Ikon</Label>
                <Input
                  id="cat-icon"
                  placeholder="👕"
                  value={form.icon}
                  onChange={e =>
                    setForm(prev => ({ ...prev, icon: e.target.value }))
                  }
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-order" className="text-xs font-semibold">Urutan</Label>
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
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Hapus Kategori</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Apakah Anda yakin ingin menghapus kategori{' '}
              <span className="font-semibold text-gray-900">
                {deletingCategory?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              {deleting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
