import { NextRequest, NextResponse } from 'next/server'
import { db, hasDBConfig } from '@/lib/db'
import type { AppUser } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Return mock data if database is not configured
    if (!hasDBConfig()) {
      const mockUsers = [
        {
          id: '1',
          auth_uid: null,
          name: 'Rajesh Kumar',
          email: 'rajesh@dairy.com',
          phone: '+91 98765 43210',
          role: 'company_admin' as const,
          metadata: {},
          status: 'active',
          created_at: new Date('2024-01-15').toISOString(),
          last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '2',
          auth_uid: null,
          name: 'Priya Sharma',
          email: 'priya@dairy.com',
          phone: '+91 98765 43211',
          role: 'manufacturer' as const,
          metadata: {},
          status: 'active',
          created_at: new Date('2024-02-10').toISOString(),
          last_login: new Date(Date.now() - 1000 * 60 * 45).toISOString()
        },
        {
          id: '3',
          auth_uid: null,
          name: 'Amit Verma',
          email: 'amit@dairy.com',
          phone: '+91 98765 43212',
          role: 'delivery_agent' as const,
          metadata: {},
          status: 'active',
          created_at: new Date('2024-03-05').toISOString(),
          last_login: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        },
        {
          id: '4',
          auth_uid: null,
          name: 'Sunita Patel',
          email: 'sunita@dairy.com',
          phone: '+91 98765 43213',
          role: 'manufacturer' as const,
          metadata: {},
          status: 'inactive',
          created_at: new Date('2024-01-20').toISOString(),
          last_login: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
        }
      ]
      return NextResponse.json(mockUsers)
    }
    
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')

    let users: AppUser[]

    if (role) {
      users = await db.select<AppUser>('app_users', '*', { role }, 'created_at DESC')
    } else {
      users = await db.select<AppUser>('app_users', '*', undefined, 'created_at DESC')
    }

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Users fetch error:', error)
    
    // If table doesn't exist, return mock data
    if (error?.code === '42P01') {
      const mockUsers = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh@dairy.com',
          phone: '+91 98765 43210',
          role: 'company_admin',
          status: 'active',
          created_at: new Date('2024-01-15').toISOString(),
          last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        }
      ]
      return NextResponse.json(mockUsers)
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Return success response with mock data if database not configured
    if (!hasDBConfig()) {
      const newUser = {
        id: Date.now().toString(),
        ...body,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }
      return NextResponse.json(newUser, { status: 201 })
    }

    const newUser = await db.insert<AppUser>('app_users', body)

    return NextResponse.json(newUser, { status: 201 })
  } catch (error: any) {
    console.error('User creation error:', error)
    
    // If table doesn't exist, return success with mock data
    if (error?.code === '42P01') {
      const newUser = {
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      return NextResponse.json(newUser, { status: 201 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}
