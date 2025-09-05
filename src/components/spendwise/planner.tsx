"use client";

import * as React from "react";
import { PlusCircle, Calendar as CalendarIcon, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/hooks/use-app-data";
import PlanForm from "./plan-form";
import PlanList from "./plan-list";
import WishCart from "./wish-cart";
import PlanCalendarView from "./plan-calendar-view";
import AppHeader from "./header";

type View = "list" | "calendar";

type PlannerProps = {
  onLogout: () => void;
};

export default function Planner({ onLogout }: PlannerProps) {
  const { plans, categories, addCategory } = useAppData();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [view, setView] = React.useState<View>("list");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredPlans = React.useMemo(() => {
    if (!plans) return [];
    return plans.filter(plan => 
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.purpose && plan.purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (plan.recipient && plan.recipient.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [plans, searchTerm]);

  return (
    <>
      <AppHeader 
        categories={categories}
        onCategoryAdd={addCategory}
        onLogout={onLogout}
        showPlannerSettings
      />
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
    </>
  );
}
