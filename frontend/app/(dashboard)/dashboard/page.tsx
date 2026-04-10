import { Suspense } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Receipt, FileText,
  DollarSign, ArrowRight, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { getInvoices } from "@/app/actions/invoices-firebase";
import { getExpenses } from "@/app/actions/expenses-firebase";
import { formatCurrency } from "@/lib/utils";
import { ExpensesBarChart } from "@/components/dashboard/ExpensesBarChart";

// ── helpers ────────────────────────────────────────────────────────────────

function pct(a: number, b: number) {
  if (b === 0) return null;
  const v = ((a - b) / b) * 100;
  return { value: Math.abs(v).toFixed(1), positive: v >= 0 };
}

function thisMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function lastMonth() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Build last-12-months expense buckets
function buildMonthlyExpenses(expenses: { amount: number; expense_date: string }[]) {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-IN", { month: "short" });
    months.push({ key, label });
  }
  const totals: Record<string, number> = {};
  months.forEach(m => (totals[m.key] = 0));
  expenses.forEach(e => {
    const k = e.expense_date?.slice(0, 7);
    if (k && totals[k] !== undefined) totals[k] += e.amount || 0;
  });
  return months.map(m => ({ month: m.label, amount: totals[m.key] }));
}


// ── Main content ────────────────────────────────────────────────────────────

async function DashboardContent() {
  const [invoices, expenses] = await Promise.all([
    getInvoices(),
    getExpenses(),
  ]);

  const cm = thisMonth();
  const lm = lastMonth();

  // Invoice analytics
  const thisMonthInvoices = invoices.filter(i => i.invoice_date?.startsWith(cm));
  const lastMonthInvoices = invoices.filter(i => i.invoice_date?.startsWith(lm));

  const totalRevenue   = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);
  const thisMonthRev   = thisMonthInvoices.reduce((s, i) => s + (i.total_amount || 0), 0);
  const lastMonthRev   = lastMonthInvoices.reduce((s, i) => s + (i.total_amount || 0), 0);
  const revTrend       = pct(thisMonthRev, lastMonthRev);

  const paidInvoices   = invoices.filter(i => i.payment_status === "paid");
  const unpaidInvoices = invoices.filter(i => i.payment_status !== "paid");
  const overdueInvoices = invoices.filter(i => i.status === "overdue");
  const outstanding    = unpaidInvoices.reduce((s, i) => s + (i.total_amount || 0), 0);

  const thisMonthPaid  = thisMonthInvoices.filter(i => i.payment_status === "paid").length;

  // Expense analytics
  const totalExpenses  = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const thisMonthExp   = expenses.filter(e => e.expense_date?.startsWith(cm)).reduce((s, e) => s + (e.amount || 0), 0);
  const lastMonthExp   = expenses.filter(e => e.expense_date?.startsWith(lm)).reduce((s, e) => s + (e.amount || 0), 0);
  const expTrend       = pct(thisMonthExp, lastMonthExp);

  // Expense by category
  const expByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    expByCategory[e.category] = (expByCategory[e.category] || 0) + (e.amount || 0);
  });
  const topCategories = Object.entries(expByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Invoice status counts
  const statusCounts = {
    paid:    paidInvoices.length,
    unpaid:  unpaidInvoices.filter(i => i.status !== "overdue" && i.payment_status !== "partial").length,
    partial: invoices.filter(i => i.payment_status === "partial").length,
    overdue: overdueInvoices.length,
  };

  // Monthly expenses for chart
  const monthlyExpenses = buildMonthlyExpenses(expenses);

  return (
    <div className="space-y-5 pb-12">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-normal text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">Business overview &amp; analytics</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">

        {/* Total Revenue */}
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Total Revenue</p>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrency(totalRevenue)}</p>
          {revTrend ? (
            <p className="flex items-center gap-1 text-xs mt-1.5">
              {revTrend.positive
                ? <TrendingUp className="h-3 w-3 text-emerald-500" />
                : <TrendingDown className="h-3 w-3 text-red-500" />}
              <span className={revTrend.positive ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-500 font-medium"}>{revTrend.value}%</span>
              <span className="text-slate-400">vs last month</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-1.5">{thisMonthInvoices.length} invoice{thisMonthInvoices.length !== 1 ? "s" : ""} this month</p>
          )}
        </div>

        {/* Outstanding */}
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Outstanding</p>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrency(outstanding)}</p>
          <p className="text-xs text-slate-400 mt-1.5">{unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Expenses */}
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Total Expenses</p>
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <Receipt className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrency(totalExpenses)}</p>
          {expTrend ? (
            <p className="flex items-center gap-1 text-xs mt-1.5">
              {!expTrend.positive
                ? <TrendingDown className="h-3 w-3 text-emerald-500" />
                : <TrendingUp className="h-3 w-3 text-red-500" />}
              <span className={!expTrend.positive ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-500 font-medium"}>{expTrend.value}%</span>
              <span className="text-slate-400">vs last month</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-1.5">{formatCurrency(thisMonthExp)} this month</p>
          )}
        </div>

      </div>

      {/* Highlights strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">This Month Revenue</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums truncate">{formatCurrency(thisMonthRev)}</p>
            <p className="text-[11px] text-slate-400">{thisMonthInvoices.length} invoice{thisMonthInvoices.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Paid This Month</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">{thisMonthPaid}</p>
            <p className="text-[11px] text-slate-400">of {thisMonthInvoices.length} invoice{thisMonthInvoices.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-4 py-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${overdueInvoices.length > 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-slate-50 dark:bg-white/[0.05]"}`}>
            <AlertTriangle className={`h-4 w-4 ${overdueInvoices.length > 0 ? "text-red-500" : "text-slate-400"}`} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Overdue</p>
            <p className={`text-base font-bold ${overdueInvoices.length > 0 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-slate-100"}`}>{overdueInvoices.length}</p>
            <p className="text-[11px] text-slate-400">invoice{overdueInvoices.length !== 1 ? "s" : ""} overdue</p>
          </div>
        </div>
      </div>

      {/* Expenses bar chart + Invoice status */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Monthly Expenses Chart — wider */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expenses per Month</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Last 12 months</p>
            </div>
            <Link href="/dashboard/expenses" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors">
              All expenses <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-4 py-4 text-slate-600 dark:text-slate-400">
            <ExpensesBarChart data={monthlyExpenses} />
          </div>
        </div>

        {/* Invoice status breakdown — narrower */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Invoice Status</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{invoices.length} total</p>
            </div>
            <Link href="/dashboard/invoices" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors">
              Invoices <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: "Paid",    count: statusCounts.paid,    barColor: "bg-emerald-500", badgeCls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
              { label: "Unpaid",  count: statusCounts.unpaid,  barColor: "bg-amber-400",   badgeCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
              { label: "Partial", count: statusCounts.partial, barColor: "bg-blue-400",    badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
              { label: "Overdue", count: statusCounts.overdue, barColor: "bg-red-500",     badgeCls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
            ].map(({ label, count, barColor, badgeCls }) => {
              const barPct = invoices.length > 0 ? (count / invoices.length) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${barPct}%` }} />
                  </div>
                </div>
              );
            })}
            {invoices.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No invoices yet</p>
            )}
          </div>

          {/* Expense categories below on mobile — hidden on lg since it's beside chart */}
          <div className="lg:hidden border-t border-slate-100 dark:border-white/[0.06]">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.06]">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expenses by Category</h3>
            </div>
            <div className="p-5 space-y-3">
              {topCategories.length > 0 ? topCategories.map(([cat, amount]) => {
                const barPct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{cat.replace(/_/g, " ")}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-slate-400 dark:bg-slate-500 transition-all" style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-slate-400 text-center py-2">No expenses recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 pb-12 animate-pulse">
      <div>
        <div className="h-6 w-36 bg-slate-100 dark:bg-white/[0.06] rounded" />
        <div className="h-3.5 w-52 bg-slate-100 dark:bg-white/[0.06] rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-2.5 w-20 bg-slate-100 dark:bg-white/[0.06] rounded" />
              <div className="h-7 w-7 bg-slate-100 dark:bg-white/[0.06] rounded-lg" />
            </div>
            <div className="h-7 w-28 bg-slate-100 dark:bg-white/[0.06] rounded" />
            <div className="h-3 w-24 bg-slate-100 dark:bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 h-64 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]" />
        <div className="lg:col-span-2 h-64 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]" />
      </div>
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
