'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { 
  Settings, 
  Bell, 
  Lock, 
  Database,
  Mail,
  DollarSign,
  Smartphone,
  Save
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input label="Company Name" defaultValue="Dairy Management Co." />
                <Input label="Business Email" type="email" defaultValue="admin@dairy.com" />
                <Input label="Business Phone" type="tel" defaultValue="+91 98765 43210" />
                <Input label="Address" defaultValue="123 Dairy Lane, Meerut, UP" />
                <div className="pt-4">
                  <Button variant="primary">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pricing & Tax Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Pricing & Tax</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input label="Base Price per Liter (₹)" type="number" defaultValue="50" />
                <Input label="FAT Premium (%)" type="number" defaultValue="5" />
                <Input label="SNF Premium (%)" type="number" defaultValue="3" />
                <Input label="GST Rate (%)" type="number" defaultValue="5" />
                <Select
                  label="Tax Calculation Method"
                  options={[
                    { value: 'inclusive', label: 'Inclusive' },
                    { value: 'exclusive', label: 'Exclusive' }
                  ]}
                />
                <div className="pt-4">
                  <Button variant="primary">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive updates via email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-xs text-gray-500">Receive updates via SMS</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                    <p className="text-xs text-gray-500">Receive browser notifications</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Low Stock Alerts</p>
                    <p className="text-xs text-gray-500">Alert when inventory is low</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Reminders</p>
                    <p className="text-xs text-gray-500">Remind pending payments</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <div className="pt-4">
                  <Button variant="primary">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* SMS Gateway Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">SMS Gateway</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Select
                  label="SMS Provider"
                  options={[
                    { value: 'twilio', label: 'Twilio' },
                    { value: 'msg91', label: 'MSG91' },
                    { value: 'textlocal', label: 'TextLocal' }
                  ]}
                />
                <Input label="API Key" type="password" defaultValue="••••••••••••" />
                <Input label="Sender ID" defaultValue="DAIRY" />
                <Input label="SMS Template" defaultValue="Your milk collection receipt: {amount} L" />
                <div className="pt-4">
                  <Button variant="primary">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add extra security layer</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Force Password Reset</p>
                    <p className="text-xs text-gray-500">Require password change every 90 days</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <Input label="Session Timeout (minutes)" type="number" defaultValue="30" />
                <div className="pt-4">
                  <Button variant="primary">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Database & Backup */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Database & Backup</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Auto Backup</p>
                    <p className="text-xs text-gray-500">Automatic daily backups</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                </div>
                <Select
                  label="Backup Frequency"
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ]}
                />
                <Input label="Backup Retention (days)" type="number" defaultValue="30" />
                <div className="flex gap-3 pt-4">
                  <Button variant="outline">Backup Now</Button>
                  <Button variant="outline">Restore</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader className="border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Reset All Settings</p>
                  <p className="text-xs text-gray-500">Restore default configuration</p>
                </div>
                <Button variant="outline">Reset</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Clear All Data</p>
                  <p className="text-xs text-gray-500">Permanently delete all records</p>
                </div>
                <Button variant="danger">Clear Data</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}
