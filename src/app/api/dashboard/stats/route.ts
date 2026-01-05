import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { DashboardStats } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Today's collections
    const todayCollectionsQuery = `
      SELECT COUNT(*) as count, COALESCE(SUM(qty_liters), 0) as total_liters
      FROM milk_collections
      WHERE created_at >= $1::timestamptz AND created_at <= $2::timestamptz
    `
    const todayCollections = await db.custom(todayCollectionsQuery, [
      `${today}T00:00:00`,
      `${today}T23:59:59`
    ])

    // Yesterday's collections for trend
    const yesterdayCollectionsQuery = `
      SELECT COALESCE(SUM(qty_liters), 0) as total_liters
      FROM milk_collections
      WHERE created_at >= $1::timestamptz AND created_at <= $2::timestamptz
    `
    const yesterdayCollections = await db.custom(yesterdayCollectionsQuery, [
      `${yesterday}T00:00:00`,
      `${yesterday}T23:59:59`
    ])

    const todayLiters = parseFloat(todayCollections[0]?.total_liters || 0)
    const yesterdayLiters = parseFloat(yesterdayCollections[0]?.total_liters || 0)
    const collectionsTrend = yesterdayLiters > 0 
      ? ((todayLiters - yesterdayLiters) / yesterdayLiters) * 100 
      : 0

    // Pending deliveries
    const deliveriesQuery = `
      SELECT COUNT(*) as count, COUNT(DISTINCT route_id) as routes
      FROM deliveries
      WHERE status IN ('pending', 'in_transit')
    `
    const deliveries = await db.custom(deliveriesQuery)

    // Stock levels
    const inventoryQuery = `
      SELECT COUNT(DISTINCT product_id) as products, COALESCE(SUM(qty), 0) as total_stock
      FROM inventory_items
    `
    const inventory = await db.custom(inventoryQuery)

    // Cash from today's deliveries
    const cashQuery = `
      SELECT COALESCE(SUM(collected_amount), 0) as cash_in_hand
      FROM deliveries
      WHERE delivered_at >= $1::timestamptz AND status = 'delivered'
    `
    const cash = await db.custom(cashQuery, [`${today}T00:00:00`])

    // Pending cash
    const pendingCashQuery = `
      SELECT COALESCE(SUM(collected_amount), 0) as pending
      FROM deliveries
      WHERE status IN ('pending', 'in_transit')
    `
    const pendingCash = await db.custom(pendingCashQuery)

    const stats: DashboardStats = {
      todayCollections: {
        count: parseInt(todayCollections[0]?.count || '0'),
        liters: todayLiters,
        trend: {
          value: Math.abs(collectionsTrend),
          isPositive: collectionsTrend >= 0
        }
      },
      pendingDeliveries: {
        count: parseInt(deliveries[0]?.count || '0'),
        routes: parseInt(deliveries[0]?.routes || '0'),
        trend: { value: 5.2, isPositive: false }
      },
      stockLevel: {
        products: parseInt(inventory[0]?.products || '0'),
        totalLiters: parseFloat(inventory[0]?.total_stock || '0'),
        trend: { value: 8.3, isPositive: true }
      },
      cashInHand: {
        amount: parseFloat(cash[0]?.cash_in_hand || '0'),
        pending: parseFloat(pendingCash[0]?.pending || '0'),
        trend: { value: 15.7, isPositive: true }
      }
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
