import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware to handle CORS for mobile apps
export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || ''
  
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://192.168.31.80:3000',
    process.env.NEXT_PUBLIC_APP_URL || '',
    // Add your production domain when deployed
    'https://your-production-domain.com',
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
