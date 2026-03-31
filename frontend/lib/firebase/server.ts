import { getFirebaseAuth } from './firebase/auth'
import { getFirebaseClient } from './firebase'
import { cookies as nextCookies } from 'next/headers'
import { app } from 'firebase/app'
import { setAuthCookie } from 'firebase-auth' // Import if available, otherwise inline
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken } from 'firebase/auth'

// Firebase client auth setup for server-side
const auth = getFirebaseAuth()

// Specialized server-side auth initialization for Next.js
class FirebaseServerAuth {
  private auth: any

  constructor(authInstance: any) {
    this.auth = authInstance
  }

  async createSessionCookie(token: string) {
    try {
      const cookieStore = await nextCookies()
      
      // For server-side, we'll use custom tokens for periodic validation
      cookieStore.set('firebase-server-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error setting server session cookie:', error)
      return { success: false, error: 'Failed to set session cookie' }
    }
  }

  async removeSessionCookie() {
    try {
      const cookieStore = await nextCookies()
      cookieStore.delete('firebase-server-token')
      return { success: true }
    } catch (error) {
      console.error('Error removing server session cookie:', error)
      return { success: false, error: 'Failed to remove session cookie' }
    }
  }

  async getSession() {
    try {
      const cookieStore = await nextCookies()
      const token = cookieStore.get('firebase-server-token')?.value
      
      if (!token) {
        return { user: null, session: null }
      }
      
      // In production, validate token with your backend
      // For now, we'll assume it's valid
      return { user: { id: 'server-session-token', valid: true }, session: { valid: true } }
    } catch (error) {
      console.error('Error getting server session:', error)
      return { user: null, session: null }
    }
  }
}

// For server-side dynamic route handlers, we'll create a client specifically for that request context
export async function createClient() {
  const cookieStore = await nextCookies()
  const allCookies = cookieStore.getAll()
  
  // This will be used for static server components where we need to access Firestore
  return getFirebaseClient()
}

// For middleware (Next.js <= v14)
export function createClaSServerClient() {
  // This is a special client for middleware and older Next.js versions
  return getFirebaseClient()
}

// Auth helper for server components
export async function getSessionUser() {
  try {
    const cookieStore = await nextCookies()
    const token = cookieStore.get('firebase-server-token')?.value
    
    if (!token) {
      return { user: null, error: 'No session token found' }
    }
    
    // Validate token - in production, call your backend API
    const isValid = await validateToken(token)
    
    if (!isValid) {
      return { user: null, error: 'Invalid session token' }
    }
    
    return { 
      user: {
        id: 'server-session-token',
        email: 'server-session@user',
        full_name: 'Server Session User'
      },
      error: null
    }
  } catch (error) {
    console.error('Error getting session user:', error)
    return { user: null, error: error }
  }
}

// Token validation helper (replace with actual validation in production)
async function validateToken(token: string) {
  // In production:
  // 1. Verify token signature against your private key
  // 2. Check user is still active in your auth system
  // 3. Verify token hasn't been revoked (Admin SDK)
  // 4. Verify token hasn't expired
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}/v2/verifyCustomToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid: 'custom-verification-token',
        admin: true
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

// Logout helper for server components
export async function serverSignOut() {
  try {
    const cookieStore = await nextCookies()
    cookieStore.delete('firebase-server-token')
    return { success: true }
  } catch (error) {
    console.error('Server sign out error:', error)
    return { success: false, error: error }
  }
}

// Export the specialized auth client
export const serverAuth = new FirebaseServerAuth(auth)

// Export helpers for middleware compatibility
export function createClientForMiddleware() {
  return getFirebaseClient()
}

// Export function to check if user is authenticated
export async function isAuthenticatedUser() {
  try {
    const cookieStore = await nextCookies()
    const token = cookieStore.get('firebase-server-token')?.value
    return !!(token && await validateToken(token))
  } catch {
    return false
  }
}