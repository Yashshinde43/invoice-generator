'use server'

import { 
  firestore, 
  collections,
  firebaseSDK,
  authSDK,
  auth 
} from '@/lib/firebase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signIn(state: unknown, formData: FormData) {
  const authInstance = authSDK

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('Attempting login for:', email)

  const { data: userCredential, error } = await authInstance.signInWithEmailAndPassword(
    email,
    password
  )

  if (error) {
    console.error('Login error:', error.message)
    return { error: error.message }
  }

  console.log('Login successful, user:', userCredential.user?.uid)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(state: unknown, formData: FormData) {
  const authInstance = authSDK
  const userAuth = auth

  const fullName = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { user: newUserCredential, error } = await authInstance.createUserWithEmailAndPassword(
    email,
    password
  )

  if (error) {
    return { error: error.message }
  }

  // Update user display name
  try {
    await userAuth.updateUser({
      displayName: fullName
    })
  } catch (updateError: any) {
    console.error('Error updating display name:', updateError.message)
  }

  // Email confirmation disabled - user is automatically logged in
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const authInstance = authSDK
  const userAuth = auth

  const { error } = await authInstance.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const userAuth = auth
  
  const user = userAuth.currentUser

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
