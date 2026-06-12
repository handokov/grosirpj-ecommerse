'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Settings,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Produk',
    href: '/admin/products',
    icon: Package,
    children: [
      { label: 'Semua Produk', href: '/admin/products' },
      { label: 'Tambah Produk', href: '/admin/products/add' },
    ],
  },
  {
    label: 'Kategori',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    label: 'Pesanan',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Pengaturan',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Produk'])
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-emerald-100">
        <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-emerald-800">GrosirPJ</h1>
          <p className="text-[11px] text-emerald-600">Seller Centre</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)
          const expanded = expandedItems.includes(item.label)
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.label}>
              <Link
                href={hasChildren ? '#' : item.href}
                onClick={e => {
                  if (hasChildren) {
                    e.preventDefault()
                    toggleExpand(item.label)
                  }
                  if (mobileOpen) setMobileOpen(false)
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-5 h-5', active ? 'text-emerald-700' : 'text-gray-400')} />
                <span className="flex-1">{item.label}</span>
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-gray-400 transition-transform',
                      expanded && 'rotate-180'
                    )}
                  />
                )}
              </Link>

              {/* Sub-items */}
              {hasChildren && expanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children!.map(child => {
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => mobileOpen && setMobileOpen(false)}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-sm transition-colors',
                          childActive
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        )}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <Store className="w-4 h-4" />
          <span>Lihat Toko</span>
        </Link>
        <button
          onClick={() => {
            fetch('/api/auth/signout', { method: 'POST' }).then(() => {
              window.location.href = '/admin/login'
            })
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
