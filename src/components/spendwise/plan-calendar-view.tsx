"use client";

import * as React from "react";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import type { Plan } from "@/lib/types";
import { Badge } from "../ui/badge";

type PlanCalendarViewProps = {
  plans: Plan[];
};

const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export default function PlanCalendarView({ plans }: PlanCalendarViewProps) {
  const [month, setMonth] = React.useState(new Date());

  const planEvents = React.useMemo(() => {
    if (!plans) return [];
    const events: { date: Date; plan: Plan }[] = [];
    plans.forEach((plan) => {
      const interval = eachDayOfInterval({
        start: new Date(plan.startDate),
        end: new Date(plan.endDate),
      });
      interval.forEach((date) => {
        events.push({ date, plan });
      });
    });
    return events;
  }, [plans]);

  const DayWithEvents = ({ date, ...props }: { date: Date; displayMonth?: Date }) => {
    const dayEvents = planEvents.filter((event) => isSameDay(event.date, date));
    return (
      <div className="relative h-full w-full">
        {props.children}
        {dayEvents.length > 0 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {dayEvents.slice(0, 3).map(({ plan }) => (
              <div
                key={plan.id}
                className={`h-1.5 w-1.5 rounded-full ${priorityColors[plan.priority]}`}
                title={plan.title}
              ></div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const plansInMonth = (plans || []).filter(p => {
    const planStart = new Date(p.startDate);
    const planEnd = new Date(p.endDate);
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return (planStart <= monthEnd && planEnd >= monthStart);
  }).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
            <CardContent className="p-2">
                <Calendar
                    mode="single"
                    month={month}
                    onMonthChange={setMonth}
                    className="p-0"
                    classNames={{
                        month: "space-y-4 p-4",
                        day: "h-12 w-12",
                        head_cell: "w-12",
                    }}
                    components={{
                        Day: DayWithEvents,
                    }}
                />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Plans in {format(month, "MMMM yyyy")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                {plansInMonth.length > 0 ? (
                    plansInMonth.map(plan => (
                        <div key={plan.id} className="p-3 rounded-md border">
                            <h4 className="font-semibold text-sm">{plan.title}</h4>
                            <p className="text-xs text-muted-foreground">
                                {format(new Date(plan.startDate), 'MMM d')} - {format(new Date(plan.endDate), 'MMM d')}
                            </p>
                            <div className="mt-2">
                                <Badge variant="secondary">{plan.category}</Badge>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No plans for this month.
                    </p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
