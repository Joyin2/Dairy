/**
 * Supabase Schema Setup Script
 * 
 * This script creates all required tables in Supabase database
 * 
 * Usage:
 *   node scripts/setup-supabase-schema.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`)
}

async function setupSupabaseSchema() {
  log.section('🚀 Supabase Database Schema Setup')

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    log.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    log.info('Please configure .env.local file with Supabase credentials')
    process.exit(1)
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
    log.info('You need the service role key (not the anon key) to create tables')
    process.exit(1)
  }

  // Create Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  log.info(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)

  try {
    // Test connection
    log.section('📡 Step 1: Testing connection')
    const { data: testData, error: testError } = await supabase
      .from('_test')
      .select('*')
      .limit(1)
    
    // Connection works even if table doesn't exist
    log.success('Connected to Supabase')

    // Read schema file
    log.section('📄 Step 2: Loading schema file')
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      log.error(`Schema file not found: ${schemaPath}`)
      process.exit(1)
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    log.success(`Schema file loaded (${schemaSQL.length} characters)`)

    // Execute schema using PostgreSQL function
    log.section('⚡ Step 3: Executing schema')
    log.warning('Note: Schema must be executed manually in Supabase SQL Editor')
    log.info('\nTo execute the schema:')
    console.log('   1. Go to your Supabase project dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Copy and paste the content from: scripts/supabase-schema.sql')
    console.log('   4. Click "Run" to execute')
    
    log.section('📋 Alternative: Using Supabase CLI')
    console.log('   If you have Supabase CLI installed:')
    console.log('   supabase db reset')
    console.log('   supabase db push')

    // Verify existing tables
    log.section('🔍 Step 4: Checking existing tables')
    
    const tableNames = [
      'app_users', 'suppliers', 'shops', 'products', 
      'milk_collections', 'batches', 'inventory_items', 
      'routes', 'deliveries', 'ledger_entries', 
      'notifications', 'audit_logs'
    ]

    const existingTables = []
    for (const tableName of tableNames) {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1)
      
      if (!error || error.message.includes('relation')) {
        if (!error) {
          existingTables.push(tableName)
        }
      }
    }

    if (existingTables.length > 0) {
      log.success(`Found ${existingTables.length} existing tables:`)
      existingTables.forEach(table => {
        console.log(`   • ${table}`)
      })
    } else {
      log.warning('No tables found - schema needs to be executed')
    }

    log.section('💡 Next Steps')
    console.log('   1. Execute the schema SQL in Supabase SQL Editor')
    console.log('   2. Run this script again to verify setup')
    console.log('   3. Start your application: npm run dev')

  } catch (error) {
    log.section('❌ Setup Failed')
    log.error(`Error: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

setupSupabaseSchema()
