'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Package, Edit, Trash2 } from 'lucide-react'
import { useProducts } from '@/lib/hooks'
import type { Product } from '@/types/database'
import { mutate } from 'swr'

export default function ProductsPage() {
  const [isClient, setIsClient] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    uom: 'liter',
    shelf_life_days: ''
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: products, error, isLoading } = useProducts()

  // Filter products by search term
  const filteredProducts = products?.filter((product: Product) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower)
    )
  })

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        uom: product.uom || 'liter',
        shelf_life_days: product.shelf_life_days?.toString() || ''
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        sku: '',
        uom: 'liter',
        shelf_life_days: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      sku: '',
      uom: 'liter',
      shelf_life_days: ''
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku) {
      alert('Product name and SKU are required')
      return
    }

    setLoading(true)
    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        uom: formData.uom,
        shelf_life_days: formData.shelf_life_days ? parseInt(formData.shelf_life_days) : null
      }

      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Update failed')
        }
      } else {
        // Create new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Creation failed')
        }
      }

      // Refresh products list
      await mutate('/api/products')
      handleCloseModal()
      alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will affect all related inventory items.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }

      await mutate('/api/products')
      alert('Product deleted successfully!')
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
            <h1 className="text-3xl font-bold text-gray-900">Products / SKU Management</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog and SKUs</p>
          </div>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{products?.length || 0}</p>
                </div>
                <Package className="w-10 h-10 text-blue-600" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Milk Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {products?.filter((p: Product) => p.uom === 'liter').length || 0}
                  </p>
                </div>
                <Package className="w-10 h-10 text-green-600" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Other Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {products?.filter((p: Product) => p.uom !== 'liter').length || 0}
                  </p>
                </div>
                <Package className="w-10 h-10 text-purple-600" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardBody>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardBody>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading products...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">Error loading products</div>
            ) : !filteredProducts || filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? 'No products found matching your search' : 'No products yet. Add your first product!'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit of Measure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shelf Life
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product: Product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 font-mono">{product.sku}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 capitalize">{product.uom || 'liter'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {product.shelf_life_days ? `${product.shelf_life_days} days` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenModal(product)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(product.id)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Full Cream Milk, Toned Milk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., FCM-001, TM-002"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit of Measure
                  </label>
                  <select
                    value={formData.uom}
                    onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="liter">Liter (L)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="piece">Piece</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shelf Life (Days)
                  </label>
                  <Input
                    type="number"
                    value={formData.shelf_life_days}
                    onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value })}
                    placeholder="e.g., 7, 30, 90"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of days the product remains fresh after production
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.sku || loading}
                >
                  {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
