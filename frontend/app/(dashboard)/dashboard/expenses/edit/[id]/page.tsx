import { notFound } from "next/navigation";
import { ExpenseForm } from "../../expense-form";
import { EXPENSE_CATEGORIES } from "@/types";
import { getExpense } from "@/app/actions/expenses-firebase";

interface EditExpensePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params;
  
  const expense = await getExpense(id);
  
  if (!expense) {
    notFound();
  }
  
  const categoryData = EXPENSE_CATEGORIES.find(cat => cat.value === expense.category);
  
  if (!categoryData) {
    notFound();
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <ExpenseForm 
        category={expense.category} 
        categoryData={categoryData} 
        mode="edit" 
        expense={expense} 
      />
    </div>
  );
}
