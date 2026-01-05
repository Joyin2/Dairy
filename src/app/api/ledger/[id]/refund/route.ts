import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { LedgerEntry } from '@/types/database'

export const dynamic = 'force-dynamic'

// POST create refund entry for a payment
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Get original entry
    const originalQuery = await db.custom<LedgerEntry>(
      'SELECT * FROM ledger_entries WHERE id = $1::uuid',
      [id]
    )

    if (!originalQuery || originalQuery.length === 0) {
      return NextResponse.json(
        { error: 'Original payment not found' },
        { status: 404 }
      )
    }

    const original = originalQuery[0]

    // Validate refund amount
    const refundAmount = body.amount || original.amount
    if (refundAmount > (original.amount || 0)) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed original payment amount' },
        { status: 400 }
      )
    }

    // Create reversal entry (swap from/to accounts)
    const refundEntry = await db.insert<LedgerEntry>('ledger_entries', {
      from_account: original.to_account,
      to_account: original.from_account,
      amount: refundAmount,
      mode: original.mode,
      reference: `REFUND-${original.reference || original.id}`,
      receipt_url: body.receipt_url || null,
      created_by: body.created_by || null,
      cleared: true
    })

    // Update original entry with refund reference
    await db.custom(
      `UPDATE ledger_entries 
       SET reference = COALESCE(reference, '') || ' [REFUNDED]'
       WHERE id = $1::uuid`,
      [id]
    )

    return NextResponse.json({
      success: true,
      refund_entry: refundEntry[0],
      message: 'Refund processed successfully'
    })
  } catch (error: any) {
    console.error('Refund processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process refund' },
      { status: 500 }
    )
  }
}
