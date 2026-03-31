'use client'

import { useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, MapPin, Phone, Mail, FileText, CreditCard,
  ArrowRight, Loader2, Store, Hash, Percent, IndianRupee, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createBusiness, updateBusiness } from '@/app/actions/business-firebase'
import { useToast } from '@/hooks/use-toast'

type BusinessData = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  gst_number: string
  pan_number: string
  tax_id: string
  tax_rate: string
  currency_symbol: string
  payment_terms: string
  terms_conditions: string
  bank_name: string
  account_number: string
  ifsc_code: string
  upi_id: string
}

interface Props {
  initialData: BusinessData | null
  onComplete?: () => void
}

export function SetupForm({ initialData, onComplete }: Props) {
  const isEditing = !!initialData
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Combine bank fields into payment_details
    const bankName    = formData.get('bank_name') as string
    const accountNo   = formData.get('account_number') as string
    const ifsc        = formData.get('ifsc_code') as string
    const upi         = formData.get('upi_id') as string

    const bankParts: string[] = []
    if (bankName)  bankParts.push(`Bank: ${bankName}`)
    if (accountNo) bankParts.push(`Account: ${accountNo}`)
    if (ifsc)      bankParts.push(`IFSC: ${ifsc}`)
    if (upi)       bankParts.push(`UPI: ${upi}`)

    formData.set('payment_details', bankParts.join('\n'))
    ;['bank_name', 'account_number', 'ifsc_code', 'upi_id'].forEach(k => formData.delete(k))

    // Merge payment terms into terms_conditions
    const paymentTerms    = formData.get('payment_terms') as string
    const termsConditions = formData.get('terms_conditions') as string
    const combined = [paymentTerms, termsConditions].filter(Boolean).join('\n\n')
    formData.set('terms_conditions', combined)
    formData.delete('payment_terms')

    startTransition(async () => {
      const result = isEditing
        ? await updateBusiness(initialData.id, formData)
        : await createBusiness(formData)

      if (result.error) {
        toast({ variant: 'destructive', title: isEditing ? 'Update failed' : 'Setup failed', description: result.error })
      } else {
        toast({
          title: isEditing ? 'Store updated!' : 'Store created!',
          description: isEditing
            ? 'Your business details have been saved.'
            : "Everything is ready. Let's start invoicing.",
        })
        if (onComplete) {
          onComplete()
          router.refresh()
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      }
    })
  }

  const v = (field: keyof BusinessData) => initialData?.[field] ?? ''

  return (
    <div className={isEditing ? 'py-6 px-0' : 'min-h-screen py-10 px-4'}>
      {/* Header */}
      <div className={`${isEditing ? 'max-w-2xl' : 'max-w-2xl mx-auto mb-10 text-center'}`}>
        {isEditing ? (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Settings</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Update your business details. Changes apply to all future invoices.
            </p>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-5 shadow-lg shadow-primary-200">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome! Let&apos;s set up your store</h1>
            <p className="mt-2 text-gray-500 text-base">
              Fill in your business details once — they&apos;ll be pre-filled on every invoice you create.
            </p>
          </>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 pb-24">

        {/* ── 1. Basic Information ── */}
        <Card className="border border-blue-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">Basic Information</CardTitle>
                <CardDescription className="text-xs mt-0.5">Your store identity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Business / Store Name <span className="text-rose-500">*</span>
              </Label>
              <Input id="name" name="name" placeholder="e.g. Acme Traders Pvt. Ltd." required className="mt-1.5" defaultValue={v('name')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Business Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="email" name="email" type="email" placeholder="hello@store.com" className="pl-9" defaultValue={v('email')} />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="phone" name="phone" placeholder="+91 98765 43210" className="pl-9" defaultValue={v('phone')} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 2. Address ── */}
        <Card className="border border-emerald-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">Address</CardTitle>
                <CardDescription className="text-xs mt-0.5">Appears on invoices &amp; receipts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 space-y-4">
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">Street Address</Label>
              <Input id="address" name="address" placeholder="123, MG Road, Andheri West" className="mt-1.5" defaultValue={v('address')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                <Input id="city" name="city" placeholder="Mumbai" className="mt-1.5" defaultValue={v('city')} />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                <Input id="state" name="state" placeholder="Maharashtra" className="mt-1.5" defaultValue={v('state')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                <Input id="country" name="country" placeholder="India" className="mt-1.5" defaultValue={v('country') || 'India'} />
              </div>
              <div>
                <Label htmlFor="postal_code" className="text-sm font-medium text-gray-700">Postal Code</Label>
                <Input id="postal_code" name="postal_code" placeholder="400058" className="mt-1.5" defaultValue={v('postal_code')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 3. Tax & Legal ── */}
        <Card className="border border-amber-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Hash className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">Tax &amp; Legal</CardTitle>
                <CardDescription className="text-xs mt-0.5">Registration &amp; compliance numbers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gst_number" className="text-sm font-medium text-gray-700">GST Number</Label>
                <Input id="gst_number" name="gst_number" placeholder="22AAAAA0000A1Z5" className="mt-1.5 font-mono text-sm" defaultValue={v('gst_number')} />
              </div>
              <div>
                <Label htmlFor="pan_number" className="text-sm font-medium text-gray-700">PAN Number</Label>
                <Input id="pan_number" name="pan_number" placeholder="AAAAA0000A" className="mt-1.5 font-mono text-sm" defaultValue={v('pan_number')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax_id" className="text-sm font-medium text-gray-700">Tax ID</Label>
                <Input id="tax_id" name="tax_id" placeholder="Optional" className="mt-1.5" defaultValue={v('tax_id')} />
              </div>
              <div>
                <Label htmlFor="tax_rate" className="text-sm font-medium text-gray-700">Default Tax Rate (%)</Label>
                <div className="relative mt-1.5">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="tax_rate" name="tax_rate" type="number" min="0" max="100" step="0.01" className="pl-9" defaultValue={v('tax_rate') || '18'} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 4. Invoice Defaults ── */}
        <Card className="border border-violet-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">Invoice Defaults</CardTitle>
                <CardDescription className="text-xs mt-0.5">Pre-filled on every new invoice</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 space-y-4">
            <div>
              <Label htmlFor="currency_symbol" className="text-sm font-medium text-gray-700">Currency Symbol</Label>
              <div className="relative mt-1.5 w-36">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="currency_symbol" name="currency_symbol" placeholder="₹" className="pl-9" defaultValue={v('currency_symbol') || '₹'} />
              </div>
            </div>
            <div>
              <Label htmlFor="payment_terms" className="text-sm font-medium text-gray-700">Payment Terms</Label>
              <Textarea
                id="payment_terms"
                name="payment_terms"
                placeholder="e.g. Payment due within 30 days of invoice date."
                rows={2}
                className="mt-1.5 resize-none text-sm"
                defaultValue={v('payment_terms')}
              />
            </div>
            <div>
              <Label htmlFor="terms_conditions" className="text-sm font-medium text-gray-700">Terms &amp; Conditions</Label>
              <Textarea
                id="terms_conditions"
                name="terms_conditions"
                placeholder="e.g. Goods once sold will not be taken back. Subject to local jurisdiction."
                rows={3}
                className="mt-1.5 resize-none text-sm"
                defaultValue={v('terms_conditions')}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── 5. Bank Details ── */}
        <Card className="border border-rose-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">Bank Details</CardTitle>
                <CardDescription className="text-xs mt-0.5">Shown on invoices for payment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name" className="text-sm font-medium text-gray-700">Bank Name</Label>
                <Input id="bank_name" name="bank_name" placeholder="HDFC Bank" className="mt-1.5" defaultValue={v('bank_name')} />
              </div>
              <div>
                <Label htmlFor="account_number" className="text-sm font-medium text-gray-700">Account Number</Label>
                <Input id="account_number" name="account_number" placeholder="XXXXXXXXXX" className="mt-1.5 font-mono text-sm" defaultValue={v('account_number')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ifsc_code" className="text-sm font-medium text-gray-700">IFSC Code</Label>
                <Input id="ifsc_code" name="ifsc_code" placeholder="HDFC0001234" className="mt-1.5 font-mono text-sm" defaultValue={v('ifsc_code')} />
              </div>
              <div>
                <Label htmlFor="upi_id" className="text-sm font-medium text-gray-700">UPI ID</Label>
                <Input id="upi_id" name="upi_id" placeholder="business@upi" className="mt-1.5" defaultValue={v('upi_id')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Submit ── */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent -mx-4 px-4">
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full gap-2 h-12 text-base font-semibold bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200"
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isEditing ? 'Saving changes…' : 'Setting up your store…'}
              </>
            ) : isEditing ? (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            ) : (
              <>
                Complete Setup &amp; Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
          {!isEditing && (
            <p className="text-center text-xs text-gray-400 mt-2">
              You can update these details anytime from Settings
            </p>
          )}
        </div>

      </form>
    </div>
  )
}
