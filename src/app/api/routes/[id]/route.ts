import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Route } from '@/types/database'

export const dynamic = 'force-dynamic'

// Update route
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const updated = await db.update<Route>(
      'routes',
      { id },
      body
    )

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      )
    }

    // If stops are being updated, sync deliveries
    if (body.stops) {
      const stops = typeof body.stops === 'string' ? JSON.parse(body.stops) : body.stops
      
      if (Array.isArray(stops)) {
        // Get existing deliveries for this route
        const existingDeliveries = await db.custom(
          'SELECT id, shop_id FROM deliveries WHERE route_id = $1',
          [id]
        )

        const existingShopIds = new Set(existingDeliveries.map((d: any) => d.shop_id))
        const newShopIds = new Set(stops.map((s: any) => s.shop_id))

        // Create deliveries for new shops
        const shopsToAdd = stops.filter((s: any) => !existingShopIds.has(s.shop_id))
        if (shopsToAdd.length > 0) {
          const createPromises = shopsToAdd.map((stop: any) => {
            return db.insert('deliveries', {
              route_id: id,
              shop_id: stop.shop_id,
              expected_qty: stop.expected_qty || 0,
              status: 'pending',
              items: JSON.stringify([])
            })
          })
          await Promise.all(createPromises)
          console.log(`✓ Added ${shopsToAdd.length} new deliveries to route ${id}`)
        }

        // Delete deliveries for removed shops (only if pending)
        const shopsToRemove = Array.from(existingShopIds).filter(shopId => !newShopIds.has(shopId))
        if (shopsToRemove.length > 0) {
          for (const shopId of shopsToRemove) {
            await db.custom(
              "DELETE FROM deliveries WHERE route_id = $1 AND shop_id = $2 AND status = 'pending'",
              [id, shopId]
            )
          }
          console.log(`✓ Removed ${shopsToRemove.length} deliveries from route ${id}`)
        }

        // Update expected quantities for existing deliveries
        const updatePromises = stops
          .filter((s: any) => existingShopIds.has(s.shop_id))
          .map((stop: any) => {
            return db.custom(
              "UPDATE deliveries SET expected_qty = $1 WHERE route_id = $2 AND shop_id = $3 AND status = 'pending'",
              [stop.expected_qty || 0, id, stop.shop_id]
            )
          })
        await Promise.all(updatePromises)
      }
    }

    return NextResponse.json(updated[0])
  } catch (error: any) {
    console.error('Route update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update route' },
      { status: 500 }
    )
  }
}

// Delete route
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    await db.delete('routes', { id })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Route deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete route' },
      { status: 500 }
    )
  }
}
