"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type CategoryManagerProps = {
  children: React.ReactNode;
  categories: Category[];
  onCategoryAdd: (category: Category) => void;
};

export default function CategoryManager({
  children,
  categories,
  onCategoryAdd,
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = React.useState("");

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onCategoryAdd(newCategory.trim());
      setNewCategory("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add or view your expense categories.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-category" className="text-right">
              New
            </Label>
            <Input
              id="new-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              className="col-span-3"
              placeholder="e.g., 'Gifts'"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddCategory}>Add Category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
