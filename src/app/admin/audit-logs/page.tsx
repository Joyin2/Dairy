'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Search, Download, Eye, FileText, User, AlertCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const auditLogs = [
  {
    id: '1',
    userId: 'admin-001',
    userName: 'Admin User',
    actionType: 'UPDATE_milk_collections',
    entityType: 'milk_collections',
    entityId: 'COL-001',
    meta: {
      action: 'QC Approved',
      previousStatus: 'pending',
      newStatus: 'approved'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    severity: 'info'
  },
  {
    id: '2',
    userId: 'manu-002',
    userName: 'Priya Sharma',
    actionType: 'INSERT_batches',
    entityType: 'batches',
    entityId: 'BATCH-001',
    meta: {
      action: 'Created new batch',
      product: 'Full Cream Milk',
      yield: 850
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    severity: 'info'
  },
  {
    id: '3',
    userId: 'admin-001',
    userName: 'Admin User',
    actionType: 'DELETE_users',
    entityType: 'users',
    entityId: 'USER-015',
    meta: {
      action: 'Deleted user account',
      reason: 'Inactive for 6 months'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    severity: 'warning'
  },
  {
    id: '4',
    userId: 'agent-003',
    userName: 'Amit Verma',
    actionType: 'UPDATE_deliveries',
    entityType: 'deliveries',
    entityId: 'DEL-003',
    meta: {
      action: 'Marked as delivered',
      status: 'delivered',
      amount: 3200
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    severity: 'info'
  },
  {
    id: '5',
    userId: 'system',
    userName: 'System',
    actionType: 'FAILED_LOGIN',
    entityType: 'auth',
    entityId: 'unknown',
    meta: {
      action: 'Failed login attempt',
      ip: '192.168.1.100',
      attempts: 3
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    severity: 'critical'
  }
]

export default function AuditLogsPage() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="danger">Critical</Badge>
      case 'warning':
        return <Badge variant="warning">Warning</Badge>
      case 'info':
        return <Badge variant="info">Info</Badge>
      default:
        return <Badge variant="default">{severity}</Badge>
    }
  }

  const getActionColor = (actionType: string) => {
    if (actionType.startsWith('DELETE')) return 'text-red-600'
    if (actionType.startsWith('INSERT') || actionType.startsWith('CREATE')) return 'text-green-600'
    if (actionType.startsWith('UPDATE')) return 'text-blue-600'
    return 'text-gray-600'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Track all system activities and changes</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-5 h-5 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Events Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1,248</p>
              <p className="text-xs text-gray-500 mt-1">Last hour: 85</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Critical Events</p>
              <p className="text-2xl font-bold text-red-600 mt-1">3</p>
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">28</p>
              <p className="text-xs text-green-600 mt-1">Currently online</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Failed Logins</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">5</p>
              <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
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
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'All Actions' },
                  { value: 'insert', label: 'Create' },
                  { value: 'update', label: 'Update' },
                  { value: 'delete', label: 'Delete' }
                ]}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Severity' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'info', label: 'Info' }
                ]}
              />
              <Input type="date" />
            </div>
          </CardBody>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">{formatDateTime(log.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                            <div className="text-xs text-gray-500">{log.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getActionColor(log.actionType)}`}>
                          {log.actionType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.entityType}</div>
                        <div className="text-xs text-gray-500 font-mono">{log.entityId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {log.meta.action}
                          {log.meta.previousStatus && (
                            <div className="text-xs text-gray-500 mt-1">
                              {log.meta.previousStatus} → {log.meta.newStatus}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Recent Critical Events */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-red-900">Recent Critical Events</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {auditLogs
                .filter((log) => log.severity === 'critical')
                .map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-red-900">{log.meta.action}</p>
                        <span className="text-xs text-red-700">{formatDateTime(log.timestamp)}</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">
                        User: {log.userName} | Entity: {log.entityType} ({log.entityId})
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}
