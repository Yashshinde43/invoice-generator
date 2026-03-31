import { Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, Package, ShoppingCart,
  Users, DollarSign, AlertCircle, Loader2, ArrowRight, Plus,
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

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  title, value, change, changeType, icon: Icon, description, accent,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  description?: string;
  accent?: string;
}) {
  return (
    <div className="group relative rounded-xl border border-slate-200 dark:border-white/[0.07]
      bg-white dark:bg-[hsl(var(--card))]
      p-5 overflow-hidden
      hover:border-indigo-200 dark:hover:border-indigo-500/20
      hover:shadow-lg hover:shadow-indigo-500/5
      transition-all duration-200">

      {/* Subtle top-accent line */}
      <div className={`absolute top-0 left-0 right-0 h-px ${accent ?? "bg-gradient-to-r from-indigo-500/60 via-indigo-400/30 to-transparent"}`} />

      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {title}
        </p>
        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/[0.05] flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
        {value}
      </div>

      {change && (
        <p className="flex items-center gap-1 text-xs">
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
        <p className="text-xs text-slate-400 dark:text-slate-600">{description}</p>
      )}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[hsl(var(--card))] p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="h-3 w-24 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
        <div className="h-8 w-8 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
      </div>
      <div className="h-8 w-28 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse mb-2" />
      <div className="h-3 w-36 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
    </div>
  );
}

// ── Quick Action ────────────────────────────────────────────────────────────
function QuickAction({ href, icon: Icon, label, sub, iconBg, iconColor }: {
  href: string;
  icon: React.ElementType;
  label: string;
  sub: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 p-4 rounded-xl
        border border-slate-200 dark:border-white/[0.07]
        bg-white dark:bg-[hsl(var(--card))]
        hover:border-indigo-200 dark:hover:border-indigo-500/20
        hover:shadow-md hover:shadow-indigo-500/5
        transition-all duration-200"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{sub}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Business performance · last {days} days</p>
        </div>
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
      <div className="h-5 w-24 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2">
        <SalesChartSkeleton />
        <ProfitChartSkeleton />
        <TopProductsChartSkeleton />
        <PaymentStatusChartSkeleton />
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
    <div className="space-y-6">

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
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
            bg-indigo-600 hover:bg-indigo-500 text-white
            shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30
            transition-all duration-200"
        >
          <Plus className="h-3.5 w-3.5" />
          New Invoice
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.today_sales)}
          icon={DollarSign}
          accent="bg-gradient-to-r from-indigo-500/60 via-indigo-400/20 to-transparent"
        />
        <StatCard
          title="Today's Profit"
          value={formatCurrency(stats.today_profit)}
          icon={TrendingUp}
          accent="bg-gradient-to-r from-emerald-500/60 via-emerald-400/20 to-transparent"
        />
        <StatCard
          title="Invoices Today"
          value={stats.today_invoices}
          icon={ShoppingCart}
          accent="bg-gradient-to-r from-violet-500/60 via-violet-400/20 to-transparent"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.low_stock_count}
          description="Items need attention"
          icon={AlertCircle}
          accent="bg-gradient-to-r from-amber-500/60 via-amber-400/20 to-transparent"
        />
      </div>

      {/* Analytics */}
      <Suspense fallback={<DashboardChartsSkeleton />}>
        <DashboardCharts days={30} />
      </Suspense>

      {/* Quick actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Quick Actions</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/dashboard/invoices/new" icon={ShoppingCart} label="New Invoice" sub="Create a sales invoice"
            iconBg="bg-indigo-50 dark:bg-indigo-500/10" iconColor="text-indigo-600 dark:text-indigo-400" />
          <QuickAction href="/dashboard/products" icon={Package} label="Add Product" sub="Add to inventory"
            iconBg="bg-emerald-50 dark:bg-emerald-500/10" iconColor="text-emerald-600 dark:text-emerald-400" />
          <QuickAction href="/dashboard/purchases" icon={ShoppingCart} label="New Purchase" sub="Record a purchase"
            iconBg="bg-amber-50 dark:bg-amber-500/10" iconColor="text-amber-600 dark:text-amber-400" />
          <QuickAction href="/dashboard/customers" icon={Users} label="Add Customer" sub="New customer entry"
            iconBg="bg-violet-50 dark:bg-violet-500/10" iconColor="text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {/* Recent invoices + Low stock */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Recent Invoices */}
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[hsl(var(--card))] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Recent Invoices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Latest 5 invoices</p>
            </div>
            <Link href="/dashboard/invoices"
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {recentInvoices.length > 0 ? recentInvoices.map((invoice) => (
              <div key={invoice.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
                    {invoice.invoice_number}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">
                    {invoice.customer_name || "Walk-in Customer"}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                  <Badge
                    variant={invoice.payment_status === "paid" ? "success" : invoice.payment_status === "partial" ? "warning" : "default"}
                    className="text-[10px] px-2 py-0.5 font-semibold capitalize"
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
                <p className="text-sm font-medium text-slate-700 dark:text-slate-400">No invoices yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">Create your first invoice to get started</p>
                <Link href="/dashboard/invoices/new"
                  className="mt-4 px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400
                    border border-indigo-200 dark:border-indigo-500/20 rounded-lg
                    hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                  Create Invoice
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[hsl(var(--card))] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Low Stock Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Products running low</p>
            </div>
            <Link href="/dashboard/products"
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
              <div key={product.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{product.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">SKU: {product.sku || "N/A"}</p>
                </div>
                <Badge variant="warning" className="text-[10px] px-2 py-0.5 font-semibold">
                  {product.current_stock} left
                </Badge>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Package className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-400">All products stocked</p>
                <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">No low stock alerts right now</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-6 w-32 bg-slate-200 dark:bg-white/[0.07] rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-white/[0.07] rounded animate-pulse mt-2" />
        </div>
        <div className="h-9 w-32 bg-slate-200 dark:bg-white/[0.07] rounded-lg animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <DashboardChartsSkeleton />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
