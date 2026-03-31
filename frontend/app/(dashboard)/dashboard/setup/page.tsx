import { getUserBusiness } from '@/app/actions/business-firebase'
import { SetupForm } from './setup-form'

export default async function SetupPage() {
  const business = await getUserBusiness() as any

  // Parse stored payment_details back into individual bank fields
  let bankName = '', accountNumber = '', ifscCode = '', upiId = ''
  if (business?.payment_details) {
    for (const line of (business.payment_details as string).split('\n')) {
      if (line.startsWith('Bank: '))    bankName      = line.slice(6)
      if (line.startsWith('Account: ')) accountNumber = line.slice(9)
      if (line.startsWith('IFSC: '))    ifscCode      = line.slice(6)
      if (line.startsWith('UPI: '))     upiId         = line.slice(5)
    }
  }

  // Parse payment_terms out of terms_conditions (stored as first paragraph)
  let paymentTerms = '', termsConditions = ''
  if (business?.terms_conditions) {
    const parts = (business.terms_conditions as string).split('\n\n')
    // Heuristic: if there are 2+ parts the first is payment terms
    if (parts.length >= 2) {
      paymentTerms    = parts[0]
      termsConditions = parts.slice(1).join('\n\n')
    } else {
      termsConditions = parts[0]
    }
  }

  const initialData = business
    ? {
        id:               business.id,
        name:             business.name             ?? '',
        email:            business.email            ?? '',
        phone:            business.phone            ?? '',
        address:          business.address          ?? '',
        city:             business.city             ?? '',
        state:            business.state            ?? '',
        country:          business.country          ?? 'India',
        postal_code:      business.postal_code      ?? '',
        gst_number:       business.gst_number       ?? '',
        pan_number:       business.pan_number       ?? '',
        tax_id:           business.tax_id           ?? '',
        tax_rate:         String(business.tax_rate  ?? 18),
        currency_symbol:  business.currency_symbol  ?? '₹',
        payment_terms:    paymentTerms,
        terms_conditions: termsConditions,
        bank_name:        bankName,
        account_number:   accountNumber,
        ifsc_code:        ifscCode,
        upi_id:           upiId,
      }
    : null

  return <SetupForm initialData={initialData} />
}
