'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Cookie consent banner.
 * Shows on first visit only (consent stored in localStorage).
 * Appears on storefront pages only (mounted inside SiteLayout).
 */
const CONSENT_KEY = 'grosirpj-cookie-consent'
const CONSENT_VALUE = 'accepted'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  // Check localStorage on mount — avoids SSR/hydration mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored !== CONSENT_VALUE) {
        // Small delay so banner slides up after page load (smoother UX)
        const timer = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage might be blocked (private mode) — don't show banner
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, CONSENT_VALUE)
    } catch {
      // Ignore write errors
    }
    setVisible(false)
  }

  const handleDismiss = () => {
    // User closed without accepting — will show again next visit
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Pemberitahuan Cookie"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4 animate-in slide-in-from-bottom-8 duration-500"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-300/40 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start gap-3 p-4 sm:p-5">
          {/* Icon */}
          <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <Cookie className="h-5 w-5 text-emerald-700" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Cookie className="h-4 w-4 text-emerald-700 sm:hidden" />
              <h2 className="text-sm font-bold text-gray-900">
                Kami menggunakan cookie
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
              GrosirPJ menggunakan cookie untuk meningkatkan pengalaman belanja Anda,
              menganalisis traffic, dan menampilkan konten yang relevan. Dengan
              terus menggunakan situs ini, Anda menyetujui penggunaan cookie.
              {' '}
              <Link
                href="/kebijakan-privasi"
                className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
              >
                Pelajari lebih lanjut
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Button
              onClick={handleAccept}
              size="sm"
              className="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 px-4 rounded-lg gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Saya Setuju
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Tutup banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
