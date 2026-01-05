import useSWR from 'swr'
import type {
  MilkCollection,
  Batch,
  Delivery,
  Supplier,
  Shop,
  Product,
  InventoryItem,
  Route,
  LedgerEntry,
  AuditLog,
  AppUser,
  DashboardStats
} from '@/types/database'

// Generic fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Fetch error for ${url}:`, res.status, res.statusText, errorText);
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json()
}

// Dashboard Stats
export function useDashboardStats() {
  return useSWR<DashboardStats>('/api/dashboard/stats', fetcher, {
    refreshInterval: 30000 // Refresh every 30s
  })
}

// Milk Collections
export function useMilkCollections(filters?: {
  date?: string
  supplierId?: string
  status?: string
}) {
  const params = new URLSearchParams()
  if (filters?.date) params.set('date', filters.date)
  if (filters?.supplierId) params.set('supplier_id', filters.supplierId)
  if (filters?.status) params.set('status', filters.status)
  
  const url = `/api/milk-collections${params.toString() ? '?' + params.toString() : ''}`
  console.log('Fetching collections from:', url);
  
  return useSWR<MilkCollection[]>(
    url,
    fetcher,
    { refreshInterval: 10000 }
  )
}

// Suppliers
export function useSuppliers(search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return useSWR<Supplier[]>(`/api/suppliers${params}`, fetcher)
}

// Shops
export function useShops(search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return useSWR<Shop[]>(`/api/shops${params}`, fetcher)
}

// Products
export function useProducts() {
  return useSWR<Product[]>('/api/products', fetcher)
}

// Batches
export function useBatches(filters?: { date?: string; status?: string }) {
  const params = new URLSearchParams()
  if (filters?.date) params.set('date', filters.date)
  if (filters?.status) params.set('status', filters.status)
  
  return useSWR<Batch[]>(`/api/batches?${params.toString()}`, fetcher)
}

// Inventory
export function useInventory(filters?: { productId?: string; locationId?: string }) {
  const params = new URLSearchParams()
  if (filters?.productId) params.set('product_id', filters.productId)
  if (filters?.locationId) params.set('location_id', filters.locationId)
  
  return useSWR<InventoryItem[]>(`/api/inventory?${params.toString()}`, fetcher)
}

// Routes
export function useRoutes(filters?: { agentId?: string; date?: string }) {
  const params = new URLSearchParams()
  if (filters?.agentId) params.set('agent_id', filters.agentId)
  if (filters?.date) params.set('date', filters.date)
  
  return useSWR<Route[]>(`/api/routes?${params.toString()}`, fetcher)
}

// Deliveries
export function useDeliveries(filters?: { routeId?: string; status?: string }) {
  const params = new URLSearchParams()
  if (filters?.routeId) params.set('route_id', filters.routeId)
  if (filters?.status) params.set('status', filters.status)
  
  return useSWR<Delivery[]>(`/api/deliveries?${params.toString()}`, fetcher, {
    refreshInterval: 15000
  })
}

// Ledger Entries
export function useLedgerEntries(filters?: { fromDate?: string; toDate?: string }) {
  const params = new URLSearchParams()
  if (filters?.fromDate) params.set('from_date', filters.fromDate)
  if (filters?.toDate) params.set('to_date', filters.toDate)
  
  return useSWR<LedgerEntry[]>(`/api/ledger?${params.toString()}`, fetcher)
}

// Audit Logs
export function useAuditLogs(filters?: { entityType?: string; userId?: string }) {
  const params = new URLSearchParams()
  if (filters?.entityType) params.set('entity_type', filters.entityType)
  if (filters?.userId) params.set('user_id', filters.userId)
  
  return useSWR<AuditLog[]>(`/api/audit-logs?${params.toString()}`, fetcher)
}

// Users
export function useUsers(role?: string) {
  const params = role ? `?role=${role}` : ''
  return useSWR<AppUser[]>(`/api/users${params}`, fetcher)
}

// Settings
export function useSettings() {
  return useSWR('/api/settings', fetcher)
}

// Note: Real-time subscriptions are not available with AWS RDS.
// If you need real-time updates, consider using polling with SWR's refreshInterval option.
// Example: useSWR('/api/endpoint', fetcher, { refreshInterval: 5000 })
