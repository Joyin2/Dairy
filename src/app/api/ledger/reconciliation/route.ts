import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET cash reconciliation report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get('from_date') || new Date().toISOString().split('T')[0]
    const toDate = searchParams.get('to_date') || new Date().toISOString().split('T')[0]

    // Get cash transactions summary
    const summaryQuery = `
      SELECT 
        mode,
        cleared,
        COUNT(*) as transaction_count,
        SUM(CASE 
          WHEN to_account LIKE '%cash%' OR to_account LIKE '%Cash%' THEN amount 
          ELSE 0 
        END) as cash_inflow,
        SUM(CASE 
          WHEN from_account LIKE '%cash%' OR from_account LIKE '%Cash%' THEN amount 
          ELSE 0 
        END) as cash_outflow,
        SUM(CASE 
          WHEN to_account LIKE '%cash%' OR to_account LIKE '%Cash%' THEN amount 
          WHEN from_account LIKE '%cash%' OR from_account LIKE '%Cash%' THEN -amount
          ELSE 0 
        END) as net_cash_flow
      FROM ledger_entries
      WHERE created_at >= $1::timestamptz 
        AND created_at <= ($2::timestamptz + interval '1 day')
      GROUP BY mode, cleared
      ORDER BY mode, cleared
    `

    const summary = await db.custom(summaryQuery, [fromDate, toDate])

    // Get detailed cash transactions
    const detailsQuery = `
      SELECT 
        l.*,
        json_build_object(
          'id', u.id,
          'name', u.name
        ) as creator
      FROM ledger_entries l
      LEFT JOIN app_users u ON l.created_by = u.id
      WHERE (l.from_account ILIKE '%cash%' OR l.to_account ILIKE '%cash%')
        AND l.created_at >= $1::timestamptz
        AND l.created_at <= ($2::timestamptz + interval '1 day')
      ORDER BY l.created_at DESC
    `

    const details = await db.custom(detailsQuery, [fromDate, toDate])

    // Calculate totals
    const totalCashInflow = summary.reduce((sum: number, row: any) => sum + parseFloat(row.cash_inflow || 0), 0)
    const totalCashOutflow = summary.reduce((sum: number, row: any) => sum + parseFloat(row.cash_outflow || 0), 0)
    const netCashPosition = totalCashInflow - totalCashOutflow

    const clearedCashInflow = summary
      .filter((row: any) => row.cleared)
      .reduce((sum: number, row: any) => sum + parseFloat(row.cash_inflow || 0), 0)
    const clearedCashOutflow = summary
      .filter((row: any) => row.cleared)
      .reduce((sum: number, row: any) => sum + parseFloat(row.cash_outflow || 0), 0)
    const clearedNetCash = clearedCashInflow - clearedCashOutflow

    const unclearedCashInflow = summary
      .filter((row: any) => !row.cleared)
      .reduce((sum: number, row: any) => sum + parseFloat(row.cash_inflow || 0), 0)
    const unclearedCashOutflow = summary
      .filter((row: any) => !row.cleared)
      .reduce((sum: number, row: any) => sum + parseFloat(row.cash_outflow || 0), 0)
    const unclearedNetCash = unclearedCashInflow - unclearedCashOutflow

    return NextResponse.json({
      period: {
        from: fromDate,
        to: toDate
      },
      summary: {
        total_cash_inflow: totalCashInflow,
        total_cash_outflow: totalCashOutflow,
        net_cash_position: netCashPosition,
        cleared_net_cash: clearedNetCash,
        uncleared_net_cash: unclearedNetCash
      },
      by_mode: summary,
      transactions: details,
      transaction_count: details.length
    })
  } catch (error: any) {
    console.error('Cash reconciliation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate reconciliation report' },
      { status: 500 }
    )
  }
}

// POST bulk clear transactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transaction_ids } = body

    if (!Array.isArray(transaction_ids) || transaction_ids.length === 0) {
      return NextResponse.json(
        { error: 'transaction_ids array is required' },
        { status: 400 }
      )
    }

    // Bulk update cleared status
    const placeholders = transaction_ids.map((_, i) => `$${i + 1}::uuid`).join(', ')
    const updateQuery = `
      UPDATE ledger_entries 
      SET cleared = true 
      WHERE id IN (${placeholders})
      RETURNING *
    `

    const updated = await db.custom(updateQuery, transaction_ids)

    return NextResponse.json({
      success: true,
      cleared_count: updated.length,
      message: `${updated.length} transactions marked as cleared`
    })
  } catch (error: any) {
    console.error('Bulk clear error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to clear transactions' },
      { status: 500 }
    )
  }
}
