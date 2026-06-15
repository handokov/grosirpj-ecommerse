'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  ImageIcon,
  Upload,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, CLOUDINARY_FOLDER_BANNERS } from '@/lib/store-config'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Banner {
  id: string
  title: string
  image: string
  link: string | null
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    image: '',
    link: '',
  })

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/banners')
      const data = await res.json()
      setBanners(data)
    } catch {
      toast.error('Gagal memuat banner')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Ukuran file maksimal 10MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', CLOUDINARY_FOLDER_BANNERS)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload gagal')
      const data = await res.json()
      setForm(prev => ({ ...prev, image: data.url }))
      toast.success('Gambar berhasil diupload')
    } catch {
      toast.error('Gagal upload gambar')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.image) {
      toast.error('Judul dan gambar wajib diisi')
      return
    }

    setSaving(true)
    try {
      const maxOrder = banners.length > 0
        ? Math.max(...banners.map(b => b.order))
        : -1

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          image: form.image,
          link: form.link || null,
          order: maxOrder + 1,
          active: true,
        }),
      })

      if (!res.ok) throw new Error('Gagal membuat banner')

      toast.success('Banner berhasil ditambahkan')
      setForm({ title: '', image: '', link: '' })
      setDialogOpen(false)
      fetchBanners()
    } catch {
      toast.error('Gagal membuat banner')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !banner.active }),
      })
      if (!res.ok) throw new Error('Gagal mengupdate banner')
      toast.success(banner.active ? 'Banner dinonaktifkan' : 'Banner diaktifkan')
      fetchBanners()
    } catch {
      toast.error('Gagal mengupdate banner')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus banner ini?')) return

    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus banner')
      toast.success('Banner berhasil dihapus')
      fetchBanners()
    } catch {
      toast.error('Gagal menghapus banner')
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const newBanners = [...banners]
    const temp = newBanners[index].order
    newBanners[index].order = newBanners[index - 1].order
    newBanners[index - 1].order = temp

    try {
      await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banners: newBanners.map(b => ({ id: b.id, order: b.order, active: b.active })),
        }),
      })
      fetchBanners()
    } catch {
      toast.error('Gagal mengubah urutan')
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return
    const newBanners = [...banners]
    const temp = newBanners[index].order
    newBanners[index].order = newBanners[index + 1].order
    newBanners[index + 1].order = temp

    try {
      await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banners: newBanners.map(b => ({ id: b.id, order: b.order, active: b.active })),
        }),
      })
      fetchBanners()
    } catch {
      toast.error('Gagal mengubah urutan')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Banner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola banner slider di halaman utama. Ukuran rekomendasi: <strong>800 × 600 px</strong> (4:3)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Banner Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Judul Banner <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="contoh: Promo Lebaran 2025"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Gambar Banner <span className="text-red-500">*</span>
                </label>
                {form.image ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 h-7 w-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-gray-50 p-8 cursor-pointer transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                      ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {uploading ? 'Mengupload...' : 'Klik untuk upload gambar'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG, WebP • Maks 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {/* Link */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Link (opsional)
                </label>
                <Input
                  placeholder="contoh: /bayi-0-12-bulan atau https://..."
                  value={form.link}
                  onChange={(e) => setForm(prev => ({ ...prev, link: e.target.value }))}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Biarkan kosong jika banner tidak perlu link
                </p>
              </div>

              {/* Save */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={handleSave}
                  disabled={saving || !form.title || !form.image}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banner list */}
      {banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Belum ada banner</p>
            <p className="text-sm text-gray-400 mt-1">
              Klik &quot;Tambah Banner&quot; untuk menambahkan banner slider
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, index) => (
            <Card key={banner.id} className={!banner.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1 pt-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Pindah ke atas"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400 rotate-180" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === banners.length - 1}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Pindah ke bawah"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Image */}
                  <div className="w-32 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{banner.title}</h3>
                      {!banner.active && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    {banner.link && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700">
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">{banner.link}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Urutan: {banner.order + 1}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.active}
                        onCheckedChange={() => handleToggleActive(banner)}
                      />
                      {banner.active ? (
                        <Eye className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info card */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">💡 Tips Banner</h3>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• Ukuran gambar rekomendasi: <strong>800 × 600 px</strong> (ratio 4:3)</li>
            <li>• Format terbaik: <strong>WebP</strong> (ukuran kecil, kualitas baik)</li>
            <li>• Gambar akan tampil sebagai slider di halaman utama</li>
            <li>• Gunakan link internal (contoh: /bayi-0-12-bulan) atau URL eksternal</li>
            <li>• Nonaktifkan banner daripada menghapus jika ingin sementara disembunyikan</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
