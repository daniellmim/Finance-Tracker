"use client";

import * as React from "react";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/lib/types";
import { useAppData } from "@/hooks/use-app-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PlanForm from "./plan-form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type PlanListProps = {
  plans: Plan[];
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};
const statusColors = {
  active: "bg-blue-100 text-blue-800",
  completed: "bg-purple-100 text-purple-800",
  canceled: "bg-gray-100 text-gray-800",
};


export default function PlanList({ plans }: PlanListProps) {
  
  if (!plans || plans.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="text-center">
          <h3 className="text-2xl font-semibold tracking-tight">No Plans Found</h3>
          <p className="text-sm text-muted-foreground">
            Get started by adding a new plan or task.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
    const { deletePlan, updatePlan, categories } = useAppData();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    
    const handleStatusChange = (status: "completed" | "canceled") => {
        updatePlan({ ...plan, status });
    };

    return (
     <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg mb-2">{plan.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                </DialogTrigger>
                 <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("canceled")}>
                    <XCircle className="mr-2 h-4 w-4" /> Mark Canceled
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                     </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this plan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deletePlan(plan.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>
            {format(new Date(plan.startDate), "MMM d")} - {format(new Date(plan.endDate), "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
            <div className="text-2xl font-bold">${plan.estimatedCost.toFixed(2)}</div>
            {plan.purpose && <p className="text-sm text-muted-foreground">Purpose: {plan.purpose}</p>}
            {plan.recipient && <p className="text-sm text-muted-foreground">For: {plan.recipient}</p>}
            {plan.notes && <p className="text-sm text-muted-foreground line-clamp-2">Notes: {plan.notes}</p>}
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
            <Badge variant="secondary">{plan.category}</Badge>
            <Badge className={cn(priorityColors[plan.priority])}>{plan.priority}</Badge>
            <Badge className={cn(statusColors[plan.status])}>{plan.status}</Badge>
        </CardFooter>
      </Card>

      <DialogContent className="sm:max-w-[500px]">
        <PlanForm
            categories={categories}
            plan={plan}
            onPlanAdded={() => setIsFormOpen(false)}
        />
     </DialogContent>
    </Dialog>
    )
}
