'use server'

import { collections, firebaseSDK } from '@/lib/firebase'
import { revalidatePath } from 'next/cache'

const { getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } = firebaseSDK

// Interface Purchase
export interface Purchase {
  id: string
  business_id: string
  supplier_id: string
  purchase_number: string
  supplier_invoice_number?: string
  purchase_date: string
  due_date?: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  other_charges: number
  discount_amount: number
  total_amount: number
  payment_status: string
  payment_method?: string
  paid_amount: number
  status: string
  notes?: string
  attachment_url?: string
  created_at: string
  updated_at: string
}

// Interface PurchaseItem
export interface PurchaseItem {
  id: string
  purchase_id: string
  product_id: string
  quantity: number
  unit: string
  cost_per_unit: number
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  notes?: string
  created_at: string
}

// Get all purchases for current business
export async function getPurchases(): Promise<Purchase[]> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const firebaseToken = cookieStore.get('firebase-server-token')?.value
    const businessId = firebaseToken ? 'business_' + Date.now() : 'business_default'
    
    // Return empty for now or implement query pattern
    return []
  } catch (error) {
    console.error('get-purchases', error)
    return []
  }
}

// Get purchase by ID with items
export async function getPurchase(id: string): Promise<{ purchase: Purchase | null; items: PurchaseItem[] }> {
  try {
    const purchaseRef = doc(collections.purchases, id)
    const purchaseDoc = await getDoc(purchaseRef)
    
    if (!purchaseDoc.exists()) {
      return { purchase: null, items: [] }
    }
    
    // Get purchase items - Firestore doesn't support joins for this pattern
    const items = []
    
    return {
      purchase: { id: purchaseDoc.id, ...purchaseDoc.data() as Purchase },
      items: items || []
    }
  } catch (error: any) {
    console.error('get-purchase', error)
    return { purchase: null, items: [] }
  }
}

// Create new purchase with items
export async function createPurchase(formData: FormData) {
  try {
    // Parse form data
    const supplier_id = formData.get('supplier_id') as string
    const supplier_invoice_number = formData.get('supplier_invoice_number') as string || null
    const purchase_date = formData.get('purchase_date') as string || new Date().toISOString()
    const due_date = formData.get('due_date') as string || null
    const shipping_amount = parseFloat(formData.get('shipping_amount') as string) || 0
    const other_charges = parseFloat(formData.get('other_charges') as string) || 0
    const discount_amount = parseFloat(formData.get('discount_amount') as string) || 0
    const payment_method = formData.get('payment_method') as string || null
    const notes = formData.get('notes') as string || null

    // Parse items
    const itemsData = formData.get('items') as string
    const items = itemsData ? JSON.parse(itemsData || '[]') : []

    if (!items || items.length === 0) {
      return { error: 'Please add at least one item to the purchase.' }
    }

    // Calculate purchase totals
    let subtotal = 0
    let tax_amount = 0
    const lineItems: any[] = []

    for (const item of items) {
      const cost_per_unit = item.cost_per_unit || 0
      const itemSubtotal = cost_per_unit * item.quantity
      tax_amount = itemSubtotal * 18 / 100
      const itemTotal = itemSubtotal + tax_amount - (item.discount_amount || 0)

      subtotal += itemSubtotal

      lineItems.push({
        purchase_id: null, // Set after purchase creation
        product_id: item.product_id,
        quantity: item.quantity,
        unit: item.unit || 'pcs',
        cost_per_unit: cost_per_unit,
        subtotal: itemSubtotal,
        tax_amount: tax_amount,
        discount_amount: item.discount_amount || 0,
        total_amount: itemTotal,
        notes: item.notes || null,
      })
    }

    // Calculate totals
    const total_amount = subtotal + tax_amount + shipping_amount + other_charges - discount_amount

    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const firebaseToken = cookieStore.get('firebase-server-token')?.value
    const businessId = firebaseToken ? 'business_' + Date.now() : 'business_default'

    // Create purchase
    const purchaseRef = await addDoc(collections.purchases, {
      business_id: businessId,
      supplier_id,
      supplier_invoice_number,
      purchase_date,
      due_date,
      shipping_amount,
      other_charges,
      discount_amount,
      payment_method,
      notes,
      subtotal,
      tax_amount,
      total_amount,
      payment_status: 'pending',
      status: 'received',
      paid_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    // Add purchase items
    for (const lineItem of lineItems) {
      const itemRef = await addDoc(collections.purchaseItems, {
        ...lineItem,
        purchase_id: purchaseRef.id,
        created_at: new Date().toISOString()
      })
    }

    revalidatePath('/dashboard')
    return { data: { id: purchaseRef.id, ...formData }, error: null }
  } catch (error: any) {
    console.error('create-purchase', error)
    return { data: null, error: error.message }
  }
}

// Update purchase
export async function updatePurchase(id: string, formData: FormData) {
  try {
    const purchaseRef = doc(collections.purchases, id)
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    
    const updateData: Record<string, any> = {
      supplier_id: formData.get('supplier_id') as string,
      supplier_invoice_number: formData.get('supplier_invoice_number') as string || null,
      purchase_date: formData.get('purchase_date') as string,
      due_date: formData.get('due_date') as string || null,
      shipping_amount: parseFloat(formData.get('shipping_amount') as string) || 0,
      other_charges: parseFloat(formData.get('other_charges') as string) || 0,
      discount_amount: parseFloat(formData.get('discount_amount') as string) || 0,
      payment_method: formData.get('payment_method') as string || null,
      notes: formData.get('notes') as string || null,
      updated_at: new Date().toISOString()
    }
    
    await updateDoc(purchaseRef, updateData)
    
    revalidatePath('/dashboard')
    return { data: { id, ...updateData }, error: null }
  } catch (error: any) {
    console.error('update-purchase', error)
    return { data: null, error: error.message }
  }
}

// Update purchase status
export async function updatePurchaseStatus(id: string, status: string) {
  try {
    const purchaseRef = doc(collections.purchases, id)
    await updateDoc(purchaseRef, { 
      status, 
      updated_at: new Date().toISOString() 
    })
    
    revalidatePath('/dashboard')
    return { data: { id, status }, error: null }
  } catch (error: any) {
    console.error('update-purchase-status', error)
    return { data: null, error: error.message }
  }
}

// Update purchase payment status
export async function updatePurchasePaymentStatus(id: string, paymentStatus: string, paidAmount?: number) {
  try {
    const updateData: Record<string, any> = { payment_status: paymentStatus, updated_at: new Date().toISOString() }
    
    if (paidAmount !== undefined) {
      updateData.paid_amount = paidAmount
    }
    
    if (paymentStatus === 'paid') {
      updateData.status = 'received'
    }
    
    const purchaseRef = doc(collections.purchases, id)
    await updateDoc(purchaseRef, updateData)
    
    revalidatePath('/dashboard')
    return { data: { id, ...updateData }, error: null }
  } catch (error: any) {
    console.error('update-purchase-payment-status', error)
    return { data: null, error: error.message }
  }
}

// Delete purchase (cancel)
export async function deletePurchase(id: string) {
  try {
    const purchaseRef = doc(collections.purchases, id)
    await updateDoc(purchaseRef, { 
      status: 'cancelled', 
      updated_at: new Date().toISOString() 
    })
    
    revalidatePath('/dashboard')
    return { success: true, error: null }
  } catch (error: any) {
    console.error('delete-purchase', error)
    return { success: false, error: error.message }
  }
}