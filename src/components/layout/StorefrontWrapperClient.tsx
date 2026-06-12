'use client'

import { usePathname } from 'next/navigation'
import SiteLayout from '@/components/layout/SiteLayout'

export default function StorefrontWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  // Admin pages have their own layout, don't wrap with SiteLayout
  if (isAdmin) {
    return <>{children}</>
  }

  // Storefront pages get the full site layout (Header, Footer, WhatsApp)
  return <SiteLayout>{children}</SiteLayout>
}
