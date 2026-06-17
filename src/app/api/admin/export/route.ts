import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

// ===== Export API — generates CSV / Excel-compatible files =====
// Supports three export types: sales, stock, orders
// All text is in Indonesian. Currency formatted with id-ID locale.

// ---------- Helpers ----------

/**
 * Escape a single CSV value.
 * Wraps in double quotes if the value contains: comma, double quote, newline, or carriage return.
 * Escapes internal double quotes by doubling them.
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Build a CSV row from an array of values.
 */
function buildCsvRow(values: unknown[]): string {
  return values.map(escapeCsvValue).join(',')
}

/**
 * Build a full CSV document from headers + rows.
 * Prepends BOM (\uFEFF) so Excel detects UTF-8 encoding correctly (Indonesian text).
 */
function buildCsv(headers: string[], rows: unknown[][]): string {
  const headerLine = buildCsvRow(headers)
  const dataLines = rows.map(buildCsvRow)
  return '\uFEFF' + [headerLine, ...dataLines].join('\r\n')
}

/**
 * Format a date as DD/MM/YYYY (Indonesian locale).
 */
function formatDateId(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Format an integer Rupiah amount with thousands separators (id-ID locale).
 */
function formatRupiah(amount: number): string {
  return Number(amount || 0).toLocaleString('id-ID')
}

/**
 * Human-readable Indonesian status label for order status.
 */
function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Dikonfirmasi',
    processing: 'Diproses',
    shipped: 'Dikirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }
  return map[status] || status
}

/**
 * Human-readable Indonesian status label for payment status.
 */
function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    unpaid: 'Belum Bayar',
    paid: 'Lunas',
    refunded: 'Dikembalikan',
  }
  return map[status] || status
}

/**
 * Build the month string used in filenames (YYYY-MM).
 * Uses the "from" date if provided, otherwise the current month.
 */
function getMonthTag(from: Date | null): string {
  const d = from || new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

/**
 * Parse a YYYY-MM-DD query param into a Date (start of day, local time).
 * Returns null if invalid.
 */
function parseDateParam(value: string | null): Date | null {
  if (!value) return null
  // Expecting YYYY-MM-DD
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0)
  if (Number.isNaN(date.getTime())) return null
  return date
}

/**
 * Build a CSV Response with the proper headers for download.
 * For xlsx format, we return CSV content with .xls extension and an Excel MIME type
 * so Excel opens it as a spreadsheet (no XLSX library dependency needed).
 */
function csvResponse(
  csv: string,
  filename: string,
  format: 'csv' | 'xlsx'
): NextResponse {
  const ext = format === 'xlsx' ? 'xls' : 'csv'
  const contentType =
    format === 'xlsx'
      ? 'application/vnd.ms-excel; charset=utf-8'
      : 'text/csv; charset=utf-8'

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename.replace(/\.[^.]+$/, '')}.${ext}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}

// ---------- Export builders ----------

interface ExportParams {
  from: Date | null
  to: Date | null
  format: 'csv' | 'xlsx'
}

/**
 * Sales Report export.
 * Columns: No, Tanggal, Invoice, Pemesan, Telepon, Kota, Jumlah Item,
 *          Subtotal Produk, Ongkir, Total, Status Pembayaran, Status Order
 * Data: orders in date range (default: current month), sorted by createdAt desc.
 */
async function exportSalesReport({ from, to, format }: ExportParams): Promise<NextResponse> {
  // Default to current month if no range provided
  const now = new Date()
  const start = from || new Date(now.getFullYear(), now.getMonth(), 1)
  const end = to
    ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const orders = await db.order.findMany({
    where: {
      deletedAt: null,
      createdAt: { gte: start, lte: end },
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'No',
    'Tanggal',
    'Invoice',
    'Pemesan',
    'Telepon',
    'Kota',
    'Jumlah Item',
    'Subtotal Produk',
    'Ongkir',
    'Total',
    'Status Pembayaran',
    'Status Order',
  ]

  const rows = orders.map((order, idx) => {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotalProduk = order.totalAmount - order.shippingCost
    return [
      idx + 1,
      formatDateId(order.createdAt),
      order.orderNumber,
      order.customerName,
      order.customerPhone,
      order.destinationCity || '-',
      itemCount,
      formatRupiah(subtotalProduk),
      formatRupiah(order.shippingCost),
      formatRupiah(order.totalAmount),
      paymentStatusLabel(order.paymentStatus),
      orderStatusLabel(order.status),
    ]
  })

  const csv = buildCsv(headers, rows)
  const filename = `grosirpj-penjualan-${getMonthTag(from)}.csv`
  return csvResponse(csv, filename, format)
}

/**
 * Product Stock export.
 * Columns: No, Nama Produk, Kategori, Harga Grosir, Harga Eceran, Min Order,
 *          Stok, Terjual, Berat, Status
 * Data: all products (including soft-deleted), sorted by stock ascending (low stock first).
 */
async function exportStockReport({ format }: ExportParams): Promise<NextResponse> {
  const products = await db.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: [{ stock: 'asc' }, { name: 'asc' }],
  })

  const headers = [
    'No',
    'Nama Produk',
    'Kategori',
    'Harga Grosir',
    'Harga Eceran',
    'Min Order',
    'Stok',
    'Terjual',
    'Berat',
    'Status',
  ]

  const rows = products.map((product, idx) => [
    idx + 1,
    product.name,
    product.category?.name || '-',
    formatRupiah(product.wholesalePrice),
    formatRupiah(product.price),
    product.minOrder,
    product.stock,
    product.sold,
    product.weight || '-',
    product.deletedAt ? 'Nonaktif (Dihapus)' : 'Aktif',
  ])

  const csv = buildCsv(headers, rows)
  const filename = `grosirpj-stok-produk.csv`
  return csvResponse(csv, filename, format)
}

/**
 * Orders Recap export.
 * Columns: No, Invoice, Tanggal, Pemesan, Telepon, Kota, Total, Kurir,
 *          Status Order, Status Bayar, Bukti Bayar
 * Data: all orders in date range, including payment proof URL if exists.
 */
async function exportOrdersRecap({ from, to, format }: ExportParams): Promise<NextResponse> {
  const now = new Date()
  const start = from || new Date(now.getFullYear(), now.getMonth(), 1)
  const end = to
    ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const orders = await db.order.findMany({
    where: {
      deletedAt: null,
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'No',
    'Invoice',
    'Tanggal',
    'Pemesan',
    'Telepon',
    'Kota',
    'Total',
    'Kurir',
    'Status Order',
    'Status Bayar',
    'Bukti Bayar',
  ]

  const rows = orders.map((order, idx) => {
    const kurir = [order.courier, order.courierService].filter(Boolean).join(' ') || '-'
    return [
      idx + 1,
      order.orderNumber,
      formatDateId(order.createdAt),
      order.customerName,
      order.customerPhone,
      order.destinationCity || '-',
      formatRupiah(order.totalAmount),
      kurir,
      orderStatusLabel(order.status),
      paymentStatusLabel(order.paymentStatus),
      order.paymentProof || '-',
    ]
  })

  const csv = buildCsv(headers, rows)
  const filename = `grosirpj-rekap-order-${getMonthTag(from)}.csv`
  return csvResponse(csv, filename, format)
}

// ---------- Route handler ----------

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    // session is verified admin — currently we don't need the user info, but the
    // auth check is mandatory to protect the export endpoint.
    void session

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''
    const format = searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv'
    const from = parseDateParam(searchParams.get('from'))
    const to = parseDateParam(searchParams.get('to'))

    // Validate date range — "to" must not be before "from"
    if (from && to && to < from) {
      return NextResponse.json(
        { error: 'Tanggal akhir tidak boleh sebelum tanggal mulai' },
        { status: 400 }
      )
    }

    const params: ExportParams = { from, to, format }

    switch (type) {
      case 'sales':
        return await exportSalesReport(params)
      case 'stock':
        return await exportStockReport(params)
      case 'orders':
        return await exportOrdersRecap(params)
      default:
        return NextResponse.json(
          { error: 'Tipe export tidak valid. Gunakan: sales, stock, atau orders' },
          { status: 400 }
        )
    }
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Gagal menghasilkan file export. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
