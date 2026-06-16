/**
 * WhatsApp Notification Utility for GrosirPJ
 *
 * Sends WhatsApp notifications through multiple backends:
 * 1. Self-hosted Baileys bot (port 3002) — FREE, no third-party needed
 * 2. Fonnte API — if FONNTE_API_KEY env var is set
 * 3. Console logging + wa.me link — fallback when nothing is configured
 *
 * All calls are non-blocking: the caller should use .catch() to swallow errors
 * so that notification failures never break the main business logic.
 */

import { WA_NUMBER } from '@/lib/store-config'

// ---------------------------------------------------------------------------
// Send backends — tries self-hosted bot first, then Fonnte, then fallback
// ---------------------------------------------------------------------------

const WA_BOT_URL = 'http://localhost:3002'
const FONNTE_API_URL = 'https://api.fonnte.com/send'

/**
 * Send a WhatsApp message through available backends.
 * Priority: Self-hosted bot → Fonnte API → Console log fallback
 */
async function sendMessage(target: string, message: string): Promise<boolean> {
  // 1. Try self-hosted Baileys bot first
  try {
    const res = await fetch(`${WA_BOT_URL}/send?XTransformPort=3002`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, message }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    })

    if (res.ok) {
      const data = await res.json() as { success?: boolean; queued?: boolean }
      if (data.success) {
        console.log(`[whatsapp] ✅ Sent via self-hosted bot to ${target}`)
        return true
      }
      if (data.queued) {
        console.log(`[whatsapp] 📨 Queued via self-hosted bot (not connected yet) for ${target}`)
        return true
      }
    }
  } catch {
    // Bot not running — try next backend
    console.log('[whatsapp] Self-hosted bot not available, trying Fonnte...')
  }

  // 2. Try Fonnte API
  const apiKey = process.env.FONNTE_API_KEY
  if (apiKey) {
    try {
      const res = await fetch(FONNTE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target, message }),
      })

      if (res.ok) {
        console.log(`[whatsapp] ✅ Sent via Fonnte to ${target}`)
        return true
      }

      const text = await res.text().catch(() => '')
      throw new Error(`Fonnte API error ${res.status}: ${text}`)
    } catch (err) {
      console.warn('[whatsapp] Fonnte failed:', err)
    }
  }

  // 3. Fallback: log to console + generate wa.me link
  const deepLink = buildWaMeLink(target, message)
  console.log(`[whatsapp] ⚠️ No backend available. Notification logged (not sent).`)
  console.log(`[whatsapp] Target: ${target}`)
  console.log(`[whatsapp] Message:\n${message}`)
  console.log(`[whatsapp] Manual link: ${deepLink}`)
  return false
}

/**
 * Build a wa.me deep link so the admin/buyer can click to send manually.
 */
function buildWaMeLink(phone: string, message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

// ---------------------------------------------------------------------------
// Check bot status
// ---------------------------------------------------------------------------

/**
 * Check the status of the self-hosted WhatsApp bot.
 * Returns connection status and queue info.
 */
export async function getWABotStatus(): Promise<{
  available: boolean
  status?: string
  queued?: number
}> {
  try {
    const res = await fetch(`${WA_BOT_URL}/status?XTransformPort=3002`, {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json() as { status?: string; queued?: number }
      return { available: true, status: data.status, queued: data.queued }
    }
  } catch {
    // Bot not running
  }
  return { available: false }
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Format a number as Indonesian Rupiah string.
 * e.g. 1268000 → "Rp 1.268.000"
 */
function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

/**
 * Format a Date as a friendly Indonesian date-time string.
 * e.g. "16 Jun 2026, 10:30"
 */
function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

/**
 * Format a phone number for display (remove country code prefix if 62).
 * e.g. "6289622565076" → "089622565076"
 */
function formatPhoneDisplay(phone: string): string {
  if (phone.startsWith('62')) {
    return '0' + phone.slice(2)
  }
  return phone
}

/**
 * Format a phone number for WhatsApp API (ensure 62xx format).
 * e.g. "089622565076" → "6289622565076"
 */
function formatPhoneForWA(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '')
  if (clean.startsWith('08')) {
    clean = '62' + clean.slice(1)
  } else if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1)
  } else if (!clean.startsWith('62') && !clean.startsWith('+')) {
    clean = '62' + clean
  }
  return clean
}

// ---------------------------------------------------------------------------
// Status message mapping for buyer notifications
// ---------------------------------------------------------------------------

const STATUS_MESSAGES: Record<string, { label: string; detail: string }> = {
  confirmed: {
    label: 'Dikonfirmasi ✅',
    detail: 'Admin sedang memproses pesananmu. Kami akan memberitahu ketika pesanan sudah dikirim.',
  },
  processing: {
    label: 'Sedang Diproses 📦',
    detail: 'Pesananmu sedang dikemas. Kami akan memberitahu ketika pesanan sudah dikirim.',
  },
  shipped: {
    label: 'Sudah Dikirim 🚚',
    detail: 'Pesananmu sedang dalam perjalanan. Semoga cepat sampai!',
  },
  completed: {
    label: 'Selesai ✅',
    detail: 'Pesananmu sudah sampai, terima kasih sudah berbelanja!',
  },
  cancelled: {
    label: 'Dibatalkan ❌',
    detail: 'Pesananmu dibatalkan. Jika ada pertanyaan, silakan hubungi kami.',
  },
}

// ---------------------------------------------------------------------------
// Public API — notifyAdminNewOrder
// ---------------------------------------------------------------------------

export interface NewOrderNotification {
  orderNumber: string
  customerName: string
  customerPhone: string
  totalAmount: number
  shippingCost?: number
  destinationCity?: string
  paymentStatus?: string
  items: { name: string; quantity: number; price: number }[]
  createdAt?: Date | string
}

/**
 * Send a WhatsApp notification to the admin when a new order is placed.
 */
export async function notifyAdminNewOrder(order: NewOrderNotification): Promise<void> {
  const now = order.createdAt ? formatDateTime(order.createdAt) : formatDateTime(new Date())
  const phoneDisplay = formatPhoneDisplay(order.customerPhone)

  // Build item lines
  const itemLines = order.items
    .map((item, i) => {
      const subtotal = item.price * item.quantity
      const nameLine = `${i + 1}. ${item.name}`
      const detailLine = `   ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(subtotal)}`
      return `${nameLine}\n${detailLine}`
    })
    .join('\n')

  // Payment status label
  const paymentLabel = order.paymentStatus === 'paid' ? 'Sudah Dibayar' : 'Menunggu Pembayaran'

  // Compose the full message
  const message = [
    `🛒 *PESANAN BARU!*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📋 Invoice: *${order.orderNumber}*`,
    `👤 Pemesan: ${order.customerName}`,
    `📱 ${phoneDisplay}`,
    order.destinationCity ? `📍 ${order.destinationCity}` : '',
    ``,
    `📦 Item:`,
    itemLines,
    ``,
    `💰 *TOTAL: ${formatRupiah(order.totalAmount)}*`,
    order.shippingCost ? `(Ongkir: ${formatRupiah(order.shippingCost)})` : '',
    `💳 Status: ${paymentLabel}`,
    ``,
    `⏰ ${now}`,
  ]
    .filter(Boolean)
    .join('\n')

  // Send to admin's WhatsApp number
  await sendMessage(WA_NUMBER, message)
}

// ---------------------------------------------------------------------------
// Public API — notifyBuyerStatusUpdate
// ---------------------------------------------------------------------------

export interface StatusUpdateNotification {
  orderNumber: string
  customerPhone: string
  customerName: string
  status: string
  courier?: string
  courierService?: string
}

/**
 * Send a WhatsApp notification to the buyer when their order status changes.
 */
export async function notifyBuyerStatusUpdate(order: StatusUpdateNotification): Promise<void> {
  const statusInfo = STATUS_MESSAGES[order.status]

  if (!statusInfo) {
    console.warn(`[whatsapp] Unknown order status "${order.status}", skipping buyer notification for ${order.orderNumber}`)
    return
  }

  // Build courier info line if available
  const courierLine = order.courier && order.courierService
    ? `\n🚚 Kurir: ${order.courier.toUpperCase()} ${order.courierService}`
    : ''

  const message = [
    `👤 Halo ${order.customerName}!`,
    ``,
    `📦 Pesanan *${order.orderNumber}* kamu sudah *${statusInfo.label}*`,
    courierLine,
    ``,
    `${statusInfo.detail}`,
    ``,
    `Terima kasih sudah berbelanja di GrosirPJ! 🙏`,
  ]
    .filter(Boolean)
    .join('\n')

  // Send to the buyer's WhatsApp number
  const target = formatPhoneForWA(order.customerPhone)
  await sendMessage(target, message)
}
