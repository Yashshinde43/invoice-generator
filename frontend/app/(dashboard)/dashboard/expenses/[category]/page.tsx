import { notFound } from "next/navigation";
import { EXPENSE_CATEGORIES } from "@/types";
import { ExpenseForm } from "../expense-form";

interface ExpenseCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function ExpenseCategoryPage({ params }: ExpenseCategoryPageProps) {
  const { category } = await params;
  
  // Validate category exists
  const categoryData = EXPENSE_CATEGORIES.find(cat => cat.value === category);
  
  if (!categoryData) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ExpenseForm category={category as any} categoryData={categoryData} />
    </div>
  );
}