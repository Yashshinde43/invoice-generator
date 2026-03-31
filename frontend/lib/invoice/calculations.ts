/**
 * Invoice calculations utility functions
 * Handles all mathematical operations for invoice totals, taxes, discounts, and profit tracking
 */

export interface LineItem {
  product_id: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  cost_per_unit?: number;
  discount_amount?: number;
  notes?: string;
}

export interface InvoiceTotals {
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  other_charges: number;
  discount_amount: number;
  total_amount: number;
  cost_of_goods_sold: number;
  profit_amount: number;
}

/**
 * Calculate line item subtotal (quantity * price)
 */
export function calculateLineItemTotal(
  quantity: number,
  pricePerUnit: number,
  discountAmount: number = 0
): number {
  const subtotal = quantity * pricePerUnit;
  return Math.max(0, subtotal - discountAmount);
}

/**
 * Calculate subtotal of all line items
 */
export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => {
    return sum + calculateLineItemTotal(
      item.quantity,
      item.price_per_unit,
      item.discount_amount || 0
    );
  }, 0);
}

/**
 * Calculate tax amount based on subtotal and tax rate
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return (subtotal * taxRate) / 100;
}

/**
 * Calculate total discount amount
 */
export function calculateDiscount(
  subtotal: number,
  discountAmount: number,
  discountType: 'amount' | 'percentage'
): number {
  if (discountType === 'percentage') {
    return (subtotal * discountAmount) / 100;
  }
  return discountAmount;
}

/**
 * Calculate grand total with all charges and discounts
 */
export function calculateGrandTotal(
  subtotal: number,
  taxRate: number,
  shippingAmount: number = 0,
  otherCharges: number = 0,
  discountAmount: number = 0,
  discountType: 'amount' | 'percentage' = 'amount'
): number {
  const tax = calculateTax(subtotal, taxRate);
  const discount = calculateDiscount(subtotal, discountAmount, discountType);
  const total = subtotal + tax + shippingAmount + otherCharges - discount;
  return Math.max(0, total);
}

/**
 * Calculate cost of goods sold (COGS)
 */
export function calculateCostOfGoodsSold(items: LineItem[]): number {
  return items.reduce((sum, item) => {
    const costPerUnit = item.cost_per_unit || 0;
    return sum + (item.quantity * costPerUnit);
  }, 0);
}

/**
 * Calculate profit amount
 */
export function calculateProfit(
  totalAmount: number,
  costOfGoodsSold: number,
  taxAmount: number
): number {
  return totalAmount - costOfGoodsSold - taxAmount;
}

/**
 * Calculate all invoice totals at once
 */
export function calculateInvoiceTotals(
  items: LineItem[],
  taxRate: number,
  shippingAmount: number = 0,
  otherCharges: number = 0,
  discountAmount: number = 0,
  discountType: 'amount' | 'percentage' = 'amount'
): InvoiceTotals {
  const subtotal = calculateSubtotal(items);
  const tax_amount = calculateTax(subtotal, taxRate);
  const discount = calculateDiscount(subtotal, discountAmount, discountType);
  const total_amount = subtotal + tax_amount + shippingAmount + otherCharges - discount;
  const cost_of_goods_sold = calculateCostOfGoodsSold(items);
  const profit_amount = total_amount - cost_of_goods_sold - tax_amount;

  return {
    subtotal,
    tax_amount,
    shipping_amount: shippingAmount,
    other_charges: otherCharges,
    discount_amount: discount,
    total_amount: Math.max(0, total_amount),
    cost_of_goods_sold,
    profit_amount: Math.max(0, profit_amount),
  };
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(
  totalAmount: number,
  profitAmount: number
): number {
  if (totalAmount === 0) return 0;
  return (profitAmount / totalAmount) * 100;
}

/**
 * Validate line item stock availability
 */
export function validateLineItemStock(
  items: LineItem[],
  availableStock: Map<string, number>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const item of items) {
    const stock = availableStock.get(item.product_id) || 0;
    if (item.quantity > stock) {
      errors.push(`${item.product_name}: Requested ${item.quantity} but only ${stock} available`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate tax amount for a single line item
 */
export function calculateLineItemTax(
  quantity: number,
  pricePerUnit: number,
  discountAmount: number,
  taxRate: number
): number {
  const lineTotal = calculateLineItemTotal(quantity, pricePerUnit, discountAmount);
  return calculateTax(lineTotal, taxRate);
}

/**
 * Calculate total amount for a single line item (including tax)
 */
export function calculateLineItemTotalWithTax(
  quantity: number,
  pricePerUnit: number,
  discountAmount: number,
  taxRate: number
): number {
  const lineTotal = calculateLineItemTotal(quantity, pricePerUnit, discountAmount);
  const tax = calculateTax(lineTotal, taxRate);
  return lineTotal + tax;
}
