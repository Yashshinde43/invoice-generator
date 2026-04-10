'use server'

import { collections, firebaseSDK } from '@/lib/firebase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const { getDocs, deleteDoc, query, where, doc } = firebaseSDK

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('firebase-uid')?.value ?? null
}

async function getBusinessId(userId: string): Promise<string | null> {
  const snap = await getDocs(query(collections.businesses, where('user_id', '==', userId)))
  const active = snap.docs.find(d => d.data().is_active !== false)
  return active ? active.id : null
}

async function deleteCollection(col: any, businessId: string) {
  const snap = await getDocs(query(col, where('business_id', '==', businessId)))
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
  return snap.size
}

// ── Clear all business data (invoices, expenses, etc.) ──────────────────────
export async function clearAllData(): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getUserId()
    if (!userId) return { error: 'Not authenticated' }

    const businessId = await getBusinessId(userId)
    if (!businessId) return { error: 'Business not found' }

    await Promise.all([
      deleteCollection(collections.invoices,     businessId),
      deleteCollection(collections.invoiceItems,  businessId),
      deleteCollection(collections.expenses,      businessId),
      deleteCollection(collections.purchases,     businessId),
      deleteCollection(collections.purchaseItems, businessId),
      deleteCollection(collections.payments,      businessId),
      deleteCollection(collections.products,      businessId),
      deleteCollection(collections.stockHistory,  businessId),
    ])

    revalidatePath('/dashboard', 'layout')
    return { success: true }
  } catch (error: any) {
    console.error('clearAllData', error)
    return { error: error.message || 'Failed to clear data' }
  }
}

// ── Delete account — clears all data + removes profile + signs out ──────────
export async function deleteAccount(): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getUserId()
    if (!userId) return { error: 'Not authenticated' }

    const businessId = await getBusinessId(userId)

    if (businessId) {
      // Delete all business collections
      await Promise.all([
        deleteCollection(collections.invoices,     businessId),
        deleteCollection(collections.invoiceItems,  businessId),
        deleteCollection(collections.expenses,      businessId),
        deleteCollection(collections.purchases,     businessId),
        deleteCollection(collections.purchaseItems, businessId),
        deleteCollection(collections.payments,      businessId),
        deleteCollection(collections.products,      businessId),
        deleteCollection(collections.stockHistory,  businessId),
      ])

      // Delete business doc
      const businessSnap = await getDocs(query(collections.businesses, where('user_id', '==', userId)))
      await Promise.all(businessSnap.docs.map(d => deleteDoc(d.ref)))
    }

    // Delete profile doc
    await deleteDoc(doc(collections.profiles, userId))

    // Clear session cookie
    const cookieStore = await cookies()
    cookieStore.delete('firebase-uid')

  } catch (error: any) {
    console.error('deleteAccount', error)
    return { error: error.message || 'Failed to delete account' }
  }

  redirect('/login')
}
