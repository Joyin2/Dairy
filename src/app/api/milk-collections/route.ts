import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { MilkCollection } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const supplierId = searchParams.get('supplier_id')
    const status = searchParams.get('status')

    console.log('[GET /api/milk-collections] Query params:', { date, supplierId, status });

    let conditions: any = {}
    
    if (supplierId) {
      conditions.supplier_id = supplierId
    }
    
    if (status) {
      conditions.qc_status = status
    }

    // Get collections with joins
    let query = `
      SELECT 
        mc.*,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'phone', s.phone,
          'email', s.email
        ) as supplier,
        json_build_object(
          'id', u.id,
          'name', u.name
        ) as operator
      FROM milk_collections mc
      LEFT JOIN suppliers s ON mc.supplier_id = s.id
      LEFT JOIN app_users u ON mc.operator_user_id = u.id
    `

    const params: any[] = []
    const whereClauses: string[] = []
    let paramCount = 1

    if (date) {
      whereClauses.push(`mc.created_at >= $${paramCount}::timestamptz`)
      params.push(`${date}T00:00:00`)
      paramCount++
      whereClauses.push(`mc.created_at <= $${paramCount}::timestamptz`)
      params.push(`${date}T23:59:59`)
      paramCount++
    }

    if (supplierId) {
      whereClauses.push(`mc.supplier_id = $${paramCount}::uuid`)
      params.push(supplierId)
      paramCount++
    }

    if (status) {
      whereClauses.push(`mc.qc_status = $${paramCount}`)
      params.push(status)
      paramCount++
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    query += ' ORDER BY mc.created_at DESC'

    console.log('[GET /api/milk-collections] SQL Query:', query);
    console.log('[GET /api/milk-collections] SQL Params:', params);

    const collections = await db.custom<MilkCollection>(query, params)
    
    console.log('[GET /api/milk-collections] Found collections:', collections.length);
    
    return NextResponse.json(collections)
  } catch (error: any) {
    console.error('Collections fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Received collection data:', body);

    // Validate required fields
    if (!body.supplier_id || !body.qty_liters) {
      return NextResponse.json(
        { error: 'Supplier ID and quantity are required' },
        { status: 400 }
      );
    }

    // Process the data to ensure proper types
    const collectionData = {
      supplier_id: body.supplier_id,
      operator_user_id: body.operator_user_id || null,
      qty_liters: parseFloat(body.qty_liters),
      fat: body.fat ? parseFloat(body.fat) : null,
      snf: body.snf ? parseFloat(body.snf) : null,
      qc_status: body.qc_status || 'pending',
      status: body.status || 'new',
      metadata: body.metadata || {}
    };

    const newCollection = await db.insert<MilkCollection>('milk_collections', collectionData)
    console.log('Created collection:', newCollection);
    return NextResponse.json(newCollection, { status: 201 })
  } catch (error: any) {
    console.error('Collection creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create collection' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    console.log('Updating collection:', id, 'with data:', body);

    const updated = await db.update<MilkCollection>('milk_collections', body, { id })
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    console.log('Updated collection:', updated);
    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    console.error('Collection update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update collection' },
      { status: 500 }
    )
  }
}
