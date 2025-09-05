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

export default function Home() {
  const [categories, setCategories] = React.useState<Category[]>([
    "Groceries",
    "Dining Out",
    "Transport",
    "Shopping",
    "Utilities",
    "Entertainment",
    "Health",
    "Travel",
  ]);

  const [expenses, setExpenses] = React.useState<Expense[]>(() => {
    const today = new Date();
    return [
      { id: uuidv4(), description: 'Coffee with a friend', amount: 4.50, category: 'Dining Out', date: addDays(today, -1) },
      { id: uuidv4(), description: 'Weekly grocery shopping', amount: 75.20, category: 'Groceries', date: addDays(today, -2) },
      { id: uuidv4(), description: 'New headphones', amount: 129.99, category: 'Shopping', date: addDays(today, -4) },
      { id: uuidv4(), description: 'Bus fare', amount: 2.75, category: 'Transport', date: addDays(today, -4) },
      { id: uuidv4(), description: 'Movie tickets', amount: 25.00, category: 'Entertainment', date: addDays(today, -6) },
      { id: uuidv4(), description: 'Electricity bill', amount: 55.00, category: 'Utilities', date: startOfMonth(addDays(today, -35)) },
      { id: uuidv4(), description: 'Train to another city', amount: 85.50, category: 'Travel', date: startOfMonth(addDays(today, -40)) },
    ]
  });

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const addExpense = (expense: Omit<Expense, "id">) => {
    setExpenses((prev) => [{ ...expense, id: uuidv4() }, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };
  
  const addCategory = (category: Category) => {
    if (category && !categories.includes(category)) {
      setCategories((prev) => [...prev, category]);
    }
  };

  const filteredExpenses = React.useMemo(() => {
    return expenses
      .filter((expense) => {
        if (!dateRange?.from) return true;
        if (!dateRange?.to) return expense.date >= dateRange.from;
        return expense.date >= dateRange.from && expense.date <= dateRange.to;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expenses, dateRange]);

  return (
    <div className="flex min-h-screen w-full flex-col">
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
    </div>
  );
}
