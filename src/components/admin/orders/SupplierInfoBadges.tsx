import { Phone, Store, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatWhatsAppLink } from '@/lib/order-config'

interface SupplierInfoBadgesProps {
  supplierName: string | null
  supplierLink: string | null
  supplierPhone: string | null
}

export function SupplierInfoBadges({ supplierName, supplierLink, supplierPhone }: SupplierInfoBadgesProps) {
  const hasSupplier = supplierName || supplierLink || supplierPhone
  if (!hasSupplier) return null

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      {supplierName && (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-teal-50 text-teal-700 border-teal-200 font-medium gap-0.5">
          <Store className="w-2.5 h-2.5" />
          {supplierName}
        </Badge>
      )}
      {supplierLink && (
        <a
          href={supplierLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full border bg-blue-50 text-blue-600 border-blue-200 font-medium hover:bg-blue-100 transition-colors"
        >
          <ExternalLink className="w-2.5 h-2.5" />
          Link Toko
        </a>
      )}
      {supplierPhone && (
        <a
          href={formatWhatsAppLink(supplierPhone)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200 font-medium hover:bg-emerald-100 transition-colors"
        >
          <Phone className="w-2.5 h-2.5" />
          {supplierPhone}
        </a>
      )}
    </div>
  )
}
