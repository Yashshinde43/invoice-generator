import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Database, CheckCircle2 } from "lucide-react";
import { DangerZone } from "@/components/settings/DangerZone";
import { InvoiceTemplatePreview } from "@/components/invoice/InvoiceTemplatePreview";
import { SetupForm } from "@/app/(dashboard)/dashboard/setup/setup-form";
import { getUserBusiness } from "@/app/actions/business-firebase";

export default async function SettingsPage() {
  const business = await getUserBusiness() as any

  // Parse stored payment_details back into individual bank fields
  let bankName = '', accountNumber = '', ifscCode = '', upiId = ''
  if (business?.payment_details) {
    for (const line of (business.payment_details as string).split('\n')) {
      if (line.startsWith('Bank: '))    bankName      = line.slice(6)
      if (line.startsWith('Account: ')) accountNumber = line.slice(9)
      if (line.startsWith('IFSC: '))    ifscCode      = line.slice(6)
      if (line.startsWith('UPI: '))     upiId         = line.slice(5)
    }
  }

  // Parse payment_terms out of terms_conditions
  let paymentTerms = '', termsConditions = ''
  if (business?.terms_conditions) {
    const parts = (business.terms_conditions as string).split('\n\n')
    if (parts.length >= 2) {
      paymentTerms    = parts[0]
      termsConditions = parts.slice(1).join('\n\n')
    } else {
      termsConditions = parts[0]
    }
  }

  const initialData = business
    ? {
        id:               business.id,
        name:             business.name             ?? '',
        email:            business.email            ?? '',
        phone:            business.phone            ?? '',
        address:          business.address          ?? '',
        city:             business.city             ?? '',
        state:            business.state            ?? '',
        country:          business.country          ?? 'India',
        postal_code:      business.postal_code      ?? '',
        gst_number:       business.gst_number       ?? '',
        pan_number:       business.pan_number       ?? '',
        tax_id:           business.tax_id           ?? '',
        tax_rate:         String(business.tax_rate  ?? 18),
        currency_symbol:  business.currency_symbol  ?? '₹',
        payment_terms:    paymentTerms,
        terms_conditions: termsConditions,
        bank_name:        bankName,
        account_number:   accountNumber,
        ifsc_code:        ifscCode,
        upi_id:           upiId,
      }
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-slate-100">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your store settings and preferences</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Store Settings — reuses SetupForm in edit mode */}
        <TabsContent value="store">
          <SetupForm initialData={initialData} />
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
                Manage and permanently delete your business data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DangerZone />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
