'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * PWA Registrar — registers service worker for offline support & installability.
 * Uses network-first strategy for pages (won't cache stale broken pages).
 * Cache auto-updates on every deploy via versioned CACHE_NAME in sw.js.
 */

// Type for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWARegistrar() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check dismissal status only on client side to avoid hydration mismatch
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        // Still within dismissal period, don't show prompt
        return;
      }
    }

    if (!('serviceWorker' in navigator)) return;

    // Register the service worker
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('SW registered:', registration.scope);

        // Check for updates periodically (every 30 minutes)
        const interval = setInterval(() => {
          registration.update().catch(() => {});
        }, 30 * 60 * 1000);

        return () => clearInterval(interval);
      })
      .catch((error) => {
        console.warn('SW registration failed (non-critical):', error);
      });

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install prompt
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed || (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24) >= 7) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install prompt outcome:', outcome);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  // Install prompt banner
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900">Install GrosirPJ</h3>
            <p className="text-xs text-gray-500 mt-0.5">Akses cepat langsung dari home screen</p>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-xl transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    );
  }

  return null;
}
