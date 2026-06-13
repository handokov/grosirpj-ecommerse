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
  BarChart3,
  ImagePlus,
  HelpCircle,
  ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: { label: string; href: string; icon?: React.ElementType }[]
  badge?: string | number
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
      { label: 'Semua Produk', href: '/admin/products', icon: Package },
      { label: 'Tambah Produk', href: '/admin/products/add', icon: ImagePlus },
    ],
  },
  {
    label: 'Pesanan',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: 'new',
  },
  {
    label: 'Kategori',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    label: 'Banner',
    href: '/admin/banners',
    icon: ImageIcon,
  },
  {
    label: 'Analitik',
    href: '/admin',
    icon: BarChart3,
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
    <div className="flex flex-col h-full bg-white">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-sm shadow-emerald-200">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-gray-900 tracking-tight">GrosirPJ</h1>
          <p className="text-[10px] text-emerald-600 font-semibold tracking-wide uppercase">Seller Centre</p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
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
                  if (mobileOpen && !hasChildren) setMobileOpen(false)
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                  active && !hasChildren
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn(
                  'w-[18px] h-[18px] flex-shrink-0',
                  active && !hasChildren ? 'text-emerald-600' : 'text-gray-400'
                )} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-500 text-white leading-none">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
                      expanded && 'rotate-180'
                    )}
                  />
                )}
              </Link>

              {/* Sub-items */}
              {hasChildren && expanded && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-3 py-1">
                  {item.children!.map(child => {
                    const childActive = pathname === child.href
                    const ChildIcon = child.icon
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => mobileOpen && setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-all duration-150',
                          childActive
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        )}
                      >
                        {ChildIcon && <ChildIcon className="w-3.5 h-3.5" />}
                        <span>{child.label}</span>
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
      <div className="border-t border-gray-100 px-3 py-3 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <Store className="w-[18px] h-[18px]" />
          <span>Lihat Toko</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
          <span>Bantuan</span>
        </Link>
        <button
          onClick={() => {
            fetch('/api/auth/signout', { method: 'POST' }).then(() => {
              window.location.href = '/admin/login'
            })
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
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
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl bg-white shadow-lg border border-gray-100"
      >
        {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-[260px] border-r border-gray-100 transition-transform duration-300 lg:translate-x-0 shadow-sm',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
