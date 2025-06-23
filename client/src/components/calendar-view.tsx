import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { Event } from "@shared/schema";

interface CalendarViewProps {
  onCreateEvent: () => void;
}

export default function CalendarView({ onCreateEvent }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  // Get the first day of the week (Sunday) for proper calendar layout
  const startDate = new Date(start);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // Get the last day of the week (Saturday) for proper calendar layout
  const endDate = new Date(end);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "event-primary";
      case "call":
        return "event-success";
      case "task":
        return "event-warning";
      default:
        return "event-accent";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Calendar Header */}
      <div className="bg-white border-b border-neutral-lighter px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-neutral-dark">Calendar</h2>
            <div className="flex items-center space-x-2">
              <Button onClick={goToToday} size="sm" className="bg-brand-primary text-white hover:bg-brand-secondary">
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium text-neutral-dark px-4">
                {format(currentDate, "MMMM yyyy")}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View options */}
            <div className="flex bg-neutral-lightest rounded-lg p-1">
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className={view === "month" ? "bg-white shadow-sm" : ""}
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className={view === "week" ? "bg-white shadow-sm" : ""}
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className={view === "day" ? "bg-white shadow-sm" : ""}
              >
                Day
              </Button>
            </div>
            
            {/* Create event button */}
            <Button 
              onClick={onCreateEvent}
              className="bg-brand-primary text-white hover:bg-brand-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white p-6">
        <div className="grid grid-cols-7 gap-px bg-neutral-lighter">
          {/* Calendar header days */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="bg-neutral-lightest p-3 text-sm font-medium text-neutral-medium text-center">
              {day}
            </div>
          ))}
          
          {/* Calendar day cells */}
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);
            
            return (
              <div
                key={`${format(day, 'yyyy-MM-dd')}-${index}`}
                className={cn(
                  "calendar-day",
                  !isCurrentMonth && "opacity-50"
                )}
              >
                <div className={cn(
                  "text-sm mb-1",
                  isDayToday ? "text-brand-primary font-bold" : 
                  isCurrentMonth ? "text-neutral-dark font-medium" : "text-neutral-light"
                )}>
                  {format(day, "d")}
                </div>
                
                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={cn("calendar-event", getEventColor(event.type))}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-neutral-medium px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
