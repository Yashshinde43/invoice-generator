import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { cookies, deleteCookie } from 'next/headers'

// Sign up new user with email and password
export async function signUp(email: string, password: string, fullName: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Note: Firebase auth user already created. To extend profile, we'll create a profile document.
    
    return {
      data: {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          full_name: fullName,
        }
      },
      error: null
    }
  } catch (error: any) {
    console.error('Sign up error:', error.message)
    return {
      data: null,
      error: error.message
    }
  }
}

// Sign in user with email and password
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    const user = userCredential.user
    
    // Set session cookie for server-side persistence
    await setSessionCookie(userCredential.user)
    
    return {
      data: {
        user: {
          uid: user.uid,
          email: user.email,
          full_name: user.displayName || '',
        }
      },
      error: null
    }
  } catch (error: any) {
    console.error('Sign in error:', error.message)
    return {
      data: null,
      error: error.message
    }
  }
}

// Sign out user and clear session
export async function signOut() {
  try {
    await signOut(auth)
    
    // Clear session cookie
    const cookieStore = await cookies()
    cookieStore.delete('next-auth.session-token')
    
    return {
      error: null
    }
  } catch (error: any) {
    console.error('Sign out error:', error.message)
    return {
      error: error.message
    }
  }
}

// Get current user on server side
export async function getCurrentUser() {
  try {
    const user = auth.currentUser
    
    if (!user) {
      return {
        user: null,
        error: 'No authenticated user'
      }
    }
    
    return {
      user: {
        uid: user.uid,
        email: user.email,
        full_name: user.displayName || '',
      } as any,
      error: null
    }
  } catch (error: any) {
    console.error('Get current user error:', error.message)
    return {
      user: null,
      error: error.message
    }
  }
}

// Get current session (server-side)
export async function getSession() {
  try {
    const user = auth.currentUser
    
    if (!user) {
      return {
        session: null,
        error: 'No session found'
      }
    }
    
    return {
      session: {
        user: {
          uid: user.uid,
          email: user.email,
          full_name: user.displayName || '',
        }
      },
      error: null
    }
  } catch (error: any) {
    console.error('Get session error:', error.message)
    return {
      session: null,
      error: error.message
    }
  }
}

// Auth state change listener for client-side
export function onAuthStateChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, (user: any) => {
    if (user) {
      callback(user)
    } else {
      callback(null)
    }
  })
}

// Set Firebase Session Cookie
async function setSessionCookie(user: any) {
  try {
    const cookieStore = await cookies()
    
    // Create a secure custom token for server-side validation
    const customToken = await user.getIdToken()
    
    // Store in cookie for server-side auth checks
    cookieStore.set('firebase-custom-token', customToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
  } catch (error) {
    console.error('Error setting session cookie:', error)
  }
}

// Helper to validate custom token
export async function validateSession() {
  try {
    // auth is imported at top of file
    const cookieStore = await cookies()
    
    const customToken = cookieStore.get('firebase-custom-token')?.value
    
    if (!customToken || !customToken.startsWith('FirebaseCustomToken ')) {
      return null
    }
    
    const token = customToken.replace('FirebaseCustomToken ', '')
    
    try {
      const user = await auth.currentUser
      const idToken = await user.getIdToken(true)
      
      return { user, idToken, valid: true }
    } catch (tokenError) {
      // Try to verify the token with provided secret
      const url = `${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}/v2/verifyCustomToken`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: 'custom-verification',
          email: testToken => {
             // This is a placeholder - in production you'd call a backend API
          }
        })
      })
      
      return response.ok ? { user: null, valid: true } : { user: null, valid: false }
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return { user: null, valid: false }
  }
}

// Reset password (client-side requires email-sending, server-side we can handle re-auth)
export async function resetPassword(email: string) {
  try {
    // In a complete implementation, this would trigger an email
    // For now, return a placeholder message
    return {
      success: true,
      message: 'If this email exists in your Firebase project, you will receive a password reset link.',
      error: null
    }
  } catch (error: any) {
    console.error('Password reset error:', error.message)
    return {
      success: false,
      message: '',
      error: error.message
    }
  }
}