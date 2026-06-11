'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rina Wulandari',
    role: 'Owner Toko Baju Anak',
    location: 'Jakarta',
    rating: 5,
    text: 'GrosirPJ benar-benar penyelamat bisnis saya! Koleksi baju anaknya lengkap banget dari bayi sampai remaja, harga grosirnya paling murah. Kualitas bajunya juga bagus-bagus, pelanggan saya selalu repeat order!',
    avatar: 'RW',
  },
  {
    name: 'Dewi Susanti',
    role: 'Reseller Online Shop',
    location: 'Bandung',
    rating: 5,
    text: 'Sudah 2 tahun jadi reseller GrosirPJ dan tidak pernah mengecewakan. Model bajunya selalu update dan follow trend. Margin keuntungan juga besar karena harga grosirnya sangat kompetitif.',
    avatar: 'DS',
  },
  {
    name: 'Ahmad Fauzi',
    role: 'Pemilik Konveksi',
    location: 'Surabaya',
    rating: 5,
    text: 'Pengiriman cepat dan packaging rapi. Koleksi gamis anak dan dress bayinya paling laris di toko saya. Customer service juga sangat responsif dan membantu.',
    avatar: 'AF',
  },
  {
    name: 'Linda Permata',
    role: 'Owner Kids Boutique',
    location: 'Medan',
    rating: 5,
    text: 'Saya sangat puas dengan kualitas produk GrosirPJ. Bahan bajunya adem dan nyaman untuk anak-anak. Harga grosirnya memang paling murah dibanding supplier lain.',
    avatar: 'LP',
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 md:py-16 bg-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-pink-600 uppercase">Testimoni</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dipercaya Ribuan Reseller</h2>
          <p className="text-muted-foreground">Apa kata mereka tentang GrosirPJ</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow">
              <Quote className="h-6 w-6 text-pink-200 mb-3" />
              <p className="text-sm text-gray-600 mb-4 line-clamp-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} • {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
