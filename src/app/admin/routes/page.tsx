'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, MapPin, Calendar, Users, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const routes = [
  {
    id: '1',
    name: 'Route A - North Zone',
    agent: 'Rajesh Kumar',
    agentPhone: '+91 98765 43210',
    date: new Date('2024-11-07'),
    stops: 12,
    completedStops: 8,
    totalShops: [
      { name: 'Sharma Store', status: 'completed' },
      { name: 'Gandhi Dairy', status: 'completed' },
      { name: 'Modern Mart', status: 'pending' }
    ],
    status: 'in_progress',
    startTime: new Date('2024-11-07T08:00:00'),
    estimatedEnd: new Date('2024-11-07T14:00:00')
  },
  {
    id: '2',
    name: 'Route B - South Zone',
    agent: 'Vijay Singh',
    agentPhone: '+91 98765 43211',
    date: new Date('2024-11-07'),
    stops: 15,
    completedStops: 15,
    totalShops: [
      { name: 'Patel Store', status: 'completed' },
      { name: 'Quick Mart', status: 'completed' }
    ],
    status: 'completed',
    startTime: new Date('2024-11-07T07:00:00'),
    estimatedEnd: new Date('2024-11-07T13:00:00')
  },
  {
    id: '3',
    name: 'Route C - East Zone',
    agent: 'Amit Verma',
    agentPhone: '+91 98765 43212',
    date: new Date('2024-11-08'),
    stops: 10,
    completedStops: 0,
    totalShops: [
      { name: 'East Market', status: 'pending' },
      { name: 'City Store', status: 'pending' }
    ],
    status: 'scheduled',
    startTime: new Date('2024-11-08T08:00:00'),
    estimatedEnd: new Date('2024-11-08T12:00:00')
  }
]

export default function RoutesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>
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
            <h1 className="text-3xl font-bold text-gray-900">Routes Management</h1>
            <p className="text-gray-600 mt-1">Plan and manage delivery routes</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Calendar className="w-5 h-5 mr-2" />
              View Calendar
            </Button>
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              Create Route
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Active Routes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
              <p className="text-xs text-blue-600 mt-1">In progress today</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-600 mt-1">5</p>
              <p className="text-xs text-gray-500 mt-1">100% success</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
              <p className="text-xs text-gray-500 mt-1">For tomorrow</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">15</p>
              <p className="text-xs text-green-600 mt-1">All available</p>
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
                  placeholder="Search routes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' }
                ]}
              />
              <Input type="date" />
              <Select
                options={[
                  { value: 'all', label: 'All Agents' },
                  { value: 'agent-1', label: 'Rajesh Kumar' },
                  { value: 'agent-2', label: 'Vijay Singh' }
                ]}
              />
            </div>
          </CardBody>
        </Card>

        {/* Routes Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {routes.map((route) => (
            <Card key={route.id} hover>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(route.date)}</p>
                  </div>
                  {getStatusBadge(route.status)}
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {/* Agent Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{route.agent}</p>
                      <p className="text-xs text-gray-500">{route.agentPhone}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {route.completedStops}/{route.stops} stops
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${(route.completedStops / route.stops) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-600">Start Time</p>
                      <p className="font-medium text-gray-900">
                        {route.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Est. End</p>
                      <p className="font-medium text-gray-900">
                        {route.estimatedEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Stops Preview */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Sample Stops:</p>
                    <div className="space-y-1">
                      {route.totalShops.slice(0, 3).map((shop, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700">{shop.name}</span>
                          {shop.status === 'completed' && (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1">View Details</Button>
                    <Button variant="primary" className="flex-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      Track
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
