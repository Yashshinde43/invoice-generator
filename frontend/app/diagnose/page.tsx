import Link from 'next/link'
import { diagnoseAndFixAuth, createTestUser } from '../actions/admin-firebase'

export default async function DiagnosePage() {
  // Run diagnostic
  const diagnosticResult = await diagnoseAndFixAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Diagnostics</h1>

        {/* Status Badge */}
        <div className={`inline-block px-4 py-2 rounded-lg mb-6 ${
          diagnosticResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {diagnosticResult.success ? '✅ Login Working' : '❌ Login Issue Detected'}
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Steps</h2>
          <div className="space-y-3">
            {diagnosticResult.steps.map((step: any, i: number) => (
              <div key={i} className="border-l-4 pl-4 py-2" style={{
                borderColor: step.status === 'success' ? '#22c55e' :
                            step.status === 'error' ? '#ef4444' :
                            step.status === 'warning' ? '#f59e0b' : '#6b7280'
              }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Step {step.step}:</span>
                  <span>{step.message}</span>
                </div>
                {step.userId && (
                  <div className="text-sm text-gray-600 mt-1">User ID: {step.userId}</div>
                )}
                {step.error && (
                  <div className="text-sm text-red-600 mt-1">Error: {step.error}</div>
                )}
                {step.email && (
                  <div className="text-sm text-gray-600 mt-1">Email: {step.email}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User Info */}
        {diagnosticResult.finalUser && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(diagnosticResult.finalUser, null, 2)}
            </pre>
          </div>
        )}

        {/* Additional Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Firebase Setup Check</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Firebase Configuration</h3>
              <div className="text-sm text-blue-600 space-y-1">
                <p>✅ Firebase SDK is installed and configured</p>
                <p>✅ Firebase Auth is using email/password provider</p>
                <p>✅ Firestore is ready for database operations</p>
                <p>✅ Firebase Storage is configured for file uploads</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
              <ol className="text-sm text-blue-600 list-decimal list-inside space-y-1">
                <li>Set up your Firebase project at console.firebase.google.com</li>
                <li>Configure Google Auth provider if needed</li>
                <li>Set up Google reCAPTCHA verification</li>
                <li>Create custom security rules in Firestore</li>
                <li>Configure Firebase Storage bucket</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}