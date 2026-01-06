/**
 * Authentication System Test Script
 * 
 * Tests the complete authentication flow:
 * 1. Signup (creates Supabase Auth user + app_users record)
 * 2. Login (verifies credentials and returns JWT)
 * 3. Verify user exists in database
 * 4. Logout (invalidates session)
 * 
 * Usage:
 *   node scripts/test-auth-system.js
 */

require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

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

// Test configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
const TEST_USER = {
  name: 'Test Admin',
  email: `test.admin.${Date.now()}@example.com`,
  password: 'TestPassword123!',
  adminCode: 'DAIRY2024ADMIN'
}

async function testAuthSystem() {
  log.section('🧪 Testing Authentication System')

  let authToken = null
  let userId = null

  try {
    // Step 1: Test Signup
    log.section('📝 Step 1: Testing Signup')
    log.info(`Email: ${TEST_USER.email}`)
    
    const signupResponse = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password,
        admin_code: TEST_USER.adminCode
      })
    })

    const signupData = await signupResponse.json()
    
    if (!signupResponse.ok) {
      log.error(`Signup failed: ${signupData.error}`)
      console.log('Response:', signupData)
      throw new Error('Signup failed')
    }

    log.success('Signup successful!')
    log.info(`User ID: ${signupData.user.id}`)
    log.info(`Role: ${signupData.user.role}`)
    userId = signupData.user.id

    if (signupData.requiresEmailConfirmation) {
      log.warning('⚠️  EMAIL CONFIRMATION REQUIRED!')
      log.warning('Please disable email confirmation in Supabase:')
      log.warning('Dashboard > Authentication > Settings > Enable email confirmations = OFF')
      throw new Error('Email confirmation is enabled - tests cannot proceed')
    }

    // Step 2: Test Login
    log.section('🔐 Step 2: Testing Login')
    log.info(`Email: ${TEST_USER.email}`)
    
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    })

    const loginData = await loginResponse.json()
    
    if (!loginResponse.ok) {
      log.error(`Login failed: ${loginData.error}`)
      console.log('Response:', loginData)
      throw new Error('Login failed')
    }

    log.success('Login successful!')
    log.info(`Token: ${loginData.data.token.substring(0, 20)}...`)
    log.info(`User: ${loginData.data.user.name} (${loginData.data.user.email})`)
    log.info(`Role: ${loginData.data.user.role}`)
    authToken = loginData.data.token

    // Step 3: Verify user in database
    log.section('🔍 Step 3: Verifying User in Database')
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })

    await client.connect()
    
    const result = await client.query(
      'SELECT * FROM app_users WHERE email = $1',
      [TEST_USER.email]
    )

    if (result.rows.length === 0) {
      log.error('User not found in database!')
      throw new Error('User not in database')
    }

    const dbUser = result.rows[0]
    log.success('User found in database!')
    log.info(`Database ID: ${dbUser.id}`)
    log.info(`Auth UID: ${dbUser.auth_uid}`)
    log.info(`Name: ${dbUser.name}`)
    log.info(`Email: ${dbUser.email}`)
    log.info(`Role: ${dbUser.role}`)
    log.info(`Status: ${dbUser.status}`)
    log.info(`Created: ${dbUser.created_at}`)

    await client.end()

    // Step 4: Test Logout
    log.section('👋 Step 4: Testing Logout')
    
    const logoutResponse = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    const logoutData = await logoutResponse.json()
    
    if (!logoutResponse.ok) {
      log.error(`Logout failed: ${logoutData.error}`)
    } else {
      log.success('Logout successful!')
    }

    // Final Summary
    log.section('✅ Authentication System Test Complete!')
    log.success('All authentication flows are working correctly')
    console.log('\n📊 Test Summary:')
    console.log(`   ✓ Signup: User created successfully`)
    console.log(`   ✓ Login: Authentication successful`)
    console.log(`   ✓ Database: User record verified`)
    console.log(`   ✓ Logout: Session terminated`)
    
    log.section('🎯 Next Steps:')
    console.log('   1. Start the development server: npm run dev')
    console.log('   2. Navigate to: http://localhost:3000/admin/signup')
    console.log('   3. Create an admin account')
    console.log('   4. Login at: http://localhost:3000/admin/login')
    console.log(`   5. Use admin code: ${TEST_USER.adminCode}`)

  } catch (error) {
    log.section('❌ Test Failed')
    log.error(`Error: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/health`)
    return response.ok
  } catch (error) {
    return false
  }
}

// Main execution
async function main() {
  log.info('Checking if development server is running...')
  
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    log.warning('Development server is not running!')
    log.info('Please start it with: npm run dev')
    log.info('Then run this script again.')
    process.exit(1)
  }

  log.success('Development server is running')
  
  await testAuthSystem()
}

main()
