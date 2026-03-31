import { NextRequest, NextResponse } from 'next/server'
import { getInvoicePDFData } from '@/app/actions/invoices-firebase'
import { generateInvoicePDFBase64 } from '@/lib/pdf/invoice'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await getInvoicePDFData(params.id)

    if (result.error || !result.data) {
      return NextResponse.json({ error: result.error || 'Failed to generate PDF' }, { status: 400 })
    }

    const base64 = await generateInvoicePDFBase64(result.data)

    return NextResponse.json({
      pdf: base64,
      filename: `Invoice_${result.data.invoiceNumber}.pdf`,
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
