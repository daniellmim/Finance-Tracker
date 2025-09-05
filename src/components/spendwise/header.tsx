"use client";

import { Download, Landmark, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/utils";
import type { Expense, Category } from "@/lib/types";
import CategoryManager from "./category-manager";

type AppHeaderProps = {
  expenses: Expense[];
  categories: Category[];
  onCategoryAdd: (category: Category) => void;
};

export default function AppHeader({
  expenses,
  categories,
  onCategoryAdd,
}: AppHeaderProps) {
  const handleExport = () => {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    exportToCsv(`spendwise-export-${dateString}.csv`, expenses);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Landmark className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
          SpendWise
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <CategoryManager categories={categories} onCategoryAdd={onCategoryAdd}>
          <Button variant="outline" size="sm">
            <Tag />
            Manage Categories
          </Button>
        </CategoryManager>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download />
          Export CSV
        </Button>
      </div>
    </header>
  );
}
