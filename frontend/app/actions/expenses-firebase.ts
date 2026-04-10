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
        expenses.push({
          id: doc.id,
          ...data,
        } as Expense)
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
    // Image is uploaded client-side; we receive the download URL directly
    const image_url = (formData.get('image_url') as string) || ''

    if (!category || !amount || !expense_date || !payment_method || !payment_status) {
      throw new Error('Missing required fields')
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

export async function updateExpense(id: string, formData: FormData): Promise<SuccessResponse<{ id: string }> | ErrorResponse> {
  try {
    const userId = await getUserId()
    const businessId = await getBusinessId()
    
    if (!userId || !businessId) {
      console.error('Auth check failed - userId:', !!userId, 'businessId:', !!businessId)
      throw new Error('Authentication required: Please sign in and set up your business first.')
    }

    // Verify expense exists and belongs to user's business
    const existingExpense = await getExpense(id)
    if (!existingExpense) {
      throw new Error('Expense not found')
    }
    if (existingExpense.business_id !== businessId) {
      throw new Error('Not authorized to edit this expense')
    }

    const category = formData.get('category') as string
    const amount = parseFloat(formData.get('amount') as string)
    const expense_date = formData.get('expense_date') as string
    const payment_method = formData.get('payment_method') as string
    const payment_status = formData.get('payment_status') as 'paid' | 'unpaid' | 'pending'
    const vendor = (formData.get('vendor') as string) || ''
    const reference = (formData.get('reference') as string) || ''
    const notes = (formData.get('notes') as string) || ''
    const image_url = (formData.get('image_url') as string) || ''

    if (!category || !amount || !expense_date || !payment_method || !payment_status) {
      throw new Error('Missing required fields')
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

    const updateData: Partial<Expense> = {
      category,
      description,
      amount,
      expense_date,
      payment_method,
      payment_status,
      vendor,
      reference,
      notes,
      image_url: image_url || existingExpense.image_url || '',
      updated_at: new Date().toISOString(),
    }

    switch (category) {
      case 'salary_wages':
        const employeeName = formData.get('employee_name') as string
        const salaryMonth = formData.get('salary_month') as string
        if (employeeName?.trim() || salaryMonth?.trim()) {
          updateData.salary = {
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
          updateData.bonus = {
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
          updateData.subscription = {
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
          updateData.office_supplies = {
            items: items || '',
            supplier_name: (formData.get('supplier_name') as string) || '',
            reference: (formData.get('reference') as string) || '',
          }
        }
        break

      case 'office_maintenance':
        const serviceType = formData.get('service_type') as string
        if (serviceType?.trim()) {
          updateData.office_maintenance = {
            service_type: serviceType || '',
            maintenance_date: (formData.get('maintenance_date') as string) || '',
            service_provider: (formData.get('service_provider') as string) || '',
          }
        }
        break

      case 'wifi_internet':
        const providerName = formData.get('provider_name') as string
        if (providerName?.trim()) {
          updateData.wifi_internet = {
            provider_name: providerName || '',
            connection_type: (formData.get('connection_type') as string) || '',
            plan_type: (formData.get('plan_type') as string) || '',
          }
        }
        break

      case 'utilities':
        const utilityType = formData.get('utility_type') as string
        if (utilityType?.trim()) {
          updateData.utilities = {
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
          updateData.rent = {
            property_address: propertyAddress || '',
            landlord_name: landlordName || '',
            lease_period: leasePeriod || '',
            reference: (formData.get('reference') as string) || '',
          }
        }
        break
    }

    const docRef = doc(collections.expenses, id)
    await updateDoc(docRef, updateData)

    // Revalidate paths
    revalidatePath('/dashboard/expenses')
    revalidatePath('/dashboard')

    return {
      data: { id },
      error: null,
    }
  } catch (error) {
    console.error('updateExpense error:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function deleteExpense(id: string): Promise<SuccessResponse<{ id: string }> | ErrorResponse> {
  try {
    const userId = await getUserId()
    const businessId = await getBusinessId()
    
    if (!userId || !businessId) {
      console.error('Auth check failed - userId:', !!userId, 'businessId:', !!businessId)
      throw new Error('Authentication required: Please sign in and set up your business first.')
    }

    // Verify expense exists and belongs to user's business
    const existingExpense = await getExpense(id)
    if (!existingExpense) {
      throw new Error('Expense not found')
    }
    if (existingExpense.business_id !== businessId) {
      throw new Error('Not authorized to delete this expense')
    }

    // Soft delete by setting is_active to false instead of hard delete
    const docRef = doc(collections.expenses, id)
    await updateDoc(docRef, {
      is_active: false,
      updated_at: new Date().toISOString(),
    })

    // Revalidate paths
    revalidatePath('/dashboard/expenses')
    revalidatePath('/dashboard')

    return {
      data: { id },
      error: null,
    }
  } catch (error) {
    console.error('deleteExpense error:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}