import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { InventoryItem } from '@/types/database'

export const dynamic = 'force-dynamic'

// Stock transfer between locations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      from_inventory_id, 
      to_location_id, 
      transfer_qty, 
      reason,
      transferred_by 
    } = body

    if (!from_inventory_id || !to_location_id || !transfer_qty) {
      return NextResponse.json(
        { error: 'from_inventory_id, to_location_id, and transfer_qty are required' },
        { status: 400 }
      )
    }

    // Get source inventory item
    const sourceItems = await db.select<InventoryItem>(
      'inventory_items',
      '*',
      { id: from_inventory_id }
    )

    if (!sourceItems || sourceItems.length === 0) {
      return NextResponse.json(
        { error: 'Source inventory item not found' },
        { status: 404 }
      )
    }

    const sourceItem = sourceItems[0]
    const currentQty = parseFloat(sourceItem.qty as any)
    const transferQty = parseFloat(transfer_qty)

    if (transferQty > currentQty) {
      return NextResponse.json(
        { error: 'Insufficient stock for transfer' },
        { status: 400 }
      )
    }

    // Check if destination inventory item exists
    const destItems = await db.select<InventoryItem>(
      'inventory_items',
      '*',
      { 
        product_id: sourceItem.product_id,
        batch_id: sourceItem.batch_id,
        location_id: to_location_id
      }
    )

    let result

    if (destItems && destItems.length > 0) {
      // Update existing destination inventory
      const destItem = destItems[0]
      const newDestQty = parseFloat(destItem.qty as any) + transferQty

      await db.update<InventoryItem>(
        'inventory_items',
        { id: destItem.id },
        {
          qty: newDestQty,
          last_updated: new Date().toISOString()
        }
      )

      result = { destination_id: destItem.id, destination_qty: newDestQty }
    } else {
      // Create new destination inventory
      const newDest = await db.insert<InventoryItem>('inventory_items', {
        product_id: sourceItem.product_id,
        batch_id: sourceItem.batch_id,
        location_id: to_location_id,
        qty: transferQty,
        uom: sourceItem.uom,
        metadata: {
          transferred_from: from_inventory_id,
          transfer_date: new Date().toISOString()
        }
      })

      result = { destination_id: newDest[0]?.id, destination_qty: transferQty }
    }

    // Update source inventory
    const newSourceQty = currentQty - transferQty

    if (newSourceQty === 0) {
      // Delete if no stock remaining
      await db.delete('inventory_items', { id: from_inventory_id })
    } else {
      await db.update<InventoryItem>(
        'inventory_items',
        { id: from_inventory_id },
        {
          qty: newSourceQty,
          last_updated: new Date().toISOString()
        }
      )
    }

    // Log to audit
    await db.insert('audit_logs', {
      action_type: 'inventory_transfer',
      entity_type: 'inventory_items',
      entity_id: from_inventory_id,
      meta: {
        from_location: sourceItem.location_id,
        to_location: to_location_id,
        transfer_qty: transferQty,
        reason,
        transferred_by
      }
    })

    return NextResponse.json({
      success: true,
      source_qty: newSourceQty,
      ...result
    })
  } catch (error: any) {
    console.error('Stock transfer error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transfer stock' },
      { status: 500 }
    )
  }
}
