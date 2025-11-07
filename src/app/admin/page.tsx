'use client'

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

// Mock data - replace with real data from Supabase
const dashboardStats = {
  todayCollections: {
    count: 145,
    liters: 2845.5,
    trend: { value: 12.5, isPositive: true }
  },
  pendingDeliveries: {
    count: 23,
    routes: 8,
    trend: { value: 5.2, isPositive: false }
  },
  stockLevel: {
    products: 12,
    totalLiters: 15420,
    trend: { value: 8.3, isPositive: true }
  },
  cashInHand: {
    amount: 145780,
    pending: 23500,
    trend: { value: 15.7, isPositive: true }
  }
}

const recentCollections = [
  {
    id: '1',
    supplier: 'Ramesh Kumar',
    qty: 45.5,
    fat: 4.2,
    snf: 8.5,
    status: 'approved',
    time: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: '2',
    supplier: 'Suresh Patel',
    qty: 38.0,
    fat: 3.8,
    snf: 8.2,
    status: 'pending',
    time: new Date(Date.now() - 1000 * 60 * 25)
  },
  {
    id: '3',
    supplier: 'Mahesh Singh',
    qty: 52.3,
    fat: 4.5,
    snf: 8.8,
    status: 'approved',
    time: new Date(Date.now() - 1000 * 60 * 35)
  },
  {
    id: '4',
    supplier: 'Ganesh Verma',
    qty: 41.2,
    fat: 4.0,
    snf: 8.3,
    status: 'pending',
    time: new Date(Date.now() - 1000 * 60 * 45)
  }
]

const activeDeliveries = [
  {
    id: '1',
    agent: 'Rajesh Delivery',
    route: 'Route A - North',
    shops: 12,
    completed: 8,
    status: 'in_transit'
  },
  {
    id: '2',
    agent: 'Vijay Transport',
    route: 'Route B - South',
    shops: 15,
    completed: 15,
    status: 'completed'
  },
  {
    id: '3',
    agent: 'Amit Logistics',
    route: 'Route C - East',
    shops: 10,
    completed: 3,
    status: 'in_transit'
  }
]

const lowStockAlerts = [
  { id: '1', product: 'Full Cream Milk', current: 120, threshold: 200, unit: 'L' },
  { id: '2', product: 'Toned Milk', current: 85, threshold: 150, unit: 'L' },
  { id: '3', product: 'Butter', current: 15, threshold: 30, unit: 'kg' }
]

export default function AdminDashboard() {
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
            value={formatNumber(dashboardStats.todayCollections.liters) + ' L'}
            icon={<Milk className="w-6 h-6" />}
            trend={dashboardStats.todayCollections.trend}
            subtitle={`${dashboardStats.todayCollections.count} collections`}
          />
          <StatCard
            title="Pending Deliveries"
            value={dashboardStats.pendingDeliveries.count}
            icon={<Truck className="w-6 h-6" />}
            trend={dashboardStats.pendingDeliveries.trend}
            subtitle={`${dashboardStats.pendingDeliveries.routes} active routes`}
          />
          <StatCard
            title="Total Stock"
            value={formatNumber(dashboardStats.stockLevel.totalLiters) + ' L'}
            icon={<Package className="w-6 h-6" />}
            trend={dashboardStats.stockLevel.trend}
            subtitle={`${dashboardStats.stockLevel.products} products`}
          />
          <StatCard
            title="Cash in Hand"
            value={formatCurrency(dashboardStats.cashInHand.amount)}
            icon={<DollarSign className="w-6 h-6" />}
            trend={dashboardStats.cashInHand.trend}
            subtitle={`${formatCurrency(dashboardStats.cashInHand.pending)} pending`}
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
                    {recentCollections.map((collection) => (
                      <tr key={collection.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{collection.supplier}</div>
                          <div className="text-xs text-gray-500">{formatDateTime(collection.time)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{collection.qty} L</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500">FAT: {collection.fat}%</div>
                          <div className="text-xs text-gray-500">SNF: {collection.snf}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={collection.status === 'approved' ? 'success' : 'warning'}>
                            {collection.status === 'approved' ? 'Approved' : 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
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
                {activeDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{delivery.route}</h3>
                        {delivery.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{delivery.agent}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{delivery.completed}/{delivery.shops} shops</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(delivery.completed / delivery.shops) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
              {lowStockAlerts.map((alert) => (
                <div key={alert.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{alert.product}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Current: <span className="font-medium text-orange-600">{alert.current} {alert.unit}</span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Threshold: {alert.threshold} {alert.unit}
                      </p>
                    </div>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}
