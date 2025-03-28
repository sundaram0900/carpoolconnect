
import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({ 
  value, 
  onChange, 
  className, 
  disabled = false 
}: TimePickerProps) {
  // Generate time slots from 00:00 to 23:30 in 30-minute intervals
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  }, []);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <Clock className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        <div className="max-h-80 overflow-y-auto">
          {timeSlots.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
