import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

// Update product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const updated = await db.update<Product>(
      'products',
      { id },
      body
    )

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated[0])
  } catch (error: any) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    )
  }
}

// Delete product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    await db.delete('products', { id })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    )
  }
}
