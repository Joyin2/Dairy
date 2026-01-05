import { NextRequest, NextResponse } from 'next/server'
import { db, hasDBConfig } from '@/lib/db'
import type { Shop } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Return mock data if database is not configured
    if (!hasDBConfig()) {
      const mockShops = [
        {
          id: '1',
          name: 'Sharma General Store',
          contact: 'Mr. Rajesh Sharma',
          phone: '+91 98765 43210',
          email: 'sharma@example.com',
          address: 'Market Road, Sector 5, Meerut',
          metadata: {},
          created_at: new Date('2024-01-15').toISOString()
        },
        {
          id: '2',
          name: 'Gandhi Dairy Shop',
          contact: 'Mr. Suresh Gandhi',
          phone: '+91 98765 43211',
          email: 'gandhi@example.com',
          address: 'Gandhi Nagar, Phase 2, Meerut',
          metadata: {},
          created_at: new Date('2024-02-10').toISOString()
        },
        {
          id: '3',
          name: 'Patel Retailers',
          contact: 'Mrs. Priya Patel',
          phone: '+91 98765 43212',
          email: 'patel@example.com',
          address: 'East Street, Block C, Meerut',
          metadata: {},
          created_at: new Date('2023-11-05').toISOString()
        },
        {
          id: '4',
          name: 'Modern Mart',
          contact: 'Mr. Amit Verma',
          phone: '+91 98765 43213',
          email: 'modern@example.com',
          address: 'Mall Road, Central, Meerut',
          metadata: {},
          created_at: new Date('2024-03-20').toISOString()
        }
      ]
      return NextResponse.json(mockShops)
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    let shops: Shop[]

    if (search) {
      shops = await db.search<Shop>('shops', 'name', search, '*', 'created_at DESC')
    } else {
      shops = await db.select<Shop>('shops', '*', undefined, 'created_at DESC')
    }

    return NextResponse.json(shops)
  } catch (error: any) {
    console.error('Shops fetch error:', error)
    
    // If table doesn't exist, return mock data
    if (error?.code === '42P01') {
      const mockShops = [
        {
          id: '1',
          name: 'Sharma General Store',
          contact: 'Mr. Rajesh Sharma',
          address: 'Market Road, Sector 5, Meerut',
          metadata: {},
          created_at: new Date('2024-01-15').toISOString()
        },
        {
          id: '2',
          name: 'Gandhi Dairy Shop',
          contact: 'Mr. Suresh Gandhi',
          address: 'Gandhi Nagar, Phase 2, Meerut',
          metadata: {},
          created_at: new Date('2024-02-10').toISOString()
        }
      ]
      return NextResponse.json(mockShops)
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shops' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Return success response with mock data if database not configured
    if (!hasDBConfig()) {
      const newShop = {
        id: Date.now().toString(),
        ...body,
        metadata: body.metadata || {},
        created_at: new Date().toISOString()
      }
      return NextResponse.json(newShop, { status: 201 })
    }

    const newShop = await db.insert<Shop>('shops', {
      ...body,
      metadata: body.metadata || {},
    })

    return NextResponse.json(newShop, { status: 201 })
  } catch (error: any) {
    console.error('Shop creation error:', error)
    
    // If table doesn't exist, return success with mock data
    if (error?.code === '42P01') {
      const newShop = {
        id: Date.now().toString(),
        metadata: {},
        created_at: new Date().toISOString()
      }
      return NextResponse.json(newShop, { status: 201 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create shop' },
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
        { error: 'Shop ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Return success response with mock data if database not configured
    if (!hasDBConfig()) {
      const updatedShop = {
        id,
        ...body,
        metadata: body.metadata || {},
        updated_at: new Date().toISOString()
      }
      return NextResponse.json(updatedShop, { status: 200 })
    }

    const updatedShop = await db.update<Shop>(
      'shops',
      body,
      { id }
    )

    if (!updatedShop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedShop, { status: 200 })
  } catch (error: any) {
    console.error('Shop update error:', error)
    
    // If table doesn't exist, return success with mock data
    if (error?.code === '42P01') {
      const updatedShop = {
        id: Date.now().toString(),
        metadata: {},
        updated_at: new Date().toISOString()
      }
      return NextResponse.json(updatedShop, { status: 200 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update shop' },
      { status: 500 }
    )
  }
}
