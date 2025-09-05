"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Category, Plan } from "@/lib/types";
import { useAppData } from "@/hooks/use-app-data";
import { getCategorySuggestion } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  type: z.enum(["buy", "activity", "gift"]),
  estimatedCost: z.coerce.number().min(0, "Estimated cost must be non-negative."),
  dateRange: z.object({
    from: z.date({ required_error: "A start date is required." }),
    to: z.date({ required_error: "An end date is required." }),
  }),
  category: z.string().min(1, "Please select a category."),
  priority: z.enum(["low", "medium", "high"]),
  purpose: z.string().optional(),
  recipient: z.string().optional(),
  notes: z.string().optional(),
});

type PlanFormProps = {
  categories: Category[];
  plan?: Plan;
  onPlanAdded: () => void;
};

export default function PlanForm({ categories, plan, onPlanAdded }: PlanFormProps) {
  const { addPlan, updatePlan } = useAppData();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: plan ? {
      title: plan.title,
      type: plan.type,
      estimatedCost: plan.estimatedCost,
      dateRange: { from: new Date(plan.startDate), to: new Date(plan.endDate) },
      category: plan.category,
      priority: plan.priority,
      purpose: plan.purpose,
      recipient: plan.recipient,
      notes: plan.notes,
    } : {
      title: "",
      type: "buy",
      estimatedCost: 0,
      dateRange: { from: undefined, to: undefined },
      category: "",
      priority: "medium",
      purpose: "",
      recipient: "",
      notes: "",
    },
  });

  const planType = form.watch("type");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const planData = {
      ...values,
      startDate: values.dateRange.from,
      endDate: values.dateRange.to,
      status: plan?.status || 'active'
    };
    
    if (plan) {
        updatePlan({ ...plan, ...planData });
    } else {
        addPlan(planData);
    }
    
    onPlanAdded();
  }
  
  const handleSuggestCategory = async () => {
    const title = form.getValues("title");
    if (!title) {
      toast({
        title: "Suggestion Failed",
        description: "Please enter a title first.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const suggestion = await getCategorySuggestion(title);
      if (suggestion && categories.includes(suggestion)) {
        form.setValue("category", suggestion);
        toast({
          title: "Suggestion Applied!",
          description: `We've set the category to "${suggestion}".`,
        });
      } else if (suggestion) {
         toast({
          title: "New Category Suggested",
          description: `You can add "${suggestion}" in 'Planner Settings' if you like.`,
        });
      } else {
        toast({
          title: "Suggestion Failed",
          description: "Could not get a suggestion. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSuggesting(false);
    }
  };


  return (
    <>
      <DialogHeader>
        <DialogTitle>{plan ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
        <DialogDescription>
          Fill in the details for your new plan or task.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Summer vacation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="buy">Purchase</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="gift">Gift</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>

          {planType === "buy" && (
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Work, Hobby" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {planType === "gift" && (
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Alex" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Controller
            control={form.control}
            name="dateRange"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Time Range</FormLabel>
                 <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value.from && "text-muted-foreground"
                            )}
                          >
                            {field.value.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "LLL dd, y")} -{" "}
                                  {format(field.value.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(field.value.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value.from}
                          selected={{ from: field.value.from, to: field.value.to }}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                {fieldState.error?.from ? <FormMessage>{fieldState.error.from.message}</FormMessage> :
                 fieldState.error?.to ? <FormMessage>{fieldState.error.to.message}</FormMessage> : null}
              </FormItem>
            )}
            />
          
          <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleSuggestCategory}
                        disabled={isSuggesting}
                        aria-label="Suggest Category"
                      >
                        {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                      </Button>
                      </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any additional details..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {plan ? "Save Changes" : "Add Plan"}
          </Button>
        </form>
      </Form>
    </>
  );
}
