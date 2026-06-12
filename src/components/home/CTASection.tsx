'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone, ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-800 p-8 md:p-12 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16" />

          <div className="relative max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Siap Jadi Reseller Baju Anak?
            </h2>
            <p className="text-emerald-100 mb-6 text-lg">
              Bergabung dengan 30.000+ reseller yang sudah sukses jualan baju anak dan remaja bersama GrosirPJ. Daftar sekarang dan dapatkan diskon 15% untuk pesanan pertama!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/cari">
                <Button className="bg-amber-500 hover:bg-amber-500 text-gray-900 font-semibold h-12 px-8 rounded-xl text-base">
                  Mulai Belanja <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold h-12 px-8 rounded-xl text-base">
                <Phone className="h-5 w-5 mr-2" /> Hubungi Kami
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
