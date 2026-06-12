'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
  Mail,
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
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  processing: {
    label: 'Diproses',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
  },
  shipped: {
    label: 'Dikirim',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
  },
  completed: {
    label: 'Selesai',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
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

function getFirstImage(imagesStr: string): string {
  try {
    const imgs = JSON.parse(imagesStr)
    return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : ''
  } catch {
    return imagesStr || ''
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola pesanan masuk toko Anda
        </p>
      </div>

      {/* Status Tabs */}
      <Tabs value={status} onValueChange={handleStatusTabChange}>
        <TabsList className="h-auto flex-wrap bg-gray-100 p-1">
          {STATUS_TABS.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm',
                'px-3 py-1.5'
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nomor pesanan atau nama..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9"
          />
        </div>
        <Button
          onClick={handleSearch}
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <Search className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Cari</span>
        </Button>
      </div>

      {/* Orders Count */}
      <p className="text-sm text-gray-500">
        {loading ? 'Memuat...' : `${total} pesanan ditemukan`}
      </p>

      {/* Order Cards */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
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
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-sm">
                {search || status
                  ? 'Pesanan tidak ditemukan'
                  : 'Belum ada pesanan'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const statusConfig = STATUS_CONFIG[order.status]
            const paymentConfig = PAYMENT_CONFIG[order.paymentStatus]
            return (
              <Card
                key={order.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-gray-50 border-b">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900 text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', statusConfig.color, statusConfig.bg)}
                      >
                        {statusConfig.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', paymentConfig.color, paymentConfig.bg)}
                      >
                        {paymentConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <span className="font-medium">{order.customerName}</span>
                      </div>
                      {order.customerPhone && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs">{order.customerPhone}</span>
                        </div>
                      )}
                      {order.customerAddr && (
                        <div className="hidden md:flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs truncate max-w-[200px]">
                            {order.customerAddr}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4 space-y-3 border-b">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                          {item.product.images ? (
                            <img
                              src={getFirstImage(item.product.images)}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingCart className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {item.size && <span>Ukuran: {item.size}</span>}
                            <span>{item.quantity}x {formatRupiah(item.price)}</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-lg font-bold text-emerald-800">
                        {formatRupiah(order.totalAmount)}
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        via {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusDialog(order)}
                        className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Update Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="text-gray-600 border-gray-200 hover:bg-gray-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
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
            className="border-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-gray-200"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status Pesanan</DialogTitle>
            <DialogDescription>
              Pesanan {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status Baru
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            key === 'pending' && 'bg-yellow-500',
                            key === 'confirmed' && 'bg-blue-500',
                            key === 'processing' && 'bg-purple-500',
                            key === 'shipped' && 'bg-orange-500',
                            key === 'completed' && 'bg-emerald-500',
                            key === 'cancelled' && 'bg-red-500'
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
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
