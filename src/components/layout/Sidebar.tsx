'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Milk, 
  Package, 
  Truck, 
  DollarSign, 
  BarChart3, 
  Settings,
  Store,
  MapPin,
  Bell,
  FileText,
  Activity
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Suppliers', href: '/admin/suppliers', icon: Milk },
  { name: 'Shops', href: '/admin/shops', icon: Store },
  { name: 'Collections', href: '/admin/collections', icon: Milk },
  { name: 'Batches', href: '/admin/batches', icon: Package },
  { name: 'Inventory', href: '/admin/inventory', icon: Package },
  { name: 'Routes', href: '/admin/routes', icon: MapPin },
  { name: 'Deliveries', href: '/admin/deliveries', icon: Truck },
  { name: 'Payments', href: '/admin/payments', icon: DollarSign },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  { name: 'Monitoring', href: '/admin/monitoring', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex h-full flex-col border-r border-gray-200 bg-white">
        {/* Sticky Header */}
        <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <Milk className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dairy Admin</h1>
              <p className="text-xs text-gray-500">Management Panel</p>
            </div>
          </div>
        </div>
        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
          <ul role="list" className="flex flex-col gap-y-1 pb-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
