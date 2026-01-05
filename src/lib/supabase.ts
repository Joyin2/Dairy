// This file is kept for backward compatibility but is no longer used
// All database operations now use AWS RDS via src/lib/db.ts

import type {
  AppUser,
  Supplier,
  Shop,
  Product,
  MilkCollection,
  Batch,
  InventoryItem,
  Route,
  Delivery,
  LedgerEntry,
  Notification,
  AuditLog
} from '@/types/database'

// Legacy compatibility - always return false since we're not using Supabase
export const hasSupabaseConfig = () => {
  return false
}

// Database type
export type Database = {
  public: {
    Tables: {
      app_users: { Row: AppUser }
      suppliers: { Row: Supplier }
      shops: { Row: Shop }
      products: { Row: Product }
      milk_collections: { Row: MilkCollection }
      batches: { Row: Batch }
      inventory_items: { Row: InventoryItem }
      routes: { Row: Route }
      deliveries: { Row: Delivery }
      ledger_entries: { Row: LedgerEntry }
      notifications: { Row: Notification }
      audit_logs: { Row: AuditLog }
    }
  }
}

export type {
  AppUser,
  Supplier,
  Shop,
  Product,
  MilkCollection,
  Batch,
  InventoryItem,
  Route,
  Delivery,
  LedgerEntry,
  Notification,
  AuditLog
}
