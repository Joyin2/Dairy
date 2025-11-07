'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  Filter, 
  Download, 
  Plus, 
  Search,
  MapPin,
  Check,
  X,
  Eye
} from 'lucide-react'
import { formatDateTime, formatNumber } from '@/lib/utils'
import { useState } from 'react'

// Mock data
const collections = [
  {
    id: '1',
    supplier: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    qty: 45.5,
    fat: 4.2,
    snf: 8.5,
    operator: 'Operator 1',
    qcStatus: 'approved',
    status: 'new',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    gps: { lat: 28.6139, lng: 77.2090 },
    photoUrl: null
  },
  {
    id: '2',
    supplier: 'Suresh Patel',
    phone: '+91 98765 43211',
    qty: 38.0,
    fat: 3.8,
    snf: 8.2,
    operator: 'Operator 2',
    qcStatus: 'pending',
    status: 'new',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    gps: { lat: 28.6140, lng: 77.2091 },
    photoUrl: null
  },
  {
    id: '3',
    supplier: 'Mahesh Singh',
    phone: '+91 98765 43212',
    qty: 52.3,
    fat: 4.5,
    snf: 8.8,
    operator: 'Operator 1',
    qcStatus: 'approved',
    status: 'new',
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
    gps: { lat: 28.6141, lng: 77.2092 },
    photoUrl: null
  },
  {
    id: '4',
    supplier: 'Ganesh Verma',
    phone: '+91 98765 43213',
    qty: 41.2,
    fat: 4.0,
    snf: 8.3,
    operator: 'Operator 3',
    qcStatus: 'rejected',
    status: 'new',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    gps: { lat: 28.6142, lng: 77.2093 },
    photoUrl: null
  },
  {
    id: '5',
    supplier: 'Dinesh Yadav',
    phone: '+91 98765 43214',
    qty: 35.8,
    fat: 3.9,
    snf: 8.4,
    operator: 'Operator 2',
    qcStatus: 'pending',
    status: 'new',
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    gps: { lat: 28.6143, lng: 77.2094 },
    photoUrl: null
  }
]

export default function CollectionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
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
            <h1 className="text-3xl font-bold text-gray-900">Milk Collections</h1>
            <p className="text-gray-600 mt-1">View and manage daily milk collection records</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-5 h-5 mr-2" />
              Export
            </Button>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              New Collection
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Today's Collections</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">145</p>
              <p className="text-xs text-green-600 mt-1">↑ 12.5% vs yesterday</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Liters</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">2,845.5 L</p>
              <p className="text-xs text-green-600 mt-1">↑ 8.3% vs yesterday</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Avg FAT</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">4.2%</p>
              <p className="text-xs text-gray-500 mt-1">Within range</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Avg SNF</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8.4%</p>
              <p className="text-xs text-gray-500 mt-1">Within range</p>
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
                  placeholder="Search by supplier..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'rejected', label: 'Rejected' }
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
              <Input type="date" placeholder="Select date" />
              <Button variant="outline">
                <Filter className="w-5 h-5 mr-2" />
                More Filters
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Collections Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">All Collections</h2>
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
                      FAT %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SNF %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
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
                  {collections.map((collection) => (
                    <tr key={collection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{collection.supplier}</div>
                        <div className="text-xs text-gray-500">{collection.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatNumber(collection.qty)} L</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatNumber(collection.fat)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatNumber(collection.snf)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{collection.operator}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">{formatDateTime(collection.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(collection.qcStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          {collection.qcStatus === 'pending' && (
                            <>
                              <button className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded">
                                <Check className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded">
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
            <span className="font-medium">145</span> results
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="primary" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
