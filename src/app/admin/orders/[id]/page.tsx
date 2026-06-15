'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  ShoppingCart,
  X,
  CreditCard,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatRupiah, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type OrderStatus, type PaymentStatus, type Order } from '@/types'
import { STATUS_CONFIG, PAYMENT_CONFIG, PAYMENT_METHOD_LABELS, getNextOrderStatus } from '@/lib/order-config'
import { OrderStatusTimeline } from '@/components/admin/orders/OrderStatusTimeline'
import { CustomerInfoCard } from '@/components/admin/orders/CustomerInfoCard'
import { OrderItemsTable } from '@/components/admin/orders/OrderItemsTable'
import { CancelOrderDialog } from '@/components/admin/orders/CancelOrderDialog'

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

  const nextStatus = order ? getNextOrderStatus(order.status) : null
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
      <OrderStatusTimeline currentStatus={order.status} />

      <div className="grid gap-5 md:grid-cols-2">
        {/* Customer Info */}
        <CustomerInfoCard order={order} />

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
      <OrderItemsTable items={order.items} totalAmount={order.totalAmount} />

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
      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        orderId={order.id}
        orderNumber={order.orderNumber}
        cancelling={cancelling}
        onConfirm={handleCancelOrder}
      />
    </div>
  )
}
