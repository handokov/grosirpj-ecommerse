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
  Tag,
  ShieldCheck,
  Truck,
  Headphones,
  Target,
  Eye,
  Phone,
  ArrowLeft,
  Sparkles,
  Users,
  Package,
  MapPin,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';
import { getWhatsAppLink } from '@/lib/store-config';

export default function TentangPage() {
  const misi = [
    {
      title: 'Harga Kompetitif',
      desc: 'Menyediakan baju anak & remaja dengan harga grosir terjangkau untuk semua kalangan.',
    },
    {
      title: 'Kualitas Terjamin',
      desc: 'Memilih bahan dan jahitan terbaik agar nyaman dipakai anak-anak seharian.',
    },
    {
      title: 'Pelayanan Cepat',
      desc: 'Admin responsif via WhatsApp siap bantu pemesanan dari pagi hingga sore.',
    },
    {
      title: 'Pengiriman Seluruh Indonesia',
      desc: 'Melayani pengiriman ke 34 provinsi dengan kurir JNE, J&T, SiCepat, dan POS.',
    },
  ];

  const keunggulan = [
    {
      icon: Tag,
      title: 'Harga Grosir Terjangkau',
      desc: 'Mulai dari harga grosir eceran dengan minimum order yang ringan untuk reseller pemula.',
    },
    {
      icon: ShieldCheck,
      title: 'Kualitas Terjamin',
      desc: 'Setiap produk dicek kualitasnya sebelum dikirim agar sesuai foto dan deskripsi.',
    },
    {
      icon: Truck,
      title: 'Pengiriman Seluruh Indonesia',
      desc: 'Kirim ke seluruh provinsi dengan pilihan kurir lengkap dan ongkir otomatis.',
    },
    {
      icon: Headphones,
      title: 'Layanan Responsif via WhatsApp',
      desc: 'Admin siap bantu konsultasi ukuran, stok, dan status pesanan setiap hari kerja.',
    },
  ];

  const stats = [
    { icon: Users, value: '30.000+', label: 'Reseller' },
    { icon: Package, value: '500+', label: 'Produk' },
    { icon: MapPin, value: '34', label: 'Provinsi' },
    { icon: CalendarDays, value: '5+', label: 'Tahun Pengalaman' },
  ];

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
                <BreadcrumbPage className="text-white font-medium">Tentang Kami</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Badge className="bg-amber-400 text-gray-900 hover:bg-amber-400 mb-3">
            <Sparkles className="h-3 w-3 mr-1" /> Sejak 2021
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Tentang GrosirPJ
          </h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl">
            GrosirPJ hadir untuk menyediakan baju anak & remaja berkualitas dengan harga grosir
            yang terjangkau. Misi kami sederhana — Harga OK, Kualitas OK.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {/* Story */}
        <section>
          <Card className="border-emerald-100">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-emerald-700" />
                </div>
                <CardTitle className="text-emerald-800 text-lg md:text-xl">Cerita Kami</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <p>
                GrosirPJ didirikan dengan misi menyediakan baju anak & remaja berkualitas dengan
                harga grosir yang terjangkau. Berawal dari toko kecil di Tanah Abang, kami melihat
                banyak reseller pemula kesulitan mendapatkan supplier yang konsisten dengan
                kualitas dan harga yang stabil.
              </p>
              <p>
                Dari situlah GrosirPJ lahir — platform grosir online yang menggabungkan kemudahan
                belanja digital dengan kepercayaan supplier konvensional. Setiap produk dipilih
                langsung oleh tim kurasi kami, mulai dari bahan kain, jahitan, hingga ukuran yang
                sesuai standar anak Indonesia.
              </p>
              <p>
                Hari ini, GrosirPJ dipercaya oleh 30.000+ reseller di 34 provinsi dan terus bertumbuh
                berkat dukungan pelanggan setia.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Visi & Misi */}
        <section className="grid md:grid-cols-2 gap-4 md:gap-6">
          <Card className="border-emerald-100">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-emerald-700" />
                </div>
                <CardTitle className="text-emerald-800 text-lg">Visi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 leading-relaxed">
              Menjadi platform grosir baju anak <span className="font-semibold text-emerald-700">#1 di Indonesia</span>{' '}
              yang dipercaya oleh reseller dan konsumen melalui kombinasi harga kompetitif, kualitas
              terjamin, dan pelayanan terbaik.
            </CardContent>
          </Card>

          <Card className="border-emerald-100">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-emerald-700" />
                </div>
                <CardTitle className="text-emerald-800 text-lg">Misi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {misi.map((m, i) => (
                  <li key={i} className="flex gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">{m.title}.</span>{' '}
                      <span className="text-gray-600">{m.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Kenapa pilih GrosirPJ */}
        <section>
          <div className="text-center mb-6">
            <Badge variant="outline" className="border-emerald-200 text-emerald-700 mb-2">
              Kenapa Pilih Kami
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Keunggulan GrosirPJ
            </h2>
            <Separator className="mt-3 mx-auto w-20 bg-emerald-300" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {keunggulan.map((k, i) => (
              <Card key={i} className="border-emerald-100 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <k.icon className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                        {k.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{k.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s, i) => (
              <Card key={i} className="border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white">
                <CardContent className="pt-6 text-center">
                  <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                    <s.icon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-emerald-800">
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 p-6 md:p-10 text-white">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full -translate-y-12 translate-x-12" />
            <div className="relative max-w-2xl">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Siap bergabung?</h2>
              <p className="text-emerald-100 text-sm md:text-base mb-5">
                Jadilah bagian dari 30.000+ reseller yang sudah sukses jualan baju anak bersama
                GrosirPJ. Chat admin kami sekarang untuk mulai.
              </p>
              <a
                href={getWhatsAppLink('Halo GrosirPJ, saya ingin bertanya tentang cara menjadi reseller')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold h-11 px-6 rounded-xl">
                  <Phone className="h-4 w-4 mr-2" /> Chat via WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Back to home */}
        <div className="flex justify-center pt-2 pb-4">
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
