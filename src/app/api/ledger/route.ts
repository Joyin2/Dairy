import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { LedgerEntry } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get('from_date')
    const toDate = searchParams.get('to_date')
    const mode = searchParams.get('mode')
    const cleared = searchParams.get('cleared')

    // Build query with joins
    let query = `
      SELECT 
        l.*,
        json_build_object(
          'id', u.id,
          'name', u.name
        ) as creator
      FROM ledger_entries l
      LEFT JOIN app_users u ON l.created_by = u.id
    `

    const params: any[] = []
    const whereClauses: string[] = []
    let paramCount = 1

    if (fromDate) {
      whereClauses.push(`l.created_at >= $${paramCount}::timestamptz`)
      params.push(fromDate)
      paramCount++
    }

    if (toDate) {
      whereClauses.push(`l.created_at <= $${paramCount}::timestamptz`)
      params.push(toDate)
      paramCount++
    }

    if (mode) {
      whereClauses.push(`l.mode = $${paramCount}`)
      params.push(mode)
      paramCount++
    }

    if (cleared !== null && cleared !== undefined && cleared !== '') {
      whereClauses.push(`l.cleared = $${paramCount}::boolean`)
      params.push(cleared === 'true')
      paramCount++
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    query += ' ORDER BY l.created_at DESC'

    const entries = await db.custom<LedgerEntry>(query, params)
    return NextResponse.json(entries)
  } catch (error: any) {
    console.error('Ledger fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ledger entries' },
      { status: 500 }
    )
  }
}

// POST create manual payment entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { from_account, to_account, amount, mode } = body

    if (!from_account || !to_account || !amount || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: from_account, to_account, amount, mode' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create ledger entry
    const entry = await db.insert<LedgerEntry>('ledger_entries', {
      from_account,
      to_account,
      amount,
      mode,
      reference: body.reference || null,
      receipt_url: body.receipt_url || null,
      created_by: body.created_by || null,
      cleared: body.cleared || false
    })

    return NextResponse.json(entry[0], { status: 201 })
  } catch (error: any) {
    console.error('Payment record error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to record payment' },
      { status: 500 }
    )
  }
}
