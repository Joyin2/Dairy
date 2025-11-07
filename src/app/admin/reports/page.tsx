'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Truck
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const collectionTrend = [
  { date: 'Mon', liters: 2400, collections: 120 },
  { date: 'Tue', liters: 2600, collections: 135 },
  { date: 'Wed', liters: 2200, collections: 110 },
  { date: 'Thu', liters: 2800, collections: 145 },
  { date: 'Fri', liters: 2900, collections: 150 },
  { date: 'Sat', liters: 3100, collections: 160 },
  { date: 'Sun', liters: 2700, collections: 140 }
]

const supplierPerformance = [
  { name: 'Top 20%', value: 45, color: '#3B82F6' },
  { name: 'Medium 50%', value: 35, color: '#60A5FA' },
  { name: 'Bottom 30%', value: 20, color: '#DBEAFE' }
]

const deliveryStats = [
  { route: 'Route A', onTime: 95, delayed: 5 },
  { route: 'Route B', onTime: 88, delayed: 12 },
  { route: 'Route C', onTime: 92, delayed: 8 },
  { route: 'Route D', onTime: 85, delayed: 15 },
  { route: 'Route E', onTime: 90, delayed: 10 }
]

export default function ReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-5 h-5 mr-2" />
              Export All
            </Button>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              Custom Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹12.5L</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">+18.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">248</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">+5.3%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Products Sold</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">18.2K L</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">+12.8%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">1,245</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">-2.1%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Collection Trend */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Weekly Collection Trend</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={collectionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="liters" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Liters"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="collections" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Collections"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Supplier Performance */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Supplier Performance</h2>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="50%" height={300}>
                  <PieChart>
                    <Pie
                      data={supplierPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {supplierPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 pl-6">
                  {supplierPerformance.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Delivery Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Delivery Performance by Route</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="route" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="onTime" fill="#3B82F6" name="On Time %" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="delayed" fill="#EF4444" name="Delayed %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Quick Reports</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Button variant="outline" className="justify-start">
                <Download className="w-5 h-5 mr-2" />
                Daily Collections Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-5 h-5 mr-2" />
                Supplier Performance
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-5 h-5 mr-2" />
                Financial Summary
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-5 h-5 mr-2" />
                Inventory Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-5 h-5 mr-2" />
                Delivery Analytics
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-5 h-5 mr-2" />
                Quality Control Report
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}
