'use server'

import { authSDK, collections } from '@/lib/firebase'
import { revalidatePath } from 'next/cache'

const { getUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut: firebaseSignOut, setSessionCookie } = authSDK

export async function diagnoseAndFixAuth() {
  const results = {
    steps: [] as any[],
    success: false,
    finalUser: null as any,
  }

  try {
    // Step 1: Get current user
    results.steps.push({ step: 1, message: 'Checking auth session...' })

    const { user, error } = await getUser()

    if (error) {
      results.steps.push({ step: 1, status: 'error', message: error })
      return results
    }

    if (!user) {
      results.steps.push({ step: 1, status: 'warning', message: 'No authenticated user found' })
    } else if (user.email) {
      results.steps.push({ step: 1, status: 'success', message: `User found: ${user.email}`, userId: user.uid })
      results.finalUser = { email: user.email, uid: user.uid }
    } else {
      results.steps.push({ step: 1, status: 'warning', message: 'No authenticated user found in session' })
    }

    if (!results.finalUser) {
      return results
    }

    // Step 2: Check if profile exists in Firestore
    results.steps.push({ step: 2, message: 'Checking user profile in Firestore...' })

    try {
      const profileRef = doc(collections.profiles, results.finalUser.uid)
      const profileDoc = await getDoc(profileRef)

      if (profileDoc.exists()) {
        const profileData = profileDoc.data()
        results.steps.push({ step: 2, status: 'success', message: 'Profile found in Firestore', userData: profileData })
      } else {
        results.steps.push({ step: 2, status: 'warning', message: 'No profile found in Firestore' })
      }
    } catch (profileError) {
      results.steps.push({ step: 2, status: 'error', message: `Profile check failed: ${profileError}` })
    }

    // Step 3: Check database connectivity
    results.steps.push({ step: 3, message: 'Testing database connectivity...' })

    try {
      const usersCount = await getCountDocs(collections.users) || await getCountDocs(collections.profiles)
      results.steps.push({ step: 3, status: 'success', message: `Database is operational. Total users: ${usersCount || 'unknown'}` })
    } catch (dbError) {
      results.steps.push({ step: 3, status: 'error', message: `Database connectivity check failed: ${dbError}` })
    }

  } catch (error: any) {
    results.steps.push({ step: 'error', message: error.message })
  }

  return results
}

// Alternative: Try to create a new test user
export async function createTestUser() {
  const results = {
    steps: [] as any[],
    success: false,
    user: null as any,
  }

  try {
    results.steps.push({ step: 1, message: 'Creating new test user...' })

    const testEmail = `test${Date.now()}@invoicebuilder.com`
    const testPassword = 'Test@123456'

    const { user, error } = await createUserWithEmailAndPassword(testEmail, testPassword, { fullName: 'Test User' })

    if (error) {
      results.steps.push({ step: 1, status: 'error', message: error })
      return results
    }

    if (!user) {
      results.steps.push({ step: 1, status: 'error', message: 'User creation failed - no user returned' })
      return results
    }

    results.steps.push({ step: 1, status: 'success', message: 'User created successfully', email: testEmail, userId: user.uid })
    results.success = true
    results.user = { email: testEmail, password: testPassword, id: user.uid }

    // Create profile in Firestore if it doesn't exist
    try {
      const uid = user.uid
      await setDoc(doc(collections.profiles, uid), {
        id: uid,
        email: testEmail,
        full_name: 'Test User',
        role: 'owner',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { merge: true })
      results.steps.push({ step: 2, status: 'success', message: 'Profile created successfully' })
    } catch (profileError) {
      results.steps.push({ step: 2, status: 'warning', message: `Profile creation warning: ${profileError}` })
    }

    // Set Firebase session cookie
    try {
      await setSessionCookie(user)
      results.steps.push({ step: 3, status: 'success', message: 'Session cookie set successfully' })
    } catch (cookieError) {
      results.steps.push({ step: 3, status: 'warning', message: `Cookie setup warning: ${cookieError}` })
    }

    revalidatePath('/diagnose')
  } catch (error: any) {
    results.steps.push({ step: 'error', message: error.message })
  }

  return results
}