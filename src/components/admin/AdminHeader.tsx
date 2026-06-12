'use client'

import { useSession } from 'next-auth/react'
import { Bell, Search, Store, ChevronDown, LogOut, User, Settings, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { usePathname } from 'next/navigation'

// Breadcrumb mapping
const BREADCRUMB_MAP: Record<string, { label: string; parent?: { label: string; href: string } }> = {
  '/admin': { label: 'Dashboard' },
  '/admin/products': { label: 'Produk', parent: { label: 'Dashboard', href: '/admin' } },
  '/admin/products/add': { label: 'Tambah Produk', parent: { label: 'Produk', href: '/admin/products' } },
  '/admin/orders': { label: 'Pesanan', parent: { label: 'Dashboard', href: '/admin' } },
  '/admin/categories': { label: 'Kategori', parent: { label: 'Dashboard', href: '/admin' } },
  '/admin/settings': { label: 'Pengaturan', parent: { label: 'Dashboard', href: '/admin' } },
}

export default function AdminHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const name = session?.user?.name || 'Admin'
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Determine breadcrumb
  const breadcrumb = BREADCRUMB_MAP[pathname] || { label: 'Admin', parent: { label: 'Dashboard', href: '/admin' } }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400" />

      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-sm">
            {breadcrumb.parent && (
              <>
                <a
                  href={breadcrumb.parent.href}
                  className="text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {breadcrumb.parent.label}
                </a>
                <span className="text-gray-300">/</span>
              </>
            )}
            <span className="text-gray-900 font-semibold">{breadcrumb.label}</span>
          </div>
          {/* Mobile title */}
          <span className="lg:hidden text-sm font-semibold text-gray-900 ml-10">
            {breadcrumb.label}
          </span>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center relative w-80 max-w-[360px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari produk, pesanan, atau pelanggan..."
            className="pl-9 bg-gray-50 border-gray-200 text-sm h-9 rounded-lg focus:bg-white transition-colors"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Bell className="w-[18px] h-[18px] text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Visit Store */}
          <a
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            Kunjungi Toko
          </a>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{name}</p>
                  <p className="text-[10px] text-gray-400">Admin</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <div className="px-2 py-2 mb-1 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-400">{session?.user?.email || 'admin@grosirpj.com'}</p>
              </div>
              <DropdownMenuItem className="text-sm rounded-lg cursor-pointer">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                Profil Saya
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm rounded-lg cursor-pointer">
                <Settings className="w-4 h-4 mr-2 text-gray-400" />
                Pengaturan
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm rounded-lg cursor-pointer">
                <HelpCircle className="w-4 h-4 mr-2 text-gray-400" />
                Bantuan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-sm rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => {
                  fetch('/api/auth/signout', { method: 'POST' }).then(() => {
                    window.location.href = '/admin/login'
                  })
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
