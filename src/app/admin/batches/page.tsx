'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Package, Eye } from 'lucide-react'
import { formatDate, formatDateTime, formatNumber } from '@/lib/utils'

const batches = [
  {
    id: '1',
    batchCode: 'BATCH-20241107-001',
    productionDate: new Date('2024-11-07'),
    product: 'Full Cream Milk',
    inputCollections: ['COL-001', 'COL-002', 'COL-003'],
    yieldQty: 850,
    expiryDate: new Date('2024-11-15'),
    qcStatus: 'approved',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: '2',
    batchCode: 'BATCH-20241107-002',
    productionDate: new Date('2024-11-07'),
    product: 'Toned Milk',
    inputCollections: ['COL-004', 'COL-005'],
    yieldQty: 450,
    expiryDate: new Date('2024-11-14'),
    qcStatus: 'pending',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1)
  },
  {
    id: '3',
    batchCode: 'BATCH-20241106-003',
    productionDate: new Date('2024-11-06'),
    product: 'Butter',
    inputCollections: ['COL-006', 'COL-007', 'COL-008', 'COL-009'],
    yieldQty: 75,
    expiryDate: new Date('2024-12-01'),
    qcStatus: 'approved',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: '4',
    batchCode: 'BATCH-20241106-004',
    productionDate: new Date('2024-11-06'),
    product: 'Paneer',
    inputCollections: ['COL-010', 'COL-011'],
    yieldQty: 45,
    expiryDate: new Date('2024-11-10'),
    qcStatus: 'approved',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26)
  }
]

export default function BatchesPage() {
  const getQcBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>
      case 'pending':
        return <Badge variant="warning">Pending QC</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Batches</h1>
            <p className="text-gray-600 mt-1">Manage production batches and quality control</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Package className="w-5 h-5 mr-2" />
              Batch Report
            </Button>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              Create Batch
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Today's Batches</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
              <p className="text-xs text-green-600 mt-1">↑ 3 vs yesterday</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Yield Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">2,840 L</p>
              <p className="text-xs text-green-600 mt-1">↑ 12% vs yesterday</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Pending QC</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">3</p>
              <p className="text-xs text-gray-500 mt-1">Requires approval</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">QC Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">9</p>
              <p className="text-xs text-gray-500 mt-1">Ready for inventory</p>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search batch code..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Input type="date" placeholder="Production date" />
              <Input type="text" placeholder="Product name" />
              <Button variant="outline">Advanced Filters</Button>
            </div>
          </CardBody>
        </Card>

        {/* Batches Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">All Batches</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Production Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yield
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Input Collections
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900">{batch.batchCode}</div>
                        <div className="text-xs text-gray-500">By {batch.createdBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{batch.product}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(batch.productionDate)}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(batch.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatNumber(batch.yieldQty, 0)} L
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {batch.inputCollections.slice(0, 3).map((col) => (
                            <span key={col} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {col}
                            </span>
                          ))}
                          {batch.inputCollections.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{batch.inputCollections.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(batch.expiryDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getQcBadge(batch.qcStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          {batch.qcStatus === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">Approve</Button>
                              <Button size="sm" variant="outline">Reject</Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}
