'use client';

import { useEffect } from 'react';

/**
 * PWA Registrar - currently in CLEANUP mode.
 * Unregisters any existing service workers to prevent stale cached pages.
 * Will be re-enabled for PWA once the site is stable on Vercel.
 */
export default function PWARegistrar() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // UNREGISTER any existing service workers to clear cached broken pages
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Unregistered old service worker:', registration.scope);
            }
          });
        }
      }).catch((error) => {
        console.warn('SW cleanup failed (non-critical):', error);
      });

      // Also clear all caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          for (const name of cacheNames) {
            caches.delete(name).then((deleted) => {
              if (deleted) {
                console.log('Deleted cache:', name);
              }
            });
          }
        }).catch(() => {});
      }
    }
  }, []);

  return null;
}
