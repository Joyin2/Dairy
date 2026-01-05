import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Batch } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    console.log('Updating batch:', id, 'with data:', body)

    const updated = await db.update<Batch>('batches', body, { id })
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      )
    }

    console.log('Updated batch:', updated)
    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    console.error('Batch update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update batch' },
      { status: 500 }
    )
  }
}
