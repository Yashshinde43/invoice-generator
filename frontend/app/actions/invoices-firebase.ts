'use server'

import { collections, firebaseSDK } from '@/lib/firebase'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { cookies } from 'next/headers'

const { getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, doc } = firebaseSDK

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

// Custom interface for invoice
export interface Invoice {
  id: string
  business_id: string
  customer_id?: string
  invoice_number: string
  invoice_date: string
  due_date?: string
  subtotal: number
  tax_amount: number
  tax_rate: number
  shipping_amount: number
  other_charges: number
  discount_amount: number
  discount_type: string
  total_amount: number
  cost_of_goods_sold: number
  payment_status: string
  payment_method?: string
  paid_amount: number
  status: string
  customer_name?: string
  customer_address?: string
  customer_phone?: string
  customer_gst?: string
  notes?: string
  terms_conditions?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string
  product_name: string
  description?: string
  quantity: number
  unit: string
  price_per_unit: number
  cost_per_unit: number
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  notes?: string
  created_at: string
}

// Get all invoices for current business
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return []

    const snap = await getDocs(
      query(collections.invoices, where('business_id', '==', businessId))
    )
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }) as Invoice)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  } catch (error) {
    console.error('getInvoices', error)
    return []
  }
}

// Get recent invoices for dashboard
export async function getRecentInvoices(limitCount: number = 5): Promise<Invoice[]> {
  try {
    const invoices = await getInvoices()
    return invoices.slice(0, limitCount)
  } catch (error) {
    console.error('getRecentInvoices', error)
    return []
  }
}

// Get invoice by ID with items
export async function getInvoice(id: string): Promise<{ invoice: Invoice | null; items: InvoiceItem[] }> {
  try {
    const invoiceRef = doc(collections.invoices, id)
    const invoiceDoc = await getDoc(invoiceRef)
    
    if (!invoiceDoc.exists()) {
      return { invoice: null, items: [] }
    }
    
    const itemsSnap = await getDocs(
      query(collections.invoiceItems, where('invoice_id', '==', id))
    )
    const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as InvoiceItem[]

    return {
      invoice: { id: invoiceDoc.id, ...invoiceDoc.data() } as Invoice,
      items,
    }
  } catch (error: any) {
    console.error('get-invoice', error)
    return { invoice: null, items: [] }
  }
}

// Get dashboard stats from real Firebase data
export async function getDashboardStats() {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return { today_sales: 0, today_profit: 0, today_invoices: 0, low_stock_count: 0 }

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const todayStr = todayStart.toISOString().split('T')[0]

    const [invoicesSnap, productsSnap] = await Promise.all([
      getDocs(query(collections.invoices, where('business_id', '==', businessId))),
      getDocs(query(collections.products,  where('business_id', '==', businessId), where('is_active', '==', true))),
    ])

    let today_sales = 0, today_profit = 0, today_invoices = 0
    invoicesSnap.docs.forEach(d => {
      const data = d.data()
      if (data.invoice_date === todayStr && data.status !== 'cancelled') {
        today_invoices++
        today_sales  += data.total_amount        || 0
        today_profit += data.profit_amount       || 0
      }
    })

    const low_stock_count = productsSnap.docs.filter(d => {
      const p = d.data()
      return p.is_track_stock && (p.current_stock ?? 0) <= (p.low_stock_threshold ?? 10)
    }).length

    return { today_sales, today_profit, today_invoices, low_stock_count }
  } catch (error) {
    console.error('getDashboardStats', error)
    return { today_sales: 0, today_profit: 0, today_invoices: 0, low_stock_count: 0 }
  }
}

// Create new invoice with items
export async function createInvoice(formData: FormData) {
  try {
    // Parse form data
    const customer_id = formData.get('customer_id') as string || null
    const customer_name = formData.get('customer_name') as string || null
    const customer_address = formData.get('customer_address') as string || null
    const customer_phone = formData.get('customer_phone') as string || null
    const customer_gst = formData.get('customer_gst') as string || null
    const invoice_date = formData.get('invoice_date') as string || new Date().toISOString()
    const due_date = formData.get('due_date') as string || null
    const tax_rate = parseFloat(formData.get('tax_rate') as string) || 18
    const shipping_amount = parseFloat(formData.get('shipping_amount') as string) || 0
    const other_charges = parseFloat(formData.get('other_charges') as string) || 0
    const discount_amount = parseFloat(formData.get('discount_amount') as string) || 0
    const discount_type = formData.get('discount_type') as string || 'amount'
    const payment_method = formData.get('payment_method') as string || null
    const status = formData.get('status') as string || 'draft'
    const notes = formData.get('notes') as string || null
    const terms_conditions = formData.get('terms_conditions') as string || null

    // Parse items
    const itemsData = formData.get('items') as string
    const items = itemsData ? JSON.parse(itemsData || '[]') : []

    // Calculate invoice totals
    let subtotal = 0
    let cost_of_goods_sold = 0
    const lineItems: any[] = []

    for (const item of items) {
      const cost_per_unit = item.cost_per_unit || 0
      const lineSubtotal = item.price_per_unit * item.quantity
      const lineDiscount = item.discount_amount || 0
      const lineTotal = lineSubtotal - lineDiscount
      const tax_amount = lineTotal * tax_rate / 100

      subtotal += lineTotal
      cost_of_goods_sold += cost_per_unit * item.quantity

      lineItems.push({
        product_id: item.product_id || null,
        product_name: item.product_name,
        description: item.description || null,
        quantity: item.quantity,
        unit: item.unit || 'pcs',
        price_per_unit: item.price_per_unit,
        cost_per_unit,
        subtotal: lineTotal,
        tax_amount,
        discount_amount: lineDiscount,
        total_amount: lineTotal + tax_amount,
        notes: item.notes || null,
      })
    }

    // Calculate discount and totals
    let discount = discount_amount
    if (discount_type === 'percentage') {
      discount = subtotal * discount_amount / 100
    }

    const tax_amount = subtotal * tax_rate / 100
    const total_amount = subtotal + tax_amount + shipping_amount + other_charges - discount
    const profit_amount = total_amount - cost_of_goods_sold - tax_amount

    const businessId = await getBusinessId()
    if (!businessId) return { data: null, error: 'Not authenticated' }

    // Generate unique sequential invoice number
    const existingSnap = await getDocs(query(collections.invoices, where('business_id', '==', businessId)))
    const nextNum = existingSnap.size + 1
    const invoice_number = `INV-${String(nextNum).padStart(6, '0')}`

    // Create invoice
    const invoiceRef = await addDoc(collections.invoices, {
      business_id: businessId,
      customer_id,
      invoice_number,
      invoice_date,
      due_date,
      tax_rate,
      shipping_amount,
      other_charges,
      discount_amount,
      discount_type,
      subtotal,
      tax_amount,
      total_amount,
      cost_of_goods_sold,
      profit_amount,
      payment_method,
      payment_status: 'unpaid',
      paid_amount: 0,
      status,
      customer_name,
      customer_address,
      customer_phone,
      customer_gst,
      notes,
      terms_conditions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    // Add invoice items
    for (const lineItem of lineItems) {
      const itemRef = await addDoc(collections.invoiceItems, {
        invoice_id: invoiceRef.id,
        ...lineItem,
        created_at: new Date().toISOString()
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/invoices')
    return { data: { id: invoiceRef.id, invoice_number }, error: null }
  } catch (error: any) {
    console.error('create-invoice', error)
    return { data: null, error: error.message }
  }
}

// Update invoice
export async function updateInvoice(id: string, formData: FormData) {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const firebaseToken = cookieStore.get('firebase-server-token')?.value
    
    const updateData: Record<string, any> = {
      customer_id: formData.get('customer_id') as string || null,
      invoice_date: formData.get('invoice_date') as string,
      due_date: formData.get('due_date') as string || null,
      tax_rate: parseFloat(formData.get('tax_rate') as string) || 0,
      shipping_amount: parseFloat(formData.get('shipping_amount') as string) || 0,
      other_charges: parseFloat(formData.get('other_charges') as string) || 0,
      discount_amount: parseFloat(formData.get('discount_amount') as string) || 0,
      discount_type: formData.get('discount_type') as string || 'amount',
      payment_method: formData.get('payment_method') as string || null,
      customer_name: formData.get('customer_name') as string || null,
      customer_address: formData.get('customer_address') as string || null,
      customer_phone: formData.get('customer_phone') as string || null,
      customer_gst: formData.get('customer_gst') as string || null,
      notes: formData.get('notes') as string || null,
      terms_conditions: formData.get('terms_conditions') as string || null,
      updated_at: new Date().toISOString()
    }
    
    const invoiceRef = doc(collections.invoices, id)
    await updateDoc(invoiceRef, updateData)
    
    revalidatePath('/dashboard')
    return { data: { id, ...updateData }, error: null }
  } catch (error: any) {
    console.error('update-invoice', error)
    return { data: null, error: error.message }
  }
}

// Update invoice status
export async function updateInvoiceStatus(id: string, status: string) {
  try {
    const invoiceRef = doc(collections.invoices, id)
    await updateDoc(invoiceRef, { 
      status, 
      updated_at: new Date().toISOString() 
    })
    
    revalidatePath('/dashboard')
    return { data: { id, status }, error: null }
  } catch (error: any) {
    console.error('update-invoice-status', error)
    return { data: null, error: error.message }
  }
}

// Update invoice payment status
export async function updateInvoicePaymentStatus(id: string, paymentStatus: string, paidAmount?: number) {
  try {
    const updateData: Record<string, any> = { payment_status: paymentStatus, updated_at: new Date().toISOString() }
    
    if (paidAmount !== undefined) {
      updateData.paid_amount = paidAmount
    }
    
    if (paymentStatus === 'paid') {
      updateData.status = 'paid'
    } else if (paymentStatus === 'partial') {
      updateData.status = 'sent'
    }
    
    const invoiceRef = doc(collections.invoices, id)
    await updateDoc(invoiceRef, updateData)
    
    revalidatePath('/dashboard')
    return { data: { id, ...updateData }, error: null }
  } catch (error: any) {
    console.error('update-invoice-payment-status', error)
    return { data: null, error: error.message }
  }
}

// Delete invoice and its items from Firebase
export async function deleteInvoice(id: string) {
  try {
    // Delete all invoice items first
    const itemsSnap = await getDocs(query(collections.invoiceItems, where('invoice_id', '==', id)))
    await Promise.all(itemsSnap.docs.map(d => deleteDoc(d.ref)))

    // Delete the invoice document
    await deleteDoc(doc(collections.invoices, id))

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/invoices')
    return { success: true, error: null }
  } catch (error: any) {
    console.error('delete-invoice', error)
    return { success: false, error: error.message }
  }
}

// Get full invoice data for PDF generation
export async function getInvoicePDFData(invoiceId: string) {
  try {
    const invoiceDoc = await getDoc(doc(collections.invoices, invoiceId))
    if (!invoiceDoc.exists()) return { data: null, error: 'Invoice not found' }

    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() }

    // Fetch invoice items
    const itemsSnap = await getDocs(
      query(collections.invoiceItems, where('invoice_id', '==', invoiceId))
    )
    const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Fetch business details
    const businessId = await getBusinessId()
    let business = null
    if (businessId) {
      const bizDoc = await getDoc(doc(collections.businesses, businessId))
      if (bizDoc.exists()) business = { id: bizDoc.id, ...bizDoc.data() }
    }

    return { data: { invoice, items, business }, error: null }
  } catch (error: any) {
    console.error('getInvoicePDFData', error)
    return { data: null, error: error.message }
  }
}

// Get products list for invoice creation
export async function getProductsForInvoice() {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return []
    const snap = await getDocs(
      query(collections.products, where('business_id', '==', businessId), where('is_active', '==', true))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error: any) {
    console.error('getProductsForInvoice', error)
    return []
  }
}

// Get customers list for invoice creation
export async function getCustomersForInvoice() {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return []
    const snap = await getDocs(
      query(collections.customers, where('business_id', '==', businessId), where('is_active', '==', true))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error: any) {
    console.error('getCustomersForInvoice', error)
    return []
  }
}