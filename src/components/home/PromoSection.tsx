'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Percent, Gift, Clock } from 'lucide-react';

export default function PromoSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-500 uppercase">Promo Spesial</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Penawaran Terbatas</h2>
          <p className="text-muted-foreground">Jangan lewatkan promo grosir baju anak & baby kids terbaik minggu ini</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Promo 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-6 md:p-8 text-white group cursor-pointer hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative">
              <Badge className="bg-amber-500 text-gray-900 mb-3"><Percent className="h-3 w-3 mr-1" /> DISKON 30%</Badge>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Flash Sale Baju Anak</h3>
              <p className="text-emerald-100 text-sm mb-4">Diskon hingga 30% untuk semua koleksi baju bayi dan balita. Berlaku untuk pembelian minimal 12 pcs.</p>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-400 font-medium">Promo terbatas!</span>
              </div>
              <Link href="/cari">
                <Button className="bg-white text-emerald-800 hover:bg-amber-500 hover:text-gray-900 font-semibold rounded-xl">
                  Belanja Sekarang <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Promo 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-800 p-6 md:p-8 text-white group cursor-pointer hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative">
              <Badge className="bg-amber-500 text-gray-900 mb-3"><Gift className="h-3 w-3 mr-1" /> GRATIS ONGKIR</Badge>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Free Ongkir Seluruh Indonesia</h3>
              <p className="text-emerald-100 text-sm mb-4">Gratis ongkos kirim untuk pembelian di atas Rp 3.000.000. Berlaku untuk semua kategori fashion anak & baby kids.</p>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-400 font-medium">Promo sepanjang bulan</span>
              </div>
              <Link href="/cari">
                <Button className="bg-white text-emerald-900 hover:bg-amber-500 hover:text-gray-900 font-semibold rounded-xl">
                  Belanja Sekarang <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mini promo cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[
            { icon: '🎀', title: 'Reseller Baru', desc: 'Diskon 15% first order' },
            { icon: '📦', title: 'Paket Lengkap', desc: 'Set baju dari bayi-anak' },
            { icon: '🔄', title: 'Repeat Order', desc: 'Cashback 5%' },
            { icon: '💎', title: 'VIP Reseller', desc: 'Extra diskon 10%' },
          ].map((promo) => (
            <div key={promo.title} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <span className="text-2xl mb-2 block">{promo.icon}</span>
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-emerald-900 transition-colors">{promo.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{promo.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
