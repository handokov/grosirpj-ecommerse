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
