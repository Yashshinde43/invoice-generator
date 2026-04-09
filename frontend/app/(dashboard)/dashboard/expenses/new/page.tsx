"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EXPENSE_CATEGORIES } from "@/types";
import { Wallet, Plus } from "lucide-react";

export default function NewExpensePage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <Wallet className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-slate-100">
            Add New Expense
          </h1>
          <p className="text-gray-500 mt-1">
            Select a category to track your expense
          </p>
        </div>
      </div>

      {/* Category Selection Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary-600" />
            <CardTitle className="text-sm font-semibold text-primary-800">
              Choose Expense Category
            </CardTitle>
          </div>
          <CardDescription>
            Select the category that best describes your expense
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {EXPENSE_CATEGORIES.map((cat) => (
              <Link href={`/dashboard/expenses/${cat.value}`} key={cat.value}>
                <div className="p-6 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all hover:shadow-md cursor-pointer group h-full">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform bg-gray-100 dark:bg-white/10 rounded-lg p-3">
                      {cat.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-slate-100">
                        {cat.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
                        Click to add {cat.label.toLowerCase()} expense
                      </p>
                    </div>
                    <Plus className="h-5 w-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-slate-300 transition-colors flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}