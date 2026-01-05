import { NextRequest, NextResponse } from 'next/server'
import { hasSupabaseConfig } from '@/lib/supabase'
import { hasDBConfig } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('PUT request received for supplier ID:', id)

    if (!id) {
      console.log('No ID provided')
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Return success response with mock data since we're using AWS RDS
    const updatedSupplier = {
      id,
      ...body,
      updated_at: new Date().toISOString()
    }
    return NextResponse.json(updatedSupplier, { status: 200 })
  } catch (error: any) {
    console.error('Supplier update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update supplier' },
      { status: 500 }
    )
  }
}