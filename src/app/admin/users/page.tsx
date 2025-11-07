'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Edit, Trash2, UserPlus, Mail, Phone } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const users = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@dairy.com',
    phone: '+91 98765 43210',
    role: 'company_admin',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@dairy.com',
    phone: '+91 98765 43211',
    role: 'manufacturer',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 45),
    createdAt: new Date('2024-02-10')
  },
  {
    id: '3',
    name: 'Amit Verma',
    email: 'amit@dairy.com',
    phone: '+91 98765 43212',
    role: 'delivery_agent',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 120),
    createdAt: new Date('2024-03-05')
  },
  {
    id: '4',
    name: 'Sunita Patel',
    email: 'sunita@dairy.com',
    phone: '+91 98765 43213',
    role: 'manufacturer',
    status: 'inactive',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    createdAt: new Date('2024-01-20')
  }
]

export default function UsersPage() {
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
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">48</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Manufacturers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">28</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Delivery Agents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">15</p>
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
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'company_admin', label: 'Admin' },
                  { value: 'manufacturer', label: 'Manufacturer' },
                  { value: 'delivery_agent', label: 'Delivery Agent' }
                ]}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {user.name.charAt(0)}
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
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {formatDateTime(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
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
