'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Package, Eye, Check, X } from 'lucide-react'
import { formatDate, formatDateTime, formatNumber } from '@/lib/utils'
import { useBatches, useMilkCollections, useProducts } from '@/lib/hooks'
import type { Batch, MilkCollection, Product } from '@/types/database'

export default function BatchesPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [formData, setFormData] = useState({
    product_id: '',
    yield_qty: '',
    expiry_date: '',
    batch_code: ''
  })

  // Fetch batches with optional date filter
  const { data: batches, error, isLoading, mutate } = useBatches({ 
    date: selectedDate || undefined 
  })

  // Fetch approved collections for batch creation
  const { data: collections } = useMilkCollections({ 
    status: 'approved' 
  })

  // Fetch products
  const { data: products } = useProducts()

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      mutate()
    }, 30000)
    return () => clearInterval(interval)
  }, [mutate])

  // Calculate stats
  const stats = {
    count: batches?.length || 0,
    totalYield: batches?.reduce((sum: number, b: any) => sum + (parseFloat(b.yield_qty) || 0), 0) || 0,
    pendingQc: batches?.filter((b: Batch) => b.qc_status === 'pending').length || 0,
    approved: batches?.filter((b: Batch) => b.qc_status === 'approved').length || 0
  }

  // Calculate total liters from selected collections
  const totalInputLiters = selectedCollections.reduce((sum, id) => {
    const collection = collections?.find((c: MilkCollection) => c.id === id)
    return sum + (parseFloat(collection?.qty_liters as any) || 0)
  }, 0)

  const getQcBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>
      case 'pending':
        return <Badge variant="warning">Pending QC</Badge>
      default:
        return <Badge variant="default">{status || 'Unknown'}</Badge>
    }
  }

  const handleCreateBatch = async () => {
    if (selectedCollections.length === 0) {
      alert('Please select at least one collection')
      return
    }

    if (!formData.product_id) {
      alert('Please select a product')
      return
    }

    if (!formData.yield_qty || parseFloat(formData.yield_qty) <= 0) {
      alert('Please enter a valid yield quantity')
      return
    }

    setIsSubmitting(true)
    try {
      const batchData = {
        product_id: formData.product_id,
        yield_qty: parseFloat(formData.yield_qty),
        expiry_date: formData.expiry_date || null,
        batch_code: formData.batch_code || undefined,
        input_collection_ids: selectedCollections,
        qc_status: 'pending',
        production_date: new Date().toISOString()
      }

      console.log('Creating batch:', batchData)

      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create batch')
      }

      await response.json()
      mutate()
      setShowModal(false)
      setSelectedCollections([])
      setFormData({
        product_id: '',
        yield_qty: '',
        expiry_date: '',
        batch_code: ''
      })
      alert('Batch created successfully')
    } catch (err: any) {
      alert(`Error creating batch: ${err.message}`)
      console.error('Batch creation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveBatch = async (batchId: string) => {
    try {
      const response = await fetch(`/api/batches/${batchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qc_status: 'approved' })
      })

      if (!response.ok) throw new Error('Failed to approve batch')
      
      mutate()
      alert('Batch approved successfully')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleRejectBatch = async (batchId: string) => {
    try {
      const response = await fetch(`/api/batches/${batchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qc_status: 'rejected' })
      })

      if (!response.ok) throw new Error('Failed to reject batch')
      
      mutate()
      alert('Batch rejected successfully')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    )
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
            <Button variant="primary" onClick={() => setShowModal(true)}>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.count}</p>
              <p className="text-xs text-gray-500 mt-1">Total batches</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Yield Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.totalYield)} L</p>
              <p className="text-xs text-gray-500 mt-1">Production output</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Pending QC</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingQc}</p>
              <p className="text-xs text-gray-500 mt-1">Requires approval</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">QC Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
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
              <Input 
                type="date" 
                placeholder="Production date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                suppressHydrationWarning
              />
              <Button 
                variant="outline"
                onClick={() => setSelectedDate('')}
              >
                Clear Date
              </Button>
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        Loading batches...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-red-500">
                        Error loading batches
                      </td>
                    </tr>
                  ) : batches && batches.length > 0 ? (
                    batches.map((batch: Batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-medium text-gray-900">
                            {batch.batch_code || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            By {batch.creator?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {batch.product?.name || 'Unknown Product'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {batch.production_date ? formatDate(new Date(batch.production_date)) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {batch.created_at ? formatDateTime(new Date(batch.created_at)) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatNumber(batch.yield_qty, 0)} L
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {batch.input_collection_ids?.slice(0, 3).map((col: string) => (
                              <span key={col} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {col.substring(0, 8)}
                              </span>
                            ))}
                            {batch.input_collection_ids && batch.input_collection_ids.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{batch.input_collection_ids.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {batch.expiry_date ? formatDate(new Date(batch.expiry_date)) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getQcBadge(batch.qc_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            {batch.qc_status === 'pending' && (
                              <>
                                <button 
                                  className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                                  onClick={() => handleApproveBatch(batch.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                                  onClick={() => handleRejectBatch(batch.id)}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No batches found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Create Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <h2 className="text-xl font-semibold text-gray-900">Create Production Batch</h2>
              <p className="text-sm text-gray-600 mt-1">Select approved collections and configure batch details</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Batch Details Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Batch Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.product_id}
                      onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                      disabled={!products}
                    >
                      <option value="">{products ? 'Select a product' : 'Loading products...'}</option>
                      {products?.map((product: Product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Yield (Liters) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter expected yield"
                      value={formData.yield_qty}
                      onChange={(e) => setFormData({ ...formData, yield_qty: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Code (Optional)</label>
                    <Input
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={formData.batch_code}
                      onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <Input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                {/* Input Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Selected Collections</p>
                      <p className="text-lg font-semibold text-blue-900">{selectedCollections.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Input Liters</p>
                      <p className="text-lg font-semibold text-blue-900">{formatNumber(totalInputLiters)} L</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expected Yield</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {formData.yield_qty ? `${formatNumber(parseFloat(formData.yield_qty))} L` : '0.00 L'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Collections Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Select Input Collections (Approved Only)</h3>
                
                {!collections || collections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p>No approved collections available</p>
                    <p className="text-sm">Collections must be approved before creating a batch</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {collections.map((collection: MilkCollection) => (
                      <div
                        key={collection.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedCollections.includes(collection.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => toggleCollection(collection.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedCollections.includes(collection.id)}
                                onChange={() => toggleCollection(collection.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {collection.supplier?.name || 'Unknown Supplier'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {collection.created_at
                                    ? new Date(collection.created_at).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatNumber(parseFloat(collection.qty_liters as any))} L
                            </p>
                            <div className="flex gap-2 mt-1 text-xs">
                              {collection.fat && (
                                <span className="text-gray-600">FAT: {formatNumber(parseFloat(collection.fat as any))}%</span>
                              )}
                              {collection.snf && (
                                <span className="text-gray-600">SNF: {formatNumber(parseFloat(collection.snf as any))}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowModal(false)
                  setSelectedCollections([])
                  setFormData({
                    product_id: '',
                    yield_qty: '',
                    expiry_date: '',
                    batch_code: ''
                  })
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateBatch} 
                disabled={isSubmitting || selectedCollections.length === 0}
              >
                {isSubmitting ? 'Creating...' : `Create Batch (${selectedCollections.length} collections)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
