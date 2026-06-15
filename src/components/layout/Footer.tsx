'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Clock, Phone } from 'lucide-react';
import { WA_NUMBER, getWhatsAppLink } from '@/lib/store-config';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="GrosirPJ Logo" className="h-10 w-10 rounded-lg object-contain" />
              <div>
                <h3 className="text-lg font-bold text-white">GrosirPJ</h3>
                <p className="text-[11px] text-emerald-400 font-medium">Harga OK Kualitas OK</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Pusat grosir baju anak terpercaya di Indonesia. Fashion bayi, balita, dan anak-anak dengan harga grosir termurah. Melayani sejak 2015.
            </p>
            <div className="flex gap-3">
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-800 transition-colors"><Phone className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Kategori - from database, max 5 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kategori</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/${cat.slug}`} className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informasi</h4>
            <ul className="space-y-2">
              <li>
                <a href={getWhatsAppLink('Halo GrosirPJ, saya ingin bertanya tentang cara pemesanan')} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">Cara Pemesanan</a>
              </li>
              <li>
                <a href={getWhatsAppLink('Halo GrosirPJ, saya ingin bertanya tentang ukuran baju anak')} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">Ukuran Baju Anak</a>
              </li>
              <li>
                <a href={getWhatsAppLink('Halo GrosirPJ, saya ingin bertanya tentang kebijakan pengembalian')} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">Kebijakan Pengembalian</a>
              </li>
              <li>
                <a href={getWhatsAppLink('Halo GrosirPJ, saya ingin bertanya tentang syarat ketentuan')} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">Syarat & Ketentuan</a>
              </li>
              <li>
                <a href={getWhatsAppLink('Halo GrosirPJ, saya ingin bertanya tentang FAQ')} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">FAQ</a>
              </li>
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
