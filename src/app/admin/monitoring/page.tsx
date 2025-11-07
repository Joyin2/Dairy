'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Activity, 
  Server, 
  Database,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

const cpuData = [
  { time: '00:00', usage: 45 },
  { time: '04:00', usage: 38 },
  { time: '08:00', usage: 65 },
  { time: '12:00', usage: 72 },
  { time: '16:00', usage: 58 },
  { time: '20:00', usage: 48 },
  { time: '23:59', usage: 42 }
]

const requestData = [
  { time: '00:00', requests: 120 },
  { time: '04:00', requests: 80 },
  { time: '08:00', requests: 340 },
  { time: '12:00', requests: 520 },
  { time: '16:00', requests: 380 },
  { time: '20:00', requests: 280 },
  { time: '23:59', requests: 150 }
]

const systemHealth = [
  { name: 'API Server', status: 'healthy', uptime: '99.98%', responseTime: '45ms' },
  { name: 'Database', status: 'healthy', uptime: '99.99%', responseTime: '12ms' },
  { name: 'Edge Functions', status: 'healthy', uptime: '99.95%', responseTime: '78ms' },
  { name: 'Storage', status: 'warning', uptime: '98.50%', responseTime: '120ms' },
  { name: 'Realtime', status: 'healthy', uptime: '99.97%', responseTime: '35ms' }
]

const backgroundJobs = [
  { id: '1', name: 'Daily Backup', status: 'completed', lastRun: '2 hours ago', nextRun: '22 hours' },
  { id: '2', name: 'Collection Reports', status: 'running', lastRun: 'Running now', nextRun: '-' },
  { id: '3', name: 'SMS Queue', status: 'completed', lastRun: '15 minutes ago', nextRun: '45 minutes' },
  { id: '4', name: 'Payment Reconciliation', status: 'failed', lastRun: '1 hour ago', nextRun: '5 minutes' },
  { id: '5', name: 'Stock Alerts', status: 'scheduled', lastRun: '3 hours ago', nextRun: '1 hour' }
]

export default function MonitoringPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge variant="success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Healthy
          </Badge>
        )
      case 'warning':
        return (
          <Badge variant="warning">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="danger">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'running':
        return <Badge variant="info">Running</Badge>
      case 'failed':
        return <Badge variant="danger">Failed</Badge>
      case 'scheduled':
        return <Badge variant="default">Scheduled</Badge>
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
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time system health and performance metrics</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </Button>
        </div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">Healthy</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">99.98%</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">45ms</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Connections</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">248</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Server className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">CPU Usage (24h)</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={cpuData}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorCpu)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">API Requests (24h)</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={requestData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Service Health */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Service Health</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {systemHealth.map((service, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(service.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{service.uptime}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{service.responseTime}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Background Jobs */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Background Jobs</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backgroundJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{job.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getJobStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{job.lastRun}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{job.nextRun}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {job.status === 'failed' && (
                            <Button size="sm" variant="primary">Retry</Button>
                          )}
                          <Button size="sm" variant="outline">View Logs</Button>
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
