'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { PaymentStatusData } from '@/types/dashboard'

interface PaymentStatusChartProps {
  data: PaymentStatusData[]
}

// Color palette for payment status
const STATUS_COLORS: Record<string, string> = {
  paid: '#10b981', // green-500
  partial: '#f59e0b', // amber-500
  unpaid: '#ef4444', // red-500
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Unpaid',
}

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null

    const item = payload[0].payload
    const label = STATUS_LABELS[item.status] || item.status

    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-semibold text-gray-900">{item.count}</span>
        </p>
        <p className="text-sm text-gray-600">
          Amount: <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
        </p>
        {item.percentage !== undefined && (
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-semibold text-gray-900">{item.percentage.toFixed(1)}%</span>
          </p>
        )}
      </div>
    )
  }

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.value}</span>
            <Badge
              variant={entry.payload?.status === 'paid' ? 'success' : entry.payload?.status === 'partial' ? 'warning' : 'default'}
              className="text-xs"
            >
              {entry.payload?.count || 0}
            </Badge>
          </div>
        ))}
      </div>
    )
  }

  // Check if data exists
  const hasData = data.some(d => d.count > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>Invoice payment distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">No payment data yet</p>
              <p className="text-sm">Payment data will appear here once you create invoices</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for pie chart
  const chartData = data
    .filter(item => item.count > 0)
    .map(item => ({
      ...item,
      name: STATUS_LABELS[item.status],
    }))

  // Calculate total amount for center text
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Status</CardTitle>
        <CardDescription>Invoice payment distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage?.toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.status]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
          {data.map((item) => (
            <div key={item.status} className="text-center">
              <p className="text-sm text-gray-600 mb-1">{STATUS_LABELS[item.status]}</p>
              <p className="text-lg font-semibold" style={{ color: STATUS_COLORS[item.status] }}>
                {formatCurrency(item.amount)}
              </p>
              <p className="text-xs text-gray-500">{item.count} invoices</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PaymentStatusChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}
