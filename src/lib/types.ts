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

export type BankAccount = {
  id: string;
  name: string;
  institution: string;
  balance: number;
  updatedAt: Date;
  lastMessageId?: string;
};

export type SmsMessage = {
  id: string;
  bankName: string;
  sender: string;
  body: string;
  receivedAt: Date;
  detectedBalance?: number;
};

export type Liability = {
  id: string;
  name: string;
  amount: number;
  dueDate?: Date;
  notes?: string;
};
