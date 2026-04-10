"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearAllData, deleteAccount } from "@/app/actions/danger-zone";
import { useToast } from "@/hooks/use-toast";

type Action = "clear" | "delete" | null;

interface ConfirmConfig {
  type: Action;
  title: string;
  description: string;
  confirmWord: string;
  buttonLabel: string;
  buttonClass: string;
}

const CONFIGS: Record<NonNullable<Action>, ConfirmConfig> = {
  clear: {
    type: "clear",
    title: "Clear All Data",
    description:
      "This will permanently delete all your invoices, expenses, purchases, payments, and products. Your business profile will remain but all records will be gone.",
    confirmWord: "CLEAR",
    buttonLabel: "Clear All Data",
    buttonClass: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  delete: {
    type: "delete",
    title: "Delete Account",
    description:
      "This will permanently delete your account, business profile, and all associated data. This action cannot be undone and you will be signed out immediately.",
    confirmWord: "DELETE",
    buttonLabel: "Delete My Account",
    buttonClass: "bg-red-600 hover:bg-red-500 text-white",
  },
};

export function DangerZone() {
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<Action>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const config = activeAction ? CONFIGS[activeAction] : null;
  const confirmed = confirmInput === config?.confirmWord;

  const close = () => {
    setActiveAction(null);
    setConfirmInput("");
  };

  const handleConfirm = () => {
    if (!confirmed || !activeAction) return;
    startTransition(async () => {
      const action = activeAction === "clear" ? clearAllData : deleteAccount;
      const result = await action();
      if (result?.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        close();
      } else if (activeAction === "clear") {
        toast({ title: "All data cleared", description: "Your business data has been deleted." });
        close();
      }
      // deleteAccount redirects on success, no need to close
    });
  };

  return (
    <>
      {/* Danger Zone card */}
      <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/[0.04] overflow-hidden">
        <div className="px-5 py-4 border-b border-red-200 dark:border-red-500/20 flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
        </div>
        <div className="p-5 space-y-4">

          {/* Clear all data */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-b border-red-200/60 dark:border-red-500/10">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Clear All Data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Delete all invoices, expenses, and records. Business profile stays.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 flex-shrink-0"
              onClick={() => setActiveAction("clear")}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear Data
            </Button>
          </div>

          {/* Delete account */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Delete Account</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Permanently delete your account and all data. Cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex-shrink-0"
              onClick={() => setActiveAction("delete")}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Account
            </Button>
          </div>

        </div>
      </div>

      {/* Confirmation modal */}
      {config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!isPending ? close : undefined}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden">

            {/* Header */}
            <div className={`px-6 py-4 flex items-center gap-3 ${config.type === "delete" ? "bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20" : "bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.type === "delete" ? "bg-red-100 dark:bg-red-500/20" : "bg-amber-100 dark:bg-amber-500/20"}`}>
                <AlertTriangle className={`h-4 w-4 ${config.type === "delete" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`} />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex-1">{config.title}</h2>
              {!isPending && (
                <button onClick={close} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {config.description}
              </p>

              <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-4 py-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Type <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{config.confirmWord}</span> to confirm
                </p>
                <Input
                  value={confirmInput}
                  onChange={e => setConfirmInput(e.target.value.toUpperCase())}
                  placeholder={config.confirmWord}
                  disabled={isPending}
                  className="font-mono text-sm bg-white dark:bg-slate-800"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && confirmed && handleConfirm()}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center gap-3 justify-end">
              <Button variant="outline" onClick={close} disabled={isPending} size="sm">
                Cancel
              </Button>
              <button
                onClick={handleConfirm}
                disabled={!confirmed || isPending}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${config.buttonClass}`}
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {config.buttonLabel}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
