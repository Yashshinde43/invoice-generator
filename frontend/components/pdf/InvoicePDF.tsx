'use client'

import React from 'react'
import { formatDate, formatCurrency } from '@/lib/utils'

export interface InvoicePDFData {
  // Business details
  businessName: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  businessGST?: string
  businessLogo?: string
  currencySymbol?: string

  // Invoice details
  invoiceNumber: string
  invoiceDate: Date | string
  dueDate?: Date | string

  // Customer details
  customerName: string
  customerAddress?: string
  customerPhone?: string
  customerGST?: string

  // Invoice items
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

  // Totals
  subtotal: number
  taxRate: number
  taxAmount: number
  shippingAmount?: number
  otherCharges?: number
  discountAmount?: number
  grandTotal: number

  // Payment and terms
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

/**
 * InvoicePDF component - Preview component for invoice display
 * Can be used for print preview or displaying invoice in browser
 */
export function InvoicePDF({ data, className = '' }: InvoicePDFProps) {
  const currency = data.currencySymbol || '₹'

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getAmountInWords = (amount: number): string => {
    // Simple amount in words (can be enhanced)
    return `${Math.floor(amount).toLocaleString('en-IN')}`
  }

  return (
    <div className={`bg-white text-gray-900 ${className}`}>
      {/* A4 Size container */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 md:p-12 shadow-lg print:shadow-none print:p-8">
        {/* Header Section */}
        <div className="mb-8">
          {/* Business Logo and Name */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              {data.businessLogo && (
                <div className="w-20 h-20 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.businessLogo}
                    alt="Business Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-blue-600">{data.businessName}</h1>
                <div className="text-sm text-gray-600 mt-1 space-y-1">
                  {data.businessAddress && <p>{data.businessAddress}</p>}
                  {data.businessPhone && <p>Phone: {data.businessPhone}</p>}
                  {data.businessEmail && <p>Email: {data.businessEmail}</p>}
                  {data.businessGST && <p>GSTIN: {data.businessGST}</p>}
                </div>
              </div>
            </div>

            {/* Invoice Title and Number */}
            <div className="text-right">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg">
                <h2 className="text-lg font-bold">TAX INVOICE</h2>
              </div>
              <div className="bg-gray-50 border border-gray-200 border-t-0 px-4 py-3 rounded-b-lg text-sm">
                <p className="mb-1">
                  <span className="font-semibold">Invoice No:</span>{' '}
                  <span className="font-bold">{data.invoiceNumber}</span>
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Date:</span>{' '}
                  <span>{formatDate(data.invoiceDate)}</span>
                </p>
                {data.dueDate && (
                  <p>
                    <span className="font-semibold">Due Date:</span>{' '}
                    <span>{formatDate(data.dueDate)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Status Badge */}
          <div className="flex justify-end">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusColor(
                data.paymentStatus
              )}`}
            >
              {data.paymentStatus || 'N/A'}
            </span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-700">Bill To:</h3>
          </div>
          <div className="p-4">
            <p className="font-semibold text-base mb-1">{data.customerName}</p>
            {data.customerAddress && <p className="text-sm text-gray-600 mb-1">{data.customerAddress}</p>}
            {data.customerPhone && (
              <p className="text-sm text-gray-600 mb-1">Phone: {data.customerPhone}</p>
            )}
            {data.customerGST && <p className="text-sm text-gray-600">GSTIN: {data.customerGST}</p>}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-100 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-bold text-gray-700">
                <div className="col-span-5">Item Description</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-1 text-center">Unit</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-1 text-center">Tax</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {data.items.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="col-span-5">
                    <p className="font-semibold text-gray-900">{item.productName}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="col-span-1 text-center text-gray-700">{item.quantity ?? 0}</div>
                  <div className="col-span-1 text-center text-gray-700">{item.unit || 'pcs'}</div>
                  <div className="col-span-2 text-center text-gray-700">
                    {currency}
                    {(item.price ?? 0).toFixed(2)}
                  </div>
                  <div className="col-span-1 text-center text-gray-700">
                    {currency}
                    {(item.tax ?? 0).toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-semibold text-gray-900">
                    {currency}
                    {(item.total ?? 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-8 flex justify-end">
          <div className="w-full max-w-xs">
            {/* Subtotal */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-semibold">
                {currency}
                {(data.subtotal ?? 0).toFixed(2)}
              </span>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Tax ({data.taxRate}%):</span>
              <span className="text-sm font-semibold">
                {currency}
                {(data.taxAmount ?? 0).toFixed(2)}
              </span>
            </div>

            {/* Shipping */}
            {data.shippingAmount && data.shippingAmount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Shipping:</span>
                <span className="text-sm font-semibold">
                  {currency}
                  {data.shippingAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Other Charges */}
            {data.otherCharges && data.otherCharges > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Other Charges:</span>
                <span className="text-sm font-semibold">
                  {currency}
                  {data.otherCharges.toFixed(2)}
                </span>
              </div>
            )}

            {/* Discount */}
            {data.discountAmount && data.discountAmount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Discount:</span>
                <span className="text-sm font-semibold text-red-600">
                  -{currency}
                  {data.discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between items-center py-3 bg-blue-600 px-3 rounded mt-2">
              <span className="text-sm font-bold text-white">Grand Total:</span>
              <span className="text-lg font-bold text-white">
                {currency}
                {(data.grandTotal ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Amount in words:</span> {getAmountInWords(data.grandTotal)}{' '}
            Rupees Only
          </p>
        </div>

        {/* Payment Details */}
        {data.paymentDetails && (
          <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-700">Payment Details:</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 whitespace-pre-line">{data.paymentDetails}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Notes:</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">{data.notes}</p>
          </div>
        )}

        {/* Terms and Conditions */}
        {data.terms && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Terms & Conditions:</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-line">
              {data.terms}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 mt-8">
          <p className="text-xs text-gray-500 text-center">
            This is a computer-generated invoice. Generated on {formatDate(new Date())}
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default InvoicePDF
