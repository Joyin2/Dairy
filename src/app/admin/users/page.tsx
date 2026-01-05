'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Edit, Trash2, UserPlus, Mail, Phone, CheckCircle, XCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useUsers } from '@/lib/hooks'
import type { AppUser } from '@/types/database'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'manufacturer', status: 'active' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { data: users, error, isLoading, mutate } = useUsers()
  const handleApproveUser = async (userId: string) => {
    if (!confirm('Approve this user?')) return
    
    try {
      console.log('Approving user:', userId)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve user')
      }
      
      mutate()
      alert('User approved successfully')
    } catch (err: any) {
      console.error('Approve user error:', err)
      alert(`Error approving user: ${err.message}`)
    }
  }

  const handleRejectUser = async (userId: string) => {
    if (!confirm('Reject this user? This will set their status to inactive.')) return
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' })
      })

      if (!response.ok) throw new Error('Failed to reject user')
      
      mutate()
      alert('User rejected')
    } catch (err) {
      alert('Error rejecting user')
      console.error(err)
    }
  }

  const handleAddUser = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create user')
      
      mutate()
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', role: 'manufacturer', status: 'active' })
      alert('User created successfully')
    } catch (err) {
      alert('Error creating user')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }


  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u: AppUser) => u.role === 'company_admin').length || 0,
    manufacturers: users?.filter((u: AppUser) => u.role === 'manufacturer').length || 0,
    agents: users?.filter((u: AppUser) => u.role === 'delivery_agent').length || 0,
    pending: users?.filter((u: AppUser) => u.status === 'pending').length || 0
  }

  // Filter users
  const filteredUsers = users?.filter((user: AppUser) => {
    const matchSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchRole = filterRole === 'all' || user.role === filterRole
    const matchStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchSearch && matchRole && matchStatus
  }) || []

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { variant: any; label: string }> = {
      company_admin: { variant: 'danger', label: 'Admin' },
      manufacturer: { variant: 'info', label: 'Manufacturer' },
      delivery_agent: { variant: 'success', label: 'Delivery Agent' }
    }
    const config = roleMap[role] || { variant: 'default', label: role }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users & Roles</h1>
            <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <UserPlus className="w-5 h-5 mr-2" />
              Bulk Import
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.admins}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Manufacturers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.manufacturers}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Delivery Agents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.agents}</p>
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
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'company_admin', label: 'Admin' },
                  { value: 'manufacturer', label: 'Manufacturer' },
                  { value: 'delivery_agent', label: 'Delivery Agent' }
                ]}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending Approval' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
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
                        Loading users...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                        Error loading users
                      </td>
                    </tr>
                  ) : filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user: AppUser) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {user.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role || 'manufacturer')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={
                            user.status === 'active' ? 'success' : 
                            user.status === 'pending' ? 'warning' : 
                            'default'
                          }>
                            {user.status || 'unknown'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {user.last_login ? formatDateTime(new Date(user.last_login)) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {user.status === 'pending' ? (
                              <>
                                <button 
                                  onClick={() => handleApproveUser(user.id)}
                                  className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded flex items-center gap-1"
                                  title="Approve User"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs">Approve</span>
                                </button>
                                <button 
                                  onClick={() => handleRejectUser(user.id)}
                                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded flex items-center gap-1"
                                  title="Reject User"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-xs">Reject</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select
                  options={[
                    { value: 'company_admin', label: 'Admin' },
                    { value: 'manufacturer', label: 'Manufacturer' },
                    { value: 'delivery_agent', label: 'Delivery Agent' }
                  ]}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddUser} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}