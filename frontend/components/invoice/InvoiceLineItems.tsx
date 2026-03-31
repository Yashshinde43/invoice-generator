'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Package, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { calculateLineItemTotal } from '@/lib/invoice/calculations'

export interface Product {
  id: string
  name: string
  sku?: string
  selling_price: number
  purchase_price: number
  current_stock: number
  unit: string
  is_track_stock: boolean
}

export interface LineItem {
  id: string
  product_id: string
  product_name: string
  description?: string
  quantity: number
  unit: string
  price_per_unit: number
  cost_per_unit?: number
  discount_amount: number
  notes?: string
}

interface InvoiceLineItemsProps {
  items: LineItem[]
  products: Product[]
  onChange: (items: LineItem[]) => void
  readonly?: boolean
}

export function InvoiceLineItems({
  items,
  products,
  onChange,
  readonly = false,
}: InvoiceLineItemsProps) {
  const productMap = new Map(products.map((p) => [p.id, p]))

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      product_id: '',
      product_name: '',
      quantity: 1,
      unit: 'pcs',
      price_per_unit: 0,
      discount_amount: 0,
    }
    onChange([...items, newItem])
  }

  const removeLineItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange(newItems)
  }

  const handleProductChange = (index: number, productId: string) => {
    if (productId === '__manual__') {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        product_id: '',
        product_name: '',
        price_per_unit: 0,
        cost_per_unit: 0,
        unit: 'pcs',
        quantity: 1,
        discount_amount: 0,
      }
      onChange(newItems)
      return
    }
    const product = productMap.get(productId)
    if (product) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        product_name: product.name,
        price_per_unit: product.selling_price,
        cost_per_unit: product.purchase_price,
        unit: product.unit,
        quantity: 1,
        discount_amount: 0,
      }
      onChange(newItems)
    }
  }

  const getLineTotal = (item: LineItem) =>
    calculateLineItemTotal(item.quantity, item.price_per_unit, item.discount_amount)

  const getStockBadge = (productId: string) => {
    const product = productMap.get(productId)
    if (!product || !product.is_track_stock) return null
    if (product.current_stock === 0)
      return <Badge variant="destructive" className="text-xs">Out of stock</Badge>
    if (product.current_stock <= 10)
      return <Badge variant="warning" className="text-xs">Low: {product.current_stock}</Badge>
    return <Badge variant="success" className="text-xs">Stock: {product.current_stock}</Badge>
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Line Items</h3>
            {!readonly && (
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            )}
          </div>

          {/* Column headers */}
          {items.length > 0 && (
            <div className="hidden md:grid md:grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-4">Product / Description</div>
              <div className="col-span-2 text-right">Price (₹)</div>
              <div className="col-span-1 text-right">Qty</div>
              <div className="col-span-1 text-center">Unit</div>
              <div className="col-span-2 text-right">Discount (₹)</div>
              <div className="col-span-1 text-right">Total</div>
              {!readonly && <div className="col-span-1" />}
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-1">No items added</p>
              <p className="text-xs text-gray-400 mb-4">
                Add from your product catalog or enter item details manually
              </p>
              {!readonly && (
                <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Item
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const isManual = !item.product_id
                const lineTotal = getLineTotal(item)

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    {/* Product / Name */}
                    <div className="col-span-1 md:col-span-4 space-y-1">
                      {!readonly && products.length > 0 && (
                        <Select
                          value={item.product_id || '__manual__'}
                          onValueChange={(v) => handleProductChange(index, v)}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Select product or manual" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__manual__">✏️ Enter manually</SelectItem>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                <span className="font-medium">{p.name}</span>
                                <span className="text-xs text-gray-400 ml-2">
                                  {formatCurrency(p.selling_price)}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {/* Name input — always shown for manual, shown as override for product */}
                      <Input
                        placeholder="Item name *"
                        value={item.product_name}
                        onChange={(e) => updateLineItem(index, 'product_name', e.target.value)}
                        disabled={readonly}
                        className="h-8 text-sm bg-white"
                      />

                      <Input
                        placeholder="Description (optional)"
                        value={item.description || ''}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        disabled={readonly}
                        className="h-7 text-xs bg-white text-gray-500"
                      />

                      {item.product_id && getStockBadge(item.product_id)}
                    </div>

                    {/* Price */}
                    <div className="col-span-1 md:col-span-2">
                      <Label className="text-xs text-gray-500 md:hidden">Price (₹)</Label>
                      {readonly ? (
                        <p className="text-sm text-right">{formatCurrency(item.price_per_unit)}</p>
                      ) : (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price_per_unit}
                          onChange={(e) =>
                            updateLineItem(index, 'price_per_unit', parseFloat(e.target.value) || 0)
                          }
                          className="h-8 text-sm text-right bg-white"
                        />
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1 md:col-span-1">
                      <Label className="text-xs text-gray-500 md:hidden">Qty</Label>
                      {readonly ? (
                        <p className="text-sm text-right">{item.quantity}</p>
                      ) : (
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className="h-8 text-sm text-right bg-white"
                        />
                      )}
                    </div>

                    {/* Unit */}
                    <div className="col-span-1 md:col-span-1">
                      <Label className="text-xs text-gray-500 md:hidden">Unit</Label>
                      {readonly ? (
                        <p className="text-sm text-center">{item.unit}</p>
                      ) : (
                        <Input
                          value={item.unit}
                          onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                          className="h-8 text-sm text-center bg-white"
                          placeholder="pcs"
                        />
                      )}
                    </div>

                    {/* Discount */}
                    <div className="col-span-1 md:col-span-2">
                      <Label className="text-xs text-gray-500 md:hidden">Discount (₹)</Label>
                      {readonly ? (
                        <p className="text-sm text-right">
                          {item.discount_amount > 0 ? formatCurrency(item.discount_amount) : '-'}
                        </p>
                      ) : (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.discount_amount}
                          onChange={(e) =>
                            updateLineItem(index, 'discount_amount', parseFloat(e.target.value) || 0)
                          }
                          className="h-8 text-sm text-right bg-white"
                          placeholder="0"
                        />
                      )}
                    </div>

                    {/* Line Total */}
                    <div className="col-span-1 md:col-span-1 flex items-center justify-end">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(lineTotal)}</p>
                    </div>

                    {/* Remove */}
                    {!readonly && (
                      <div className="col-span-1 md:col-span-1 flex items-start justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(index)}
                          className="h-8 w-8 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Subtotal footer */}
          {items.length > 0 && (
            <div className="flex justify-between text-sm pt-3 border-t">
              <span className="text-gray-500">{items.length} item{items.length > 1 ? 's' : ''}</span>
              <span className="font-semibold">
                Subtotal: {formatCurrency(items.reduce((s, item) => s + getLineTotal(item), 0))}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
