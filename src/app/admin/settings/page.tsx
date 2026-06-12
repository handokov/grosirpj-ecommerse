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

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Toko</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola informasi toko dan pengaturan akun
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shop Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <CardTitle className="text-base">Informasi Toko</CardTitle>
                <CardDescription>Detail toko GrosirPJ</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Nama Toko</span>
              <span className="text-sm font-medium text-gray-900">
                GrosirPJ
              </span>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Deskripsi</span>
              <span className="text-sm text-gray-700">
                Toko grosir baju anak & remaja — Harga OK Kualitas OK
              </span>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Telepon</span>
              <span className="text-sm text-gray-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                +62 812-8175-6262
              </span>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Email</span>
              <span className="text-sm text-gray-900 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                info@grosirpj.com
              </span>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Alamat</span>
              <span className="text-sm text-gray-900 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>Indonesia</span>
              </span>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Terdaftar</span>
              <span className="text-sm text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                2025
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Account Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <CardTitle className="text-base">Akun Admin</CardTitle>
                <CardDescription>Informasi akun administrator</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Nama</span>
              <span className="text-sm font-medium text-gray-900">Admin</span>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Email</span>
              <span className="text-sm text-gray-900">admin@grosirpj.com</span>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Peran</span>
              <Badge
                variant="outline"
                className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700"
              >
                <Shield className="w-3 h-3 mr-1" />
                Administrator
              </Badge>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-28">Status</span>
              <Badge
                variant="outline"
                className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700"
              >
                Aktif
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">
              Fitur Pengaturan Segera Hadir
            </h3>
            <p className="text-sm text-emerald-600 max-w-md">
              Fitur pengaturan toko akan segera hadir! Anda akan dapat mengubah
              informasi toko, metode pembayaran, pengiriman, dan lainnya.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <Badge
                variant="outline"
                className="text-xs bg-white/80 border-emerald-200 text-emerald-700"
              >
                <Settings className="w-3 h-3 mr-1" />
                Pengaturan Toko
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-white/80 border-emerald-200 text-emerald-700"
              >
                <Store className="w-3 h-3 mr-1" />
                Metode Pembayaran
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-white/80 border-emerald-200 text-emerald-700"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Pengiriman
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
