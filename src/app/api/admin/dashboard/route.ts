import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get total products
    const totalProducts = await db.product.count({ where: { deletedAt: null } })
    
    // Get total categories
    const totalCategories = await db.category.count()
    
    // Get total orders
    const totalOrders = await db.order.count()
    
    // Get total revenue
    const orders = await db.order.findMany({
      where: { paymentStatus: 'paid' },
      select: { totalAmount: true },
    })
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    
    // Get recent orders
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, supplierName: true, supplierLink: true, supplierPhone: true } },
          },
        },
      },
    })
    
    // Get order status counts
    const pendingOrders = await db.order.count({ where: { status: 'pending' } })
    const confirmedOrders = await db.order.count({ where: { status: 'confirmed' } })
    const shippedOrders = await db.order.count({ where: { status: 'shipped' } })
    const completedOrders = await db.order.count({ where: { status: 'completed' } })
    const cancelledOrders = await db.order.count({ where: { status: 'cancelled' } })
    
    // Get top products by sold
    const topProducts = await db.product.findMany({
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
    })
    
    // Get low stock products
    const lowStockProducts = await db.product.findMany({
      where: { stock: { lte: 20 }, deletedAt: null },
      take: 5,
      orderBy: { stock: 'asc' },
      select: {
        id: true,
        name: true,
        stock: true,
        images: true,
      },
    })

    // Category distribution
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { order: 'asc' },
    })

    // Monthly revenue (last 6 months)
    const now = new Date()
    const monthlyData: { month: string; revenue: number; orders: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthOrders = await db.order.findMany({
        where: {
          paymentStatus: 'paid',
          createdAt: { gte: month, lte: monthEnd },
        },
        select: { totalAmount: true },
      })
      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      monthlyData.push({
        month: month.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
        revenue: monthRevenue,
        orders: monthOrders.length,
      })
    }

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
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
