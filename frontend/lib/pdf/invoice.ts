import jsPDF from 'jspdf'

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

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function money(amount: number, sym = 'Rs.'): string {
  const safeSym = sym === '₹' ? 'Rs.' : sym
  return `${safeSym} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

// ─── main generator ─────────────────────────────────────────────────────────

export async function generateInvoicePDF(data: InvoicePDFData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const PW  = doc.internal.pageSize.getWidth()   // 210
  const PH  = doc.internal.pageSize.getHeight()  // 297
  const ML  = 14
  const MR  = 14
  const CW  = PW - ML - MR   // ~182
  const sym = (data.currencySymbol === '₹' ? 'Rs.' : data.currencySymbol) || 'Rs.'

  // ── Colour tokens ────────────────────────────────────────────────────────
  const BLACK  = [15,  15,  15 ] as const
  const WHITE  = [255, 255, 255] as const
  const GRAY   = [110, 110, 110] as const
  const LGRAY  = [245, 245, 245] as const
  const BORDER = [210, 210, 210] as const
  const GREEN  = [34,  139, 34 ] as const
  const RED    = [200, 40,  40 ] as const
  const AMBER  = [180, 120, 0  ] as const

  let y = 0

  // ── tiny helpers ─────────────────────────────────────────────────────────
  const setFill   = (c: readonly [number,number,number]) => doc.setFillColor(c[0], c[1], c[2])
  const setStroke = (c: readonly [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2])
  const setColor  = (c: readonly [number,number,number]) => doc.setTextColor(c[0], c[1], c[2])

  const courier = (style: 'normal'|'bold', size: number) => {
    doc.setFont('courier', style)
    doc.setFontSize(size)
  }

  const hLine = (x1: number, x2: number, yy: number, lw = 0.2) => {
    doc.setLineWidth(lw)
    setStroke(BORDER)
    doc.line(x1, yy, x2, yy)
  }

  const box = (x: number, yy: number, w: number, h: number, fill = false) => {
    doc.setLineWidth(0.3)
    setStroke(BORDER)
    if (fill) { setFill(LGRAY); doc.rect(x, yy, w, h, 'FD') }
    else       { doc.rect(x, yy, w, h, 'D') }
  }

  const newPage = (needed: number) => {
    if (y + needed > PH - 16) { doc.addPage(); y = 14 }
  }

  // ── labelValue: renders one label+value row inside a card ────────────────
  const labelValue = (
    label: string,
    value: string,
    x: number,
    yy: number,
    colW: number,
    valueRight = false,
  ) => {
    const labelW = 52
    courier('normal', 8)
    setColor(GRAY)
    doc.text(label, x + 3, yy)
    courier('normal', 8.5)
    setColor(BLACK)
    if (valueRight) {
      doc.text(value, x + colW - 3, yy, { align: 'right' })
    } else {
      doc.text(value, x + labelW, yy)
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. HEADER BAND
  // ══════════════════════════════════════════════════════════════════════════
  setFill(BLACK)
  doc.rect(0, 0, PW, 42, 'F')

  // Business name — large bold title
  setColor(WHITE)
  courier('bold', 20)
  doc.text(data.businessName.toUpperCase(), ML, 16)

  // Invoice number beneath title
  courier('normal', 9)
  setColor([180, 180, 180])
  const invoiceLabel = `Invoice No: ${data.invoiceNumber}`
  doc.text(invoiceLabel, ML, 25)

  // Grand total — top-right, large
  courier('bold', 14)
  setColor(WHITE)
  doc.text(money(data.grandTotal, sym), PW - MR, 18, { align: 'right' })

  // Status + date row
  const statusLabel = (data.paymentStatus || 'UNPAID').toUpperCase()
  const statusColor  =
    statusLabel === 'PAID'    ? GREEN  :
    statusLabel === 'PARTIAL' ? AMBER  :
    statusLabel === 'OVERDUE' ? RED    : [160, 160, 160] as const

  courier('bold', 8.5)
  setColor(statusColor as readonly [number,number,number])
  doc.text(`Status: ${statusLabel}`, ML, 35)

  courier('normal', 8.5)
  setColor([180, 180, 180])
  const dateStr = `Date: ${fmtDate(data.invoiceDate)}${data.dueDate ? `   Due: ${fmtDate(data.dueDate)}` : ''}`
  doc.text(dateStr, ML + 40, 35)

  // Business contact — right side of header
  courier('normal', 7.5)
  setColor([160, 160, 160])
  const bLines: string[] = []
  if (data.businessAddress) bLines.push(data.businessAddress)
  if (data.businessPhone)   bLines.push(`Ph: ${data.businessPhone}`)
  if (data.businessEmail)   bLines.push(data.businessEmail)
  if (data.businessGST)     bLines.push(`GSTIN: ${data.businessGST}`)
  bLines.forEach((l, i) => doc.text(l, PW - MR, 27 + i * 4, { align: 'right' }))

  y = 48

  // ══════════════════════════════════════════════════════════════════════════
  // 2. BILL TO  card
  // ══════════════════════════════════════════════════════════════════════════
  newPage(38)
  const btLines: string[] = []
  if (data.customerAddress) btLines.push(data.customerAddress)
  if (data.customerPhone)   btLines.push(`Ph: ${data.customerPhone}`)
  if (data.customerGST)     btLines.push(`GSTIN: ${data.customerGST}`)
  const btH = 10 + btLines.length * 5 + 4
  box(ML, y, CW, btH)

  // Card title
  courier('bold', 8.5)
  setColor(BLACK)
  doc.text('Bill To', ML + 3, y + 6)

  hLine(ML, ML + CW, y + 8, 0.2)

  courier('bold', 9)
  setColor(BLACK)
  doc.text(data.customerName, ML + 3, y + 13)

  courier('normal', 8)
  setColor(GRAY)
  btLines.forEach((l, i) => doc.text(l, ML + 3, y + 18 + i * 5))

  y += btH + 5

  // ══════════════════════════════════════════════════════════════════════════
  // 3. INVOICE DETAILS  card  (two-column label/value)
  // ══════════════════════════════════════════════════════════════════════════
  newPage(40)

  const detailRows: [string, string][] = [
    ['Invoice Number', data.invoiceNumber],
    ['Invoice Date',   fmtDate(data.invoiceDate)],
    ...(data.dueDate   ? [['Due Date', fmtDate(data.dueDate)] as [string,string]] : []),
    ...(data.paymentMethod ? [['Payment Method', data.paymentMethod] as [string,string]] : []),
  ]
  const detH = 8 + detailRows.length * 6 + 4
  box(ML, y, CW, detH)

  courier('bold', 8.5)
  setColor(BLACK)
  doc.text('Invoice Details', ML + 3, y + 6)
  hLine(ML, ML + CW, y + 8, 0.2)

  detailRows.forEach((row, i) => {
    labelValue(row[0], row[1], ML, y + 14 + i * 6, CW)
  })

  y += detH + 5

  // ══════════════════════════════════════════════════════════════════════════
  // 4. ITEMS  card
  // ══════════════════════════════════════════════════════════════════════════
  newPage(40)

  // Estimate height
  const itemRowH = 6
  const itemsBodyH = data.items.length * itemRowH
  const itemsCardH = 8 + 6 + itemsBodyH + 2  // title + header + rows + padding
  newPage(itemsCardH + 10)

  box(ML, y, CW, itemsCardH)

  courier('bold', 8.5)
  setColor(BLACK)
  doc.text('Items', ML + 3, y + 6)
  hLine(ML, ML + CW, y + 8, 0.2)

  // Column x positions — numeric columns use right-edge for right-aligned text
  const COL = {
    no:    ML + 2,
    item:  ML + 9,
    qty:   ML + 97,   // right edge for qty value
    unit:  ML + 113,  // left edge for unit label
    rateR: ML + 155,  // right edge for rate value/header
    taxR:  ML + CW - 2, // right edge for tax value/header
  }

  // Table header row
  let iy = y + 14
  courier('bold', 7.5)
  setColor(GRAY)
  doc.text('#',      COL.no,    iy)
  doc.text('Item',   COL.item,  iy)
  doc.text('Qty',    COL.qty,   iy, { align: 'right' })
  doc.text('Unit',   COL.unit,  iy)
  doc.text('Rate',   COL.rateR, iy, { align: 'right' })
  doc.text('Tax',    COL.taxR,  iy, { align: 'right' })
  hLine(ML, ML + CW, iy + 1.5, 0.2)
  iy += 5.5

  // Item rows
  data.items.forEach((item, idx) => {
    newPage(itemRowH + 4)
    courier('normal', 8)
    setColor(BLACK)
    doc.text(`${idx + 1}`,           COL.no,    iy)
    // Truncate long names
    const name = item.productName.length > 32 ? item.productName.slice(0, 31) + '…' : item.productName
    doc.text(name,                   COL.item,  iy)
    doc.text(`${item.quantity}`,     COL.qty,   iy, { align: 'right' })
    doc.text(item.unit,              COL.unit,  iy)
    doc.text(money(item.price, sym), COL.rateR, iy, { align: 'right' })
    doc.text(money(item.tax, sym),   COL.taxR,  iy, { align: 'right' })

    if (idx < data.items.length - 1) hLine(ML + 8, ML + CW, iy + 2, 0.15)
    iy += itemRowH
  })

  y += itemsCardH + 5

  // ══════════════════════════════════════════════════════════════════════════
  // 5. TOTALS  card  (right-aligned, half width)
  // ══════════════════════════════════════════════════════════════════════════
  newPage(55)

  const totRows: [string, string, boolean][] = [
    ['Subtotal',                money(data.subtotal, sym),   false],
    [`Tax (${data.taxRate}%)`,  money(data.taxAmount, sym),  false],
    ...(data.shippingAmount && data.shippingAmount > 0
      ? [['Shipping', money(data.shippingAmount, sym), false] as [string,string,boolean]] : []),
    ...(data.otherCharges && data.otherCharges > 0
      ? [['Other Charges', money(data.otherCharges, sym), false] as [string,string,boolean]] : []),
    ...(data.discountAmount && data.discountAmount > 0
      ? [['Discount', `- ${money(data.discountAmount, sym)}`, false] as [string,string,boolean]] : []),
    ['Total', money(data.grandTotal, sym), true],
  ]

  const totW   = 88
  const totX   = ML + CW - totW
  const totH   = 8 + totRows.length * 6 + 4
  box(totX, y, totW, totH)

  courier('bold', 8.5)
  setColor(BLACK)
  doc.text('Summary', totX + 3, y + 6)
  hLine(totX, totX + totW, y + 8, 0.2)

  totRows.forEach((row, i) => {
    const ry = y + 14 + i * 6
    if (row[2]) {
      // Grand total row — separator + bold
      hLine(totX, totX + totW, ry - 2, 0.4)
      courier('bold', 9)
      setColor(BLACK)
      doc.text(row[0], totX + 3,        ry + 1)
      doc.text(row[1], totX + totW - 3, ry + 1, { align: 'right' })
    } else {
      courier('normal', 8)
      setColor(GRAY)
      doc.text(row[0], totX + 3,        ry)
      setColor(BLACK)
      doc.text(row[1], totX + totW - 3, ry, { align: 'right' })
    }
  })

  y += totH + 5

  // ══════════════════════════════════════════════════════════════════════════
  // 6. AMOUNT IN WORDS
  // ══════════════════════════════════════════════════════════════════════════
  newPage(14)
  box(ML, y, CW, 10, true)
  courier('normal', 7.5)
  setColor(GRAY)
  doc.text('Amount in Words:', ML + 3, y + 4.5)
  courier('bold', 8)
  setColor(BLACK)
  doc.text(`${numberToWords(Math.floor(data.grandTotal))} Rupees Only`, ML + 42, y + 4.5)
  if (data.paidAmount && data.paidAmount > 0 && data.paidAmount < data.grandTotal) {
    courier('normal', 7.5)
    setColor(RED)
    doc.text(`Balance Due: ${money(data.grandTotal - data.paidAmount, sym)}`, ML + 3, y + 8.5)
  }
  y += 14

  // ══════════════════════════════════════════════════════════════════════════
  // 7. NOTES & PAYMENT DETAILS  cards
  // ══════════════════════════════════════════════════════════════════════════
  const hasNotes   = !!(data.notes || data.terms)
  const hasPayment = !!data.paymentDetails

  if (hasNotes || hasPayment) {
    const colW2 = hasNotes && hasPayment ? (CW - 4) / 2 : CW

    if (hasNotes) {
      const combined = [data.notes, data.terms].filter(Boolean).join('\n\n')
      const lines    = doc.splitTextToSize(combined, colW2 - 8)
      const cardH    = 8 + lines.length * 4.5 + 6
      newPage(cardH + 4)
      box(ML, y, colW2, cardH)
      courier('bold', 8.5); setColor(BLACK)
      doc.text('Notes & Terms', ML + 3, y + 6)
      hLine(ML, ML + colW2, y + 8, 0.2)
      courier('normal', 7.5); setColor(GRAY)
      doc.text(lines, ML + 3, y + 13)

      if (hasPayment) {
        const px     = ML + colW2 + 4
        const plines = doc.splitTextToSize(data.paymentDetails!, colW2 - 8)
        const pcardH = 8 + plines.length * 4.5 + 6
        box(px, y, colW2, Math.max(cardH, pcardH))
        courier('bold', 8.5); setColor(BLACK)
        doc.text('Payment Details', px + 3, y + 6)
        hLine(px, px + colW2, y + 8, 0.2)
        courier('normal', 7.5); setColor(GRAY)
        doc.text(plines, px + 3, y + 13)
        y += Math.max(cardH, pcardH) + 5
      } else {
        y += cardH + 5
      }
    } else if (hasPayment) {
      const plines = doc.splitTextToSize(data.paymentDetails!, CW - 8)
      const pcardH = 8 + plines.length * 4.5 + 6
      newPage(pcardH + 4)
      box(ML, y, CW, pcardH)
      courier('bold', 8.5); setColor(BLACK)
      doc.text('Payment Details', ML + 3, y + 6)
      hLine(ML, ML + CW, y + 8, 0.2)
      courier('normal', 7.5); setColor(GRAY)
      doc.text(plines, ML + 3, y + 13)
      y += pcardH + 5
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 8. SIGNATURE
  // ══════════════════════════════════════════════════════════════════════════
  newPage(24)
  y += 4
  const sigX = ML + CW - 62
  hLine(sigX, sigX + 58, y + 12, 0.4)
  courier('normal', 7.5)
  setColor(GRAY)
  doc.text('Authorised Signatory', sigX + 29, y + 17, { align: 'center' })
  courier('bold', 8)
  setColor(BLACK)
  doc.text(data.businessName, sigX + 29, y + 22, { align: 'center' })
  y += 26

  // ══════════════════════════════════════════════════════════════════════════
  // 9. FOOTER
  // ══════════════════════════════════════════════════════════════════════════
  setFill(BLACK)
  doc.rect(0, PH - 10, PW, 10, 'F')
  courier('normal', 6.5)
  setColor([160, 160, 160])
  doc.text(
    `Computer-generated invoice  •  ${data.businessName}  •  Generated ${fmtDate(new Date())}`,
    PW / 2, PH - 4, { align: 'center' }
  )

  return doc
}

// ─── data mapper ─────────────────────────────────────────────────────────────
// Converts the raw { invoice, items, business } shape returned by
// getInvoicePDFData() into the InvoicePDFData shape expected by generateInvoicePDF()

export function mapFirebaseToInvoicePDFData(raw: {
  invoice: Record<string, any>
  items:   Record<string, any>[]
  business: Record<string, any> | null
}): InvoicePDFData {
  const { invoice, items, business } = raw

  const businessAddress = [
    business?.address,
    business?.city,
    business?.state,
    business?.postal_code,
    business?.country,
  ].filter(Boolean).join(', ')

  return {
    // Business
    businessName:    business?.name           || invoice.business_name  || 'My Business',
    businessAddress: businessAddress          || undefined,
    businessPhone:   business?.phone          || undefined,
    businessEmail:   business?.email          || undefined,
    businessGST:     business?.gst_number     || undefined,
    currencySymbol:  business?.currency_symbol || 'Rs.',

    // Invoice
    invoiceNumber: invoice.invoice_number,
    invoiceDate:   invoice.invoice_date,
    dueDate:       invoice.due_date            || undefined,
    paymentStatus: invoice.payment_status      || 'unpaid',
    paymentMethod: invoice.payment_method      || undefined,
    paidAmount:    invoice.paid_amount         || 0,

    // Customer
    customerName:    invoice.customer_name    || 'Customer',
    customerAddress: invoice.customer_address || undefined,
    customerPhone:   invoice.customer_phone   || undefined,
    customerGST:     invoice.customer_gst     || undefined,

    // Items
    items: items.map((item: any) => ({
      productName: item.product_name  || 'Item',
      description: item.description   || undefined,
      quantity:    item.quantity      || 0,
      unit:        item.unit          || 'pcs',
      price:       item.price_per_unit || 0,
      tax:         item.tax_amount    || 0,
      discount:    item.discount_amount || 0,
      total:       item.total_amount  || item.subtotal || 0,
    })),

    // Totals
    subtotal:       invoice.subtotal        || 0,
    taxRate:        invoice.tax_rate        || 18,
    taxAmount:      invoice.tax_amount      || 0,
    shippingAmount: invoice.shipping_amount || undefined,
    otherCharges:   invoice.other_charges   || undefined,
    discountAmount: invoice.discount_amount || undefined,
    grandTotal:     invoice.total_amount    || 0,

    // Extra
    notes:          invoice.notes            || undefined,
    terms:          invoice.terms_conditions || business?.terms_conditions || undefined,
    paymentDetails: business?.payment_details || undefined,
  }
}

// ─── export helpers ──────────────────────────────────────────────────────────

export async function generateInvoicePDFBlob(data: InvoicePDFData): Promise<Blob> {
  const doc = await generateInvoicePDF(data)
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' })
}

export async function downloadInvoicePDF(data: InvoicePDFData, filename?: string): Promise<void> {
  const doc = await generateInvoicePDF(data)
  doc.save(filename || `Invoice_${data.invoiceNumber}.pdf`)
}

export async function generateInvoicePDFBase64(data: InvoicePDFData): Promise<string> {
  const doc = await generateInvoicePDF(data)
  return doc.output('datauristring').split(',')[1]
}
