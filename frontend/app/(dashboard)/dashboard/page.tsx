import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import { getDashboardStats, getRecentInvoices } from "@/app/actions";
import { getSalesChartData, getProfitChartData, getTopProductsData, getPaymentStatusData } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import { SalesChart, SalesChartSkeleton, ProfitChart, ProfitChartSkeleton, TopProductsChart, TopProductsChartSkeleton, PaymentStatusChart, PaymentStatusChartSkeleton } from "@/components/dashboard/charts";

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            {changeType === "positive" && <TrendingUp className="inline h-3 w-3 text-success-600 mr-1" />}
            {changeType === "negative" && <TrendingDown className="inline h-3 w-3 text-danger-600 mr-1" />}
            <span className={changeType === "positive" ? "text-success-600" : changeType === "negative" ? "text-danger-600" : ""}>
              {change}
            </span>
            {" "}from yesterday
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

// Charts section component
async function DashboardCharts({ days = 30 }: { days?: number }) {
  const [salesData, profitData, topProducts, paymentStatus] = await Promise.all([
    getSalesChartData(days),
    getProfitChartData(days),
    getTopProductsData(10),
    getPaymentStatusData(),
  ]);

  return (
    <div className="space-y-6">
      {/* Charts Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Track your business performance over time</p>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
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
    <div className="space-y-6">
      <div>
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-64 bg-gray-200 rounded animate-pulse mt-2" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SalesChartSkeleton />
        <ProfitChartSkeleton />
        <TopProductsChartSkeleton />
        <PaymentStatusChartSkeleton />
      </div>
    </div>
  );
}

async function DashboardContent() {
  const [stats, recentInvoices] = await Promise.all([
    getDashboardStats(),
    getRecentInvoices(5),
  ]);
  const lowStockProducts: any[] = [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.today_sales)}
          icon={DollarSign}
        />
        <StatCard
          title="Today's Profit"
          value={formatCurrency(stats.today_profit)}
          icon={TrendingUp}
        />
        <StatCard
          title="Invoices"
          value={stats.today_invoices}
          icon={ShoppingCart}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.low_stock_count}
          description="Items need attention"
          icon={AlertCircle}
        />
      </div>

      {/* Charts Section */}
      <Suspense fallback={<DashboardChartsSkeleton />}>
        <DashboardCharts days={30} />
      </Suspense>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium">New Invoice</p>
                <p className="text-sm text-gray-500">Create sales invoice</p>
              </div>
            </Link>
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="font-medium">Add Product</p>
                <p className="text-sm text-gray-500">Add to inventory</p>
              </div>
            </Link>
            <Link
              href="/dashboard/purchases"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="font-medium">New Purchase</p>
                <p className="text-sm text-gray-500">Record purchase</p>
              </div>
            </Link>
            <Link
              href="/dashboard/customers"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Add Customer</p>
                <p className="text-sm text-gray-500">New customer</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Latest 5 invoices</CardDescription>
              </div>
              <Link
                href="/dashboard/invoices"
                className="text-sm text-primary-600 hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-gray-500">{invoice.customers?.name || invoice.customer_name || 'Walk-in Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                      <Badge
                        variant={invoice.payment_status === 'paid' ? 'success' : invoice.payment_status === 'partial' ? 'warning' : 'default'}
                        className="text-xs"
                      >
                        {invoice.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No invoices yet</p>
                <p className="text-sm">Create your first invoice to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Products running low</CardDescription>
              </div>
              <a
                href="/dashboard/products"
                className="text-sm text-primary-600 hover:underline"
              >
                View All
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</p>
                    </div>
                    <Badge variant="warning" className="text-xs">
                      {product.current_stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>All products are well stocked</p>
                <p className="text-sm">No low stock alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-80 bg-gray-200 rounded animate-pulse mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
