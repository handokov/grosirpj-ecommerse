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
  ShieldCheck,
  Database,
  Workflow,
  Lock,
  Cookie,
  UserCheck,
  Phone,
  Mail,
  ArrowLeft,
  CalendarDays,
  KeyRound,
  Eye,
  FileCheck,
} from 'lucide-react';
import { getWhatsAppLink } from '@/lib/store-config';

interface Point {
  title: string;
  desc: string;
}

interface PrivacySection {
  num: number;
  icon: typeof Database;
  title: string;
  intro?: string;
  points: Point[];
}

const sections: PrivacySection[] = [
  {
    num: 1,
    icon: Database,
    title: 'Data yang Kami Kumpulkan',
    intro:
      'GrosirPJ hanya mengumpulkan data yang diperlukan untuk memproses pesanan dan memberikan layanan terbaik kepada Anda.',
    points: [
      {
        title: 'Data Identitas',
        desc: 'Nama lengkap pembeli untuk pengiriman paket.',
      },
      {
        title: 'Nomor Telepon / WhatsApp',
        desc: 'Digunakan untuk menghubungi Anda terkait pesanan dan konfirmasi pembayaran.',
      },
      {
        title: 'Alamat Pengiriman',
        desc: 'Alamat lengkap beserta kota dan provinsi tujuan untuk pengiriman.',
      },
      {
        title: 'Data Pesanan',
        desc: 'Detail produk, jumlah, ukuran, dan total pembayaran yang Anda pesan.',
      },
      {
        title: 'Bukti Pembayaran',
        desc: 'Foto bukti transfer yang Anda upload untuk verifikasi pembayaran.',
      },
    ],
  },
  {
    num: 2,
    icon: Workflow,
    title: 'Penggunaan Data',
    intro: 'Data yang kami kumpulkan digunakan secara terbatas untuk tujuan berikut:',
    points: [
      {
        title: 'Memproses Pesanan',
        desc: 'Mengelola transaksi dari checkout hingga pengiriman paket sampai tujuan.',
      },
      {
        title: 'Menghubungi terkait Order',
        desc: 'Mengkonfirmasi pesanan, pembayaran, dan status pengiriman.',
      },
      {
        title: 'Meningkatkan Layanan',
        desc: 'Menganalisis pola pesanan untuk menambah produk dan layanan yang lebih relevan.',
      },
      {
        title: 'Kepentingan Operasional',
        desc: 'Meneruskan data ke kurir (nama, alamat, telepon) semata-mata untuk keperluan pengiriman.',
      },
    ],
  },
  {
    num: 3,
    icon: Lock,
    title: 'Perlindungan Data',
    intro:
      'Kami menjaga keamanan data Anda dengan praktik perlindungan yang wajar dan sesuai standar.',
    points: [
      {
        title: 'Enkripsi',
        desc: 'Data sensitif disimpan dengan enkripsi dan transmisi data melalui koneksi aman (HTTPS).',
      },
      {
        title: 'Akses Terbatas',
        desc: 'Akses ke data pelanggan hanya diberikan kepada admin yang berwenang dan memerlukan data tersebut untuk menjalankan tugasnya.',
      },
      {
        title: 'Tidak Dijual ke Pihak Ketiga',
        desc: 'GrosirPJ tidak akan pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga manapun.',
      },
      {
        title: 'Penyimpanan Terbatas',
        desc: 'Data disimpan selama diperlukan untuk keperluan transaksi dan administrasi, sesuai ketentuan hukum yang berlaku.',
      },
    ],
  },
  {
    num: 4,
    icon: Cookie,
    title: 'Cookie',
    intro:
      'Situs GrosirPJ menggunakan cookie untuk menjaga fungsi dasar situs tetap berjalan dengan baik.',
    points: [
      {
        title: 'Cookie Essential',
        desc: 'Kami hanya menggunakan cookie yang diperlukan untuk fungsi dasar situs (mis. menyimpan item di keranjang belanja).',
      },
      {
        title: 'Tidak Tracking Pihak Ketiga',
        desc: 'Saat ini kami tidak menggunakan tracking cookie pihak ketiga seperti iklan atau analitik eksternal.',
      },
      {
        title: 'Pengaturan Browser',
        desc: 'Anda dapat mengatur browser untuk menolak cookie, namun beberapa fitur situs mungkin tidak berfungsi optimal.',
      },
    ],
  },
  {
    num: 5,
    icon: UserCheck,
    title: 'Hak Pengguna',
    intro: 'Sebagai pemilik data, Anda memiliki hak-hak berikut:',
    points: [
      {
        title: 'Hak Akses Data',
        desc: 'Anda dapat meminta salinan data pribadi yang kami simpan tentang Anda.',
      },
      {
        title: 'Hak Penghapusan Data',
        desc: 'Anda dapat meminta penghapusan data pribadi Anda dari sistem kami, kecuali data yang wajib disimpan oleh hukum.',
      },
      {
        title: 'Hak Koreksi',
        desc: 'Apabila data Anda tidak akurat, Anda dapat meminta koreksi dengan menghubungi admin kami.',
      },
      {
        title: 'Penarikan Persetujuan',
        desc: 'Anda dapat menarik persetujuan penggunaan data kapan saja dengan menghubungi kami via WhatsApp.',
      },
    ],
  },
  {
    num: 6,
    icon: Phone,
    title: 'Kontak',
    intro: 'Untuk pertanyaan terkait kebijakan privasi, silakan hubungi kami melalui:',
    points: [
      {
        title: 'WhatsApp',
        desc: '0812-8175-6262 (Senin–Sabtu, 08:00–17:00 WIB).',
      },
      {
        title: 'Email',
        desc: 'info@grosirpj.com — kami akan merespons dalam 1×24 jam pada hari kerja.',
      },
    ],
  },
];

export default function KebijakanPrivasiPage() {
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
                <BreadcrumbPage className="text-white font-medium">Kebijakan Privasi</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Badge className="bg-amber-400 text-gray-900 hover:bg-amber-400 mb-3">
            <ShieldCheck className="h-3 w-3 mr-1" /> Privasi & Keamanan
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Kebijakan Privasi</h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl mb-3">
            Privasi Anda penting bagi kami. Pelajari bagaimana GrosirPJ mengumpulkan, menggunakan,
            dan melindungi data pribadi Anda.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-100 bg-white/10 rounded-full px-3 py-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Terakhir diperbarui: 16 Juni 2026
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Intro Card */}
        <Card className="border-emerald-100 mb-8 bg-emerald-50/40">
          <CardContent className="pt-6 flex gap-4">
            <KeyRound className="h-6 w-6 text-emerald-700 shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">
              Kebijakan privasi ini menjelaskan bagaimana <span className="font-semibold text-emerald-700">GrosirPJ</span>{' '}
              mengumpulkan, menggunakan, dan melindungi data pribadi Anda ketika berbelanja di situs kami.
              Dengan menggunakan layanan kami, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
            </p>
          </CardContent>
        </Card>

        {/* Highlights */}
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <Card className="border-emerald-100 text-center">
            <CardContent className="pt-6">
              <Lock className="h-6 w-6 text-emerald-700 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">Enkripsi Data</div>
              <div className="text-xs text-gray-500 mt-1">Koneksi aman HTTPS</div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 text-center">
            <CardContent className="pt-6">
              <Eye className="h-6 w-6 text-emerald-700 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">Akses Terbatas</div>
              <div className="text-xs text-gray-500 mt-1">Hanya admin berwenang</div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 text-center">
            <CardContent className="pt-6">
              <FileCheck className="h-6 w-6 text-emerald-700 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">Tidak Diperjualbelikan</div>
              <div className="text-xs text-gray-500 mt-1">Data Anda aman</div>
            </CardContent>
          </Card>
        </div>

        {/* TOC */}
        <Card className="border-emerald-100 mb-8">
          <CardHeader>
            <CardTitle className="text-emerald-800 text-base md:text-lg">Daftar Isi</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.num}>
                  <a
                    href={`#section-${s.num}`}
                    className="text-gray-600 hover:text-emerald-700 transition-colors"
                  >
                    <span className="font-semibold text-emerald-700">{s.num}.</span> {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((s) => (
            <Card key={s.num} id={`section-${s.num}`} className="border-emerald-100 scroll-mt-20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <s.icon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-emerald-600 mb-0.5">
                      Bagian {s.num}
                    </div>
                    <CardTitle className="text-emerald-800 text-base md:text-lg">{s.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {s.intro && (
                  <p className="text-sm text-gray-700 leading-relaxed">{s.intro}</p>
                )}
                <Separator />
                <ul className="space-y-3.5">
                  {s.points.map((p, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                        {s.num}.{idx + 1}
                      </span>
                      <div className="text-sm pt-0.5">
                        <span className="font-semibold text-gray-900">{p.title}.</span>{' '}
                        <span className="text-gray-600 leading-relaxed">{p.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="mt-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50/40">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-emerald-800 text-base mb-3">Hubungi Kami</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href={getWhatsAppLink('Halo GrosirPJ, saya ingin bertanya tentang kebijakan privasi')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">WhatsApp</div>
                  <div className="text-sm font-semibold text-gray-900">0812-8175-6262</div>
                </div>
              </a>
              <a
                href="mailto:info@grosirpj.com"
                className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-sm font-semibold text-gray-900 truncate">info@grosirpj.com</div>
                </div>
              </a>
            </div>
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
