#!/usr/bin/env node

/**
 * AWS RDS Connection Test Script
 * 
 * This script tests the connection to your AWS RDS PostgreSQL database
 * and verifies that the schema is properly set up.
 * 
 * Usage: node scripts/test-rds-connection.js
 */

const { Pool } = require('pg');

async function testConnection() {
  console.log('🔍 AWS RDS Connection Test\n');
  console.log('═'.repeat(60));

  // Check environment variables
  const requiredEnvVars = [
    'AWS_RDS_HOST',
    'AWS_RDS_DATABASE',
    'AWS_RDS_USER',
    'AWS_RDS_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('\n💡 Please configure .env.local file');
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.AWS_RDS_HOST,
    port: parseInt(process.env.AWS_RDS_PORT || '5432'),
    database: process.env.AWS_RDS_DATABASE,
    user: process.env.AWS_RDS_USER,
    password: process.env.AWS_RDS_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  let client;

  try {
    console.log('📡 Connecting to AWS RDS...');
    console.log(`   Host: ${process.env.AWS_RDS_HOST}`);
    console.log(`   Database: ${process.env.AWS_RDS_DATABASE}`);
    console.log(`   User: ${process.env.AWS_RDS_USER}`);
    console.log('');

    client = await pool.connect();
    console.log('✅ Successfully connected to AWS RDS\n');

    // Test 1: Check PostgreSQL version
    console.log('📋 Test 1: PostgreSQL Version');
    console.log('─'.repeat(60));
    const versionResult = await client.query('SELECT version()');
    console.log(`✓ ${versionResult.rows[0].version.split(',')[0]}\n`);

    // Test 2: Check installed extensions
    console.log('📋 Test 2: Installed Extensions');
    console.log('─'.repeat(60));
    const extResult = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('pgcrypto', 'pg_trgm', 'postgis')
      ORDER BY extname
    `);
    if (extResult.rows.length > 0) {
      extResult.rows.forEach(row => {
        console.log(`✓ ${row.extname} v${row.extversion}`);
      });
    } else {
      console.log('⚠️  No extensions found. Run database-schema.sql to install them.');
    }
    console.log('');

    // Test 3: Check tables
    console.log('📋 Test 3: Database Tables');
    console.log('─'.repeat(60));
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const expectedTables = [
      'app_users',
      'suppliers',
      'shops',
      'products',
      'milk_collections',
      'batches',
      'inventory_items',
      'routes',
      'deliveries',
      'ledger_entries',
      'notifications',
      'audit_logs'
    ];

    const existingTables = tablesResult.rows.map(r => r.table_name);
    
    if (existingTables.length === 0) {
      console.log('⚠️  No tables found. Run database-schema.sql to create them.');
    } else {
      expectedTables.forEach(table => {
        if (existingTables.includes(table)) {
          console.log(`✓ ${table}`);
        } else {
          console.log(`✗ ${table} (missing)`);
        }
      });
    }
    console.log('');

    // Test 4: Check for stored procedures
    console.log('📋 Test 4: Stored Procedures');
    console.log('─'.repeat(60));
    const procResult = await client.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'create_batch'
    `);
    if (procResult.rows.length > 0) {
      console.log('✓ create_batch procedure exists');
    } else {
      console.log('⚠️  create_batch procedure not found');
    }
    console.log('');

    // Test 5: Sample query
    console.log('📋 Test 5: Sample Query (Shops)');
    console.log('─'.repeat(60));
    const shopsResult = await client.query('SELECT COUNT(*) as count FROM shops');
    console.log(`✓ Shops table accessible (${shopsResult.rows[0].count} records)\n`);

    console.log('═'.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. If tables are missing, run: psql -f database-schema.sql');
    console.log('  2. Start the dev server: npm run dev');
    console.log('  3. Test API endpoints at http://localhost:3000/api/*');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(`   ${error.message}`);
    console.error('\nCommon issues:');
    console.error('  • Check security group allows your IP on port 5432');
    console.error('  • Verify RDS instance is running and publicly accessible');
    console.error('  • Confirm credentials in .env.local are correct');
    console.error('  • Check VPC and subnet configuration');
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Run the test
testConnection().catch(console.error);
