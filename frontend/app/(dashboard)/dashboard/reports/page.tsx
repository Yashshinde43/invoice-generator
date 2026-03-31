import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, PieChart, Download, FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Analytics and insights for your business</p>
        </div>
      </div>

      {/* Report Type Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="profit">Profit/Loss</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Report</CardTitle>
                  <CardDescription>View your sales performance</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range Selector */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Today</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">This Week</Badge>
                <Badge className="cursor-pointer">This Month</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Last Month</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Custom Range</Badge>
              </div>

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-primary-600">₹4,85,000</p>
                  <p className="text-xs text-success-600 mt-1">↑ 12.5% vs last month</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold">234</p>
                  <p className="text-xs text-success-600 mt-1">↑ 8.3% vs last month</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Avg. Order Value</p>
                  <p className="text-2xl font-bold">₹2,073</p>
                  <p className="text-xs text-success-600 mt-1">↑ 3.8% vs last month</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Paid Invoices</p>
                  <p className="text-2xl font-bold text-success-600">216</p>
                  <p className="text-xs text-gray-500 mt-1">92.3% collection rate</p>
                </div>
              </div>

              {/* Charts Placeholder */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Sales Trend</h3>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                      <p>Chart visualization will be added here</p>
                      <p className="text-sm">Using Recharts library</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Sales by Product</h3>
                    <PieChart className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <PieChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Pie chart visualization</p>
                      <p className="text-sm">Top selling products</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products Table */}
              <div className="border rounded-lg">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Top Selling Products</h3>
                </div>
                <div className="divide-y">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Product {i}</p>
                        <p className="text-sm text-gray-500">Category {i}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{50 + i * 10} units</p>
                        <p className="text-sm text-gray-500">₹{(50000 + i * 10000).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Report */}
        <TabsContent value="purchase" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Purchase Report</CardTitle>
                  <CardDescription>Track your purchases from suppliers</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Purchase report charts</p>
                  <p className="text-sm">Will be implemented with Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit/Loss Report */}
        <TabsContent value="profit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profit & Loss Report</CardTitle>
                  <CardDescription>Analyze your business profitability</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <p>Profit/Loss analysis charts</p>
                  <p className="text-sm">Gross profit, net profit, margins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Report</CardTitle>
                  <CardDescription>Stock levels and valuation</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p>Inventory analytics</p>
                  <p className="text-sm">Stock value, fast/slow moving items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Report */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tax Report</CardTitle>
                  <CardDescription>Tax collected and paid</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Tax Collected</p>
                  <p className="text-2xl font-bold text-success-600">₹87,300</p>
                  <p className="text-xs text-gray-500 mt-1">On sales</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Tax Paid</p>
                  <p className="text-2xl font-bold text-danger-600">₹33,300</p>
                  <p className="text-xs text-gray-500 mt-1">On purchases</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Net Tax Liability</p>
                  <p className="text-2xl font-bold text-warning-600">₹54,000</p>
                  <p className="text-xs text-gray-500 mt-1">Payable</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
