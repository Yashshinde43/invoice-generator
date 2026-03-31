import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  const results: any = { steps: [] }

  try {
    // Step 1: Test auth status
    results.steps.push({ step: 1, message: 'Testing Firebase connection...' })

    const user = auth.currentUser
    results.steps.push({ step: 1, status: user ? 'success' : 'error', message: user ? 'Connection OK' : 'No user found', hasUser: !!user })

    // Step 2: Try to create a new test user
    results.steps.push({ step: 2, message: 'Creating new test user...' })

    const testEmail = `test${Date.now()}@gmail.com`
    const testPassword = 'TestPassword123!'

    try {
      await auth.createUserWithEmailAndPassword(testEmail, testPassword)
      results.steps.push({
        step: 2,
        status: 'success',
        message: 'User created',
        userId: 'test-user-id',
        email: testEmail,
        hasSession: true
      })
      results.success = true
      results.credentials = { email: testEmail, password: testPassword }
    } catch (signUpError: any) {
      results.steps.push({
        step: 2,
        status: 'error',
        message: signUpError?.message || 'User creation failed',
        error: signUpError?.message
      })
    }

  } catch (error: any) {
    results.steps.push({ step: 'error', message: error.message, error: String(error) })
  }

  return NextResponse.json(results)
}
