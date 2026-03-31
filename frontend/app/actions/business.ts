'use server'

import { 
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment
} from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface Business {
  id: string
  user_id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  phone?: string
  email?: string
  website?: string
  gst_number?: string
  tax_id?: string
  pan_number?: string
  invoice_prefix?: string
  invoice_number_start?: number
  currency_symbol?: string
  currency_code?: string
  tax_rate?: number
  payment_details?: string
  terms_conditions?: string
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

// Get or create business for user
export async function getUserBusiness(): Promise<Business | null> {
  const user = auth.currentUser

  if (!user) return null

  // Use maybeSingle() instead of single() to handle cases with no businesses gracefully
  const querySnapshot = await getDocs(
    query(
      collection(getFirestore(), 'businesses'),
      where('user_id', '==', user.uid),
      where('is_active', '==', true),
      orderBy('is_default', 'desc'),
      limit(1)
    )
  )

  const businessDoc = querySnapshot.docs[0]
  
  if (!businessDoc) return null

  const userRef = doc(getFirestore(), 'users', user.uid)
  const userDoc = await getDoc(userRef)
  
  const businessData = businessDoc.data()
  return {
    id: businessDoc.id,
    user_id: businessData.user_id,
    name: businessData.name,
    slug: businessData.slug,
    description: businessData.description,
    logo_url: businessData.logo_url,
    address: businessData.address,
    city: businessData.city,
    state: businessData.state,
    country: businessData.country,
    postal_code: businessData.postal_code,
    phone: businessData.phone,
    email: businessData.email,
    website: businessData.website,
    gst_number: businessData.gst_number,
    tax_id: businessData.tax_id,
    pan_number: businessData.pan_number,
    invoice_prefix: businessData.invoice_prefix,
    invoice_number_start: businessData.invoice_number_start,
    currency_symbol: businessData.currency_symbol,
    currency_code: businessData.currency_code,
    tax_rate: businessData.tax_rate,
    payment_details: businessData.payment_details,
    terms_conditions: businessData.terms_conditions,
    is_active: businessData.is_active,
    is_default: businessData.is_default,
    created_at: businessData.created_at,
    updated_at: businessData.updated_at
  }
}

// Get all businesses for user
export async function getUserBusinesses(): Promise<Business[]> {
  return []
}

// Create new business
export async function createBusiness(formData: FormData) {
  const user = auth.currentUser
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string

  revalidatePath('/dashboard')
  return { data: null, error: 'Firebase integration not yet complete' }
}

// Update business
export async function updateBusiness(id: string, formData: FormData) {
  const user = auth.currentUser

  if (!user) {
    return { error: 'Not authenticated' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { data: null, error: 'Firebase integration not yet complete' }
}

// Set default business
export async function setDefaultBusiness(id: string) {
  const user = auth.currentUser

  if (!user) {
    return { error: 'Not authenticated' }
  }

  revalidatePath('/dashboard')
  return { data: null, error: 'Firebase integration not yet complete' }
}

// Delete business
export async function deleteBusiness(id: string) {
  const user = auth.currentUser

  if (!user) {
    return { error: 'Not authenticated' }
  }

  revalidatePath('/dashboard')
  return { success: true, error: null }
}
