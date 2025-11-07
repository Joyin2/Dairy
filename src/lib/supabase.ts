import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      app_users: any
      suppliers: any
      shops: any
      products: any
      milk_collections: any
      batches: any
      inventory_items: any
      routes: any
      deliveries: any
      ledger_entries: any
      notifications: any
      audit_logs: any
    }
  }
}
