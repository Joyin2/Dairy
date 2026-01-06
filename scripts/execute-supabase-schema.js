/**
 * Execute Supabase Schema via Direct PostgreSQL Connection
 * 
 * This script executes the schema using pg library
 * 
 * Usage:
 *   node scripts/execute-supabase-schema.js
 */

require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
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

async function executeSchema() {
  log.section('🚀 Executing Supabase Schema')

  // Parse DATABASE_URL
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    log.error('Missing DATABASE_URL environment variable')
    process.exit(1)
  }

  log.info('Database URL found')

  // Create PostgreSQL client
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    // Connect
    log.section('📡 Step 1: Connecting to database')
    await client.connect()
    log.success('Connected to Supabase PostgreSQL')

    // Read schema file
    log.section('📄 Step 2: Loading schema file')
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      log.error(`Schema file not found: ${schemaPath}`)
      process.exit(1)
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    log.success(`Schema file loaded (${schemaSQL.length} characters)`)

    // Execute schema
    log.section('⚡ Step 3: Executing schema')
    log.info('This may take a moment...')
    
    await client.query(schemaSQL)
    log.success('Schema executed successfully!')

    // Verify tables
    log.section('🔍 Step 4: Verifying tables')
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)

    log.success(`Found ${result.rows.length} tables:`)
    result.rows.forEach(row => {
      console.log(`   • ${row.table_name}`)
    })

    // Close connection
    await client.end()

    log.section('🎉 Setup Complete!')
    log.success('All tables created successfully')
    log.info('\nYou can now:')
    console.log('   1. Start your application: npm run dev')
    console.log('   2. Create admin users via signup')
    console.log('   3. Access admin panel at http://localhost:3000/admin')

  } catch (error) {
    log.section('❌ Setup Failed')
    log.error(`Error: ${error.message}`)
    
    if (error.message.includes('already exists')) {
      log.warning('\nSome objects already exist (this is normal if re-running)')
      log.info('Schema setup may have completed successfully')
    } else {
      console.error('\nFull error:', error)
    }
    
    await client.end()
    process.exit(1)
  }
}

executeSchema()
