'use client';

import { Mail, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Footer() {
  const goHome = useStore((s) => s.goHome);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="GrosirPJ Logo" className="h-10 w-10 rounded-xl object-contain" />
              <div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="h-3 w-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-white">GrosirPJ</h3>
                <p className="text-xs text-amber-400 font-semibold">Harga OK Kualitas OK</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Pusat grosir baju anak dan remaja terpercaya di Indonesia. Fashion bayi, balita, anak-anak, dan remaja dengan harga grosir termurah. Melayani sejak 2015.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-800 transition-colors"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-800 transition-colors"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-800 transition-colors"><Youtube className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kategori</h4>
            <ul className="space-y-2">
              {['Bayi (0-2 Tahun)', 'Balita (2-5 Tahun)', 'Anak-Anak (5-12 Tahun)', 'Remaja (12-17 Tahun)', 'Aksesoris Anak', 'Sepatu Anak & Remaja'].map((cat) => (
                <li key={cat}>
                  <button onClick={goHome} className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">{cat}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informasi</h4>
            <ul className="space-y-2">
              {['Tentang Kami', 'Cara Pemesanan', 'Ukuran Baju Anak', 'Kebijakan Pengembalian', 'Syarat & Ketentuan', 'FAQ'].map((item) => (
                <li key={item}>
                  <button className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                <span className="text-sm text-gray-400">Jl. Raya Grosir No. 123, Tanah Abang, Jakarta Pusat 10230</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-sm text-gray-400">info@grosirpj.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-sm text-gray-400">Senin - Sabtu: 08:00 - 17:00 WIB</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} GrosirPJ. Semua hak dilindungi.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>GrosirPJ — Harga OK Kualitas OK</span>
            <span>|</span>
            <span>Dibuat dengan ❤️ di Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
