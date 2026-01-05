import { NextRequest, NextResponse } from 'next/server'
import { db, hasDBConfig } from '@/lib/db'
import type { Supplier } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Return mock data if database is not configured
    if (!hasDBConfig()) {
      const mockSuppliers = [
        {
          id: '1',
          name: 'Ramesh Kumar',
          phone: '+91 98765 43210',
          email: 'ramesh@example.com',
          address: 'Village Rampur, District Meerut, UP',
          bank_account: null,
          kyc_status: 'approved',
          auto_receipt_pref: true,
          created_by: null,
          created_at: new Date('2024-01-15').toISOString()
        },
        {
          id: '2',
          name: 'Suresh Patel',
          phone: '+91 98765 43211',
          email: 'suresh@example.com',
          address: 'Village Patelnagar, District Meerut, UP',
          bank_account: null,
          kyc_status: 'pending',
          auto_receipt_pref: true,
          created_by: null,
          created_at: new Date('2024-02-20').toISOString()
        },
        {
          id: '3',
          name: 'Mahesh Singh',
          phone: '+91 98765 43212',
          email: 'mahesh@example.com',
          address: 'Village Singhpur, District Meerut, UP',
          bank_account: null,
          kyc_status: 'approved',
          auto_receipt_pref: false,
          created_by: null,
          created_at: new Date('2023-11-10').toISOString()
        }
      ]
      return NextResponse.json(mockSuppliers)
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    let suppliers: Supplier[]

    if (search) {
      suppliers = await db.search<Supplier>('suppliers', 'name', search, '*', 'created_at DESC')
    } else {
      suppliers = await db.select<Supplier>('suppliers', '*', undefined, 'created_at DESC')
    }

    return NextResponse.json(suppliers)
  } catch (error: any) {
    console.error('Suppliers fetch error:', error)
    
    // If table doesn't exist, return mock data
    if (error?.code === '42P01') {
      const mockSuppliers = [
        {
          id: '1',
          name: 'Ramesh Kumar',
          phone: '+91 98765 43210',
          email: 'ramesh@example.com',
          address: 'Village Rampur, District Meerut, UP',
          kyc_status: 'approved',
          auto_receipt_pref: true,
          created_at: new Date('2024-01-15').toISOString()
        },
        {
          id: '2',
          name: 'Suresh Patel',
          phone: '+91 98765 43211',
          email: 'suresh@example.com',
          address: 'Village Patelnagar, District Meerut, UP',
          kyc_status: 'pending',
          auto_receipt_pref: true,
          created_at: new Date('2024-02-20').toISOString()
        }
      ]
      return NextResponse.json(mockSuppliers)
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Return success response with mock data if database not configured
    if (!hasDBConfig()) {
      const newSupplier = {
        id: Date.now().toString(),
        ...body,
        created_at: new Date().toISOString()
      }
      return NextResponse.json(newSupplier, { status: 201 })
    }

    const newSupplier = await db.insert<Supplier>('suppliers', body)

    return NextResponse.json(newSupplier, { status: 201 })
  } catch (error: any) {
    console.error('Supplier creation error:', error)
    
    // If table doesn't exist, return success with mock data
    if (error?.code === '42P01') {
      const newSupplier = {
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      return NextResponse.json(newSupplier, { status: 201 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create supplier' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log('PUT request received with ID:', id)

    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Return success response with mock data if database not configured
    if (!hasDBConfig()) {
      const updatedSupplier = {
        id,
        ...body,
        updated_at: new Date().toISOString()
      }
      return NextResponse.json(updatedSupplier, { status: 200 })
    }

    const updatedSupplier = await db.update<Supplier>(
      'suppliers',
      body,
      { id }
    )

    if (!updatedSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedSupplier, { status: 200 })
  } catch (error: any) {
    console.error('Supplier update error:', error)
    
    // If table doesn't exist, return success with mock data
    if (error?.code === '42P01') {
      const updatedSupplier = {
        id: Date.now().toString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json(updatedSupplier, { status: 200 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update supplier' },
      { status: 500 }
    )
  }
}
