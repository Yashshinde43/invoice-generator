import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = "₹",
  decimals: number = 2
): string {
  return `${currency}${amount.toFixed(decimals)}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(
  sellingPrice: number,
  costPrice: number
): number {
  if (costPrice === 0) return 0;
  return ((sellingPrice - costPrice) / costPrice) * 100;
}

/**
 * Calculate total price with quantity
 */
export function calculateLineTotal(
  quantity: number,
  price: number,
  discount?: number,
  discountType?: "percentage" | "fixed"
): number {
  let total = quantity * price;
  if (discount) {
    if (discountType === "percentage") {
      total = total - (total * discount) / 100;
    } else {
      total = total - discount;
    }
  }
  return Math.max(0, total);
}

/**
 * Calculate subtotal of line items
 */
export function calculateSubtotal(items: Array<{ quantity: number; price: number; total?: number }>): number {
  return items.reduce((sum, item) => sum + (item.total || item.quantity * item.price), 0);
}

/**
 * Calculate tax amount
 */
export function calculateTax(amount: number, taxRate: number): number {
  return (amount * taxRate) / 100;
}

/**
 * Calculate grand total
 */
export function calculateGrandTotal(
  subtotal: number,
  taxRate: number,
  additionalCharges?: number,
  discount?: number
): number {
  let total = subtotal + calculateTax(subtotal, taxRate);
  if (additionalCharges) total += additionalCharges;
  if (discount) total -= discount;
  return Math.max(0, total);
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(prefix: string, lastNumber: number): string {
  return `${prefix}${String(lastNumber + 1).padStart(4, "0")}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Check if stock is low
 */
export function isLowStock(currentStock: number, threshold: number): boolean {
  return currentStock <= threshold;
}

/**
 * Get stock status
 */
export function getStockStatus(currentStock: number, threshold: number): {
  status: "ok" | "low" | "out";
  label: string;
  color: string;
} {
  if (currentStock === 0) {
    return { status: "out", label: "Out of Stock", color: "text-danger-600" };
  }
  if (currentStock <= threshold) {
    return { status: "low", label: "Low Stock", color: "text-warning-600" };
  }
  return { status: "ok", label: "In Stock", color: "text-success-600" };
}
