import { getUserBusiness } from '@/app/actions/business-firebase'
import { getProducts } from '@/app/actions/products-firebase'
import { NewInvoiceForm } from './new-invoice-form'

export default async function NewInvoicePage() {
  const [business, products] = await Promise.all([
    getUserBusiness(),
    getProducts(),
  ])

  return (
    <NewInvoiceForm
      business={business as any}
      products={products as any[]}
    />
  )
}
