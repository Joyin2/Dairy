'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useSuppliers } from '@/lib/hooks'
import type { Supplier } from '@/types/database'

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', kyc_status: 'pending', auto_receipt_pref: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: suppliers, error, isLoading, mutate } = useSuppliers(searchTerm)
  
  const handleAddSupplier = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create supplier')
      
      mutate()
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', address: '', kyc_status: 'pending', auto_receipt_pref: false })
      alert('Supplier added successfully')
    } catch (err) {
      alert('Error adding supplier')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowViewModal(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      kyc_status: supplier.kyc_status || 'pending',
      auto_receipt_pref: supplier.auto_receipt_pref || false
    })
    setShowEditModal(true)
  }

  const handleUpdateSupplier = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    if (!selectedSupplier) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/suppliers?id=${selectedSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const text = await response.text()
      
      // Check if response is HTML (error page) instead of JSON
      if (text.startsWith('<!DOCTYPE html>')) {
        throw new Error('API endpoint not found (404 error)')
      }
      
      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error(`Server error: ${text || 'Empty response'}`)
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to update supplier (HTTP ${response.status})`)
      }
      
      mutate()
      setShowEditModal(false)
      setSelectedSupplier(null)
      setFormData({ name: '', email: '', phone: '', address: '', kyc_status: 'pending', auto_receipt_pref: false })
      alert('Supplier updated successfully')
    } catch (err: any) {
      alert(`Error updating supplier: ${err.message}`)
      console.error('Update error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getKycBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      default:
        return <Badge variant="default">{status || 'Unknown'}</Badge>
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
            <Button variant="primary" onClick={() => setShowModal(true)}>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{suppliers?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Active suppliers</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">KYC Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {suppliers?.filter(s => s.kyc_status === 'approved').length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {suppliers?.length ? ((suppliers.filter(s => s.kyc_status === 'approved').length / suppliers.length) * 100).toFixed(1) : 0}% of total
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">KYC Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {suppliers?.filter(s => s.kyc_status === 'pending').length || 0}
              </p>
              <p className="text-xs text-orange-600 mt-1">Requires review</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Auto Receipt</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {suppliers?.filter(s => s.auto_receipt_pref).length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Enabled</p>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading suppliers...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                        Error loading suppliers
                      </td>
                    </tr>
                  ) : suppliers && suppliers.length > 0 ? (
                    suppliers.map((supplier: Supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {supplier.address || 'No address'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Joined: {supplier.created_at ? formatDate(new Date(supplier.created_at)) : 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {supplier.phone && (
                              <div className="flex items-center text-xs text-gray-600">
                                <Phone className="w-3 h-3 mr-1" />
                                {supplier.phone}
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center text-xs text-gray-600">
                                <Mail className="w-3 h-3 mr-1" />
                                {supplier.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs">
                            <div className="text-gray-900 font-medium">-</div>
                            <div className="text-gray-500">No data</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs">
                            <div className="text-gray-600">-</div>
                            <div className="text-gray-600">-</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getKycBadge(supplier.kyc_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleViewSupplier(supplier)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditSupplier(supplier)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No suppliers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Add New Supplier</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.kyc_status}
                  onChange={(e) => setFormData({ ...formData, kyc_status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoReceipt"
                  checked={formData.auto_receipt_pref}
                  onChange={(e) => setFormData({ ...formData, auto_receipt_pref: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoReceipt" className="ml-2 block text-sm text-gray-700">
                  Enable Auto Receipt
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddSupplier} disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Supplier'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* View Supplier Modal */}
      {showViewModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Supplier Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Name</label>
                <p className="text-gray-900 mt-1">{selectedSupplier.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                <p className="text-gray-900 mt-1">{selectedSupplier.email || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Phone</label>
                <p className="text-gray-900 mt-1">{selectedSupplier.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Address</label>
                <p className="text-gray-900 mt-1">{selectedSupplier.address || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">KYC Status</label>
                <div className="mt-1">{getKycBadge(selectedSupplier.kyc_status)}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Auto Receipt</label>
                <p className="text-gray-900 mt-1">{selectedSupplier.auto_receipt_pref ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="primary" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Edit Supplier</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.kyc_status}
                  onChange={(e) => setFormData({ ...formData, kyc_status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editAutoReceipt"
                  checked={formData.auto_receipt_pref}
                  onChange={(e) => setFormData({ ...formData, auto_receipt_pref: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="editAutoReceipt" className="ml-2 block text-sm text-gray-700">
                  Enable Auto Receipt
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => { setShowEditModal(false); setSelectedSupplier(null) }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpdateSupplier} disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Supplier'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}
