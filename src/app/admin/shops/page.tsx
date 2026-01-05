'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, MapPin, Phone, Mail, Edit, Eye, Store } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useShops, useDeliveries } from '@/lib/hooks'
import type { Shop, Delivery } from '@/types/database'

const shops = [
  {
    id: '1',
    name: 'Sharma General Store',
    contact: 'Mr. Rajesh Sharma',
    phone: '+91 98765 43210',
    email: 'sharma@example.com',
    address: 'Market Road, Sector 5, Meerut',
    status: 'active',
    totalOrders: 245,
    totalRevenue: 125000,
    lastOrder: new Date(Date.now() - 1000 * 60 * 30),
    joinedDate: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Gandhi Dairy Shop',
    contact: 'Mr. Suresh Gandhi',
    phone: '+91 98765 43211',
    email: 'gandhi@example.com',
    address: 'Gandhi Nagar, Phase 2, Meerut',
    status: 'active',
    totalOrders: 189,
    totalRevenue: 98500,
    lastOrder: new Date(Date.now() - 1000 * 60 * 60),
    joinedDate: new Date('2024-02-10')
  },
  {
    id: '3',
    name: 'Patel Retailers',
    contact: 'Mrs. Priya Patel',
    phone: '+91 98765 43212',
    email: 'patel@example.com',
    address: 'East Street, Block C, Meerut',
    status: 'active',
    totalOrders: 312,
    totalRevenue: 185000,
    lastOrder: new Date(Date.now() - 1000 * 60 * 90),
    joinedDate: new Date('2023-11-05')
  },
  {
    id: '4',
    name: 'Modern Mart',
    contact: 'Mr. Amit Verma',
    phone: '+91 98765 43213',
    email: 'modern@example.com',
    address: 'Mall Road, Central, Meerut',
    status: 'inactive',
    totalOrders: 87,
    totalRevenue: 42000,
    lastOrder: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    joinedDate: new Date('2024-03-20')
  }
]

export default function ShopsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', contact: '', address: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: shops, error, isLoading, mutate } = useShops(searchTerm)
  const { data: deliveries } = useDeliveries()

  // Custom formatter for large currency values
  const formatLargeCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)}K`;
    }
    return `₹${amount}`;
  }

  // Calculate stats
  const stats = {
    total: shops?.length || 0,
    active: shops?.filter((shop: any) => shop.status === 'active').length || 0,
    revenue: deliveries ? formatLargeCurrency(deliveries.reduce((sum, delivery) => sum + (delivery.collected_amount || 0), 0)) : '₹0',
    avgOrders: shops && shops.length > 0 && deliveries ? Math.round(deliveries.length / shops.length) : 0
  }

  const handleAddShop = async () => {
    if (!formData.name) {
      alert('Please fill in the shop name')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create shop')
      
      mutate()
      setShowModal(false)
      setFormData({ name: '', contact: '', address: '' })
      alert('Shop created successfully')
    } catch (err) {
      alert('Error creating shop')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shops & Retailers</h1>
            <p className="text-gray-600 mt-1">Manage retail partners and shop information</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Plus className="w-5 h-5 mr-2" />
              Import CSV
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Shop
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Shops</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Active shops</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Active Shops</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.total ? ((stats.active / stats.total) * 100).toFixed(0) : 0}% of total</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.revenue}</p>
              <p className="text-xs text-gray-500 mt-1">From deliveries</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Avg Orders/Shop</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgOrders}</p>
              <p className="text-xs text-gray-500 mt-1">Based on deliveries</p>
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
                  placeholder="Search shops..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Input type="text" placeholder="Filter by location" />
              <Button variant="outline">Advanced Filters</Button>
            </div>
          </CardBody>
        </Card>

        {/* Shops Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">All Shops</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shop Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading shops...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                        Error loading shops
                      </td>
                    </tr>
                  ) : shops && shops.length > 0 ? (
                    shops.map((shop: Shop) => (
                      <tr key={shop.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Store className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                              <div className="text-xs text-gray-500">{shop.contact || 'No contact'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {shop.contact && (
                              <div className="flex items-center text-xs text-gray-600">
                                <Phone className="w-3 h-3 mr-1" />
                                {shop.contact}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{shop.address || 'No address'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs">
                            <div className="text-gray-900 font-medium">-</div>
                            <div className="text-gray-600">No data</div>
                            <div className="text-gray-500">Joined: {shop.created_at ? formatDate(new Date(shop.created_at)) : 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="success">
                            Active
                          </Badge>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No shops found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Add Shop Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Add New Shop</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                <Input
                  type="text"
                  placeholder="Shop Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <Input
                  type="text"
                  placeholder="Contact Person"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddShop} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Shop'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}
