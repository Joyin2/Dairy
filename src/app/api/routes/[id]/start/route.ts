import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// PATCH - Start a route
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const body = await request.json()
    const { start_time } = body

    console.log('[START ROUTE] Route ID:', id)

    if (!id) {
      return NextResponse.json(
        { error: 'Route ID is required' },
        { status: 400 }
      )
    }

    // Update route - add start_time to stops metadata
    const route = await db.custom(
      'SELECT * FROM routes WHERE id = $1',
      [id]
    )

    if (!route || route.length === 0) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      )
    }

    // Update route with start time in stops metadata
    const stops = route[0].stops ? JSON.parse(route[0].stops) : []
    const updatedStops = {
      ...stops,
      started_at: start_time || new Date().toISOString()
    }

    const updatedRoute = await db.update(
      'routes',
      {
        stops: JSON.stringify(updatedStops)
      },
      { id }
    )

    if (!updatedRoute || updatedRoute.length === 0) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Route started successfully',
      data: updatedRoute[0]
    })
  } catch (error: any) {
    console.error('[START ROUTE] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start route' },
      { status: 500 }
    )
  }
}
