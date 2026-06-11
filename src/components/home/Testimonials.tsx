'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Budi Santoso',
    role: 'Pemilik Toko Elektronik',
    location: 'Jakarta',
    rating: 5,
    text: 'GrosirPJ benar-benar mengubah cara saya berbelanja stok toko. Harga grosirnya paling kompetitif dan pengirimannya selalu tepat waktu. Sudah 3 tahun jadi pelanggan setia!',
    avatar: 'BS',
  },
  {
    name: 'Siti Rahayu',
    role: 'Owner Online Shop Fashion',
    location: 'Bandung',
    rating: 5,
    text: 'Kualitas produk fashion di GrosirPJ sangat bagus dengan harga yang sangat terjangkau. Min. order yang fleksibel sangat membantu untuk bisnis kecil saya.',
    avatar: 'SR',
  },
  {
    name: 'Ahmad Wijaya',
    role: 'Distributor Makanan',
    location: 'Surabaya',
    rating: 5,
    text: 'Proses pemesanan sangat mudah dan cepat. Customer service-nya juga sangat responsif. Recommended banget untuk yang mau beli grosir!',
    avatar: 'AW',
  },
  {
    name: 'Diana Putri',
    role: 'Pemilik Salon & Spa',
    location: 'Medan',
    rating: 4,
    text: 'Saya selalu beli produk kecantikan di GrosirPJ. Kualitasnya terjamin dan harganya jauh lebih murah dibeli eceran. Pengiriman juga aman.',
    avatar: 'DP',
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 md:py-16 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-emerald-600 uppercase">Testimoni</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Dipercaya Ribuan Pelanggan
          </h2>
          <p className="text-muted-foreground">
            Apa kata mereka tentang GrosirPJ
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow"
            >
              <Quote className="h-6 w-6 text-emerald-200 mb-3" />
              <p className="text-sm text-gray-600 mb-4 line-clamp-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < t.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
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
