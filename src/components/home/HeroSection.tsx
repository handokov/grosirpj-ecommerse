'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Search, Truck, Shield, Headphones, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const SLIDER_IMAGES = [
  { src: '/images/products/dress-bayi.png', alt: 'Dress Bayi Lucu' },
  { src: '/images/products/set-bayi-laki.png', alt: 'Set Bayi Laki-Laki' },
  { src: '/images/products/dress-balita.png', alt: 'Dress Balita Cantik' },
  { src: '/images/products/kaos-anak.png', alt: 'Kaos Anak Trendy' },
  { src: '/images/products/dress-anak.png', alt: 'Dress Anak Elegant' },
  { src: '/images/products/jaket-anak.png', alt: 'Jaket Anak Stylish' },
  { src: '/images/products/hoodie-remaja.png', alt: 'Hoodie Remaja Cool' },
  { src: '/images/products/dress-remaja.png', alt: 'Dress Remaja Modis' },
  { src: '/images/products/gamis-anak.png', alt: 'Gamis Anak Syar\'i' },
  { src: '/images/products/kemeja-remaja.png', alt: 'Kemeja Remaja Formal' },
];

export default function HeroSection() {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length);
  }, []);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/cari?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-800">
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
            {/* Harga OK Kualitas OK badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-amber-300">Harga OK • Kualitas OK</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Grosir Baju Anak
              <span className="text-amber-400"> & Remaja</span>
            </h1>

            <p className="text-emerald-100 text-lg mb-2 max-w-lg font-medium">
              Dengan berbagai pilihan produk
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="text-white font-bold text-lg tracking-wide">LOKAL</span>
              <span className="text-white/40">•</span>
              <span className="text-white font-bold text-lg tracking-wide">IMPORT</span>
              <span className="text-white/40">•</span>
              <span className="text-white font-bold text-lg tracking-wide">BRANDED</span>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari baju anak, dress bayi, kaos remaja..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-500 text-gray-900 px-6 rounded-xl font-semibold shadow-lg h-auto">
                Cari
              </Button>
            </form>

            <div className="flex flex-wrap gap-6 mt-8">
              <div>
                <p className="text-2xl font-bold text-amber-400">5K+</p>
                <p className="text-xs text-emerald-200">Produk Fashion</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">30K+</p>
                <p className="text-xs text-emerald-200">Reseller Aktif</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">99%</p>
                <p className="text-xs text-emerald-200">Puas & Repeat Order</p>
              </div>
            </div>
          </div>

          {/* Right image slider */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Slider container */}
              <div className="relative w-full rounded-2xl shadow-2xl overflow-hidden aspect-[4/3]">
                {SLIDER_IMAGES.map((img, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      idx === currentSlide
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105'
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {/* Slide info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-sm font-semibold">{SLIDER_IMAGES[currentSlide].alt}</p>
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 backdrop-blur-sm hover:bg-white/50 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Slide sebelumnya"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 backdrop-blur-sm hover:bg-white/50 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Slide berikutnya"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {SLIDER_IMAGES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentSlide
                          ? 'bg-amber-400 w-5'
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-emerald-800" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">COD Jakarta</p>
                  <p className="text-[10px] text-gray-500">Bayar di Tempat</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-600" />
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
            {[
              { icon: Truck, title: 'COD Jakarta', desc: 'Bayar di Tempat' },
              { icon: Shield, title: 'Garansi Produk', desc: '100% Original' },
              { icon: Headphones, title: 'CS 24/7', desc: 'Siap Membantu' },
              { icon: Heart, title: 'Harga Terbaik', desc: 'Grosir Termurah' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 text-white">
                <item.icon className="h-6 w-6 text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-emerald-200">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
