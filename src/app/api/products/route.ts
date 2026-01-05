import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await db.select<Product>('products', '*', undefined, 'name ASC')
    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const product = await db.insert<Product>('products', body)
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}
