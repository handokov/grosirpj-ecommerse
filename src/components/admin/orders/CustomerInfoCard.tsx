'use client'

import { Phone, Mail, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Order } from '@/types'

type CustomerInfo = Pick<Order, 'customerName' | 'customerPhone' | 'customerEmail' | 'customerAddr' | 'destinationCity'>

interface CustomerInfoCardProps {
  order: CustomerInfo
}

export function CustomerInfoCard({ order }: CustomerInfoCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <CardTitle className="text-sm font-bold">Informasi Pelanggan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-2.5">
        <div className="flex items-start gap-3">
          <span className="text-[11px] text-gray-400 w-20 shrink-0">Nama</span>
          <span className="text-xs font-medium text-gray-900">
            {order.customerName}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-[11px] text-gray-400 w-20 shrink-0">Telepon</span>
          <span className="text-xs text-gray-800 flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-gray-400" />
            {order.customerPhone}
          </span>
        </div>
        {order.customerEmail && (
          <div className="flex items-start gap-3">
            <span className="text-[11px] text-gray-400 w-20 shrink-0">Email</span>
            <span className="text-xs text-gray-800 flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-gray-400" />
              {order.customerEmail}
            </span>
          </div>
        )}
        {order.customerAddr && (
          <div className="flex items-start gap-3">
            <span className="text-[11px] text-gray-400 w-20 shrink-0">Alamat</span>
            <span className="text-xs text-gray-800 flex items-start gap-1.5">
              <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{order.customerAddr}</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
