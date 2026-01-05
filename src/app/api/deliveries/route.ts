import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all deliveries
export async function GET(request: NextRequest) {
  try {
    const deliveries = await db.custom(`
      SELECT 
        d.*,
        s.name as shop_name,
        s.address as shop_address,
        s.latitude as shop_lat,
        s.longitude as shop_lng,
        r.name as route_name,
        r.date as route_date
      FROM deliveries d
      LEFT JOIN shops s ON d.shop_id = s.id
      LEFT JOIN routes r ON d.route_id = r.id
      ORDER BY d.created_at DESC
    `)

    return NextResponse.json({
      success: true,
      data: deliveries
    })
  } catch (error: any) {
    console.error('Get deliveries error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get deliveries' },
      { status: 500 }
    )
  }
}

// POST create new delivery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shop_id, route_id, items, expected_qty } = body

    if (!shop_id) {
      return NextResponse.json(
        { error: 'Shop ID is required' },
        { status: 400 }
      )
    }

    // Create delivery with items as JSONB
    const newDelivery = await db.insert('deliveries', {
      shop_id,
      route_id: route_id || null,
      items: items ? JSON.stringify(items) : '[]',
      expected_qty: expected_qty || 0,
      status: 'pending',
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Delivery created successfully',
      data: newDelivery[0]
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create delivery error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create delivery' },
      { status: 500 }
    )
  }
}
