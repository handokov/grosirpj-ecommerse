'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  Check,
  X,
  Clock,
  Package,
  Truck,
  CreditCard,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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

const STATUS_STEPS: {
  key: OrderStatus
  label: string
  icon: React.ElementType
}[] = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Dikonfirmasi', icon: Check },
  { key: 'processing', label: 'Diproses', icon: Package },
  { key: 'shipped', label: 'Dikirim', icon: Truck },
  { key: 'completed', label: 'Selesai', icon: Check },
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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/orders/${orderId}`)
      if (!res.ok) throw new Error('Pesanan tidak ditemukan')
      const data = await res.json()
      setOrder(data.order)
    } catch {
      toast.error('Gagal memuat detail pesanan')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mengupdate status')
      }
      toast.success('Status pesanan berhasil diperbarui')
      fetchOrder()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setUpdating(false)
    }
  }

  const handleTogglePayment = async () => {
    if (!order) return
    const newPaymentStatus: PaymentStatus =
      order.paymentStatus === 'paid' ? 'unpaid' : 'paid'
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mengupdate status pembayaran')
      }
      toast.success(
        newPaymentStatus === 'paid'
          ? 'Pembayaran dikonfirmasi'
          : 'Status pembayaran diubah'
      )
      fetchOrder()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal membatalkan pesanan')
      }
      toast.success('Pesanan berhasil dibatalkan')
      setCancelDialogOpen(false)
      fetchOrder()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setCancelling(false)
    }
  }

  // Get next status in the flow
  const getNextStatus = (): OrderStatus | null => {
    if (!order) return null
    const flow: OrderStatus[] = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'completed',
    ]
    const currentIndex = flow.indexOf(order.status)
    if (currentIndex < 0 || currentIndex >= flow.length - 1) return null
    return flow[currentIndex + 1]
  }

  const nextStatus = getNextStatus()
  const isCancelled = order?.status === 'cancelled'
  const isCompleted = order?.status === 'completed'

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ShoppingCart className="w-12 h-12 mb-3" />
        <p className="text-sm">Pesanan tidak ditemukan</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/admin/orders')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Pesanan
        </Button>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[order.status]
  const paymentConfig = PAYMENT_CONFIG[order.paymentStatus]
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/orders')}
          className="w-fit border-gray-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {order.orderNumber} • {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn('text-sm px-3 py-1', statusConfig.color, statusConfig.bg)}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Status Timeline / Stepper */}
      {!isCancelled && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Status Pesanan
            </h3>
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted =
                  currentStepIndex >= index || isCompleted
                const isCurrent = currentStepIndex === index
                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isCurrent
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                            : 'border-gray-200 bg-white text-gray-400'
                      )}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-2 text-center',
                        isCompleted || isCurrent
                          ? 'text-emerald-700 font-medium'
                          : 'text-gray-400'
                      )}
                    >
                      {step.label}
                    </span>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'hidden sm:block absolute',
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
            {/* Progress bar connecting the steps */}
            <div className="relative mt-[-8px] mb-4">
              <div className="h-1 bg-gray-200 rounded-full mx-10">
                <div
                  className="h-1 bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      isCompleted
                        ? 100
                        : currentStepIndex >= 0
                          ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100
                          : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-red-800">Pesanan Dibatalkan</h3>
                <p className="text-sm text-red-600">
                  Pesanan ini telah dibatalkan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Informasi Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-24">Nama</span>
              <span className="text-sm font-medium text-gray-900">
                {order.customerName}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-24">Telepon</span>
              <span className="text-sm text-gray-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {order.customerPhone}
              </span>
            </div>
            {order.customerEmail && (
              <div className="flex items-start gap-3">
                <span className="text-sm text-gray-500 w-24">Email</span>
                <span className="text-sm text-gray-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {order.customerEmail}
                </span>
              </div>
            )}
            {order.customerAddr && (
              <div className="flex items-start gap-3">
                <span className="text-sm text-gray-500 w-24">Alamat</span>
                <span className="text-sm text-gray-900 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{order.customerAddr}</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Informasi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-24">Metode</span>
              <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-24">Status</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs', paymentConfig.color, paymentConfig.bg)}
                >
                  {paymentConfig.label}
                </Badge>
                {!isCancelled && order.paymentStatus !== 'refunded' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePayment}
                    disabled={updating}
                    className={cn(
                      'h-7 text-xs',
                      order.paymentStatus === 'unpaid'
                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        : 'border-red-200 text-red-600 hover:bg-red-50'
                    )}
                  >
                    {updating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : order.paymentStatus === 'unpaid' ? (
                      'Tandai Lunas'
                    ) : (
                      'Batalkan Pembayaran'
                    )}
                  </Button>
                )}
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-24">Total</span>
              <span className="text-lg font-bold text-emerald-800">
                {formatRupiah(order.totalAmount)}
              </span>
            </div>
            {order.note && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <span className="text-sm text-gray-500 w-24">Catatan</span>
                  <span className="text-sm text-gray-700">{order.note}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Item Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Gambar</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-center">Ukuran</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                        {item.product.images ? (
                          <img
                            src={getFirstImage(item.product.images)}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900 text-sm">
                        {item.product.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.size ? (
                        <Badge variant="secondary" className="text-xs">
                          {item.size}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-700">
                      {formatRupiah(item.price)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-gray-900">
                      {formatRupiah(item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Total */}
          <div className="border-t p-4 flex items-center justify-end gap-6">
            <span className="text-sm text-gray-500">Total Pesanan</span>
            <span className="text-xl font-bold text-emerald-800">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isCancelled && !isCompleted && (
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(true)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Batalkan Pesanan
            </Button>
            {nextStatus && (
              <Button
                onClick={() => handleUpdateStatus(nextStatus)}
                disabled={updating}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Ubah ke {STATUS_CONFIG[nextStatus].label}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Batalkan Pesanan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan pesanan{' '}
              <span className="font-semibold text-gray-900">
                {order.orderNumber}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelling}
            >
              Kembali
            </Button>
            <Button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
