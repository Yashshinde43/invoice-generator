import { Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, Package, ShoppingCart,
  Users, DollarSign, AlertCircle, ArrowRight, Plus,
} from "lucide-react";
import { getDashboardStats, getRecentInvoices } from "@/app/actions";
import { getSalesChartData, getProfitChartData, getTopProductsData, getPaymentStatusData } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import {
  SalesChart, SalesChartSkeleton,
  ProfitChart, ProfitChartSkeleton,
  TopProductsChart, TopProductsChartSkeleton,
  PaymentStatusChart, PaymentStatusChartSkeleton,
} from "@/components/dashboard/charts";

// ── Ambient orb background (purely decorative) ─────────────────────────────
function AmbientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Top-right indigo orb */}
      <div
        className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full opacity-[0.06] dark:opacity-[0.09]"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          filter: "blur(72px)",
          animation: "orbDrift1 14s ease-in-out infinite",
        }}
      />
      {/* Bottom-left violet orb */}
      <div
        className="absolute -bottom-48 -left-24 w-[420px] h-[420px] rounded-full opacity-[0.05] dark:opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "orbDrift2 18s ease-in-out infinite",
        }}
      />
      {/* Mid amber accent — very subtle */}
      <div
        className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full opacity-[0.03] dark:opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "orbDrift3 22s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes orbDrift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-30px,20px) scale(1.04); }
          66%      { transform: translate(20px,-30px) scale(0.97); }
        }
        @keyframes orbDrift2 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(40px,-30px); }
        }
        @keyframes orbDrift3 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(-20px,40px); }
        }
      `}</style>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  title, value, change, changeType, icon: Icon, description, accent, glowColor,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  description?: string;
  accent?: string;
  glowColor?: string;
}) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden
        border border-slate-200/80 dark:border-white/[0.07]
        bg-white/70 dark:bg-white/[0.03]
        backdrop-blur-sm
        p-5
        hover:border-slate-300 dark:hover:border-white/[0.12]
        transition-all duration-300"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
    >
      {/* Inner radial glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, ${glowColor ?? "rgba(99,102,241,0.07)"} 0%, transparent 60%)`,
        }}
      />

      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${accent ?? "bg-gradient-to-r from-indigo-500/70 via-indigo-400/30 to-transparent"}`} />

      <div className="relative flex items-start justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
          {title}
        </p>
        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.05] flex items-center justify-center
          group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      <div className="relative text-[1.6rem] font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2 leading-none">
        {value}
      </div>

      {change && (
        <p className="relative flex items-center gap-1 text-xs">
          {changeType === "positive" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
          {changeType === "negative" && <TrendingDown className="h-3 w-3 text-red-500" />}
          <span className={
            changeType === "positive" ? "text-emerald-600 dark:text-emerald-400 font-medium" :
            changeType === "negative" ? "text-red-600 dark:text-red-400 font-medium" :
            "text-slate-500 dark:text-slate-500"
          }>{change}</span>
          <span className="text-slate-400 dark:text-slate-600">from yesterday</span>
        </p>
      )}
      {description && (
        <p className="relative text-xs text-slate-400 dark:text-slate-600 mt-1">{description}</p>
      )}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="h-2.5 w-20 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
        <div className="h-8 w-8 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse" />
      </div>
      <div className="h-8 w-28 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse mb-2" />
      <div className="h-2.5 w-32 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
    </div>
  );
}

// ── Section panel (glass card) ─────────────────────────────────────────────
function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden
        border border-slate-200/80 dark:border-white/[0.07]
        bg-white/70 dark:bg-white/[0.03]
        backdrop-blur-sm ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
    >
      {children}
    </div>
  );
}

// ── Quick Action ────────────────────────────────────────────────────────────
function QuickAction({ href, icon: Icon, label, sub, iconBg, iconColor }: {
  href: string; icon: React.ElementType;
  label: string; sub: string; iconBg: string; iconColor: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 p-4 rounded-2xl
        border border-slate-200/80 dark:border-white/[0.07]
        bg-white/70 dark:bg-white/[0.03]
        backdrop-blur-sm
        hover:border-indigo-200 dark:hover:border-indigo-500/25
        hover:bg-white dark:hover:bg-white/[0.05]
        transition-all duration-200"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
        ${iconBg} group-hover:scale-105 transition-transform duration-200`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">{sub}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
    </Link>
  );
}

// ── Charts section ──────────────────────────────────────────────────────────
async function DashboardCharts({ days = 30 }: { days?: number }) {
  const [salesData, profitData, topProducts, paymentStatus] = await Promise.all([
    getSalesChartData(days),
    getProfitChartData(days),
    getTopProductsData(10),
    getPaymentStatusData(),
  ]);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">Analytics</h2>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">Business performance · last {days} days</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SalesChart data={salesData} days={days} />
        <ProfitChart data={profitData} days={days} />
        <TopProductsChart data={topProducts} limit={10} />
        <PaymentStatusChart data={paymentStatus} />
      </div>
    </div>
  );
}

function DashboardChartsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-20 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2">
        <SalesChartSkeleton /><ProfitChartSkeleton />
        <TopProductsChartSkeleton /><PaymentStatusChartSkeleton />
      </div>
    </div>
  );
}

// ── Main content ────────────────────────────────────────────────────────────
async function DashboardContent() {
  const [stats, recentInvoices] = await Promise.all([
    getDashboardStats(),
    getRecentInvoices(5),
  ]);
  const lowStockProducts: any[] = [];

  return (
    <div className="relative space-y-6 z-10">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">
            Welcome back — here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            bg-indigo-600 hover:bg-indigo-500 text-white
            shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
            hover:-translate-y-px transition-all duration-200"
        >
          <Plus className="h-3.5 w-3.5" />
          New Invoice
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Sales"   value={formatCurrency(stats.today_sales)}
          icon={DollarSign}
          accent="bg-gradient-to-r from-indigo-500/80 via-indigo-400/25 to-transparent"
          glowColor="rgba(99,102,241,0.09)" />
        <StatCard title="Today's Profit"  value={formatCurrency(stats.today_profit)}
          icon={TrendingUp}
          accent="bg-gradient-to-r from-emerald-500/80 via-emerald-400/25 to-transparent"
          glowColor="rgba(16,185,129,0.09)" />
        <StatCard title="Invoices Today"  value={stats.today_invoices}
          icon={ShoppingCart}
          accent="bg-gradient-to-r from-violet-500/80 via-violet-400/25 to-transparent"
          glowColor="rgba(139,92,246,0.09)" />
        <StatCard title="Low Stock Items" value={stats.low_stock_count} description="Items need attention"
          icon={AlertCircle}
          accent="bg-gradient-to-r from-amber-500/80 via-amber-400/25 to-transparent"
          glowColor="rgba(245,158,11,0.09)" />
      </div>

      {/* Analytics */}
      <Suspense fallback={<DashboardChartsSkeleton />}>
        <DashboardCharts days={30} />
      </Suspense>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 mb-3">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/dashboard/invoices/new" icon={ShoppingCart} label="New Invoice" sub="Create a sales invoice"
            iconBg="bg-indigo-50 dark:bg-indigo-500/10" iconColor="text-indigo-600 dark:text-indigo-400" />
          <QuickAction href="/dashboard/products"     icon={Package}      label="Add Product"  sub="Add to inventory"
            iconBg="bg-emerald-50 dark:bg-emerald-500/10" iconColor="text-emerald-600 dark:text-emerald-400" />
          <QuickAction href="/dashboard/purchases"    icon={ShoppingCart} label="New Purchase" sub="Record a purchase"
            iconBg="bg-amber-50 dark:bg-amber-500/10" iconColor="text-amber-600 dark:text-amber-400" />
          <QuickAction href="/dashboard/customers"    icon={Users}        label="Add Customer" sub="New customer entry"
            iconBg="bg-violet-50 dark:bg-violet-500/10" iconColor="text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {/* Recent invoices + Low stock */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Recent Invoices */}
        <GlassPanel>
          <div className="flex items-center justify-between px-5 py-4
            border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Recent Invoices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Latest 5 invoices</p>
            </div>
            <Link href="/dashboard/invoices"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400
                hover:text-indigo-500 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100/80 dark:divide-white/[0.04]">
            {recentInvoices.length > 0 ? recentInvoices.map((invoice) => (
              <div key={invoice.id}
                className="flex items-center justify-between px-5 py-3.5
                  hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
                    {invoice.invoice_number}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">
                    {invoice.customer_name || "Walk-in Customer"}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                  <Badge
                    variant={invoice.payment_status === "paid" ? "success" : invoice.payment_status === "partial" ? "warning" : "default"}
                    className="text-[10px] px-2 py-0.5 font-bold capitalize"
                  >
                    {invoice.payment_status}
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center mb-3">
                  <ShoppingCart className="h-5 w-5 text-slate-400 dark:text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-400">No invoices yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-600 mt-1 mb-4">Create your first invoice to get started</p>
                <Link href="/dashboard/invoices/new"
                  className="px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400
                    border border-indigo-200 dark:border-indigo-500/25 rounded-lg
                    hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                  Create Invoice
                </Link>
              </div>
            )}
          </div>
        </GlassPanel>

        {/* Low Stock Alerts */}
        <GlassPanel>
          <div className="flex items-center justify-between px-5 py-4
            border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Low Stock Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Products running low</p>
            </div>
            <Link href="/dashboard/products"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400
                hover:text-indigo-500 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100/80 dark:divide-white/[0.04]">
            {lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
              <div key={product.id}
                className="flex items-center justify-between px-5 py-3.5
                  hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{product.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">SKU: {product.sku || "N/A"}</p>
                </div>
                <Badge variant="warning" className="text-[10px] px-2 py-0.5 font-bold">
                  {product.current_stock} left
                </Badge>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Package className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-400">All products stocked</p>
                <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">No low stock alerts right now</p>
              </div>
            )}
          </div>
        </GlassPanel>

      </div>
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="relative space-y-6 z-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-6 w-32 bg-slate-200 dark:bg-white/[0.07] rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-white/[0.07] rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-white/[0.07] rounded-xl animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
      </div>
      <DashboardChartsSkeleton />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <AmbientOrbs />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
