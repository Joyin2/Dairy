'use client'

import { useState, useEffect } from 'react'
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
  Image as ImageIcon,
  FileText,
  X,
  Upload,
  DollarSign,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { formatDateTime, formatCurrency, formatNumber } from '@/lib/utils'
import { useDeliveries, useRoutes } from '@/lib/hooks'
import type { Delivery, DeliveryStatus } from '@/types/database'
import { mutate } from 'swr'

export default function DeliveriesPage() {
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [routeFilter, setRouteFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(false)

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showMarkDeliveredModal, setShowMarkDeliveredModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)

  // Mark delivered form
  const [markDeliveredForm, setMarkDeliveredForm] = useState({
    status: 'delivered' as DeliveryStatus,
    delivered_qty: 0,
    collected_amount: 0,
    payment_mode: 'cash',
    proof_url: '',
    signature_url: ''
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: deliveries, error, isLoading } = useDeliveries({
    routeId: routeFilter || undefined,
    status: statusFilter || undefined
  })

  const { data: routes } = useRoutes()

  // Filter deliveries by search term and date
  const filteredDeliveries = deliveries?.filter((delivery: Delivery) => {
    if (!searchTerm && !dateFilter) return true
    
    const searchLower = searchTerm.toLowerCase()
    const route = delivery.route as any
    const shop = delivery.shop as any
    const agent = route?.agent as any

    const matchesSearch = !searchTerm || (
      shop?.name?.toLowerCase().includes(searchLower) ||
      route?.name?.toLowerCase().includes(searchLower) ||
      agent?.name?.toLowerCase().includes(searchLower)
    )

    const matchesDate = !dateFilter || route?.date === dateFilter

    return matchesSearch && matchesDate
  })

  // Calculate stats
  const stats = {
    total: filteredDeliveries?.length || 0,
    delivered: filteredDeliveries?.filter((d: Delivery) => d.status === 'delivered').length || 0,
    inTransit: filteredDeliveries?.filter((d: Delivery) => d.status === 'in_transit').length || 0,
    pending: filteredDeliveries?.filter((d: Delivery) => d.status === 'pending').length || 0,
    issues: filteredDeliveries?.filter((d: Delivery) => 
      d.status === 'partial' || d.status === 'returned' || d.status === 'failed'
    ).length || 0
  }

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
      case 'failed':
        return <Badge variant="danger">Failed</Badge>
      case 'pending':
        return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const handleOpenDetailModal = async (delivery: Delivery) => {
    // Fetch full delivery details
    try {
      const response = await fetch(`/api/deliveries/${delivery.id}`)
      if (response.ok) {
        const fullDelivery = await response.json()
        setSelectedDelivery(fullDelivery)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('Error fetching delivery details:', error)
      alert('Failed to load delivery details')
    }
  }

  const handleOpenMarkDeliveredModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    setMarkDeliveredForm({
      status: 'delivered',
      delivered_qty: delivery.expected_qty || 0,
      collected_amount: 0,
      payment_mode: 'cash',
      proof_url: '',
      signature_url: ''
    })
    setShowMarkDeliveredModal(true)
  }

  const handleCloseModals = () => {
    setShowDetailModal(false)
    setShowMarkDeliveredModal(false)
    setSelectedDelivery(null)
    setMarkDeliveredForm({
      status: 'delivered',
      delivered_qty: 0,
      collected_amount: 0,
      payment_mode: 'cash',
      proof_url: '',
      signature_url: ''
    })
  }

  const handleMarkDelivered = async () => {
    if (!selectedDelivery) return

    if (!markDeliveredForm.proof_url && markDeliveredForm.status === 'delivered') {
      alert('Please upload proof of delivery')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/deliveries/${selectedDelivery.id}/mark-delivered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markDeliveredForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark delivered')
      }

      await mutate('/api/deliveries')
      handleCloseModals()
      alert('Delivery updated successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (deliveryId: string) => {
    if (!confirm('Are you sure you want to delete this delivery?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      await mutate('/api/deliveries')
      alert('Delivery deleted successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Simulate file upload (in production, upload to S3/cloud storage)
  const handleFileUpload = (field: 'proof_url' | 'signature_url') => {
    // In production, this would upload to S3 and return the URL
    const mockUrl = `/uploads/${field}_${Date.now()}.jpg`
    setMarkDeliveredForm({ ...markDeliveredForm, [field]: mockUrl })
  }

  if (!isClient) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deliveries Management</h1>
            <p className="text-gray-600 mt-1">Track and manage delivery operations with proof and payments</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <FileText className="w-5 h-5 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inTransit}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.issues}</p>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Routes</option>
                {routes?.map((route: any) => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="in_transit">In Transit</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="returned">Returned</option>
                <option value="failed">Failed</option>
              </select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Deliveries Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              All Deliveries {isLoading && <span className="text-sm text-gray-500">(Loading...)</span>}
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                Error loading deliveries: {error.message}
              </div>
            )}
            {!isLoading && filteredDeliveries && filteredDeliveries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No deliveries found</p>
                <p className="text-sm mt-2">Deliveries will appear here once routes are created</p>
              </div>
            )}
            {filteredDeliveries && filteredDeliveries.length > 0 && (
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
                    {filteredDeliveries.map((delivery: Delivery) => {
                      const route = delivery.route as any
                      const shop = delivery.shop as any
                      const agent = route?.agent as any
                      const items = (delivery.items as any) || []

                      return (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{route?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Truck className="w-3 h-3" />
                                {agent?.name || 'No Agent'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{shop?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {shop?.address || 'No address'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs space-y-1">
                              {items.length > 0 ? items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <Package className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-900">{item.product || item.product_id}</span>
                                  <span className="text-gray-500">({item.qty})</span>
                                </div>
                              )) : (
                                <span className="text-gray-400">No items</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs">
                              <div className="text-gray-900">
                                {delivery.delivered_qty !== null && delivery.delivered_qty !== undefined ? (
                                  <span className={delivery.delivered_qty < (delivery.expected_qty || 0) ? 'text-orange-600' : 'text-green-600'}>
                                    {formatNumber(delivery.delivered_qty)}/{formatNumber(delivery.expected_qty || 0)}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">{formatNumber(delivery.expected_qty || 0)} expected</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs">
                              {delivery.collected_amount !== null && delivery.collected_amount !== undefined ? (
                                <>
                                  <div className="text-gray-900 font-medium">{formatCurrency(delivery.collected_amount)}</div>
                                  <div className="text-gray-500">{delivery.payment_mode || '-'}</div>
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {getStatusBadge(delivery.status || 'pending')}
                              {delivery.delivered_at && (
                                <div className="text-xs text-gray-500">
                                  {formatDateTime(delivery.delivered_at)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenDetailModal(delivery)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {delivery.status === 'pending' || delivery.status === 'in_transit' ? (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleOpenMarkDeliveredModal(delivery)}
                                >
                                  Mark Delivered
                                </Button>
                              ) : null}
                              {delivery.proof_url && (
                                <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(delivery.id)}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Delivery Details</h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedDelivery.status || 'pending')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Delivered At</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedDelivery.delivered_at ? formatDateTime(selectedDelivery.delivered_at) : 'Not delivered yet'}
                  </div>
                </div>
              </div>

              {/* Route and Shop Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Route</label>
                  <div className="mt-1 text-sm text-gray-900">{(selectedDelivery.route as any)?.name || 'N/A'}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Agent: {(selectedDelivery.route as any)?.agent?.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Shop</label>
                  <div className="mt-1 text-sm text-gray-900">{(selectedDelivery.shop as any)?.name || 'N/A'}</div>
                  <div className="mt-1 text-xs text-gray-500">{(selectedDelivery.shop as any)?.address || ''}</div>
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="text-sm font-medium text-gray-700">Items</label>
                <div className="mt-2 space-y-2">
                  {((selectedDelivery.items as any) || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{item.product || item.product_id}</span>
                      </div>
                      <span className="text-sm text-gray-600">Qty: {item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantities */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Expected Quantity</label>
                  <div className="mt-1 text-sm text-gray-900">{formatNumber(selectedDelivery.expected_qty || 0)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Delivered Quantity</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedDelivery.delivered_qty !== null && selectedDelivery.delivered_qty !== undefined
                      ? formatNumber(selectedDelivery.delivered_qty)
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Collected Amount</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedDelivery.collected_amount !== null && selectedDelivery.collected_amount !== undefined
                      ? formatCurrency(selectedDelivery.collected_amount)
                      : '-'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Mode</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedDelivery.payment_mode || '-'}</div>
                </div>
              </div>

              {/* Proof and Signature */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Proof Photo</label>
                  {selectedDelivery.proof_url ? (
                    <div className="mt-2 border border-gray-200 rounded-lg p-2">
                      <img
                        src={selectedDelivery.proof_url}
                        alt="Proof of delivery"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-400">No proof uploaded</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Signature</label>
                  {selectedDelivery.signature_url ? (
                    <div className="mt-2 border border-gray-200 rounded-lg p-2">
                      <img
                        src={selectedDelivery.signature_url}
                        alt="Signature"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-400">No signature uploaded</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Delivered Modal */}
      {showMarkDeliveredModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Mark Delivery</h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Shop Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium text-gray-900">{(selectedDelivery.shop as any)?.name}</div>
                <div className="text-sm text-gray-600 mt-1">{(selectedDelivery.shop as any)?.address}</div>
                <div className="text-sm text-gray-500 mt-1">Expected: {formatNumber(selectedDelivery.expected_qty || 0)}</div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={markDeliveredForm.status}
                  onChange={(e) => setMarkDeliveredForm({ ...markDeliveredForm, status: e.target.value as DeliveryStatus })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="delivered">Delivered</option>
                  <option value="partial">Partial Delivery</option>
                  <option value="returned">Returned</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Delivered Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivered Quantity *</label>
                <Input
                  type="number"
                  value={markDeliveredForm.delivered_qty}
                  onChange={(e) => setMarkDeliveredForm({ ...markDeliveredForm, delivered_qty: Number(e.target.value) })}
                  placeholder="Enter delivered quantity"
                />
              </div>

              {/* Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collected Amount</label>
                  <Input
                    type="number"
                    value={markDeliveredForm.collected_amount}
                    onChange={(e) => setMarkDeliveredForm({ ...markDeliveredForm, collected_amount: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={markDeliveredForm.payment_mode}
                    onChange={(e) => setMarkDeliveredForm({ ...markDeliveredForm, payment_mode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Proof Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proof Photo * {markDeliveredForm.status === 'delivered' && <span className="text-red-500">(Required)</span>}
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleFileUpload('proof_url')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Proof
                  </Button>
                  {markDeliveredForm.proof_url && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Uploaded
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload photo of delivered goods</p>
              </div>

              {/* Signature Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature (Optional)</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleFileUpload('signature_url')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Signature
                  </Button>
                  {markDeliveredForm.signature_url && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Uploaded
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload customer signature or digital signature</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseModals}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleMarkDelivered}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Confirm & Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
