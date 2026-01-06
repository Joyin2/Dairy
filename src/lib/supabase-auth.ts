import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const supabaseAuth = {
  /**
   * Sign up a new user with email and password
   * Email confirmation is disabled by default for admin signup
   */
  async signUp(email: string, password: string, metadata?: { name?: string; phone?: string; role?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: undefined, // Disable email confirmation redirect
      },
    })

    if (error) {
      console.error('[SUPABASE_AUTH] Signup error:', error)
      throw error
    }
    
    // Check if email confirmation is required
    if (data.user && !data.session) {
      console.warn('[SUPABASE_AUTH] Email confirmation required - user created but no session')
    }
    
    return data
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  /**
   * Refresh session
   */
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return data.session
  },

  /**
   * Verify JWT token
   */
  async verifyToken(token: string) {
    const { data, error } = await supabase.auth.getUser(token)
    if (error) throw error
    return data.user
  },

  /**
   * Update user metadata
   */
  async updateUser(attributes: { email?: string; password?: string; data?: any }) {
    const { data, error } = await supabase.auth.updateUser(attributes)
    if (error) throw error
    return data.user
  },
}

// Server-side auth helpers
export const supabaseAuthServer = {
  /**
   * Verify and decode JWT token on server
   */
  async verifyServerToken(token: string): Promise<{ userId: string; email: string; role?: string } | null> {
    try {
      const { data, error } = await supabase.auth.getUser(token)
      
      if (error || !data.user) {
        return null
      }

      return {
        userId: data.user.id,
        email: data.user.email || '',
        role: data.user.user_metadata?.role,
      }
    } catch (error) {
      console.error('Token verification error:', error)
      return null
    }
  },

  /**
   * Extract token from Authorization header
   */
  extractToken(authHeader: string | null): string | null {
    if (!authHeader) return null
    
    // Support both "Bearer <token>" and raw token
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
    
    return authHeader
  },

  /**
   * Middleware helper to get authenticated user from request
   */
  async getAuthenticatedUser(request: Request) {
    const authHeader = request.headers.get('authorization')
    const token = this.extractToken(authHeader)
    
    if (!token) {
      return null
    }

    return await this.verifyServerToken(token)
  },
}

export default supabase
