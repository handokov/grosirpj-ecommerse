import AdminLayoutClient from '@/components/admin/AdminLayoutClient'

// Force dynamic rendering — admin pages require authentication
// and must never be statically generated / prerendered.
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
