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
  Download,
  DollarSign,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/lib/utils'

const payments = [
  {
    id: '1',
    fromAccount: 'Sharma Store',
    toAccount: 'Company Cash',
    amount: 4500,
    mode: 'cash',
    reference: 'DEL-001',
    receiptUrl: null,
    createdBy: 'Rajesh Kumar',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    cleared: true
  },
  {
    id: '2',
    fromAccount: 'Gandhi Dairy',
    toAccount: 'Company Bank',
    amount: 8500,
    mode: 'upi',
    reference: 'DEL-002',
    receiptUrl: '/receipt2.pdf',
    createdBy: 'Vijay Singh',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    cleared: true
  },
  {
    id: '3',
    fromAccount: 'Patel Retailers',
    toAccount: 'Company Cash',
    amount: 3200,
    mode: 'cash',
    reference: 'DEL-003',
    receiptUrl: null,
    createdBy: 'Amit Verma',
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
    cleared: false
  },
  {
    id: '4',
    fromAccount: 'Company Bank',
    toAccount: 'Ramesh Kumar (Supplier)',
    amount: 12000,
    mode: 'bank_transfer',
    reference: 'SUP-001',
    receiptUrl: '/receipt4.pdf',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
    cleared: true
  },
  {
    id: '5',
    fromAccount: 'Modern Mart',
    toAccount: 'Company Cash',
    amount: 6800,
    mode: 'upi',
    reference: 'DEL-005',
    receiptUrl: null,
    createdBy: 'Sunil Yadav',
    createdAt: new Date(Date.now() - 1000 * 60 * 150),
    cleared: false
  }
]

export default function PaymentsPage() {
  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case 'cash':
        return <DollarSign className="w-4 h-4" />
      case 'upi':
        return <Smartphone className="w-4 h-4" />
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />
      case 'card':
        return <CreditCard className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments & Ledger</h1>
            <p className="text-gray-600 mt-1">Manage payments and financial transactions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-5 h-5 mr-2" />
              Export
            </Button>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Collections</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">₹45,800</p>
                  <p className="text-xs text-gray-500 mt-1">18 transactions</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cash in Hand</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹1,45,780</p>
                  <p className="text-xs text-gray-500 mt-1">Uncleared: ₹23,500</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Clearance</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">₹10,000</p>
                  <p className="text-xs text-gray-500 mt-1">5 transactions</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹12.5L</p>
                  <p className="text-xs text-green-600 mt-1">↑ 15% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
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
                  placeholder="Search payments..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'All Modes' },
                  { value: 'cash', label: 'Cash' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'card', label: 'Card' }
                ]}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'cleared', label: 'Cleared' },
                  { value: 'pending', label: 'Pending' }
                ]}
              />
              <Input type="date" />
            </div>
          </CardBody>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From → To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
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
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">{formatDateTime(payment.createdAt)}</div>
                        <div className="text-xs text-gray-500">By {payment.createdBy}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{payment.fromAccount}</div>
                          <div className="text-gray-400">→</div>
                          <div className="text-gray-700">{payment.toAccount}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            {getPaymentIcon(payment.mode)}
                          </div>
                          <span className="text-sm capitalize text-gray-700">
                            {payment.mode.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-600">{payment.reference}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.cleared ? (
                          <Badge variant="success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Cleared
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {!payment.cleared && (
                            <Button size="sm" variant="primary">Clear</Button>
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
      </div>
    </AdminLayout>
  )
}
