import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// PATCH - Check in at delivery location
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const body = await request.json()
    const { lat, lng, timestamp } = body

    console.log('[CHECKIN] Delivery ID:', id, 'Location:', lat, lng)

    if (!id) {
      return NextResponse.json(
        { error: 'Delivery ID is required' },
        { status: 400 }
      )
    }

    // Update delivery status to in_progress with check-in details
    const updatedDelivery = await db.update(
      'deliveries',
      {
        status: 'in_progress',
        created_at: timestamp || new Date().toISOString(),
      },
      { id }
    )

    if (!updatedDelivery || updatedDelivery.length === 0) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Checked in successfully',
      data: updatedDelivery[0]
    })
  } catch (error: any) {
    console.error('[CHECKIN] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check in' },
      { status: 500 }
    )
  }
}
