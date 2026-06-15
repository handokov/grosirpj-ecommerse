'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  Search,
  ShoppingCart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { type OrderStatus, type Order } from '@/types'
import { STATUS_CONFIG, STATUS_TABS } from '@/lib/order-config'
import { OrderCard } from '@/components/admin/orders/OrderCard'
import { StatusUpdateDialog } from '@/components/admin/orders/StatusUpdateDialog'

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
    setStatusDialogOpen(true)
  }

  const handleExport = () => {
    const params = new URLSearchParams({ status, search, limit: '1000' })
    fetch(`/api/admin/orders?${params}`)
      .then(r => r.json())
      .then(data => {
        const exportOrders = data.orders as Order[]
        if (!exportOrders.length) { toast.error('Tidak ada pesanan untuk diexport'); return }
        const header = 'No Pesanan,Nama,No HP,Total,Status,Pembayaran,Tanggal'
        const rows = exportOrders.map((o: Order) =>
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
        toast.success(`${exportOrders.length} pesanan berhasil diexport`)
      })
      .catch(() => toast.error('Gagal mengexport pesanan'))
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
          onClick={handleExport}
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
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={openStatusDialog}
              onViewDetail={(id) => router.push(`/admin/orders/${id}`)}
            />
          ))}
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
      <StatusUpdateDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        order={selectedOrder}
        onSuccess={fetchOrders}
      />
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
