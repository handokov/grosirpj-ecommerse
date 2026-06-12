'use client';

import { useEffect } from 'react';

export default function PWARegistrar() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          // Don't crash if SW registration fails - just log it
          console.warn('SW registration failed (non-critical):', error);
        });
    }
  }, []);

  return null;
}
