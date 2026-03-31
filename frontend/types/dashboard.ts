/**
 * Dashboard chart data types
 */

// Base chart data point with date and value
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Sales chart data
export interface SalesChartData {
  date: string;
  sales: number;
  invoices: number;
}

// Profit chart data
export interface ProfitChartData {
  date: string;
  profit: number;
  sales: number;
}

// Top product data
export interface TopProductData {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
}

// Payment status data
export interface PaymentStatusData {
  status: 'paid' | 'partial' | 'unpaid';
  count: number;
  amount: number;
  percentage?: number;
}

// Chart data response types
export type SalesChartResponse = SalesChartData[];
export type ProfitChartResponse = ProfitChartData[];
export type TopProductsResponse = TopProductData[];
export type PaymentStatusResponse = PaymentStatusData[];

// Date range options
export type DateRangeOption = '7' | '30' | '90';
