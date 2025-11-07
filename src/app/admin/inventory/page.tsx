'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Package, AlertTriangle, TrendingDown } from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'

const inventoryItems = [
  {
    id: '1',
    product: 'Full Cream Milk',
    batchCode: 'BATCH-20241107-001',
    qty: 850,
    uom: 'L',
    location: 'Main Warehouse',
    threshold: 200,
    expiryDate: new Date('2024-11-15'),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: '2',
    product: 'Toned Milk',
    batchCode: 'BATCH-20241107-002',
    qty: 120,
    uom: 'L',
    location: 'Main Warehouse',
    threshold: 150,
    expiryDate: new Date('2024-11-14'),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 45)
  },
  {
    id: '3',
    product: 'Butter',
    batchCode: 'BATCH-20241106-003',
    qty: 45,
    uom: 'kg',
    location: 'Cold Storage',
    threshold: 50,
    expiryDate: new Date('2024-12-01'),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60)
  },
  {
    id: '4',
    product: 'Paneer',
    batchCode: 'BATCH-20241107-004',
    qty: 25,
    uom: 'kg',
    location: 'Cold Storage',
    threshold: 30,
    expiryDate: new Date('2024-11-10'),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 90)
  },
  {
    id: '5',
    product: 'Curd',
    batchCode: 'BATCH-20241107-005',
    qty: 180,
    uom: 'kg',
    location: 'Main Warehouse',
    threshold: 100,
    expiryDate: new Date('2024-11-12'),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 120)
  }
]

export default function InventoryPage() {
  const getStockStatus = (qty: number, threshold: number) => {
    if (qty < threshold * 0.5) {
      return <Badge variant="danger">Critical</Badge>
    } else if (qty < threshold) {
      return <Badge variant="warning">Low Stock</Badge>
    }
    return <Badge variant="success">In Stock</Badge>
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Track and manage stock levels across locations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Package className="w-5 h-5 mr-2" />
              Stock Transfer
            </Button>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              Stock Adjustment
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                </div>
                <Package className="w-10 h-10 text-blue-600" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Stock Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹8.5L</p>
                </div>
                <TrendingDown className="w-10 h-10 text-green-600" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">3</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-600" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">2</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Input type="text" placeholder="Filter by location" />
              <Input type="text" placeholder="Filter by batch" />
            </div>
          </CardBody>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Stock Overview</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryItems.map((item) => {
                    const daysToExpiry = Math.ceil((item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.product}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-600 font-mono">{item.batchCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{item.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatNumber(item.qty, 0)} {item.uom}
                          </div>
                          <div className="text-xs text-gray-500">
                            Threshold: {item.threshold} {item.uom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStockStatus(item.qty, item.threshold)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(item.expiryDate)}</div>
                          <div className={`text-xs ${daysToExpiry < 7 ? 'text-red-600' : 'text-gray-500'}`}>
                            {daysToExpiry} days left
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">Adjust</Button>
                            <Button size="sm" variant="outline">Transfer</Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}
