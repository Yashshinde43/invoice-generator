'use server'

import { collections, firebaseSDK } from '@/lib/firebase'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const { getDocs, query, where, doc, addDoc, updateDoc } = firebaseSDK

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('firebase-uid')?.value ?? null
}

export async function getUserBusiness() {
  try {
    const userId = await getUserId()
    if (!userId) return null

    // Single where clause avoids needing a composite index
    const snapshot = await getDocs(
      query(collections.businesses, where('user_id', '==', userId))
    )

    if (snapshot.empty) return null

    const active = snapshot.docs.find(d => d.data().is_active !== false)
    if (!active) return null

    return { id: active.id, ...active.data() }
  } catch (error: any) {
    console.error('getUserBusiness error:', error)
    return null
  }
}

export async function getUserBusinesses() {
  try {
    const userId = await getUserId()
    if (!userId) return []

    const snapshot = await getDocs(
      query(collections.businesses, where('user_id', '==', userId))
    )

    return snapshot.docs
      .filter(d => d.data().is_active !== false)
      .map(d => ({ id: d.id, ...d.data() }))
  } catch (error: any) {
    console.error('getUserBusinesses error:', error)
    return []
  }
}

export async function createBusiness(formData: FormData) {
  try {
    const userId = await getUserId()
    if (!userId) return { data: null, error: 'Not authenticated' }

    const name = formData.get('name') as string
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    const existing = await getDocs(
      query(collections.businesses, where('user_id', '==', userId))
    )
    const isFirst = existing.empty || existing.docs.every(d => d.data().is_active === false)

    const businessData = {
      user_id: userId,
      name,
      slug,
      phone: formData.get('phone') || null,
      email: formData.get('email') || null,
      address: formData.get('address') || null,
      city: formData.get('city') || null,
      state: formData.get('state') || null,
      country: formData.get('country') || null,
      postal_code: formData.get('postal_code') || null,
      gst_number: formData.get('gst_number') || null,
      tax_id: formData.get('tax_id') || null,
      pan_number: formData.get('pan_number') || null,
      tax_rate: parseFloat(formData.get('tax_rate') as string) || 18,
      currency_symbol: (formData.get('currency_symbol') as string) || '₹',
      payment_details: (formData.get('payment_details') as string) || null,
      terms_conditions: (formData.get('terms_conditions') as string) || null,
      is_default: isFirst,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const ref = await addDoc(collections.businesses, businessData)
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/setup')
    return { data: { id: ref.id, ...businessData }, error: null }
  } catch (error: any) {
    console.error('createBusiness error:', error)
    return { data: null, error: error.message }
  }
}

export async function updateBusiness(id: string, formData: FormData) {
  try {
    const userId = await getUserId()
    if (!userId) return { data: null, error: 'Not authenticated' }

    const name = formData.get('name') as string
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    const updateData: Record<string, any> = {
      name,
      slug,
      address: formData.get('address') as string || null,
      city: formData.get('city') as string || null,
      state: formData.get('state') as string || null,
      country: formData.get('country') as string || null,
      postal_code: formData.get('postal_code') as string || null,
      phone: formData.get('phone') as string || null,
      email: formData.get('email') as string || null,
      gst_number: formData.get('gst_number') as string || null,
      tax_id: formData.get('tax_id') as string || null,
      pan_number: formData.get('pan_number') as string || null,
      currency_symbol: formData.get('currency_symbol') as string || null,
      tax_rate: parseFloat(formData.get('tax_rate') as string) || null,
      payment_details: formData.get('payment_details') as string || null,
      terms_conditions: formData.get('terms_conditions') as string || null,
      updated_at: new Date().toISOString(),
    }

    await updateDoc(doc(collections.businesses, id), updateData)
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/setup')
    return { data: { id, ...updateData }, error: null }
  } catch (error: any) {
    console.error('updateBusiness error:', error)
    return { data: null, error: error.message }
  }
}

export async function setDefaultBusiness(id: string) {
  try {
    const userId = await getUserId()
    if (!userId) return { error: 'Not authenticated' }

    const snapshot = await getDocs(
      query(collections.businesses, where('user_id', '==', userId), where('is_active', '==', true))
    )

    for (const businessDoc of snapshot.docs) {
      if (businessDoc.data().is_default && businessDoc.id !== id) {
        await updateDoc(doc(collections.businesses, businessDoc.id), {
          is_default: false,
          updated_at: new Date().toISOString(),
        })
      }
    }

    await updateDoc(doc(collections.businesses, id), {
      is_default: true,
      updated_at: new Date().toISOString(),
    })

    revalidatePath('/dashboard')
    return { data: { id }, error: null }
  } catch (error: any) {
    console.error('setDefaultBusiness error:', error)
    return { data: null, error: error.message }
  }
}

export async function deleteBusiness(id: string) {
  try {
    const userId = await getUserId()
    if (!userId) return { error: 'Not authenticated' }

    await updateDoc(doc(collections.businesses, id), {
      is_active: false,
      updated_at: new Date().toISOString(),
    })

    revalidatePath('/dashboard')
    return { success: true, error: null }
  } catch (error: any) {
    console.error('deleteBusiness error:', error)
    return { error: error.message }
  }
}
