// ===== Shared order configuration and utilities =====
// Extracted from admin/orders/page.tsx and admin/orders/[id]/page.tsx
// to eliminate code duplication across the order pages.

import type { OrderStatus, PaymentStatus } from '@/types'
import { Clock, Check, Package, Truck } from 'lucide-react'
import type { ElementType } from 'react'

// ---------- Status Configuration ----------

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; dotColor: string }
> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    dotColor: 'bg-amber-400',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'text-sky-700',
    bg: 'bg-sky-50 border-sky-200',
    dotColor: 'bg-sky-400',
  },
  processing: {
    label: 'Diproses',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    dotColor: 'bg-purple-400',
  },
  shipped: {
    label: 'Dikirim',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    dotColor: 'bg-orange-400',
  },
  completed: {
    label: 'Selesai',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    dotColor: 'bg-emerald-400',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    dotColor: 'bg-red-400',
  },
}

// ---------- Payment Configuration ----------

export const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bg: string }
> = {
  unpaid: {
    label: 'Belum Bayar',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
  },
  paid: {
    label: 'Sudah Bayar',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  refunded: {
    label: 'Dikembalikan',
    color: 'text-gray-700',
    bg: 'bg-gray-100 border-gray-200',
  },
}

// ---------- Payment Method Labels ----------

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  transfer: 'Transfer Bank',
  cod: 'COD (Bayar di Tempat)',
}

// ---------- Status Tabs (for order list page) ----------

export const STATUS_TABS = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

// ---------- Status Steps (for order detail timeline) ----------

export const STATUS_STEPS: {
  key: OrderStatus
  label: string
  icon: ElementType
  color: string
  bgColor: string
}[] = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { key: 'confirmed', label: 'Dikonfirmasi', icon: Check, color: 'text-sky-600', bgColor: 'bg-sky-50' },
  { key: 'processing', label: 'Diproses', icon: Package, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  { key: 'shipped', label: 'Dikirim', icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { key: 'completed', label: 'Selesai', icon: Check, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
]

// ---------- Utility Functions ----------

/**
 * Returns the next status in the order flow, or null if at the end / cancelled.
 */
export function getNextOrderStatus(currentStatus: OrderStatus): OrderStatus | null {
  const flow: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'completed',
  ]
  const currentIndex = flow.indexOf(currentStatus)
  if (currentIndex < 0 || currentIndex >= flow.length - 1) return null
  return flow[currentIndex + 1]
}

/**
 * Formats a phone number into a WhatsApp link.
 * Replaces leading 0 with 62 (Indonesian country code) and strips non-numeric chars.
 */
export function formatWhatsAppLink(phone: string): string {
  return `https://wa.me/${phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`
}
