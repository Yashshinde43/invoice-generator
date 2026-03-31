import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInvoice, getInvoicePDFData } from '@/app/actions/invoices-firebase'
import { InvoicePDF } from '@/components/pdf/InvoicePDF'
import { InvoicePDFButton } from '@/components/pdf/InvoicePDFButton'

interface InvoiceDetailPageProps {
  params: { id: string }
}

async function InvoiceDetailContent({ id }: { id: string }) {
  const [{ invoice }, pdfDataResult] = await Promise.all([
    getInvoice(id),
    getInvoicePDFData(id),
  ])

  if (!invoice) {
    notFound()
  }

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'paid' || paymentStatus === 'paid') {
      return <Badge variant="success">Paid</Badge>
    }
    if (status === 'draft') {
      return <Badge variant="secondary">Draft</Badge>
    }
    if (status === 'overdue') {
      return <Badge variant="warning">Overdue</Badge>
    }
    return <Badge variant="outline">Sent</Badge>
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Invoice #{invoice.invoice_number}
              </h1>
              {getStatusBadge(invoice.status, invoice.payment_status)}
            </div>
            <p className="text-gray-500 mt-0.5 text-sm">
              {invoice.customer_name || invoice.customers?.name || 'Walk-in Customer'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          <InvoicePDFButton
            invoiceId={id}
            invoiceNumber={invoice.invoice_number}
            variant="outline"
            size="default"
            showLabel
          />
        </div>
      </div>

      {/* PDF Preview */}
      {pdfDataResult.data && (
        <InvoicePDF data={pdfDataResult.data} />
      )}
    </div>
  )
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <InvoiceDetailContent id={params.id} />
    </Suspense>
  )
}
