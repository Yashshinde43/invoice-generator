'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { signIn as firebaseSignIn, signUp as firebaseSignUp, signOut as firebaseSignOut, getCurrentUser } from '@/lib/firebase/auth'
import { auth, firebaseSDK } from '@/lib/firebase'
import { updateProfile } from 'firebase/auth'

export async function signIn(state: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('Attempting login for:', email)

  const { data, error } = await firebaseSignIn(email, password)

  if (error) {
    console.error('Login error:', error)
    return { error }
  }

  console.log('Login successful, user:', data?.user?.uid)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(state: unknown, formData: FormData) {
  const fullName = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await firebaseSignUp(email, password, fullName)

  if (error) {
    return { error }
  }

  // Update display name
  try {
    const currentUser = auth.currentUser
    if (currentUser) {
      await updateProfile(currentUser, { displayName: fullName })
    }
  } catch (updateError: any) {
    console.error('Error updating display name:', updateError.message)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const { error } = await firebaseSignOut()

  if (error) {
    return { error }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const user = auth.currentUser

  if (!user) {
    return { user: null, error: 'No authenticated user' }
  }

  return {
    user: {
      id: user.uid,
      email: user.email,
      full_name: user.displayName || '',
      metadata: user
    },
    error: null
  }
}
