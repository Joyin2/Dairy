// Quick script to add sample routes data for testing
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

async function addSampleRoutes() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Adding sample routes data...\n')
    
    // 1. Check/Create delivery agents
    const usersCheck = await client.query(`SELECT COUNT(*) FROM app_users WHERE role = 'delivery_agent'`)
    let agentIds = []
    
    if (parseInt(usersCheck.rows[0].count) === 0) {
      console.log('👥 Creating sample delivery agents...')
      const agents = [
        { name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@dairy.com' },
        { name: 'Vijay Singh', phone: '+91 98765 43211', email: 'vijay@dairy.com' },
        { name: 'Amit Verma', phone: '+91 98765 43212', email: 'amit@dairy.com' }
      ]
      
      for (const agent of agents) {
        const result = await client.query(
          `INSERT INTO app_users (name, phone, email, role, status) 
           VALUES ($1, $2, $3, 'delivery_agent', 'active') RETURNING id`,
          [agent.name, agent.phone, agent.email]
        )
        agentIds.push(result.rows[0].id)
        console.log(`  ✓ Created: ${agent.name}`)
      }
    } else {
      const agents = await client.query(`SELECT id FROM app_users WHERE role = 'delivery_agent' LIMIT 3`)
      agentIds = agents.rows.map(r => r.id)
      console.log(`  ✓ Using ${agentIds.length} existing delivery agents`)
    }
    
    // 2. Check/Get shops
    const shopsCheck = await client.query('SELECT COUNT(*) FROM shops')
    let shopIds = []
    
    if (parseInt(shopsCheck.rows[0].count) === 0) {
      console.log('\n🏪 Creating sample shops...')
      const shops = [
        { name: 'Sharma Store', address: 'North Delhi', contact: '+91 98765 00001' },
        { name: 'Gandhi Dairy', address: 'Central Delhi', contact: '+91 98765 00002' },
        { name: 'Modern Mart', address: 'South Delhi', contact: '+91 98765 00003' },
        { name: 'Patel Store', address: 'East Delhi', contact: '+91 98765 00004' },
        { name: 'Quick Mart', address: 'West Delhi', contact: '+91 98765 00005' }
      ]
      
      for (const shop of shops) {
        const result = await client.query(
          `INSERT INTO shops (name, address, contact) VALUES ($1, $2, $3) RETURNING id`,
          [shop.name, shop.address, shop.contact]
        )
        shopIds.push(result.rows[0].id)
        console.log(`  ✓ Created: ${shop.name}`)
      }
    } else {
      const shops = await client.query('SELECT id FROM shops ORDER BY created_at LIMIT 5')
      shopIds = shops.rows.map(r => r.id)
      console.log(`\n🏪 Using ${shopIds.length} existing shops`)
    }
    
    // 3. Create routes
    const routesCheck = await client.query('SELECT COUNT(*) FROM routes')
    
    if (parseInt(routesCheck.rows[0].count) === 0 && agentIds.length > 0 && shopIds.length > 0) {
      console.log('\n🗺️  Creating sample routes...')
      
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      
      const routes = [
        {
          name: 'Route A - North Zone',
          agent_id: agentIds[0],
          date: today,
          stops: [
            { shop_id: shopIds[0], expected_qty: 100, seq: 1, status: 'delivered' },
            { shop_id: shopIds[1], expected_qty: 150, seq: 2, status: 'delivered' },
            { shop_id: shopIds[2], expected_qty: 80, seq: 3, status: 'pending' }
          ]
        },
        {
          name: 'Route B - South Zone',
          agent_id: agentIds[1] || agentIds[0],
          date: today,
          stops: [
            { shop_id: shopIds[3], expected_qty: 200, seq: 1, status: 'delivered' },
            { shop_id: shopIds[4], expected_qty: 120, seq: 2, status: 'delivered' }
          ]
        },
        {
          name: 'Route C - East Zone',
          agent_id: agentIds[2] || agentIds[0],
          date: tomorrow,
          stops: [
            { shop_id: shopIds[0], expected_qty: 90, seq: 1, status: 'pending' },
            { shop_id: shopIds[2], expected_qty: 110, seq: 2, status: 'pending' },
            { shop_id: shopIds[4], expected_qty: 130, seq: 3, status: 'pending' }
          ]
        }
      ]
      
      for (const route of routes) {
        await client.query(
          `INSERT INTO routes (name, agent_id, date, stops) VALUES ($1, $2, $3, $4)`,
          [route.name, route.agent_id, route.date, JSON.stringify(route.stops)]
        )
        console.log(`  ✓ Created: ${route.name} (${route.stops.length} stops)`)
      }
    } else {
      console.log('\n🗺️  Routes already exist')
    }
    
    // 4. Summary
    const summary = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM app_users WHERE role = 'delivery_agent') as agents,
        (SELECT COUNT(*) FROM shops) as shops,
        (SELECT COUNT(*) FROM routes) as routes
    `)
    
    console.log('\n✅ Summary:')
    console.log(`  Delivery Agents: ${summary.rows[0].agents}`)
    console.log(`  Shops: ${summary.rows[0].shops}`)
    console.log(`  Routes: ${summary.rows[0].routes}`)
    console.log('\n🎉 Done! Refresh your routes page to see the data.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

addSampleRoutes()
