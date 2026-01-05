'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Package, AlertTriangle, TrendingDown, ArrowRightLeft, Edit } from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'
import { useInventory, useProducts } from '@/lib/hooks'
import type { InventoryItem, Product } from '@/types/database'
import { mutate } from 'swr'

export default function InventoryPage() {
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  
  // Modals
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  
  // Adjustment form
  const [adjustmentQty, setAdjustmentQty] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')
  
  // Transfer form
  const [transferQty, setTransferQty] = useState('')
  const [transferLocation, setTransferLocation] = useState('')
  const [transferReason, setTransferReason] = useState('')
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: inventory, error, isLoading } = useInventory({
    productId: productFilter || undefined,
    locationId: locationFilter || undefined
  })
  
  const { data: products } = useProducts()

  // Filter by search term (client-side)
  const filteredInventory = inventory?.filter((item: InventoryItem) => {
    if (!searchTerm) return true
    const product = item.product as any
    const batch = item.batch as any
    const searchLower = searchTerm.toLowerCase()
    return (
      product?.name?.toLowerCase().includes(searchLower) ||
      product?.sku?.toLowerCase().includes(searchLower) ||
      batch?.batch_code?.toLowerCase().includes(searchLower)
    )
  })

  // Calculate stats
  const stats = {
    totalProducts: filteredInventory?.length || 0,
    totalValue: 0, // Would need product pricing
    lowStockItems: filteredInventory?.filter((item: InventoryItem) => {
      const qty = parseFloat(item.qty as any)
      const threshold = 50 // Default threshold
      return qty < threshold
    }).length || 0,
    expiringSoon: filteredInventory?.filter((item: InventoryItem) => {
      const batch = item.batch as any
      if (!batch?.expiry_date) return false
      const daysToExpiry = Math.ceil((new Date(batch.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysToExpiry <= 7 && daysToExpiry > 0
    }).length || 0
  }

  const getStockStatus = (item: InventoryItem) => {
    const qty = parseFloat(item.qty as any)
    const threshold = 50 // Default threshold - could be per product
    
    if (qty < threshold * 0.5) {
      return <Badge variant="danger">Critical</Badge>
    } else if (qty < threshold) {
      return <Badge variant="warning">Low Stock</Badge>
    }
    return <Badge variant="success">In Stock</Badge>
  }

  const handleAdjustStock = async () => {
    if (!selectedItem || !adjustmentQty) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory_id: selectedItem.id,
          adjustment_qty: parseFloat(adjustmentQty),
          reason: adjustmentReason,
          adjusted_by: 'admin' // Would use actual user ID
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Adjustment failed')
      }

      // Refresh data
      await mutate('/api/inventory')
      
      // Reset form
      setShowAdjustModal(false)
      setSelectedItem(null)
      setAdjustmentQty('')
      setAdjustmentReason('')
      alert('Stock adjusted successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTransferStock = async () => {
    if (!selectedItem || !transferQty || !transferLocation) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_inventory_id: selectedItem.id,
          to_location_id: transferLocation,
          transfer_qty: parseFloat(transferQty),
          reason: transferReason,
          transferred_by: 'admin'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Transfer failed')
      }

      // Refresh data
      await mutate('/api/inventory')
      
      // Reset form
      setShowTransferModal(false)
      setSelectedItem(null)
      setTransferQty('')
      setTransferLocation('')
      setTransferReason('')
      alert('Stock transferred successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) return null

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
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/admin/products'}
            >
              <Package className="w-5 h-5 mr-2" />
              Manage Products
            </Button>
            <Button 
              variant="primary"
              onClick={() => window.location.href = '/admin/batches'}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Batch
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹{formatNumber(stats.totalValue / 100000, 1)}L</p>
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
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.lowStockItems}</p>
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
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.expiringSoon}</p>
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
                  placeholder="Search products, SKU, or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                {products?.map((product: Product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <Input 
                type="text" 
                placeholder="Filter by location" 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Stock Overview</h2>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading inventory...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">Error loading inventory</div>
            ) : !filteredInventory || filteredInventory.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">No inventory items found</p>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  Inventory is created automatically when you create batches.
                  {searchTerm || productFilter ? ' Try clearing your filters.' : ''}
                </p>
                {!searchTerm && !productFilter && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="primary" 
                      onClick={() => window.location.href = '/admin/products'}
                    >
                      Go to Products
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/admin/batches'}
                    >
                      Go to Batches
                    </Button>
                  </div>
                )}
              </div>
            ) : (
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
                    {filteredInventory.map((item: InventoryItem) => {
                      const product = item.product as any
                      const batch = item.batch as any
                      const expiryDate = batch?.expiry_date ? new Date(batch.expiry_date) : null
                      const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">SKU: {product?.sku || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-600 font-mono">{batch?.batch_code || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{item.location_id || 'Main Warehouse'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatNumber(parseFloat(item.qty as any), 0)} {item.uom || product?.uom || 'L'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStockStatus(item)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {expiryDate ? (
                              <>
                                <div className="text-sm text-gray-900">{formatDate(expiryDate)}</div>
                                <div className={`text-xs ${
                                  daysToExpiry && daysToExpiry < 7 ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  {daysToExpiry !== null ? `${daysToExpiry} days left` : ''}
                                </div>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">No expiry</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setShowAdjustModal(true)
                                }}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Adjust
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setShowTransferModal(true)
                                }}
                              >
                                <ArrowRightLeft className="w-4 h-4 mr-1" />
                                Transfer
                              </Button>
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

        {/* Stock Adjustment Modal */}
        {showAdjustModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Stock Adjustment</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {(selectedItem.product as any)?.name} - Current: {formatNumber(parseFloat(selectedItem.qty as any))} {selectedItem.uom}
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Quantity (+ to add, - to remove)
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(e.target.value)}
                    placeholder="e.g., +10 or -5"
                  />
                  {adjustmentQty && (
                    <p className="text-sm text-gray-600 mt-1">
                      New quantity: {formatNumber(parseFloat(selectedItem.qty as any) + parseFloat(adjustmentQty || '0'))} {selectedItem.uom}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Adjustment
                  </label>
                  <select
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select reason...</option>
                    <option value="damaged">Damaged goods</option>
                    <option value="expired">Expired</option>
                    <option value="recount">Stock recount</option>
                    <option value="return">Customer return</option>
                    <option value="quality_issue">Quality issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAdjustModal(false)
                    setSelectedItem(null)
                    setAdjustmentQty('')
                    setAdjustmentReason('')
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleAdjustStock}
                  disabled={!adjustmentQty || !adjustmentReason || loading}
                >
                  {loading ? 'Adjusting...' : 'Confirm Adjustment'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stock Transfer Modal */}
        {showTransferModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Stock Transfer</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {(selectedItem.product as any)?.name} - Available: {formatNumber(parseFloat(selectedItem.qty as any))} {selectedItem.uom}
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transfer Quantity
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    max={selectedItem.qty}
                    value={transferQty}
                    onChange={(e) => setTransferQty(e.target.value)}
                    placeholder="Enter quantity to transfer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Location
                  </label>
                  <select
                    value={transferLocation}
                    onChange={(e) => setTransferLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select location...</option>
                    <option value="warehouse-1">Main Warehouse</option>
                    <option value="warehouse-2">Cold Storage</option>
                    <option value="warehouse-3">Distribution Center</option>
                    <option value="shop-1">Retail Shop 1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transfer Reason (Optional)
                  </label>
                  <Input
                    type="text"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="e.g., Replenishment, Consolidation"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowTransferModal(false)
                    setSelectedItem(null)
                    setTransferQty('')
                    setTransferLocation('')
                    setTransferReason('')
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleTransferStock}
                  disabled={!transferQty || !transferLocation || loading || parseFloat(transferQty || '0') > parseFloat(selectedItem.qty as any)}
                >
                  {loading ? 'Transferring...' : 'Confirm Transfer'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
