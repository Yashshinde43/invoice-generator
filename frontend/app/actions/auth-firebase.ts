'use server'

import { getApps, initializeApp, getApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbSignUp,
  sendEmailVerification,
} from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const SESSION_COOKIE = 'firebase-uid'

function getFirebaseApp() {
  if (getApps().length > 0) return getApp()
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
}

export async function signIn(state: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const auth = getAuth(getFirebaseApp())
    const credential = await fbSignIn(auth, email, password)

    if (!credential.user.emailVerified) {
      return { error: 'Please verify your email before signing in. Check your inbox for the verification link.' }
    }

    // Store UID in httpOnly cookie for server-side session
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, credential.user.uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Update last login timestamp only — don't overwrite full_name set during signup
    const db = getFirestore(getFirebaseApp())
    await setDoc(
      doc(db, 'profiles', credential.user.uid),
      { updated_at: new Date().toISOString() },
      { merge: true }
    )
  } catch (error: any) {
    console.error('[signIn] Firebase error code:', error.code, '| message:', error.message)
    const { message, hint } = mapFirebaseError(error.code)
    return { error: message, hint }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(state: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  // Clear any stale session cookie before creating a new account
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)

  try {
    const auth = getAuth(getFirebaseApp())
    const credential = await fbSignUp(auth, email, password)

    // Send verification email
    await sendEmailVerification(credential.user)

    // Create profile document in Firestore
    const db = getFirestore(getFirebaseApp())
    await setDoc(doc(db, 'profiles', credential.user.uid), {
      id: credential.user.uid,
      email,
      full_name: name,
      role: 'owner',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Don't set session cookie — user must verify email first
    return {
      success: true,
      message: `We've sent a verification link to ${email}. Please check your inbox and verify your email before signing in.`,
    }
  } catch (error: any) {
    console.error('[signUp] Firebase error code:', error.code, '| message:', error.message)
    const { message } = mapFirebaseError(error.code)
    return { error: message }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  revalidatePath('/', 'layout')
  redirect('/login')
}

/** Read the current user's UID from the session cookie. Use in all server actions. */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

function mapFirebaseError(code: string): { message: string; hint?: string } {
  switch (code) {
    case 'auth/user-not-found':
      return { message: 'No account found with this email.', hint: 'signup' }
    case 'auth/wrong-password':
      return { message: 'Incorrect password. Please try again.' }
    case 'auth/invalid-credential':
      // Firebase v9+ uses this for both wrong password and non-existent user
      return { message: 'No account found or incorrect password.', hint: 'signup' }
    case 'auth/email-already-in-use':
      return { message: 'An account with this email already exists.' }
    case 'auth/weak-password':
      return { message: 'Password must be at least 6 characters.' }
    case 'auth/invalid-email':
      return { message: 'Please enter a valid email address.' }
    case 'auth/too-many-requests':
      return { message: 'Too many failed attempts. Please try again later or reset your password.' }
    case 'auth/network-request-failed':
      return { message: 'Network error. Please check your connection and try again.' }
    default:
      return { message: 'Something went wrong. Please try again.' }
  }
}
