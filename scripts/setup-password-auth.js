const { Client } = require('pg')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

async function setupPasswordAuth() {
  const client = new Client({
    host: process.env.AWS_RDS_HOST,
    port: parseInt(process.env.AWS_RDS_PORT || '5432'),
    database: process.env.AWS_RDS_DATABASE,
    user: process.env.AWS_RDS_USER,
    password: process.env.AWS_RDS_PASSWORD,
    ssl: process.env.AWS_RDS_SSL === 'true' ? { rejectUnauthorized: false } : false
  })

  try {
    await client.connect()
    console.log('✓ Connected to database')

    // Add password_hash column
    await client.query(`
      ALTER TABLE app_users 
      ADD COLUMN IF NOT EXISTS password_hash TEXT
    `)
    console.log('✓ Added password_hash column')

    // Add email index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email)
    `)
    console.log('✓ Created email index')

    // Hash a default password for testing
    const defaultPassword = 'admin123'
    const passwordHash = await bcrypt.hash(defaultPassword, 10)

    // Update existing admin users with default password
    const result = await client.query(`
      UPDATE app_users 
      SET password_hash = $1
      WHERE password_hash IS NULL AND role = 'company_admin'
      RETURNING id, name, email
    `, [passwordHash])

    if (result.rows.length > 0) {
      console.log(`✓ Updated ${result.rows.length} admin user(s) with default password`)
      console.log('  Default credentials:')
      result.rows.forEach(user => {
        console.log(`  - Email: ${user.email}`)
        console.log(`    Password: ${defaultPassword}`)
      })
    } else {
      console.log('ℹ No admin users needed password update')
    }

    console.log('\n✅ Password authentication setup complete!')
    console.log('\n📝 Valid admin codes for signup:')
    console.log('  - DAIRY2024ADMIN')
    console.log('  - SUPERADMIN123')
    console.log('  - DAIRYFLOW-ADMIN')

  } catch (error) {
    console.error('❌ Error setting up password auth:', error.message)
    console.error('Full error:', error)
    throw error
  } finally {
    await client.end()
  }
}

setupPasswordAuth()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
