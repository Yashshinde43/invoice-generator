import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { Header } from "@/components/layout/header"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { SetupModal } from '@/components/setup/SetupModal'
import { getUserBusiness } from '@/app/actions/business-firebase'
import { firestore } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

async function getUserProfile() {
  const cookieStore = await cookies()
  const uid = cookieStore.get('firebase-uid')?.value
  if (!uid) return null

  try {
    const profileDoc = await getDoc(doc(firestore, 'profiles', uid))

    if (!profileDoc.exists()) {
      // Stale cookie — user was deleted from Firebase, clear it
      cookieStore.delete('firebase-uid')
      return null
    }

    return profileDoc.data() as { full_name?: string; email?: string }
  } catch {
    return null
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  const business = await getUserBusiness()

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isSetupPage = pathname === '/dashboard/setup'

  // On setup page, render without sidebar/header for a clean onboarding experience
  if (isSetupPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        {children}
      </div>
    )
  }

  return (
    <>
      <DashboardShell
        header={
          <Header
            userName={profile?.full_name || 'User'}
            userEmail={profile?.email || ''}
            businessName={business ? (business as any).name : 'My Business'}
          />
        }
      >
        {children}
      </DashboardShell>
      {!business && <SetupModal />}
    </>
  );
}
