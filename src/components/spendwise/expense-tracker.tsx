"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { addDays, startOfMonth } from "date-fns";
import { v4 as uuidv4 } from "uuid";

import type { Expense, Category } from "@/lib/types";
import AppHeader from "@/components/spendwise/header";
import ExpenseForm from "@/components/spendwise/expense-form";
import SpendingOverview from "@/components/spendwise/spending-overview";
import ExpenseList from "@/components/spendwise/expense-list";
import { useAppData } from "@/hooks/use-app-data";

export default function ExpenseTracker() {
  const { 
    expenses, 
    addExpense,
    deleteExpense,
    categories, 
    addCategory
  } = useAppData();

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const filteredExpenses = React.useMemo(() => {
    return expenses
      .filter((expense) => {
        if (!dateRange?.from) return true;
        const expenseDate = new Date(expense.date);
        if (!dateRange?.to) return expenseDate >= dateRange.from;
        return expenseDate >= dateRange.from && expenseDate <= dateRange.to;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, dateRange]);

  return (
    <>
      <AppHeader
        expenses={filteredExpenses}
        categories={categories}
        onCategoryAdd={addCategory}
      />
      <main className="container mx-auto grid flex-1 auto-rows-max gap-8 px-4 py-8 md:grid-cols-3 lg:px-8">
        <div className="grid auto-rows-max items-start gap-8 md:col-span-2">
          <ExpenseForm categories={categories} onAddExpense={addExpense} />
          <ExpenseList expenses={filteredExpenses} onDeleteExpense={deleteExpense} />
        </div>
        <div className="grid auto-rows-max items-start gap-8">
           <SpendingOverview expenses={filteredExpenses} dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </main>
    </>
  );
}
