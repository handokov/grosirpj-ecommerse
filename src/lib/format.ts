/**
 * Format a date string with day, month, year, and time.
 * Default uses long month name; pass `{ month: 'short' }` for abbreviated.
 * Example: "1 Januari 2024, 14:30" / "1 Jan 2024, 14:30"
 */
export function formatDate(
  dateStr: string,
  options?: { month?: 'long' | 'short' }
): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: options?.month ?? 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date string with only day, abbreviated month, and year (no time).
 * Example: "1 Jan 2024"
 */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
  return num.toString();
}

export function calculateDiscount(price: number, wholesalePrice: number): number {
  if (price <= 0) return 0;
  return Math.round(((price - wholesalePrice) / price) * 100);
}
