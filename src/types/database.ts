// Database types based on the schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type RoleType = 'company_admin' | 'manufacturer' | 'delivery_agent'
export type CollectionQC = 'pending' | 'approved' | 'rejected'
export type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'partial' | 'returned' | 'failed'

export interface AppUser {
  id: string
  auth_uid?: string
  email?: string
  phone?: string
  name?: string
  role: RoleType
  metadata?: Json
  status?: string
  created_at?: string
  last_login?: string
}

export interface Supplier {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  bank_account?: Json
  kyc_status?: string
  auto_receipt_pref?: boolean
  created_by?: string
  created_at?: string
}

export interface Shop {
  id: string
  name: string
  contact?: string
  address?: string
  metadata?: Json
  created_at?: string
}

export interface Product {
  id: string
  sku?: string
  name: string
  uom?: string
  shelf_life_days?: number
  created_at?: string
}

export interface MilkCollection {
  id: string
  supplier_id?: string
  operator_user_id?: string
  qty_liters: number
  fat?: number
  snf?: number
  gps?: any
  photo_url?: string
  qc_status?: CollectionQC
  status?: string
  metadata?: Json
  created_at?: string
  // Joined data
  supplier?: Supplier
  operator?: AppUser
}

export interface Batch {
  id: string
  batch_code?: string
  production_date?: string
  input_collection_ids?: string[]
  product_id?: string
  yield_qty: number
  expiry_date?: string
  qc_status?: CollectionQC
  created_by?: string
  created_at?: string
  // Joined data
  product?: Product
  creator?: AppUser
}

export interface InventoryItem {
  id: string
  product_id?: string
  batch_id?: string
  location_id?: string
  qty: number
  uom?: string
  metadata?: Json
  last_updated?: string
  // Joined data
  product?: Product
  batch?: Batch
}

export interface Route {
  id: string
  name?: string
  agent_id?: string
  date?: string
  stops?: Json
  created_at?: string
  // Joined data
  agent?: AppUser
}

export interface Delivery {
  id: string
  route_id?: string
  shop_id?: string
  items?: Json
  status?: DeliveryStatus
  expected_qty?: number
  delivered_qty?: number
  proof_url?: string
  signature_url?: string
  collected_amount?: number
  payment_mode?: string
  created_at?: string
  delivered_at?: string
  // Joined data
  route?: Route
  shop?: Shop
}

export interface LedgerEntry {
  id: string
  from_account?: string
  to_account?: string
  amount: number
  mode?: string
  reference?: string
  receipt_url?: string
  created_by?: string
  created_at?: string
  cleared?: boolean
  // Joined data
  creator?: AppUser
}

export interface Notification {
  id: string
  to?: string
  channel?: string
  status?: string
  message?: string
  metadata?: Json
  sent_at?: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action_type?: string
  entity_type?: string
  entity_id?: string
  meta?: Json
  created_at?: string
  // Joined data
  user?: AppUser
}

// Dashboard Stats Types
export interface DashboardStats {
  todayCollections: {
    count: number
    liters: number
    trend: { value: number; isPositive: boolean }
  }
  pendingDeliveries: {
    count: number
    routes: number
    trend: { value: number; isPositive: boolean }
  }
  stockLevel: {
    products: number
    totalLiters: number
    trend: { value: number; isPositive: boolean }
  }
  cashInHand: {
    amount: number
    pending: number
    trend: { value: number; isPositive: boolean }
  }
}
