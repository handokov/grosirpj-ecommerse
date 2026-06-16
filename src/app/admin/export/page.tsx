'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Download,
  ShoppingCart,
  Package,
  FileSpreadsheet,
  Calendar,
  Loader2,
  FileText,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ---------- Types ----------

type ExportType = 'sales' | 'stock' | 'orders'
type ExportFormat = 'csv' | 'xlsx'

// ---------- Export type metadata ----------

interface ExportTypeMeta {
  key: ExportType
  title: string
  description: string
  icon: React.ElementType
  columns: string[]
  needsDateRange: boolean
  accent: string
}

const EXPORT_TYPES: ExportTypeMeta[] = [
  {
    key: 'sales',
    title: 'Laporan Penjualan',
    description: 'Detail transaksi penjualan beserta subtotal, ongkir, dan status.',
    icon: ShoppingCart,
    columns: [
      'Tanggal', 'Invoice', 'Pemesan', 'Telepon', 'Kota',
      'Jumlah Item', 'Subtotal Produk', 'Ongkir', 'Total',
      'Status Pembayaran', 'Status Order',
    ],
    needsDateRange: true,
    accent: 'emerald',
  },
  {
    key: 'stock',
    title: 'Stok Produk',
    description: 'Daftar stok produk termasuk harga, terjual, dan status (aktif/nonaktif).',
    icon: Package,
    columns: [
      'Nama Produk', 'Kategori', 'Harga Grosir', 'Harga Eceran',
      'Min Order', 'Stok', 'Terjual', 'Berat', 'Status',
    ],
    needsDateRange: false,
    accent: 'amber',
  },
  {
    key: 'orders',
    title: 'Rekap Order',
    description: 'Rekapitulasi pesanan dengan kurir, status, dan bukti pembayaran.',
    icon: FileSpreadsheet,
    columns: [
      'Invoice', 'Tanggal', 'Pemesan', 'Telepon', 'Kota',
      'Total', 'Kurir', 'Status Order', 'Status Bayar', 'Bukti Bayar',
    ],
    needsDateRange: true,
    accent: 'sky',
  },
]

// ---------- Helpers ----------

/** Return today's date as YYYY-MM-DD (for default "to" input). */
function todayIso(): string {
  const d = new Date()
  return toIso(d)
}

/** Convert a Date to YYYY-MM-DD (local time, no timezone shift). */
function toIso(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Return the first day of the current month as YYYY-MM-DD. */
function firstDayOfMonthIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}-01`
}

// ---------- Date range presets ----------

interface DatePreset {
  key: string
  label: string
  /** Returns [from, to] as YYYY-MM-DD strings. */
  getRange: () => [string, string]
}

const DATE_PRESETS: DatePreset[] = [
  {
    key: 'today',
    label: 'Hari Ini',
    getRange: () => {
      const today = todayIso()
      return [today, today]
    },
  },
  {
    key: '7d',
    label: '7 Hari Terakhir',
    getRange: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(to.getDate() - 6) // include today = 7 days
      return [toIso(from), toIso(to)]
    },
  },
  {
    key: '30d',
    label: '1 Bulan Terakhir',
    getRange: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(to.getDate() - 29) // include today = 30 days
      return [toIso(from), toIso(to)]
    },
  },
  {
    key: '90d',
    label: '3 Bulan Terakhir',
    getRange: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(to.getDate() - 89) // include today = 90 days
      return [toIso(from), toIso(to)]
    },
  },
  {
    key: 'this-month',
    label: 'Bulan Ini',
    getRange: () => [firstDayOfMonthIso(), todayIso()],
  },
  {
    key: 'last-month',
    label: 'Bulan Lalu',
    getRange: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0) // last day of prev month
      return [toIso(from), toIso(to)]
    },
  },
  {
    key: 'ytd',
    label: 'Tahun Ini',
    getRange: () => {
      const now = new Date()
      return [`${now.getFullYear()}-01-01`, todayIso()]
    },
  },
  {
    key: '365d',
    label: '1 Tahun Terakhir',
    getRange: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(to.getDate() - 364)
      return [toIso(from), toIso(to)]
    },
  },
]

/**
 * Trigger a file download from a Response by reading it as a Blob.
 * Extracts filename from Content-Disposition header (quoted form).
 */
async function downloadExport(
  type: ExportType,
  from: string,
  to: string,
  format: ExportFormat
): Promise<void> {
  const params = new URLSearchParams({ type, format })
  if (from) params.set('from', from)
  if (to) params.set('to', to)

  const res = await fetch(`/api/admin/export?${params.toString()}`)

  if (!res.ok) {
    let message = 'Gagal mengexport data'
    try {
      const data = await res.json()
      message = data?.error || message
    } catch {
      // response wasn't JSON — keep default message
    }
    throw new Error(message)
  }

  // Try to read filename from Content-Disposition, fall back to a sensible default.
  const disposition = res.headers.get('Content-Disposition') || ''
  let filename = `grosirpj-${type}-${todayIso()}.csv`
  const match = /filename="?([^";]+)"?/.exec(disposition)
  if (match && match[1]) filename = match[1]

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------- Page ----------

export default function ExportDataPage() {
  const [selectedType, setSelectedType] = useState<ExportType>('sales')
  const [from, setFrom] = useState<string>(firstDayOfMonthIso())
  const [to, setTo] = useState<string>(todayIso())
  const [activePreset, setActivePreset] = useState<string>('this-month')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [exporting, setExporting] = useState(false)

  const selectedMeta = useMemo(
    () => EXPORT_TYPES.find(t => t.key === selectedType)!,
    [selectedType]
  )

  /** Apply a date preset — sets from/to and marks the preset as active. */
  const handlePresetClick = (preset: DatePreset) => {
    const [f, t] = preset.getRange()
    setFrom(f)
    setTo(t)
    setActivePreset(preset.key)
  }

  /** When user manually changes a date input, clear the active preset highlight. */
  const handleManualDateChange = (setter: (v: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setter(e.target.value)
    setActivePreset('')
  }

  const handleExport = async () => {
    // Validate date range when required
    if (selectedMeta.needsDateRange) {
      if (!from || !to) {
        toast.error('Pilih rentang tanggal terlebih dahulu')
        return
      }
      if (new Date(to) < new Date(from)) {
        toast.error('Tanggal akhir tidak boleh sebelum tanggal mulai')
        return
      }
    }

    setExporting(true)
    try {
      await downloadExport(selectedType, from, to, format)
      toast.success(`Export ${selectedMeta.title} berhasil diunduh`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengexport data')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Export Data</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Unduh laporan penjualan, stok produk, dan rekap order dalam format CSV / Excel.
        </p>
      </div>

      {/* Step 1: Pilih jenis export */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
            1
          </span>
          <h2 className="text-sm font-semibold text-gray-900">Pilih Jenis Export</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXPORT_TYPES.map(meta => {
            const Icon = meta.icon
            const selected = selectedType === meta.key
            return (
              <button
                key={meta.key}
                type="button"
                onClick={() => setSelectedType(meta.key)}
                className={cn(
                  'text-left transition-all duration-150 rounded-xl border-2 p-4 bg-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
                  selected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-gray-100 hover:border-emerald-200'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      selected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {selected && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{meta.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-2">
                  {meta.description}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Info className="w-3 h-3" />
                  <span>{meta.columns.length} kolom</span>
                  {meta.needsDateRange && (
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-semibold">
                      Rentang tanggal
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2: Konfigurasi */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              2
            </span>
            <CardTitle className="text-sm">Konfigurasi Export</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Pilih periode cepat atau atur tanggal manual. Field tanggal hanya berlaku untuk
            Laporan Penjualan &amp; Rekap Order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Quick presets — only relevant when date range is needed */}
          <div
            className={cn(
              'space-y-2 transition-opacity',
              !selectedMeta.needsDateRange && 'opacity-40 pointer-events-none'
            )}
          >
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Periode Cepat
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {DATE_PRESETS.map(preset => {
                const active = activePreset === preset.key
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    disabled={!selectedMeta.needsDateRange}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-150',
                      active
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50',
                    )}
                    aria-pressed={active}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date range — only enabled when needed */}
          <div
            className={cn(
              'grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity',
              !selectedMeta.needsDateRange && 'opacity-40 pointer-events-none'
            )}
          >
            <div className="space-y-1.5">
              <Label htmlFor="from-date" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Tanggal Mulai
              </Label>
              <Input
                id="from-date"
                type="date"
                value={from}
                onChange={handleManualDateChange(setFrom)}
                className="text-xs h-9 bg-gray-50 border-gray-200"
                disabled={!selectedMeta.needsDateRange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to-date" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Tanggal Akhir
              </Label>
              <Input
                id="to-date"
                type="date"
                value={to}
                onChange={handleManualDateChange(setTo)}
                className="text-xs h-9 bg-gray-50 border-gray-200"
                disabled={!selectedMeta.needsDateRange}
              />
            </div>
          </div>

          {/* Format selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Format File
            </Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectTrigger className="text-xs h-9 bg-gray-50 border-gray-200 w-full sm:w-64">
                <SelectValue placeholder="Pilih format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">CSV</span>
                      <span className="text-[10px] text-gray-400">Kompatibel dengan Excel & Google Sheets</span>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="xlsx">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">Excel (.xls)</span>
                      <span className="text-[10px] text-gray-400">Dibuka langsung oleh Microsoft Excel</span>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Column preview */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <p className="text-[11px] font-semibold text-gray-700 mb-2">
              Kolom yang akan diekspor:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedMeta.columns.map(col => (
                <span
                  key={col}
                  className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] text-gray-600 font-medium"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Export action */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Export {selectedMeta.title}
                </h3>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  {selectedMeta.needsDateRange
                    ? `Periode: ${from || '...'} s/d ${to || '...'}`
                    : 'Semua produk (termasuk yang nonaktif)'}
                  {' · '}
                  Format: {format === 'csv' ? 'CSV' : 'Excel (.xls)'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm shadow-emerald-200 w-full sm:w-auto"
              size="sm"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1.5" />
              )}
              {exporting ? 'Sedang Export...' : 'Unduh Sekarang'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info note */}
      <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-blue-700 leading-relaxed">
          <p className="font-semibold mb-0.5">Catatan</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>File CSV dapat dibuka di Excel, Google Sheets, atau LibreOffice Calc.</li>
            <li>Tanggal otomatis diformat DD/MM/YYYY (locale Indonesia).</li>
            <li>Nominal Rupiah menggunakan pemisah ribuan (contoh: 1.250.000).</li>
            <li>Data Stok Produk mencakup produk yang sudah dihapus (ditandai &quot;Nonaktif&quot;).</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
