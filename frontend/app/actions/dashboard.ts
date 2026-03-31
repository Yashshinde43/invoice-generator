'use server'

import type {
  SalesChartData,
  ProfitChartData,
  TopProductData,
  PaymentStatusData,
} from '@/types/dashboard'

export async function getSalesChartData(days: number = 30): Promise<SalesChartData[]> {
  return []
}

export async function getProfitChartData(days: number = 30): Promise<ProfitChartData[]> {
  return []
}

export async function getTopProductsData(limit: number = 10): Promise<TopProductData[]> {
  return []
}

export async function getPaymentStatusData(): Promise<PaymentStatusData[]> {
  return []
}
