// This file demonstrates the Expense Categories implemented in the project

import { EXPENSE_CATEGORIES } from "./types";
import { formatExpenseCategory } from "./lib/utils";

// The following 8 expense categories have been created:

const expenseCategoriesDemo = [
  { value: "salary_wages", label: "Salary/Wages", icon: "💰" },
  { value: "attendance", label: "Attendance/Bonus", icon: "👥" },
  { value: "subscriptions", label: "Subscriptions", icon: "📱" },
  { value: "office_supplies", label: "Office Supplies", icon: "📎" },
  { value: "office_maintenance", label: "Office Maintenance", icon: "🔧" },
  { value: "wifi_internet", label: "WiFi/Internet", icon: "📶" },
  { value: "utilities", label: "Utilities", icon: "💡" },
  { value: "rent", label: "Rent/Lease", icon: "🏢" },
];

// Usage:
// 1. In TypeScript types: types/index.ts defines EXPENSE_CATEGORIES constant
// 2. Helper functions in lib/utils.ts:
//    - getExpenseCategoryLabel(category) - Returns display name
//    - getExpenseCategoryIcon(category) - Returns emoji icon
//    - formatExpenseCategory(category) - Returns "💰 Salary/Wages"
//
// Example:
// formatExpenseCategory('salary_wages') returns "💰 Salary/Wages"
//
// The expense page now has a dropdown that displays all these categories
// with their emoji icons for easy selection when adding expenses.

export { expenseCategoriesDemo };