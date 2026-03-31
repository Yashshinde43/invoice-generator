'use client'

import React, { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Printer, Loader2 } from 'lucide-react'
import { getInvoicePDFData } from '@/app/actions/invoices-firebase'
import { downloadInvoicePDF, mapFirebaseToInvoicePDFData } from '@/lib/pdf/invoice'
import { toast } from '@/components/ui/use-toast'

interface InvoicePDFButtonProps {
  invoiceId: string
  invoiceNumber: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'icon'
  showLabel?: boolean
}

/**
 * InvoicePDFButton component
 * Handles PDF generation for invoices with loading states
 */
export function InvoicePDFButton({
  invoiceId,
  invoiceNumber,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}: InvoicePDFButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const result = await getInvoicePDFData(invoiceId)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      if (result.data) {
        const pdfData = mapFirebaseToInvoicePDFData(result.data)
        await downloadInvoicePDF(pdfData, `Invoice_${invoiceNumber}.pdf`)
        toast({
          title: 'Success',
          description: 'Invoice PDF downloaded successfully',
        })
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'PDF Error',
        description: error?.message || 'Failed to generate PDF',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrintPDF = async () => {
    setIsGenerating(true)
    try {
      const result = await getInvoicePDFData(invoiceId)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      if (result.data) {
        // Generate PDF blob
        const { generateInvoicePDFBlob } = await import('@/lib/pdf/invoice')
        const pdfData = mapFirebaseToInvoicePDFData(result.data)
        const blob = await generateInvoicePDFBlob(pdfData)

        // Create object URL and open in new tab
        const url = URL.createObjectURL(blob)
        const newWindow = window.open(url, '_blank')

        if (newWindow) {
          newWindow.onload = () => {
            // Trigger print dialog
            setTimeout(() => {
              newWindow.print()
            }, 500)
          }
        } else {
          // Fallback: download and open
          const a = document.createElement('a')
          a.href = url
          a.download = `Invoice_${invoiceNumber}.pdf`
          a.click()

          toast({
            title: 'Info',
            description: 'Please open the downloaded file to print',
          })
        }

        toast({
          title: 'Success',
          description: 'Invoice PDF ready for printing',
        })
      }
    } catch (error) {
      console.error('Error generating PDF for print:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate PDF for printing',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const isLoading = isPending || isGenerating

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={size === 'icon' ? 'h-8 w-8' : ''}
        onClick={handleDownloadPDF}
        disabled={isLoading}
        title="Download PDF"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Download className="h-4 w-4" />
            {showLabel && <span className="ml-2">Download</span>}
          </>
        )}
      </Button>

      <Button
        variant={variant}
        size={size}
        className={size === 'icon' ? 'h-8 w-8' : ''}
        onClick={handlePrintPDF}
        disabled={isLoading}
        title="Print PDF"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Printer className="h-4 w-4" />
            {showLabel && <span className="ml-2">Print</span>}
          </>
        )}
      </Button>
    </>
  )
}

export default InvoicePDFButton
