import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Plus, Search, Download, Edit, Trash2, Phone, Users, Loader2, FileText, Filter } from "lucide-react";
import Link from "next/link";
import { getCustomersWithInvoiceStats } from "@/app/actions/customers-firebase";
import { getInvoices } from "@/app/actions/invoices-firebase";
import { formatCurrency } from "@/lib/utils";
import { InvoicePDFButton } from "@/components/pdf/InvoicePDFButton";
import { DeleteInvoiceButton } from "@/components/invoice/DeleteInvoiceButton";

async function CustomersContent() {
  const [customers, invoices] = await Promise.all([
    getCustomersWithInvoiceStats(),
    getInvoices(),
  ]);

  // Invoice stats
  const totalInvoices = invoices.length;
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const pendingInvoices = invoices.filter(inv => inv.payment_status === 'pending' || inv.payment_status === 'partial');
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);
  const overdueInvoices = invoices.filter(inv => {
    if (inv.status === 'overdue') return true;
    if (inv.due_date && inv.payment_status !== 'paid') {
      return new Date(inv.due_date) < new Date();
    }
    return false;
  }).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Customer Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-600">
              +{customers.filter(c => {
                const createdDate = new Date(c.created_at);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">New customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(customers.map(c => c.customer_type)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">Customer types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customers.reduce((sum, c) => sum + (c.total_revenue || 0), 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>View and manage your customer list</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search customers by name, phone, or email..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {customers.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Invoices</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                      <TableHead className="text-right">Last Invoice #</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{customer.name}</p>
                            {customer.company_name && (
                              <p className="text-xs text-gray-500">{customer.company_name}</p>
                            )}
                            {customer.email && (
                              <p className="text-xs text-gray-500">{customer.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.mobile && !customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{customer.mobile}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {customer.city && customer.state
                              ? `${customer.city}, ${customer.state}`
                              : customer.city || customer.state || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {(customer.invoice_count ?? 0) > 0 ? (
                            <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-blue-100">
                              <FileText className="h-3 w-3" />
                              {customer.invoice_count}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(customer.total_revenue ?? 0) > 0 ? (
                            <span className="text-green-600">{formatCurrency(customer.total_revenue!)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {customer.last_invoice_number ? (
                            <span className="text-blue-600 font-medium">
                              {customer.last_invoice_number}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-danger-600">
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
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing 1 to {Math.min(customers.length, 10)} of {customers.length} customers
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={customers.length <= 10}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first customer.</p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-600">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">{pendingInvoices.length} unpaid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger-600">{overdueInvoices}</div>
            <p className="text-xs text-gray-500 mt-1">Invoices overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>View and manage your sales invoices</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Link href="/dashboard/invoices/new">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
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
                placeholder="Search by invoice number, customer..."
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" className="w-full sm:w-[180px]" />
          </div>

          {/* Table */}
          {invoices.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.payment_status !== 'paid';

                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>
                            <div>
                              <p>{invoice.customer_name || invoice.customers?.name || 'Walk-in Customer'}</p>
                              {invoice.customer_phone && (
                                <p className="text-xs text-gray-500">{invoice.customer_phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.invoice_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            {invoice.due_date ? (
                              new Date(invoice.due_date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(invoice.total_amount)}
                          </TableCell>
                          <TableCell>
                            {invoice.status === 'draft' ? (
                              <Badge variant="secondary">Draft</Badge>
                            ) : invoice.status === 'paid' ? (
                              <Badge variant="success">Paid</Badge>
                            ) : isOverdue || invoice.status === 'overdue' ? (
                              <Badge variant="warning">Overdue</Badge>
                            ) : (
                              <Badge variant="outline">Sent</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <InvoicePDFButton
                                invoiceId={invoice.id}
                                invoiceNumber={invoice.invoice_number}
                                variant="ghost"
                                size="icon"
                              />
                              <DeleteInvoiceButton
                                invoiceId={invoice.id}
                                invoiceNumber={invoice.invoice_number}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing 1 to {Math.min(invoices.length, 10)} of {invoices.length} invoices
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={invoices.length <= 10}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first invoice.</p>
              <Link href="/dashboard/invoices/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>}>
      <CustomersContent />
    </Suspense>
  );
}
