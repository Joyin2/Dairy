import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { AuditLog } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entity_type')
    const userId = searchParams.get('user_id')

    // Build query with joins
    let query = `
      SELECT 
        a.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user
      FROM audit_logs a
      LEFT JOIN app_users u ON a.user_id = u.id
    `

    const params: any[] = []
    const whereClauses: string[] = []
    let paramCount = 1

    if (entityType) {
      whereClauses.push(`a.entity_type = $${paramCount}`)
      params.push(entityType)
      paramCount++
    }

    if (userId) {
      whereClauses.push(`a.user_id = $${paramCount}::uuid`)
      params.push(userId)
      paramCount++
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    query += ' ORDER BY a.created_at DESC LIMIT 100'

    const logs = await db.custom<AuditLog>(query, params)
    return NextResponse.json(logs)
  } catch (error: any) {
    console.error('Audit logs fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
