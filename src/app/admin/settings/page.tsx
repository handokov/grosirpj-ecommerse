'use client'

import Link from 'next/link'
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
  ArrowRight,
  CheckCircle2,
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
import { cn } from '@/lib/utils'

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

      {/* Fitur Pengaturan */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Pengaturan Fitur</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pengaturan Toko - Coming Soon */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-[9px] bg-gray-100 border-gray-200 text-gray-400">
                Segera Hadir
              </Badge>
            </div>
            <Settings className="w-5 h-5 text-gray-400 mb-2" />
            <p className="text-xs font-semibold text-gray-900">Pengaturan Toko</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Ubah nama, logo, dan informasi toko</p>
          </div>

          {/* Metode Pembayaran - Coming Soon */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-[9px] bg-gray-100 border-gray-200 text-gray-400">
                Segera Hadir
              </Badge>
            </div>
            <CreditCard className="w-5 h-5 text-gray-400 mb-2" />
            <p className="text-xs font-semibold text-gray-900">Metode Pembayaran</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Atur metode pembayaran yang tersedia</p>
          </div>

          {/* Pengiriman - AKTIF */}
          <Link href="/admin/shipping" className="block">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer relative overflow-hidden group">
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="text-[9px] bg-emerald-100 border-emerald-300 text-emerald-700">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                  Aktif
                </Badge>
              </div>
              <Truck className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-xs font-semibold text-gray-900">Pengiriman</p>
              <p className="text-[10px] text-gray-600 mt-0.5">Atur zona & tarif pengiriman</p>
              <div className="flex items-center gap-1 mt-3 text-[10px] font-medium text-emerald-700 group-hover:text-emerald-800">
                Kelola Ongkir
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

