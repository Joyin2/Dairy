import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { LedgerEntry } from '@/types/database'

export const dynamic = 'force-dynamic'

// GET single ledger entry with full details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const query = `
      SELECT 
        l.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'phone', u.phone
        ) as creator
      FROM ledger_entries l
      LEFT JOIN app_users u ON l.created_by = u.id
      WHERE l.id = $1::uuid
    `

    const entries = await db.custom<LedgerEntry>(query, [id])

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'Ledger entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(entries[0])
  } catch (error: any) {
    console.error('Ledger entry fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ledger entry' },
      { status: 500 }
    )
  }
}

// PUT update ledger entry (for clearing, adjustments, etc.)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const updated = await db.update<LedgerEntry>(
      'ledger_entries',
      { id },
      body
    )

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Ledger entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated[0])
  } catch (error: any) {
    console.error('Ledger entry update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update ledger entry' },
      { status: 500 }
    )
  }
}

// DELETE ledger entry
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    await db.delete('ledger_entries', { id })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ledger entry deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete ledger entry' },
      { status: 500 }
    )
  }
}
