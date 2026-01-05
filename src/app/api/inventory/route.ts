import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { InventoryItem } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('product_id')
    const locationId = searchParams.get('location_id')
    const search = searchParams.get('search')

    // Build query with joins
    let query = `
      SELECT 
        i.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'sku', p.sku,
          'uom', p.uom
        ) as product,
        json_build_object(
          'id', b.id,
          'batch_code', b.batch_code,
          'expiry_date', b.expiry_date,
          'production_date', b.production_date
        ) as batch
      FROM inventory_items i
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN batches b ON i.batch_id = b.id
    `

    const params: any[] = []
    const whereClauses: string[] = []
    let paramCount = 1

    if (productId) {
      whereClauses.push(`i.product_id = $${paramCount}::uuid`)
      params.push(productId)
      paramCount++
    }

    if (locationId) {
      whereClauses.push(`i.location_id = $${paramCount}::uuid`)
      params.push(locationId)
      paramCount++
    }

    if (search) {
      whereClauses.push(`(p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount} OR b.batch_code ILIKE $${paramCount})`)
      params.push(`%${search}%`)
      paramCount++
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    query += ' ORDER BY i.last_updated DESC'

    const inventory = await db.custom<InventoryItem>(query, params)
    return NextResponse.json(inventory)
  } catch (error: any) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

// Stock adjustment endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inventory_id, adjustment_qty, reason, adjusted_by } = body

    if (!inventory_id || adjustment_qty === undefined) {
      return NextResponse.json(
        { error: 'inventory_id and adjustment_qty are required' },
        { status: 400 }
      )
    }

    // Get current inventory item
    const currentItems = await db.select<InventoryItem>(
      'inventory_items',
      '*',
      { id: inventory_id }
    )

    if (!currentItems || currentItems.length === 0) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    const currentItem = currentItems[0]
    const newQty = parseFloat(currentItem.qty as any) + parseFloat(adjustment_qty)

    if (newQty < 0) {
      return NextResponse.json(
        { error: 'Adjustment would result in negative stock' },
        { status: 400 }
      )
    }

    // Update inventory
    const updated = await db.update<InventoryItem>(
      'inventory_items',
      { id: inventory_id },
      {
        qty: newQty,
        last_updated: new Date().toISOString(),
        metadata: {
          ...((currentItem.metadata as any) || {}),
          last_adjustment: {
            qty: adjustment_qty,
            reason: reason || 'Manual adjustment',
            adjusted_by,
            timestamp: new Date().toISOString()
          }
        }
      }
    )

    // Log to audit
    await db.insert('audit_logs', {
      action_type: 'inventory_adjustment',
      entity_type: 'inventory_items',
      entity_id: inventory_id,
      meta: {
        adjustment_qty,
        new_qty: newQty,
        reason
      }
    })

    return NextResponse.json(updated[0] || updated)
  } catch (error: any) {
    console.error('Stock adjustment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to adjust stock' },
      { status: 500 }
    )
  }
}
