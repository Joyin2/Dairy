'use client'

import { useEffect, useState } from 'react'
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
import { useMilkCollections, useSuppliers } from '@/lib/hooks'
import type { MilkCollection, Supplier } from '@/types/database'

export default function CollectionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    supplier_id: '',
    qty_liters: '',
    fat: '',
    snf: '',
    qc_status: 'pending' as 'pending' | 'approved' | 'rejected'
  })
  const [isClient, setIsClient] = useState(false)

  // Initialize date after component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
    // DON'T set a default date - show all collections by default
  }, [])

  // Fetch collections
  const { data: collections, error, isLoading, mutate } = useMilkCollections({
    date: isClient && selectedDate ? selectedDate : undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined
  })

  // Debug collections data
  useEffect(() => {
    console.log('Collections data:', collections);
    console.log('Selected date:', selectedDate);
    console.log('Filter status:', filterStatus);
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
  }, [collections, selectedDate, filterStatus, isLoading, error]);

  // Fetch suppliers for the dropdown
  const { data: suppliers, error: suppliersError } = useSuppliers()

  // Debug suppliers data
  useEffect(() => {
    if (suppliers) {
      console.log('Suppliers loaded:', suppliers);
    }
    if (suppliersError) {
      console.error('Suppliers error:', suppliersError);
    }
  }, [suppliers, suppliersError]);

  // Auto-refresh every 30 seconds to get latest data
  useEffect(() => {
    const interval = setInterval(() => {
      mutate()
    }, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [mutate])

  // Calculate stats
  const stats = {
    count: collections?.length || 0,
    totalLiters: collections?.reduce((sum: number, c: any) => sum + (parseFloat(c.qty_liters) || 0), 0) || 0,
    avgFat: collections && collections.length > 0 
      ? parseFloat((collections.reduce((sum: number, c: any) => sum + (parseFloat(c.fat) || 0), 0) / collections.length).toFixed(2)) 
      : 0,
    avgSnf: collections && collections.length > 0 
      ? parseFloat((collections.reduce((sum: number, c: any) => sum + (parseFloat(c.snf) || 0), 0) / collections.length).toFixed(2)) 
      : 0
  }

  // Filter by search term
  const filteredCollections = collections?.filter((c: MilkCollection) =>
    searchTerm === '' || c.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getStatusBadge = (status?: string) => {
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

  const handleAddCollection = async () => {
    // Validate required fields
    if (!formData.supplier_id || !formData.qty_liters) {
      alert('Please fill in all required fields')
      return
    }

    // Validate numeric fields
    const qtyLiters = parseFloat(formData.qty_liters)
    if (isNaN(qtyLiters) || qtyLiters <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    const fat = formData.fat ? parseFloat(formData.fat) : null
    if (formData.fat && (isNaN(fat!) || fat! < 0)) {
      alert('Please enter a valid FAT percentage')
      return
    }

    const snf = formData.snf ? parseFloat(formData.snf) : null
    if (formData.snf && (isNaN(snf!) || snf! < 0)) {
      alert('Please enter a valid SNF percentage')
      return
    }

    setIsSubmitting(true)
    try {
      const collectionData = {
        supplier_id: formData.supplier_id,
        qty_liters: qtyLiters,
        fat: fat,
        snf: snf,
        qc_status: formData.qc_status,
        status: 'new',
        operator_user_id: null // Set to null instead of invalid UUID
      }

      console.log('Sending collection data:', collectionData);

      const response = await fetch('/api/milk-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionData)
      })

      const responseText = await response.text()
      
      // Check if response is HTML (error page) instead of JSON
      if (responseText.startsWith('<!DOCTYPE html>')) {
        throw new Error('API endpoint not found (404 error)')
      }
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error(`Server error: ${responseText || 'Empty response'}`)
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to create collection (HTTP ${response.status})`)
      }
      
      mutate()
      setShowModal(false)
      setFormData({
        supplier_id: '',
        qty_liters: '',
        fat: '',
        snf: '',
        qc_status: 'pending'
      })
      alert('Collection added successfully')
    } catch (err: any) {
      alert(`Error adding collection: ${err.message}`)
      console.error('Collection creation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveCollection = async (collectionId: string) => {
    try {
      const response = await fetch(`/api/milk-collections?id=${collectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qc_status: 'approved' })
      })

      const responseText = await response.text()
      
      // Check if response is HTML (error page) instead of JSON
      if (responseText.startsWith('<!DOCTYPE html>')) {
        throw new Error('API endpoint not found (404 error)')
      }
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error(`Server error: ${responseText || 'Empty response'}`)
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to approve collection (HTTP ${response.status})`)
      }
      
      // Force refresh with revalidate option
      await mutate(undefined, { revalidate: true })
      alert('Collection approved successfully')
    } catch (err: any) {
      alert(`Error approving collection: ${err.message}`)
      console.error('Collection approval error:', err)
    }
  }

  const handleRejectCollection = async (collectionId: string) => {
    try {
      const response = await fetch(`/api/milk-collections?id=${collectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qc_status: 'rejected' })
      })

      const responseText = await response.text()
      
      // Check if response is HTML (error page) instead of JSON
      if (responseText.startsWith('<!DOCTYPE html>')) {
        throw new Error('API endpoint not found (404 error)')
      }
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error(`Server error: ${responseText || 'Empty response'}`)
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to reject collection (HTTP ${response.status})`)
      }
      
      // Force refresh with revalidate option
      await mutate(undefined, { revalidate: true })
      alert('Collection rejected successfully')
    } catch (err: any) {
      alert(`Error rejecting collection: ${err.message}`)
      console.error('Collection rejection error:', err)
    }
  }

  const handleViewCollection = (collection: MilkCollection) => {
    // For now, just show an alert with collection details
    // In a real app, you might open a modal with more details
    alert(`Collection Details:

ID: ${collection.id}
Supplier: ${collection.supplier?.name || 'N/A'}
Quantity: ${collection.qty_liters} L
FAT: ${collection.fat || 'N/A'}%
SNF: ${collection.snf || 'N/A'}%
Status: ${collection.qc_status || 'N/A'}
Date: ${collection.created_at ? formatDateTime(new Date(collection.created_at)) : 'N/A'}`)
  }

  const handleShowLocation = (collection: MilkCollection) => {
    // For now, just show an alert
    // In a real app, you might show a map with the location
    if (collection.gps) {
      alert(`Location:

GPS: ${collection.gps}

In a real app, this would show a map with the collection location.`)
    } else {
      alert('No location data available for this collection.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6" suppressHydrationWarning>
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
            <Button variant="primary" onClick={() => setShowModal(true)}>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.count}</p>
              <p className="text-xs text-gray-500 mt-1">Total records</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Liters</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalLiters)} L</p>
              <p className="text-xs text-gray-500 mt-1">Collected today</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Avg FAT</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgFat.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Average quality</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Avg SNF</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgSnf.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Average quality</p>
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
              <Input 
                type="date" 
                placeholder="Select date" 
                value={selectedDate || ''}
                onChange={(e) => setSelectedDate(e.target.value)}
                suppressHydrationWarning
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedDate('')}
                >
                  Clear Date
                </Button>
                <Button variant="outline">
                  <Filter className="w-5 h-5 mr-2" />
                  More Filters
                </Button>
              </div>
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        Loading collections...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-red-500">
                        Error loading collections
                      </td>
                    </tr>
                  ) : filteredCollections && filteredCollections.length > 0 ? (
                    filteredCollections.map((collection: MilkCollection) => (
                      <tr key={collection.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {collection.supplier?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {collection.supplier?.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatNumber(collection.qty_liters)} L
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {collection.fat ? formatNumber(collection.fat) : 'N/A'}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {collection.snf ? formatNumber(collection.snf) : 'N/A'}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {collection.operator?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500">
                            {collection.created_at ? new Date(collection.created_at).toISOString().slice(0, 16).replace('T', ' ') : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(collection.qc_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                              onClick={() => handleViewCollection(collection)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {collection.qc_status === 'pending' && (
                              <>
                                <button 
                                  className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                                  onClick={() => handleApproveCollection(collection.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                                  onClick={() => handleRejectCollection(collection.id)}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button 
                              className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded"
                              onClick={() => handleShowLocation(collection)}
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No collections found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredCollections.length > 0 ? 1 : 0}</span> to{' '}
            <span className="font-medium">{filteredCollections.length}</span> of{' '}
            <span className="font-medium">{collections?.length || 0}</span> results
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

      {/* Add Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Add New Collection</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  disabled={!suppliers}
                >
                  <option value="">{suppliers ? 'Select a supplier' : 'Loading suppliers...'}</option>
                  {suppliers && suppliers.map((supplier: Supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Liters) *</label>
                <Input
                  type="number"
                  step="0.001"
                  placeholder="Enter quantity in liters"
                  value={formData.qty_liters}
                  onChange={(e) => setFormData({ ...formData, qty_liters: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FAT %</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter FAT percentage"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SNF %</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter SNF percentage"
                  value={formData.snf}
                  onChange={(e) => setFormData({ ...formData, snf: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QC Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.qc_status}
                  onChange={(e) => setFormData({ ...formData, qc_status: e.target.value as any })}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddCollection} disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Collection'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}
