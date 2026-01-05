/**
 * Database Setup Script for Production & Development
 * 
 * This script will:
 * 1. Create the dairy_management database if it doesn't exist
 * 2. Load the database schema from database-schema.sql
 * 3. Verify the setup
 * 
 * Usage:
 *   node scripts/setup-database.js
 */

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
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

async function setupDatabase() {
  log.section('🚀 Database Setup - Production & Development Ready')

  // Validate environment variables
  const requiredEnvVars = ['AWS_RDS_HOST', 'AWS_RDS_USER', 'AWS_RDS_PASSWORD']
  const missing = requiredEnvVars.filter(v => !process.env[v])
  
  if (missing.length > 0) {
    log.error(`Missing required environment variables: ${missing.join(', ')}`)
    log.info('Please configure .env.local file with AWS RDS credentials')
    process.exit(1)
  }

  const config = {
    host: process.env.AWS_RDS_HOST,
    port: parseInt(process.env.AWS_RDS_PORT || '5432'),
    user: process.env.AWS_RDS_USER,
    password: process.env.AWS_RDS_PASSWORD,
    connectionTimeoutMillis: 10000,
    ssl: process.env.AWS_RDS_SSL === 'true' ? { 
      rejectUnauthorized: false 
    } : false,
  }

  const targetDatabase = process.env.AWS_RDS_DATABASE || 'dairy_management'

  log.info(`Target Database: ${targetDatabase}`)
  log.info(`Host: ${config.host}`)
  log.info(`Port: ${config.port}`)
  log.info(`SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`)

  // Step 1: Connect to default 'postgres' database
  log.section('📡 Step 1: Connecting to PostgreSQL server')
  
  const defaultPool = new Pool({
    ...config,
    database: 'postgres'
  })

  let client
  
  try {
    client = await defaultPool.connect()
    log.success('Connected to PostgreSQL server')

    // Step 2: Check if target database exists
    log.section('🔍 Step 2: Checking if database exists')
    
    const dbCheckResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDatabase]
    )

    if (dbCheckResult.rows.length > 0) {
      log.warning(`Database '${targetDatabase}' already exists`)
      const shouldContinue = true // In production, you might want to prompt here
      if (!shouldContinue) {
        log.info('Exiting without changes')
        process.exit(0)
      }
    } else {
      // Step 3: Create database
      log.section('🔨 Step 3: Creating database')
      
      await client.query(`CREATE DATABASE ${targetDatabase}`)
      log.success(`Database '${targetDatabase}' created successfully`)
    }

    client.release()
    await defaultPool.end()

    // Step 4: Connect to the target database
    log.section('📡 Step 4: Connecting to target database')
    
    const targetPool = new Pool({
      ...config,
      database: targetDatabase
    })

    const targetClient = await targetPool.connect()
    log.success(`Connected to '${targetDatabase}' database`)

    // Step 5: Load schema file
    log.section('📄 Step 5: Loading database schema')
    
    const schemaPath = path.join(process.cwd(), 'database-schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      log.error(`Schema file not found: ${schemaPath}`)
      log.info('Please ensure database-schema.sql exists in the project root')
      process.exit(1)
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    log.info(`Schema file loaded (${schemaSQL.length} characters)`)

    // Step 6: Execute schema
    log.section('⚡ Step 6: Executing schema')
    
    try {
      await targetClient.query(schemaSQL)
      log.success('Schema executed successfully')
    } catch (schemaError) {
      if (schemaError.message.includes('already exists')) {
        log.warning('Some objects already exist (this is normal if re-running)')
      } else {
        throw schemaError
      }
    }

    // Step 7: Verify tables
    log.section('✅ Step 7: Verifying database setup')
    
    const tablesResult = await targetClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)

    if (tablesResult.rows.length === 0) {
      log.error('No tables found after schema execution')
      process.exit(1)
    }

    log.success(`Found ${tablesResult.rows.length} tables:`)
    tablesResult.rows.forEach(row => {
      console.log(`   • ${row.table_name}`)
    })

    // Step 8: Check PostGIS extension (if needed)
    log.section('🗺️  Step 8: Checking extensions')
    
    const extensionsResult = await targetClient.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('postgis', 'uuid-ossp')
    `)

    if (extensionsResult.rows.length > 0) {
      log.success('Extensions installed:')
      extensionsResult.rows.forEach(row => {
        console.log(`   • ${row.extname} (${row.extversion})`)
      })
    } else {
      log.info('No special extensions detected')
    }

    targetClient.release()
    await targetPool.end()

    // Success summary
    log.section('🎉 Database Setup Complete!')
    log.success(`Database '${targetDatabase}' is ready for use`)
    log.success(`Tables created: ${tablesResult.rows.length}`)
    log.info('\nYou can now start your application with: npm run dev')

  } catch (error) {
    log.section('❌ Setup Failed')
    log.error(`Error: ${error.message}`)
    
    if (error.message.includes('timeout')) {
      log.warning('\nTroubleshooting connection timeout:')
      console.log('   1. Check AWS RDS Security Group allows your IP on port 5432')
      console.log('   2. Verify RDS instance is "Publicly Accessible" (for development)')
      console.log('   3. Check VPC Network ACLs allow traffic')
      console.log('   4. Ensure your IP hasn\'t changed')
    } else if (error.message.includes('password')) {
      log.warning('\nPassword authentication failed:')
      console.log('   1. Verify AWS_RDS_PASSWORD in .env.local')
      console.log('   2. Check database user exists with correct permissions')
    } else if (error.message.includes('no pg_hba.conf')) {
      log.warning('\nSSL/TLS required:')
      console.log('   1. Set AWS_RDS_SSL=true in .env.local')
      console.log('   2. AWS RDS requires encrypted connections')
    }
    
    process.exit(1)
  }
}

// Run the setup
setupDatabase()
