'use client'

import { useState } from 'react'
import { TrendingUp, Calendar } from 'lucide-react'
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
import type { ComponentType } from 'react'

const AreaChart = dynamic(
  () => import('recharts').then(mod => mod.AreaChart as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)
const Area = dynamic(
  () => import('recharts').then(mod => mod.Area as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)

const chartConfig: ChartConfig = {
  revenue: {
    label: 'Pendapatan',
    color: '#10b981',
  },
}

interface RevenueTrendChartProps {
  weeklyRevenue: { date: string; revenue: number; orders: number }[]
  dailyRevenue: { date: string; revenue: number; orders: number }[]
  loading: boolean
  error: string | null
}

export default function RevenueTrendChart({
  weeklyRevenue,
  dailyRevenue,
  loading,
  error,
}: RevenueTrendChartProps) {
  const [range, setRange] = useState<'7d' | '30d'>('7d')
  const data = range === '7d' ? weeklyRevenue : dailyRevenue

  // Calculate total & growth for the selected range
  const total = data.reduce((sum, d) => sum + d.revenue, 0)
  const orderCount = data.reduce((sum, d) => sum + d.orders, 0)

  return (
    <Card className="lg:col-span-2 border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Tren Pendapatan</CardTitle>
              <CardDescription className="text-[11px]">
                {range === '7d' ? '7 hari terakhir' : '30 hari terakhir'} • {orderCount} pesanan
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Range toggle */}
            <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setRange('7d')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  range === '7d'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setRange('30d')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  range === '30d'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                30 Hari
              </button>
            </div>
          </div>
        </div>
        {/* Total revenue display */}
        {!loading && !error && (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{formatRupiah(total)}</span>
            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
              <Calendar className="w-3 h-3 mr-0.5" />
              {range === '7d' ? 'Minggu ini' : 'Bulan ini'}
            </Badge>
          </div>
        )}
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
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillRevenueTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={10}
                tick={{ fill: '#9ca3af' }}
                interval={range === '30d' ? 4 : 0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value: number) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
                  return value.toString()
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: any) => {
                      const num = typeof value === 'number' ? value : Number(value) || 0
                      return [formatRupiah(num), 'Pendapatan']
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#fillRevenueTrend)"
                dot={range === '7d' ? { r: 3, fill: '#10b981' } : false}
                activeDot={{ r: 5, fill: '#10b981' }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
