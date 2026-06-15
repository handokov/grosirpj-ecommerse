'use client';

import { MessageCircle } from 'lucide-react';
import { WA_NUMBER } from '@/lib/store-config';

/**
 * WhatsApp Floating Chat Button
 * Uses centralized WA_NUMBER from store-config.ts
 */
export default function WhatsAppButton() {
  const WA_MESSAGE = encodeURIComponent('Halo GrosirPJ! Saya ingin bertanya tentang produk fashion anak & baby kids.');

  const handleClick = () => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Chat via WhatsApp"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2"
    >
      {/* Tooltip */}
      <span className="hidden sm:inline-flex items-center bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-xl shadow-lg border border-gray-100 
        opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
        Ada yang bisa dibantu?
      </span>

      {/* Button */}
      <div className="w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95">
        <MessageCircle className="h-7 w-7 text-white fill-white" />
      </div>
    </button>
  );
}
