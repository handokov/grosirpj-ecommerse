'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Settings,
  Shield,
  Pencil,
  CreditCard,
  Truck,
  ArrowRight,
  CheckCircle2,
  Database,
  Loader2,
  AlertCircle,
  MessageCircle,
  Wifi,
  WifiOff,
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
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    message: string
    details?: string[]
  } | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [schemaStatus, setSchemaStatus] = useState<{
    status: string
    checks: { column: string; exists: boolean }[]
  } | null>(null)
  const [waBotStatus, setWaBotStatus] = useState<{
    available: boolean
    status?: string
    queued?: number
  } | null>(null)
  const [checkingWA, setCheckingWA] = useState(false)

  const checkWABotStatus = async () => {
    setCheckingWA(true)
    try {
      const res = await fetch('/api/admin/wa-bot/status')
      const data = await res.json()
      setWaBotStatus(data)
    } catch {
      setWaBotStatus({ available: false })
    } finally {
      setCheckingWA(false)
    }
  }

  const checkSchemaStatus = async () => {
    setCheckingStatus(true)
    setMigrationResult(null)
    try {
      const res = await fetch('/api/admin/migrate')
      const data = await res.json()
      setSchemaStatus(data)
    } catch {
      setSchemaStatus({ status: 'error', checks: [] })
    } finally {
      setCheckingStatus(false)
    }
  }

  const runMigration = async () => {
    setMigrating(true)
    setMigrationResult(null)
    try {
      const res = await fetch('/api/admin/migrate', { method: 'POST' })
      const data = await res.json()
      setMigrationResult({
        success: data.success,
        message: data.message || data.error || 'Unknown result',
        details: data.details,
      })
      // Refresh status after migration
      await checkSchemaStatus()
    } catch (err) {
      setMigrationResult({
        success: false,
        message: err instanceof Error ? err.message : 'Gagal menjalankan migrasi',
      })
    } finally {
      setMigrating(false)
    }
  }

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

      {/* Database Migration Section */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Database & Migrasi</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Database className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900">Migrasi Database</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Jalankan migrasi schema jika ada kolom/tabel yang belum ada di database production
                </p>
              </div>
            </div>

            {/* Schema Status */}
            {schemaStatus && (
              <div className={cn(
                'p-3 rounded-lg text-[11px]',
                schemaStatus.status === 'ok'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : schemaStatus.status === 'needs_migration'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-red-50 border border-red-200'
              )}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {schemaStatus.status === 'ok' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : schemaStatus.status === 'needs_migration' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {schemaStatus.status === 'ok'
                      ? 'Semua schema sudah up to date'
                      : schemaStatus.status === 'needs_migration'
                        ? 'Ada kolom/tabel yang perlu dimigrasi'
                        : 'Gagal mengecek status schema'}
                  </span>
                </div>
                {schemaStatus.checks.length > 0 && (
                  <div className="space-y-1 ml-5">
                    {schemaStatus.checks.map((check) => (
                      <div key={check.column} className="flex items-center gap-1.5">
                        <span className={check.exists ? 'text-emerald-600' : 'text-amber-600'}>
                          {check.exists ? '✓' : '✗'}
                        </span>
                        <span className="text-gray-700">{check.column}</span>
                        {!check.exists && (
                          <Badge variant="outline" className="text-[8px] bg-amber-100 border-amber-300 text-amber-700 ml-1">
                            missing
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Migration Result */}
            {migrationResult && (
              <div className={cn(
                'p-3 rounded-lg text-[11px]',
                migrationResult.success
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-red-50 border border-red-200'
              )}>
                <div className="flex items-center gap-1.5 mb-1">
                  {migrationResult.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  )}
                  <span className="font-semibold">{migrationResult.message}</span>
                </div>
                {migrationResult.details && migrationResult.details.length > 0 && (
                  <div className="space-y-0.5 ml-5 mt-1">
                    {migrationResult.details.map((detail, idx) => (
                      <div key={idx} className="text-gray-600">{detail}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={checkSchemaStatus}
                disabled={checkingStatus}
              >
                {checkingStatus ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Database className="w-3 h-3 mr-1" />
                )}
                Cek Status
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 bg-amber-600 hover:bg-amber-700"
                onClick={runMigration}
                disabled={migrating}
              >
                {migrating ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Database className="w-3 h-3 mr-1" />
                )}
                Jalankan Migrasi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Bot Status */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">WhatsApp Bot</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900">Notifikasi WhatsApp Otomatis</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Kirim notifikasi WA otomatis ke admin saat ada pesanan baru & ke buyer saat status berubah
                </p>
              </div>
            </div>

            {/* WA Bot Status */}
            {waBotStatus && (
              <div className={cn(
                'p-3 rounded-lg text-[11px]',
                waBotStatus.available && waBotStatus.status === 'connected'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : waBotStatus.available && waBotStatus.status !== 'connected'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-red-50 border border-red-200'
              )}>
                <div className="flex items-center gap-1.5 mb-1">
                  {waBotStatus.available && waBotStatus.status === 'connected' ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  ) : waBotStatus.available ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {waBotStatus.available && waBotStatus.status === 'connected'
                      ? 'WhatsApp Bot Terhubung'
                      : waBotStatus.available
                        ? `Bot ${waBotStatus.status === 'connecting' ? 'Sedang Menghubungkan...' : 'Tidak Terhubung'}`
                        : 'Bot Tidak Aktif'}
                  </span>
                </div>
                <div className="ml-5 text-gray-600 space-y-0.5">
                  {waBotStatus.available ? (
                    <>
                      <div>Status: {waBotStatus.status}</div>
                      {waBotStatus.queued !== undefined && waBotStatus.queued > 0 && (
                        <div>Pesan antrian: {waBotStatus.queued}</div>
                      )}
                    </>
                  ) : (
                    <div>
                      Bot WA belum berjalan. Jalankan:{' '}
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-mono">
                        cd mini-services/wa-bot && bun run dev
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={checkWABotStatus}
                disabled={checkingWA}
              >
                {checkingWA ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Wifi className="w-3 h-3 mr-1" />
                )}
                Cek Status Bot
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-[10px] text-gray-500 space-y-1">
              <p className="font-medium text-gray-600">Cara setup WhatsApp Bot:</p>
              <ol className="list-decimal ml-4 space-y-0.5">
                <li>Jalankan bot: <code className="bg-gray-100 px-1 rounded font-mono">cd mini-services/wa-bot && bun run dev</code></li>
                <li>Scan QR code yang muncul di terminal dengan WhatsApp GrosirPJ</li>
                <li>Setelah tersambung, notifikasi WA otomatis aktif</li>
              </ol>
              <p className="text-gray-400 mt-1">Alternatif: Set FONNTE_API_KEY di env var untuk pakai Fonnte API</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
