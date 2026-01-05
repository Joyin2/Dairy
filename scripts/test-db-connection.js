/**
 * Database Connection Test Script
 * 
 * This script tests the connection to AWS RDS PostgreSQL database
 * Run with: node scripts/test-db-connection.js
 */

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

async function testConnection() {
  console.log('\n🔍 Testing AWS RDS Database Connection...\n')
  
  // Check environment variables
  console.log('📋 Configuration:')
  console.log(`   Host: ${process.env.AWS_RDS_HOST || '❌ Missing'}`)
  console.log(`   Port: ${process.env.AWS_RDS_PORT || '5432'}`)
  console.log(`   Database: ${process.env.AWS_RDS_DATABASE || '❌ Missing'}`)
  console.log(`   User: ${process.env.AWS_RDS_USER || '❌ Missing'}`)
  console.log(`   Password: ${process.env.AWS_RDS_PASSWORD ? '✅ Set' : '❌ Missing'}\n`)
  
  if (!process.env.AWS_RDS_HOST || !process.env.AWS_RDS_DATABASE || !process.env.AWS_RDS_USER || !process.env.AWS_RDS_PASSWORD) {
    console.error('❌ Missing required environment variables!')
    process.exit(1)
  }
  
  const pool = new Pool({
    host: process.env.AWS_RDS_HOST,
    port: parseInt(process.env.AWS_RDS_PORT || '5432'),
    database: process.env.AWS_RDS_DATABASE,
    user: process.env.AWS_RDS_USER,
    password: process.env.AWS_RDS_PASSWORD,
    connectionTimeoutMillis: 10000,
    ssl: process.env.AWS_RDS_SSL === 'true' ? { 
      rejectUnauthorized: false 
    } : false,
  })
  
  let client
  
  try {
    console.log('🔌 Attempting to connect...')
    client = await pool.connect()
    console.log('✅ Connection successful!\n')
    
    // Test query
    console.log('📊 Running test query...')
    const result = await client.query('SELECT NOW() as current_time, version() as version')
    console.log('✅ Query successful!')
    console.log(`   Current Time: ${result.rows[0].current_time}`)
    console.log(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}\n`)
    
    // Check tables
    console.log('📚 Checking database tables...')
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found. You need to run the database schema.')
      console.log('   Run: psql -h <host> -U <user> -d <database> -f database-schema.sql\n')
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} tables:`)
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`)
      })
      console.log('')
    }
    
    console.log('✅ All checks passed! Database is ready.\n')
    
  } catch (error) {
    console.error('❌ Connection failed!')
    console.error(`   Error: ${error.message}\n`)
    
    if (error.message.includes('timeout')) {
      console.log('💡 Troubleshooting connection timeout:')
      console.log('   1. Check AWS RDS Security Group - Allow inbound PostgreSQL (port 5432) from your IP')
      console.log('   2. Check AWS RDS is "Publicly Accessible"')
      console.log('   3. Check VPC Network ACLs allow traffic')
      console.log('   4. Verify your IP address hasn\'t changed')
      console.log('   5. Try connecting from AWS EC2 instance in same VPC\n')
    } else if (error.message.includes('password')) {
      console.log('💡 Password authentication failed:')
      console.log('   1. Verify AWS_RDS_PASSWORD in .env.local')
      console.log('   2. Check database user exists and has correct permissions')
      console.log('   3. Reset password in AWS RDS console if needed\n')
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Host not found:')
      console.log('   1. Verify AWS_RDS_HOST is correct')
      console.log('   2. Check RDS instance is running (not stopped)')
      console.log('   3. Ensure endpoint is correct in AWS console\n')
    }
    
    process.exit(1)
  } finally {
    if (client) {
      client.release()
    }
    await pool.end()
  }
}

testConnection()
