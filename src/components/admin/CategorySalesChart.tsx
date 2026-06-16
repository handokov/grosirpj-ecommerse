'use client'

import { PieChart as PieChartIcon } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

const PieChart = dynamic(
  () => import('recharts').then(mod => mod.PieChart as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)
const Pie = dynamic(
  () => import('recharts').then(mod => mod.Pie as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then(mod => mod.Cell as unknown as ComponentType<Record<string, unknown>>),
  { ssr: false }
)

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const chartConfig: ChartConfig = {
  revenue: {
    label: 'Pendapatan',
  },
}

interface CategorySalesChartProps {
  data: { id: string; name: string; revenue: number; quantity: number }[]
  loading: boolean
  error: string | null
}

export default function CategorySalesChart({ data, loading, error }: CategorySalesChartProps) {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Kategori Terlaris</CardTitle>
            <CardDescription className="text-[11px]">Berdasarkan pendapatan • 30 hari</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[160px] w-full rounded-xl mx-auto" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[280px] text-gray-400">
            <p>Gagal memuat data</p>
          </div>
        ) : data.length === 0 || totalRevenue === 0 ? (
          <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
            <PieChartIcon className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">Belum ada penjualan</p>
            <p className="text-[11px] mt-1">Data akan muncul setelah ada order paid</p>
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[180px] w-full mx-auto">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value: any, name: any) => {
                        const num = typeof value === 'number' ? value : Number(value) || 0
                        const nameStr = String(name)
                        const pct = totalRevenue > 0 ? ((num / totalRevenue) * 100).toFixed(1) : '0'
                        return [`${formatRupiah(num)} (${pct}%)`, nameStr]
                      }}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Legend with revenue & qty */}
            <div className="mt-3 space-y-2 max-h-[120px] overflow-y-auto pr-1">
              {data.map((cat, index) => {
                const pct = totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : '0'
                return (
                  <div key={cat.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-gray-700 truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-500 text-[10px]">{cat.quantity} pcs</span>
                      <span className="font-bold text-gray-900">{formatRupiah(cat.revenue)}</span>
                      <span className="text-[10px] text-gray-400 w-9 text-right">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
