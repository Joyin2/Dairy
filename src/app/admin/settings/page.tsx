'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Database,
  Mail,
  DollarSign,
  Smartphone,
  Save,
  RefreshCw,
  CreditCard,
  Globe,
  Zap,
  Package,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react'
import { useSettings } from '@/lib/hooks'
import { mutate } from 'swr'

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)

  // Settings state
  const [settingsData, setSettingsData] = useState<any>({})

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: settings, error, isLoading } = useSettings()

  // Initialize settings data when loaded
  useEffect(() => {
    if (settings) {
      setSettingsData(settings)
    }
  }, [settings])

  const handleInitialize = async () => {
    setInitLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize settings')
      }

      await mutate('/api/settings')
      alert('Settings initialized successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setInitLoading(false)
    }
  }

  const handleChange = (category: string, key: string, value: any) => {
    setSettingsData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category]?.[key],
          value: value
        }
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async (category: string) => {
    setLoading(true)
    try {
      // Extract just the values for the category
      const categorySettings: any = {}
      Object.entries(settingsData[category] || {}).forEach(([key, config]: [string, any]) => {
        categorySettings[key] = config.value
      })

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          settings: categorySettings
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      await mutate('/api/settings')
      setHasChanges(false)
      alert('Settings saved successfully!')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getSetting = (category: string, key: string, defaultValue: any = '') => {
    return settingsData[category]?.[key]?.value || defaultValue
  }

  const getDataType = (category: string, key: string) => {
    return settingsData[category]?.[key]?.data_type || 'string'
  }

  if (!isClient) {
    return null
  }

  // Show init button if error loading settings
  if (error && error.message?.includes('not exist')) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardBody className="text-center p-8">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings Not Initialized</h2>
              <p className="text-gray-600 mb-6">
                The settings table needs to be initialized before you can configure your system.
              </p>
              <Button
                variant="primary"
                onClick={handleInitialize}
                disabled={initLoading}
              >
                {initLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Initialize Settings
                  </>
                )}
              </Button>
            </CardBody>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 mx-auto animate-spin text-blue-600" />
            <p className="text-gray-600 mt-4">Loading settings...</p>
          </div>
        )}

        {!isLoading && settingsData && (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'general', label: 'General', icon: SettingsIcon },
                  { id: 'pricing', label: 'Pricing & Tax', icon: DollarSign },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'sms', label: 'SMS Gateway', icon: Smartphone },
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'payment_gateway', label: 'Payment Gateway', icon: CreditCard },
                  { id: 'security', label: 'Security', icon: Lock },
                  { id: 'backup', label: 'Backup', icon: Database },
                  { id: 'features', label: 'Features', icon: Zap },
                  { id: 'inventory', label: 'Inventory', icon: Package }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* General Settings */}
              {activeTab === 'general' && (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <Input
                          label="Company Name"
                          value={getSetting('general', 'company_name', '')}
                          onChange={(e) => handleChange('general', 'company_name', e.target.value)}
                        />
                        <Input
                          label="Business Email"
                          type="email"
                          value={getSetting('general', 'business_email', '')}
                          onChange={(e) => handleChange('general', 'business_email', e.target.value)}
                        />
                        <Input
                          label="Business Phone"
                          type="tel"
                          value={getSetting('general', 'business_phone', '')}
                          onChange={(e) => handleChange('general', 'business_phone', e.target.value)}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <textarea
                            value={getSetting('general', 'address', '')}
                            onChange={(e) => handleChange('general', 'address', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold text-gray-900">Regional Settings</h2>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                          <select
                            value={getSetting('general', 'timezone', 'Asia/Kolkata')}
                            onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                          <select
                            value={getSetting('general', 'currency', 'INR')}
                            onChange={(e) => handleChange('general', 'currency', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                          <select
                            value={getSetting('general', 'language', 'en')}
                            onChange={(e) => handleChange('general', 'language', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="mr">Marathi</option>
                          </select>
                        </div>
                        <div className="pt-4">
                          <Button
                            variant="primary"
                            onClick={() => handleSave('general')}
                            disabled={loading}
                          >
                            {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </>
              )}

              {/* Pricing Settings */}
              {activeTab === 'pricing' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Pricing & Tax Configuration</h2>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Input
                          label="Base Price per Liter (₹)"
                          type="number"
                          value={getSetting('pricing', 'base_price_per_liter', '50')}
                          onChange={(e) => handleChange('pricing', 'base_price_per_liter', e.target.value)}
                        />
                        <Input
                          label="FAT Premium (%)"
                          type="number"
                          value={getSetting('pricing', 'fat_premium_percent', '5')}
                          onChange={(e) => handleChange('pricing', 'fat_premium_percent', e.target.value)}
                        />
                        <Input
                          label="SNF Premium (%)"
                          type="number"
                          value={getSetting('pricing', 'snf_premium_percent', '3')}
                          onChange={(e) => handleChange('pricing', 'snf_premium_percent', e.target.value)}
                        />
                      </div>
                      <div className="space-y-4">
                        <Input
                          label="GST Rate (%)"
                          type="number"
                          value={getSetting('pricing', 'gst_rate', '5')}
                          onChange={(e) => handleChange('pricing', 'gst_rate', e.target.value)}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax Calculation Method</label>
                          <select
                            value={getSetting('pricing', 'tax_method', 'inclusive')}
                            onChange={(e) => handleChange('pricing', 'tax_method', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="inclusive">Tax Inclusive</option>
                            <option value="exclusive">Tax Exclusive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="primary"
                        onClick={() => handleSave('pricing')}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Pricing Settings
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {[
                        { key: 'email_enabled', label: 'Email Notifications', desc: 'Receive updates via email' },
                        { key: 'sms_enabled', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
                        { key: 'push_enabled', label: 'Push Notifications', desc: 'Receive browser notifications' },
                        { key: 'low_stock_alerts', label: 'Low Stock Alerts', desc: 'Alert when inventory is low' },
                        { key: 'payment_reminders', label: 'Payment Reminders', desc: 'Remind pending payments' },
                        { key: 'collection_receipts', label: 'Collection Receipts', desc: 'Auto-send collection receipts to suppliers' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getSetting('notifications', item.key, 'false') === 'true'}
                              onChange={(e) => handleChange('notifications', item.key, e.target.checked ? 'true' : 'false')}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="primary"
                        onClick={() => handleSave('notifications')}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Notification Settings
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* SMS Gateway */}
              {activeTab === 'sms' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">SMS Gateway Configuration</h2>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">SMS Provider</label>
                          <select
                            value={getSetting('sms', 'provider', 'twilio')}
                            onChange={(e) => handleChange('sms', 'provider', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="twilio">Twilio</option>
                            <option value="msg91">MSG91</option>
                            <option value="textlocal">TextLocal</option>
                            <option value="aws_sns">AWS SNS</option>
                          </select>
                        </div>
                        <Input
                          label="API Key"
                          type="password"
                          value={getSetting('sms', 'api_key', '')}
                          onChange={(e) => handleChange('sms', 'api_key', e.target.value)}
                          placeholder="Enter SMS API key"
                        />
                        <Input
                          label="Sender ID"
                          value={getSetting('sms', 'sender_id', '')}
                          onChange={(e) => handleChange('sms', 'sender_id', e.target.value)}
                          placeholder="e.g., DAIRY"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">SMS Template (Receipt)</label>
                          <textarea
                            value={getSetting('sms', 'template_receipt', '')}
                            onChange={(e) => handleChange('sms', 'template_receipt', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your milk collection: {amount} L. Thank you!"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Available variables: {'{amount}'}, {'{date}'}, {'{supplier}'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="primary"
                        onClick={() => handleSave('sms')}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save SMS Settings
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Email Configuration</h2>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Provider</label>
                          <select
                            value={getSetting('email', 'provider', 'smtp')}
                            onChange={(e) => handleChange('email', 'provider', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="smtp">SMTP</option>
                            <option value="sendgrid">SendGrid</option>
                            <option value="mailgun">Mailgun</option>
                            <option value="ses">AWS SES</option>
                          </select>
                        </div>
                        <Input
                          label="SMTP Host"
                          value={getSetting('email', 'smtp_host', '')}
                          onChange={(e) => handleChange('email', 'smtp_host', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                        <Input
                          label="SMTP Port"
                          type="number"
                          value={getSetting('email', 'smtp_port', '587')}
                          onChange={(e) => handleChange('email', 'smtp_port', e.target.value)}
                        />
                        <Input
                          label="SMTP Username"
                          value={getSetting('email', 'smtp_user', '')}
                          onChange={(e) => handleChange('email', 'smtp_user', e.target.value)}
                        />
                      </div>
                      <div className="space-y-4">
                        <Input
                          label="SMTP Password"
                          type="password"
                          value={getSetting('email', 'smtp_password', '')}
                          onChange={(e) => handleChange('email', 'smtp_password', e.target.value)}
                        />
                        <Input
                          label="From Email"
                          type="email"
                          value={getSetting('email', 'from_email', '')}
                          onChange={(e) => handleChange('email', 'from_email', e.target.value)}
                          placeholder="noreply@dairy.com"
                        />
                        <Input
                          label="From Name"
                          value={getSetting('email', 'from_name', '')}
                          onChange={(e) => handleChange('email', 'from_name', e.target.value)}
                          placeholder="Dairy Management"
                        />
                      </div>
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="primary"
                        onClick={() => handleSave('email')}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Email Settings
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Payment Gateway */}
              {activeTab === 'payment_gateway' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Payment Gateway Integration</h2>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Enable Payment Gateway</p>
                          <p className="text-xs text-gray-500">Allow online payments from customers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getSetting('payment_gateway', 'enabled', 'false') === 'true'}
                            onChange={(e) => handleChange('payment_gateway', 'enabled', e.target.checked ? 'true' : 'false')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Provider</label>
                            <select
                              value={getSetting('payment_gateway', 'provider', 'razorpay')}
                              onChange={(e) => handleChange('payment_gateway', 'provider', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="razorpay">Razorpay</option>
                              <option value="stripe">Stripe</option>
                              <option value="paytm">Paytm</option>
                              <option value="phonepe">PhonePe</option>
                            </select>
                          </div>
                          <Input
                            label="API Key / Key ID"
                            type="password"
                            value={getSetting('payment_gateway', 'api_key', '')}
                            onChange={(e) => handleChange('payment_gateway', 'api_key', e.target.value)}
                            placeholder="Enter API key"
                          />
                        </div>
                        <div className="space-y-4">
                          <Input
                            label="API Secret"
                            type="password"
                            value={getSetting('payment_gateway', 'api_secret', '')}
                            onChange={(e) => handleChange('payment_gateway', 'api_secret', e.target.value)}
                            placeholder="Enter API secret"
                          />
                          <Input
                            label="Webhook Secret"
                            type="password"
                            value={getSetting('payment_gateway', 'webhook_secret', '')}
                            onChange={(e) => handleChange('payment_gateway', 'webhook_secret', e.target.value)}
                            placeholder="Enter webhook secret"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="primary"
                        onClick={() => handleSave('payment_gateway')}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Payment Settings
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-500">Add extra security layer</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getSetting('security', 'two_factor_enabled', 'false') === 'true'}
                              onChange={(e) => handleChange('security', 'two_factor_enabled', e.target.checked ? 'true' : 'false')}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Force Password Reset</p>
                            <p className="text-xs text-gray-500">Require password change every 90 days</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getSetting('security', 'force_password_reset', 'true') === 'true'}
                              onChange={(e) => handleChange('security', 'force_password_reset', e.target.checked ? 'true' : 'false')}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Input
                          label="Session Timeout (minutes)"
                          type="number"
                          value={getSetting('security', 'session_timeout', '30')}
                          onChange={(e) => handleChange('security', 'session_timeout', e.target.value)}
                        />
                        <Input
                          label="Max Login Attempts"
                          type="number"
                          value={getSetting('security', 'max_login_attempts', '5')}
                          onChange={(e) => handleChange('security', 'max_login_attempts', e.target.value)}
                        />
                        <Input
                          label="Min Password Length"
                          type="number"
                          value={getSetting('security', 'password_min_length', '8')}
                          onChange={(e) => handleChange('security', 'password_min_length', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="primary"
                        onClick={() => handleSave('security')}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Security Settings
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Backup */}
              {activeTab === 'backup' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Backup & Recovery</h2>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Auto Backup</p>
                            <p className="text-xs text-gray-500">Automatic daily backups</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getSetting('backup', 'auto_backup_enabled', 'true') === 'true'}
                              onChange={(e) => handleChange('backup', 'auto_backup_enabled', e.target.checked ? 'true' : 'false')}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                          <select
                            value={getSetting('backup', 'backup_frequency', 'daily')}
                            onChange={(e) => handleChange('backup', 'backup_frequency', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Input
                          label="Backup Retention (days)"
                          type="number"
                          value={getSetting('backup', 'backup_retention_days', '30')}
                          onChange={(e) => handleChange('backup', 'backup_retention_days', e.target.value)}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Backup Storage</label>
                          <select
                            value={getSetting('backup', 'backup_storage', 's3')}
                            onChange={(e) => handleChange('backup', 'backup_storage', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="s3">AWS S3</option>
                            <option value="gcs">Google Cloud Storage</option>
                            <option value="azure">Azure Blob Storage</option>
                            <option value="local">Local Storage</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-6">
                      <Button
                        variant="primary"
                        onClick={() => handleSave('backup')}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Backup Settings
                      </Button>
                      <Button variant="outline">
                        <Database className="w-5 h-5 mr-2" />
                        Backup Now
                      </Button>
                      <Button variant="outline">
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Restore
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Feature Flags */}
              {activeTab === 'features' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Feature Flags & Toggles</h2>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {[
                        { key: 'enable_qr_scanning', label: 'QR Code Scanning', desc: 'Enable QR code scanning for collection receipts' },
                        { key: 'enable_gps_tracking', label: 'GPS Tracking', desc: 'Enable GPS tracking for deliveries and collections' },
                        { key: 'enable_offline_mode', label: 'Offline Mode', desc: 'Allow offline data collection and sync later' },
                        { key: 'enable_multi_language', label: 'Multi-Language Support', desc: 'Enable multiple language options' },
                        { key: 'enable_advanced_reports', label: 'Advanced Reports', desc: 'Enable advanced analytics and reporting' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getSetting('features', item.key, 'false') === 'true'}
                              onChange={(e) => handleChange('features', item.key, e.target.checked ? 'true' : 'false')}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="primary"
                        onClick={() => handleSave('features')}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Feature Settings
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Inventory */}
              {activeTab === 'inventory' && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Inventory Management Settings</h2>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Input
                          label="Low Stock Threshold (liters)"
                          type="number"
                          value={getSetting('inventory', 'low_stock_threshold', '100')}
                          onChange={(e) => handleChange('inventory', 'low_stock_threshold', e.target.value)}
                        />
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Enable Auto Reorder</p>
                            <p className="text-xs text-gray-500">Automatically reorder when stock is low</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getSetting('inventory', 'enable_auto_reorder', 'false') === 'true'}
                              onChange={(e) => handleChange('inventory', 'enable_auto_reorder', e.target.checked ? 'true' : 'false')}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Input
                          label="Reorder Quantity (liters)"
                          type="number"
                          value={getSetting('inventory', 'reorder_quantity', '500')}
                          onChange={(e) => handleChange('inventory', 'reorder_quantity', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="primary"
                        onClick={() => handleSave('inventory')}
                        disabled={loading}
                      >
                        {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Inventory Settings
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader className="border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Reset All Settings</p>
                      <p className="text-xs text-gray-500">Restore default configuration (cannot be undone)</p>
                    </div>
                    <Button variant="outline" onClick={() => alert('Reset functionality coming soon')}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Clear All Data</p>
                      <p className="text-xs text-gray-500">Permanently delete all records (cannot be undone)</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Are you ABSOLUTELY sure? This action CANNOT be undone!')) {
                          alert('Clear data functionality disabled for safety')
                        }
                      }}
                    >
                      Clear Data
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
