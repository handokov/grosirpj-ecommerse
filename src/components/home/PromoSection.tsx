'use client';

import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Percent, Gift, Clock } from 'lucide-react';

export default function PromoSection() {
  const { setCurrentView } = useStore();

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-500 uppercase">Promo Spesial</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Penawaran Terbatas
          </h2>
          <p className="text-muted-foreground">Jangan lewatkan promo grosir terbaik minggu ini</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Promo 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-6 md:p-8 text-white group cursor-pointer hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
            <div className="relative">
              <Badge className="bg-yellow-400 text-gray-900 mb-3">
                <Percent className="h-3 w-3 mr-1" /> DISKON 30%
              </Badge>
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                Flash Sale Elektronik
              </h3>
              <p className="text-emerald-100 text-sm mb-4">
                Diskon hingga 30% untuk semua produk elektronik. Berlaku untuk pembelian minimal 5 unit.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-yellow-300" />
                <span className="text-sm text-yellow-300 font-medium">Berakhir dalam 3 hari</span>
              </div>
              <Button className="bg-white text-emerald-700 hover:bg-yellow-400 hover:text-gray-900 font-semibold rounded-xl">
                Belanja Sekarang <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Promo 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 md:p-8 text-white group cursor-pointer hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
            <div className="relative">
              <Badge className="bg-yellow-400 text-gray-900 mb-3">
                <Gift className="h-3 w-3 mr-1" /> GRATIS ONGKIR
              </Badge>
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                Free Ongkir Seluruh Indonesia
              </h3>
              <p className="text-orange-100 text-sm mb-4">
                Gratis ongkos kirim untuk pembelian di atas Rp 5.000.000. Berlaku untuk semua kategori produk.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-yellow-300" />
                <span className="text-sm text-yellow-300 font-medium">Promo sepanjang bulan</span>
              </div>
              <Button className="bg-white text-orange-600 hover:bg-yellow-400 hover:text-gray-900 font-semibold rounded-xl">
                Belanja Sekarang <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mini promo cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[
            { icon: '🏷️', title: 'Member Baru', desc: 'Diskon 15% first order' },
            { icon: '📦', title: 'Bundle Hemat', desc: 'Paket grosir spesial' },
            { icon: '🔄', title: 'Repeat Order', desc: 'Cashback 5%' },
            { icon: '💎', title: 'VIP Member', desc: 'Extra diskon 10%' },
          ].map((promo) => (
            <div
              key={promo.title}
              className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <span className="text-2xl mb-2 block">{promo.icon}</span>
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">
                {promo.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">{promo.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
