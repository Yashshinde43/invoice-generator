"use client";

import { Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Search, ArrowLeft, TrendingDown, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EXPENSE_CATEGORIES } from "@/types";
import { formatExpenseCategory, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Expense, getExpenses, getExpensesSummary, deleteExpense, updateExpense } from "@/app/actions/expenses-firebase";
import { useToast } from "@/hooks/use-toast";

function ExpensesTableSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-24 space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpensesContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    total_spent: 0,
    paid: 0,
    unpaid: 0,
    pending: 0,
    categories_count: EXPENSE_CATEGORIES.length,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Generate options dynamically
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
  const currentMonthString = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
  const monthOptions = [
    { value: "all", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const yearOptions = [
    { value: "all", label: "All Years" },
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear + 1), label: String(currentYear + 1) },
  ];

  useEffect(() => {
    // Set default month and year to current
    setSelectedMonth(currentMonthString);
    setSelectedYear(String(currentYear));
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const [expensesData, summaryData] = await Promise.all([
        getExpenses(),
        getExpensesSummary(),
      ]);

      setExpenses(expensesData);
      
      if (summaryData) {
        setStats({
          total: summaryData.total_expenses,
          total_spent: summaryData.total_amount,
          paid: summaryData.paid_expenses,
          unpaid: summaryData.unpaid_expenses,
          pending: summaryData.pending_expenses,
          categories_count: EXPENSE_CATEGORIES.length,
        });
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        variant: "destructive",
        title: "Error loading expenses",
        description: "Could not load expenses data. Please refresh the page.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter expenses based on search and filters
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchTerm === "" || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || expense.payment_status === selectedStatus;
    
    // Handle month/year filter
    let matchesDate = true;
    if (selectedMonth !== "all" || selectedYear !== "all") {
      const expenseDateStr = expense.expense_date;
      if (expenseDateStr) {
        const expenseMonth = new Date(expenseDateStr).toISOString().substring(5, 7);
        const expenseYear = new Date(expenseDateStr).toISOString().substring(0, 4);
        
        const monthMatch = selectedMonth === "all" || expenseMonth === selectedMonth;
        const yearMatch = selectedYear === "all" || expenseYear === selectedYear;
        
        matchesDate = monthMatch && yearMatch;
      } else {
        matchesDate = false;
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedExpenses = filteredExpenses.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  // Stats derived from filtered expenses so cards react to filters
  const filteredStats = {
    total: filteredExpenses.length,
    total_spent: filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    paid: filteredExpenses.filter(e => e.payment_status === 'paid').length,
    unpaid: filteredExpenses.filter(e => e.payment_status === 'unpaid').length,
    pending: filteredExpenses.filter(e => e.payment_status === 'pending').length,
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleNavigateToNewExpense = () => {
    setIsNavigating(true);
    router.push("/dashboard/expenses/new");
  };

  const handleEditExpense = (expenseId: string) => {
    setIsNavigating(true);
    router.push(`/dashboard/expenses/edit/${expenseId}`);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteExpense(expenseToDelete.id);
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error deleting expense",
          description: result.error,
        });
      } else {
        toast({
          title: "Expense deleted successfully",
          description: `"${expenseToDelete.description}" has been deleted.`,
        });
        // Refresh the expenses list
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        variant: "destructive",
        title: "Error deleting expense",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-slate-100">
            Expenses
          </h1>
          <p className="text-gray-500 mt-1">Track and manage business expenses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-primary-600" />
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {isLoading ? "..." : filteredStats.total}
            </div>
            <p className="text-xs text-gray-500 mt-1">{filteredStats.total === stats.total ? "All time" : "Filtered"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary-600" />
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {isLoading ? "..." : formatCurrency(filteredStats.total_spent)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{filteredStats.total === stats.total ? "All time" : "Filtered"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-600">
              {isLoading ? "..." : filteredStats.paid}
            </div>
            <p className="text-xs text-gray-500 mt-1">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-600">
              {isLoading ? "..." : filteredStats.pending + filteredStats.unpaid}
            </div>
            <p className="text-xs text-gray-500 mt-1">Unpaid/pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>Track your business expenses and costs</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="gap-2" onClick={handleNavigateToNewExpense} disabled={isNavigating}>
                {isNavigating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                New Expense
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
              />
            </div>
            <Select value={selectedCategory} onValueChange={v => { setSelectedCategory(v); resetPage(); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={v => { setSelectedStatus(v); resetPage(); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={v => { setSelectedMonth(v); resetPage(); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={v => { setSelectedYear(v); resetPage(); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Wallet className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}

          {/* Table */}
          {!isLoading && filteredExpenses.length > 0 && (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            {expense.vendor && (
                              <p className="text-xs text-gray-500">{expense.vendor}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {formatExpenseCategory(expense.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {expense.expense_date ? new Date(expense.expense_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={expense.payment_status === 'paid' ? 'success' : 'warning'}
                            className="text-xs"
                          >
                            {expense.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewExpense(expense)}
                              title="View Expense"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditExpense(expense.id)}
                              title="Edit Expense"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                              onClick={() => handleDeleteExpense(expense)}
                              title="Delete Expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`} className="text-xs text-slate-400 px-1">…</span>
                      ) : (
                        <Button
                          key={p}
                          variant={safePage === p ? "default" : "outline"}
                          size="icon"
                          className={`h-8 w-8 text-xs ${safePage === p ? "bg-emerald-600 hover:bg-emerald-500 border-0 text-white" : ""}`}
                          onClick={() => setPage(p as number)}
                        >
                          {p}
                        </Button>
                      )
                    )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 dark:text-white">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredExpenses.length)} of {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""}
                  {expenses.length !== filteredExpenses.length ? ` (filtered from ${expenses.length})` : ""}
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all" 
                  ? "No expenses match your filters" 
                  : "No expenses yet"
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first expense."
                }
              </p>
              <Button className="gap-2" onClick={handleNavigateToNewExpense} disabled={isNavigating}>
                {isNavigating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                New Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Expense Modal */}
      {isModalOpen && selectedExpense && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[200] p-4" onClick={() => { setIsModalOpen(false); setSelectedExpense(null); }}>
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Expense Details
                </h2>
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-900 dark:text-slate-100">{selectedExpense.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <Badge variant="outline" className="mt-1">
                      {formatExpenseCategory(selectedExpense.category)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                      {formatCurrency(selectedExpense.amount)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-gray-900 dark:text-slate-100">
                      {new Date(selectedExpense.expense_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                    <Badge 
                      variant={selectedExpense.payment_status === 'paid' ? 'success' : 'warning'}
                      className="mt-1"
                    >
                      {selectedExpense.payment_status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="text-gray-900 dark:text-slate-100 capitalize">
                      {selectedExpense.payment_method?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                  {selectedExpense.vendor && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Vendor</p>
                      <p className="text-gray-900 dark:text-slate-100">{selectedExpense.vendor}</p>
                    </div>
                  )}
                </div>

                {selectedExpense.reference && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reference</p>
                    <p className="text-gray-900 dark:text-slate-100">{selectedExpense.reference}</p>
                  </div>
                )}
              </div>

              {/* Category-specific Details */}
              {selectedExpense.category === 'salary_wages' && selectedExpense.salary && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Salary Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Employee Name</p>
                      <p className="text-gray-900 dark:text-slate-100">{selectedExpense.salary.employee_name}</p>
                    </div>
                    {selectedExpense.salary.employee_id && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Employee ID</p>
                        <p className="text-gray-900 dark:text-slate-100">{selectedExpense.salary.employee_id}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">Salary Month</p>
                      <p className="text-gray-900 dark:text-slate-100">{selectedExpense.salary.salary_month}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedExpense.category === 'attendance' && selectedExpense.bonus && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Bonus Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Employee Name</p>
                      <p className="text-gray-900 dark:text-slate-100">{selectedExpense.bonus.employee_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bonus Type</p>
                      <p className="text-gray-900 dark:text-slate-100 capitalize">{selectedExpense.bonus.bonus_type}</p>
                    </div>
                    {selectedExpense.bonus.bonus_month && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Bonus Month</p>
                        <p className="text-gray-900 dark:text-slate-100">{selectedExpense.bonus.bonus_month}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedExpense.category === 'subscriptions' && selectedExpense.subscription && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Subscription Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Service Name</p>
                      <p className="text-gray-900 dark:text-slate-100">{selectedExpense.subscription.service_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Provider</p>
                      <p className="text-gray-900 dark:text-slate-100">{selectedExpense.subscription.service_provider}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Subscription Type</p>
                      <p className="text-gray-900 dark:text-slate-100 capitalize">
                        {selectedExpense.subscription.subscription_type}
                      </p>
                    </div>
                    {selectedExpense.subscription.renewal_date && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Renewal Date</p>
                        <p className="text-gray-900 dark:text-slate-100">
                          {new Date(selectedExpense.subscription.renewal_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Receipt Image */}
              {selectedExpense.image_url && selectedExpense.image_url.trim() !== '' && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Receipt Image</p>
                  <div
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 inline-block cursor-zoom-in"
                    onClick={() => setLightboxUrl(selectedExpense.image_url!)}
                    title="Click to zoom"
                  >
                    <img
                      src={selectedExpense.image_url}
                      alt="Receipt"
                      className="max-w-xs max-h-48 rounded-md shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const errorMsg = document.createElement('p');
                        errorMsg.className = 'text-xs text-red-500';
                        errorMsg.textContent = 'Failed to load receipt image.';
                        target.parentElement?.appendChild(errorMsg);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedExpense.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-900 dark:text-slate-100 whitespace-pre-wrap">{selectedExpense.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxUrl}
            alt="Receipt full view"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && expenseToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={cancelDelete}>
          <div
            className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete Expense?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              &quot;{expenseToDelete.description}&quot; will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={cancelDelete} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="gap-2 bg-red-600 hover:bg-red-500 text-white border-0"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">Loading expenses...</div>}>
      <ExpensesContent />
    </Suspense>
  );
}
