import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all settings
export async function GET(request: NextRequest) {
  try {
    // Get all settings from database
    const settings = await db.custom(
      'SELECT * FROM app_settings ORDER BY category, key',
      []
    )

    // Group settings by category
    const grouped: any = {}
    settings.forEach((setting: any) => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {}
      }
      grouped[setting.category][setting.key] = {
        value: setting.value,
        description: setting.description,
        data_type: setting.data_type,
        updated_at: setting.updated_at
      }
    })

    return NextResponse.json(grouped)
  } catch (error: any) {
    console.error('Settings fetch error:', error)
    
    // If table doesn't exist, return default settings
    if (error.message?.includes('relation "app_settings" does not exist')) {
      return NextResponse.json(getDefaultSettings())
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT update settings (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, settings } = body

    if (!category || !settings) {
      return NextResponse.json(
        { error: 'Category and settings are required' },
        { status: 400 }
      )
    }

    const updates: any[] = []

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      const updateQuery = `
        INSERT INTO app_settings (category, key, value, updated_at)
        VALUES ($1, $2, $3, now())
        ON CONFLICT (category, key)
        DO UPDATE SET value = $3, updated_at = now()
        RETURNING *
      `
      
      const result = await db.custom(
        updateQuery,
        [category, key, typeof value === 'object' ? JSON.stringify(value) : String(value)]
      )
      
      updates.push(result[0])
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      message: `Updated ${updates.length} settings in ${category}`
    })
  } catch (error: any) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// POST create or initialize settings table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'initialize') {
      // Create settings table if it doesn't exist
      await db.custom(`
        CREATE TABLE IF NOT EXISTS app_settings (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT,
          description TEXT,
          data_type TEXT DEFAULT 'string',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(category, key)
        )
      `, [])

      // Insert default settings
      const defaults = getDefaultSettingsArray()
      for (const setting of defaults) {
        await db.custom(`
          INSERT INTO app_settings (category, key, value, description, data_type)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (category, key) DO NOTHING
        `, [setting.category, setting.key, setting.value, setting.description, setting.data_type])
      }

      return NextResponse.json({
        success: true,
        message: 'Settings table initialized with default values'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Settings initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize settings' },
      { status: 500 }
    )
  }
}

// Helper function to get default settings
function getDefaultSettings() {
  return {
    general: {
      company_name: { value: 'Dairy Management Co.', description: 'Company name', data_type: 'string' },
      business_email: { value: 'admin@dairy.com', description: 'Business email', data_type: 'email' },
      business_phone: { value: '+91 98765 43210', description: 'Business phone', data_type: 'tel' },
      address: { value: '123 Dairy Lane, Meerut, UP', description: 'Business address', data_type: 'text' },
      timezone: { value: 'Asia/Kolkata', description: 'Timezone', data_type: 'string' },
      currency: { value: 'INR', description: 'Currency code', data_type: 'string' },
      language: { value: 'en', description: 'Default language', data_type: 'string' }
    },
    pricing: {
      base_price_per_liter: { value: '50', description: 'Base price per liter', data_type: 'number' },
      fat_premium_percent: { value: '5', description: 'FAT premium percentage', data_type: 'number' },
      snf_premium_percent: { value: '3', description: 'SNF premium percentage', data_type: 'number' },
      gst_rate: { value: '5', description: 'GST rate percentage', data_type: 'number' },
      tax_method: { value: 'inclusive', description: 'Tax calculation method', data_type: 'string' }
    },
    notifications: {
      email_enabled: { value: 'true', description: 'Enable email notifications', data_type: 'boolean' },
      sms_enabled: { value: 'true', description: 'Enable SMS notifications', data_type: 'boolean' },
      push_enabled: { value: 'false', description: 'Enable push notifications', data_type: 'boolean' },
      low_stock_alerts: { value: 'true', description: 'Low stock alerts', data_type: 'boolean' },
      payment_reminders: { value: 'true', description: 'Payment reminders', data_type: 'boolean' },
      collection_receipts: { value: 'true', description: 'Auto-send collection receipts', data_type: 'boolean' }
    },
    sms: {
      provider: { value: 'twilio', description: 'SMS provider', data_type: 'string' },
      api_key: { value: '', description: 'SMS API key', data_type: 'password' },
      sender_id: { value: 'DAIRY', description: 'SMS sender ID', data_type: 'string' },
      template_receipt: { value: 'Your milk collection receipt: {amount} L', description: 'Receipt SMS template', data_type: 'text' }
    },
    email: {
      provider: { value: 'smtp', description: 'Email provider', data_type: 'string' },
      smtp_host: { value: 'smtp.gmail.com', description: 'SMTP host', data_type: 'string' },
      smtp_port: { value: '587', description: 'SMTP port', data_type: 'number' },
      smtp_user: { value: '', description: 'SMTP username', data_type: 'string' },
      smtp_password: { value: '', description: 'SMTP password', data_type: 'password' },
      from_email: { value: 'noreply@dairy.com', description: 'From email address', data_type: 'email' },
      from_name: { value: 'Dairy Management', description: 'From name', data_type: 'string' }
    },
    security: {
      two_factor_enabled: { value: 'false', description: 'Enable 2FA', data_type: 'boolean' },
      force_password_reset: { value: 'true', description: 'Force password reset every 90 days', data_type: 'boolean' },
      session_timeout: { value: '30', description: 'Session timeout in minutes', data_type: 'number' },
      max_login_attempts: { value: '5', description: 'Max login attempts before lockout', data_type: 'number' },
      password_min_length: { value: '8', description: 'Minimum password length', data_type: 'number' }
    },
    backup: {
      auto_backup_enabled: { value: 'true', description: 'Enable automatic backups', data_type: 'boolean' },
      backup_frequency: { value: 'daily', description: 'Backup frequency', data_type: 'string' },
      backup_retention_days: { value: '30', description: 'Backup retention in days', data_type: 'number' },
      backup_storage: { value: 's3', description: 'Backup storage provider', data_type: 'string' }
    },
    payment_gateway: {
      enabled: { value: 'false', description: 'Enable payment gateway', data_type: 'boolean' },
      provider: { value: 'razorpay', description: 'Payment gateway provider', data_type: 'string' },
      api_key: { value: '', description: 'Payment gateway API key', data_type: 'password' },
      api_secret: { value: '', description: 'Payment gateway API secret', data_type: 'password' },
      webhook_secret: { value: '', description: 'Webhook secret', data_type: 'password' }
    },
    features: {
      enable_qr_scanning: { value: 'true', description: 'Enable QR code scanning', data_type: 'boolean' },
      enable_gps_tracking: { value: 'true', description: 'Enable GPS tracking', data_type: 'boolean' },
      enable_offline_mode: { value: 'false', description: 'Enable offline mode', data_type: 'boolean' },
      enable_multi_language: { value: 'false', description: 'Enable multi-language support', data_type: 'boolean' },
      enable_advanced_reports: { value: 'true', description: 'Enable advanced reporting', data_type: 'boolean' }
    },
    inventory: {
      low_stock_threshold: { value: '100', description: 'Low stock threshold (liters)', data_type: 'number' },
      enable_auto_reorder: { value: 'false', description: 'Enable automatic reorder', data_type: 'boolean' },
      reorder_quantity: { value: '500', description: 'Reorder quantity (liters)', data_type: 'number' }
    }
  }
}

function getDefaultSettingsArray() {
  const defaults = getDefaultSettings()
  const array: any[] = []
  
  Object.entries(defaults).forEach(([category, settings]) => {
    Object.entries(settings).forEach(([key, config]) => {
      array.push({
        category,
        key,
        value: config.value,
        description: config.description,
        data_type: config.data_type
      })
    })
  })
  
  return array
}
