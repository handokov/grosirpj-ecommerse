import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

export async function GET() {
  try {
    const session = await requireAdmin()

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

    // ===== NEW: Enhanced Sales Analytics =====
    // 1. Revenue trend — last 30 days (daily), grouped in JS
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const dailyOrdersRaw = await db.order.findMany({
      where: {
        paymentStatus: 'paid',
        deletedAt: null,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { totalAmount: true, createdAt: true },
    })

    // Build 30-day map (default 0)
    const dailyMap = new Map<string, { revenue: number; orders: number; date: string }>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(thirtyDaysAgo.getDate() + i)
      const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
      dailyMap.set(key, {
        revenue: 0,
        orders: 0,
        date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      })
    }

    for (const order of dailyOrdersRaw) {
      const key = order.createdAt.toISOString().slice(0, 10)
      const entry = dailyMap.get(key)
      if (entry) {
        entry.revenue += order.totalAmount
        entry.orders += 1
      }
    }

    const dailyRevenue = Array.from(dailyMap.entries()).map(([, v]) => ({
      date: v.date,
      revenue: v.revenue,
      orders: v.orders,
    }))

    // Derive 7-day trend from the last 7 entries of dailyRevenue
    const weeklyRevenue = dailyRevenue.slice(-7)

    // 2. Best selling categories (by revenue from OrderItem join Product → Category)
    // Pull all paid order items in last 30 days with their product's category
    const categorySalesRaw = await db.orderItem.findMany({
      where: {
        order: {
          paymentStatus: 'paid',
          deletedAt: null,
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      select: {
        price: true,
        quantity: true,
        product: { select: { categoryId: true, category: { select: { name: true } } } },
      },
      take: 5000, // safety cap to avoid huge pulls
    })

    const categoryMap = new Map<string, { name: string; revenue: number; quantity: number }>()
    for (const item of categorySalesRaw) {
      const catId = item.product?.categoryId
      const catName = item.product?.category?.name || 'Tanpa Kategori'
      if (!catId) continue
      const lineTotal = item.price * item.quantity
      const existing = categoryMap.get(catId)
      if (existing) {
        existing.revenue += lineTotal
        existing.quantity += item.quantity
      } else {
        categoryMap.set(catId, { name: catName, revenue: lineTotal, quantity: item.quantity })
      }
    }

    const categorySales = Array.from(categoryMap.entries())
      .map(([id, v]) => ({ id, name: v.name, revenue: v.revenue, quantity: v.quantity }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6) // top 6 categories

    // 3. Average Order Value (AOV) — last 30 days
    const last30Agg = await db.order.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: {
        paymentStatus: 'paid',
        deletedAt: null,
        createdAt: { gte: thirtyDaysAgo },
      },
    })
    const last30Revenue = last30Agg._sum.totalAmount || 0
    const last30OrderCount = last30Agg._count || 0
    const avgOrderValue = last30OrderCount > 0 ? Math.round(last30Revenue / last30OrderCount) : 0

    // 4. Peak order hours (0-23) — last 30 days, all orders (not just paid, to see activity)
    const peakHoursMap = new Array(24).fill(0)
    for (const order of dailyOrdersRaw) {
      const hour = order.createdAt.getHours()
      peakHoursMap[hour] += 1
    }
    const peakHours = peakHoursMap.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}.00`,
      orders: count,
    }))

    // 5. Repeat customer rate — unique phones with >1 order vs total unique phones (last 30 days)
    const last30OrdersForCustomers = await db.order.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { customerPhone: true },
      take: 5000,
    })
    const phoneCounts = new Map<string, number>()
    for (const o of last30OrdersForCustomers) {
      const phone = o.customerPhone?.trim()
      if (!phone) continue
      phoneCounts.set(phone, (phoneCounts.get(phone) || 0) + 1)
    }
    const uniqueCustomers = phoneCounts.size
    const repeatCustomers = Array.from(phoneCounts.values()).filter((c) => c > 1).length
    const repeatCustomerRate =
      uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0

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
      // NEW analytics
      dailyRevenue,
      weeklyRevenue,
      categorySales,
      avgOrderValue,
      last30Revenue,
      last30OrderCount,
      peakHours,
      uniqueCustomers,
      repeatCustomers,
      repeatCustomerRate,
    })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
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
      dailyRevenue: [],
      weeklyRevenue: [],
      categorySales: [],
      avgOrderValue: 0,
      last30Revenue: 0,
      last30OrderCount: 0,
      peakHours: [],
      uniqueCustomers: 0,
      repeatCustomers: 0,
      repeatCustomerRate: 0,
    })
  }
}
