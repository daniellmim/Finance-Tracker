"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  Expense,
  Category,
  Plan,
  Wish,
  BankAccount,
  SmsMessage,
  Liability,
} from "@/lib/types";
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
  completePlan: (planId: string, finalAmount: number) => void;
  wishes: Wish[];
  addWish: (name: string) => void;
  deleteWish: (id: string) => void;
  bankAccounts: BankAccount[];
  addBankAccount: (account: Omit<BankAccount, "id" | "updatedAt">) => void;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  smsMessages: SmsMessage[];
  addSmsMessage: (message: Omit<SmsMessage, "id" | "receivedAt">) => void;
  deleteSmsMessage: (id: string) => void;
  liabilities: Liability[];
  addLiability: (liability: Omit<Liability, "id">) => void;
  deleteLiability: (id: string) => void;
  importData: (data: string) => boolean;
  exportData: () => string;
}

const AppDataContext = React.createContext<AppDataContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  "Groceries", "Dining Out", "Transport", "Shopping", "Utilities", 
  "Entertainment", "Health", "Travel", "Gift", "Personal Care"
];

const createDefaultExpenses = (): Expense[] => {
    const today = new Date();
    return [
        { id: uuidv4(), description: 'Coffee with a friend', amount: 4.50, category: 'Dining Out', date: new Date(new Date().setDate(today.getDate() - 1)) },
        { id: uuidv4(), description: 'Weekly grocery shopping', amount: 75.20, category: 'Groceries', date: new Date(new Date().setDate(today.getDate() - 2)) },
        { id: uuidv4(), description: 'New headphones', amount: 129.99, category: 'Shopping', date: new Date(new Date().setDate(today.getDate() - 4)) },
    ];
};

const createDefaultPlans = (): Plan[] => {
    const today = new Date();
    return [
        { id: uuidv4(), type: 'buy', title: 'New Laptop', estimatedCost: 1200, startDate: new Date(new Date().setDate(today.getDate() + 10)), endDate: new Date(new Date().setDate(today.getDate() + 40)), category: 'Shopping', priority: 'high', status: 'active', purpose: 'Work' },
        { id: uuidv4(), type: 'activity', title: 'Weekend trip', estimatedCost: 300, startDate: new Date(new Date().setDate(today.getDate() + 20)), endDate: new Date(new Date().setDate(today.getDate() + 22)), category: 'Travel', priority: 'medium', status: 'active' },
    ];
};

const createDefaultWishes = (): Wish[] => {
    return [
        { id: uuidv4(), name: 'AirPods Pro', createdAt: new Date() },
    ];
};

const createDefaultBankAccounts = (): BankAccount[] => {
    const now = new Date();
    return [
        { id: uuidv4(), name: "Everyday Checking", institution: "Evergreen Bank", balance: 2450.75, updatedAt: now },
        { id: uuidv4(), name: "Travel Savings", institution: "Summit Credit Union", balance: 8200.00, updatedAt: now },
    ];
};

const createDefaultSmsMessages = (): SmsMessage[] => {
    const now = new Date();
    return [
        { id: uuidv4(), bankName: "Evergreen Bank", sender: "EVRGN", body: "Evergreen: Your acct balance is $2,450.75 after POS purchase.", receivedAt: now, detectedBalance: 2450.75 },
        { id: uuidv4(), bankName: "Summit Credit Union", sender: "SUMMIT", body: "Summit CU: Balance update $8,200.00. Reply STOP to opt out.", receivedAt: new Date(now.getTime() - 86400000), detectedBalance: 8200.00 },
    ];
};

const createDefaultLiabilities = (): Liability[] => {
    const today = new Date();
    return [
        { id: uuidv4(), name: "Car loan", amount: 350.00, dueDate: new Date(new Date().setDate(today.getDate() + 12)), notes: "Monthly payment" },
        { id: uuidv4(), name: "Credit card", amount: 120.50, dueDate: new Date(new Date().setDate(today.getDate() + 6)) },
    ];
};


export function AppDataProvider({ children, userId }: { children: React.ReactNode, userId: string }) {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(`${userId}-expenses`, []);
  const [categories, setCategories] = useLocalStorage<Category[]>(`${userId}-categories`, defaultCategories);
  const [plans, setPlans] = useLocalStorage<Plan[]>(`${userId}-plans`, []);
  const [wishes, setWishes] = useLocalStorage<Wish[]>(`${userId}-wishes`, []);
  const [bankAccounts, setBankAccounts] = useLocalStorage<BankAccount[]>(`${userId}-bank-accounts`, []);
  const [smsMessages, setSmsMessages] = useLocalStorage<SmsMessage[]>(`${userId}-sms-messages`, []);
  const [liabilities, setLiabilities] = useLocalStorage<Liability[]>(`${userId}-liabilities`, []);

  React.useEffect(() => {
    const expensesStored = window.localStorage.getItem(`${userId}-expenses`);
    if (!expensesStored || JSON.parse(expensesStored).length === 0) {
        setExpenses(createDefaultExpenses());
    }
    const plansStored = window.localStorage.getItem(`${userId}-plans`);
    if (!plansStored || JSON.parse(plansStored).length === 0) {
        setPlans(createDefaultPlans());
    }
    const wishesStored = window.localStorage.getItem(`${userId}-wishes`);
    if (!wishesStored || JSON.parse(wishesStored).length === 0) {
        setWishes(createDefaultWishes());
    }
    const accountsStored = window.localStorage.getItem(`${userId}-bank-accounts`);
    if (!accountsStored || JSON.parse(accountsStored).length === 0) {
        setBankAccounts(createDefaultBankAccounts());
    }
    const messagesStored = window.localStorage.getItem(`${userId}-sms-messages`);
    if (!messagesStored || JSON.parse(messagesStored).length === 0) {
        setSmsMessages(createDefaultSmsMessages());
    }
    const liabilitiesStored = window.localStorage.getItem(`${userId}-liabilities`);
    if (!liabilitiesStored || JSON.parse(liabilitiesStored).length === 0) {
        setLiabilities(createDefaultLiabilities());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, setExpenses, setPlans, setWishes, setBankAccounts, setSmsMessages, setLiabilities]);


  const addExpense = (expense: Omit<Expense, "id">) => {
    setExpenses((prev) => [{ ...expense, id: uuidv4(), date: new Date(expense.date) }, ...prev]);
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

  const completePlan = (planId: string, finalAmount: number) => {
    const planToComplete = plans.find(p => p.id === planId);
    if (!planToComplete) return;

    // Add to expenses
    const newExpense: Omit<Expense, 'id'> = {
      description: planToComplete.title,
      amount: finalAmount,
      category: planToComplete.category,
      date: new Date(), // use today's date for the expense
    };
    addExpense(newExpense);

    // Update plan status
    updatePlan({ ...planToComplete, status: 'completed', finalCost: finalAmount });
  };


  const addWish = (name: string) => {
    setWishes((prev) => [{ name, id: uuidv4(), createdAt: new Date() }, ...prev]);
  };
  const deleteWish = (id: string) => {
    setWishes((prev) => prev.filter(w => w.id !== id));
  };

  const addBankAccount = (account: Omit<BankAccount, "id" | "updatedAt">) => {
    setBankAccounts((prev) => [{ ...account, id: uuidv4(), updatedAt: new Date() }, ...prev]);
  };

  const updateBankAccount = (account: BankAccount) => {
    setBankAccounts((prev) => prev.map((item) => item.id === account.id ? account : item));
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter(account => account.id !== id));
  };

  const addSmsMessage = (message: Omit<SmsMessage, "id" | "receivedAt">) => {
    setSmsMessages((prev) => [{ ...message, id: uuidv4(), receivedAt: new Date() }, ...prev]);
  };

  const deleteSmsMessage = (id: string) => {
    setSmsMessages((prev) => prev.filter(message => message.id !== id));
  };

  const addLiability = (liability: Omit<Liability, "id">) => {
    setLiabilities((prev) => [{ ...liability, id: uuidv4() }, ...prev]);
  };

  const deleteLiability = (id: string) => {
    setLiabilities((prev) => prev.filter(item => item.id !== id));
  };
  
  const importData = (jsonString: string): boolean => {
    try {
        const data = JSON.parse(jsonString);
        if (data.expenses) setExpenses(data.expenses.map((e: any) => ({...e, date: new Date(e.date)})));
        if (data.categories) setCategories(data.categories);
        if (data.plans) setPlans(data.plans.map((p: any) => ({...p, startDate: new Date(p.startDate), endDate: new Date(p.endDate)})));
        if (data.wishes) setWishes(data.wishes.map((w: any) => ({...w, createdAt: new Date(w.createdAt)})));
        if (data.bankAccounts) setBankAccounts(data.bankAccounts.map((account: any) => ({...account, updatedAt: new Date(account.updatedAt)})));
        if (data.smsMessages) setSmsMessages(data.smsMessages.map((message: any) => ({...message, receivedAt: new Date(message.receivedAt)})));
        if (data.liabilities) setLiabilities(data.liabilities.map((item: any) => ({...item, dueDate: item.dueDate ? new Date(item.dueDate) : undefined})));
        return true;
    } catch (e) {
        console.error("Failed to import data", e);
        return false;
    }
  };

  const exportData = (): string => {
    return JSON.stringify({ expenses, categories, plans, wishes, bankAccounts, smsMessages, liabilities }, null, 2);
  };

  const value = {
    expenses, addExpense, deleteExpense,
    categories, addCategory,
    plans, addPlan, updatePlan, deletePlan, completePlan,
    wishes, addWish, deleteWish,
    bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
    smsMessages, addSmsMessage, deleteSmsMessage,
    liabilities, addLiability, deleteLiability,
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
