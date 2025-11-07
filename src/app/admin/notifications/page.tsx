'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Search, 
  Send,
  Mail,
  Smartphone,
  Bell,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const notifications = [
  {
    id: '1',
    to: 'ramesh@example.com',
    channel: 'email',
    status: 'sent',
    message: 'Your milk collection receipt for 45.5L has been generated.',
    sentAt: new Date(Date.now() - 1000 * 60 * 15),
    metadata: { supplier: 'Ramesh Kumar', amount: '45.5L' }
  },
  {
    id: '2',
    to: '+91 98765 43211',
    channel: 'sms',
    status: 'sent',
    message: 'Delivery scheduled for tomorrow. Route: North Zone',
    sentAt: new Date(Date.now() - 1000 * 60 * 30),
    metadata: { shop: 'Gandhi Dairy' }
  },
  {
    id: '3',
    to: 'suresh@example.com',
    channel: 'email',
    status: 'pending',
    message: 'Your KYC verification is pending approval.',
    sentAt: null,
    metadata: { supplier: 'Suresh Patel' }
  },
  {
    id: '4',
    to: '+91 98765 43212',
    channel: 'sms',
    status: 'failed',
    message: 'Payment of ₹3,200 received. Thank you!',
    sentAt: new Date(Date.now() - 1000 * 60 * 45),
    metadata: { shop: 'Patel Retailers' }
  },
  {
    id: '5',
    to: 'admin@dairy.com',
    channel: 'push',
    status: 'sent',
    message: 'Low stock alert: Toned Milk below threshold (120L/150L)',
    sentAt: new Date(Date.now() - 1000 * 60 * 60),
    metadata: { product: 'Toned Milk', current: 120, threshold: 150 }
  }
]

export default function NotificationsPage() {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'sms':
        return <Smartphone className="w-4 h-4" />
      case 'push':
        return <Bell className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="warning">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="danger">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Manage and send notifications to users</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Bell className="w-5 h-5 mr-2" />
              Templates
            </Button>
            <Button variant="primary">
              <Send className="w-5 h-5 mr-2" />
              Send Notification
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">248</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">145</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">SMS</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">89</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">3</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
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
                  placeholder="Search notifications..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'All Channels' },
                  { value: 'email', label: 'Email' },
                  { value: 'sms', label: 'SMS' },
                  { value: 'push', label: 'Push' }
                ]}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'sent', label: 'Sent' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'failed', label: 'Failed' }
                ]}
              />
              <Input type="date" />
            </div>
          </CardBody>
        </Card>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Notification History</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
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
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{notification.to}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            {getChannelIcon(notification.channel)}
                          </div>
                          <span className="text-sm capitalize text-gray-700">{notification.channel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">{notification.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          {notification.sentAt ? formatDateTime(notification.sentAt) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(notification.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {notification.status === 'failed' && (
                            <Button size="sm" variant="primary">Retry</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Quick Send Templates */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Quick Send Templates</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Button variant="outline" className="justify-start">
                <Mail className="w-5 h-5 mr-2" />
                Collection Receipt
              </Button>
              <Button variant="outline" className="justify-start">
                <Smartphone className="w-5 h-5 mr-2" />
                Delivery Notification
              </Button>
              <Button variant="outline" className="justify-start">
                <Bell className="w-5 h-5 mr-2" />
                Payment Reminder
              </Button>
              <Button variant="outline" className="justify-start">
                <Mail className="w-5 h-5 mr-2" />
                KYC Approval
              </Button>
              <Button variant="outline" className="justify-start">
                <Smartphone className="w-5 h-5 mr-2" />
                Low Stock Alert
              </Button>
              <Button variant="outline" className="justify-start">
                <Bell className="w-5 h-5 mr-2" />
                Route Assignment
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}
