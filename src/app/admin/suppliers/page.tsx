'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const suppliers = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    email: 'ramesh@example.com',
    address: 'Village Rampur, District Meerut, UP',
    kycStatus: 'approved',
    autoReceipt: true,
    totalCollections: 1245,
    avgQty: 42.5,
    avgFat: 4.2,
    avgSnf: 8.5,
    joinedDate: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Suresh Patel',
    phone: '+91 98765 43211',
    email: 'suresh@example.com',
    address: 'Village Patelnagar, District Meerut, UP',
    kycStatus: 'pending',
    autoReceipt: true,
    totalCollections: 980,
    avgQty: 38.2,
    avgFat: 3.9,
    avgSnf: 8.3,
    joinedDate: new Date('2024-02-20')
  },
  {
    id: '3',
    name: 'Mahesh Singh',
    phone: '+91 98765 43212',
    email: 'mahesh@example.com',
    address: 'Village Singhpur, District Meerut, UP',
    kycStatus: 'approved',
    autoReceipt: false,
    totalCollections: 1520,
    avgQty: 48.5,
    avgFat: 4.5,
    avgSnf: 8.8,
    joinedDate: new Date('2023-11-10')
  },
  {
    id: '4',
    name: 'Ganesh Verma',
    phone: '+91 98765 43213',
    email: 'ganesh@example.com',
    address: 'Village Vermapur, District Meerut, UP',
    kycStatus: 'rejected',
    autoReceipt: true,
    totalCollections: 450,
    avgQty: 35.0,
    avgFat: 3.8,
    avgSnf: 8.2,
    joinedDate: new Date('2024-03-05')
  }
]

export default function SuppliersPage() {
  const getKycBadge = (status: string) => {
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
            <h1 className="text-3xl font-bold text-gray-900">Suppliers Management</h1>
            <p className="text-gray-600 mt-1">Manage farmer/supplier database and KYC verification</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Plus className="w-5 h-5 mr-2" />
              Import CSV
            </Button>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              Add Supplier
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">248</p>
              <p className="text-xs text-green-600 mt-1">↑ 12 this month</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">KYC Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">215</p>
              <p className="text-xs text-gray-500 mt-1">86.7% of total</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">KYC Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">28</p>
              <p className="text-xs text-orange-600 mt-1">Requires review</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">145</p>
              <p className="text-xs text-gray-500 mt-1">58.5% active</p>
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
                  placeholder="Search suppliers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Input type="text" placeholder="Filter by location" />
              <Button variant="outline">Advanced Filters</Button>
            </div>
          </CardBody>
        </Card>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">All Suppliers</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {supplier.address}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Joined: {formatDate(supplier.joinedDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {supplier.phone}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Mail className="w-3 h-3 mr-1" />
                            {supplier.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs">
                          <div className="text-gray-900 font-medium">{supplier.totalCollections} collections</div>
                          <div className="text-gray-500">Avg: {supplier.avgQty}L/day</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs">
                          <div className="text-gray-600">FAT: {supplier.avgFat}%</div>
                          <div className="text-gray-600">SNF: {supplier.avgSnf}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getKycBadge(supplier.kycStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                            <Edit className="w-4 h-4" />
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
      </div>
    </AdminLayout>
  )
}
