import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { supabaseAuth } from '@/lib/supabase-auth'

export const dynamic = 'force-dynamic'

// Admin code - store this securely in production (env variable)
const VALID_ADMIN_CODES = [
  'DAIRY2024ADMIN',
  'SUPERADMIN123',
  'DAIRYFLOW-ADMIN'
]

// Signup endpoint with Supabase Auth
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, role, admin_code } = body

    // Check if it's admin signup or mobile app signup
    const isMobileSignup = role && (role === 'delivery_agent' || role === 'manufacturer')
    const isAdminSignup = admin_code

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // For admin signup, validate admin code
    if (isAdminSignup && !isMobileSignup) {
      if (!VALID_ADMIN_CODES.includes(admin_code)) {
        return NextResponse.json(
          { error: 'Invalid admin code. Please contact your administrator.' },
          { status: 403 }
        )
      }
    }

    // For mobile signup, validate role
    if (isMobileSignup) {
      if (!role || (role !== 'delivery_agent' && role !== 'manufacturer')) {
        return NextResponse.json(
          { error: 'Invalid role. Must be delivery_agent or manufacturer' },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if email already exists in database
    const existingUsers = await db.custom(
      'SELECT id FROM app_users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Determine user role and status
    const userRole = isMobileSignup ? role : 'company_admin'
    const userStatus = isMobileSignup ? 'pending' : 'active'

    // Sign up with Supabase Auth
    const authData = await supabaseAuth.signUp(
      email.toLowerCase(),
      password,
      {
        name,
        phone: phone || null,
        role: userRole,
      }
    )

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create authentication account' },
        { status: 500 }
      )
    }

    // Create user record in database
    const newUser = await db.insert('app_users', {
      auth_uid: authData.user.id,
      name,
      email: email.toLowerCase(),
      role: userRole,
      phone: phone || null,
      status: userStatus,
      created_at: new Date().toISOString()
    })

    // Different response based on signup type
    if (isMobileSignup) {
      return NextResponse.json({
        success: true,
        message: 'Registration successful! Your account is pending admin approval. You will be able to login once approved.',
        user: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          role: newUser[0].role,
          status: newUser[0].status
        }
      }, { status: 201 })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Admin account created successfully',
        user: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          role: newUser[0].role
        }
      }, { status: 201 })
    }
  } catch (error: any) {
    console.error('[SIGNUP] Full error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
      details: error
    })
    
    // Handle Supabase auth errors
    if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Handle unique constraint violation
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: error.message || 'Signup failed',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    )
  }
}
