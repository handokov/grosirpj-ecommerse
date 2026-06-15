'use client'

import { ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type OrderItem } from '@/types'
import { formatRupiah } from '@/lib/format'
import { getFirstImageUrl } from '@/lib/image-utils'
import { SupplierInfoBadges } from './SupplierInfoBadges'

interface OrderItemsTableProps {
  items: OrderItem[]
  totalAmount: number
}

export function OrderItemsTable({ items, totalAmount }: OrderItemsTableProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <ShoppingCart className="w-3.5 h-3.5 text-violet-500" />
          </div>
          <CardTitle className="text-sm font-bold">Item Pesanan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-[11px] h-9">Gambar</TableHead>
                <TableHead className="text-[11px]">Produk</TableHead>
                <TableHead className="text-[11px] text-center">Ukuran</TableHead>
                <TableHead className="text-[11px] text-center">Jumlah</TableHead>
                <TableHead className="text-[11px] text-right">Harga</TableHead>
                <TableHead className="text-[11px] text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => {
                const productName = item.product?.name || item.productName
                const productImage = item.product?.images || item.productImage
                const supplierName = item.product?.supplierName ?? null
                const supplierLink = item.product?.supplierLink ?? null
                const supplierPhone = item.product?.supplierPhone ?? null
                return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                      {productImage ? (
                        <img
                          src={getFirstImageUrl(productImage)}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 text-xs">
                      {productName}
                    </span>
                    {/* Supplier Info - only visible in seller dashboard */}
                    <SupplierInfoBadges
                      supplierName={supplierName}
                      supplierLink={supplierLink}
                      supplierPhone={supplierPhone}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {item.size ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {item.size}
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs text-gray-600">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right text-xs text-gray-600">
                    {formatRupiah(item.price)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-gray-900">
                    {formatRupiah(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              )
              })}

            </TableBody>
          </Table>
        </div>

        {/* Total */}
        <div className="border-t px-5 py-3.5 flex items-center justify-end gap-5">
          <span className="text-xs text-gray-400">Total Pesanan</span>
          <span className="text-lg font-bold text-emerald-700">
            {formatRupiah(totalAmount)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
