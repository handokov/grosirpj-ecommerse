import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-emerald-600 mb-2">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-500 mb-8">
          Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Home className="h-4 w-4" />
              Ke Beranda
            </Button>
          </Link>
          <Link href="/cari">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Cari Produk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
