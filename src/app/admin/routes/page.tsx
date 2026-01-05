'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, MapPin, Calendar, Users, CheckCircle, Edit, Trash2, X, Package } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { useRoutes, useShops, useUsers } from '@/lib/hooks'
import type { Route, Shop, AppUser } from '@/types/database'
import { mutate } from 'swr'

export default function RoutesPage() {
  const [isClient, setIsClient] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    agent_id: '',
    date: ''
  })

  // Stop management
  const [selectedShops, setSelectedShops] = useState<string[]>([])
  const [shopQuantities, setShopQuantities] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: routes, error, isLoading } = useRoutes({
    agentId: agentFilter || undefined,
    date: dateFilter || undefined
  })
  
  const { data: shops } = useShops()
  const { data: users } = useUsers()

  // Get delivery agents only
  const deliveryAgents = users?.filter((u: AppUser) => u.role === 'delivery_agent')

  // Filter routes by search term
  const filteredRoutes = routes?.filter((route: Route) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const agent = route.agent as any
    return (
      route.name?.toLowerCase().includes(searchLower) ||
      agent?.name?.toLowerCase().includes(searchLower)
    )
  })

  // Calculate stats
  const stats = {
    total: filteredRoutes?.length || 0,
    today: filteredRoutes?.filter((r: Route) => {
      const today = new Date().toISOString().split('T')[0]
      return r.date === today
    }).length || 0,
    scheduled: filteredRoutes?.filter((r: Route) => {
      const routeStops = (r.stops as any) || []
      const completed = routeStops.filter((s: any) => s.status === 'delivered').length
      return completed === 0 && routeStops.length > 0
    }).length || 0,
    agents: deliveryAgents?.length || 0
  }

  const handleOpenModal = (route?: Route) => {
    if (route) {
      setEditingRoute(route)
      
      // Format date properly for HTML date input (YYYY-MM-DD)
      let formattedDate = ''
      if (route.date) {
        // Handle both Date objects and string dates
        const dateObj = typeof route.date === 'string' ? new Date(route.date) : route.date
        formattedDate = dateObj.toISOString().split('T')[0]
      }
      
      setFormData({
        name: route.name || '',
        agent_id: route.agent_id || '',
        date: formattedDate
      })
      
      // Parse stops
      const routeStops = (route.stops as any) || []
      const shopIds = routeStops.map((s: any) => s.shop_id)
      const quantities: { [key: string]: number } = {}
      routeStops.forEach((s: any) => {
        quantities[s.shop_id] = s.expected_qty || 0
      })
      
      setSelectedShops(shopIds)
      setShopQuantities(quantities)
    } else {
      setEditingRoute(null)
      setFormData({
        name: '',
        agent_id: '',
        date: new Date().toISOString().split('T')[0]
      })
      setSelectedShops([])
      setShopQuantities({})
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRoute(null)
    setFormData({ name: '', agent_id: '', date: '' })
    setSelectedShops([])
    setShopQuantities({})
  }

  const toggleShop = (shopId: string) => {
    if (selectedShops.includes(shopId)) {
      setSelectedShops(selectedShops.filter(id => id !== shopId))
      const newQuantities = { ...shopQuantities }
      delete newQuantities[shopId]
      setShopQuantities(newQuantities)
    } else {
      setSelectedShops([...selectedShops, shopId])
      setShopQuantities({ ...shopQuantities, [shopId]: 100 })
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.agent_id || !formData.date || selectedShops.length === 0) {
      alert('Please fill all fields and select at least one shop')
      return
    }

    setLoading(true)
    try {
      const stops = selectedShops.map((shopId, index) => ({
        shop_id: shopId,
        expected_qty: shopQuantities[shopId] || 0,
        seq: index + 1,
        status: 'pending'
      }))

      const routeData = {
        name: formData.name,
        agent_id: formData.agent_id,
        date: formData.date,
        stops: JSON.stringify(stops)
      }

      if (editingRoute) {
        const response = await fetch(`/api/routes/${editingRoute.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(routeData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Update failed')
        }
      } else {
        const response = await fetch('/api/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(routeData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Creation failed')
        }
      }

      await mutate('/api/routes')
      handleCloseModal()
      alert(editingRoute ? 'Route updated successfully!' : 'Route created successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/routes/${routeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }

      await mutate('/api/routes')
      alert('Route deleted successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getRouteProgress = (route: Route) => {
    const routeStops = (route.stops as any) || []
    if (routeStops.length === 0) return { completed: 0, total: 0, percentage: 0 }
    
    const completed = routeStops.filter((s: any) => s.status === 'delivered').length
    return {
      completed,
      total: routeStops.length,
      percentage: Math.round((completed / routeStops.length) * 100)
    }
  }

  if (!isClient) return null

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Routes Management</h1>
            <p className="text-gray-600 mt-1">Plan and manage delivery routes & assign agents</p>
          </div>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 mr-2" />
            Create Route
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Routes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Routes</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.today}</p>
                </div>
                <Calendar className="w-10 h-10 text-green-600" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.scheduled}</p>
                </div>
                <Package className="w-10 h-10 text-orange-600" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivery Agents</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.agents}</p>
                </div>
                <Users className="w-10 h-10 text-purple-600" />
              </div>
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
                  placeholder="Search routes or agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Agents</option>
                {deliveryAgents?.map((agent: AppUser) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setDateFilter('')
                  setAgentFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Routes Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">All Routes</h2>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading routes...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">Error loading routes</div>
            ) : !filteredRoutes || filteredRoutes.length === 0 ? (
              <div className="p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">No routes found</p>
                <p className="text-gray-400 text-sm mb-6">
                  {searchTerm || dateFilter || agentFilter
                    ? 'Try adjusting your filters or search term'
                    : 'Create your first delivery route to get started'}
                </p>
                {!searchTerm && !dateFilter && !agentFilter && (
                  <Button variant="primary" onClick={() => handleOpenModal()}>
                    <Plus className="w-5 h-5 mr-2" />
                    Create First Route
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stops
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRoutes.map((route: Route) => {
                      const agent = route.agent as any
                      const progress = getRouteProgress(route)
                      const routeStops = (route.stops as any) || []
                      
                      return (
                        <tr key={route.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{route.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{agent?.name || 'Unassigned'}</div>
                            <div className="text-xs text-gray-500">{agent?.phone || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {route.date ? formatDate(new Date(route.date)) : 'Not set'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {routeStops.length} stops
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${progress.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">
                                {progress.completed}/{progress.total}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenModal(route)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(route.id)}
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
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

        {/* Create/Edit Route Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingRoute ? 'Edit Route' : 'Create New Route'}
                  </h2>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Route Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., North Zone Route A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Agent <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.agent_id}
                      onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select agent...</option>
                      {deliveryAgents?.map((agent: AppUser) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} - {agent.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Selected Shops</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedShops.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Expected Quantity</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatNumber(Object.values(shopQuantities).reduce((sum, qty) => sum + qty, 0))} L
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shop Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Shops & Quantities <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {!shops || shops.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No shops available. Please add shops first.
                      </div>
                    ) : (
                      shops.map((shop: Shop) => {
                        const isSelected = selectedShops.includes(shop.id)
                        return (
                          <div
                            key={shop.id}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                              isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                            onClick={() => toggleShop(shop.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleShop(shop.id)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{shop.name}</p>
                                  <p className="text-sm text-gray-500">{shop.address || 'No address'}</p>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    type="number"
                                    value={shopQuantities[shop.id] || 0}
                                    onChange={(e) =>
                                      setShopQuantities({
                                        ...shopQuantities,
                                        [shop.id]: parseFloat(e.target.value) || 0
                                      })
                                    }
                                    placeholder="Qty (L)"
                                    className="w-24"
                                  />
                                  <span className="text-sm text-gray-600">L</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseModal} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={
                    !formData.name ||
                    !formData.agent_id ||
                    !formData.date ||
                    selectedShops.length === 0 ||
                    loading
                  }
                >
                  {loading ? 'Saving...' : editingRoute ? 'Update Route' : 'Create Route'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
