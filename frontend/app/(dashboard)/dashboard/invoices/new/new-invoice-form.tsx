'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, Download, Save, Loader2,
  Building2, MapPin, Phone, Mail, Hash, CreditCard, FileText, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { InvoiceLineItems, LineItem } from '@/components/invoice/InvoiceLineItems'
import { createInvoice } from '@/app/actions/invoices-firebase'
import { formatCurrency } from '@/lib/utils'
import { calculateInvoiceTotals } from '@/lib/invoice/calculations'
import { downloadInvoicePDF } from '@/lib/pdf/invoice'
import type { InvoicePDFData } from '@/lib/pdf/invoice'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Business {
  id: string; name: string
  address?: string; city?: string; state?: string; country?: string; postal_code?: string
  phone?: string; email?: string
  gst_number?: string; pan_number?: string
  currency_symbol?: string; tax_rate?: number
  payment_details?: string; terms_conditions?: string
}
export interface Product  { id: string; name: string; sku?: string; selling_price: number; purchase_price: number; current_stock: number; unit: string; is_track_stock: boolean }

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  customer_name:    z.string().min(1, 'Customer name is required'),
  customer_phone:   z.string().optional(),
  customer_address: z.string().optional(),
  customer_gst:     z.string().optional(),
  invoice_date:     z.string().min(1, 'Invoice date is required'),
  due_date:         z.string().optional(),
  tax_rate:         z.number().min(0).max(100),
  shipping_amount:  z.number().min(0),
  other_charges:    z.number().min(0),
  discount_amount:  z.number().min(0),
  discount_type:    z.enum(['amount', 'percentage']),
  notes:            z.string().optional(),
  terms_conditions: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split('T')[0] }
function dueDateStr(from: string) {
  const d = new Date(from); d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  business:  Business | null
  products:  Product[]
}

export function NewInvoiceForm({ business, products }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSaving,      setIsSaving]      = useState(false)
  const [lineItems,     setLineItems]     = useState<LineItem[]>([])

  const sym     = business?.currency_symbol === '₹' ? 'Rs.' : (business?.currency_symbol || 'Rs.')
  const today   = todayStr()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name:    '',
      customer_phone:   '',
      customer_address: '',
      customer_gst:     '',
      invoice_date:     today,
      due_date:         dueDateStr(today),
      tax_rate:         business?.tax_rate         ?? 18,
      shipping_amount:  0,
      other_charges:    0,
      discount_amount:  0,
      discount_type:    'amount',
      notes:            '',
      terms_conditions: business?.terms_conditions ?? '',
    },
  })

  const formValues = watch()

  // Keep due date in sync when invoice date changes
  useEffect(() => {
    if (formValues.invoice_date) {
      setValue('due_date', dueDateStr(formValues.invoice_date))
    }
  }, [formValues.invoice_date, setValue])

  const totals = calculateInvoiceTotals(
    lineItems,
    formValues.tax_rate,
    formValues.shipping_amount,
    formValues.other_charges,
    formValues.discount_amount,
    formValues.discount_type,
  )

  const validate = () => {
    if (lineItems.length === 0) {
      toast({ variant: 'destructive', title: 'No items', description: 'Add at least one item' })
      return false
    }
    if (lineItems.some(i => !i.product_name?.trim())) {
      toast({ variant: 'destructive', title: 'Missing name', description: 'Each item needs a name' })
      return false
    }
    return true
  }

  const buildFormData = (data: FormValues, status: string) => {
    const fd = new FormData()
    fd.append('customer_id',      '')
    fd.append('customer_name',    data.customer_name)
    fd.append('customer_phone',   data.customer_phone   || '')
    fd.append('customer_address', data.customer_address || '')
    fd.append('customer_gst',     data.customer_gst     || '')
    fd.append('invoice_date',     data.invoice_date)
    fd.append('due_date',         data.due_date         || '')
    fd.append('tax_rate',         data.tax_rate.toString())
    fd.append('shipping_amount',  data.shipping_amount.toString())
    fd.append('other_charges',    data.other_charges.toString())
    fd.append('discount_amount',  data.discount_amount.toString())
    fd.append('discount_type',    data.discount_type)
    fd.append('notes',            data.notes            || '')
    fd.append('terms_conditions', data.terms_conditions || '')
    fd.append('items',            JSON.stringify(lineItems))
    fd.append('status',           status)
    return fd
  }

  const buildPDFData = (data: FormValues, invoiceNumber: string): InvoicePDFData => {
    const businessAddress = [
      business?.address, business?.city, business?.state,
      business?.postal_code, business?.country,
    ].filter(Boolean).join(', ')

    const discount =
      formValues.discount_type === 'percentage'
        ? (totals.subtotal * formValues.discount_amount) / 100
        : formValues.discount_amount

    return {
      // ── Static: from store setup ──────────────────────────────────────────
      businessName:    business?.name          || 'My Business',
      businessAddress: businessAddress         || undefined,
      businessPhone:   business?.phone         || undefined,
      businessEmail:   business?.email         || undefined,
      businessGST:     business?.gst_number    || undefined,
      currencySymbol:  sym,
      paymentDetails:  business?.payment_details || undefined,

      // ── Variable: entered on this page ────────────────────────────────────
      invoiceNumber,
      invoiceDate:     data.invoice_date,
      dueDate:         data.due_date            || undefined,
      paymentStatus:   'unpaid',

      customerName:    data.customer_name,
      customerAddress: data.customer_address   || undefined,
      customerPhone:   data.customer_phone     || undefined,
      customerGST:     data.customer_gst       || undefined,

      items: lineItems.map(item => {
        const lineSubtotal = item.price_per_unit * item.quantity - item.discount_amount
        return {
          productName: item.product_name,
          description: item.description         || undefined,
          quantity:    item.quantity,
          unit:        item.unit                || 'pcs',
          price:       item.price_per_unit,
          tax:         lineSubtotal * data.tax_rate / 100,
          discount:    item.discount_amount,
          total:       lineSubtotal * (1 + data.tax_rate / 100),
        }
      }),

      subtotal:       totals.subtotal,
      taxRate:        data.tax_rate,
      taxAmount:      totals.tax_amount,
      shippingAmount: totals.shipping_amount   || undefined,
      otherCharges:   totals.other_charges     || undefined,
      discountAmount: discount > 0 ? discount  : undefined,
      grandTotal:     totals.total_amount,

      notes:  data.notes                        || undefined,
      terms:  data.terms_conditions             || business?.terms_conditions || undefined,
    }
  }

  const onSave = async (data: FormValues) => {
    if (!validate()) return
    setIsSaving(true)
    try {
      const result = await createInvoice(buildFormData(data, 'draft'))
      if (result?.error) {
        toast({ variant: 'destructive', title: 'Save failed', description: result.error })
        return
      }
      toast({ title: 'Invoice saved!' })
      router.push('/dashboard/invoices')
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Save failed', description: err?.message })
    } finally { setIsSaving(false) }
  }

  const onDownload = async (data: FormValues) => {
    if (!validate()) return
    setIsDownloading(true)
    try {
      // 1. Save to Firebase first to get the real sequential invoice number
      const result = await createInvoice(buildFormData(data, 'sent'))
      if (result?.error) {
        toast({ variant: 'destructive', title: 'Save failed', description: result.error })
        return
      }

      // 2. Generate PDF using the same invoice number that's stored in Firebase
      const invoiceNumber = result.data?.invoice_number || `INV-${Date.now().toString().slice(-6)}`
      await downloadInvoicePDF(buildPDFData(data, invoiceNumber), `Invoice_${invoiceNumber}.pdf`)

      toast({ title: 'Invoice downloaded!', description: `${invoiceNumber} saved and PDF downloaded.` })
      router.push('/dashboard/invoices')
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Download failed', description: err?.message })
    } finally { setIsDownloading(false) }
  }

  const busy = isDownloading || isSaving

  return (
    <div className="space-y-6 pb-12">

      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-slate-100">New Invoice</h1>
          <p className="text-gray-500 mt-1">Your store details are pre-filled automatically</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onDownload)}>
        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── LEFT COLUMN ───────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Store Info (read-only, from setup) ── */}
            <Card className="border-primary-200 dark:border-primary-800 bg-primary-50/40 dark:bg-primary-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    <CardTitle className="text-sm font-semibold text-primary-800 dark:text-primary-300">
                      From — {business?.name || 'My Business'}
                    </CardTitle>
                  </div>
                  <Link href="/dashboard/setup">
                    <Badge variant="outline" className="gap-1 text-xs text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 cursor-pointer">
                      <ExternalLink className="h-3 w-3" /> Edit Store
                    </Badge>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                  {[
                    business?.address && [<MapPin key="addr-icon" className="h-3.5 w-3.5" />, [business.address, business.city, business.state, business.postal_code].filter(Boolean).join(', ')],
                    business?.phone   && [<Phone key="phone-icon"   className="h-3.5 w-3.5" />, business.phone],
                    business?.email   && [<Mail key="email-icon"    className="h-3.5 w-3.5" />, business.email],
                    business?.gst_number && [<Hash key="gst-icon" className="h-3.5 w-3.5" />, `GST: ${business.gst_number}`],
                    business?.payment_details && [<CreditCard key="payment-icon" className="h-3.5 w-3.5" />, 'Bank details included'],
                    business?.terms_conditions && [<FileText key="terms-icon"   className="h-3.5 w-3.5" />, 'Terms & conditions included'],
                  ].filter(Boolean).map((row: any, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-primary-700 dark:text-primary-400">
                      <span className="text-primary-400 dark:text-primary-300 shrink-0">{row[0]}</span>
                      <span className="text-xs truncate text-primary-700 dark:text-primary-400">{row[1]}</span>
                    </div>
                  ))}
                </div>
                {!business && (
                  <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
                    No store set up yet.{' '}
                    <Link href="/dashboard/setup" className="underline font-medium">Set up your store</Link>
                    {' '}to pre-fill invoice details.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ── Customer ── */}
            <Card>
              <CardHeader>
                <CardTitle>Bill To</CardTitle>
                <CardDescription>Enter customer details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="customer_name">Customer Name <span className="text-red-500">*</span></Label>
                    <Input id="customer_name" placeholder="Full name or company" {...register('customer_name')}
                      className={`mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-slate-100 ${errors.customer_name ? 'border-red-500' : ''}`} />
                    {errors.customer_name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.customer_name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="customer_phone">Phone</Label>
                    <Input id="customer_phone" placeholder="+91 98765 43210" {...register('customer_phone')} className="mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-slate-100" />
                  </div>
                  <div>
                    <Label htmlFor="customer_gst">GST Number</Label>
                    <Input id="customer_gst" placeholder="22AAAAA0000A1Z5" {...register('customer_gst')} className="mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-slate-100 font-mono text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="customer_address">Address</Label>
                    <Input id="customer_address" placeholder="Street, City, State" {...register('customer_address')} className="mt-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-slate-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Invoice Dates ── */}
            <Card>
              <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="invoice_date">Invoice Date <span className="text-red-500">*</span></Label>
                    <Input id="invoice_date" type="date" {...register('invoice_date')}
                      className={`mt-1 ${errors.invoice_date ? 'border-red-500' : ''}`} />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input id="due_date" type="date" {...register('due_date')} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Line Items ── */}
            <InvoiceLineItems items={lineItems} products={products} onChange={setLineItems} />

            {/* ── Notes & Terms ── */}
            <Card>
              <CardHeader>
                <CardTitle>Notes &amp; Terms</CardTitle>
                <CardDescription>Pre-filled from your store setup — edit per invoice if needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes for Customer</Label>
                  <Textarea id="notes" placeholder="Any specific notes for this invoice…" rows={2}
                    {...register('notes')} className="mt-1 resize-none" />
                </div>
                <div>
                  <Label htmlFor="terms_conditions">Terms &amp; Conditions</Label>
                  <Textarea id="terms_conditions" placeholder="Payment terms, return policy…" rows={3}
                    {...register('terms_conditions')} className="mt-1 resize-none text-sm" />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── RIGHT COLUMN — Summary ───────────────────────────────────── */}
          <div>
            <Card className="sticky top-6">
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                    <Input id="tax_rate" type="number" min="0" max="100" step="0.5" className="mt-1"
                      {...register('tax_rate', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label htmlFor="shipping_amount">Shipping ({sym})</Label>
                    <Input id="shipping_amount" type="number" min="0" step="0.01" placeholder="0" className="mt-1 text-right"
                      {...register('shipping_amount', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label htmlFor="other_charges">Other ({sym})</Label>
                    <Input id="other_charges" type="number" min="0" step="0.01" placeholder="0" className="mt-1 text-right"
                      {...register('other_charges', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label>Discount</Label>
                    <div className="flex gap-1 mt-1">
                      <Select
                        value={formValues.discount_type}
                        onValueChange={(v: 'amount' | 'percentage') => setValue('discount_type', v)}
                      >
                        <SelectTrigger className="w-16 px-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amount">{sym}</SelectItem>
                          <SelectItem value="percentage">%</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" min="0" step="0.01" placeholder="0" className="flex-1 text-right"
                        {...register('discount_amount', { valueAsNumber: true })} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Totals breakdown */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-slate-100">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Tax ({formValues.tax_rate}%)</span>
                    <span className="text-gray-900 dark:text-slate-100">{formatCurrency(totals.tax_amount)}</span>
                  </div>
                  {totals.shipping_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-slate-400">Shipping</span>
                      <span className="text-gray-900 dark:text-slate-100">{formatCurrency(totals.shipping_amount)}</span>
                    </div>
                  )}
                  {totals.other_charges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-slate-400">Other</span>
                      <span className="text-gray-900 dark:text-slate-100">{formatCurrency(totals.other_charges)}</span>
                    </div>
                  )}
                  {totals.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-slate-400">Discount</span>
                      <span className="text-red-500 dark:text-red-400">− {formatCurrency(totals.discount_amount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-gray-900 dark:text-slate-100">Grand Total</span>
                  <span className="text-primary-600 dark:text-primary-400 text-lg">{formatCurrency(totals.total_amount)}</span>
                </div>

                {totals.profit_amount > 0 && (
                  <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500">
                    <span>Est. Profit</span>
                    <span className="text-green-600 dark:text-green-500 font-medium">{formatCurrency(totals.profit_amount)}</span>
                  </div>
                )}

                <Separator />

                <Button type="submit" disabled={busy || lineItems.length === 0} className="w-full gap-2">
                  {isDownloading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF…</>
                    : <><Download className="h-4 w-4" /> Download Invoice</>}
                </Button>

                <Button type="button" variant="outline" disabled={busy || lineItems.length === 0}
                  className="w-full gap-2" onClick={handleSubmit(onSave)}>
                  {isSaving
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                    : <><Save className="h-4 w-4" /> Save as Draft</>}
                </Button>

                <Button type="button" variant="ghost" disabled={busy}
                  className="w-full text-gray-500 dark:text-slate-400" onClick={() => router.back()}>
                  Cancel
                </Button>

                {/* What's auto-included reminder */}
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-3 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Auto-included from store</p>
                  {[
                    business?.name            && `✓ ${business.name}`,
                    business?.gst_number      && `✓ GST ${business.gst_number}`,
                    business?.payment_details && '✓ Bank / UPI details',
                    business?.terms_conditions && '✓ Terms & conditions',
                  ].filter(Boolean).map((line: any, i) => (
                    <p key={i} className="text-xs text-gray-500 dark:text-slate-500">{line}</p>
                  ))}
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  )
}
