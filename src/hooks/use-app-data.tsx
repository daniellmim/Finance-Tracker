"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { addDays, startOfMonth } from "date-fns";
import type { Expense, Category, Plan, Wish } from "@/lib/types";
import useLocalStorage from "./use-local-storage";

interface AppDataContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  categories: Category[];
  addCategory: (category: Category) => void;
  plans: Plan[];
  addPlan: (plan: Omit<Plan, "id">) => void;
  updatePlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;
  wishes: Wish[];
  addWish: (name: string) => void;
  deleteWish: (id: string) => void;
  importData: (data: string) => boolean;
  exportData: () => string;
}

const AppDataContext = React.createContext<AppDataContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  "Groceries", "Dining Out", "Transport", "Shopping", "Utilities", 
  "Entertainment", "Health", "Travel", "Gift", "Personal Care"
];

const today = new Date();
const defaultExpenses: Expense[] = [
    { id: uuidv4(), description: 'Coffee with a friend', amount: 4.50, category: 'Dining Out', date: addDays(today, -1) },
    { id: uuidv4(), description: 'Weekly grocery shopping', amount: 75.20, category: 'Groceries', date: addDays(today, -2) },
    { id: uuidv4(), description: 'New headphones', amount: 129.99, category: 'Shopping', date: addDays(today, -4) },
];
const defaultPlans: Plan[] = [
    { id: uuidv4(), type: 'buy', title: 'New Laptop', estimatedCost: 1200, startDate: addDays(today, 10), endDate: addDays(today, 40), category: 'Shopping', priority: 'high', status: 'active', purpose: 'Work' },
    { id: uuidv4(), type: 'activity', title: 'Weekend trip', estimatedCost: 300, startDate: addDays(today, 20), endDate: addDays(today, 22), category: 'Travel', priority: 'medium', status: 'active' },
];
const defaultWishes: Wish[] = [
    { id: uuidv4(), name: 'AirPods Pro', createdAt: new Date() },
];


export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", defaultExpenses);
  const [categories, setCategories] = useLocalStorage<Category[]>("categories", defaultCategories);
  const [plans, setPlans] = useLocalStorage<Plan[]>("plans", defaultPlans);
  const [wishes, setWishes] = useLocalStorage<Wish[]>("wishes", defaultWishes);

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

  const addPlan = (plan: Omit<Plan, "id">) => {
     setPlans((prev) => [{...plan, id: uuidv4() }, ...prev]);
  };
  const updatePlan = (updatedPlan: Plan) => {
    setPlans((prev) => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };
  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter(p => p.id !== id));
  };

  const addWish = (name: string) => {
    setWishes((prev) => [{ name, id: uuidv4(), createdAt: new Date() }, ...prev]);
  };
  const deleteWish = (id: string) => {
    setWishes((prev) => prev.filter(w => w.id !== id));
  };
  
  const importData = (jsonString: string): boolean => {
    try {
        const data = JSON.parse(jsonString);
        if (data.expenses) setExpenses(data.expenses);
        if (data.categories) setCategories(data.categories);
        if (data.plans) setPlans(data.plans);
        if (data.wishes) setWishes(data.wishes);
        return true;
    } catch (e) {
        console.error("Failed to import data", e);
        return false;
    }
  };

  const exportData = (): string => {
    return JSON.stringify({ expenses, categories, plans, wishes }, null, 2);
  };

  const value = {
    expenses, addExpense, deleteExpense,
    categories, addCategory,
    plans, addPlan, updatePlan, deletePlan,
    wishes, addWish, deleteWish,
    importData, exportData
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => {
  const context = React.useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within a AppDataProvider");
  }
  return context;
};
