#!/usr/bin/env node

/**
 * Sample Deliveries Data Script
 * 
 * This script creates sample delivery records based on existing routes.
 * It generates deliveries with different statuses and payment information.
 * 
 * Run with: node scripts/add-sample-deliveries.js
 */

const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  })

  try {
    await client.connect()
    console.log('✓ Connected to database')

    // Get existing routes with stops
    const routesResult = await client.query(`
      SELECT id, name, stops, date 
      FROM routes 
      WHERE stops IS NOT NULL 
      AND jsonb_array_length(stops) > 0
      ORDER BY created_at DESC
      LIMIT 5
    `)

    if (routesResult.rows.length === 0) {
      console.log('⚠ No routes with stops found. Please create routes first using add-sample-routes.js')
      return
    }

    console.log(`✓ Found ${routesResult.rows.length} routes with stops`)

    // Get products for items
    const productsResult = await client.query(`
      SELECT id, name FROM products LIMIT 5
    `)

    if (productsResult.rows.length === 0) {
      console.log('⚠ No products found. Creating sample products...')
      
      const sampleProducts = [
        { name: 'Full Cream Milk', uom: 'liter' },
        { name: 'Toned Milk', uom: 'liter' },
        { name: 'Butter', uom: 'kg' },
        { name: 'Curd', uom: 'kg' },
        { name: 'Paneer', uom: 'kg' }
      ]

      for (const product of sampleProducts) {
        await client.query(
          'INSERT INTO products (name, uom, sku) VALUES ($1, $2, $3)',
          [product.name, product.uom, `SKU-${product.name.toUpperCase().replace(/\s+/g, '-')}`]
        )
      }

      const newProductsResult = await client.query('SELECT id, name FROM products LIMIT 5')
      productsResult.rows = newProductsResult.rows
      console.log('✓ Created sample products')
    }

    const products = productsResult.rows
    console.log(`✓ Found ${products.length} products`)

    // Delivery statuses with different scenarios
    const deliveryStatuses = [
      'pending',
      'in_transit',
      'delivered',
      'delivered',
      'partial',
      'returned',
      'failed'
    ]

    const paymentModes = ['cash', 'upi', 'card', 'bank_transfer']

    let deliveriesCreated = 0

    // Create deliveries for each route stop
    for (const route of routesResult.rows) {
      const stops = route.stops

      for (const stop of stops) {
        const status = deliveryStatuses[Math.floor(Math.random() * deliveryStatuses.length)]
        
        // Generate random items (1-3 products)
        const numItems = Math.floor(Math.random() * 3) + 1
        const items = []
        
        for (let i = 0; i < numItems; i++) {
          const product = products[Math.floor(Math.random() * products.length)]
          items.push({
            product_id: product.id,
            product: product.name,
            qty: Math.floor(Math.random() * 50) + 10,
            price: Math.floor(Math.random() * 100) + 50
          })
        }

        const expected_qty = stop.expected_qty || 100
        
        let delivered_qty = null
        let collected_amount = null
        let payment_mode = null
        let proof_url = null
        let signature_url = null
        let delivered_at = null

        // Set values based on status
        if (status === 'delivered') {
          delivered_qty = expected_qty
          collected_amount = Math.floor(Math.random() * 5000) + 1000
          payment_mode = paymentModes[Math.floor(Math.random() * paymentModes.length)]
          proof_url = `/uploads/proof_${Date.now()}_${Math.random()}.jpg`
          signature_url = `/uploads/signature_${Date.now()}_${Math.random()}.jpg`
          delivered_at = new Date(Date.now() - Math.random() * 86400000).toISOString() // Within last 24 hours
        } else if (status === 'partial') {
          delivered_qty = Math.floor(expected_qty * (0.5 + Math.random() * 0.4)) // 50-90% of expected
          collected_amount = Math.floor(Math.random() * 3000) + 500
          payment_mode = paymentModes[Math.floor(Math.random() * paymentModes.length)]
          proof_url = `/uploads/proof_${Date.now()}_${Math.random()}.jpg`
          delivered_at = new Date(Date.now() - Math.random() * 86400000).toISOString()
        } else if (status === 'returned') {
          delivered_qty = 0
          collected_amount = 0
          delivered_at = new Date(Date.now() - Math.random() * 86400000).toISOString()
        } else if (status === 'failed') {
          delivered_qty = 0
          collected_amount = 0
          delivered_at = new Date(Date.now() - Math.random() * 86400000).toISOString()
        }
        // For pending and in_transit, leave as null

        // Insert delivery
        await client.query(
          `INSERT INTO deliveries (
            route_id,
            shop_id,
            items,
            status,
            expected_qty,
            delivered_qty,
            proof_url,
            signature_url,
            collected_amount,
            payment_mode,
            delivered_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            route.id,
            stop.shop_id,
            JSON.stringify(items),
            status,
            expected_qty,
            delivered_qty,
            proof_url,
            signature_url,
            collected_amount,
            payment_mode,
            delivered_at
          ]
        )

        deliveriesCreated++
      }
    }

    console.log(`✓ Created ${deliveriesCreated} sample deliveries`)

    // Show summary
    const summaryResult = await client.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(COALESCE(collected_amount, 0)) as total_collected
      FROM deliveries
      GROUP BY status
      ORDER BY status
    `)

    console.log('\n📊 Deliveries Summary:')
    console.log('─────────────────────────────────────────')
    summaryResult.rows.forEach(row => {
      console.log(`  ${row.status.padEnd(15)} : ${row.count} deliveries, ₹${parseFloat(row.total_collected).toFixed(2)} collected`)
    })
    console.log('─────────────────────────────────────────')

    console.log('\n✅ Sample deliveries created successfully!')
    console.log('💡 Note: The database trigger will automatically create ledger entries for delivered items with payments.')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
