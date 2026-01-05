import { NextResponse } from 'next/server'
import { query, hasDBConfig } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!hasDBConfig()) {
      return NextResponse.json({
        status: 'unhealthy',
        database: 'not_configured',
        message: 'Database configuration missing'
      }, { status: 503 })
    }

    const startTime = Date.now()
    await query('SELECT 1 as health_check')
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
