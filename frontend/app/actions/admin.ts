'use server'

import {
  collections,
  auth,
  firebaseSDK
} from '@/lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { revalidatePath } from 'next/cache'

const { setDoc, doc } = firebaseSDK

export async function diagnoseAndFixAuth() {
  // auth imported above
  const results = {
    steps: [] as any[],
    success: false,
    finalUser: null as any,
  }

  try {
    // Step 1: Get current user
    results.steps.push({ step: 1, message: 'Checking auth session...' })

    const user = auth.currentUser

    if (!user) {
      results.steps.push({ step: 1, status: 'warning', message: 'No authenticated user found' })
    } else {
      results.steps.push({ step: 1, status: 'success', message: `User found: ${user.email}`, userId: user.uid })
      results.finalUser = { uid: user.uid, email: user.email, metadata: user }
    }

    // Step 2: Check if user can login with email/password
    results.steps.push({ step: 2, message: 'Testing login with credentials...' })

    try {
      await signInWithEmailAndPassword(auth, 'chiragsinghchauhan3949323@gmail.com', 'chirag@123')
      results.steps.push({ step: 2, status: 'success', message: 'Login successful!', session: 'test' })
      results.success = true
      results.finalUser = { uid: 'test-user-id', email: 'chiragsinghchauhan3949323@gmail.com' }
    } catch (signInError: any) {
      results.steps.push({ step: 2, status: 'error', message: signInError.message, error: signInError.message })
    }

  } catch (error: any) {
    results.steps.push({ step: 'error', message: error.message })
  }

  return results
}

// Alternative: Try to create a new test user
export async function createTestUser() {
  // auth imported above
  const results = {
    steps: [] as any[],
    success: false,
    user: null as any,
  }

  try {
    results.steps.push({ step: 1, message: 'Creating new test user...' })

    const testEmail = `test${Date.now()}@invoicebuilder.com`
    const testPassword = 'Test@123456'

    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword)
    const user = userCredential.user

    if (!user) {
      results.steps.push({ step: 1, status: 'error', message: 'User creation failed' })
      return results
    }

    results.steps.push({ step: 1, status: 'success', message: 'User created successfully', email: testEmail, userId: user.uid })
    results.success = true
    results.user = { email: testEmail, password: testPassword, id: user.uid }

  } catch (error: any) {
    results.steps.push({ step: 'error', message: error.message })
  }

  return results
}
