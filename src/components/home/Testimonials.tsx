'use client';

import { Shield, Truck, RefreshCw, Headphones, BadgeCheck, TrendingUp } from 'lucide-react';

const reasons = [
  {
    icon: Shield,
    title: 'Produk Berkualitas',
    desc: 'Semua produk baru dan telah melalui quality check sebelum dikirim',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: TrendingUp,
    title: 'Harga Grosir Termurah',
    desc: 'Harga langsung dari supplier tanpa perantara, margin keuntungan besar',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Truck,
    title: 'Pengiriman Cepat',
    desc: 'Processing 1-2 hari kerja, pengiriman ke seluruh Indonesia',
    color: 'text-sky-600 bg-sky-50',
  },
  {
    icon: RefreshCw,
    title: 'Koleksi Update',
    desc: 'Model baju anak selalu mengikuti trend terbaru setiap minggu',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: BadgeCheck,
    title: 'Min. Order Terjangkau',
    desc: 'Mulai dari 10-12 pcs per model, cocok untuk pemula dan reseller kecil',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    icon: Headphones,
    title: 'CS Responsif',
    desc: 'Customer service via WhatsApp siap membantu di jam kerja',
    color: 'text-rose-600 bg-rose-50',
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 md:py-16 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BadgeCheck className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-900 uppercase">Kenapa Kami</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Kenapa Pilih GrosirPJ?</h2>
          <p className="text-muted-foreground">Keunggulan yang membuat ribuan reseller mempercayai kami</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((r) => (
            <div key={r.title} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow">
              <div className={`w-11 h-11 rounded-xl ${r.color} flex items-center justify-center mb-3`}>
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{r.title}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
