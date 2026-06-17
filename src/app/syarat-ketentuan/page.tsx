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
  FileText,
  User,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  RefreshCcw,
  Lock,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Phone,
} from 'lucide-react';
import { getWhatsAppLink } from '@/lib/store-config';

interface Clause {
  title: string;
  desc: string;
}

interface Section {
  num: number;
  icon: typeof FileText;
  title: string;
  intro?: string;
  clauses: Clause[];
}

const sections: Section[] = [
  {
    num: 1,
    icon: FileText,
    title: 'Ketentuan Umum',
    intro:
      'Dengan mengakses dan menggunakan situs GrosirPJ, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan berikut.',
    clauses: [
      {
        title: 'Penggunaan Situs',
        desc: 'Situs grosirpj-ecommerce.vercel.app disediakan untuk keperluan transaksi grosir baju anak & remaja. Pengguna dilarang menyalahgunakan situs untuk tujuan ilegal.',
      },
      {
        title: 'Perubahan Ketentuan',
        desc: 'GrosirPJ berhak mengubah syarat dan ketentuan kapan saja tanpa pemberitahuan terlebih dahulu. Perubahan berlaku sejak dipublikasikan di halaman ini.',
      },
      {
        title: 'Hukum yang Berlaku',
        desc: 'Seluruh transaksi tunduk pada hukum Republik Indonesia.',
      },
    ],
  },
  {
    num: 2,
    icon: User,
    title: 'Pendaftaran & Akun',
    intro:
      'Sebagian besar pengguna bisa berbelanja tanpa akun. Namun, untuk fitur tertentu, akun diperlukan.',
    clauses: [
      {
        title: 'Pembeli Tanpa Akun',
        desc: 'Pembeli dapat berbelanja langsung tanpa perlu membuat akun. Cukup isi data pengiriman saat checkout.',
      },
      {
        title: 'Akun Admin',
        desc: 'Akun khusus admin diperlukan untuk mengelola produk, pesanan, dan pengaturan toko. Akun admin tidak tersedia untuk umum.',
      },
      {
        title: 'Tanggung Jawab Data',
        desc: 'Pembeli bertanggung jawab atas kebenaran data pengiriman yang dimasukkan. GrosirPJ tidak bertanggung jawab atas keterlambatan atau kegagalan pengiriman akibat data yang salah.',
      },
    ],
  },
  {
    num: 3,
    icon: Package,
    title: 'Produk & Harga',
    intro:
      'Kami berkomitmen menampilkan produk dan harga semaksimal mungkin sesuai kondisi sebenarnya.',
    clauses: [
      {
        title: 'Perubahan Harga',
        desc: 'Harga produk dapat berubah sewaktu-waktu tanpa pemberitahuan terlebih dahulu. Harga yang berlaku adalah harga yang tertera pada saat pesanan dibuat (invoice terbit).',
      },
      {
        title: 'Perbedaan Warna',
        desc: 'Warna produk pada foto bisa sedikit berbeda dari barang aslinya karena pengaruh pencahayaan dan setting layar monitor.',
      },
      {
        title: 'Ketersediaan Stok',
        desc: 'Stok produk dapat berubah setiap saat. Apabila produk yang dipesan ternyata stok habis, admin akan menghubungi pembeli untuk penggantian produk atau pengembalian dana.',
      },
    ],
  },
  {
    num: 4,
    icon: ShoppingCart,
    title: 'Pemesanan',
    intro:
      'Pemesanan dilakukan melalui keranjang belanja dan checkout langsung di situs GrosirPJ.',
    clauses: [
      {
        title: 'Minimal Order',
        desc: 'Setiap produk memiliki ketentuan minimal order masing-masing. Harga grosir otomatis berlaku saat pembelian mencapai minimal order.',
      },
      {
        title: 'Pembatalan Pesanan',
        desc: 'Pesanan tidak dapat dibatalkan setelah dikonfirmasi oleh admin, kecuali stok produk ternyata tidak tersedia.',
      },
      {
        title: 'Invoice Resmi',
        desc: 'Setiap pesanan akan menghasilkan nomor invoice unik yang digunakan untuk pembayaran dan pelacakan.',
      },
    ],
  },
  {
    num: 5,
    icon: CreditCard,
    title: 'Pembayaran',
    intro: 'Saat ini kami menerima pembayaran melalui transfer bank ke rekening resmi GrosirPJ.',
    clauses: [
      {
        title: 'Metode Pembayaran',
        desc: 'Pembayaran dilakukan via transfer bank ke rekening BCA 4130327970 a.n. Rahmawati.',
      },
      {
        title: 'Batas Waktu Pembayaran',
        desc: 'Pembayaran harus dilakukan dalam 24 jam sejak invoice terbit. Pesanan yang belum dibayar setelah 24 jam akan otomatis dibatalkan.',
      },
      {
        title: 'Bukti Transfer',
        desc: 'Bukti transfer wajib diupload di halaman invoice atau halaman lacak pesanan agar admin dapat memverifikasi pembayaran.',
      },
    ],
  },
  {
    num: 6,
    icon: Truck,
    title: 'Pengiriman',
    intro: 'Kami melayani pengiriman ke seluruh Indonesia dengan berbagai pilihan kurir.',
    clauses: [
      {
        title: 'Estimasi Waktu Pengiriman',
        desc: 'Estimasi pengiriman 1–7 hari kerja tergantung zona tujuan (Jakarta, Jawa, luar Jawa, dan wilayah terpencil).',
      },
      {
        title: 'Ongkos Kirim',
        desc: 'Ongkir dihitung otomatis berdasarkan kota tujuan dan berat paket. Pembeli dapat memilih kurir dan layanan yang diinginkan.',
      },
      {
        title: 'Kurir Tersedia',
        desc: 'Pilihan kurir: JNE, J&T, SiCepat, dan POS Indonesia.',
      },
      {
        title: 'Resi Pengiriman',
        desc: 'Nomor resi akan diupdate di halaman lacak pesanan setelah admin mengirim paket.',
      },
    ],
  },
  {
    num: 7,
    icon: RefreshCcw,
    title: 'Pengembalian & Penukaran',
    intro:
      'Kami menerima pengembalian dan penukaran produk dengan syarat dan ketentuan berikut.',
    clauses: [
      {
        title: 'Alasan Pengembalian',
        desc: 'Pengembalian hanya berlaku untuk produk cacat produksi atau salah kirim dari pihak GrosirPJ.',
      },
      {
        title: 'Batas Klaim',
        desc: 'Klaim pengembalian maksimal 24 jam setelah paket diterima, dihitung sejak tanggal pengiriman resi terkonfirmasi terkirim.',
      },
      {
        title: 'Cara Klaim',
        desc: 'Hubungi admin via WhatsApp (0812-8175-6262) dengan melampirkan foto produk dan nomor invoice. Tim kami akan memandu proses selanjutnya.',
      },
    ],
  },
  {
    num: 8,
    icon: Lock,
    title: 'Privasi Data',
    intro:
      'Privasi data pembeli adalah prioritas kami. Detail lengkap dapat dibaca di halaman Kebijakan Privasi.',
    clauses: [
      {
        title: 'Perlindungan Data',
        desc: 'Data pembeli dilindungi dan tidak akan dibagikan kepada pihak ketiga di luar keperluan operasional (mis. ekspedisi pengiriman).',
      },
      {
        title: 'Penggunaan Data',
        desc: 'Data digunakan hanya untuk memproses pesanan, menghubungi terkait order, dan meningkatkan kualitas layanan.',
      },
    ],
  },
  {
    num: 9,
    icon: AlertTriangle,
    title: 'Disclaimer',
    intro:
      'Hal-hal di luar kendali GrosirPJ yang perlu diketahui pengguna.',
    clauses: [
      {
        title: 'Maintenance Situs',
        desc: 'Situs dapat mengalami maintenance atau gangguan teknis sewaktu-waktu. Kami akan berupaya memberi tahu melalui WhatsApp bila diperlukan.',
      },
      {
        title: 'Keterlambatan Kurir',
        desc: 'GrosirPJ tidak bertanggung jawab atas keterlambatan pengiriman yang diakibatkan oleh pihak kurir, namun akan membantu mengkomplain jika diperlukan.',
      },
      {
        title: 'Force Majeure',
        desc: 'GrosirPJ tidak bertanggung jawab atas kegagalan pemenuhan kewajiban akibat keadaan kahar seperti bencana alam, kerusuhan, atau kebijakan pemerintah.',
      },
    ],
  },
];

export default function SyaratKetentuanPage() {
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
                <BreadcrumbPage className="text-white font-medium">Syarat & Ketentuan</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Badge className="bg-amber-400 text-gray-900 hover:bg-amber-400 mb-3">
            <FileText className="h-3 w-3 mr-1" /> Legal
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Syarat & Ketentuan</h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl mb-3">
            Mohon baca syarat & ketentuan berikut dengan saksama sebelum berbelanja di GrosirPJ.
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
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              Selamat datang di <span className="font-semibold text-emerald-700">GrosirPJ</span>.
              Dengan mengakses dan menggunakan situs kami, Anda dianggap telah membaca, memahami,
              dan menyetujui seluruh syarat dan ketentuan di bawah ini.
            </p>
          </CardContent>
        </Card>

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
                <ol className="space-y-3.5">
                  {s.clauses.map((c, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                        {s.num}.{idx + 1}
                      </span>
                      <div className="text-sm pt-0.5">
                        <span className="font-semibold text-gray-900">{c.title}.</span>{' '}
                        <span className="text-gray-600 leading-relaxed">{c.desc}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help CTA */}
        <Card className="mt-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50/40">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-semibold text-emerald-800 text-base mb-1">Masih ada pertanyaan?</h3>
              <p className="text-sm text-gray-600">
                Hubungi admin kami via WhatsApp untuk bantuan terkait syarat & ketentuan.
              </p>
            </div>
            <a
              href={getWhatsAppLink('Halo GrosirPJ, saya ingin bertanya tentang syarat & ketentuan')}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white h-11 px-5 rounded-xl">
                <Phone className="h-4 w-4 mr-2" /> Tanya Admin
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
