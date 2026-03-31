'use client'

import { useEffect, useRef, useState } from 'react'

export interface BusinessPreviewData {
  name?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  phone?: string
  email?: string
  gst_number?: string
  pan_number?: string
  currency_symbol?: string
  tax_rate?: number
  payment_details?: string
  terms_conditions?: string
}

// ── Fallback mock (shown when no real data is passed) ─────────────────────────
const MOCK: BusinessPreviewData = {
  name:             'MY BUSINESS',
  address:          '123, MG Road, Andheri West',
  city:             'Mumbai',
  state:            'Maharashtra',
  postal_code:      '400058',
  country:          'India',
  phone:            '+91 98765 43210',
  email:            'hello@mybusiness.com',
  gst_number:       '27AAAAA0000A1Z5',
  currency_symbol:  'Rs.',
  tax_rate:         18,
  payment_details:  'Bank: HDFC Bank\nA/C: 50100123456789\nIFSC: HDFC0001234\nUPI: business@upi',
  terms_conditions: 'Payment due within 30 days. Goods once sold will not be taken back.\nSubject to local jurisdiction.',
}

const INV  = { number: 'INV-867992', date: '28 Mar 2026', due: '27 Apr 2026', status: 'UNPAID' }
const CUST = { name: 'Rajesh Kumar & Co.', address: 'Nehru Street, T. Nagar', phone: 'Ph: +91 91234 56789', gst: 'GSTIN: 33BBBBB1111B1Z6' }
const ITEMS = [
  { name: 'Premium Widget A',     qty: 10, unit: 'pcs', rate: 1200, tax: 216,  total: 14160 },
  { name: 'Deluxe Gadget Pro',    qty: 5,  unit: 'pcs', rate: 3500, tax: 315,  total: 17815 },
  { name: 'Installation Service', qty: 1,  unit: 'job', rate: 2500, tax: 45,   total: 2545  },
]
const SUBTOTAL = 30500, TAX_AMT = 576, GRAND = 34520

// ── Helpers ───────────────────────────────────────────────────────────────────
const BLACK = '#0f0f0f', WHITE = '#ffffff', GRAY = '#6e6e6e'
const LGRAY = '#f5f5f5', BORDER = '#d2d2d2', RED = '#c82828'
const A4_W = 794

function money(n: number, sym = 'Rs.') {
  return `${sym} ${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props { business?: BusinessPreviewData | null }

export function InvoiceTemplatePreview({ business }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      if (wrapRef.current) setScale(wrapRef.current.clientWidth / A4_W)
    }
    update()
    const ro = new ResizeObserver(update)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // Merge real data over mock so unfilled fields still show something sensible
  const b: BusinessPreviewData = { ...MOCK, ...Object.fromEntries(Object.entries(business ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== '')) }

  const sym = b.currency_symbol === '₹' ? 'Rs.' : (b.currency_symbol || 'Rs.')
  const taxRate = b.tax_rate ?? 18

  const businessName    = (b.name || 'MY BUSINESS').toUpperCase()
  const businessAddress = [b.address, b.city, b.state, b.postal_code, b.country].filter(Boolean).join(', ')

  const sheetH = 1060
  return (
    <div
      ref={wrapRef}
      className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white"
      style={{ height: sheetH * scale }}
    >
      <div style={{ width: A4_W, transformOrigin: 'top left', transform: `scale(${scale})`, fontFamily: "'Courier New', Courier, monospace" }}>

        {/* ── 1. HEADER BAND ── */}
        <div style={{ background: BLACK, padding: '0 53px', height: 159, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: WHITE, fontWeight: 700, fontSize: 26, letterSpacing: 1 }}>{businessName}</div>
          <div style={{ color: '#b4b4b4', fontSize: 12, marginTop: 10 }}>Invoice No: {INV.number}</div>
          <div style={{ display: 'flex', gap: 40, marginTop: 10 }}>
            <span style={{ color: RED, fontWeight: 700, fontSize: 11 }}>Status: {INV.status}</span>
            <span style={{ color: '#b4b4b4', fontSize: 11 }}>Date: {INV.date}   Due: {INV.due}</span>
          </div>
          {/* Grand total */}
          <div style={{ position: 'absolute', right: 53, top: 30, color: WHITE, fontWeight: 700, fontSize: 20 }}>
            {money(GRAND, sym)}
          </div>
          {/* Contact lines */}
          <div style={{ position: 'absolute', right: 53, top: 58, textAlign: 'right' }}>
            {[businessAddress, b.phone && `Ph: ${b.phone}`, b.email, b.gst_number && `GSTIN: ${b.gst_number}`]
              .filter(Boolean).map((l, i) => (
                <div key={i} style={{ color: '#a0a0a0', fontSize: 10, lineHeight: 1.65 }}>{l as string}</div>
              ))}
          </div>
        </div>

        {/* ── 2. BILL TO ── */}
        <Card title="Bill To" style={{ margin: '18px 53px 0' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: BLACK, marginBottom: 4 }}>{CUST.name}</div>
          {[CUST.address, CUST.phone, CUST.gst].map((l, i) => (
            <div key={i} style={{ color: GRAY, fontSize: 11, lineHeight: 1.7 }}>{l}</div>
          ))}
        </Card>

        {/* ── 3. INVOICE DETAILS ── */}
        <Card title="Invoice Details" style={{ margin: '12px 53px 0' }}>
          {[['Invoice Number', INV.number], ['Invoice Date', INV.date], ['Due Date', INV.due]].map(([lbl, val]) => (
            <Row key={lbl} label={lbl} value={val} />
          ))}
        </Card>

        {/* ── 4. ITEMS ── */}
        <Card title="Items" style={{ margin: '12px 53px 0' }}>
          <div style={{ display: 'flex', color: GRAY, fontSize: 10, fontWeight: 700, paddingBottom: 5, borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ width: 22 }}>#</span>
            <span style={{ flex: 1 }}>Item</span>
            <span style={{ width: 36, textAlign: 'right' }}>Qty</span>
            <span style={{ width: 40, textAlign: 'right', marginRight: 4 }}>Unit</span>
            <span style={{ width: 90, textAlign: 'right' }}>Rate</span>
            <span style={{ width: 80, textAlign: 'right' }}>Tax</span>
            <span style={{ width: 90, textAlign: 'right' }}>Amount</span>
          </div>
          {ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'flex', fontSize: 11, color: BLACK, padding: '6px 0', borderBottom: i < ITEMS.length - 1 ? `1px dashed ${BORDER}` : 'none' }}>
              <span style={{ width: 22, color: GRAY }}>{i + 1}</span>
              <span style={{ flex: 1 }}>{item.name}</span>
              <span style={{ width: 36, textAlign: 'right' }}>{item.qty}</span>
              <span style={{ width: 40, textAlign: 'right', color: GRAY, marginRight: 4 }}>{item.unit}</span>
              <span style={{ width: 90, textAlign: 'right' }}>{money(item.rate, sym)}</span>
              <span style={{ width: 80, textAlign: 'right', color: GRAY }}>{money(item.tax, sym)}</span>
              <span style={{ width: 90, textAlign: 'right', fontWeight: 700 }}>{money(item.total, sym)}</span>
            </div>
          ))}
        </Card>

        {/* ── 5. SUMMARY ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '12px 53px 0' }}>
          <Card title="Summary" style={{ width: 332 }}>
            {[['Subtotal', money(SUBTOTAL, sym)], [`Tax (${taxRate}%)`, money(TAX_AMT, sym)]].map(([lbl, val]) => (
              <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: GRAY, padding: '3px 0' }}>
                <span>{lbl}</span><span style={{ color: BLACK }}>{val}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 4, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12, color: BLACK }}>
              <span>Total</span><span>{money(GRAND, sym)}</span>
            </div>
          </Card>
        </div>

        {/* ── 6. AMOUNT IN WORDS ── */}
        <div style={{ margin: '12px 53px 0', background: LGRAY, border: `0.3px solid ${BORDER}`, borderRadius: 3, padding: '7px 10px', display: 'flex', gap: 16, fontSize: 11 }}>
          <span style={{ color: GRAY }}>Amount in Words:</span>
          <span style={{ color: BLACK, fontWeight: 700 }}>Thirty Four Thousand Five Hundred and Twenty Rupees Only</span>
        </div>

        {/* ── 7. NOTES + PAYMENT DETAILS ── */}
        <div style={{ display: 'flex', gap: 16, margin: '12px 53px 0' }}>
          {b.terms_conditions && (
            <Card title="Notes & Terms" style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: GRAY, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{b.terms_conditions}</div>
            </Card>
          )}
          {b.payment_details && (
            <Card title="Payment Details" style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: GRAY, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{b.payment_details}</div>
            </Card>
          )}
        </div>

        {/* ── 8. SIGNATURE ── */}
        <div style={{ margin: '24px 53px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'center', width: 200 }}>
            <div style={{ borderTop: `0.4px solid ${BORDER}`, paddingTop: 6 }}>
              <div style={{ fontSize: 10, color: GRAY }}>Authorised Signatory</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: BLACK, marginTop: 2 }}>{businessName}</div>
            </div>
          </div>
        </div>

        {/* ── 9. FOOTER BAND ── */}
        <div style={{ background: BLACK, marginTop: 28, padding: '8px 53px', textAlign: 'center' }}>
          <span style={{ color: '#a0a0a0', fontSize: 9 }}>
            Computer-generated invoice  •  {businessName}  •  Generated {INV.date}
          </span>
        </div>

      </div>
    </div>
  )
}

// ── Primitives ────────────────────────────────────────────────────────────────
function Card({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ border: `0.3px solid ${BORDER}`, borderRadius: 3, ...style }}>
      <div style={{ padding: '5px 10px', fontWeight: 700, fontSize: 11, color: BLACK, borderBottom: `1px solid ${BORDER}` }}>{title}</div>
      <div style={{ padding: '8px 10px' }}>{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', fontSize: 11, padding: '3px 0' }}>
      <span style={{ color: GRAY, width: 130 }}>{label}</span>
      <span style={{ color: BLACK }}>{value}</span>
    </div>
  )
}
