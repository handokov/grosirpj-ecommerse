'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, Truck, Shield, Headphones, Star } from 'lucide-react';

export default function HeroSection() {
  const { setSearchQuery, setCurrentView } = useStore();
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setSearchQuery(searchVal.trim());
      setCurrentView('catalog');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 40% 80%, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px, 40px 40px, 80px 80px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm">
              <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
              <span>Grosir Terpercaya #1 di Indonesia</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Beli Grosir Lebih
              <span className="text-yellow-300"> Mudah</span> &
              <span className="text-yellow-300"> Hemat</span>
            </h1>
            <p className="text-emerald-100 text-lg mb-8 max-w-lg">
              Dapatkan harga grosir terbaik untuk ribuan produk berkualitas. Min. order terjangkau dengan pengiriman ke seluruh Indonesia.
            </p>

            {/* Search in hero */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk grosir..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
                />
              </div>
              <Button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 rounded-xl font-semibold shadow-lg h-auto"
              >
                Cari
              </Button>
            </form>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-8">
              <div>
                <p className="text-2xl font-bold text-yellow-300">10K+</p>
                <p className="text-xs text-emerald-200">Produk Tersedia</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-300">50K+</p>
                <p className="text-xs text-emerald-200">Pelanggan Aktif</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-300">99%</p>
                <p className="text-xs text-emerald-200">Kepuasan</p>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="hidden md:block">
            <div className="relative">
              <img
                src="/images/hero-banner.png"
                alt="GrosirPJ - Pusat Grosir Terpercaya"
                className="w-full rounded-2xl shadow-2xl"
              />
              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Gratis Ongkir</p>
                  <p className="text-[10px] text-gray-500">Min. 5 Juta</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Garansi 100%</p>
                  <p className="text-[10px] text-gray-500">Uang Kembali</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 text-white">
              <Truck className="h-6 w-6 text-yellow-300 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Gratis Ongkir</p>
                <p className="text-xs text-emerald-200">Pesanan 5 Juta+</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Shield className="h-6 w-6 text-yellow-300 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Garansi Produk</p>
                <p className="text-xs text-emerald-200">100% Original</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Headphones className="h-6 w-6 text-yellow-300 shrink-0" />
              <div>
                <p className="text-sm font-semibold">CS 24/7</p>
                <p className="text-xs text-emerald-200">Siap Membantu</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Star className="h-6 w-6 text-yellow-300 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Harga Terbaik</p>
                <p className="text-xs text-emerald-200">Grosir Termurah</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
