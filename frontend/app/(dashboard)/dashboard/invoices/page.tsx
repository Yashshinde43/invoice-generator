"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Loader2 } from "lucide-react";

export default function InvoicesPage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleCreateInvoice = () => {
    setIsNavigating(true);
    router.push("/dashboard/invoices/new");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-slate-100">Invoices</h1>
          <p className="text-gray-500 mt-1">Create and manage sales invoices</p>
        </div>
        <Button className="gap-2" onClick={handleCreateInvoice} disabled={isNavigating}>
          {isNavigating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Invoice
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create a new invoice</h3>
        <p className="text-gray-500 mb-6">All invoices are listed under the Customers section.</p>
        <Button className="gap-2" onClick={handleCreateInvoice} disabled={isNavigating}>
          {isNavigating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Invoice
        </Button>
      </div>
    </div>
  );
}
