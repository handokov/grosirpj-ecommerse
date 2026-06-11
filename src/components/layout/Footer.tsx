'use client';

import { Package, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Footer() {
  const goHome = useStore((s) => s.goHome);
  const viewCategory = useStore((s) => s.viewCategory);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">GrosirPJ</h3>
                <p className="text-xs text-gray-400">Pusat Grosir Terpercaya</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Platform grosir terpercaya di Indonesia dengan harga terbaik dan kualitas terjamin. Melayani kebutuhan bisnis Anda sejak 2015.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kategori</h4>
            <ul className="space-y-2">
              {['Elektronik', 'Fashion Pria', 'Fashion Wanita', 'Makanan & Minuman', 'Kesehatan & Kecantikan', 'Rumah Tangga', 'Olahraga', 'ATK & Kantor'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={goHome}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informasi</h4>
            <ul className="space-y-2">
              {['Tentang Kami', 'Cara Pemesanan', 'Kebijakan Pengembalian', 'Syarat & Ketentuan', 'Kebijakan Privasi', 'FAQ'].map((item) => (
                <li key={item}>
                  <button className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-400">Jl. Raya Grosir No. 123, Tanah Abang, Jakarta Pusat 10230</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-400">+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-400">info@grosirpj.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-400">Senin - Sabtu: 08:00 - 17:00 WIB</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} GrosirPJ. Semua hak dilindungi.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>MIT Licensed</span>
            <span>|</span>
            <span>Dibuat dengan ❤️ di Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
