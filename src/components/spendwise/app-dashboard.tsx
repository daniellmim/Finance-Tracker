"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseTracker from "@/components/spendwise/expense-tracker";
import Planner from "@/components/spendwise/planner";
import { AppDataProvider } from "@/hooks/use-app-data";
import type { User } from "@/hooks/use-auth";

type AppDashboardProps = {
  user: User;
  onLogout: () => void;
};

export default function AppDashboard({ user, onLogout }: AppDashboardProps) {
  return (
    <AppDataProvider userId={user.id}>
      <div className="flex min-h-screen w-full flex-col">
        <Tabs defaultValue="expenses" className="flex flex-col flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <TabsList>
              <TabsTrigger value="expenses">Expense Tracker</TabsTrigger>
              <TabsTrigger value="planner">Planner</TabsTrigger>
            </TabsList>
          </header>
          <TabsContent value="expenses" className="flex-1">
            <ExpenseTracker onLogout={onLogout} />
          </TabsContent>
          <TabsContent value="planner" className="flex-1">
            <Planner onLogout={onLogout} />
          </TabsContent>
        </Tabs>
      </div>
    </AppDataProvider>
  );
}
