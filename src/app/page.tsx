'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Milk, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap, 
  BarChart3,
  CheckCircle,
  X,
  Mail,
  Lock,
  Key,
  ArrowRight,
  Smartphone,
  Package,
  DollarSign
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // Signup form
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginForm.email || !loginForm.password) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token/session
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }

      // Redirect to admin dashboard
      router.push('/admin')
    } catch (error: any) {
      alert('Login Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.adminCode) {
      alert('Please fill in all fields')
      return
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (signupForm.password.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          admin_code: signupForm.adminCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      alert('Account created successfully! Please login.')
      setShowSignupModal(false)
      setShowLoginModal(true)
      
      // Reset form
      setSignupForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminCode: ''
      })
    } catch (error: any) {
      alert('Signup Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Milk className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DairyFlow</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Smart Dairy Management</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Streamline Your<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dairy Operations
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Complete end-to-end solution for milk collection, production, inventory, deliveries, and payments. Manage your dairy business with ease.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSignupModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
              >
                Sign In
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="w-full h-[400px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Milk, label: 'Collections', value: '2,450L', color: 'blue' },
                  { icon: Package, label: 'Inventory', value: '5,200L', color: 'purple' },
                  { icon: Users, label: 'Suppliers', value: '150+', color: 'green' },
                  { icon: DollarSign, label: 'Revenue', value: '₹2.5L', color: 'orange' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-lg">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Comprehensive tools to manage your entire dairy workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Milk,
                title: 'Milk Collection',
                description: 'Track collections from suppliers with FAT/SNF analysis, GPS, and QC status'
              },
              {
                icon: Package,
                title: 'Production & Batches',
                description: 'Create production batches, manage inventory, and track expiry dates'
              },
              {
                icon: TrendingUp,
                title: 'Route Management',
                description: 'Plan delivery routes, assign agents, and track real-time progress'
              },
              {
                icon: Smartphone,
                title: 'Delivery Tracking',
                description: 'Proof of delivery with photos, signatures, and payment collection'
              },
              {
                icon: DollarSign,
                title: 'Payments & Ledger',
                description: 'Record payments, process refunds, and auto-generate ledger entries'
              },
              {
                icon: BarChart3,
                title: 'Advanced Reports',
                description: 'Real-time dashboards, analytics, and exportable reports'
              },
              {
                icon: Users,
                title: 'User Management',
                description: 'Role-based access for admins, manufacturers, and delivery agents'
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description: 'Bank-grade security with automatic backups and data encryption'
              },
              {
                icon: Zap,
                title: 'Fast & Efficient',
                description: 'Optimized performance with real-time updates and offline support'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-xl hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Dairy Business?</h2>
          <p className="text-xl text-blue-100 mb-8">Join hundreds of dairy farms using DairyFlow to manage their operations</p>
          <button
            onClick={() => setShowSignupModal(true)}
            className="px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl text-lg"
          >
            Start Your Free Trial Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Milk className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">DairyFlow</span>
              </div>
              <p className="text-sm">Complete dairy management solution for modern farms</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About Us</li>
                <li>Contact</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2024 DairyFlow. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Milk className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@dairy.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false)
                    setShowSignupModal(true)
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative my-8">
            <button
              onClick={() => setShowSignupModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create Admin Account</h2>
              <p className="text-gray-600 mt-2">Get started with DairyFlow</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@dairy.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={signupForm.adminCode}
                    onChange={(e) => setSignupForm({ ...signupForm, adminCode: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter admin access code"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Special code required for admin registration</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowSignupModal(false)
                    setShowLoginModal(true)
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
