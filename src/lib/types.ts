export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
};

export type Category = string;

export type Priority = "low" | "medium" | "high";
export type PlanStatus = "active" | "completed" | "canceled";

export type Plan = {
  id: string;
  type: "buy" | "activity" | "gift";
  title: string;
  estimatedCost: number;
  finalCost?: number;
  startDate: Date;
  endDate: Date;
  purpose?: string;
  recipient?: string;
  notes?: string;
  category: Category;
  priority: Priority;
  status: PlanStatus;
};

export type Wish = {
  id: string;
  name: string;
  createdAt: Date;
};
