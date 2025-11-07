'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Search, 
  MapPin, 
  Truck, 
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/lib/utils'

const deliveries = [
  {
    id: '1',
    route: 'Route A - North Zone',
    agent: 'Rajesh Kumar',
    shop: 'Sharma Store',
    shopAddress: 'Market Road, Sector 5',
    items: [
      { product: 'Full Cream Milk', qty: 50, unit: 'L' },
      { product: 'Butter', qty: 5, unit: 'kg' }
    ],
    status: 'delivered',
    expectedQty: 55,
    deliveredQty: 55,
    collectedAmount: 4500,
    paymentMode: 'cash',
    deliveredAt: new Date(Date.now() - 1000 * 60 * 30),
    proofUrl: '/proof1.jpg',
    signatureUrl: '/sign1.jpg'
  },
  {
    id: '2',
    route: 'Route B - South Zone',
    agent: 'Vijay Singh',
    shop: 'Gandhi Dairy',
    shopAddress: 'Gandhi Nagar, Phase 2',
    items: [
      { product: 'Toned Milk', qty: 75, unit: 'L' }
    ],
    status: 'in_transit',
    expectedQty: 75,
    deliveredQty: null,
    collectedAmount: null,
    paymentMode: null,
    deliveredAt: null,
    proofUrl: null,
    signatureUrl: null
  },
  {
    id: '3',
    route: 'Route C - East Zone',
    agent: 'Amit Verma',
    shop: 'Patel Retailers',
    shopAddress: 'East Street, Block C',
    items: [
      { product: 'Full Cream Milk', qty: 40, unit: 'L' },
      { product: 'Curd', qty: 10, unit: 'kg' }
    ],
    status: 'partial',
    expectedQty: 50,
    deliveredQty: 45,
    collectedAmount: 3200,
    paymentMode: 'upi',
    deliveredAt: new Date(Date.now() - 1000 * 60 * 90),
    proofUrl: '/proof3.jpg',
    signatureUrl: '/sign3.jpg'
  },
  {
    id: '4',
    route: 'Route A - North Zone',
    agent: 'Rajesh Kumar',
    shop: 'Modern Mart',
    shopAddress: 'Mall Road, Central',
    items: [
      { product: 'Toned Milk', qty: 100, unit: 'L' }
    ],
    status: 'pending',
    expectedQty: 100,
    deliveredQty: null,
    collectedAmount: null,
    paymentMode: null,
    deliveredAt: null,
    proofUrl: null,
    signatureUrl: null
  },
  {
    id: '5',
    route: 'Route D - West Zone',
    agent: 'Sunil Yadav',
    shop: 'Quick Mart',
    shopAddress: 'West Avenue, Lane 4',
    items: [
      { product: 'Full Cream Milk', qty: 30, unit: 'L' },
      { product: 'Paneer', qty: 8, unit: 'kg' }
    ],
    status: 'returned',
    expectedQty: 38,
    deliveredQty: 0,
    collectedAmount: 0,
    paymentMode: null,
    deliveredAt: new Date(Date.now() - 1000 * 60 * 120),
    proofUrl: null,
    signatureUrl: null
  }
]

export default function DeliveriesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>
      case 'in_transit':
        return <Badge variant="info"><Truck className="w-3 h-3 mr-1" />In Transit</Badge>
      case 'partial':
        return <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" />Partial</Badge>
      case 'returned':
        return <Badge variant="danger">Returned</Badge>
      case 'pending':
        return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
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
            <h1 className="text-3xl font-bold text-gray-900">Deliveries Management</h1>
            <p className="text-gray-600 mt-1">Track and manage delivery operations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <MapPin className="w-5 h-5 mr-2" />
              Track Live
            </Button>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              New Delivery
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600 mt-1">98</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">42</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">12</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-red-600 mt-1">4</p>
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
                  placeholder="Search deliveries..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'All Routes' },
                  { value: 'route-a', label: 'Route A - North' },
                  { value: 'route-b', label: 'Route B - South' },
                  { value: 'route-c', label: 'Route C - East' },
                  { value: 'route-d', label: 'Route D - West' }
                ]}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'in_transit', label: 'In Transit' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'returned', label: 'Returned' }
                ]}
              />
              <Input type="date" />
            </div>
          </CardBody>
        </Card>

        {/* Deliveries Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">All Deliveries</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route & Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shop Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{delivery.route}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Truck className="w-3 h-3" />
                            {delivery.agent}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{delivery.shop}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {delivery.shopAddress}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          {delivery.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <Package className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-900">{item.product}</span>
                              <span className="text-gray-500">({item.qty} {item.unit})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs">
                          <div className="text-gray-900">
                            {delivery.deliveredQty !== null ? (
                              <span className={delivery.deliveredQty < delivery.expectedQty ? 'text-orange-600' : 'text-green-600'}>
                                {delivery.deliveredQty}/{delivery.expectedQty}
                              </span>
                            ) : (
                              <span className="text-gray-500">{delivery.expectedQty} expected</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs">
                          {delivery.collectedAmount !== null ? (
                            <>
                              <div className="text-gray-900 font-medium">{formatCurrency(delivery.collectedAmount)}</div>
                              <div className="text-gray-500">{delivery.paymentMode}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(delivery.status)}
                          {delivery.deliveredAt && (
                            <div className="text-xs text-gray-500">
                              {formatDateTime(delivery.deliveredAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          {delivery.proofUrl && (
                            <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                              <ImageIcon className="w-4 h-4" />
                            </button>
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
