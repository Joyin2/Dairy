import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { supabaseAuth } from '@/lib/supabase-auth'

export const dynamic = 'force-dynamic'

// Login endpoint with Supabase Auth
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

    // Authenticate with Supabase Auth
    console.log('[LOGIN] Authenticating with Supabase')
    const authData = await supabaseAuth.signIn(email.toLowerCase(), password)
    
    if (!authData.user || !authData.session) {
      console.log('[LOGIN] Supabase authentication failed')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[LOGIN] Supabase auth successful for:', authData.user.id)

    // Get user data from database
    const users = await db.custom(
      'SELECT * FROM app_users WHERE auth_uid = $1 OR email = $2 LIMIT 1',
      [authData.user.id, email.toLowerCase()]
    )

    let user
    if (!users || users.length === 0) {
      // Create user record if doesn't exist (first time Supabase user)
      console.log('[LOGIN] Creating new user record for Supabase user')
      const newUser = await db.insert('app_users', {
        auth_uid: authData.user.id,
        email: email.toLowerCase(),
        name: authData.user.user_metadata?.name || email.split('@')[0],
        role: authData.user.user_metadata?.role || 'company_admin',
        phone: authData.user.user_metadata?.phone || null,
        status: 'active',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
      user = newUser[0]
    } else {
      user = users[0]
      console.log('[LOGIN] User found:', { id: user.id, email: user.email, status: user.status, role: user.role })

      // Update auth_uid if not set
      if (!user.auth_uid) {
        console.log('[LOGIN] Updating auth_uid for existing user')
        await db.update('app_users', 
          { auth_uid: authData.user.id },
          { id: user.id }
        )
        user.auth_uid = authData.user.id
      }
    }

    // Check user status for mobile users
    if (user.status === 'pending') {
      console.log('[LOGIN] User status is pending')
      await supabaseAuth.signOut() // Sign out from Supabase
      return NextResponse.json(
        { error: 'Your account is pending admin approval. Please contact the administrator.' },
        { status: 403 }
      )
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      console.log('[LOGIN] User status is suspended/inactive:', user.status)
      await supabaseAuth.signOut() // Sign out from Supabase
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact the administrator.' },
        { status: 403 }
      )
    }

    // Update last login
    await db.custom(
      'UPDATE app_users SET last_login = now() WHERE id = $1',
      [user.id]
    )

    console.log('[LOGIN] Login successful for user:', user.email)

    // Return success with token and user data
    return NextResponse.json({
      success: true,
      data: {
        token: authData.session.access_token, // Use Supabase JWT
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at,
        user: {
          id: user.id,
          auth_uid: user.auth_uid,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          status: user.status,
          lastLogin: user.last_login
        }
      }
    })
  } catch (error: any) {
    console.error('[LOGIN] Error:', error)
    
    // Handle specific auth errors
    if (error.message?.includes('Invalid login credentials')) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    if (error.message?.includes('Email not confirmed')) {
      return NextResponse.json(
        { error: 'Please confirm your email before logging in' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}
