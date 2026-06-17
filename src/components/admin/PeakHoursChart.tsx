'use client'

import { Clock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)
const Bar = dynamic(
  () => import('recharts').then(mod => mod.Bar as unknown as ComponentType<Record<string, unknown>>),
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
const Cell = dynamic(
  () => import('recharts').then(mod => mod.Cell as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)

const chartConfig: ChartConfig = {
  orders: {
    label: 'Pesanan',
    color: '#10b981',
  },
}

interface PeakHoursChartProps {
  data: { hour: string; orders: number }[]
  loading: boolean
  error: string | null
}

export default function PeakHoursChart({ data, loading, error }: PeakHoursChartProps) {
  // Find peak hour (highest orders)
  const maxOrders = Math.max(...data.map((d) => d.orders), 0)
  const peakHourObj = data.find((d) => d.orders > 0 && d.orders === maxOrders)
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Jam Ramai Order</CardTitle>
              <CardDescription className="text-[11px]">Distribusi pesanan per jam • 30 hari</CardDescription>
            </div>
          </div>
          {peakHourObj && maxOrders > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 font-semibold">
              Puncak: {peakHourObj.hour}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="h-[200px] w-full rounded-xl" />
        ) : error ? (
          <div className="flex items-center justify-center h-[200px] text-gray-400">
            <p>Gagal memuat data</p>
          </div>
        ) : totalOrders === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <Clock className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">Belum ada data order</p>
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart
                data={data}
                margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={9}
                  tick={{ fill: '#9ca3af' }}
                  interval={2}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  fontSize={10}
                  tick={{ fill: '#9ca3af' }}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value: any) => {
                        const num = typeof value === 'number' ? value : Number(value) || 0
                        return [`${num} pesanan`, 'Order']
                      }}
                    />
                  }
                />
                <Bar dataKey="orders" radius={[3, 3, 0, 0]}>
                  {data.map((entry, index) => {
                    // Highlight peak hours (>= 70% of max) in amber, else emerald
                    const isPeak = maxOrders > 0 && entry.orders >= maxOrders * 0.7 && entry.orders > 0
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isPeak ? '#f59e0b' : '#10b981'}
                        fillOpacity={entry.orders === 0 ? 0.3 : 1}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="mt-2 text-[10px] text-gray-500 text-center">
              Bar <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mx-1 align-middle" /> 
              = jam puncak (≥70% dari maksimal)
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
