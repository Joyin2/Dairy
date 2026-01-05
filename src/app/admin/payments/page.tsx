'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
  Clock,
  Eye,
  RefreshCw,
  Trash2,
  X,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { useLedgerEntries } from '@/lib/hooks'
import type { LedgerEntry } from '@/types/database'
import { mutate } from 'swr'

export default function PaymentsPage() {
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [modeFilter, setModeFilter] = useState('')
  const [clearedFilter, setClearedFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(false)

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showReconciliationModal, setShowReconciliationModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null)
  const [reconciliationData, setReconciliationData] = useState<any>(null)

  // Record payment form
  const [paymentForm, setPaymentForm] = useState({
    from_account: '',
    to_account: '',
    amount: 0,
    mode: 'cash',
    reference: '',
    receipt_url: '',
    cleared: false
  })

  // Refund form
  const [refundForm, setRefundForm] = useState({
    amount: 0,
    receipt_url: ''
  })

  // Selected transactions for bulk clearing
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: entries, error, isLoading } = useLedgerEntries({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined
  })

  // Filter entries
  const filteredEntries = entries?.filter((entry: LedgerEntry) => {
    if (!searchTerm && !modeFilter && clearedFilter === '') return true

    const searchLower = searchTerm.toLowerCase()
    const creator = entry.creator as any

    const matchesSearch = !searchTerm || (
      entry.from_account?.toLowerCase().includes(searchLower) ||
      entry.to_account?.toLowerCase().includes(searchLower) ||
      entry.reference?.toLowerCase().includes(searchLower) ||
      creator?.name?.toLowerCase().includes(searchLower)
    )

    const matchesMode = !modeFilter || entry.mode === modeFilter
    const matchesCleared = clearedFilter === '' || (
      clearedFilter === 'true' ? entry.cleared === true : entry.cleared === false
    )

    return matchesSearch && matchesMode && matchesCleared
  })

  // Calculate stats
  const stats = {
    todayCollections: filteredEntries?.filter((e: LedgerEntry) => {
      const today = new Date().toISOString().split('T')[0]
      const entryDate = e.created_at ? new Date(e.created_at).toISOString().split('T')[0] : ''
      return entryDate === today && (e.to_account?.toLowerCase().includes('company') || e.to_account?.toLowerCase().includes('cash'))
    }).reduce((sum: number, e: LedgerEntry) => sum + (e.amount || 0), 0) || 0,
    
    cashInHand: filteredEntries?.filter((e: LedgerEntry) => 
      e.to_account?.toLowerCase().includes('cash') || e.from_account?.toLowerCase().includes('cash')
    ).reduce((sum: number, e: LedgerEntry) => {
      if (e.to_account?.toLowerCase().includes('cash')) return sum + (e.amount || 0)
      if (e.from_account?.toLowerCase().includes('cash')) return sum - (e.amount || 0)
      return sum
    }, 0) || 0,
    
    pendingClearance: filteredEntries?.filter((e: LedgerEntry) => !e.cleared)
      .reduce((sum: number, e: LedgerEntry) => sum + (e.amount || 0), 0) || 0,
    
    thisMonth: filteredEntries?.reduce((sum: number, e: LedgerEntry) => sum + (e.amount || 0), 0) || 0
  }

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

  const handleOpenDetailModal = async (entry: LedgerEntry) => {
    try {
      const response = await fetch(`/api/ledger/${entry.id}`)
      if (response.ok) {
        const fullEntry = await response.json()
        setSelectedEntry(fullEntry)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('Error fetching entry details:', error)
      alert('Failed to load entry details')
    }
  }

  const handleOpenRecordPaymentModal = () => {
    setPaymentForm({
      from_account: '',
      to_account: '',
      amount: 0,
      mode: 'cash',
      reference: '',
      receipt_url: '',
      cleared: false
    })
    setShowRecordPaymentModal(true)
  }

  const handleOpenRefundModal = (entry: LedgerEntry) => {
    setSelectedEntry(entry)
    setRefundForm({
      amount: entry.amount || 0,
      receipt_url: ''
    })
    setShowRefundModal(true)
  }

  const handleRecordPayment = async () => {
    if (!paymentForm.from_account || !paymentForm.to_account || paymentForm.amount <= 0) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to record payment')
      }

      await mutate('/api/ledger')
      setShowRecordPaymentModal(false)
      alert('Payment recorded successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessRefund = async () => {
    if (!selectedEntry) return

    if (refundForm.amount <= 0 || refundForm.amount > (selectedEntry.amount || 0)) {
      alert('Invalid refund amount')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/ledger/${selectedEntry.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process refund')
      }

      await mutate('/api/ledger')
      setShowRefundModal(false)
      alert('Refund processed successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearTransaction = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ledger/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleared: true })
      })

      if (!response.ok) {
        throw new Error('Failed to clear transaction')
      }

      await mutate('/api/ledger')
      alert('Transaction marked as cleared!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkClear = async () => {
    if (selectedTransactions.length === 0) {
      alert('Please select transactions to clear')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ledger/reconciliation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_ids: selectedTransactions })
      })

      if (!response.ok) {
        throw new Error('Failed to clear transactions')
      }

      await mutate('/api/ledger')
      setSelectedTransactions([])
      alert('Transactions cleared successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/ledger/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      await mutate('/api/ledger')
      alert('Transaction deleted successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReconciliation = async () => {
    setLoading(true)
    try {
      const from = fromDate || new Date().toISOString().split('T')[0]
      const to = toDate || new Date().toISOString().split('T')[0]
      
      const response = await fetch(`/api/ledger/reconciliation?from_date=${from}&to_date=${to}`)
      if (response.ok) {
        const data = await response.json()
        setReconciliationData(data)
        setShowReconciliationModal(true)
      }
    } catch (error) {
      console.error('Error loading reconciliation:', error)
      alert('Failed to load reconciliation report')
    } finally {
      setLoading(false)
    }
  }

  const toggleTransactionSelection = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(tid => tid !== id))
    } else {
      setSelectedTransactions([...selectedTransactions, id])
    }
  }

  const handleCloseModals = () => {
    setShowDetailModal(false)
    setShowRecordPaymentModal(false)
    setShowRefundModal(false)
    setShowReconciliationModal(false)
    setSelectedEntry(null)
    setReconciliationData(null)
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
            <h1 className="text-3xl font-bold text-gray-900">Payments & Ledger</h1>
            <p className="text-gray-600 mt-1">Manage payments, refunds, and financial reconciliation</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleOpenReconciliation}>
              <FileText className="w-5 h-5 mr-2" />
              Cash Reconciliation
            </Button>
            {selectedTransactions.length > 0 && (
              <Button variant="outline" onClick={handleBulkClear}>
                <CheckCircle className="w-5 h-5 mr-2" />
                Clear Selected ({selectedTransactions.length})
              </Button>
            )}
            <Button variant="primary" onClick={handleOpenRecordPaymentModal}>
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
                  <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats.todayCollections)}</p>
                  <p className="text-xs text-gray-500 mt-1">{filteredEntries?.length || 0} transactions</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cash in Hand</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.cashInHand)}</p>
                  <p className="text-xs text-gray-500 mt-1">Uncleared: {formatCurrency(stats.pendingClearance)}</p>
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
                  <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(stats.pendingClearance)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredEntries?.filter((e: LedgerEntry) => !e.cleared).length || 0} transactions
                  </p>
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
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.thisMonth)}</p>
                  <p className="text-xs text-green-600 mt-1">All transactions</p>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Modes</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
              <select
                value={clearedFilter}
                onChange={(e) => setClearedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Cleared</option>
                <option value="false">Pending</option>
              </select>
              <Input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From Date"
              />
              <Input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To Date"
              />
            </div>
          </CardBody>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              All Transactions {isLoading && <span className="text-sm text-gray-500">(Loading...)</span>}
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                Error loading transactions: {error.message}
              </div>
            )}
            {!isLoading && filteredEntries && filteredEntries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No transactions found</p>
                <p className="text-sm mt-2">Record your first payment to get started</p>
              </div>
            )}
            {filteredEntries && filteredEntries.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.length === filteredEntries.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTransactions(filteredEntries.map((e: LedgerEntry) => e.id))
                            } else {
                              setSelectedTransactions([])
                            }
                          }}
                          className="rounded"
                        />
                      </th>
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
                    {filteredEntries.map((entry: LedgerEntry) => {
                      const creator = entry.creator as any
                      return (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(entry.id)}
                              onChange={() => toggleTransactionSelection(entry.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-500">
                              {entry.created_at ? formatDateTime(entry.created_at) : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">By {creator?.name || 'System'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm space-y-1">
                              <div className="font-medium text-gray-900">{entry.from_account || 'N/A'}</div>
                              <div className="text-gray-400 flex items-center">
                                <span>→</span>
                              </div>
                              <div className="text-gray-700">{entry.to_account || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(entry.amount || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                {getPaymentIcon(entry.mode || 'cash')}
                              </div>
                              <span className="text-sm capitalize text-gray-700">
                                {(entry.mode || 'cash').replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-600">{entry.reference || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.cleared ? (
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
                              <Button size="sm" variant="outline" onClick={() => handleOpenDetailModal(entry)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!entry.cleared && (
                                <Button 
                                  size="sm" 
                                  variant="primary"
                                  onClick={() => handleClearTransaction(entry.id)}
                                >
                                  Clear
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleOpenRefundModal(entry)}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              <button
                                onClick={() => handleDelete(entry.id)}
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
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    {selectedEntry.cleared ? (
                      <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Cleared</Badge>
                    ) : (
                      <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction Date</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedEntry.created_at ? formatDateTime(selectedEntry.created_at) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Accounts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">From Account</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                    {selectedEntry.from_account || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">To Account</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                    {selectedEntry.to_account || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Amount and Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 text-2xl font-bold text-green-600">
                    {formatCurrency(selectedEntry.amount || 0)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Mode</label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      {getPaymentIcon(selectedEntry.mode || 'cash')}
                    </div>
                    <span className="text-sm capitalize">
                      {(selectedEntry.mode || 'cash').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="text-sm font-medium text-gray-700">Reference</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-900">
                  {selectedEntry.reference || 'No reference'}
                </div>
              </div>

              {/* Receipt */}
              {selectedEntry.receipt_url && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Receipt</label>
                  <div className="mt-1">
                    <a
                      href={selectedEntry.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Receipt
                    </a>
                  </div>
                </div>
              )}

              {/* Creator */}
              <div>
                <label className="text-sm font-medium text-gray-700">Created By</label>
                <div className="mt-1 text-sm text-gray-900">
                  {(selectedEntry.creator as any)?.name || 'System'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Account *</label>
                  <Input
                    value={paymentForm.from_account}
                    onChange={(e) => setPaymentForm({ ...paymentForm, from_account: e.target.value })}
                    placeholder="e.g., Customer Name or Shop Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Account *</label>
                  <Input
                    value={paymentForm.to_account}
                    onChange={(e) => setPaymentForm({ ...paymentForm, to_account: e.target.value })}
                    placeholder="e.g., Company Cash or Bank"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <Input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                  <select
                    value={paymentForm.mode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                <Input
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  placeholder="Transaction reference or invoice number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt URL (Optional)</label>
                <Input
                  value={paymentForm.receipt_url}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receipt_url: e.target.value })}
                  placeholder="URL to receipt or proof document"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cleared"
                  checked={paymentForm.cleared}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cleared: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="cleared" className="text-sm text-gray-700">
                  Mark as cleared immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseModals} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleRecordPayment} disabled={loading} className="flex-1">
                  {loading ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Process Refund</h2>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  This will create a reversal entry for this transaction.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Amount</label>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(selectedEntry.amount || 0)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount *</label>
                <Input
                  type="number"
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: Number(e.target.value) })}
                  placeholder="0.00"
                  max={selectedEntry.amount || 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(selectedEntry.amount || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt URL (Optional)</label>
                <Input
                  value={refundForm.receipt_url}
                  onChange={(e) => setRefundForm({ ...refundForm, receipt_url: e.target.value })}
                  placeholder="URL to refund receipt"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseModals} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleProcessRefund} disabled={loading} className="flex-1">
                  {loading ? 'Processing...' : 'Process Refund'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Modal */}
      {showReconciliationModal && reconciliationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Cash Reconciliation Report</h2>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Period */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-900">
                  Period: {reconciliationData.period.from} to {reconciliationData.period.to}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600">Cash Inflow</p>
                    <p className="text-xl font-bold text-green-600 mt-1">
                      {formatCurrency(reconciliationData.summary.total_cash_inflow)}
                    </p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600">Cash Outflow</p>
                    <p className="text-xl font-bold text-red-600 mt-1">
                      {formatCurrency(reconciliationData.summary.total_cash_outflow)}
                    </p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600">Net Position</p>
                    <p className={`text-xl font-bold mt-1 ${
                      reconciliationData.summary.net_cash_position >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(reconciliationData.summary.net_cash_position)}
                    </p>
                  </CardBody>
                </Card>
              </div>

              {/* Cleared vs Uncleared */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Cleared Transactions</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reconciliationData.summary.cleared_net_cash)}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Uncleared Transactions</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(reconciliationData.summary.uncleared_net_cash)}
                  </p>
                </div>
              </div>

              {/* By Mode Breakdown */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Breakdown by Payment Mode</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mode</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Count</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Inflow</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Outflow</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Net</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reconciliationData.by_mode.map((row: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm capitalize">{row.mode.replace('_', ' ')}</td>
                          <td className="px-4 py-2 text-sm">
                            {row.cleared ? (
                              <span className="text-green-600">Cleared</span>
                            ) : (
                              <span className="text-orange-600">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">{row.transaction_count}</td>
                          <td className="px-4 py-2 text-sm text-right text-green-600">
                            {formatCurrency(row.cash_inflow)}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-red-600">
                            {formatCurrency(row.cash_outflow)}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium">
                            {formatCurrency(row.net_cash_flow)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Total Transactions: {reconciliationData.transaction_count}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
