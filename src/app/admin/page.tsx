'use client'

import { useEffect, useState } from 'react'
import {
  Package,
  ShoppingCart,
  Banknote,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'

// Types
interface DashboardData {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  confirmedOrders: number
  shippedOrders: number
  completedOrders: number
  cancelledOrders: number
  recentOrders: {
    id: string
    orderNumber: string
    customerName: string
    totalAmount: number
    status: string
    createdAt: string
    items: { product: { name: string; images: string } }[]
  }[]
  topProducts: {
    id: string
    name: string
    sold: number
    price: number
    images: string
    stock: number
  }[]
  lowStockProducts: {
    id: string
    name: string
    stock: number
    images: string
  }[]
  categories: {
    id: string
    name: string
    slug: string
    _count: { products: number }
  }[]
  monthlyData: {
    month: string
    revenue: number
    orders: number
  }[]
}

// Chart config with emerald colors
const chartConfig: ChartConfig = {
  revenue: {
    label: 'Pendapatan',
    color: '#10b981',
  },
  orders: {
    label: 'Pesanan',
    color: '#059669',
  },
}

// Helper to parse product images
function parseProductImage(imagesStr: string): string {
  try {
    const parsed = JSON.parse(imagesStr)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
    if (typeof parsed === 'string') return parsed
    return '/placeholder.png'
  } catch {
    return imagesStr || '/placeholder.png'
  }
}

// Status badge config
function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    },
    confirmed: {
      label: 'Dikonfirmasi',
      className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
    },
    shipped: {
      label: 'Dikirim',
      className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
    },
    completed: {
      label: 'Selesai',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    },
    cancelled: {
      label: 'Dibatalkan',
      className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    },
  }
  const c = config[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' }
  return <Badge variant="outline" className={cn('font-medium', c.className)}>{c.label}</Badge>
}

// Format date in Indonesian locale
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// Custom tooltip formatter for the chart
function chartTooltipFormatter(value: number, name: string) {
  if (name === 'revenue') {
    return [formatRupiah(value), 'Pendapatan']
  }
  return [value.toLocaleString('id-ID'), 'Pesanan']
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (!res.ok) throw new Error('Gagal memuat data dashboard')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  // KPI cards data
  const kpiCards = data
    ? [
        {
          title: 'Total Produk',
          value: data.totalProducts.toLocaleString('id-ID'),
          icon: Package,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
        },
        {
          title: 'Total Pesanan',
          value: data.totalOrders.toLocaleString('id-ID'),
          icon: ShoppingCart,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
        },
        {
          title: 'Pendapatan',
          value: formatRupiah(data.totalRevenue),
          icon: Banknote,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
        },
        {
          title: 'Pesanan Pending',
          value: data.pendingOrders.toLocaleString('id-ID'),
          icon: Clock,
          color: data.pendingOrders > 0 ? 'text-amber-600' : 'text-emerald-600',
          bg: data.pendingOrders > 0 ? 'bg-amber-50' : 'bg-emerald-50',
          border: data.pendingOrders > 0 ? 'border-amber-300' : 'border-emerald-200',
          highlight: data.pendingOrders > 0,
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Selamat datang di GrosirPJ Seller Centre — Ringkasan bisnis Anda
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="gap-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : kpiCards.map((card) => {
              const Icon = card.icon
              return (
                <Card
                  key={card.title}
                  className={cn(
                    'gap-4 transition-shadow hover:shadow-md',
                    card.highlight && 'ring-2 ring-amber-300'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          card.bg,
                          card.border,
                          'border'
                        )}
                      >
                        <Icon className={cn('h-5 w-5', card.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 truncate">
                          {card.title}
                        </p>
                        <p
                          className={cn(
                            'text-lg font-bold truncate',
                            card.highlight ? 'text-amber-700' : 'text-gray-900'
                          )}
                        >
                          {card.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Revenue Chart */}
      <Card className="gap-4">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base">Pendapatan Bulanan</CardTitle>
          </div>
          <CardDescription>6 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[280px] text-gray-400">
              <p>Gagal memuat data chart</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart
                data={data?.monthlyData || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  tickFormatter={(value: number) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
                    return value.toString()
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={chartTooltipFormatter}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#fillRevenue)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Two-column: Top Products + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produk Terlaris */}
        <Card className="gap-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-base">Produk Terlaris</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                Top 5
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {data?.topProducts.map((product, index) => (
                  <div key={product.id}>
                    <div className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                      {/* Rank badge */}
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0',
                          index === 0
                            ? 'bg-amber-100 text-amber-700'
                            : index === 1
                              ? 'bg-gray-200 text-gray-600'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {index + 1}
                      </span>
                      {/* Product image */}
                      <Avatar className="h-10 w-10 rounded-lg border border-gray-200">
                        <AvatarImage
                          src={parseProductImage(product.images)}
                          alt={product.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-lg bg-emerald-50 text-emerald-600 text-xs">
                          {product.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRupiah(product.price)}
                        </p>
                      </div>
                      {/* Sold count */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-emerald-700">
                          {product.sold}
                        </p>
                        <p className="text-xs text-gray-400">terjual</p>
                      </div>
                    </div>
                    {index < (data?.topProducts.length || 0) - 1 && (
                      <Separator className="my-0.5" />
                    )}
                  </div>
                ))}
                {(!data?.topProducts || data.topProducts.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Belum ada data produk terlaris
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stok Menipis */}
        <Card className="gap-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base">Stok Menipis</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                Stok ≤ 20
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-5 w-10" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {data?.lowStockProducts.map((product, index) => (
                  <div key={product.id}>
                    <div className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                      {/* Warning indicator */}
                      <div
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full shrink-0',
                          product.stock <= 5
                            ? 'bg-red-100 text-red-600'
                            : product.stock <= 10
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-yellow-50 text-yellow-600'
                        )}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      {/* Product image */}
                      <Avatar className="h-10 w-10 rounded-lg border border-gray-200">
                        <AvatarImage
                          src={parseProductImage(product.images)}
                          alt={product.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-lg bg-amber-50 text-amber-600 text-xs">
                          {product.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                      </div>
                      {/* Stock badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-bold text-xs shrink-0',
                          product.stock <= 5
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : product.stock <= 10
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        )}
                      >
                        {product.stock} pcs
                      </Badge>
                    </div>
                    {index < (data?.lowStockProducts.length || 0) - 1 && (
                      <Separator className="my-0.5" />
                    )}
                  </div>
                ))}
                {(!data?.lowStockProducts || data.lowStockProducts.length === 0) && (
                  <div className="text-center py-6">
                    <p className="text-sm text-emerald-600 font-medium">
                      Stok aman semua!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tidak ada produk dengan stok menipis
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="gap-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
            </div>
            <a
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Lihat Semua
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              <div className="flex gap-4">
                {['Order #', 'Customer', 'Total', 'Status', 'Tanggal'].map(
                  (h) => (
                    <Skeleton key={h} className="h-4 w-16" />
                  )
                )}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <p>Gagal memuat data pesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium text-emerald-800">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">
                            {order.items[0]?.product?.name || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-900">
                        {formatRupiah(order.totalAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          Detail
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.recentOrders || data.recentOrders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        Belum ada pesanan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error state */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
