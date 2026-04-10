import Link from 'next/link'
import { Instrument_Serif, DM_Sans } from 'next/font/google'
import { NavButtons } from '@/components/home/nav-buttons'
import { LoadingLink } from '@/components/home/loading-link'

const serif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export default function Home() {
  return (
    <>
      <style>{`
        :root {
          --ink: #06060f;
          --surface: #0d0d1a;
          --card: #111120;
          --border: rgba(255,255,255,0.07);
          --indigo: #16a869;
          --emerald-bright: #38cc87;
          --amber: #f59e0b;
          --text: #f1f5f9;
          --muted: #64748b;
          --subtle: #1e1e30;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page-root {
          background: var(--ink);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Grain overlay */
        .page-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        /* ─── NAV ─── */
        nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(16px) saturate(180%);
          background: rgba(6,6,15,0.7);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .nav-logo-mark {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--indigo), #0d8f59);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: white;
          box-shadow: 0 0 20px rgba(16,168,105,0.4);
          flex-shrink: 0;
        }
        .nav-logo-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
          list-style: none;
        }
        .nav-links a {
          font-size: 14px;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 400;
        }
        .nav-links a:hover { color: var(--text); }

        .nav-cta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-ghost {
          padding: 8px 16px;
          font-size: 14px;
          color: var(--muted);
          text-decoration: none;
          border-radius: 8px;
          transition: color 0.2s;
          font-weight: 500;
        }
        .btn-ghost:hover { color: var(--text); }
        .btn-primary {
          padding: 8px 20px;
          font-size: 14px;
          font-weight: 600;
          background: var(--indigo);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s;
          box-shadow: 0 0 20px rgba(16,168,105,0.3);
          letter-spacing: -0.01em;
        }
        .btn-primary:hover {
          background: var(--emerald-bright);
          box-shadow: 0 0 32px rgba(16,168,105,0.5);
          transform: translateY(-1px);
        }

        /* ─── HERO ─── */
        .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 4rem;
          padding: 100px 6rem 6rem;
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Background orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }
        .orb-1 {
          width: 600px;
          height: 600px;
          background: rgba(16,168,105,0.12);
          top: -100px;
          left: -200px;
          animation: drift1 12s ease-in-out infinite;
        }
        .orb-2 {
          width: 400px;
          height: 400px;
          background: rgba(245,158,11,0.07);
          bottom: 0;
          right: 100px;
          animation: drift2 15s ease-in-out infinite;
        }
        .orb-3 {
          width: 300px;
          height: 300px;
          background: rgba(139,92,246,0.08);
          top: 40%;
          left: 40%;
          animation: drift3 10s ease-in-out infinite;
        }

        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 40px) scale(0.95); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, -40px); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 30px); }
        }

        .hero-left {
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16,168,105,0.1);
          border: 1px solid rgba(16,168,105,0.25);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          color: var(--emerald-bright);
          margin-bottom: 2rem;
          animation: fadeUp 0.6s ease both;
        }
        .hero-badge-dot {
          width: 6px;
          height: 6px;
          background: var(--emerald-bright);
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hero-headline {
          font-size: clamp(3rem, 5vw, 4.5rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          font-weight: 400;
          color: var(--text);
          margin-bottom: 1.5rem;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-headline em {
          font-style: italic;
          color: var(--emerald-bright);
        }
        .hero-headline .accent-line {
          display: block;
          background: linear-gradient(90deg, var(--text) 0%, rgba(241,245,249,0.5) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 17px;
          line-height: 1.7;
          color: var(--muted);
          font-weight: 300;
          max-width: 460px;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 3rem;
          animation: fadeUp 0.6s 0.3s ease both;
        }

        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          background: var(--indigo);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s;
          box-shadow: 0 0 30px rgba(16,168,105,0.35), 0 4px 20px rgba(0,0,0,0.4);
          letter-spacing: -0.02em;
        }
        .btn-hero-primary:hover {
          background: var(--emerald-bright);
          box-shadow: 0 0 50px rgba(16,168,105,0.5), 0 4px 20px rgba(0,0,0,0.4);
          transform: translateY(-2px);
        }
        .btn-hero-primary svg { transition: transform 0.2s; }
        .btn-hero-primary:hover svg { transform: translateX(3px); }

        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          font-size: 15px;
          font-weight: 500;
          color: var(--muted);
          text-decoration: none;
          border-radius: 10px;
          border: 1px solid var(--border);
          transition: all 0.2s;
          background: rgba(255,255,255,0.02);
        }
        .btn-hero-secondary:hover {
          color: var(--text);
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
        }

        .hero-trust {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: fadeUp 0.6s 0.4s ease both;
        }
        .hero-avatars {
          display: flex;
        }
        .hero-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid var(--ink);
          margin-right: -8px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .hero-trust-text {
          font-size: 13px;
          color: var(--muted);
        }
        .hero-trust-text strong { color: var(--text); font-weight: 600; }

        /* ─── INVOICE MOCKUP ─── */
        .hero-right {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeUp 0.8s 0.2s ease both;
        }

        .mockup-container {
          position: relative;
          width: 100%;
          max-width: 480px;
        }

        .mockup-glow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle at 50% 50%, rgba(16,168,105,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .invoice-card {
          background: var(--card);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,168,105,0.1);
          transform: perspective(1000px) rotateY(-4deg) rotateX(2deg);
          transition: transform 0.5s ease;
          position: relative;
          overflow: hidden;
        }
        .invoice-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16,168,105,0.5), rgba(245,158,11,0.3), transparent);
        }
        .invoice-card:hover {
          transform: perspective(1000px) rotateY(-1deg) rotateX(1deg);
        }

        .inv-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .inv-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .inv-logo-mark {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #16a869, #0d8f59);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: white;
        }
        .inv-company {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .inv-company-sub {
          font-size: 11px;
          color: var(--muted);
          margin-top: 1px;
        }
        .inv-badge {
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.2);
          color: #4ade80;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 100px;
          letter-spacing: 0.03em;
        }

        .inv-title-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .inv-title {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .inv-num {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
        }
        .inv-date-label {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
          text-align: right;
        }
        .inv-date-val {
          font-size: 13px;
          color: var(--text);
          font-weight: 500;
          text-align: right;
        }

        .inv-to {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 18px;
        }
        .inv-to-label {
          font-size: 10px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .inv-to-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .inv-to-detail {
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
        }

        .inv-items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18px;
          font-size: 12px;
        }
        .inv-items th {
          color: var(--muted);
          font-weight: 500;
          text-align: left;
          padding: 0 0 8px;
          border-bottom: 1px solid var(--border);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .inv-items th:last-child { text-align: right; }
        .inv-items td {
          padding: 10px 0 0;
          color: var(--text);
          vertical-align: top;
        }
        .inv-items td:last-child {
          text-align: right;
          font-weight: 600;
          color: var(--text);
        }
        .inv-item-desc {
          font-size: 11px;
          color: var(--muted);
          margin-top: 2px;
        }

        .inv-totals {
          border-top: 1px solid var(--border);
          padding-top: 14px;
        }
        .inv-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 6px;
        }
        .inv-total-final {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
        .inv-total-final .amount { color: var(--emerald-bright); }

        /* Floating mini cards */
        .float-card {
          position: absolute;
          background: var(--card);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          gap: 10px;
          animation: float 4s ease-in-out infinite;
          white-space: nowrap;
        }
        .float-card-1 {
          bottom: -24px;
          left: -40px;
          animation-delay: 0s;
        }
        .float-card-2 {
          top: -20px;
          right: -30px;
          animation-delay: 2s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .float-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .float-label {
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 1px;
        }
        .float-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── STATS STRIP ─── */
        .stats-strip {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 2.5rem 6rem;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          background: rgba(255,255,255,0.01);
          position: relative;
        }
        .stats-strip::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16,168,105,0.3), transparent);
        }

        .stat-item {
          text-align: center;
        }
        .stat-number {
          font-size: 2.25rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: var(--text);
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-number span { color: var(--emerald-bright); }
        .stat-label {
          font-size: 13px;
          color: var(--muted);
          font-weight: 400;
        }
        .stat-divider {
          width: 1px;
          background: var(--border);
          height: 100%;
          display: none;
        }

        /* ─── FEATURES ─── */
        .section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 7rem 6rem;
        }

        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--emerald-bright);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.25rem;
        }
        .section-eyebrow::before {
          content: '';
          display: block;
          width: 20px;
          height: 1px;
          background: var(--emerald-bright);
        }

        .section-title {
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 400;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--text);
          margin-bottom: 1.25rem;
          max-width: 640px;
        }
        .section-title em {
          font-style: italic;
          color: var(--emerald-bright);
        }

        .section-sub {
          font-size: 16px;
          color: var(--muted);
          font-weight: 300;
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 4rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        .feature-card {
          background: var(--card);
          padding: 2rem;
          transition: background 0.3s;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 0% 0%, rgba(16,168,105,0.08) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover { background: #131325; }

        .feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          font-size: 20px;
          border: 1px solid rgba(255,255,255,0.07);
        }

        .feature-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .feature-desc {
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.65;
          font-weight: 300;
        }

        /* ─── HOW IT WORKS ─── */
        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          position: relative;
        }
        .how-grid::before {
          content: '';
          position: absolute;
          top: 28px;
          left: calc(16.66% + 28px);
          right: calc(16.66% + 28px);
          height: 1px;
          background: linear-gradient(90deg, var(--indigo), var(--border), var(--indigo));
          opacity: 0.3;
        }

        .how-card {
          position: relative;
          padding: 2rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .how-card:hover {
          border-color: rgba(16,168,105,0.3);
          box-shadow: 0 0 30px rgba(16,168,105,0.08);
        }

        .how-step {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--subtle);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: var(--emerald-bright);
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
          font-family: monospace;
        }
        .how-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .how-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.65;
          font-weight: 300;
        }

        /* ─── CTA SECTION ─── */
        .cta-section {
          margin: 0 6rem 7rem;
          border-radius: 24px;
          background: linear-gradient(135deg, #0f0f2a 0%, #111130 50%, #0a0a1e 100%);
          border: 1px solid rgba(16,168,105,0.2);
          padding: 6rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 80px rgba(16,168,105,0.12);
        }
        .cta-section::before {
          content: '';
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(16,168,105,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-section::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16,168,105,0.5), rgba(245,158,11,0.3), transparent);
        }

        .cta-title {
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          font-weight: 400;
          letter-spacing: -0.04em;
          line-height: 1.08;
          color: var(--text);
          margin-bottom: 1.25rem;
          position: relative;
          z-index: 2;
        }
        .cta-title em {
          font-style: italic;
          color: var(--emerald-bright);
        }

        .cta-sub {
          font-size: 17px;
          color: var(--muted);
          font-weight: 300;
          max-width: 480px;
          margin: 0 auto 2.5rem;
          line-height: 1.65;
          position: relative;
          z-index: 2;
        }

        .cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          position: relative;
          z-index: 2;
        }

        .btn-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          background: var(--indigo);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s;
          box-shadow: 0 0 40px rgba(16,168,105,0.4), 0 4px 20px rgba(0,0,0,0.4);
          letter-spacing: -0.02em;
        }
        .btn-cta:hover {
          background: var(--emerald-bright);
          box-shadow: 0 0 60px rgba(16,168,105,0.55), 0 4px 20px rgba(0,0,0,0.4);
          transform: translateY(-2px);
        }

        .cta-note {
          margin-top: 1.5rem;
          font-size: 13px;
          color: var(--muted);
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .cta-note-dot {
          width: 4px;
          height: 4px;
          background: var(--muted);
          border-radius: 50%;
          opacity: 0.4;
        }

        /* ─── FOOTER ─── */
        footer {
          border-top: 1px solid var(--border);
          padding: 2.5rem 6rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .footer-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-mark {
          width: 26px;
          height: 26px;
          background: linear-gradient(135deg, var(--indigo), #0d8f59);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: white;
        }
        .footer-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .footer-copy {
          font-size: 13px;
          color: var(--muted);
        }
        .footer-links {
          display: flex;
          gap: 1.5rem;
          list-style: none;
        }
        .footer-links a {
          font-size: 13px;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--text); }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 1024px) {
          .hero { grid-template-columns: 1fr; padding: 100px 3rem 3rem; gap: 3rem; }
          .hero-right { display: none; }
          .stats-strip { grid-template-columns: repeat(2, 1fr); padding: 2rem 3rem; }
          .section { padding: 5rem 3rem; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .how-grid { grid-template-columns: 1fr; gap: 1rem; }
          .how-grid::before { display: none; }
          .cta-section { margin: 0 3rem 5rem; padding: 4rem 3rem; }
          footer { padding: 2rem 3rem; }
        }
        @media (max-width: 640px) {
          nav { padding: 0 1.5rem; }
          .nav-links { display: none; }
          .hero { padding: 90px 1.5rem 3rem; }
          .stats-strip { grid-template-columns: 1fr 1fr; padding: 2rem 1.5rem; gap: 1.5rem; }
          .section { padding: 4rem 1.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          .cta-section { margin: 0 1.5rem 4rem; padding: 3rem 1.5rem; }
          .cta-actions { flex-direction: column; }
          footer { padding: 2rem 1.5rem; flex-direction: column; gap: 1.5rem; text-align: center; }
          .footer-links { justify-content: center; }
        }
      `}</style>

      <div className={`page-root ${sans.className}`}>

        {/* ── NAV ── */}
        <nav>
          <Link href="/" className="nav-logo">
            <div className="nav-logo-mark">IB</div>
            <span className="nav-logo-text">InvoiceBuilder</span>
          </Link>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it works</a></li>
            <li><LoadingLink href="/dashboard">Dashboard</LoadingLink></li>
          </ul>
          <div className="nav-cta">
            <NavButtons loginClass="btn-ghost" getStartedClass="btn-primary" />
          </div>
        </nav>

        {/* ── HERO ── */}
        <section>
          <div className="hero">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            <div className="hero-left">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Now with GST-ready invoicing
              </div>

              <h1 className={`hero-headline ${serif.className}`}>
                Invoice smarter.<br />
                <em>Get paid faster.</em><br />
                <span className="accent-line">Grow bigger.</span>
              </h1>

              <p className="hero-sub">
                The complete platform for Indian businesses — create professional invoices,
                track inventory, manage customers, and get real-time analytics in one place.
              </p>

              <div className="hero-actions">
                <LoadingLink href="/signup" className="btn-hero-primary" spinnerLight>
                  Start for free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </LoadingLink>
                <LoadingLink href="/login" className="btn-hero-secondary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
                  </svg>
                  See demo
                </LoadingLink>
              </div>

              <div className="hero-trust">
                <div className="hero-avatars">
                  {[
                    { bg: '#16a869', label: 'R' },
                    { bg: '#f59e0b', label: 'A' },
                    { bg: '#22c55e', label: 'S' },
                    { bg: '#ec4899', label: 'P' },
                  ].map((a, i) => (
                    <div key={i} className="hero-avatar" style={{ background: a.bg }}>{a.label}</div>
                  ))}
                </div>
                <p className="hero-trust-text"><strong>2,400+</strong> businesses trust InvoiceBuilder</p>
              </div>
            </div>

            {/* Invoice Mockup */}
            <div className="hero-right">
              <div className="mockup-container">
                <div className="mockup-glow" />

                {/* Floating stat cards */}
                <div className="float-card float-card-1">
                  <div className="float-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>₹</div>
                  <div>
                    <div className="float-label">This month</div>
                    <div className="float-value">₹2,48,500</div>
                  </div>
                </div>
                <div className="float-card float-card-2">
                  <div className="float-icon" style={{ background: 'rgba(16,168,105,0.12)', color: '#38cc87' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 12l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="float-label">Paid invoices</div>
                    <div className="float-value">24 / 27</div>
                  </div>
                </div>

                <div className="invoice-card">
                  {/* Header */}
                  <div className="inv-header">
                    <div className="inv-logo">
                      <div className="inv-logo-mark">IB</div>
                      <div>
                        <div className="inv-company">Arjun Textiles</div>
                        <div className="inv-company-sub">GST: 27AABCT1234F1Z5</div>
                      </div>
                    </div>
                    <div className="inv-badge">PAID</div>
                  </div>

                  {/* Invoice number & date */}
                  <div className="inv-title-row">
                    <div>
                      <div className="inv-title">Invoice</div>
                      <div className="inv-num">#INV-2024-0094</div>
                    </div>
                    <div>
                      <div className="inv-date-label">Issue Date</div>
                      <div className="inv-date-val">28 Mar 2025</div>
                    </div>
                  </div>

                  {/* Bill to */}
                  <div className="inv-to">
                    <div className="inv-to-label">Billed to</div>
                    <div className="inv-to-name">Sharma Enterprises Pvt. Ltd.</div>
                    <div className="inv-to-detail">Mumbai, Maharashtra · GST 27BCDE2345G1H6</div>
                  </div>

                  {/* Line items */}
                  <table className="inv-items">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div>Cotton Fabric 40s</div>
                          <div className="inv-item-desc">500m × ₹185/m</div>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--muted)' }}>500</td>
                        <td>₹92,500</td>
                      </tr>
                      <tr>
                        <td>
                          <div>Polyester Blend</div>
                          <div className="inv-item-desc">200m × ₹220/m</div>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--muted)' }}>200</td>
                        <td>₹44,000</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="inv-totals">
                    <div className="inv-total-row">
                      <span>Subtotal</span>
                      <span>₹1,36,500</span>
                    </div>
                    <div className="inv-total-row">
                      <span>GST 18%</span>
                      <span>₹24,570</span>
                    </div>
                    <div className="inv-total-final">
                      <span>Total Due</span>
                      <span className="amount">₹1,61,070</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <div className="stats-strip">
          {[
            { num: '10K', suffix: '+', label: 'Invoices created' },
            { num: '₹50Cr', suffix: '+', label: 'Revenue processed' },
            { num: '2.4K', suffix: '+', label: 'Active businesses' },
            { num: '99.9', suffix: '%', label: 'Uptime guaranteed' },
          ].map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-number">{s.num}<span>{s.suffix}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── FEATURES ── */}
        <section id="features" className="section">
          <div className="section-eyebrow">Everything you need</div>
          <h2 className={`section-title ${serif.className}`}>
            Built for <em>Indian businesses</em>,<br />from day one.
          </h2>
          <p className="section-sub">
            GST compliance, multi-currency support, inventory tracking — everything your business
            needs without the complexity.
          </p>

          <div className="features-grid">
            {[
              {
                icon: '🧾',
                bg: 'rgba(16,168,105,0.1)',
                title: 'Smart Invoicing',
                desc: 'Create GST-compliant invoices in seconds. Auto-calculate taxes, apply discounts, and send directly to clients via email or WhatsApp.',
              },
              {
                icon: '📦',
                bg: 'rgba(245,158,11,0.1)',
                title: 'Inventory Management',
                desc: 'Track stock levels in real time. Get low-stock alerts before you run out, and auto-update inventory when invoices are created.',
              },
              {
                icon: '📊',
                bg: 'rgba(34,197,94,0.1)',
                title: 'Business Analytics',
                desc: 'Dashboards that show your revenue trends, top customers, best-selling products, and profitability at a glance.',
              },
              {
                icon: '👥',
                bg: 'rgba(236,72,153,0.1)',
                title: 'Customer CRM',
                desc: 'Maintain a complete ledger for each customer — purchase history, outstanding dues, contact info, and GST details.',
              },
              {
                icon: '🧮',
                bg: 'rgba(16,168,105,0.1)',
                title: 'GST & Tax Reports',
                desc: 'Generate GSTR-1, GSTR-3B summaries instantly. Export reports ready for your CA with one click.',
              },
              {
                icon: '📱',
                bg: 'rgba(245,158,11,0.1)',
                title: 'PDF & WhatsApp',
                desc: 'Beautiful invoice PDFs with your brand logo. Share instantly on WhatsApp or email with built-in delivery tracking.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="section" style={{ paddingTop: 0 }}>
          <div className="section-eyebrow">Simple to start</div>
          <h2 className={`section-title ${serif.className}`}>
            Up and running in<br /><em>under 5 minutes.</em>
          </h2>
          <p className="section-sub">
            No complex setup. No accounting degree needed. Just sign up and start invoicing.
          </p>

          <div className="how-grid">
            {[
              {
                step: '01',
                title: 'Set up your store',
                desc: 'Add your business name, GST number, logo, and bank details. Takes less than 2 minutes.',
              },
              {
                step: '02',
                title: 'Add your products',
                desc: 'Import your product catalog with prices, tax rates, and stock levels. Or add them one by one.',
              },
              {
                step: '03',
                title: 'Create & send invoices',
                desc: 'Pick a customer, select products, and hit send. Your client gets a beautiful PDF instantly.',
              },
            ].map((s, i) => (
              <div key={i} className="how-card">
                <div className="how-step">{s.step}</div>
                <div className="how-title">{s.title}</div>
                <div className="how-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="cta-section">
          <h2 className={`cta-title ${serif.className}`}>
            Ready to get<br /><em>paid on time?</em>
          </h2>
          <p className="cta-sub">
            Join thousands of Indian businesses that invoice faster and track smarter with InvoiceBuilder.
          </p>
          <div className="cta-actions">
            <LoadingLink href="/signup" className="btn-cta" spinnerLight>
              Create your free account
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </LoadingLink>
          </div>
          <div className="cta-note">
            <span>Free forever for small businesses</span>
            <span className="cta-note-dot" />
            <span>No credit card required</span>
            <span className="cta-note-dot" />
            <span>GST-compliant from day one</span>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer>
          <div className="footer-left">
            <div className="footer-mark">IB</div>
            <span className="footer-name">InvoiceBuilder</span>
          </div>
          <span className="footer-copy">© 2025 InvoiceBuilder. Built for India.</span>
          <ul className="footer-links">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><LoadingLink href="/login">Login</LoadingLink></li>
            <li><LoadingLink href="/signup">Sign up</LoadingLink></li>
          </ul>
        </footer>

      </div>
    </>
  )
}
