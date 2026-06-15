'use client'

import { TrendingUp, ArrowUpRight } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import dynamic from 'next/dynamic'

const AreaChart = dynamic(
  () => import('recharts').then(mod => mod.AreaChart),
  { ssr: false }
)
const Area = dynamic(
  () => import('recharts').then(mod => mod.Area),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid),
  { ssr: false }
)

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

function chartTooltipFormatter(value: number, name: string) {
  if (name === 'revenue') {
    return [formatRupiah(value), 'Pendapatan']
  }
  return [value.toLocaleString('id-ID'), 'Pesanan']
}

interface RevenueChartProps {
  data: { month: string; revenue: number; orders: number }[] | undefined
  loading: boolean
  error: string | null
}

export default function RevenueChart({ data, loading, error }: RevenueChartProps) {
  return (
    <Card className="lg:col-span-2 border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Pendapatan Bulanan</CardTitle>
              <CardDescription className="text-[11px]">6 bulan terakhir</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : error ? (
          <div className="flex items-center justify-center h-[280px] text-gray-400">
            <p>Gagal memuat data chart</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart
              data={data || []}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value: number) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
                  return value.toString()
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent formatter={chartTooltipFormatter} />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#fillRevenue)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
