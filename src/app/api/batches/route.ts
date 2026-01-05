import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Batch } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    // Build query with joins
    let query = `
      SELECT 
        b.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'sku', p.sku
        ) as product,
        json_build_object(
          'id', u.id,
          'name', u.name
        ) as creator
      FROM batches b
      LEFT JOIN products p ON b.product_id = p.id
      LEFT JOIN app_users u ON b.created_by = u.id
    `

    const params: any[] = []
    const whereClauses: string[] = []
    let paramCount = 1

    if (date) {
      whereClauses.push(`b.production_date >= $${paramCount}::timestamptz`)
      params.push(`${date}T00:00:00`)
      paramCount++
      whereClauses.push(`b.production_date <= $${paramCount}::timestamptz`)
      params.push(`${date}T23:59:59`)
      paramCount++
    }

    if (status) {
      whereClauses.push(`b.qc_status = $${paramCount}`)
      params.push(status)
      paramCount++
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    query += ' ORDER BY b.production_date DESC'

    const batches = await db.custom<Batch>(query, params)
    return NextResponse.json(batches)
  } catch (error: any) {
    console.error('Batches fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch batches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate batch code if not provided
    if (!body.batch_code) {
      const now = new Date()
      body.batch_code = `BATCH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now()}`
    }
    
    const batch = await db.insert<Batch>('batches', body)
    return NextResponse.json(batch, { status: 201 })
  } catch (error: any) {
    console.error('Batch creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create batch' },
      { status: 500 }
    )
  }
}
