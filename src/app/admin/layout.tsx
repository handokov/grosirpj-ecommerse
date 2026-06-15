import type { Metadata } from 'next'
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'

// Force dynamic rendering — admin pages require authentication
// and must never be statically generated / prerendered.
export const dynamic = 'force-dynamic'

// Prevent search engines from indexing any admin pages
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
