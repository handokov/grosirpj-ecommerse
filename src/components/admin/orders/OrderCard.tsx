import { ShoppingCart, Phone, MapPin, RefreshCw, Eye, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Order } from '@/types'
import { STATUS_CONFIG, PAYMENT_CONFIG, PAYMENT_METHOD_LABELS } from '@/lib/order-config'
import { getFirstImageUrl } from '@/lib/image-utils'
import { SupplierInfoBadges } from './SupplierInfoBadges'

interface OrderCardProps {
  order: Order
  onStatusUpdate: (order: Order) => void
  onViewDetail: (orderId: string) => void
}

export function OrderCard({ order, onStatusUpdate, onViewDetail }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status]
  const paymentConfig = PAYMENT_CONFIG[order.paymentStatus]

  return (
    <Card className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-900">
              {order.orderNumber}
            </span>
            <span className="text-[10px] text-gray-400">•</span>
            <span className="text-[10px] text-gray-500">
              {formatDate(order.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-[10px] font-semibold gap-1', statusConfig.color, statusConfig.bg)}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dotColor)} />
              {statusConfig.label}
            </Badge>
            <Badge
              variant="outline"
              className={cn('text-[10px] font-semibold', paymentConfig.color, paymentConfig.bg)}
            >
              {paymentConfig.label}
            </Badge>
            {order.paymentProof && (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold text-blue-600 bg-blue-50 border-blue-200 gap-1"
              >
                <ImageIcon className="w-2.5 h-2.5" />
                Bukti
              </Badge>
            )}
          </div>
        </div>

        {/* Customer + Items row */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 text-xs mb-3">
            <span className="font-semibold text-gray-900">{order.customerName}</span>
            {order.customerPhone && (
              <div className="flex items-center gap-1 text-gray-500">
                <Phone className="w-3 h-3" />
                <span className="text-[10px]">{order.customerPhone}</span>
              </div>
            )}
            {order.customerAddr && (
              <div className="hidden md:flex items-center gap-1 text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] truncate max-w-[200px]">
                  {order.customerAddr}
                </span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2">
            {order.items.map(item => {
              const productName = item.product?.name || item.productName
              const productImage = item.product?.images || item.productImage
              const supplierName = item.product?.supplierName ?? null
              const supplierLink = item.product?.supplierLink ?? null
              const supplierPhone = item.product?.supplierPhone ?? null
              return (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-100 flex-shrink-0 overflow-hidden">
                  {productImage ? (
                    <img
                      src={getFirstImageUrl(productImage)}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {productName}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    {item.size && <span>Ukuran: {item.size}</span>}
                    {item.color && <span>Warna: {item.color}</span>}
                    {item.variant && <span>{item.product?.variantName || 'Varian'}: {item.variant}</span>}
                    <span>{item.quantity}x {formatRupiah(item.price)}</span>
                  </div>
                  {/* Supplier Info */}
                  <SupplierInfoBadges
                    supplierName={supplierName}
                    supplierLink={supplierLink}
                    supplierPhone={supplierPhone}
                  />
                </div>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-medium">Total Pesanan</span>
            <span className="text-base font-bold text-emerald-800">
              {formatRupiah(order.totalAmount)}
            </span>
            <span className="text-[10px] text-gray-400 hidden sm:inline">
              via {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(order)}
              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[11px] h-8"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Update Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetail(order.id)}
              className="text-gray-600 border-gray-200 hover:bg-gray-50 text-[11px] h-8"
            >
              <Eye className="w-3 h-3 mr-1" />
              Detail
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
