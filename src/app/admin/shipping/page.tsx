'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
  Package,
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'

// ===== Types =====

interface ShippingZone {
  id: string
  code: string
  name: string
  provinces: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
  _count?: { rates: number }
  rates?: ShippingRate[]
}

interface ShippingRate {
  id: string
  zoneId: string
  courier: string
  service: string
  serviceLabel: string
  firstKg: number
  nextKg: number
  etd: string
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
  zone?: { name: string; code: string }
}

// ===== Courier Options =====

const COURIER_OPTIONS = [
  { value: 'jne', label: 'JNE' },
  { value: 'jnt', label: 'J&T' },
  { value: 'sicepat', label: 'SiCepat' },
  { value: 'anteraja', label: 'AnterAja' },
  { value: 'ninja', label: 'Ninja Xpress' },
  { value: 'pos', label: 'POS Indonesia' },
  { value: 'tiki', label: 'TIKI' },
  { value: 'wahana', label: 'Wahana' },
  { value: 'lion', label: 'Lion Parcel' },
  { value: 'sap', label: 'SAP Express' },
] as const

function getCourierLabel(value: string): string {
  return COURIER_OPTIONS.find(c => c.value === value)?.label ?? value
}

// ===== Zone Form Interface =====

interface ZoneForm {
  code: string
  name: string
  provinces: string
  order: number
  active: boolean
}

interface RateForm {
  zoneId: string
  courier: string
  service: string
  serviceLabel: string
  firstKg: number
  nextKg: number
  etd: string
  active: boolean
  order: number
}

const defaultZoneForm: ZoneForm = {
  code: '',
  name: '',
  provinces: '',
  order: 0,
  active: true,
}

const defaultRateForm: RateForm = {
  zoneId: '',
  courier: '',
  service: '',
  serviceLabel: '',
  firstKg: 0,
  nextKg: 0,
  etd: '-',
  active: true,
  order: 0,
}

// ===== Main Component =====

export default function ShippingManagementPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState('zones')

  // Zone state
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [zonesLoading, setZonesLoading] = useState(true)
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set())
  const [zoneSearch, setZoneSearch] = useState('')
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [zoneForm, setZoneForm] = useState<ZoneForm>(defaultZoneForm)
  const [savingZone, setSavingZone] = useState(false)
  const [deleteZoneDialogOpen, setDeleteZoneDialogOpen] = useState(false)
  const [deletingZone, setDeletingZone] = useState<ShippingZone | null>(null)
  const [deletingZoneLoading, setDeletingZoneLoading] = useState(false)
  const [zoneRatesLoading, setZoneRatesLoading] = useState<Set<string>>(new Set())

  // Seed state
  const [seeding, setSeeding] = useState(false)

  // Rate state
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [ratesLoading, setRatesLoading] = useState(true)
  const [rateSearch, setRateSearch] = useState('')
  const [rateZoneFilter, setRateZoneFilter] = useState<string>('all')
  const [rateDialogOpen, setRateDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null)
  const [rateForm, setRateForm] = useState<RateForm>(defaultRateForm)
  const [savingRate, setSavingRate] = useState(false)
  const [deleteRateDialogOpen, setDeleteRateDialogOpen] = useState(false)
  const [deletingRate, setDeletingRate] = useState<ShippingRate | null>(null)
  const [deletingRateLoading, setDeletingRateLoading] = useState(false)

  // ===== Fetch Zones =====
  const fetchZones = useCallback(async () => {
    try {
      setZonesLoading(true)
      const res = await fetch('/api/admin/shipping/zones')
      if (!res.ok) throw new Error('Gagal memuat zona')
      const data = await res.json()
      setZones(data.zones)
    } catch {
      toast.error('Gagal memuat zona pengiriman')
    } finally {
      setZonesLoading(false)
    }
  }, [])

  // ===== Fetch Rates =====
  const fetchRates = useCallback(async () => {
    try {
      setRatesLoading(true)
      const params = new URLSearchParams()
      if (rateZoneFilter && rateZoneFilter !== 'all') {
        params.set('zoneId', rateZoneFilter)
      }
      const res = await fetch(`/api/admin/shipping/rates?${params.toString()}`)
      if (!res.ok) throw new Error('Gagal memuat tarif')
      const data = await res.json()
      setRates(data.rates)
    } catch {
      toast.error('Gagal memuat tarif pengiriman')
    } finally {
      setRatesLoading(false)
    }
  }, [rateZoneFilter])

  // ===== Seed Default Data =====
  const handleSeedShipping = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/shipping/seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal seed data')
      toast.success(`Berhasil! ${data.summary.zonesCreated} zona & ${data.summary.ratesCreated} tarif ongkir dibuat.`)
      fetchZones()
      fetchRates()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal seed data ongkir')
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  useEffect(() => {
    if (activeTab === 'rates') {
      fetchRates()
    }
  }, [activeTab, fetchRates])

  // ===== Zone Expand / Collapse =====
  const toggleZoneExpand = async (zoneId: string) => {
    const newExpanded = new Set(expandedZones)
    if (newExpanded.has(zoneId)) {
      newExpanded.delete(zoneId)
      setExpandedZones(newExpanded)
      return
    }
    newExpanded.add(zoneId)
    setExpandedZones(newExpanded)

    // Fetch zone rates if not already loaded
    const zone = zones.find(z => z.id === zoneId)
    if (zone && !zone.rates) {
      try {
        setZoneRatesLoading(prev => new Set(prev).add(zoneId))
        const res = await fetch(`/api/admin/shipping/zones/${zoneId}`)
        if (!res.ok) throw new Error('Gagal memuat tarif zona')
        const data = await res.json()
        setZones(prev =>
          prev.map(z => (z.id === zoneId ? { ...z, rates: data.zone.rates } : z))
        )
      } catch {
        toast.error('Gagal memuat tarif zona')
      } finally {
        setZoneRatesLoading(prev => {
          const next = new Set(prev)
          next.delete(zoneId)
          return next
        })
      }
    }
  }

  // ===== Zone Dialog Handlers =====
  const openAddZoneDialog = () => {
    setEditingZone(null)
    setZoneForm(defaultZoneForm)
    setZoneDialogOpen(true)
  }

  const openEditZoneDialog = (zone: ShippingZone) => {
    setEditingZone(zone)
    setZoneForm({
      code: zone.code,
      name: zone.name,
      provinces: zone.provinces,
      order: zone.order,
      active: zone.active,
    })
    setZoneDialogOpen(true)
  }

  const handleSaveZone = async () => {
    if (!zoneForm.code.trim()) {
      toast.error('Kode zona wajib diisi')
      return
    }
    if (!zoneForm.name.trim()) {
      toast.error('Nama zona wajib diisi')
      return
    }
    if (!zoneForm.provinces.trim()) {
      toast.error('Provinsi wajib diisi')
      return
    }

    setSavingZone(true)
    try {
      if (editingZone) {
        const res = await fetch(`/api/admin/shipping/zones/${editingZone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(zoneForm),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Gagal mengupdate zona')
        }
        toast.success('Zona berhasil diperbarui')
      } else {
        const res = await fetch('/api/admin/shipping/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(zoneForm),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Gagal membuat zona')
        }
        toast.success('Zona berhasil ditambahkan')
      }
      setZoneDialogOpen(false)
      fetchZones()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSavingZone(false)
    }
  }

  const openDeleteZoneDialog = (zone: ShippingZone) => {
    setDeletingZone(zone)
    setDeleteZoneDialogOpen(true)
  }

  const handleDeleteZone = async () => {
    if (!deletingZone) return
    setDeletingZoneLoading(true)
    try {
      const res = await fetch(`/api/admin/shipping/zones/${deletingZone.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menghapus zona')
      }
      toast.success('Zona berhasil dihapus')
      setDeleteZoneDialogOpen(false)
      setExpandedZones(prev => {
        const next = new Set(prev)
        next.delete(deletingZone.id)
        return next
      })
      fetchZones()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setDeletingZoneLoading(false)
    }
  }

  // ===== Rate Dialog Handlers =====
  const openAddRateDialog = (preSelectedZoneId?: string) => {
    setEditingRate(null)
    setRateForm({
      ...defaultRateForm,
      zoneId: preSelectedZoneId || '',
    })
    setRateDialogOpen(true)
  }

  const openEditRateDialog = (rate: ShippingRate) => {
    setEditingRate(rate)
    setRateForm({
      zoneId: rate.zoneId,
      courier: rate.courier,
      service: rate.service,
      serviceLabel: rate.serviceLabel,
      firstKg: rate.firstKg,
      nextKg: rate.nextKg,
      etd: rate.etd,
      active: rate.active,
      order: rate.order,
    })
    setRateDialogOpen(true)
  }

  const handleSaveRate = async () => {
    if (!rateForm.zoneId) {
      toast.error('Zona wajib dipilih')
      return
    }
    if (!rateForm.courier) {
      toast.error('Kurir wajib dipilih')
      return
    }
    if (!rateForm.service.trim()) {
      toast.error('Layanan wajib diisi')
      return
    }
    if (!rateForm.serviceLabel.trim()) {
      toast.error('Label layanan wajib diisi')
      return
    }

    setSavingRate(true)
    try {
      if (editingRate) {
        const res = await fetch(`/api/admin/shipping/rates/${editingRate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rateForm),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Gagal mengupdate tarif')
        }
        toast.success('Tarif berhasil diperbarui')
      } else {
        const res = await fetch('/api/admin/shipping/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rateForm),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Gagal membuat tarif')
        }
        toast.success('Tarif berhasil ditambahkan')
      }
      setRateDialogOpen(false)
      fetchRates()
      // Also refresh zones to update rate counts
      fetchZones()
      // Refresh expanded zone rates
      for (const zoneId of expandedZones) {
        try {
          const res = await fetch(`/api/admin/shipping/zones/${zoneId}`)
          if (res.ok) {
            const data = await res.json()
            setZones(prev =>
              prev.map(z => (z.id === zoneId ? { ...z, rates: data.zone.rates } : z))
            )
          }
        } catch {
          // silent fail for refresh
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSavingRate(false)
    }
  }

  const openDeleteRateDialog = (rate: ShippingRate) => {
    setDeletingRate(rate)
    setDeleteRateDialogOpen(true)
  }

  const handleDeleteRate = async () => {
    if (!deletingRate) return
    setDeletingRateLoading(true)
    try {
      const res = await fetch(`/api/admin/shipping/rates/${deletingRate.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menghapus tarif')
      }
      toast.success('Tarif berhasil dihapus')
      setDeleteRateDialogOpen(false)
      fetchRates()
      fetchZones()
      // Refresh expanded zone rates
      for (const zoneId of expandedZones) {
        try {
          const res = await fetch(`/api/admin/shipping/zones/${zoneId}`)
          if (res.ok) {
            const data = await res.json()
            setZones(prev =>
              prev.map(z => (z.id === zoneId ? { ...z, rates: data.zone.rates } : z))
            )
          }
        } catch {
          // silent fail for refresh
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setDeletingRateLoading(false)
    }
  }

  // ===== Filtered Data =====
  const filteredZones = zones.filter(
    z =>
      z.name.toLowerCase().includes(zoneSearch.toLowerCase()) ||
      z.code.toLowerCase().includes(zoneSearch.toLowerCase()) ||
      z.provinces.toLowerCase().includes(zoneSearch.toLowerCase())
  )

  const filteredRates = rates.filter(
    r =>
      getCourierLabel(r.courier).toLowerCase().includes(rateSearch.toLowerCase()) ||
      r.serviceLabel.toLowerCase().includes(rateSearch.toLowerCase()) ||
      r.service.toLowerCase().includes(rateSearch.toLowerCase()) ||
      (r.zone?.name ?? '').toLowerCase().includes(rateSearch.toLowerCase())
  )

  // ===== Render =====
  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm shadow-emerald-200">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manajemen Ongkir</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Kelola zona pengiriman dan tarif ongkir
            </p>
          </div>
        </div>
        <Button
          onClick={handleSeedShipping}
          disabled={seeding}
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs"
          size="sm"
        >
          {seeding ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5 mr-1.5" />
          )}
          {seeding ? 'Menyemai data...' : 'Seed Data Ongkir'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100/80 p-1 h-auto">
          <TabsTrigger
            value="zones"
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 px-4 py-2"
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5" />
            Zona Pengiriman
          </TabsTrigger>
          <TabsTrigger
            value="rates"
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 px-4 py-2"
          >
            <Package className="w-3.5 h-3.5 mr-1.5" />
            Tarif Ongkir
          </TabsTrigger>
        </TabsList>

        {/* ==================== ZONES TAB ==================== */}
        <TabsContent value="zones" className="mt-4 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Cari zona..."
                value={zoneSearch}
                onChange={e => setZoneSearch(e.target.value)}
                className="pl-9 text-xs h-9 bg-white border-gray-200"
              />
            </div>
            <Button
              onClick={() => openAddZoneDialog()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm shadow-emerald-200 w-fit"
              size="sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Tambah Zona
            </Button>
          </div>

          {/* Zones List */}
          {zonesLoading ? (
            <Card className="border-0 shadow-sm p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </Card>
          ) : filteredZones.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MapPin className="w-12 h-12 mb-3" />
                <p className="text-xs font-medium">
                  {zoneSearch ? 'Zona tidak ditemukan' : 'Belum ada zona pengiriman'}
                </p>
                {!zoneSearch && (
                  <p className="text-[10px] text-gray-300 mt-1">
                    Klik &quot;Tambah Zona&quot; untuk membuat zona baru
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredZones.map(zone => {
                const isExpanded = expandedZones.has(zone.id)
                const isLoadingRates = zoneRatesLoading.has(zone.id)

                return (
                  <Card key={zone.id} className="border-0 shadow-sm overflow-hidden">
                    {/* Zone Header Row */}
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => toggleZoneExpand(zone.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-900">
                            {zone.name}
                          </span>
                          <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                            {zone.code}
                          </code>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[10px] font-bold gap-0.5',
                              zone.active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-400'
                            )}
                          >
                            {zone.active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {zone.provinces}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-bold bg-gray-100 text-gray-600 gap-0.5"
                        >
                          <Package className="w-3 h-3" />
                          {zone._count?.rates ?? 0} tarif
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-gray-50 text-gray-400"
                        >
                          Urutan: {zone.order}
                        </Badge>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditZoneDialog(zone)}
                          className="text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 h-7 w-7 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteZoneDialog(zone)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded: Zone Rates */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/30">
                        {isLoadingRates ? (
                          <div className="p-4 space-y-2">
                            {Array.from({ length: 2 }).map((_, i) => (
                              <Skeleton key={i} className="h-8 w-full" />
                            ))}
                          </div>
                        ) : zone.rates && zone.rates.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-100">
                                  <TableHead className="text-[10px] font-semibold text-gray-400 uppercase py-2">Kurir</TableHead>
                                  <TableHead className="text-[10px] font-semibold text-gray-400 uppercase py-2">Layanan</TableHead>
                                  <TableHead className="text-[10px] font-semibold text-gray-400 uppercase py-2">First Kg</TableHead>
                                  <TableHead className="text-[10px] font-semibold text-gray-400 uppercase py-2">Next Kg</TableHead>
                                  <TableHead className="text-[10px] font-semibold text-gray-400 uppercase py-2">ETD</TableHead>
                                  <TableHead className="text-[10px] font-semibold text-gray-400 uppercase py-2">Status</TableHead>
                                  <TableHead className="text-right text-[10px] font-semibold text-gray-400 uppercase py-2">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {zone.rates.map(rate => (
                                  <TableRow key={rate.id} className="hover:bg-white/60 border-gray-100/50">
                                    <TableCell className="text-xs font-medium text-gray-700 py-2">
                                      {getCourierLabel(rate.courier)}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <div>
                                        <span className="text-xs font-medium text-gray-700">
                                          {rate.serviceLabel}
                                        </span>
                                        <span className="text-[10px] text-gray-400 ml-1">
                                          ({rate.service})
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-700 py-2">
                                      {formatRupiah(rate.firstKg)}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-700 py-2">
                                      {formatRupiah(rate.nextKg)}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500 py-2">
                                      {rate.etd}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <Badge
                                        variant="secondary"
                                        className={cn(
                                          'text-[10px] font-bold',
                                          rate.active
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-gray-100 text-gray-400'
                                        )}
                                      >
                                        {rate.active ? 'Aktif' : 'Nonaktif'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right py-2">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openEditRateDialog(rate)}
                                          className="text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 h-6 w-6 p-0"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openDeleteRateDialog(rate)}
                                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-6 w-6 p-0"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <Info className="w-8 h-8 mb-2 text-gray-300" />
                            <p className="text-[11px] font-medium">Belum ada tarif untuk zona ini</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAddRateDialog(zone.id)}
                              className="text-[11px] text-emerald-600 hover:text-emerald-700 mt-1 h-7"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Tambah Tarif
                            </Button>
                          </div>
                        )}
                        {zone.rates && zone.rates.length > 0 && (
                          <div className="px-4 py-2 border-t border-gray-100/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAddRateDialog(zone.id)}
                              className="text-[11px] text-emerald-600 hover:text-emerald-700 h-7"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Tambah Tarif ke Zona Ini
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}

          {/* Info Card */}
          <Card className="border-0 shadow-sm bg-emerald-50/50">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] text-emerald-700 leading-relaxed">
                <p className="font-semibold mb-0.5">Tips Zona Pengiriman</p>
                <p>
                  Klik zona untuk melihat tarif ongkir. Provinsi diisi dengan nama provinsi yang dipisahkan koma (contoh: DKI Jakarta, Jawa Barat, Banten). Menghapus zona akan otomatis menghapus semua tarif di dalamnya.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== RATES TAB ==================== */}
        <TabsContent value="rates" className="mt-4 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  placeholder="Cari tarif..."
                  value={rateSearch}
                  onChange={e => setRateSearch(e.target.value)}
                  className="pl-9 text-xs h-9 bg-white border-gray-200"
                />
              </div>
              <Select
                value={rateZoneFilter}
                onValueChange={setRateZoneFilter}
              >
                <SelectTrigger className="w-[180px] text-xs h-9 bg-white border-gray-200">
                  <SelectValue placeholder="Semua Zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Semua Zona</SelectItem>
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs">
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => openAddRateDialog()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm shadow-emerald-200 w-fit"
              size="sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Tambah Tarif
            </Button>
          </div>

          {/* Rates Table */}
          <Card className="border-0 shadow-sm overflow-hidden">
            {ratesLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : filteredRates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Package className="w-12 h-12 mb-3" />
                <p className="text-xs font-medium">
                  {rateSearch || rateZoneFilter !== 'all'
                    ? 'Tarif tidak ditemukan'
                    : 'Belum ada tarif pengiriman'}
                </p>
                {!rateSearch && rateZoneFilter === 'all' && (
                  <p className="text-[10px] text-gray-300 mt-1">
                    Klik &quot;Tambah Tarif&quot; untuk membuat tarif baru
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-gray-100">
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase">Zona</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase">Kurir</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase">Layanan</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase">First Kg</TableHead>
                      <TableHead className="hidden sm:table-cell text-[11px] font-semibold text-gray-500 uppercase">Next Kg</TableHead>
                      <TableHead className="hidden md:table-cell text-[11px] font-semibold text-gray-500 uppercase">ETD</TableHead>
                      <TableHead className="text-center text-[11px] font-semibold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="hidden lg:table-cell text-center text-[11px] font-semibold text-gray-500 uppercase">Urutan</TableHead>
                      <TableHead className="text-right text-[11px] font-semibold text-gray-500 uppercase">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRates.map(rate => (
                      <TableRow key={rate.id} className="hover:bg-gray-50/50 border-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate max-w-[120px]">
                              {rate.zone?.name ?? '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-gray-700">
                          {getCourierLabel(rate.courier)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-xs font-medium text-gray-700">
                              {rate.serviceLabel}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-1">
                              ({rate.service})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 font-medium">
                          {formatRupiah(rate.firstKg)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-gray-700">
                          {formatRupiah(rate.nextKg)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-gray-500">
                          {rate.etd}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[10px] font-bold',
                              rate.active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-400'
                            )}
                          >
                            {rate.active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-center text-xs text-gray-500">
                          {rate.order}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditRateDialog(rate)}
                              className="text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 h-7 w-7 p-0"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteRateDialog(rate)}
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

          {/* Info Card */}
          <Card className="border-0 shadow-sm bg-emerald-50/50">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] text-emerald-700 leading-relaxed">
                <p className="font-semibold mb-0.5">Tips Tarif Ongkir</p>
                <p>
                  First Kg adalah biaya untuk kilogram pertama. Next Kg adalah biaya per kilogram berikutnya. Gunakan filter zona untuk melihat tarif per zona tertentu. ETD (Estimated Time of Delivery) adalah estimasi waktu pengiriman.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== ZONE DIALOG ==================== */}
      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingZone ? 'Edit Zona Pengiriman' : 'Tambah Zona Pengiriman'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingZone
                ? 'Perbarui informasi zona pengiriman'
                : 'Isi data zona pengiriman baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone-code" className="text-xs font-semibold">
                  Kode Zona *
                </Label>
                <Input
                  id="zone-code"
                  placeholder="Contoh: JABODETABEK"
                  value={zoneForm.code}
                  onChange={e =>
                    setZoneForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  className="text-xs h-9 uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone-name" className="text-xs font-semibold">
                  Nama Zona *
                </Label>
                <Input
                  id="zone-name"
                  placeholder="Contoh: Jabodetabek"
                  value={zoneForm.name}
                  onChange={e =>
                    setZoneForm(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="text-xs h-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-provinces" className="text-xs font-semibold">
                Provinsi *
              </Label>
              <Input
                id="zone-provinces"
                placeholder="Pisahkan dengan koma: DKI Jakarta, Jawa Barat, Banten"
                value={zoneForm.provinces}
                onChange={e =>
                  setZoneForm(prev => ({ ...prev, provinces: e.target.value }))
                }
                className="text-xs h-9"
              />
              <p className="text-[10px] text-gray-400">
                Pisahkan nama provinsi dengan koma
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone-order" className="text-xs font-semibold">
                  Urutan
                </Label>
                <Input
                  id="zone-order"
                  type="number"
                  min={0}
                  value={zoneForm.order}
                  onChange={e =>
                    setZoneForm(prev => ({
                      ...prev,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Status</Label>
                <div className="flex items-center gap-3 h-9">
                  <Switch
                    checked={zoneForm.active}
                    onCheckedChange={checked =>
                      setZoneForm(prev => ({ ...prev, active: checked }))
                    }
                  />
                  <span className={cn(
                    'text-xs font-medium',
                    zoneForm.active ? 'text-emerald-700' : 'text-gray-400'
                  )}>
                    {zoneForm.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setZoneDialogOpen(false)}
              disabled={savingZone}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveZone}
              disabled={savingZone}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              {savingZone && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {editingZone ? 'Simpan Perubahan' : 'Tambah Zona'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== RATE DIALOG ==================== */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingRate ? 'Edit Tarif Ongkir' : 'Tambah Tarif Ongkir'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingRate
                ? 'Perbarui informasi tarif pengiriman'
                : 'Isi data tarif pengiriman baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {/* Zone Select */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Zona *</Label>
              <Select
                value={rateForm.zoneId}
                onValueChange={value =>
                  setRateForm(prev => ({ ...prev, zoneId: value }))
                }
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Pilih zona" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id} className="text-xs">
                      {zone.name} ({zone.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Courier & Service */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Kurir *</Label>
                <Select
                  value={rateForm.courier}
                  onValueChange={value =>
                    setRateForm(prev => ({ ...prev, courier: value }))
                  }
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Pilih kurir" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURIER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-service" className="text-xs font-semibold">
                  Kode Layanan *
                </Label>
                <Input
                  id="rate-service"
                  placeholder="Contoh: REG, YES, ECO"
                  value={rateForm.service}
                  onChange={e =>
                    setRateForm(prev => ({
                      ...prev,
                      service: e.target.value.toUpperCase(),
                    }))
                  }
                  className="text-xs h-9 uppercase"
                />
              </div>
            </div>

            {/* Service Label */}
            <div className="space-y-2">
              <Label htmlFor="rate-service-label" className="text-xs font-semibold">
                Label Layanan *
              </Label>
              <Input
                id="rate-service-label"
                placeholder="Contoh: JNE Reguler, JNE YES"
                value={rateForm.serviceLabel}
                onChange={e =>
                  setRateForm(prev => ({ ...prev, serviceLabel: e.target.value }))
                }
                className="text-xs h-9"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate-first-kg" className="text-xs font-semibold">
                  First Kg (Rp) *
                </Label>
                <Input
                  id="rate-first-kg"
                  type="number"
                  min={0}
                  value={rateForm.firstKg}
                  onChange={e =>
                    setRateForm(prev => ({
                      ...prev,
                      firstKg: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="text-xs h-9"
                />
                <p className="text-[10px] text-gray-400">
                  Biaya untuk kg pertama
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-next-kg" className="text-xs font-semibold">
                  Next Kg (Rp) *
                </Label>
                <Input
                  id="rate-next-kg"
                  type="number"
                  min={0}
                  value={rateForm.nextKg}
                  onChange={e =>
                    setRateForm(prev => ({
                      ...prev,
                      nextKg: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="text-xs h-9"
                />
                <p className="text-[10px] text-gray-400">
                  Biaya per kg berikutnya
                </p>
              </div>
            </div>

            {/* ETD & Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate-etd" className="text-xs font-semibold">
                  ETD
                </Label>
                <Input
                  id="rate-etd"
                  placeholder="Contoh: 2-3 hari"
                  value={rateForm.etd}
                  onChange={e =>
                    setRateForm(prev => ({ ...prev, etd: e.target.value }))
                  }
                  className="text-xs h-9"
                />
                <p className="text-[10px] text-gray-400">
                  Estimasi waktu pengiriman
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-order" className="text-xs font-semibold">
                  Urutan
                </Label>
                <Input
                  id="rate-order"
                  type="number"
                  min={0}
                  value={rateForm.order}
                  onChange={e =>
                    setRateForm(prev => ({
                      ...prev,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Active Switch */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Status</Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={rateForm.active}
                  onCheckedChange={checked =>
                    setRateForm(prev => ({ ...prev, active: checked }))
                  }
                />
                <span className={cn(
                  'text-xs font-medium',
                  rateForm.active ? 'text-emerald-700' : 'text-gray-400'
                )}>
                  {rateForm.active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRateDialogOpen(false)}
              disabled={savingRate}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveRate}
              disabled={savingRate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              {savingRate && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {editingRate ? 'Simpan Perubahan' : 'Tambah Tarif'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DELETE ZONE DIALOG ==================== */}
      <AlertDialog open={deleteZoneDialogOpen} onOpenChange={setDeleteZoneDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Hapus Zona Pengiriman</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Apakah Anda yakin ingin menghapus zona{' '}
              <span className="font-semibold text-gray-900">
                {deletingZone?.name}
              </span>
              ? Semua tarif ongkir di zona ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingZoneLoading} className="text-xs">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteZone}
              disabled={deletingZoneLoading}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              {deletingZoneLoading && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ==================== DELETE RATE DIALOG ==================== */}
      <AlertDialog open={deleteRateDialogOpen} onOpenChange={setDeleteRateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Hapus Tarif Ongkir</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Apakah Anda yakin ingin menghapus tarif{' '}
              <span className="font-semibold text-gray-900">
                {deletingRate?.serviceLabel}
              </span>{' '}
              ({getCourierLabel(deletingRate?.courier ?? '')})? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingRateLoading} className="text-xs">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRate}
              disabled={deletingRateLoading}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              {deletingRateLoading && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
