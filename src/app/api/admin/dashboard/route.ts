import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, isAdminError } from '@/lib/auth-guard'

export async function GET() {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    // Parallelize independent queries for better performance
    const [totalProducts, totalCategories, totalOrders, revenueResult, recentOrders, statusGroups, topProducts, lowStockProducts, categories] = await Promise.all([
      // Get total products
      db.product.count({ where: { deletedAt: null } }),

      // Get total categories
      db.category.count(),

      // Get total orders (excluding soft-deleted)
      db.order.count({ where: { deletedAt: null } }),

      // Get total revenue using aggregate
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'paid', deletedAt: null },
      }),

      // Get recent orders
      db.order.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { select: { name: true, images: true } },
            },
          },
        },
      }),

      // Get order status counts using groupBy
      db.order.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { status: true },
      }),

      // Get top products by sold
      db.product.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { sold: 'desc' },
        select: {
          id: true,
          name: true,
          sold: true,
          price: true,
          images: true,
          stock: true,
        },
      }),

      // Get low stock products
      db.product.findMany({
        where: { stock: { lte: 20 }, deletedAt: null },
        take: 5,
        orderBy: { stock: 'asc' },
        select: {
          id: true,
          name: true,
          stock: true,
          images: true,
        },
      }),

      // Category distribution (exclude soft-deleted products from count)
      db.category.findMany({
        include: {
          _count: { select: { products: { where: { deletedAt: null } } } },
        },
        orderBy: { order: 'asc' },
      }),
    ])

    const totalRevenue = revenueResult._sum.totalAmount || 0

    const statusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
    }
    for (const group of statusGroups) {
      if (group.status in statusCounts) {
        statusCounts[group.status] = group._count.status
      }
    }

    // Monthly revenue (last 6 months) — single query + JS date grouping
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const monthlyOrders = await db.order.findMany({
      where: {
        paymentStatus: 'paid',
        deletedAt: null,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { totalAmount: true, createdAt: true },
    })

    // Group by month in JS
    const monthlyMap = new Map<string, { revenue: number; orders: number }>()
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = monthDate.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      monthlyMap.set(key, { revenue: 0, orders: 0 })
    }

    for (const order of monthlyOrders) {
      const key = order.createdAt.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      const entry = monthlyMap.get(key)
      if (entry) {
        entry.revenue += order.totalAmount
        entry.orders += 1
      }
    }

    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
    }))

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      pendingOrders: statusCounts.pending,
      confirmedOrders: statusCounts.confirmed,
      shippedOrders: statusCounts.shipped,
      completedOrders: statusCounts.completed,
      cancelledOrders: statusCounts.cancelled,
      recentOrders,
      topProducts,
      lowStockProducts,
      categories,
      monthlyData,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    // Return safe default data instead of 500
    return NextResponse.json({
      totalProducts: 0,
      totalCategories: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      shippedOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      recentOrders: [],
      topProducts: [],
      lowStockProducts: [],
      categories: [],
      monthlyData: [],
    })
  }
}
