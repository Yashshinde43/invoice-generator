'use server'

import { collections, firebaseSDK } from '@/lib/firebase'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const { getDoc, getDocs, addDoc, updateDoc, query, where, doc } = firebaseSDK

export interface Product {
  id: string
  business_id: string
  name: string
  sku?: string
  barcode?: string
  category_id?: string
  supplier_id?: string
  purchase_price: number
  selling_price: number
  current_stock: number
  low_stock_threshold: number
  reorder_quantity: number
  unit: string
  description?: string
  image_url?: string
  is_active: boolean
  is_track_stock: boolean
  created_at: string
  updated_at: string
}

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
export async function getProducts(): Promise<Product[]> {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return []

    const snap = await getDocs(
      query(collections.products, where('business_id', '==', businessId), where('is_active', '==', true))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]
  } catch (error) {
    console.error('getProducts', error)
    return []
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const productDoc = await getDoc(doc(collections.products, id))
    if (!productDoc.exists()) return null
    return { id: productDoc.id, ...productDoc.data() } as Product
  } catch (error) {
    console.error('getProduct', error)
    return null
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────
export async function createProduct(formData: FormData) {
  try {
    const businessId = await getBusinessId()
    if (!businessId) return { data: null, error: 'Not authenticated' }

    const productData = {
      business_id:          businessId,
      name:                 formData.get('name') as string,
      sku:                  formData.get('sku') as string                   || null,
      barcode:              formData.get('barcode') as string               || null,
      category_id:          formData.get('category_id') as string          || null,
      supplier_id:          formData.get('supplier_id') as string          || null,
      purchase_price:       parseFloat(formData.get('purchase_price') as string) || 0,
      selling_price:        parseFloat(formData.get('selling_price') as string)  || 0,
      current_stock:        parseInt(formData.get('current_stock') as string)    || 0,
      low_stock_threshold:  parseInt(formData.get('low_stock_threshold') as string) || 10,
      reorder_quantity:     parseInt(formData.get('reorder_quantity') as string)    || 50,
      unit:                 formData.get('unit') as string                  || 'pcs',
      description:          formData.get('description') as string           || null,
      is_active:            true,
      is_track_stock:       true,
      created_at:           new Date().toISOString(),
      updated_at:           new Date().toISOString(),
    }

    const ref = await addDoc(collections.products, productData)
    revalidatePath('/dashboard/products')
    return { data: { id: ref.id, ...productData }, error: null }
  } catch (error: any) {
    console.error('createProduct', error)
    return { data: null, error: error.message }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const updateData: Record<string, any> = {
      name:                formData.get('name') as string,
      sku:                 formData.get('sku') as string                   || null,
      barcode:             formData.get('barcode') as string               || null,
      category_id:         formData.get('category_id') as string          || null,
      supplier_id:         formData.get('supplier_id') as string          || null,
      purchase_price:      parseFloat(formData.get('purchase_price') as string) || 0,
      selling_price:       parseFloat(formData.get('selling_price') as string)  || 0,
      low_stock_threshold: parseInt(formData.get('low_stock_threshold') as string) || 10,
      reorder_quantity:    parseInt(formData.get('reorder_quantity') as string)    || 50,
      unit:                formData.get('unit') as string                  || 'pcs',
      description:         formData.get('description') as string           || null,
      updated_at:          new Date().toISOString(),
    }

    await updateDoc(doc(collections.products, id), updateData)
    revalidatePath('/dashboard/products')
    return { data: { id, ...updateData }, error: null }
  } catch (error: any) {
    console.error('updateProduct', error)
    return { data: null, error: error.message }
  }
}

export async function adjustProductStock(id: string, quantity: number, notes?: string) {
  try {
    const userId = await getUserId()
    const productDoc = await getDoc(doc(collections.products, id))
    if (!productDoc.exists()) return { error: 'Product not found' }

    const currentStock = productDoc.data()?.current_stock || 0
    const newStock = currentStock + quantity
    if (newStock < 0) return { error: 'Insufficient stock' }

    await updateDoc(doc(collections.products, id), {
      current_stock: newStock,
      updated_at: new Date().toISOString(),
    })

    await addDoc(collections.stockHistory, {
      business_id:      productDoc.data()?.business_id,
      product_id:       id,
      transaction_type: quantity > 0 ? 'purchase' : 'sale',
      quantity,
      stock_before:     currentStock,
      stock_after:      newStock,
      reference_type:   'adjustment',
      notes:            notes || `Stock adjustment: ${quantity > 0 ? '+' : ''}${quantity}`,
      created_by:       userId,
      created_at:       new Date().toISOString(),
    })

    revalidatePath('/dashboard/products')
    return { success: true, error: null }
  } catch (error: any) {
    console.error('adjustProductStock', error)
    return { success: false, error: error.message }
  }
}

export async function deleteProduct(id: string) {
  try {
    await updateDoc(doc(collections.products, id), { is_active: false, updated_at: new Date().toISOString() })
    revalidatePath('/dashboard/products')
    return { success: true, error: null }
  } catch (error: any) {
    console.error('deleteProduct', error)
    return { success: false, error: error.message }
  }
}
