"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Search, Download, Eye, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInvoices, deleteInvoice } from "@/app/actions/invoices-firebase";
import type { Invoice } from "@/app/actions/invoices-firebase";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

function statusBadge(invoice: Invoice) {
  const s = invoice.payment_status === "paid" ? "paid" : invoice.status;
  if (s === "paid") return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0">Paid</Badge>;
  if (s === "draft") return <Badge variant="secondary">Draft</Badge>;
  if (s === "overdue") return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0">Overdue</Badge>;
  return <Badge variant="outline">Sent</Badge>;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getInvoices().then(data => {
      setInvoices(data);
      setIsLoading(false);
    });
  }, []);

  const filtered = invoices.filter(inv => {
    const matchSearch =
      !search ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      inv.payment_status === statusFilter ||
      inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Delete invoice ${num}? This cannot be undone.`)) return;
    setDeletingId(id);
    const result = await deleteInvoice(id);
    if (result.error) {
      toast({ variant: "destructive", title: "Delete failed", description: result.error });
    } else {
      setInvoices(prev => prev.filter(i => i.id !== id));
      toast({ title: "Invoice deleted", description: `${num} has been removed.` });
    }
    setDeletingId(null);
  };

  const totalAmount = filtered.reduce((s, i) => s + (i.total_amount || 0), 0);
  const paidCount = filtered.filter(i => i.payment_status === "paid" || i.status === "paid").length;
  const unpaidCount = filtered.filter(i => i.payment_status !== "paid" && i.status !== "paid").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-slate-100">Invoices</h1>
            <p className="text-gray-500 mt-1">Manage your sales invoices</p>
          </div>
        </div>
        <Button
          className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
          onClick={() => { setIsNavigating(true); router.push("/dashboard/invoices/new"); }}
          disabled={isNavigating}
        >
          {isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          New Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Value", value: formatCurrency(totalAmount), color: "text-gray-900 dark:text-white" },
          { label: "Paid", value: paidCount, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Unpaid / Draft", value: unpaidCount, color: "text-amber-600 dark:text-amber-400" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{isLoading ? "—" : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by invoice # or customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
            <p className="text-sm text-slate-500">Loading invoices…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {search || statusFilter !== "all" ? "No invoices match your filters" : "No invoices yet"}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {search || statusFilter !== "all" ? "Try adjusting your search or filter." : "Create your first invoice to get started."}
            </p>
            {!search && statusFilter === "all" && (
              <Button
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => { setIsNavigating(true); router.push("/dashboard/invoices/new"); }}
                disabled={isNavigating}
              >
                <Plus className="h-4 w-4" /> Create Invoice
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-white/[0.06] text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <span>Invoice</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filtered.map(inv => (
                <div
                  key={inv.id}
                  className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-3 sm:gap-4 items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Invoice # + customer */}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{inv.invoice_number}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {inv.customer_name || "—"}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </div>

                  {/* Amount */}
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {formatCurrency(inv.total_amount || 0)}
                  </div>

                  {/* Status */}
                  <div>{statusBadge(inv)}</div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    {/* View */}
                    <Link href={`/dashboard/invoices/${inv.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View invoice">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Download PDF (if stored) */}
                    {(inv as any).pdf_url && (
                      <a href={(inv as any).pdf_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                      title="Delete invoice"
                      disabled={deletingId === inv.id}
                      onClick={() => handleDelete(inv.id, inv.invoice_number)}
                    >
                      {deletingId === inv.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-600 text-right">
        {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
        {invoices.length !== filtered.length ? ` of ${invoices.length}` : ""} shown
      </p>
    </div>
  );
}
