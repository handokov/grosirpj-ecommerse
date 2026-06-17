'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Search,
  ShoppingCart,
  ClipboardList,
  Truck,
  FileText,
  CreditCard,
  Upload,
  Clock,
  PackageCheck,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Tag,
  Wallet,
  MapPinned,
  Hash,
  Phone,
} from 'lucide-react';
import { BCA_REKENING, getWhatsAppLink } from '@/lib/store-config';

interface Step {
  num: number;
  icon: typeof Search;
  title: string;
  desc: string;
  detail?: string;
}

const steps: Step[] = [
  {
    num: 1,
    icon: Search,
    title: 'Pilih Produk',
    desc: 'Browse kategori baju anak & remaja di halaman beranda, atau gunakan fitur pencarian untuk menemukan produk spesifik.',
    detail: 'Anda bisa langsung klik kategori seperti "Anak-anak", "Balita", atau "Remaja" untuk memfilter produk.',
  },
  {
    num: 2,
    icon: ShoppingCart,
    title: 'Tambah ke Keranjang',
    desc: 'Buka halaman produk, pilih ukuran dan jumlah yang diinginkan, lalu klik tombol "Tambah Keranjang".',
    detail: 'Harga grosir otomatis berlaku saat jumlah mencapai minimal order produk.',
  },
  {
    num: 3,
    icon: ClipboardList,
    title: 'Isi Data Pengiriman',
    desc: 'Pada halaman checkout, isi nama lengkap, nomor WhatsApp aktif, alamat lengkap, dan pilih kota tujuan.',
    detail: 'Pastikan nomor WhatsApp aktif karena admin akan menghubungi via WA untuk konfirmasi.',
  },
  {
    num: 4,
    icon: Truck,
    title: 'Pilih Pengiriman',
    desc: 'Pilih kurir dan layanan pengiriman yang tersedia: JNE, J&T, SiCepat, atau POS.',
    detail: 'Ongkir dihitung otomatis berdasarkan berat paket dan kota tujuan.',
  },
  {
    num: 5,
    icon: FileText,
    title: 'Buat Invoice',
    desc: 'Klik tombol "Buat Invoice". Nomor invoice unik akan muncul dan tersimpan untuk pelacakan.',
    detail: 'Simpan nomor invoice baik-baik — ini digunakan untuk pembayaran dan tracking pesanan.',
  },
  {
    num: 6,
    icon: CreditCard,
    title: 'Bayar',
    desc: `Transfer pembayaran ke rekening BCA ${BCA_REKENING} a.n. Rahmawati sesuai total tagihan pada invoice.`,
    detail: 'Pembayaran harus dilakukan dalam 24 jam sejak invoice dibuat.',
  },
  {
    num: 7,
    icon: Upload,
    title: 'Upload Bukti Bayar',
    desc: 'Upload foto bukti transfer di halaman invoice atau halaman lacak pesanan dengan memasukkan nomor invoice.',
    detail: 'Tanpa bukti transfer, admin tidak dapat memverifikasi pembayaran Anda.',
  },
  {
    num: 8,
    icon: Clock,
    title: 'Tunggu Konfirmasi',
    desc: 'Admin akan memverifikasi pembayaran Anda. Proses verifikasi biasanya 1–3 jam pada jam kerja.',
    detail: 'Anda akan mendapat notifikasi via WhatsApp ketika pesanan dikonfirmasi.',
  },
  {
    num: 9,
    icon: PackageCheck,
    title: 'Pesanan Dikirim',
    desc: 'Admin mengemas dan mengirim pesanan ke kurir. Status pesanan diupdate menjadi "Dikirim".',
    detail: 'Nomor resi akan diinput oleh admin dan bisa dilihat di halaman lacak pesanan.',
  },
  {
    num: 10,
    icon: MapPin,
    title: 'Lacak Pesanan',
    desc: 'Cek status pesanan di halaman /lacak dengan memasukkan nomor invoice Anda.',
    detail: 'Status akan berubah: Menunggu → Dikonfirmasi → Diproses → Dikirim → Selesai.',
  },
];

const tips = [
  {
    icon: Tag,
    title: 'Minimal Order per Produk',
    desc: 'Setiap produk memiliki ketentuan minimal order sendiri. Periksa deskripsi produk sebelum memesan.',
  },
  {
    icon: Wallet,
    title: 'Harga Grosir Otomatis',
    desc: 'Harga grosir akan otomatis berlaku saat Anda mencapai minimal order. Tidak perlu kode khusus.',
  },
  {
    icon: MapPinned,
    title: 'Estimasi Ongkir Otomatis',
    desc: 'Estimasi ongkir akan muncul otomatis setelah Anda memilih kota tujuan di halaman checkout.',
  },
  {
    icon: Hash,
    title: 'Simpan Nomor Invoice',
    desc: 'Nomor invoice adalah kunci untuk pembayaran, upload bukti bayar, dan tracking pesanan.',
  },
];

export default function CaraBelanjaPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full translate-y-16 -translate-x-16" />
        <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16">
          <Breadcrumb className="mb-4">
            <BreadcrumbList className="text-emerald-100">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-emerald-100 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-emerald-200/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium">Cara Belanja</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Badge className="bg-amber-400 text-gray-900 hover:bg-amber-400 mb-3">
            <ShoppingCart className="h-3 w-3 mr-1" /> Panduan Lengkap
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Cara Belanja</h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl">
            Belanja grosir baju anak & remaja di GrosirPJ sangat mudah. Ikuti 10 langkah berikut dari
            memilih produk hingga pesanan sampai di rumah Anda.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Quick Info */}
        <Card className="border-emerald-100 mb-8 bg-emerald-50/40">
          <CardContent className="pt-6 grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Rekening BCA</div>
                <div className="text-sm font-semibold text-gray-900">{BCA_REKENING}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Atas Nama</div>
                <div className="text-sm font-semibold text-gray-900">Rahmawati</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Batas Pembayaran</div>
                <div className="text-sm font-semibold text-gray-900">24 Jam</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4 md:space-y-5">
          {steps.map((step, idx) => (
            <div key={step.num} className="relative">
              <Card className="border-emerald-100 hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                    {/* Number + Icon */}
                    <div className="flex sm:flex-col items-center gap-3 sm:gap-2 shrink-0">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md">
                          <step.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center border-2 border-white">
                          {step.num}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">{step.desc}</p>
                      {step.detail && (
                        <div className="flex gap-2 items-start text-xs text-emerald-700 bg-emerald-50 rounded-lg p-2.5">
                          <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{step.detail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Connector arrow between steps (desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex justify-center py-1">
                  <ArrowRight className="h-4 w-4 text-emerald-300 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <section className="mt-12">
          <div className="text-center mb-6">
            <Badge variant="outline" className="border-amber-300 text-amber-700 mb-2">
              <Lightbulb className="h-3 w-3 mr-1" /> Tips Penting
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Tips Belanja Grosir</h2>
            <Separator className="mt-3 mx-auto w-20 bg-emerald-300" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <Card key={i} className="border-emerald-100 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <tip.icon className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                        {tip.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tracking CTA */}
        <Card className="mt-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50/40">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-800 text-base mb-1">
                  Sudah pesan? Lacak status pesananmu
                </h3>
                <p className="text-sm text-gray-600">
                  Masukkan nomor invoice di halaman lacak pesanan untuk cek status real-time.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Link href="/lacak">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white h-11 px-5 rounded-xl w-full sm:w-auto">
                  <MapPin className="h-4 w-4 mr-2" /> Lacak Pesanan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp CTA */}
        <Card className="mt-4 border-emerald-200">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-semibold text-emerald-800 text-base mb-1">Butuh bantuan?</h3>
              <p className="text-sm text-gray-600">
                Admin kami siap membantu proses belanja Anda via WhatsApp.
              </p>
            </div>
            <a
              href={getWhatsAppLink('Halo GrosirPJ, saya butuh bantuan cara belanja')}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold h-11 px-5 rounded-xl">
                <Phone className="h-4 w-4 mr-2" /> Chat Admin
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="flex justify-center pt-8 pb-4">
          <Link href="/">
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
