"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/hooks/use-app-data";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/lib/types";

type PlannerSettingsProps = {
  categories: Category[];
  onCategoryAdd: (category: Category) => void;
};

export default function PlannerSettings({ categories, onCategoryAdd }: PlannerSettingsProps) {
  const [newCategory, setNewCategory] = React.useState("");
  const { exportData, importData } = useAppData();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onCategoryAdd(newCategory.trim());
      setNewCategory("");
    }
  };

  const handleExport = () => {
    const jsonString = exportData();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spendwise-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Data Exported", description: "Your data has been saved to a JSON file." });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importData(content)) {
            toast({ title: "Import Successful", description: "Your data has been restored." });
        } else {
            toast({ title: "Import Failed", description: "The selected file is not valid.", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Planner Settings</DialogTitle>
        <DialogDescription>
          Manage categories and data for your planner.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div>
            <Label className="text-base font-semibold">Manage Categories</Label>
            <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                    {cat}
                </Badge>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
                <Input
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="New category name"
                />
                 <Button onClick={handleAddCategory}>Add</Button>
            </div>
        </div>
        <div>
            <Label className="text-base font-semibold">Data Management</Label>
            <p className="text-sm text-muted-foreground mt-1">Backup or restore your application data.</p>
            <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" onClick={handleExport}>Export Data</Button>
                <Button variant="outline" onClick={handleImportClick}>Import Data</Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleFileChange}
                />
            </div>
        </div>
      </div>
      <DialogFooter>
        <p className="text-xs text-muted-foreground">Changes are saved automatically.</p>
      </DialogFooter>
    </>
  );
}
