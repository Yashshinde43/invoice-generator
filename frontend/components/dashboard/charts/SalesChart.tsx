'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { SalesChartData } from '@/types/dashboard'

interface SalesChartProps {
  data: SalesChartData[]
  days: number
}

export function SalesChart({ data, days }: SalesChartProps) {
  // Format date for display
  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem)
    if (days <= 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' })
    }
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null

    const date = new Date(payload[0].payload.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{date}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.dataKey === 'sales' ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    )
  }

  // Check if data exists
  const hasData = data.some(d => d.sales > 0 || d.invoices > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">No sales data yet</p>
              <p className="text-sm">Sales will appear here once you create invoices</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
        <CardDescription>Last {days} days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisLabel}
              className="text-xs"
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              yAxisId="sales"
              orientation="left"
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              yAxisId="invoices"
              orientation="right"
              tickFormatter={(value) => value.toString()}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="sales"
              dataKey="sales"
              name="Sales Amount"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="invoices"
              dataKey="invoices"
              name="Invoices"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function SalesChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}
