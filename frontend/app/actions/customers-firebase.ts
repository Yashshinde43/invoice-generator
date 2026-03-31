'use server'

import { collections, firebaseSDK } from '@/lib/firebase'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const { getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, doc } = firebaseSDK

// ── Auth helpers ──────────────────────────────────────────────────────────────
async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('firebase-uid')?.value ?? null
}

async function getBusinessId(): Promise<string | null> {
  const userId = await getUserId()
  if (!userId) return null
  const snap = await getDocs(query(collections.businesses, where('user_id', '==', userId)))
  const active = snap.docs.find(d => d.data().is_active !== false)
  return active ? active.id : null
}

// ── Read ──────────────────────────────────────────────────────────────────────
export async function getCustomers() {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return []

    const snap = await getDocs(
      query(collections.customers, where('business_id', '==', businessId), where('is_active', '==', true))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('getCustomers', error)
    return []
  }
}

export async function getCustomer(id: string) {
  try {
    const customerDoc = await getDoc(doc(collections.customers, id))
    if (!customerDoc.exists()) return null
    return { id: customerDoc.id, ...customerDoc.data() }
  } catch (error) {
    console.error('getCustomer', error)
    return null
  }
}

export async function searchCustomers(searchQuery: string) {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return []

    const snap = await getDocs(
      query(collections.customers, where('business_id', '==', businessId), where('is_active', '==', true))
    )
    const q = searchQuery.toLowerCase()
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .filter(c => c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q))
  } catch (error) {
    console.error('searchCustomers', error)
    return []
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────
export async function createCustomer(formData: FormData) {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return { data: null, error: 'Not authenticated' }

    const customerData = {
      business_id:   businessId,
      name:          formData.get('name') as string,
      company_name:  formData.get('company_name') as string  || null,
      email:         formData.get('email') as string         || null,
      phone:         formData.get('phone') as string         || null,
      address:       formData.get('address') as string       || null,
      city:          formData.get('city') as string          || null,
      state:         formData.get('state') as string         || null,
      postal_code:   formData.get('postal_code') as string   || null,
      country:       formData.get('country') as string       || null,
      gst_number:    formData.get('gst_number') as string    || null,
      pan_number:    formData.get('pan_number') as string    || null,
      customer_type: formData.get('customer_type') as string || 'regular',
      notes:         formData.get('notes') as string         || null,
      is_active:     true,
      created_at:    new Date().toISOString(),
      updated_at:    new Date().toISOString(),
    }

    const ref = await addDoc(collections.customers, customerData)
    revalidatePath('/dashboard/customers')
    return { data: { id: ref.id, ...customerData }, error: null }
  } catch (error: any) {
    console.error('createCustomer', error)
    return { data: null, error: error.message }
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  try {
    const updateData: Record<string, any> = {
      name:          formData.get('name') as string,
      company_name:  formData.get('company_name') as string  || null,
      email:         formData.get('email') as string         || null,
      phone:         formData.get('phone') as string         || null,
      address:       formData.get('address') as string       || null,
      city:          formData.get('city') as string          || null,
      state:         formData.get('state') as string         || null,
      postal_code:   formData.get('postal_code') as string   || null,
      country:       formData.get('country') as string       || null,
      gst_number:    formData.get('gst_number') as string    || null,
      pan_number:    formData.get('pan_number') as string    || null,
      customer_type: formData.get('customer_type') as string || 'regular',
      notes:         formData.get('notes') as string         || null,
      updated_at:    new Date().toISOString(),
    }

    await updateDoc(doc(collections.customers, id), updateData)
    revalidatePath('/dashboard/customers')
    return { data: { id, ...updateData }, error: null }
  } catch (error: any) {
    console.error('updateCustomer', error)
    return { data: null, error: error.message }
  }
}

export async function deleteCustomer(id: string) {
  try {
    await updateDoc(doc(collections.customers, id), { is_active: false, updated_at: new Date().toISOString() })
    revalidatePath('/dashboard/customers')
    return { success: true, error: null }
  } catch (error: any) {
    console.error('deleteCustomer', error)
    return { success: false, error: error.message }
  }
}

export async function getCustomersWithInvoiceStats() {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return []

    const [customersSnap, invoicesSnap] = await Promise.all([
      getDocs(query(collections.customers, where('business_id', '==', businessId), where('is_active', '==', true))),
      getDocs(query(collections.invoices, where('business_id', '==', businessId))),
    ])

    // Build per-customer stats from invoices
    const statsMap: Record<string, { count: number; revenue: number; lastDate: string; lastNumber: string }> = {}

    invoicesSnap.docs.forEach(d => {
      const inv = d.data()
      const name: string = inv.customer_name || ''
      const phone: string = inv.customer_phone || ''
      // match by customer_id if set, else by name+phone
      const key = inv.customer_id || `${name}__${phone}`
      if (!key) return
      if (!statsMap[key]) statsMap[key] = { count: 0, revenue: 0, lastDate: '', lastNumber: '' }
      statsMap[key].count++
      statsMap[key].revenue += inv.total_amount || 0
      if (!statsMap[key].lastDate || inv.invoice_date > statsMap[key].lastDate) {
        statsMap[key].lastDate = inv.invoice_date || ''
        statsMap[key].lastNumber = inv.invoice_number || ''
      }
    })

    return customersSnap.docs.map(d => {
      const c = { id: d.id, ...d.data() } as any
      const stats = statsMap[c.id] || statsMap[`${c.name}__${c.phone}`] || { count: 0, revenue: 0, lastDate: '', lastNumber: '' }
      return {
        ...c,
        invoice_count: stats.count,
        total_revenue: stats.revenue,
        last_invoice_date: stats.lastDate || null,
        last_invoice_number: stats.lastNumber || null,
      }
    })
  } catch (error) {
    console.error('getCustomersWithInvoiceStats', error)
    return []
  }
}
