"use client";

import { Download, Landmark, Tag, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/utils";
import type { Expense, Category } from "@/lib/types";
import CategoryManager from "./category-manager";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import PlannerSettings from "./planner-settings";
import { useAppData } from "@/hooks/use-app-data";

type AppHeaderProps = {
  expenses?: Expense[];
  categories: Category[];
  onCategoryAdd: (category: Category) => void;
  onLogout: () => void;
  showPlannerSettings: boolean;
};

export default function AppHeader({
  expenses,
  categories,
  onCategoryAdd,
  onLogout,
  showPlannerSettings,
}: AppHeaderProps) {
  
  const handleExport = () => {
    if (!expenses) return;
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    exportToCsv(`spendwise-export-${dateString}.csv`, expenses);
  };

  return (
    <header className="sticky top-16 md:top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Landmark className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
          SpendWise
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <CategoryManager categories={categories} onCategoryAdd={onCategoryAdd}>
          <Button variant="outline" size="sm" className="relative">
            <span className="hidden sm:inline-flex items-center gap-2">
              <Tag />
              Manage Categories
            </span>
            <span className="sm:hidden">
              <Tag />
            </span>
          </Button>
        </CategoryManager>
        
        {showPlannerSettings && (
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <Settings />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <PlannerSettings 
                    categories={categories} 
                    onCategoryAdd={onCategoryAdd} 
                />
            </DialogContent>
          </Dialog>
        )}

        {expenses && (
          <>
            <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:inline-flex">
              <Download />
              Export CSV
            </Button>
            <Button variant="outline" size="icon" onClick={handleExport} className="sm:hidden">
              <Download />
            </Button>
          </>
        )}
        
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut />
          Logout
        </Button>
      </div>
    </header>
  );
}
