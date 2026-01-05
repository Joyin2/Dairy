// Quick script to add sample inventory data for testing
const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  host: process.env.AWS_RDS_HOST,
  port: process.env.AWS_RDS_PORT,
  database: process.env.AWS_RDS_DATABASE,
  user: process.env.AWS_RDS_USER,
  password: process.env.AWS_RDS_PASSWORD,
  ssl: process.env.AWS_RDS_SSL === 'true' ? { rejectUnauthorized: false } : false
})

async function addSampleData() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Adding sample inventory data...\n')
    
    // 1. Check if products exist
    const productCheck = await client.query('SELECT COUNT(*) FROM products')
    let productIds = []
    
    if (parseInt(productCheck.rows[0].count) === 0) {
      console.log('📦 Creating sample products...')
      const products = [
        { name: 'Full Cream Milk', sku: 'FCM-001', uom: 'liter', shelf_life_days: 7 },
        { name: 'Toned Milk', sku: 'TM-002', uom: 'liter', shelf_life_days: 5 },
        { name: 'Paneer', sku: 'PNR-003', uom: 'kg', shelf_life_days: 3 }
      ]
      
      for (const p of products) {
        const result = await client.query(
          'INSERT INTO products (name, sku, uom, shelf_life_days) VALUES ($1, $2, $3, $4) RETURNING id',
          [p.name, p.sku, p.uom, p.shelf_life_days]
        )
        productIds.push(result.rows[0].id)
        console.log(`  ✓ Created: ${p.name}`)
      }
    } else {
      const products = await client.query('SELECT id FROM products LIMIT 3')
      productIds = products.rows.map(r => r.id)
      console.log(`  ✓ Using ${productIds.length} existing products`)
    }
    
    // 2. Check if batches exist
    const batchCheck = await client.query('SELECT COUNT(*) FROM batches')
    let batchIds = []
    
    if (parseInt(batchCheck.rows[0].count) === 0 && productIds.length > 0) {
      console.log('\n🏭 Creating sample batches...')
      const batches = [
        { product_id: productIds[0], yield_qty: 500, batch_code: 'BATCH-001' },
        { product_id: productIds[1], yield_qty: 300, batch_code: 'BATCH-002' }
      ]
      
      if (productIds[2]) {
        batches.push({ product_id: productIds[2], yield_qty: 50, batch_code: 'BATCH-003' })
      }
      
      for (const b of batches) {
        const result = await client.query(
          `INSERT INTO batches (batch_code, product_id, yield_qty, production_date, expiry_date, qc_status) 
           VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '7 days', 'approved') RETURNING id`,
          [b.batch_code, b.product_id, b.yield_qty]
        )
        batchIds.push({ id: result.rows[0].id, product_id: b.product_id, yield_qty: b.yield_qty })
        console.log(`  ✓ Created: ${b.batch_code}`)
      }
    } else {
      const batches = await client.query('SELECT id, product_id, yield_qty FROM batches LIMIT 3')
      batchIds = batches.rows
      console.log(`  ✓ Using ${batchIds.length} existing batches`)
    }
    
    // 3. Create inventory items
    const invCheck = await client.query('SELECT COUNT(*) FROM inventory_items')
    
    if (parseInt(invCheck.rows[0].count) === 0 && batchIds.length > 0) {
      console.log('\n📊 Creating sample inventory items...')
      
      for (const batch of batchIds) {
        const result = await client.query(
          `INSERT INTO inventory_items (product_id, batch_id, location_id, qty, uom, metadata) 
           VALUES ($1, $2, NULL, $3, 'liter', '{}') RETURNING id`,
          [batch.product_id, batch.id, batch.yield_qty]
        )
        console.log(`  ✓ Created inventory for batch ${batch.id}: ${batch.yield_qty} units`)
      }
    } else {
      console.log('\n📊 Inventory items already exist')
    }
    
    // 4. Show summary
    const summary = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM products) as products,
        (SELECT COUNT(*) FROM batches) as batches,
        (SELECT COUNT(*) FROM inventory_items) as inventory
    `)
    
    console.log('\n✅ Summary:')
    console.log(`  Products: ${summary.rows[0].products}`)
    console.log(`  Batches: ${summary.rows[0].batches}`)
    console.log(`  Inventory Items: ${summary.rows[0].inventory}`)
    console.log('\n🎉 Done! Refresh your inventory page to see the data.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

addSampleData()
