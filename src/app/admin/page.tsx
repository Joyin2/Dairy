'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Milk, 
  Package, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react'
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils'
import { useDashboardStats, useMilkCollections, useDeliveries, useInventory } from '@/lib/hooks'
import type { MilkCollection, Delivery, InventoryItem } from '@/types/database'

export default function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0]
  
  // Fetch data using SWR hooks
  const { data: stats } = useDashboardStats()
  const { data: collections, mutate: mutateCollections } = useMilkCollections({ date: today })
  const { data: allDeliveries, mutate: mutateDeliveries } = useDeliveries()
  const { data: inventory } = useInventory()

  // Auto-refresh every 30 seconds to get latest data
  useEffect(() => {
    const interval = setInterval(() => {
      mutateCollections()
      mutateDeliveries()
    }, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [mutateCollections, mutateDeliveries])

  // Get active deliveries
  const activeDeliveries = allDeliveries?.filter((d: Delivery) => 
    d.status === 'in_transit' || d.status === 'delivered'
  ).slice(0, 3) || []

  // Get low stock items
  const lowStockItems = inventory?.filter((item: InventoryItem) => {
    const threshold = 200
    return item.qty < threshold
  }).slice(0, 3) || []

  // Get recent collections
  const recentCollections = collections?.slice(0, 4) || []
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <Button variant="primary">
            <TrendingUp className="w-5 h-5 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Collections"
            value={formatNumber(stats?.todayCollections.liters || 0) + ' L'}
            icon={<Milk className="w-6 h-6" />}
            trend={stats?.todayCollections.trend}
            subtitle={`${stats?.todayCollections.count || 0} collections`}
          />
          <StatCard
            title="Pending Deliveries"
            value={stats?.pendingDeliveries.count || 0}
            icon={<Truck className="w-6 h-6" />}
            trend={stats?.pendingDeliveries.trend}
            subtitle={`${stats?.pendingDeliveries.routes || 0} active routes`}
          />
          <StatCard
            title="Total Stock"
            value={formatNumber(stats?.stockLevel.totalLiters || 0) + ' L'}
            icon={<Package className="w-6 h-6" />}
            trend={stats?.stockLevel.trend}
            subtitle={`${stats?.stockLevel.products || 0} products`}
          />
          <StatCard
            title="Cash in Hand"
            value={formatCurrency(stats?.cashInHand.amount || 0)}
            icon={<DollarSign className="w-6 h-6" />}
            trend={stats?.cashInHand.trend}
            subtitle={`${formatCurrency(stats?.cashInHand.pending || 0)} pending`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Collections */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Collections</h2>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentCollections.map((collection: MilkCollection) => (
                      <tr key={collection.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {collection.supplier?.name || 'Unknown Supplier'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {collection.created_at ? formatDateTime(new Date(collection.created_at)) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{collection.qty_liters} L</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500">FAT: {collection.fat || 'N/A'}%</div>
                          <div className="text-xs text-gray-500">SNF: {collection.snf || 'N/A'}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={collection.qc_status === 'approved' ? 'success' : 'warning'}>
                            {collection.qc_status === 'approved' ? 'Approved' : collection.qc_status === 'pending' ? 'Pending' : 'Rejected'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {recentCollections.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No collections today
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Active Deliveries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Active Deliveries</h2>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {activeDeliveries.map((delivery: Delivery) => {
                  const route = delivery.route
                  const shop = delivery.shop
                  const progress = delivery.expected_qty && delivery.delivered_qty 
                    ? (delivery.delivered_qty / delivery.expected_qty) * 100 
                    : 0

                  return (
                    <div key={delivery.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {route?.name || 'Unnamed Route'} - {shop?.name || 'Unknown Shop'}
                          </h3>
                          {delivery.status === 'delivered' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {route?.agent?.name || 'Unassigned Agent'}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{delivery.delivered_qty || 0}/{delivery.expected_qty || 0} L</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {activeDeliveries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No active deliveries
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
              </div>
              <Button variant="outline" size="sm">
                Manage Inventory
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {lowStockItems.map((item: InventoryItem) => (
                <div key={item.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.product?.name || 'Unknown Product'}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Current: <span className="font-medium text-orange-600">{item.qty} {item.uom || 'L'}</span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Threshold: 200 {item.uom || 'L'}
                      </p>
                    </div>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="col-span-3 text-center py-4 text-gray-500">
                  All stock levels are healthy
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}
