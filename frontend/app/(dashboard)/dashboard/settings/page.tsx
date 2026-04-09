import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Building, Receipt, Palette, Database, Bell, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { InvoiceTemplatePreview } from "@/components/invoice/InvoiceTemplatePreview";
import { getUserBusiness } from "@/app/actions/business-firebase";

export default async function SettingsPage() {
  const business = await getUserBusiness() as any
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-slate-100">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your business settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <CardTitle>Business Information</CardTitle>
              </div>
              <CardDescription>
                Update your business details that appear on invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name *</Label>
                  <Input id="business-name" placeholder="My Business Pvt Ltd" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" placeholder="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="business@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GST/Tax ID</Label>
                  <Input id="gstin" placeholder="GSTIN12345678" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete business address"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Business Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                    <span className="text-sm text-gray-500">Logo</span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Upload Logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Settings */}
        <TabsContent value="invoice" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                <CardTitle>Invoice Settings</CardTitle>
              </div>
              <CardDescription>
                Customize your invoice templates and numbering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input id="invoice-prefix" placeholder="INV" />
                  <p className="text-xs text-gray-500">
                    Prefix for invoice numbers (e.g., INV-0001)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="starting-number">Starting Number</Label>
                  <Input id="starting-number" type="number" placeholder="1000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Symbol</Label>
                  <Input id="currency" placeholder="₹" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                  <Input id="tax-rate" type="number" placeholder="18" step="0.01" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="terms">Default Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Enter your default invoice terms and conditions"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-details">Payment Details</Label>
                <Textarea
                  id="payment-details"
                  placeholder="Bank account details, UPI ID, etc."
                  rows={3}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Invoice Template</Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      This template is used for all generated invoices and PDFs
                    </p>
                  </div>
                  <Badge className="gap-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-50">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active Template
                  </Badge>
                </div>

                {/* Template name card */}
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-primary-600 bg-primary-50">
                  <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Professional Dark Header</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Navy header · Itemised GST table · Bank details · Authorised signature block
                    </p>
                  </div>
                </div>

                {/* Live preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Live Preview</p>
                  <InvoiceTemplatePreview business={business} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize the look and feel of your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <AppearanceSettings />
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <select
                    id="date-format"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>Asia/Kolkata (IST)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: "Low Stock Alerts", desc: "Get notified when products are running low" },
                { title: "New Invoice", desc: "Notify when invoices are created" },
                { title: "Payment Received", desc: "Notify when payments are received" },
                { title: "Invoice Overdue", desc: "Alert when invoices become overdue" },
                { title: "Purchase Orders", desc: "Notify for new purchase orders" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>Data Management</CardTitle>
              </div>
              <CardDescription>
                Export, import, and manage your business data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Export Data</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Download all your business data in various formats
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Export as CSV</Button>
                    <Button variant="outline">Export as Excel</Button>
                    <Button variant="outline">Export as JSON</Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Import Data</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Import products, customers, or other data from CSV files
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Import Products</Button>
                    <Button variant="outline">Import Customers</Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 text-danger-600">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Irreversible actions that affect your data
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="destructive">Clear All Data</Button>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
