'use client';

import { Button } from '@/components/ui/button';
import { Phone, ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-8 md:p-12 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16" />

          <div className="relative max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Siap Memulai Belanja Grosir?
            </h2>
            <p className="text-emerald-100 mb-6 text-lg">
              Bergabung dengan 50.000+ pelanggan yang sudah mempercayakan kebutuhan grosir mereka kepada GrosirPJ. Daftar sekarang dan dapatkan diskon 15% untuk pesanan pertama Anda!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold h-12 px-8 rounded-xl text-base">
                Mulai Belanja <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 rounded-xl text-base">
                <Phone className="h-5 w-5 mr-2" /> Hubungi Kami
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
