// ============= User & Auth Types =============

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  gstin?: string;
  logo?: string;
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  invoiceTerms?: string;
  paymentDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= Product & Inventory Types =============

export interface Category {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  contact: string;
  email?: string;
  address?: string;
  gstin?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  categoryId?: string;
  category?: Category;
  sku?: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  profitMargin: number;
  stock: number;
  lowStockThreshold: number;
  supplierId?: string;
  supplier?: Supplier;
  description?: string;
  image?: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockHistory {
  id: string;
  businessId: string;
  productId: string;
  product?: Product;
  type: "purchase" | "sale" | "adjustment" | "return";
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  referenceType?: "purchase" | "invoice" | "manual";
  notes?: string;
  createdAt: Date;
}

// ============= Customer Types =============

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  notes?: string;
  totalPurchases: number;
  totalAmount: number;
  outstandingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============= Purchase Types =============

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  product?: Product;
  quantity: number;
  costPerUnit: number;
  total: number;
}

export interface Purchase {
  id: string;
  businessId: string;
  supplierId: string;
  supplier?: Supplier;
  billNumber: string;
  purchaseDate: Date;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  paymentStatus: "paid" | "unpaid" | "partial";
  paymentMethod?: string;
  notes?: string;
  attachment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= Invoice Types =============

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  discount: number;
  discountType: "percentage" | "fixed";
  total: number;
}

export interface Invoice {
  id: string;
  businessId: string;
  customerId: string;
  customer?: Customer;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  additionalCharges: number;
  discount: number;
  grandTotal: number;
  paymentStatus: "draft" | "sent" | "paid" | "overdue";
  paymentMethod?: string;
  paidAmount: number;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= Payment Types =============

export interface Payment {
  id: string;
  businessId: string;
  invoiceId?: string;
  invoice?: Invoice;
  customerId?: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

// ============= Expense Types =============

export const EXPENSE_CATEGORIES = [
  { value: "salary_wages", label: "Salary/Wages", icon: "💰" },
  { value: "attendance", label: "Attendance/Bonus", icon: "👥" },
  { value: "subscriptions", label: "Subscriptions", icon: "📱" },
  { value: "office_supplies", label: "Office Supplies", icon: "📎" },
  { value: "office_maintenance", label: "Office Maintenance", icon: "🔧" },
  { value: "wifi_internet", label: "WiFi/Internet", icon: "📶" },
  { value: "utilities", label: "Utilities", icon: "💡" },
  { value: "rent", label: "Rent/Lease", icon: "🏢" },
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]["value"];

export interface Expense {
  id: string;
  businessId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: string;
  paymentStatus: "paid" | "unpaid" | "pending";
  reference?: string;
  vendor?: string;
  attachment?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= Report Types =============

export interface SalesReport {
  totalSales: number;
  totalProfit: number;
  totalInvoices: number;
  averageOrderValue: number;
  salesByProduct: Array<{ productName: string; quantity: number; amount: number }>;
  salesByCustomer: Array<{ customerName: string; amount: number; count: number }>;
  dailySales: Array<{ date: string; sales: number; profit: number }>;
}

export interface PurchaseReport {
  totalPurchases: number;
  totalSpent: number;
  averagePurchaseValue: number;
  purchasesBySupplier: Array<{ supplierName: string; amount: number }>;
  purchasesByCategory: Array<{ categoryName: string; amount: number }>;
}

export interface ProfitReport {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalRevenue: number;
  totalCost: number;
  totalExpenses: number;
  profitByProduct: Array<{ productName: string; profit: number; margin: number }>;
}

export interface InventoryReport {
  totalProducts: number;
  totalStockValue: number;
  lowStockItems: Product[];
  outOfStockItems: Product[];
  fastMovingItems: Array<{ product: Product; sold: number }>;
  slowMovingItems: Array<{ product: Product; sold: number }>;
}

export interface TaxReport {
  taxCollected: number;
  taxPaid: number;
  netTaxLiability: number;
}

// ============= Dashboard Types =============

export interface DashboardStats {
  todaySales: number;
  todayProfit: number;
  todayInvoices: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingPayments: number;
  totalCustomers: number;
  totalProducts: number;
}

export interface RecentActivity {
  id: string;
  type: "invoice" | "purchase" | "payment" | "stock";
  description: string;
  amount?: number;
  createdAt: Date;
}

// ============= Form Types =============

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

// ============= Table Types =============

export interface ColumnDef<T> {
  id: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============= Filter Types =============

export interface DateRange {
  from: Date;
  to: Date;
}

export interface FilterOptions {
  search?: string;
  dateRange?: DateRange;
  status?: string[];
  category?: string[];
}

// ============= Notification Types =============

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// ============= Chart Types =============

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface LineChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

export interface PieChartData {
  labels: string[];
  data: number[];
  colors: string[];
}
