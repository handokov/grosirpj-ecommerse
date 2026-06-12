'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Banknote,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  Timer,
  PackageCheck,
  ChevronRight,
  BarChart3,
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
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), {
  ssr: false,
  loading: () => <div className="lg:col-span-2 border-0 shadow-sm bg-white rounded-xl h-[380px] flex items-center justify-center"><p className="text-gray-400 text-sm">Memuat chart...</p></div>,
})

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
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    confirmed: {
      label: 'Dikonfirmasi',
      className: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    shipped: {
      label: 'Dikirim',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    completed: {
      label: 'Selesai',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    cancelled: {
      label: 'Dibatalkan',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  }
  const c = config[status] || { label: status, className: 'bg-gray-50 text-gray-700 border-gray-200' }
  return <Badge variant="outline" className={cn('text-[11px] font-semibold', c.className)}>{c.label}</Badge>
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

  // Order status cards (Shopee-style)
  const orderStatusCards = data
    ? [
        {
          label: 'Perlu Proses',
          count: data.pendingOrders,
          icon: Timer,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          hoverBg: 'hover:bg-amber-100',
          href: '/admin/orders?status=pending',
        },
        {
          label: 'Dikonfirmasi',
          count: data.confirmedOrders,
          icon: CreditCard,
          color: 'text-sky-600',
          bg: 'bg-sky-50',
          border: 'border-sky-100',
          hoverBg: 'hover:bg-sky-100',
          href: '/admin/orders?status=confirmed',
        },
        {
          label: 'Sedang Dikirim',
          count: data.shippedOrders,
          icon: Truck,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-100',
          hoverBg: 'hover:bg-orange-100',
          href: '/admin/orders?status=shipped',
        },
        {
          label: 'Selesai',
          count: data.completedOrders,
          icon: CheckCircle2,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          hoverBg: 'hover:bg-emerald-100',
          href: '/admin/orders?status=completed',
        },
        {
          label: 'Dibatalkan',
          count: data.cancelledOrders,
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-100',
          hoverBg: 'hover:bg-red-100',
          href: '/admin/orders?status=cancelled',
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 p-6 lg:p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-xl lg:text-2xl font-bold">Selamat Datang di Seller Centre 👋</h1>
          <p className="text-emerald-100 mt-1 text-sm">Kelola toko GrosirPJ Anda dengan mudah</p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Link
              href="/admin/products/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <Package className="w-4 h-4" />
              Tambah Produk
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/50 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800/70 transition-colors border border-emerald-500/30"
            >
              <ShoppingCart className="w-4 h-4" />
              Lihat Pesanan
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-20 -right-5 w-60 h-60 bg-white/5 rounded-full" />
        <div className="absolute top-5 right-40 w-20 h-20 bg-white/5 rounded-full" />
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : [
              {
                title: 'Total Produk',
                value: data?.totalProducts.toLocaleString('id-ID') || '0',
                icon: Package,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                iconBg: 'bg-emerald-100',
                change: '+2',
                changeUp: true,
              },
              {
                title: 'Total Pesanan',
                value: data?.totalOrders.toLocaleString('id-ID') || '0',
                icon: ShoppingCart,
                color: 'text-sky-600',
                bg: 'bg-sky-50',
                iconBg: 'bg-sky-100',
                change: '+5',
                changeUp: true,
              },
              {
                title: 'Pendapatan',
                value: formatRupiah(data?.totalRevenue || 0),
                icon: Banknote,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                iconBg: 'bg-amber-100',
                change: '+12%',
                changeUp: true,
              },
              {
                title: 'Perlu Proses',
                value: data?.pendingOrders.toLocaleString('id-ID') || '0',
                icon: Clock,
                color: data?.pendingOrders ? 'text-red-600' : 'text-emerald-600',
                bg: data?.pendingOrders ? 'bg-red-50' : 'bg-emerald-50',
                iconBg: data?.pendingOrders ? 'bg-red-100' : 'bg-emerald-100',
                change: 'urgent',
                changeUp: false,
              },
            ].map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', card.iconBg)}>
                        <Icon className={cn('h-5 w-5', card.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                          {card.title}
                        </p>
                        <p className="text-lg font-bold text-gray-900 truncate">
                          {card.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Order Status Pipeline (Shopee-style) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Status Pesanan</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <Skeleton className="h-8 w-8 rounded-lg mb-2" />
                    <Skeleton className="h-6 w-8 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))
            : orderStatusCards.map((card) => {
                const Icon = card.icon
                return (
                  <Link key={card.label} href={card.href}>
                    <Card className={cn(
                      'border-0 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                      card.border
                    )}>
                      <CardContent className="p-4">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', card.bg)}>
                          <Icon className={cn('w-4 h-4', card.color)} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{card.label}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
        </div>
      </div>

      {/* Revenue Chart + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <RevenueChart data={data?.monthlyData} loading={loading} error={error} />

        {/* Quick Stats / Category Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Distribusi Kategori</CardTitle>
                <CardDescription className="text-[11px]">Jumlah produk per kategori</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.categories.map((cat, index) => {
                  const maxProducts = Math.max(...data.categories.map(c => c._count.products), 1)
                  const percentage = (cat._count.products / maxProducts) * 100
                  const colors = ['bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-orange-500', 'bg-rose-500']
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                        <span className="text-xs font-bold text-gray-900">{cat._count.products}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', colors[index % colors.length])}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two-column: Top Products + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produk Terlaris */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <CardTitle className="text-sm font-bold">Produk Terlaris</CardTitle>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 font-semibold">
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
                    <div className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors">
                      {/* Rank badge */}
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0',
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
                      <Avatar className="h-10 w-10 rounded-lg border border-gray-100">
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
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {formatRupiah(product.price)}
                        </p>
                      </div>
                      {/* Sold count */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-emerald-700">
                          {product.sold}
                        </p>
                        <p className="text-[10px] text-gray-400">terjual</p>
                      </div>
                    </div>
                    {index < (data?.topProducts.length || 0) - 1 && (
                      <Separator className="opacity-50" />
                    )}
                  </div>
                ))}
                {(!data?.topProducts || data.topProducts.length === 0) && (
                  <p className="text-xs text-gray-400 text-center py-6">
                    Belum ada data produk terlaris
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stok Menipis */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <CardTitle className="text-sm font-bold">Stok Menipis</CardTitle>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-700 border-red-200 font-semibold">
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
                    <div className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors">
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
                        <AlertTriangle className="h-3 w-3" />
                      </div>
                      {/* Product image */}
                      <Avatar className="h-10 w-10 rounded-lg border border-gray-100">
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
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {product.name}
                        </p>
                      </div>
                      {/* Stock badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-bold text-[10px] shrink-0',
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
                      <Separator className="opacity-50" />
                    )}
                  </div>
                ))}
                {(!data?.lowStockProducts || data.lowStockProducts.length === 0) && (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs text-emerald-600 font-semibold">
                      Stok aman semua!
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
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
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-sky-600" />
              </div>
              <CardTitle className="text-sm font-bold">Pesanan Terbaru</CardTitle>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
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
                  <TableRow className="hover:bg-transparent border-gray-100">
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Order #</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Customer</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-right">Total</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Tanggal</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50/50 border-gray-50">
                      <TableCell className="font-mono text-xs font-bold text-emerald-800">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {order.customerName}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[160px]">
                            {order.items[0]?.product?.name || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-gray-900">
                        {formatRupiah(order.totalAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-[11px] text-gray-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.recentOrders || data.recentOrders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400 text-xs">
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
        <Card className="border-red-200 bg-red-50 border-0">
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
