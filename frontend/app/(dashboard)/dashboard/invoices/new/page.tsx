import { getUserBusiness } from '@/app/actions/business-firebase'
import { getProducts } from '@/app/actions/products-firebase'
import { getCustomers } from '@/app/actions/customers-firebase'
import { NewInvoiceForm } from './new-invoice-form'

export default async function NewInvoicePage() {
  const [business, products, customers] = await Promise.all([
    getUserBusiness(),
    getProducts(),
    getCustomers(),
  ])

  return (
    <NewInvoiceForm
      business={business as any}
      products={products as any[]}
      customers={customers as any[]}
    />
  )
}
