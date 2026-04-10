'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { InvoicePDFData } from '@/lib/pdf/invoice'

interface InvoicePDFPreviewProps {
  data: InvoicePDFData
}

export function InvoicePDFPreview({ data }: InvoicePDFPreviewProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string

    async function generate() {
      const { generateInvoicePDFBlob } = await import('@/lib/pdf/invoice')
      const blob = await generateInvoicePDFBlob(data)
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    }

    generate()

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [data])

  if (!url) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Generating preview…</p>
        </div>
      </div>
    )
  }

  return (
    <iframe
      src={url}
      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.07] shadow-sm"
      style={{ height: '80vh', minHeight: 600 }}
      title="Invoice Preview"
    />
  )
}
