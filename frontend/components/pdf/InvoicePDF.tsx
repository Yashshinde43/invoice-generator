'use client'

import React from 'react'
import { formatDate } from '@/lib/utils'

export interface InvoicePDFData {
  businessName: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  businessGST?: string
  businessLogo?: string
  currencySymbol?: string

  invoiceNumber: string
  invoiceDate: Date | string
  dueDate?: Date | string

  customerName: string
  customerAddress?: string
  customerPhone?: string
  customerGST?: string

  items: Array<{
    productName: string
    description?: string
    quantity: number
    unit: string
    price: number
    tax: number
    discount: number
    total: number
  }>

  subtotal: number
  taxRate: number
  taxAmount: number
  shippingAmount?: number
  otherCharges?: number
  discountAmount?: number
  grandTotal: number

  paymentMethod?: string
  paymentStatus?: string
  paidAmount?: number
  notes?: string
  terms?: string
  paymentDetails?: string
}

interface InvoicePDFProps {
  data: InvoicePDFData
  className?: string
}

function money(amount: number, sym = 'Rs.'): string {
  const safeSym = sym === '₹' ? 'Rs.' : sym
  return `${safeSym} ${(amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  function h(n: number): string {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + h(n % 100) : '')
  }
  function th(n: number): string {
    if (n < 1000) return h(n)
    if (n < 100000) return h(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + h(n % 1000) : '')
    if (n < 10000000) return h(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + th(n % 100000) : '')
    return h(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + th(n % 10000000) : '')
  }
  return th(Math.floor(num))
}

export function InvoicePDF({ data, className = '' }: InvoicePDFProps) {
  const sym = data.currencySymbol === '₹' ? 'Rs.' : (data.currencySymbol || 'Rs.')

  const statusColor =
    data.paymentStatus === 'paid'    ? '#228b22' :
    data.paymentStatus === 'partial' ? '#b47800' :
    data.paymentStatus === 'overdue' ? '#c82828' : '#a0a0a0'

  const dateStr = formatDate(data.invoiceDate)
  const dueDateStr = data.dueDate ? formatDate(data.dueDate) : null

  return (
    <div className={`bg-white text-gray-900 font-mono ${className}`} style={{ fontFamily: 'Courier, "Courier New", monospace' }}>
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none">

        {/* ── 1. HEADER BAND ── */}
        <div className="bg-[#0f0f0f] px-8 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
              {data.businessName}
            </h1>
            <p className="text-[#b4b4b4] text-xs mt-1">Invoice No: {data.invoiceNumber}</p>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-xs font-bold" style={{ color: statusColor }}>
                Status: {(data.paymentStatus || 'UNPAID').toUpperCase()}
              </span>
              <span className="text-[#b4b4b4] text-xs">
                Date: {dateStr}{dueDateStr ? `   Due: ${dueDateStr}` : ''}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-2xl font-bold">{money(data.grandTotal, sym)}</p>
            <div className="text-[#a0a0a0] text-[11px] mt-2 space-y-0.5">
              {data.businessAddress && <p>{data.businessAddress}</p>}
              {data.businessPhone   && <p>Ph: {data.businessPhone}</p>}
              {data.businessEmail   && <p>{data.businessEmail}</p>}
              {data.businessGST     && <p>GSTIN: {data.businessGST}</p>}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">

          {/* ── 2. BILL TO ── */}
          <div className="border border-[#d2d2d2]">
            <div className="px-3 py-1.5 border-b border-[#d2d2d2]">
              <p className="text-xs font-bold text-[#0f0f0f]">Bill To</p>
            </div>
            <div className="p-3">
              <p className="text-sm font-bold text-[#0f0f0f]">{data.customerName}</p>
              <div className="text-xs text-[#6e6e6e] mt-1 space-y-0.5">
                {data.customerAddress && <p>{data.customerAddress}</p>}
                {data.customerPhone   && <p>Ph: {data.customerPhone}</p>}
                {data.customerGST     && <p>GSTIN: {data.customerGST}</p>}
              </div>
            </div>
          </div>

          {/* ── 3. INVOICE DETAILS ── */}
          <div className="border border-[#d2d2d2]">
            <div className="px-3 py-1.5 border-b border-[#d2d2d2]">
              <p className="text-xs font-bold text-[#0f0f0f]">Invoice Details</p>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                ['Invoice Number', data.invoiceNumber],
                ['Invoice Date',   dateStr],
                ...(dueDateStr       ? [['Due Date', dueDateStr]]             : []),
                ...(data.paymentMethod ? [['Payment Method', data.paymentMethod]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex text-xs">
                  <span className="text-[#6e6e6e] w-36">{label}</span>
                  <span className="text-[#0f0f0f] font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4. ITEMS TABLE ── */}
          <div className="border border-[#d2d2d2]">
            <div className="px-3 py-1.5 border-b border-[#d2d2d2]">
              <p className="text-xs font-bold text-[#0f0f0f]">Items</p>
            </div>
            {/* Header row */}
            <div className="grid grid-cols-[2rem_1fr_4rem_4rem_7rem_7rem] gap-2 px-3 py-2 border-b border-[#d2d2d2] text-[10px] font-bold text-[#6e6e6e]">
              <span>#</span>
              <span>Item</span>
              <span className="text-right">Qty</span>
              <span>Unit</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Tax</span>
            </div>
            {/* Item rows */}
            {data.items.map((item, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-[2rem_1fr_4rem_4rem_7rem_7rem] gap-2 px-3 py-2 text-xs border-b border-[#d2d2d2] last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f5f5f5]'}`}
              >
                <span className="text-[#0f0f0f]">{idx + 1}</span>
                <span className="text-[#0f0f0f] font-medium truncate">{item.productName}</span>
                <span className="text-right text-[#0f0f0f]">{item.quantity}</span>
                <span className="text-[#0f0f0f]">{item.unit}</span>
                <span className="text-right text-[#0f0f0f]">{money(item.price, sym)}</span>
                <span className="text-right text-[#0f0f0f]">{money(item.tax, sym)}</span>
              </div>
            ))}
          </div>

          {/* ── 5. TOTALS ── */}
          <div className="flex justify-end">
            <div className="w-64 border border-[#d2d2d2]">
              <div className="px-3 py-1.5 border-b border-[#d2d2d2]">
                <p className="text-xs font-bold text-[#0f0f0f]">Summary</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6e6e6e]">Subtotal</span>
                  <span className="text-[#0f0f0f]">{money(data.subtotal, sym)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6e6e6e]">Tax ({data.taxRate}%)</span>
                  <span className="text-[#0f0f0f]">{money(data.taxAmount, sym)}</span>
                </div>
                {data.shippingAmount && data.shippingAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6e6e6e]">Shipping</span>
                    <span className="text-[#0f0f0f]">{money(data.shippingAmount, sym)}</span>
                  </div>
                )}
                {data.otherCharges && data.otherCharges > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6e6e6e]">Other Charges</span>
                    <span className="text-[#0f0f0f]">{money(data.otherCharges, sym)}</span>
                  </div>
                )}
                {data.discountAmount && data.discountAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6e6e6e]">Discount</span>
                    <span className="text-[#0f0f0f]">- {money(data.discountAmount, sym)}</span>
                  </div>
                )}
                {/* Grand total row */}
                <div className="border-t border-[#d2d2d2] pt-2 flex justify-between text-sm font-bold">
                  <span className="text-[#0f0f0f]">Total</span>
                  <span className="text-[#0f0f0f]">{money(data.grandTotal, sym)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 6. AMOUNT IN WORDS ── */}
          <div className="bg-[#f5f5f5] border border-[#d2d2d2] px-3 py-2 text-xs">
            <span className="text-[#6e6e6e]">Amount in Words: </span>
            <span className="font-bold text-[#0f0f0f]">{numberToWords(Math.floor(data.grandTotal))} Rupees Only</span>
            {data.paidAmount && data.paidAmount > 0 && data.paidAmount < data.grandTotal && (
              <p className="text-[#c82828] mt-1">Balance Due: {money(data.grandTotal - data.paidAmount, sym)}</p>
            )}
          </div>

          {/* ── 7. NOTES & PAYMENT DETAILS ── */}
          {(data.notes || data.terms || data.paymentDetails) && (
            <div className={`grid gap-4 ${data.notes || data.terms ? (data.paymentDetails ? 'grid-cols-2' : 'grid-cols-1') : 'grid-cols-1'}`}>
              {(data.notes || data.terms) && (
                <div className="border border-[#d2d2d2]">
                  <div className="px-3 py-1.5 border-b border-[#d2d2d2]">
                    <p className="text-xs font-bold text-[#0f0f0f]">Notes &amp; Terms</p>
                  </div>
                  <div className="p-3 text-[11px] text-[#6e6e6e] whitespace-pre-line">
                    {[data.notes, data.terms].filter(Boolean).join('\n\n')}
                  </div>
                </div>
              )}
              {data.paymentDetails && (
                <div className="border border-[#d2d2d2]">
                  <div className="px-3 py-1.5 border-b border-[#d2d2d2]">
                    <p className="text-xs font-bold text-[#0f0f0f]">Payment Details</p>
                  </div>
                  <div className="p-3 text-[11px] text-[#6e6e6e] whitespace-pre-line">
                    {data.paymentDetails}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 8. SIGNATURE ── */}
          <div className="flex justify-end pt-4">
            <div className="text-center w-48">
              <div className="border-t border-[#0f0f0f] pt-2">
                <p className="text-[10px] text-[#6e6e6e]">Authorised Signatory</p>
                <p className="text-xs font-bold text-[#0f0f0f] mt-0.5">{data.businessName}</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── 9. FOOTER BAND ── */}
        <div className="bg-[#0f0f0f] px-8 py-2">
          <p className="text-[10px] text-[#a0a0a0] text-center">
            Computer-generated invoice &bull; {data.businessName} &bull; Generated {formatDate(new Date())}
          </p>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default InvoicePDF
