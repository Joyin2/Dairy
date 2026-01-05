import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Delivery } from '@/types/database'

export const dynamic = 'force-dynamic'

// POST mark delivery as delivered with proof
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Validate required fields
    const {
      status,
      delivered_qty,
      proof_url,
      signature_url,
      collected_amount,
      payment_mode
    } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status,
      delivered_at: new Date().toISOString()
    }

    if (delivered_qty !== undefined) {
      updateData.delivered_qty = delivered_qty
    }

    if (proof_url) {
      updateData.proof_url = proof_url
    }

    if (signature_url) {
      updateData.signature_url = signature_url
    }

    if (collected_amount !== undefined) {
      updateData.collected_amount = collected_amount
    }

    if (payment_mode) {
      updateData.payment_mode = payment_mode
    }

    // Update the delivery
    const updated = await db.update<Delivery>(
      'deliveries',
      { id },
      updateData
    )

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // Note: The database trigger fn_create_ledger_on_delivery() 
    // will automatically create a ledger entry if collected_amount > 0

    return NextResponse.json({
      success: true,
      delivery: updated[0],
      message: 'Delivery marked as delivered successfully'
    })
  } catch (error: any) {
    console.error('Mark delivered error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark delivery as delivered' },
      { status: 500 }
    )
  }
}
