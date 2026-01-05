import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Delivery } from '@/types/database'

export const dynamic = 'force-dynamic'

// GET single delivery with full details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const query = `
      SELECT 
        d.*,
        json_build_object(
          'id', r.id,
          'name', r.name,
          'date', r.date,
          'agent', json_build_object(
            'id', u.id,
            'name', u.name,
            'phone', u.phone
          )
        ) as route,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'address', s.address,
          'contact', s.contact
        ) as shop
      FROM deliveries d
      LEFT JOIN routes r ON d.route_id = r.id
      LEFT JOIN app_users u ON r.agent_id = u.id
      LEFT JOIN shops s ON d.shop_id = s.id
      WHERE d.id = $1::uuid
    `

    const deliveries = await db.custom<Delivery>(query, [id])

    if (!deliveries || deliveries.length === 0) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(deliveries[0])
  } catch (error: any) {
    console.error('Delivery fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch delivery' },
      { status: 500 }
    )
  }
}

// PUT update delivery
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const updated = await db.update<Delivery>(
      'deliveries',
      { id },
      body
    )

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated[0])
  } catch (error: any) {
    console.error('Delivery update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update delivery' },
      { status: 500 }
    )
  }
}

// DELETE delivery
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    await db.delete('deliveries', { id })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delivery deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete delivery' },
      { status: 500 }
    )
  }
}
