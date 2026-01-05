import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Middleware to handle CORS and authentication
export async function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || ''
  
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://192.168.31.80:3000',
    process.env.NEXT_PUBLIC_APP_URL || '',
    'https://dairy-joyins-projects.vercel.app',
  ].filter(Boolean)

  // Check if origin is allowed or if it's a mobile app (no origin header)
  const isAllowed = allowedOrigins.includes(origin) || !origin

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    
    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
    }
    
    return response
  }

  // Check authentication for admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login') &&
      !request.nextUrl.pathname.startsWith('/admin/signup')) {
    
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // Get session token from cookie or Authorization header
      const authHeader = request.headers.get('authorization')
      const sessionToken = authHeader?.replace('Bearer ', '') || 
                          request.cookies.get('sb-access-token')?.value

      if (!sessionToken) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Verify the session
      const { data: { user }, error } = await supabase.auth.getUser(sessionToken)
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Check if user is admin
      const role = user.user_metadata?.role
      if (role !== 'company_admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Handle actual requests
  const response = NextResponse.next()

  // Add CORS headers to API routes for mobile apps
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    }
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/api/:path*',
    // Don't run on static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
