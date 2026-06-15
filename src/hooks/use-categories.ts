'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface AdminCategory {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

/**
 * Shared hook for fetching admin categories.
 * Eliminates the duplicated fetchCategories pattern across admin pages.
 */
export function useCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Gagal memuat kategori')
      const data = await res.json()
      setCategories(data.categories)
    } catch {
      toast.error('Gagal memuat kategori')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, refetch: fetchCategories }
}
