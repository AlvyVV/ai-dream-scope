'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserAiChat } from '@/types/user-ai-chat';
import { addDays, format, getDay, isSameMonth, startOfMonth, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

// Type definitions
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color: string;
  messages: UserAiChat[];
  messageCount: number;
  img_url?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

// Helper function to check if a date is today using standardized comparison
const isTodayDate = (date: Date) => {
  const standardDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

  const today = new Date();
  const standardToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

  return standardDate.getTime() === standardToday.getTime();
};

// Mobile Month View Component
export const MobileMonthView: React.FC<{
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
}> = ({ currentDate, events, onDayClick }) => {
  const t = useTranslations('MyChats');

  // Get the first day of the month
  const firstDayOfMonth = startOfMonth(currentDate);

  // Get the day of the week for the first day (0-6, 0 means Sunday)
  const firstDayOfMonthWeekday = getDay(firstDayOfMonth);

  // Calculate the first day to display in the calendar grid (may be from the previous month)
  const startDate = subDays(firstDayOfMonth, firstDayOfMonthWeekday);

  // Generate all dates for the calendar grid (6 rows, 7 columns)
  const calendarDays: CalendarDay[] = [];
  const today = new Date();

  for (let i = 0; i < 42; i++) {
    const date = addDays(startDate, i);
    const dayEvents = events.filter(event => {
      // Standardize both dates for comparison
      const standardDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

      const eventDate = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate(), 0, 0, 0, 0);

      // Compare using timestamps for more reliable comparison
      return eventDate.getTime() === standardDate.getTime();
    });

    calendarDays.push({
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isTodayDate(date),
      events: dayEvents,
    });
  }

  // Weekday labels (Sunday to Saturday)
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-border bg-card">
      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b">
        <h2 className="text-xl font-medium">{format(currentDate, 'MMMM yyyy')}</h2>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/50">
        {weekdayLabels.map((day, i) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 auto-rows-fr bg-card">
        {calendarDays.map((day, i) => (
          <div
            key={i}
            className={`
              aspect-square border-b border-r cursor-pointer transition-colors
              ${!day.isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''}
              ${day.isToday ? 'bg-primary/5' : ''}
              hover:bg-muted/30
            `}
            onClick={() => onDayClick(day.date)}
          >
            {/* Cell content with centered layout */}
            <div className="h-full w-full flex flex-col items-center justify-center px-1 py-3">
              {/* Date number */}
              <div
                className={`
                text-sm font-medium w-8 h-8 flex items-center justify-center mb-2 transition-colors
                ${day.isToday ? 'bg-primary text-primary-foreground rounded-full' : ''}
              `}
              >
                {format(day.date, 'd')}
              </div>

              {/* Event indicator - changed from badge to dot */}
              {day.events.length > 0 ? <div className="w-2 h-2 rounded-full bg-primary">&nbsp;</div> : <div className="h-2">{/* Empty placeholder to maintain consistent height */}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mobile Date Tabs Component
export const DateTabs: React.FC<{
  currentDate: Date;
  onDateChange: (date: Date) => void;
  hasEvents: (date: Date) => boolean;
}> = ({ currentDate, onDateChange, hasEvents }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dates, setDates] = useState<Date[]>([]);

  // Generate dates for 14 days before and after the current date
  useEffect(() => {
    const newDates = [];
    for (let i = -14; i <= 14; i++) {
      newDates.push(addDays(currentDate, i));
    }
    setDates(newDates);
  }, [currentDate]);

  // Scroll to center when current date changes
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
          // Find the position of the middle element
          const middleElement = scrollElement.children[14] as HTMLElement;
          if (middleElement) {
            // Calculate scroll position to center the middle element
            const scrollLeft = middleElement.offsetLeft - scrollElement.clientWidth / 2 + middleElement.clientWidth / 2;
            scrollElement.scrollLeft = scrollLeft;
          }
        }
      }, 100);
    }
  }, [dates]);

  return (
    <div ref={scrollRef} className="flex overflow-x-auto py-3 px-2 gap-2 hide-scrollbar mb-2 border-b" style={{ scrollBehavior: 'smooth' }}>
      {dates.map((date, index) => {
        // Standardize both dates for comparison
        const standardDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

        const standardCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);

        // Compare using timestamps for more reliable comparison
        const isActive = standardDate.getTime() === standardCurrentDate.getTime();
        const hasEventOnDay = hasEvents(date);

        return (
          <div
            key={index}
            className={`
              flex-shrink-0 flex flex-col items-center w-14 h-18 rounded-lg cursor-pointer transition-all
              ${isActive ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted/50'}
              ${isActive ? 'shadow-md' : ''}
            `}
            onClick={() => onDateChange(date)}
          >
            <div className="text-xs font-medium mt-2">{format(date, 'EEE')}</div>
            <div
              className={`
              text-lg font-bold flex items-center justify-center w-9 h-9 rounded-full mt-1
              ${isTodayDate(date) && !isActive ? 'border border-primary text-primary' : ''}
            `}
            >
              {format(date, 'd')}
            </div>
            {hasEventOnDay && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isActive ? 'bg-primary-foreground' : 'bg-primary'}`} />}
          </div>
        );
      })}
    </div>
  );
};

// Mobile Day Event List Component
export const MobileDayList: React.FC<{
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}> = ({ currentDate, events, onEventClick }) => {
  const t = useTranslations('MyChats');

  // Filter events for the current day
  const dayEvents = events.filter(event => {
    // Standardize both dates for comparison
    const standardDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);

    const eventDate = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate(), 0, 0, 0, 0);

    // Compare using timestamps for more reliable comparison
    return eventDate.getTime() === standardDate.getTime();
  });

  return (
    <div className="pt-2">
      {dayEvents.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <MessageCircle className="mx-auto h-14 w-14 mb-4 opacity-20" />
          <p>No chats on this day</p>
          <p className="text-sm mt-1">Start a new conversation or select another date</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayEvents.map(event => (
            <Card key={event.id} className="cursor-pointer hover:bg-muted/30 transition-colors overflow-hidden border border-border" onClick={() => onEventClick(event)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h3 className="font-medium line-clamp-1 text-base">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{format(event.date, 'PPP')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.img_url && <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                    <Badge variant="outline" className="shrink-0">
                      {event.messageCount} {event.messageCount === 1 ? 'message' : 'messages'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Mobile Top Controls Component
export const MobileTopControls: React.FC<{
  currentDate: Date;
  onNewChatClick: () => void;
  onTodayClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  isCalendarView: boolean;
  onToggleView: () => void;
}> = ({ currentDate, onNewChatClick, onTodayClick, onPrevClick, onNextClick, isCalendarView, onToggleView }) => {
  const t = useTranslations('MyChats');

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex items-center justify-between">
        <Button onClick={onNewChatClick} variant="default" size="sm" className="font-medium">
          New Chat
        </Button>

        <div className="flex items-center gap-2">
          <Button onClick={onToggleView} variant="outline" size="sm">
            {isCalendarView ? 'List View' : 'Calendar View'}
          </Button>

          <Button onClick={onTodayClick} variant="outline" size="sm">
            Today
          </Button>
        </div>
      </div>

      {isCalendarView && (
        <div className="flex items-center justify-between bg-card rounded-md px-2 py-1">
          <Button onClick={onPrevClick} variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-base font-medium">{format(currentDate, 'MMMM yyyy')}</div>
          <Button onClick={onNextClick} variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Mobile touch gesture support CSS
export const MobileStyles = () => (
  <style jsx global>{`
    .hide-scrollbar {
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  `}</style>
);
