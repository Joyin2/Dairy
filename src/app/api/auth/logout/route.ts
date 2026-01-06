import { NextRequest, NextResponse } from 'next/server'
import { supabaseAuth } from '@/lib/supabase-auth'

export const dynamic = 'force-dynamic'

// Logout endpoint - Sign out from Supabase Auth
export async function POST(request: NextRequest) {
  try {
    console.log('[LOGOUT] Logout request received')

    // Sign out from Supabase (this invalidates the session)
    await supabaseAuth.signOut()

    console.log('[LOGOUT] User signed out successfully')

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error: any) {
    console.error('[LOGOUT] Error:', error)
    
    // Even if logout fails, return success (client should clear tokens)
    return NextResponse.json({
      success: true,
      message: 'Logged out (with errors)',
      error: error.message
    })
  }
}
