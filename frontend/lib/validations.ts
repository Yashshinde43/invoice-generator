import { z } from "zod";

// ============= Auth Schemas =============

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupFormValues = z.infer<typeof signupSchema>;

// ============= Business Schema =============

export const businessSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  gstin: z.string().optional(),
  logo: z.string().optional(),
  currency: z.string().default("₹"),
  taxRate: z.number().min(0).max(100).default(18),
  invoicePrefix: z.string().default("INV"),
  invoiceTerms: z.string().optional(),
  paymentDetails: z.string().optional(),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

// ============= Product Schema =============

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name is required"),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  purchasePrice: z.number().min(0, "Purchase price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  stock: z.number().min(0, "Stock must be positive").default(0),
  lowStockThreshold: z.number().min(0).default(10),
  supplierId: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  unit: z.string().default("pcs"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// ============= Category Schema =============

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ============= Supplier Schema =============

export const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name is required"),
  contact: z.string().min(10, "Contact number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

// ============= Customer Schema =============

export const customerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

// ============= Purchase Item Schema =============

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  costPerUnit: z.number().min(0, "Cost must be positive"),
  total: z.number().optional(),
});

// ============= Purchase Schema =============

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  billNumber: z.string().min(1, "Bill number is required"),
  purchaseDate: z.date(),
  items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
  subtotal: z.number().optional(),
  tax: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  grandTotal: z.number().optional(),
  paymentStatus: z.enum(["paid", "unpaid", "partial"]).default("unpaid"),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  attachment: z.string().optional(),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

// ============= Invoice Item Schema =============

export const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
  discount: z.number().min(0).default(0),
  discountType: z.enum(["percentage", "fixed"]).default("fixed"),
  total: z.number().optional(),
});

// ============= Invoice Schema =============

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.date(),
  dueDate: z.date().optional(),
  items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
  subtotal: z.number().optional(),
  taxRate: z.number().min(0).max(100).default(18),
  additionalCharges: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  grandTotal: z.number().optional(),
  paymentStatus: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// ============= Settings Schema =============

export const settingsSchema = businessSchema.extend({
  dateFormat: z.string().default("DD/MM/YYYY"),
  timezone: z.string().default("Asia/Kolkata"),
  lowStockThreshold: z.number().min(0).default(10),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

// ============= Report Filter Schema =============

export const reportFilterSchema = z.object({
  reportType: z.enum(["sales", "purchase", "profit", "inventory", "tax"]),
  dateRange: z.enum(["today", "week", "month", "custom"]),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  category: z.string().optional(),
  product: z.string().optional(),
  customer: z.string().optional(),
  supplier: z.string().optional(),
});

export type ReportFilterValues = z.infer<typeof reportFilterSchema>;
