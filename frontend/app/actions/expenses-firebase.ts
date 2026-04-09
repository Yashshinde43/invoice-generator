'use server'

import { ExpenseCategory } from '@/types'
import { collections, firebaseSDK } from '@/lib/firebase'
import { revalidatePath } from 'next/cache'
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

export interface Expense {
  id: string
  business_id: string
  category: ExpenseCategory
  description: string
  amount: number
  expense_date: string
  payment_method: string
  payment_status: 'paid' | 'unpaid' | 'pending'
  vendor?: string
  reference?: string
  notes?: string
  image_url?: string
  created_at: string
  updated_at: string
  is_active?: boolean
  salary?: { employee_name: string; employee_id?: string; salary_month: string }
  bonus?: { employee_name: string; bonus_type: string; bonus_month?: string }
  subscription?: { service_name: string; service_provider: string; subscription_type: string; renewal_date?: string }
  office_supplies?: { items: string; supplier_name?: string; reference?: string }
  office_maintenance?: { service_type: string; maintenance_date?: string; service_provider?: string }
  wifi_internet?: { provider_name: string; connection_type?: string; plan_type?: string }
  utilities?: { utility_type: string; provider_name?: string }
  rent?: { property_address: string; landlord_name: string; lease_period: string; reference?: string }
}

interface SuccessResponse<T> {
  data: T
  error: null
}

interface ErrorResponse {
  data: null
  error: string
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      throw new Error('Business not found')
    }

    // Query by business_id only, filter is_active client-side to avoid index requirement
    const expensesQuery = query(collections.expenses, where('business_id', '==', businessId))
    const querySnapshot = await getDocs(expensesQuery)

    let expenses: Expense[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.is_active !== false) {
        const expense = {
          id: doc.id,
          ...data,
        } as Expense
        
        // Debug: Log first few expenses with image URLs
        if (expenses.length < 3) {
          console.log('Retrieved expense', expense.id, 'with image_url:', expense.image_url)
        }
        
        expenses.push(expense)
      }
    })

    expenses.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())

    return expenses
  } catch (error) {
    console.error('getExpenses error:', error)
    return []
  }
}

export async function getExpense(id: string): Promise<Expense | null> {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      throw new Error('Business not found')
    }

    const docRef = doc(collections.expenses, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists() || docSnap.data().is_active === false) {
      return null
    }

    const expense = docSnap.data()
    if (expense.business_id !== businessId) {
      console.warn('Expense business_id mismatch')
      return null
    }

    return {
      id: docSnap.id,
      ...expense,
    } as Expense
  } catch (error) {
    console.error('getExpense error for id', id, error)
    return null
  }
}

export async function createExpense(formData: FormData): Promise<SuccessResponse<{ id: string }> | ErrorResponse> {
  try {
    const userId = await getUserId()
    const businessId = await getBusinessId()
    
    if (!userId || !businessId) {
      console.error('Auth check failed - userId:', !!userId, 'businessId:', !!businessId)
      throw new Error('Authentication required: Please sign in and set up your business first.')
    }

    const category = formData.get('category') as string
    const amount = parseFloat(formData.get('amount') as string)
    const expense_date = formData.get('expense_date') as string
    const payment_method = formData.get('payment_method') as string
    const payment_status = formData.get('payment_status') as 'paid' | 'unpaid' | 'pending'
    const vendor = (formData.get('vendor') as string) || ''
    const reference = (formData.get('reference') as string) || ''
    const notes = (formData.get('notes') as string) || ''
    const imageFile = formData.get('receipt_image') as File | null

    if (!category || !amount || !expense_date || !payment_method || !payment_status) {
      throw new Error('Missing required fields')
    }

    // Handle image upload if present
    let image_url = ''
    if (imageFile && imageFile.size > 0) {
      try {
        console.log('Starting image upload...', {
          fileName: imageFile.name,
          fileSize: imageFile.size,
          fileType: imageFile.type,
          businessId: businessId,
          userId: userId
        })
        
        // Import storage from the pre-configured firebase instance
        const { storage, storageSDK } = await import('@/lib/firebase')
        const { storageRef, uploadBytes, getDownloadURL } = storageSDK
        
        const timestamp = Date.now()
        const fileName = `expenses/${businessId}/${timestamp}_${imageFile.name}`
        const storageReference = storageRef(storage, fileName)
        
        console.log('Uploading to storage path:', fileName)
        console.log('Storage bucket:', storage.app.options.storageBucket)
        
        const uploadResult = await uploadBytes(storageReference, imageFile)
        console.log('Upload successful:', uploadResult.metadata)
        
        image_url = await getDownloadURL(storageReference)
        console.log('Download URL generated successfully:', image_url)
      } catch (error) {
        console.error('Image upload error details:', {
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
          code: (error as any)?.code,
          serverResponse: (error as any)?.serverResponse,
          customData: (error as any)?.customData
        })
        
        let errorMessage = 'Failed to upload receipt image.'
        if (error instanceof Error) {
          if (error.message.includes('storage/unknown')) {
            errorMessage = 'Storage access error: Firebase Storage security rules may not be deployed. Please run "firebase deploy --only storage" or check Firebase Console > Storage > Rules.'
          } else if (error.message.includes('storage/unauthorized')) {
            errorMessage = 'Access denied: Please check Firebase Storage security rules in Firebase Console > Storage > Rules.'
          } else if (error.message.includes('storage/object-not-found')) {
            errorMessage = 'Storage path not found: Please verify the storage bucket configuration.'
          } else if (error.message.includes('storage/retry-limit-exceeded')) {
            errorMessage = 'Network error: Please check your internet connection and try again.'
          } else {
            errorMessage = error.message
          }
        }
        
        throw new Error(`${errorMessage} Please verify your Firebase Storage configuration and security rules.`)
      }
    }

    const generateDescription = (): string => {
      const empName = formData.get('employee_name') as string
      const salaryMonth = formData.get('salary_month') as string
      const bonusEmp = formData.get('employee_name') as string
      const bonusType = formData.get('bonus_type') as string
      const serviceName = formData.get('service_name') as string
      const provider = formData.get('service_provider') as string
      const items = formData.get('items') as string
      const serviceType = formData.get('service_type') as string
      const providerName = formData.get('provider_name') as string
      const utilityType = formData.get('utility_type') as string
      const landlord = formData.get('landlord_name') as string
      const address = formData.get('property_address') as string

      if (category === 'salary_wages') {
        if (empName && empName.trim() && salaryMonth && salaryMonth.trim()) {
          return 'Salary for ' + empName + ' - ' + salaryMonth
        } else if (empName && empName.trim()) {
          return 'Salary payment for ' + empName
        }
        return 'Salary payment'
      }

      if (category === 'attendance') {
        if (bonusEmp && bonusEmp.trim() && bonusType && bonusType.trim()) {
          return bonusType + ' bonus for ' + bonusEmp
        } else if (bonusEmp && bonusEmp.trim()) {
          return 'Bonus payment for ' + bonusEmp
        }
        return 'Attendance/Bonus payment'
      }

      if (category === 'subscriptions') {
        if (serviceName && serviceName.trim()) {
          return serviceName + ' subscription'
        } else if (provider && provider.trim()) {
          return 'Subscription payment to ' + provider
        }
        return 'Service subscription'
      }

      if (category === 'office_supplies') {
        if (items && items.trim()) {
          const itemList = items.length > 50 ? items.substring(0, 50) + '...' : items
          return 'Office supplies: ' + itemList
        }
        return 'Office supplies purchase'
      }

      if (category === 'office_maintenance') {
        if (serviceType && serviceType.trim()) {
          return serviceType + ' maintenance'
        }
        return 'Office maintenance'
      }

      if (category === 'wifi_internet') {
        if (providerName && providerName.trim()) {
          return 'Internet service - ' + providerName
        }
        return 'WiFi/Internet service'
      }

      if (category === 'utilities') {
        if (utilityType && utilityType.trim()) {
          return utilityType + ' utility bill'
        }
        return 'Utilities payment'
      }

      if (category === 'rent') {
        if (landlord && landlord.trim() && address && address.trim()) {
          return 'Rent payment to ' + landlord
        } else if (landlord && landlord.trim()) {
          return 'Rent payment to ' + landlord
        }
        return 'Rent/Lease payment'
      }

      return category.replace('_', ' ') + ' expense'
    }

    const description = generateDescription()

    const expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'> = {
      business_id: businessId,
      category,
      description,
      amount,
      expense_date,
      payment_method,
      payment_status,
      vendor,
      reference,
      notes,
      image_url: image_url || '',
      is_active: true,
    }

    switch (category) {
      case 'salary_wages':
        const employeeName = formData.get('employee_name') as string
        const salaryMonth = formData.get('salary_month') as string
        if (employeeName?.trim() || salaryMonth?.trim()) {
          expenseData.salary = {
            employee_name: employeeName || '',
            employee_id: (formData.get('employee_id') as string) || '',
            salary_month: salaryMonth || '',
          }
        }
        break

      case 'attendance':
        const bonusEmployeeName = formData.get('employee_name') as string
        const bonusType = formData.get('bonus_type') as string
        if (bonusEmployeeName?.trim() || bonusType?.trim()) {
          expenseData.bonus = {
            employee_name: bonusEmployeeName || '',
            bonus_type: bonusType || '',
            bonus_month: (formData.get('bonus_month') as string) || '',
          }
        }
        break

      case 'subscriptions':
        const serviceName = formData.get('service_name') as string
        const serviceProvider = formData.get('service_provider') as string
        const subscriptionType = formData.get('subscription_type') as string
        if (serviceName?.trim() || serviceProvider?.trim() || subscriptionType?.trim()) {
          expenseData.subscription = {
            service_name: serviceName || '',
            service_provider: serviceProvider || '',
            subscription_type: subscriptionType || '',
            renewal_date: (formData.get('renewal_date') as string) || '',
          }
        }
        break

      case 'office_supplies':
        const items = formData.get('items') as string
        if (items?.trim()) {
          expenseData.office_supplies = {
            items: items || '',
            supplier_name: (formData.get('supplier_name') as string) || '',
            reference: (formData.get('reference') as string) || '',
          }
        }
        break

      case 'office_maintenance':
        const serviceType = formData.get('service_type') as string
        if (serviceType?.trim()) {
          expenseData.office_maintenance = {
            service_type: serviceType || '',
            maintenance_date: (formData.get('maintenance_date') as string) || '',
            service_provider: (formData.get('service_provider') as string) || '',
          }
        }
        break

      case 'wifi_internet':
        const providerName = formData.get('provider_name') as string
        if (providerName?.trim()) {
          expenseData.wifi_internet = {
            provider_name: providerName || '',
            connection_type: (formData.get('connection_type') as string) || '',
            plan_type: (formData.get('plan_type') as string) || '',
          }
        }
        break

      case 'utilities':
        const utilityType = formData.get('utility_type') as string
        if (utilityType?.trim()) {
          expenseData.utilities = {
            utility_type: utilityType || '',
            provider_name: (formData.get('provider_name') as string) || '',
          }
        }
        break

      case 'rent':
        const landlordName = formData.get('landlord_name') as string
        const propertyAddress = formData.get('property_address') as string
        const leasePeriod = formData.get('lease_period') as string
        if (landlordName?.trim() || propertyAddress?.trim() || leasePeriod?.trim()) {
          expenseData.rent = {
            property_address: propertyAddress || '',
            landlord_name: landlordName || '',
            lease_period: leasePeriod || '',
            reference: (formData.get('reference') as string) || '',
          }
        }
        break
    }

    const expenseRef = await addDoc(collections.expenses, expenseData)
    
    // Debug: Log the saved data with image URL
    console.log('Expense created with image_url:', expenseData.image_url)

    // Revalidate paths
    revalidatePath('/dashboard/expenses')
    revalidatePath('/dashboard')

    return {
      data: { id: expenseRef.id },
      error: null,
    }
  } catch (error) {
    console.error('createExpense error:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function getExpensesByCategory(category: string): Promise<Expense[]> {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      throw new Error('Business not found')
    }

    const expensesQuery = query(collections.expenses, where('business_id', '==', businessId), where('category', '==', category))
    const querySnapshot = await getDocs(expensesQuery)

    let expenses: Expense[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.is_active !== false) {
        expenses.push({
          id: doc.id,
          ...data,
        } as Expense)
      }
    })

    expenses.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())

    return expenses
  } catch (error) {
    console.error('getExpensesByCategory error for category', category, error)
    return []
  }
}

export async function getExpensesSummary(): Promise<{
  total_expenses: number
  total_amount: number
  paid_expenses: number
  unpaid_expenses: number
  pending_expenses: number
} | null> {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      throw new Error('Business not found')
    }

    const expenses = await getExpenses()

    return {
      total_expenses: expenses.length,
      total_amount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      paid_expenses: expenses.filter(e => e.payment_status === 'paid').length,
      unpaid_expenses: expenses.filter(e => e.payment_status === 'unpaid').length,
      pending_expenses: expenses.filter(e => e.payment_status === 'pending').length,
    }
  } catch (error) {
    console.error('getExpensesSummary error:', error)
    return null
  }
}