'use client'

import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  // Login page gets its own full-screen layout (no sidebar)
  if (isLoginPage) {
    return <SessionProvider>{children}</SessionProvider>
  }

  // All other admin pages get the sidebar layout
  return (
    <SessionProvider>
      <div className="min-h-screen bg-[#f5f6fa]">
        <AdminSidebar />
        <div className="lg:ml-[260px]">
          <AdminHeader />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}
