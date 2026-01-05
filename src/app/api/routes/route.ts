import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all routes
export async function GET(request: NextRequest) {
  try {
    const routes = await db.custom(`
      SELECT 
        r.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as agent,
        COUNT(d.id) as total_shops,
        COUNT(CASE WHEN d.status = 'delivered' THEN 1 END) as completed_shops
      FROM routes r
      LEFT JOIN app_users u ON r.agent_id = u.id
      LEFT JOIN deliveries d ON r.id = d.route_id
      GROUP BY r.id, u.id, u.name, u.email
      ORDER BY r.date DESC
    `)

    return NextResponse.json({
      success: true,
      data: routes
    })
  } catch (error: any) {
    console.error('Get routes error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get routes' },
      { status: 500 }
    )
  }
}

// POST create new route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, date, agent_id, stops } = body

    if (!name || !date || !agent_id) {
      return NextResponse.json(
        { error: 'Name, date, and agent_id are required' },
        { status: 400 }
      )
    }

    // Create route with stops as JSONB
    const newRoute = await db.insert('routes', {
      name,
      date,
      agent_id,
      stops: stops ? JSON.stringify(stops) : '[]',
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Route created successfully',
      data: newRoute[0]
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create route error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create route' },
      { status: 500 }
    )
  }
}
