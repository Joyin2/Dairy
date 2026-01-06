-- ============================================
-- Dairy Management System - Supabase Schema
-- ============================================
-- This script creates all tables needed for the dairy management system
-- Run this on your Supabase database to set up the schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. App Users Table (with Supabase Auth integration)
-- ============================================
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_uid UUID, -- Links to Supabase auth.users.id
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('company_admin', 'manufacturer', 'delivery_agent')),
    metadata JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for app_users
CREATE INDEX IF NOT EXISTS idx_app_users_auth_uid ON app_users(auth_uid);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);
CREATE INDEX IF NOT EXISTS idx_app_users_status ON app_users(status);

-- ============================================
-- 2. Suppliers Table
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    bank_account JSONB,
    kyc_status VARCHAR(50) DEFAULT 'pending',
    auto_receipt_pref BOOLEAN DEFAULT false,
    created_by UUID REFERENCES app_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_created_by ON suppliers(created_by);

-- ============================================
-- 3. Shops Table
-- ============================================
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(50),
    address TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Products Table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    uom VARCHAR(50) DEFAULT 'liters',
    shelf_life_days INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ============================================
-- 5. Milk Collections Table
-- ============================================
CREATE TABLE IF NOT EXISTS milk_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id),
    operator_user_id UUID REFERENCES app_users(id),
    qty_liters DECIMAL(10, 2) NOT NULL,
    fat DECIMAL(5, 2),
    snf DECIMAL(5, 2),
    gps JSONB,
    photo_url TEXT,
    qc_status VARCHAR(20) DEFAULT 'pending' CHECK (qc_status IN ('pending', 'approved', 'rejected')),
    status VARCHAR(20) DEFAULT 'collected',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milk_collections_supplier ON milk_collections(supplier_id);
CREATE INDEX IF NOT EXISTS idx_milk_collections_operator ON milk_collections(operator_user_id);
CREATE INDEX IF NOT EXISTS idx_milk_collections_date ON milk_collections(created_at);

-- ============================================
-- 6. Batches Table
-- ============================================
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code VARCHAR(100) UNIQUE,
    production_date DATE,
    input_collection_ids UUID[],
    product_id UUID REFERENCES products(id),
    yield_qty DECIMAL(10, 2) NOT NULL,
    expiry_date DATE,
    qc_status VARCHAR(20) DEFAULT 'pending' CHECK (qc_status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES app_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batches_product ON batches(product_id);
CREATE INDEX IF NOT EXISTS idx_batches_code ON batches(batch_code);
CREATE INDEX IF NOT EXISTS idx_batches_date ON batches(production_date);

-- ============================================
-- 7. Inventory Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    batch_id UUID REFERENCES batches(id),
    location_id UUID,
    qty DECIMAL(10, 2) NOT NULL DEFAULT 0,
    uom VARCHAR(50) DEFAULT 'liters',
    metadata JSONB,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batch ON inventory_items(batch_id);

-- ============================================
-- 8. Routes Table
-- ============================================
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    agent_id UUID REFERENCES app_users(id),
    date DATE,
    stops JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_agent ON routes(agent_id);
CREATE INDEX IF NOT EXISTS idx_routes_date ON routes(date);

-- ============================================
-- 9. Deliveries Table
-- ============================================
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id),
    shop_id UUID REFERENCES shops(id),
    items JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'partial', 'returned', 'failed')),
    expected_qty DECIMAL(10, 2),
    delivered_qty DECIMAL(10, 2),
    proof_url TEXT,
    signature_url TEXT,
    collected_amount DECIMAL(10, 2),
    payment_mode VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_route ON deliveries(route_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_shop ON deliveries(shop_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

-- ============================================
-- 10. Ledger Entries Table
-- ============================================
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_account VARCHAR(255),
    to_account VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    mode VARCHAR(50),
    reference VARCHAR(255),
    receipt_url TEXT,
    created_by UUID REFERENCES app_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cleared BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ledger_from ON ledger_entries(from_account);
CREATE INDEX IF NOT EXISTS idx_ledger_to ON ledger_entries(to_account);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON ledger_entries(created_at);

-- ============================================
-- 11. Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_user VARCHAR(255),
    channel VARCHAR(50) DEFAULT 'sms',
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    metadata JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(to_user);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- ============================================
-- 12. Audit Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id),
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(created_at);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on app_users
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile" ON app_users
    FOR SELECT USING (auth_uid = auth.uid());

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile" ON app_users
    FOR UPDATE USING (auth_uid = auth.uid());

-- Policy: Company admins can view all users
CREATE POLICY "Admins can view all users" ON app_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE auth_uid = auth.uid() AND role = 'company_admin'
        )
    );

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milk_collections_updated_at BEFORE UPDATE ON milk_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert a default admin user (you'll need to create this user in Supabase Auth first)
-- The auth_uid should match the user ID from Supabase Auth
-- This is just a placeholder - update with real auth_uid after creating user in Supabase Auth

COMMENT ON TABLE app_users IS 'Application users linked to Supabase Auth';
COMMENT ON TABLE suppliers IS 'Milk suppliers providing raw materials';
COMMENT ON TABLE shops IS 'Retail shops receiving deliveries';
COMMENT ON TABLE products IS 'Dairy products manufactured';
COMMENT ON TABLE milk_collections IS 'Daily milk collection records';
COMMENT ON TABLE batches IS 'Production batches';
COMMENT ON TABLE inventory_items IS 'Current inventory levels';
COMMENT ON TABLE routes IS 'Delivery routes';
COMMENT ON TABLE deliveries IS 'Delivery records';
COMMENT ON TABLE ledger_entries IS 'Financial transactions';
COMMENT ON TABLE notifications IS 'System notifications';
COMMENT ON TABLE audit_logs IS 'Audit trail for all operations';
