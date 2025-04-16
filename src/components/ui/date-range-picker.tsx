
"use client";

import * as React from "react";
import { addDays, format, startOfDay, startOfWeek, startOfMonth, subYears } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DateRangePicker({
  className,
  value,
  onChange,
}: {
  className?: string;
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const handleQuickSelect = (option: string) => {
    const today = startOfDay(new Date());
    let from: Date;
    let to: Date = today;

    switch (option) {
      case "today":
        from = today;
        break;
      case "yesterday":
        from = addDays(today, -1);
        to = addDays(today, -1);
        break;
      case "thisWeek":
        from = startOfWeek(today);
        break;
      case "thisMonth":
        from = startOfMonth(today);
        break;
      case "allTime":
        from = subYears(today, 10);
        break;
      default:
        return;
    }

    onChange?.({ from, to });
    setIsPopoverOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Select onValueChange={handleQuickSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Quick select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="allTime">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
