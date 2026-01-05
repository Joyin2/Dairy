import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// PATCH - Update delivery status (mark as delivered/returned)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const body = await request.json()
    const { status, delivery_time, lat, lng, proof_url, signature_url } = body

    console.log('[STATUS] Delivery ID:', id, 'New Status:', status)

    if (!id) {
      return NextResponse.json(
        { error: 'Delivery ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'delivered', 'returned', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Update delivery status
    const updateData: any = { status }
    
    if (status === 'delivered') {
      updateData.delivered_at = delivery_time || new Date().toISOString()
      updateData.proof_url = proof_url
      updateData.signature_url = signature_url
    }

    const updatedDelivery = await db.update(
      'deliveries',
      updateData,
      { id }
    )

    if (!updatedDelivery || updatedDelivery.length === 0) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // If delivered, update inventory
    if (status === 'delivered' && updatedDelivery[0].items) {
      try {
        const items = JSON.parse(updatedDelivery[0].items)
        console.log('[STATUS] Processing', items.length, 'items for inventory update')
      } catch (e) {
        console.log('[STATUS] No items to process or invalid JSON')
      }
    }

    return NextResponse.json({
      success: true,
      message: `Delivery ${status} successfully`,
      data: updatedDelivery[0]
    })
  } catch (error: any) {
    console.error('[STATUS] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update delivery status' },
      { status: 500 }
    )
  }
}
