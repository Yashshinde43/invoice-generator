'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExpenseCategory } from "@/types";
import { formatExpenseCategory, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Plus, Hash, CreditCard, Calendar, DollarSign, User, FileText, Building, Home, Wifi, Zap, Wrench, ShoppingCart, Gift } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createExpense } from "@/app/actions/expenses-firebase";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  category: ExpenseCategory;
  categoryData: {
    value: string;
    label: string;
    icon: string;
  };
}

interface FormData {
  amount: string;
  expenseDate: string;
  paymentMethod: string;
  paymentStatus: "paid" | "unpaid" | "pending";
  vendor?: string;
  reference?: string;
  notes?: string;
  receiptImage?: File | null;
  // Category-specific fields
  employeeName?: string;
  salaryMonth?: string;
  employeeId?: string;
  bonusType?: string;
  bonusMonth?: string;
  serviceProvider?: string;
  subscriptionType?: string;
  renewalDate?: string;
  serviceName?: string;
  items?: string;
  supplierName?: string;
  serviceType?: string;
  maintenanceDate?: string;
  providerName?: string;
  planType?: string;
  connectionType?: string;
  utilityType?: string;
  propertyAddress?: string;
  landlordName?: string;
  leasePeriod?: string;
}

export function ExpenseForm({ category, categoryData }: ExpenseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: "cash",
    paymentStatus: "unpaid",
    vendor: "",
    reference: "",
    notes: "",
    receiptImage: null,
    // Initialize category-specific fields
    employeeName: "",
    salaryMonth: "",
    employeeId: "",
    bonusType: "",
    bonusMonth: "",
    serviceProvider: "",
    subscriptionType: "",
    renewalDate: "",
    serviceName: "",
    items: "",
    supplierName: "",
    serviceType: "",
    maintenanceDate: "",
    providerName: "",
    planType: "",
    connectionType: "",
    utilityType: "",
    propertyAddress: "",
    landlordName: "",
    leasePeriod: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, []); // Empty dependency array - only runs on unmount

  // Check if all required fields are filled for the current category
  const validateForm = (): boolean => {
    // Check basic required fields
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setValidationError("Amount must be greater than 0");
      return false;
    }

    // Check receipt image is required
    if (!selectedImage) {
      setValidationError("Receipt image is required");
      return false;
    }

    // Check category-specific required fields
    switch (category) {
      case "salary_wages":
        if (!formData.employeeName?.trim()) {
          setValidationError("Employee Name is required");
          return false;
        }
        if (!formData.salaryMonth?.trim()) {
          setValidationError("Salary Month is required");
          return false;
        }
        break;

      case "attendance":
        if (!formData.employeeName?.trim()) {
          setValidationError("Employee Name is required");
          return false;
        }
        if (!formData.bonusType?.trim()) {
          setValidationError("Bonus Type is required");
          return false;
        }
        break;

      case "subscriptions":
        if (!formData.serviceName?.trim()) {
          setValidationError("Service Name is required");
          return false;
        }
        if (!formData.serviceProvider?.trim()) {
          setValidationError("Service Provider is required");
          return false;
        }
        if (!formData.subscriptionType?.trim()) {
          setValidationError("Subscription Type is required");
          return false;
        }
        break;

      case "office_supplies":
        if (!formData.items?.trim()) {
          setValidationError("Items Purchased is required");
          return false;
        }
        break;

      case "office_maintenance":
        if (!formData.serviceType?.trim()) {
          setValidationError("Service Type is required");
          return false;
        }
        break;

      case "wifi_internet":
        if (!formData.providerName?.trim()) {
          setValidationError("Provider Name is required");
          return false;
        }
        break;

      case "utilities":
        if (!formData.utilityType?.trim()) {
          setValidationError("Utility Type is required");
          return false;
        }
        break;

      case "rent":
        if (!formData.landlordName?.trim()) {
          setValidationError("Landlord Name is required");
          return false;
        }
        if (!formData.propertyAddress?.trim()) {
          setValidationError("Property Address is required");
          return false;
        }
        if (!formData.leasePeriod?.trim()) {
          setValidationError("Lease Period is required");
          return false;
        }
        break;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submitting
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Create FormData object for Firebase action
      const formDataObj = new FormData();

      // Add required fields
      formDataObj.append('category', category);
      formDataObj.append('amount', formData.amount);
      formDataObj.append('expense_date', formData.expenseDate);
      formDataObj.append('payment_method', formData.paymentMethod);
      formDataObj.append('payment_status', formData.paymentStatus);

      // Add optional fields if they have values
      if (formData.vendor?.trim()) formDataObj.append('vendor', formData.vendor);
      if (formData.reference?.trim()) formDataObj.append('reference', formData.reference);
      if (formData.notes?.trim()) formDataObj.append('notes', formData.notes);

      // Add receipt image if selected
      if (selectedImage) {
        formDataObj.append('receipt_image', selectedImage);
      }

      // Add category-specific fields in nested structure
      switch (category) {
        case 'salary_wages':
          if (formData.employeeName?.trim()) formDataObj.append('employee_name', formData.employeeName);
          if (formData.employeeId?.trim()) formDataObj.append('employee_id', formData.employeeId);
          if (formData.salaryMonth?.trim()) formDataObj.append('salary_month', formData.salaryMonth);
          break;

        case 'attendance':
          if (formData.employeeName?.trim()) formDataObj.append('employee_name', formData.employeeName);
          if (formData.bonusType?.trim()) formDataObj.append('bonus_type', formData.bonusType);
          if (formData.bonusMonth?.trim()) formDataObj.append('bonus_month', formData.bonusMonth);
          break;

        case 'subscriptions':
          if (formData.serviceName?.trim()) formDataObj.append('service_name', formData.serviceName);
          if (formData.serviceProvider?.trim()) formDataObj.append('service_provider', formData.serviceProvider);
          if (formData.subscriptionType?.trim()) formDataObj.append('subscription_type', formData.subscriptionType);
          if (formData.renewalDate?.trim()) formDataObj.append('renewal_date', formData.renewalDate);
          break;

        case 'office_supplies':
          if (formData.items?.trim()) formDataObj.append('items', formData.items);
          if (formData.supplierName?.trim()) formDataObj.append('supplier_name', formData.supplierName);
          if (formData.reference?.trim()) formDataObj.append('reference', formData.reference);
          break;

        case 'office_maintenance':
          if (formData.serviceType?.trim()) formDataObj.append('service_type', formData.serviceType);
          if (formData.maintenanceDate?.trim()) formDataObj.append('maintenance_date', formData.maintenanceDate);
          if (formData.serviceProvider?.trim()) formDataObj.append('service_provider', formData.serviceProvider);
          break;

        case 'wifi_internet':
          if (formData.providerName?.trim()) formDataObj.append('provider_name', formData.providerName);
          if (formData.connectionType?.trim()) formDataObj.append('connection_type', formData.connectionType);
          if (formData.planType?.trim()) formDataObj.append('plan_type', formData.planType);
          break;

        case 'utilities':
          if (formData.utilityType?.trim()) formDataObj.append('utility_type', formData.utilityType);
          if (formData.providerName?.trim()) formDataObj.append('provider_name', formData.providerName);
          break;

        case 'rent':
          if (formData.landlordName?.trim()) formDataObj.append('landlord_name', formData.landlordName);
          if (formData.propertyAddress?.trim()) formDataObj.append('property_address', formData.propertyAddress);
          if (formData.leasePeriod?.trim()) formDataObj.append('lease_period', formData.leasePeriod);
          if (formData.reference?.trim()) formDataObj.append('reference', formData.reference);
          break;
      }

      // Call Firebase action
      const result = await createExpense(formDataObj);

      if (result.error) {
        throw new Error(result.error);
      }

      // Success
      toast({
        variant: "success",
        title: "Expense added successfully!",
        description: `${categoryData.label} expense has been recorded.`,
      });

      // Redirect to expenses list
      router.push("/dashboard/expenses");
      router.refresh();
    } catch (error) {
      console.error("Error submitting expense:", error);
      
      let errorMessage = "Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('User not logged in')) {
          errorMessage = "Please sign in to your account first.";
        } else if (error.message.includes('No business found')) {
          errorMessage = "Please set up your business in the dashboard before adding expenses.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Failed to add expense",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Clean up previous preview URL before creating new one
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    
    setSelectedImage(file);
    setFormData(prev => ({ ...prev, receiptImage: file }));
    
    // Create new preview URL if file is selected
    if (file) {
      // Check if it's an image
      const isImage = file.type.startsWith('image/');
      console.log('File selected:', file.name, 'Type:', file.type, 'Is image:', isImage, 'Size:', file.size);
      
      if (isImage) {
        try {
          const newPreviewUrl = URL.createObjectURL(file);
          console.log('✅ Created preview URL:', newPreviewUrl);
          setImagePreviewUrl(newPreviewUrl);
          
          // Test if the URL works by attempting to load it
          const testImg = new Image();
          testImg.onload = () => console.log('✅ Test load successful');
          testImg.onerror = () => console.error('❌ Test load failed - URL:', newPreviewUrl);
          testImg.src = newPreviewUrl;
        } catch (error) {
          console.error('❌ Error creating image preview:', error);
          setImagePreviewUrl(null);
        }
      } else {
        setImagePreviewUrl(null);
        console.log('⚠️ File is not an image type');
      }
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    // Clean up preview URL
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setFormData(prev => ({ ...prev, receiptImage: null }));
    
    // Reset the file input
    const fileInput = document.getElementById('receipt_image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Render category-specific fields
  const renderCategoryFields = () => {
    switch (category) {
      case "salary_wages":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Employee Details</CardTitle>
              <CardDescription>Salary and wages information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="employeeName">
                    <User className="h-3.5 w-3.5 inline mr-1.5" />
                    Employee Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="employeeName"
                    value={formData.employeeName}
                    onChange={(e) => handleChange("employeeName", e.target.value)}
                    placeholder="Employee full name"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Name of the employee</p>
                </div>
                <div>
                  <Label htmlFor="employeeId">
                    <Hash className="h-3.5 w-3.5 inline mr-1.5" />
                    Employee ID
                  </Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => handleChange("employeeId", e.target.value)}
                    placeholder="EMP001"
                  />
                  <p className="text-xs text-gray-500 mt-1">Employee identification number</p>
                </div>
                <div>
                  <Label htmlFor="salaryMonth">
                    <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
                    Salary Month <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="salaryMonth"
                    type="month"
                    value={formData.salaryMonth}
                    onChange={(e) => handleChange("salaryMonth", e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Month and year for this salary</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "attendance":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bonus Details</CardTitle>
              <CardDescription>Attendance and bonus information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="employeeName">
                    <User className="h-3.5 w-3.5 inline mr-1.5" />
                    Employee Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="employeeName"
                    value={formData.employeeName}
                    onChange={(e) => handleChange("employeeName", e.target.value)}
                    placeholder="Employee full name"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Name of the employee</p>
                </div>
                <div>
                  <Label htmlFor="bonusType">
                    <Gift className="h-3.5 w-3.5 inline mr-1.5" />
                    Bonus Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.bonusType}
                    onValueChange={(value) => handleChange("bonusType", value)}
                  >
                    <SelectTrigger id="bonusType">
                      <SelectValue placeholder="Select bonus type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">Attendance Bonus</SelectItem>
                      <SelectItem value="performance">Performance Bonus</SelectItem>
                      <SelectItem value="holiday">Holiday Bonus</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Type of bonus being paid</p>
                </div>
                <div>
                  <Label htmlFor="bonusMonth">
                    <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
                    Bonus Month
                  </Label>
                  <Input
                    id="bonusMonth"
                    type="month"
                    value={formData.bonusMonth}
                    onChange={(e) => handleChange("bonusMonth", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Applicable month (if any)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "subscriptions":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Service subscription information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="serviceName">
                    Service Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="serviceName"
                    value={formData.serviceName}
                    onChange={(e) => handleChange("serviceName", e.target.value)}
                    placeholder="e.g., Adobe Creative Cloud, Microsoft 365"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Name of the subscription service</p>
                </div>
                <div>
                  <Label htmlFor="serviceProvider">
                    Service Provider <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="serviceProvider"
                    value={formData.serviceProvider}
                    onChange={(e) => handleChange("serviceProvider", e.target.value)}
                    placeholder="e.g., Adobe, Microsoft"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Company providing the service</p>
                </div>
                <div>
                  <Label htmlFor="subscriptionType">
                    Subscription Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.subscriptionType}
                    onValueChange={(value) => handleChange("subscriptionType", value)}
                  >
                    <SelectTrigger id="subscriptionType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Billing frequency</p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="renewalDate">
                    <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
                    Next Renewal Date
                  </Label>
                  <Input
                    id="renewalDate"
                    type="date"
                    value={formData.renewalDate}
                    onChange={(e) => handleChange("renewalDate", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">When the subscription renews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "office_supplies":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Supply Details</CardTitle>
              <CardDescription>Office supplies purchased</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="items">
                    <ShoppingCart className="h-3.5 w-3.5 inline mr-1.5" />
                    Items Purchased <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="items"
                    value={formData.items}
                    onChange={(e) => handleChange("items", e.target.value)}
                    placeholder="List the items purchased (e.g., 10x Pens, 5x Notebooks, 2x Printer Paper)"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Detailed list of all items</p>
                </div>
                <div>
                  <Label htmlFor="supplierName">
                    Supplier Name
                  </Label>
                  <Input
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => handleChange("supplierName", e.target.value)}
                    placeholder="Name of the supplier"
                  />
                  <p className="text-xs text-gray-500 mt-1">Where the supplies were purchased</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "office_maintenance":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Details</CardTitle>
              <CardDescription>Office maintenance service information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="serviceType">
                    <Wrench className="h-3.5 w-3.5 inline mr-1.5" />
                    Service Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => handleChange("serviceType", value)}
                  >
                    <SelectTrigger id="serviceType">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Type of maintenance performed</p>
                </div>
                <div>
                  <Label htmlFor="maintenanceDate">
                    <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
                    Service Date
                  </Label>
                  <Input
                    id="maintenanceDate"
                    type="date"
                    value={formData.maintenanceDate}
                    onChange={(e) => handleChange("maintenanceDate", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">When the service was performed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "wifi_internet":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Internet Service Details</CardTitle>
              <CardDescription>WiFi and internet connection information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="providerName">
                    <Wifi className="h-3.5 w-3.5 inline mr-1.5" />
                    Provider Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="providerName"
                    value={formData.providerName}
                    onChange={(e) => handleChange("providerName", e.target.value)}
                    placeholder="e.g., Airtel, JioFiber, ACT"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Internet service provider name</p>
                </div>
                <div>
                  <Label htmlFor="connectionType">
                    Connection Type
                  </Label>
                  <Select
                    value={formData.connectionType}
                    onValueChange={(value) => handleChange("connectionType", value)}
                  >
                    <SelectTrigger id="connectionType">
                      <SelectValue placeholder="Select connection type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiber">Fiber</SelectItem>
                      <SelectItem value="broadband">Broadband</SelectItem>
                      <SelectItem value="mobile">Mobile Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Type of internet connection</p>
                </div>
                <div>
                  <Label htmlFor="planType">
                    Plan Type
                  </Label>
                  <Input
                    id="planType"
                    value={formData.planType}
                    onChange={(e) => handleChange("planType", e.target.value)}
                    placeholder="e.g., 100 Mbps, Unlimited"
                  />
                  <p className="text-xs text-gray-500 mt-1">Plan details (speed, data limit)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "utilities":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Utility Details</CardTitle>
              <CardDescription>Utility bill information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="utilityType">
                    <Zap className="h-3.5 w-3.5 inline mr-1.5" />
                    Utility Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.utilityType}
                    onValueChange={(value) => handleChange("utilityType", value)}
                  >
                    <SelectTrigger id="utilityType">
                      <SelectValue placeholder="Select utility type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Type of utility service</p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="providerName">
                    Provider Name
                  </Label>
                  <Input
                    id="providerName"
                    value={formData.providerName}
                    onChange={(e) => handleChange("providerName", e.target.value)}
                    placeholder="Name of the utility company"
                  />
                  <p className="text-xs text-gray-500 mt-1">Utility service provider</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "rent":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Rent/Lease Details</CardTitle>
              <CardDescription>Property rental information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="landlordName">
                    <User className="h-3.5 w-3.5 inline mr-1.5" />
                    Landlord/Property Owner Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="landlordName"
                    value={formData.landlordName}
                    onChange={(e) => handleChange("landlordName", e.target.value)}
                    placeholder="Name of landlord or property management"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Who receives the rent payment</p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="propertyAddress">
                    <Home className="h-3.5 w-3.5 inline mr-1.5" />
                    Property Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={(e) => handleChange("propertyAddress", e.target.value)}
                    placeholder="Full address of the rented property"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Address of the rented premises</p>
                </div>
                <div>
                  <Label htmlFor="leasePeriod">
                    <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
                    Lease Period <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="leasePeriod"
                    type="month"
                    value={formData.leasePeriod}
                    onChange={(e) => handleChange("leasePeriod", e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Month this rent payment covers</p>
                </div>
                <div>
                  <Label htmlFor="reference">
                    Agreement/Lease Number
                  </Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => handleChange("reference", e.target.value)}
                    placeholder="Lease agreement number"
                  />
                  <p className="text-xs text-gray-500 mt-1">Reference lease document number</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-slate-100">
            Add {categoryData.label} Expense
          </h1>
          <p className="text-gray-500 mt-1">Track your {categoryData.label.toLowerCase()} expenses</p>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            <span className="font-medium">Error:</span> {validationError}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Category Info Card */}
            <Card className="border-primary-200 bg-primary-50/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl bg-primary-100 dark:bg-white/10 rounded-lg p-2">
                      {categoryData.icon}
                    </span>
                    <CardTitle className="text-sm font-semibold text-primary-800">
                      {categoryData.label} Expense
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs text-primary-600 border-primary-300">
                    {formatExpenseCategory(category)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-primary-700">
                  This expense will be categorized under {categoryData.label.toLowerCase()} for tracking and reporting purposes.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-red-500">*</span> indicates required fields
                </p>
              </CardContent>
            </Card>

            {/* Category-specific fields */}
            {renderCategoryFields()}

            {/* Common fields - Amount & Date */}
            <Card>
              <CardHeader>
                <CardTitle>Amount & Date</CardTitle>
                <CardDescription>When and how much was spent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="amount">
                      <DollarSign className="h-3.5 w-3.5 inline mr-1.5" />
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleChange("amount", e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Total amount of this expense
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="expenseDate">
                      <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      value={formData.expenseDate}
                      onChange={(e) => handleChange("expenseDate", e.target.value)}
                      required
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      When this expense occurred
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>How this expense was paid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="paymentMethod">
                      <CreditCard className="h-3.5 w-3.5 inline mr-1.5" />
                      Payment Method
                    </Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleChange("paymentMethod", value)}
                    >
                      <SelectTrigger id="paymentMethod" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      How the payment was made
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="paymentStatus">
                      Payment Status
                    </Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) => handleChange("paymentStatus", value as any)}
                    >
                      <SelectTrigger id="paymentStatus" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Current payment status
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Information for categories that don't have specific provider fields */}
            {!["wifi_internet", "utilities", "rent", "subscriptions", "office_maintenance"].includes(category) && (
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Information</CardTitle>
                  <CardDescription>Who received the payment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="vendor">
                      <User className="h-3.5 w-3.5 inline mr-1.5" />
                      Vendor / Payee
                    </Label>
                    <Input
                      id="vendor"
                      value={formData.vendor}
                      onChange={(e) => handleChange("vendor", e.target.value)}
                      placeholder="Who received the payment"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Person or company who received payment
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reference & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Reference & Notes</CardTitle>
                <CardDescription>Additional reference information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!["office_supplies", "rent"].includes(category) && (
                  <div>
                    <Label htmlFor="reference">
                      <Hash className="h-3.5 w-3.5 inline mr-1.5" />
                      Reference Number
                    </Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => handleChange("reference", e.target.value)}
                      placeholder="Bill number, receipt number, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Invoice number, bill number, or receipt reference
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="notes">
                    <FileText className="h-3.5 w-3.5 inline mr-1.5" />
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any additional notes or details..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional additional information
                  </p>
                </div>

                {/* Receipt Image Upload - REQUIRED */}
                <div>
                  <Label htmlFor="receipt_image">
                    <svg className="h-3.5 w-3.5 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Receipt Image <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="receipt_image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload receipt image (JPG, PNG) - Required
                  </p>
                  
                   {/* Image Preview Section - ALWAYS show when file is selected */}
                  {selectedImage && (
                    <div className="mt-4 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {/* File name */}
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Selected: {selectedImage.name}
                      </p>
                      
                      {/* Debug info */}
                      <p className="text-xs text-gray-500">
                        Type: {selectedImage.type || 'unknown'} | Size: {(selectedImage.size / 1024).toFixed(1)} KB
                      </p>
                      
                      {/* Image Preview - show for image files only */}
                      {imagePreviewUrl && selectedImage?.type?.startsWith('image/') && (
                        <div className="flex items-center gap-3">
                          <div className="relative inline-block group flex-shrink-0">
                            <div className="relative">
                              <img 
                                src={imagePreviewUrl} 
                                alt="Receipt preview" 
                                className="max-w-xs max-h-32 rounded-md shadow-sm border border-gray-300 object-contain"
                                onLoad={() => console.log('✅ Image loaded successfully:', imagePreviewUrl)}
                              />
                              
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 z-10"
                                aria-label="Remove image"
                                title="Remove image"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Show placeholder for non-image files or if preview not available */}
                      {(!imagePreviewUrl || !selectedImage?.type?.startsWith('image/')) && (
                        <div className="flex items-center gap-3">
                          <div className="relative inline-block group flex-shrink-0">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            
                            {/* Remove button for non-image files */}
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 z-10"
                              aria-label="Remove file"
                              title="Remove file"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                           </div>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN - Sticky Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <Separator />

                {/* Summary Preview */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="capitalize truncate max-w-[100px]">
                      {categoryData.label}
                    </span>
                  </div>
                  {formData.employeeName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employee</span>
                      <span className="truncate max-w-[100px]">{formData.employeeName}</span>
                    </div>
                  )}
                  {formData.serviceName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service</span>
                      <span className="truncate max-w-[100px]">{formData.serviceName}</span>
                    </div>
                  )}
                  {formData.providerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider</span>
                      <span className="truncate max-w-[100px]">{formData.providerName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">
                      {formData.amount ? formatCurrency(parseFloat(formData.amount)) : "Rs. 0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="truncate max-w-[100px]">
                      {formData.expenseDate ? new Date(formData.expenseDate).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      }) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="capitalize">
                      {formData.paymentStatus || "-"}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total Amount */}
                <div className="flex justify-between items-center font-bold text-base border-t pt-3">
                  <span>Total</span>
                  <span className="text-primary-600 text-lg">
                    {formData.amount ? formatCurrency(parseFloat(formData.amount)) : "Rs. 0.00"}
                  </span>
                </div>

                <Separator />

                {/* Action Buttons */}
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Expense
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isSubmitting}
                  className="w-full gap-2"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>

              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}