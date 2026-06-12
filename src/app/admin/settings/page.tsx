'use client'

import {
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Settings,
  Sparkles,
  Shield,
  Pencil,
  Globe,
  CreditCard,
  Truck,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan Toko</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Kelola informasi toko dan pengaturan akun
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Shop Info Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Store className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Informasi Toko</CardTitle>
                  <CardDescription className="text-[10px]">Detail toko GrosirPJ</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-emerald-700 hover:bg-emerald-50 h-7">
                <Pencil className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Nama Toko', value: 'GrosirPJ', icon: Store },
              { label: 'Deskripsi', value: 'Toko grosir baju anak & remaja — Harga OK Kualitas OK', icon: null },
              { label: 'Telepon', value: '+62 812-8175-6262', icon: Phone },
              { label: 'Email', value: 'info@grosirpj.com', icon: Mail },
              { label: 'Alamat', value: 'Indonesia', icon: MapPin },
              { label: 'Terdaftar', value: '2025', icon: Clock },
            ].map((item, idx) => (
              <div key={item.label}>
                <div className="flex items-start gap-3">
                  <span className="text-[11px] text-gray-400 w-24 shrink-0">{item.label}</span>
                  <span className="text-xs text-gray-900 flex items-center gap-1.5">
                    {item.icon && <item.icon className="w-3 h-3 text-gray-400" />}
                    <span className={item.label === 'Nama Toko' ? 'font-semibold' : 'font-normal'}>
                      {item.value}
                    </span>
                  </span>
                </div>
                {idx < 5 && <Separator className="mt-3 opacity-50" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
                <User className="w-4 h-4 text-sky-700" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Akun Admin</CardTitle>
                <CardDescription className="text-[10px]">Informasi akun administrator</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Nama', value: 'Admin', icon: User },
              { label: 'Email', value: 'admin@grosirpj.com', icon: Mail },
              { label: 'Peran', value: 'Administrator', icon: Shield, badge: true },
              { label: 'Status', value: 'Aktif', icon: null, badge: true, active: true },
            ].map((item, idx) => (
              <div key={item.label}>
                <div className="flex items-start gap-3">
                  <span className="text-[11px] text-gray-400 w-24 shrink-0">{item.label}</span>
                  {item.badge ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-semibold',
                        item.active
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-sky-50 border-sky-200 text-sky-700'
                      )}
                    >
                      {item.icon && <item.icon className="w-3 h-3 mr-1" />}
                      {item.value}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-900 flex items-center gap-1.5">
                      {item.icon && <item.icon className="w-3 h-3 text-gray-400" />}
                      <span className="font-medium">{item.value}</span>
                    </span>
                  )}
                </div>
                {idx < 3 && <Separator className="mt-3 opacity-50" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Features */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Fitur Segera Hadir</h3>
              <p className="text-[11px] text-emerald-100">Fitur pengaturan toko yang sedang dikembangkan</p>
            </div>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Settings, label: 'Pengaturan Toko', desc: 'Ubah nama, logo, dan informasi toko' },
              { icon: CreditCard, label: 'Metode Pembayaran', desc: 'Atur metode pembayaran yang tersedia' },
              { icon: Truck, label: 'Pengiriman', desc: 'Atur opsi dan biaya pengiriman' },
            ].map(feature => (
              <div key={feature.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <feature.icon className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="text-xs font-semibold text-gray-900">{feature.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{feature.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(' ')
}
