import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// Login endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('[LOGIN] Login attempt for email:', email)

    if (!email || !password) {
      console.log('[LOGIN] Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const users = await db.custom(
      'SELECT * FROM app_users WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    )

    console.log('[LOGIN] Users found:', users.length)

    if (!users || users.length === 0) {
      console.log('[LOGIN] User not found')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]
    console.log('[LOGIN] User found:', { id: user.id, email: user.email, status: user.status, role: user.role })

    // Check if password hash exists
    if (!user.password_hash) {
      console.log('[LOGIN] No password hash found for user')
      return NextResponse.json(
        { error: 'Account not set up for password login' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log('[LOGIN] Password match:', passwordMatch)

    if (!passwordMatch) {
      console.log('[LOGIN] Invalid password')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check user status for mobile users
    if (user.status === 'pending') {
      console.log('[LOGIN] User status is pending')
      return NextResponse.json(
        { error: 'Your account is pending admin approval. Please contact the administrator.' },
        { status: 403 }
      )
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      console.log('[LOGIN] User status is suspended/inactive:', user.status)
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact the administrator.' },
        { status: 403 }
      )
    }

    // Allow login for all active users (admin, delivery_agent, manufacturer)
    console.log('[LOGIN] Login successful for user:', user.email)

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    // Update last login
    await db.custom(
      'UPDATE app_users SET last_login = now() WHERE id = $1',
      [user.id]
    )

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      }
    })
  } catch (error: any) {
    console.error('[LOGIN] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}
