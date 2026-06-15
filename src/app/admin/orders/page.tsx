'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { getFirstImageUrl } from '@/lib/image-utils'
import {
  Search,
  ShoppingCart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Phone,
  MapPin,
  Download,
  Filter,
  Store,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
// Image helper - simple split by comma, matching products page approach

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  size: string | null
  price: number
  product: {
    name: string
    images: string
    supplierName: string | null
    supplierLink: string | null
    supplierPhone: string | null
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  customerAddr: string | null
  status: OrderStatus
  paymentMethod: string
  paymentStatus: PaymentStatus
  totalAmount: number
  note: string | null
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; dotColor: string }
> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    dotColor: 'bg-amber-400',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'text-sky-700',
    bg: 'bg-sky-50 border-sky-200',
    dotColor: 'bg-sky-400',
  },
  processing: {
    label: 'Diproses',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    dotColor: 'bg-purple-400',
  },
  shipped: {
    label: 'Dikirim',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    dotColor: 'bg-orange-400',
  },
  completed: {
    label: 'Selesai',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    dotColor: 'bg-emerald-400',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    dotColor: 'bg-red-400',
  },
}

const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bg: string }
> = {
  unpaid: {
    label: 'Belum Bayar',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
  },
  paid: {
    label: 'Sudah Bayar',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  refunded: {
    label: 'Dikembalikan',
    color: 'text-gray-700',
    bg: 'bg-gray-100 border-gray-200',
  },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  transfer: 'Transfer Bank',
  cod: 'COD (Bayar di Tempat)',
}

const STATUS_TABS = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function OrdersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [updating, setUpdating] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status,
        search,
      })
      const res = await fetch(`/api/admin/orders?${params}`)
      if (!res.ok) throw new Error('Gagal memuat pesanan')
      const data = await res.json()
      setOrders(data.orders)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      toast.error('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Sync status from URL params on mount
  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam) {
      setStatus(statusParam)
    }
  }, [searchParams])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleStatusTabChange = (value: string) => {
    setStatus(value)
    setPage(1)
  }

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mengupdate status')
      }
      toast.success('Status pesanan berhasil diperbarui')
      setStatusDialogOpen(false)
      fetchOrders()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola pesanan masuk toko Anda
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 border-gray-200 w-fit"
          onClick={() => {
            // Export orders as CSV
            const params = new URLSearchParams({ status, search, limit: '1000' })
            fetch(`/api/admin/orders?${params}`)
              .then(r => r.json())
              .then(data => {
                const orders = data.orders as Order[]
                if (!orders.length) { toast.error('Tidak ada pesanan untuk diexport'); return }
                const header = 'No Pesanan,Nama,No HP,Total,Status,Pembayaran,Tanggal'
                const rows = orders.map((o: Order) =>
                  `${o.orderNumber},${o.customerName},${o.customerPhone},${o.totalAmount},${o.status},${o.paymentStatus},${new Date(o.createdAt).toLocaleDateString('id-ID')}`
                )
                const csv = [header, ...rows].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `pesanan-grosirpj-${new Date().toISOString().slice(0, 10)}.csv`
                a.click()
                URL.revokeObjectURL(url)
                toast.success(`${orders.length} pesanan berhasil diexport`)
              })
              .catch(() => toast.error('Gagal mengexport pesanan'))
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Export Pesanan
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={status} onValueChange={handleStatusTabChange}>
        <TabsList className="h-auto bg-white border border-gray-200 p-0.5 rounded-xl shadow-sm flex-wrap">
          {STATUS_TABS.map(tab => {
            const statusConf = STATUS_CONFIG[tab.value as OrderStatus]
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'text-xs px-3 py-2 rounded-lg font-medium',
                  tab.value
                    ? 'data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900'
                    : 'data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm',
                  'text-gray-600'
                )}
              >
                {statusConf && (
                  <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', statusConf.dotColor)} />
                )}
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Search */}
      <Card className="p-3 border-0 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Cari nomor pesanan atau nama..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 text-xs h-9 bg-gray-50 border-gray-200"
            />
          </div>
          <Button
            onClick={handleSearch}
            variant="outline"
            size="sm"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs h-9"
          >
            <Search className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Cari</span>
          </Button>
        </div>
      </Card>

      {/* Orders Count */}
      <p className="text-[11px] text-gray-500 font-medium">
        {loading ? 'Memuat...' : `${total} pesanan ditemukan`}
      </p>

      {/* Order Cards */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-xs font-medium">
                {search || status
                  ? 'Pesanan tidak ditemukan'
                  : 'Belum ada pesanan'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const statusConfig = STATUS_CONFIG[order.status]
            const paymentConfig = PAYMENT_CONFIG[order.paymentStatus]
            return (
              <Card
                key={order.id}
                className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-[10px] text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-semibold gap-1', statusConfig.color, statusConfig.bg)}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dotColor)} />
                        {statusConfig.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-semibold', paymentConfig.color, paymentConfig.bg)}
                      >
                        {paymentConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer + Items row */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3 text-xs mb-3">
                      <span className="font-semibold text-gray-900">{order.customerName}</span>
                      {order.customerPhone && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span className="text-[10px]">{order.customerPhone}</span>
                        </div>
                      )}
                      {order.customerAddr && (
                        <div className="hidden md:flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] truncate max-w-[200px]">
                            {order.customerAddr}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map(item => {
                        const hasSupplier = item.product.supplierName || item.product.supplierLink || item.product.supplierPhone
                        return (
                          <div key={item.id} className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-100 flex-shrink-0 overflow-hidden">
                              {item.product.images ? (
                                <img
                                  src={getFirstImageUrl(item.product.images)}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <ShoppingCart className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {item.product.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                {item.size && <span>Ukuran: {item.size}</span>}
                                <span>{item.quantity}x {formatRupiah(item.price)}</span>
                              </div>
                              {/* Supplier Info - only visible in seller dashboard */}
                              {hasSupplier && (
                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  {item.product.supplierName && (
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-teal-50 text-teal-700 border-teal-200 font-medium gap-0.5">
                                      <Store className="w-2.5 h-2.5" />
                                      {item.product.supplierName}
                                    </Badge>
                                  )}
                                  {item.product.supplierLink && (
                                    <a
                                      href={item.product.supplierLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full border bg-blue-50 text-blue-600 border-blue-200 font-medium hover:bg-blue-100 transition-colors"
                                    >
                                      <ExternalLink className="w-2.5 h-2.5" />
                                      Link Toko
                                    </a>
                                  )}
                                  {item.product.supplierPhone && (
                                    <a
                                      href={`https://wa.me/${item.product.supplierPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200 font-medium hover:bg-emerald-100 transition-colors"
                                    >
                                      <Phone className="w-2.5 h-2.5" />
                                      {item.product.supplierPhone}
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-700 mt-0.5">
                              {formatRupiah(item.price * item.quantity)}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500 font-medium">Total Pesanan</span>
                      <span className="text-base font-bold text-emerald-800">
                        {formatRupiah(order.totalAmount)}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:inline">
                        via {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusDialog(order)}
                        className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[11px] h-8"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Update Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="text-gray-600 border-gray-200 hover:bg-gray-50 text-[11px] h-8"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-gray-200 text-xs h-8"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs text-gray-600 font-medium">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-gray-200 text-xs h-8"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Update Status Pesanan</DialogTitle>
            <DialogDescription className="text-sm">
              Pesanan {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                Status Baru
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2 text-xs">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            config.dotColor
                          )}
                        />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={updating}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              {updating && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-sm text-gray-500">Memuat pesanan...</span>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  )
}
