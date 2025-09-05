"use client";

import * as React from "react";
import { PlusCircle, Calendar as CalendarIcon, List, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/hooks/use-app-data";
import PlanForm from "./plan-form";
import PlanList from "./plan-list";
import WishCart from "./wish-cart";
import PlannerSettings from "./planner-settings";
import PlanCalendarView from "./plan-calendar-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type View = "list" | "calendar";

export default function Planner() {
  const { plans, categories, addCategory } = useAppData();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isWishCartOpen, setIsWishCartOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [view, setView] = React.useState<View>("list");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredPlans = React.useMemo(() => {
    return plans.filter(plan => 
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.recipient?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [plans, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search plans..."
              className="pl-10 w-full max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')}>
                <List className="h-5 w-5" />
            </Button>
            <Button variant={view === 'calendar' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('calendar')}>
                <CalendarIcon className="h-5 w-5" />
            </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <PlanForm
                categories={categories}
                onPlanAdded={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
           <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <PlannerSettings 
                    categories={categories} 
                    onCategoryAdd={addCategory} 
                />
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          {view === 'list' ? (
             <PlanList plans={filteredPlans} />
          ) : (
             <PlanCalendarView plans={filteredPlans} />
          )}
        </div>
        <div>
          <WishCart />
        </div>
      </div>
    </div>
  );
}
