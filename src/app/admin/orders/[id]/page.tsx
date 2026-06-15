'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getFirstImageUrl } from '@/lib/image-utils'
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
  Store,
  ExternalLink,
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
  color: string
  bgColor: string
}[] = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { key: 'confirmed', label: 'Dikonfirmasi', icon: Check, color: 'text-sky-600', bgColor: 'bg-sky-50' },
  { key: 'processing', label: 'Diproses', icon: Package, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  { key: 'shipped', label: 'Dikirim', icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { key: 'completed', label: 'Selesai', icon: Check, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
]

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
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ShoppingCart className="w-10 h-10 mb-2" />
        <p className="text-xs">Pesanan tidak ditemukan</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-xs"
          onClick={() => router.push('/admin/orders')}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Kembali ke Daftar Pesanan
        </Button>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[order.status]
  const paymentConfig = PAYMENT_CONFIG[order.paymentStatus]
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status)

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/orders')}
          className="w-fit text-xs text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Kembali
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Detail Pesanan</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {order.orderNumber} • {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn('text-[11px] px-2.5 py-0.5', statusConfig.color, statusConfig.bg)}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Status Timeline / Stepper */}
      {!isCancelled && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              Status Pesanan
            </h3>
            <div className="relative">
              {/* Progress bar behind the steps */}
              <div className="absolute top-4 left-0 right-0 px-8">
                <div className="h-0.5 bg-gray-200 rounded-full">
                  <div
                    className="h-0.5 bg-emerald-500 rounded-full transition-all duration-500"
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
              <div className="relative flex items-center justify-between">
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon
                  const isStepCompleted =
                    currentStepIndex > index || isCompleted
                  const isCurrent = currentStepIndex === index
                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors z-10',
                          isStepCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isCurrent
                              ? 'border-emerald-500 bg-white text-emerald-600'
                              : 'border-gray-200 bg-white text-gray-400'
                        )}
                      >
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={cn(
                          'text-[10px] mt-1.5 text-center',
                          isStepCompleted || isCurrent
                            ? 'text-emerald-700 font-semibold'
                            : 'text-gray-400'
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-0 shadow-sm border-red-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <X className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Pesanan Dibatalkan</h3>
                <p className="text-[11px] text-red-500">
                  Pesanan ini telah dibatalkan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Customer Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <CardTitle className="text-sm font-bold">Informasi Pelanggan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2.5">
            <div className="flex items-start gap-3">
              <span className="text-[11px] text-gray-400 w-20 shrink-0">Nama</span>
              <span className="text-xs font-medium text-gray-900">
                {order.customerName}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[11px] text-gray-400 w-20 shrink-0">Telepon</span>
              <span className="text-xs text-gray-800 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-gray-400" />
                {order.customerPhone}
              </span>
            </div>
            {order.customerEmail && (
              <div className="flex items-start gap-3">
                <span className="text-[11px] text-gray-400 w-20 shrink-0">Email</span>
                <span className="text-xs text-gray-800 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-gray-400" />
                  {order.customerEmail}
                </span>
              </div>
            )}
            {order.customerAddr && (
              <div className="flex items-start gap-3">
                <span className="text-[11px] text-gray-400 w-20 shrink-0">Alamat</span>
                <span className="text-xs text-gray-800 flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{order.customerAddr}</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <CardTitle className="text-sm font-bold">Informasi Pembayaran</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2.5">
            <div className="flex items-start gap-3">
              <span className="text-[11px] text-gray-400 w-20 shrink-0">Metode</span>
              <span className="text-xs font-medium text-gray-900 flex items-center gap-1.5">
                <CreditCard className="w-3 h-3 text-gray-400" />
                {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[11px] text-gray-400 w-20 shrink-0">Status</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn('text-[10px] px-2 py-0', paymentConfig.color, paymentConfig.bg)}
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
                      'h-6 text-[10px] px-2',
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
              <span className="text-[11px] text-gray-400 w-20 shrink-0">Total</span>
              <span className="text-base font-bold text-emerald-700">
                {formatRupiah(order.totalAmount)}
              </span>
            </div>
            {order.note && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <span className="text-[11px] text-gray-400 w-20 shrink-0">Catatan</span>
                  <span className="text-xs text-gray-600">{order.note}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <CardTitle className="text-sm font-bold">Item Pesanan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-[11px] h-9">Gambar</TableHead>
                  <TableHead className="text-[11px]">Produk</TableHead>
                  <TableHead className="text-[11px] text-center">Ukuran</TableHead>
                  <TableHead className="text-[11px] text-center">Jumlah</TableHead>
                  <TableHead className="text-[11px] text-right">Harga</TableHead>
                  <TableHead className="text-[11px] text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map(item => {
                  const hasSupplier = item.product.supplierName || item.product.supplierLink || item.product.supplierPhone
                  return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                        {item.product.images ? (
                          <img
                            src={getFirstImageUrl(item.product.images)}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900 text-xs">
                        {item.product.name}
                      </span>
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
                    </TableCell>
                    <TableCell className="text-center">
                      {item.size ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {item.size}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs text-gray-600">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right text-xs text-gray-600">
                      {formatRupiah(item.price)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold text-gray-900">
                      {formatRupiah(item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Total */}
          <div className="border-t px-5 py-3.5 flex items-center justify-end gap-5">
            <span className="text-xs text-gray-400">Total Pesanan</span>
            <span className="text-lg font-bold text-emerald-700">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isCancelled && !isCompleted && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelDialogOpen(true)}
              className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Batalkan Pesanan
            </Button>
            {nextStatus && (
              <Button
                size="sm"
                onClick={() => handleUpdateStatus(nextStatus)}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm shadow-emerald-200 h-8"
              >
                {updating ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
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
              size="sm"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelling}
              className="text-xs"
            >
              Kembali
            </Button>
            <Button
              size="sm"
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              {cancelling && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
