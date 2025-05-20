'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserAiChat } from '@/types/user-ai-chat';
import { addDays, addMonths, addYears, endOfMonth, format, getDay, getMonth, getYear, isSameDay, isSameMonth, startOfDay, startOfMonth, subDays, subMonths, subYears } from 'date-fns';
import { ChevronLeft, ChevronRight, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DateTabs, MobileDayList, MobileMonthView, MobileStyles, MobileTopControls } from './mobile-components';

interface ChatMessage {
  role: string;
  content: string | any;
  parts?: any[];
  id?: string;
}

interface ChatJson {
  messages: ChatMessage[];
  timestamp: string;
  count: number;
}

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

interface TopControlsProps {
  currentView: 'day' | 'month' | 'year';
  currentDate: Date;
  onNewChatClick: () => void;
  onTodayClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  onViewChange: (view: 'day' | 'month' | 'year') => void;
}

const TopControls: React.FC<TopControlsProps> = ({ currentView, currentDate, onNewChatClick, onTodayClick, onPrevClick, onNextClick, onViewChange }) => {
  const t = useTranslations('MyChats');

  // Format date based on current view
  const formattedDate = () => {
    switch (currentView) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return format(currentDate, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
      <div className="flex items-center space-x-3">
        <Button onClick={onNewChatClick} variant="default" className="font-medium">
          New Chat
        </Button>
        <Button onClick={onTodayClick} variant="outline" size="sm">
          Today
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button onClick={onPrevClick} variant="outline" size="icon" className="h-9 w-9">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-lg font-medium w-44 text-center">{formattedDate()}</div>
        <Button onClick={onNextClick} variant="outline" size="icon" className="h-9 w-9">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex shadow-sm border border-border rounded-lg overflow-hidden">
        <Button variant={currentView === 'day' ? 'default' : 'ghost'} size="sm" className="rounded-none border-0" onClick={() => onViewChange('day')}>
          Day
        </Button>
        <Button variant={currentView === 'month' ? 'default' : 'ghost'} size="sm" className="rounded-none border-0" onClick={() => onViewChange('month')}>
          Month
        </Button>
        <Button variant={currentView === 'year' ? 'default' : 'ghost'} size="sm" className="rounded-none border-0" onClick={() => onViewChange('year')}>
          Year
        </Button>
      </div>
    </div>
  );
};

interface ChatDetailPopupProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

const ChatDetailPopup: React.FC<ChatDetailPopupProps> = ({ event, onClose }) => {
  const t = useTranslations('MyChats');

  if (!event) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{format(event.date, 'PPP')}</p>
        </DialogHeader>

        {/* Image Section - Show if available */}
        {event.img_url && (
          <div className="relative w-full aspect-square rounded-md overflow-hidden border mb-4">
            <Image src={event.img_url} alt="Dream image" fill className="object-cover" sizes="(max-width: 600px) 100vw, 600px" />
          </div>
        )}

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-4">
            {event.messages.map(message => {
              let messageContent = message.content?.content;
              let messageArray: ChatMessage[] = [];
              let parsedJsonData: ChatJson | null = null;

              // Try to parse JSON formatted messages
              try {
                if (messageContent && typeof messageContent === 'string' && messageContent.trim().startsWith('{')) {
                  const jsonData = JSON.parse(messageContent) as ChatJson;
                  if (jsonData.messages && Array.isArray(jsonData.messages)) {
                    messageArray = jsonData.messages;
                    parsedJsonData = jsonData;
                  }
                }
              } catch (error) {
                console.error('Failed to parse message JSON', error);
              }

              // If successfully parsed as JSON array, render each message in the array
              if (messageArray.length > 0) {
                return (
                  <div key={message.uuid} className="space-y-3">
                    {messageArray.map((msg: ChatMessage, index: number) => (
                      <div key={msg.id || index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`rounded-lg px-4 py-3 max-w-[80%] shadow-sm
                          ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-secondary text-secondary-foreground rounded-tl-none'}`}
                        >
                          <div className="text-sm">{typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // If not JSON format, use original rendering method
              return (
                <div key={message.uuid} className={`flex ${message.assistant_id ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`rounded-lg px-4 py-3 max-w-[80%] shadow-sm
                    ${message.assistant_id ? 'bg-secondary text-secondary-foreground rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'}`}
                  >
                    <div className="text-sm">{typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, onDayClick, onEventClick }) => {
  const t = useTranslations('MyChats');

  // Get the first and last day of the month
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  // Get the day of the week for the first day (0-6, 0 means Sunday)
  const firstDayOfMonthWeekday = getDay(firstDayOfMonth);

  // Calculate the first day to display in the calendar grid (may be from the previous month)
  const startDate = subDays(firstDayOfMonth, firstDayOfMonthWeekday);

  // Generate all dates for the calendar grid (6 rows, 7 columns)
  const calendarDays: CalendarDay[] = [];
  const today = startOfDay(new Date());

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
      isToday: isSameDay(date, today),
      events: dayEvents,
    });
  }

  // Weekday labels (Sunday to Saturday)
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/50">
        {weekdayLabels.map((day, i) => (
          <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day, i) => (
          <div
            key={i}
            className={`
              min-h-[120px] p-3 border-b border-r cursor-pointer transition-colors
              ${!day.isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
              ${day.isToday ? 'bg-primary/5' : ''}
              hover:bg-muted/30
            `}
            onClick={() => onDayClick(day.date)}
          >
            <div className="flex justify-between items-start">
              <span
                className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center
                  ${day.isToday ? 'bg-primary text-primary-foreground rounded-full' : ''}
                `}
              >
                {format(day.date, 'd')}
              </span>
              {day.events.length > 0 && (
                <div className="flex items-center gap-1">
                  {day.events.some(event => event.img_url) && <ImageIcon className="h-3 w-3 text-muted-foreground" />}
                  <Badge variant="outline" className="ml-1">
                    {day.events.length}
                  </Badge>
                </div>
              )}
            </div>

            {/* Events in each cell */}
            <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[80px]">
              {day.events.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="text-xs px-3 py-1.5 rounded-md bg-primary/10 truncate cursor-pointer hover:bg-primary/20 transition-colors flex items-center justify-between"
                  onClick={e => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  <span className="truncate">{event.title}</span>
                  {event.img_url && <ImageIcon className="h-3 w-3 ml-1 shrink-0 text-muted-foreground" />}
                </div>
              ))}
              {day.events.length > 3 && <div className="text-xs text-muted-foreground px-1">+{day.events.length - 3} more</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const DayView: React.FC<DayViewProps> = ({ currentDate, events, onEventClick }) => {
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
    <div className="bg-card rounded-lg shadow-sm border border-border p-5">
      <h2 className="text-2xl font-medium mb-6">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>

      {dayEvents.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <MessageCircle className="mx-auto h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg">No chats on this day</p>
          <p className="text-sm mt-2">Start a new conversation or select another date</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayEvents.map(event => (
            <Card key={event.id} className="cursor-pointer hover:bg-muted/30 transition-colors border border-border overflow-hidden" onClick={() => onEventClick(event)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h3 className="font-medium text-base">{event.title}</h3>
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

interface YearViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onMonthClick: (monthDate: Date) => void;
}

const YearView: React.FC<YearViewProps> = ({ currentDate, events, onMonthClick }) => {
  const t = useTranslations('MyChats');
  const year = getYear(currentDate);
  const today = startOfDay(new Date());

  // Generate all 12 months of the year
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(year, i, 1);

    // Filter events for this month
    const monthEvents = events.filter(event => event.date.getFullYear() === year && event.date.getMonth() === i);

    return { monthDate, events: monthEvents };
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {months.map(({ monthDate, events }) => {
        const isCurrentMonth = isSameMonth(monthDate, today);

        return (
          <div
            key={getMonth(monthDate)}
            className={`
              bg-card p-5 rounded-lg shadow-sm cursor-pointer transition-all
              border border-border
              ${isCurrentMonth ? 'ring-2 ring-primary' : ''}
              hover:bg-muted/30 hover:scale-[1.02]
            `}
            onClick={() => onMonthClick(monthDate)}
          >
            <h3 className="font-medium mb-2 text-lg">{format(monthDate, 'MMMM')}</h3>
            <div className="text-sm text-muted-foreground">
              {events.length > 0 ? (
                <span>
                  {events.length} {events.length === 1 ? 'chat' : 'chats'}
                </span>
              ) : (
                <span>No chats</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function MyChatsPage() {
  const t = useTranslations('MyChats');
  const [currentView, setCurrentView] = useState<'day' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedChatThread, setSelectedChatThread] = useState<CalendarEvent | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if device is mobile
  const isMobile = useIsMobile();

  // Mobile-specific states
  const [isMobileCalendarView, setIsMobileCalendarView] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get all user chat threads
        const response = await fetch('/api/chat/threads');
        if (!response.ok) {
          throw new Error('Failed to fetch chat data');
        }

        const threadsWithMessages = await response.json();

        // Determine current year for date adjustment
        const currentYear = new Date().getFullYear();
        const events: CalendarEvent[] = [];

        // Process each thread and its messages
        for (const thread of threadsWithMessages) {
          const messages = thread.messages;

          // If there are messages, create a calendar event
          if (messages && messages.length > 0) {
            // Use first user message as chat title
            const firstUserMessage = messages.find((m: UserAiChat) => !m.assistant_id);
            let title = 'Dream Analysis Conversation';

            // Add type checking to ensure content.content exists and is a string
            if (firstUserMessage?.content?.content && typeof firstUserMessage.content.content === 'string') {
              title = firstUserMessage.content.content.substring(0, 30) + (firstUserMessage.content.content.length > 30 ? '...' : '');
            }

            // Try to extract real message count from message content
            let messageCount = messages.length;
            try {
              if (messages[0]?.content?.content && typeof messages[0].content.content === 'string' && messages[0].content.content.trim().startsWith('{')) {
                const jsonData = JSON.parse(messages[0].content.content) as ChatJson;
                if (jsonData.count !== undefined && typeof jsonData.count === 'number') {
                  messageCount = jsonData.count;
                }

                // Use first user message from JSON as title
                if (jsonData.messages && Array.isArray(jsonData.messages) && jsonData.messages.length > 0) {
                  const firstJsonMessage = jsonData.messages.find(msg => msg.role === 'user');
                  if (firstJsonMessage && firstJsonMessage.content && typeof firstJsonMessage.content === 'string') {
                    const content = firstJsonMessage.content.trim();
                    const titleMaxLength = 30; // Max title length
                    title = content.length > titleMaxLength ? `${content.substring(0, titleMaxLength)}...` : content;
                  }
                }
              }
            } catch (error) {
              // Silently handle JSON parse errors
            }

            // Parse date, ensure it's a valid Date object
            let eventDate;
            try {
              const dateString = thread.created_at || messages[0].created_at || new Date().toISOString();

              // Parse original date
              const parsedDate = new Date(dateString);

              // Create new date object with consistent format - YYYY-MM-DD only
              // This ensures events display in the current calendar and date comparisons work correctly
              // Set time to midnight (00:00:00) to ensure consistent date comparisons
              const year = currentYear;
              const month = parsedDate.getMonth();
              const day = parsedDate.getDate();

              // Create date with time set to midnight (00:00:00)
              eventDate = new Date(year, month, day, 0, 0, 0, 0);
            } catch (e) {
              // Default to today at midnight if date parsing fails
              const today = new Date();
              eventDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
            }

            // Check if any message has an image URL
            // Look for thread-level image_url first, then check if it's available in any of the messages
            const img_url = thread.image_url || null;

            events.push({
              id: thread.id,
              title: title,
              date: eventDate,
              color: 'blue', // Can set different colors based on message content or type
              messages: messages,
              messageCount: messageCount,
              img_url: img_url,
            });
          }
        }

        setCalendarEvents(events);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  // Handle view change
  const handleViewChange = (view: 'day' | 'month' | 'year') => {
    setIsViewTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsViewTransitioning(false);
    }, 150);
  };

  // Navigate to previous period (day/month/year)
  const goToPreviousPeriod = () => {
    switch (currentView) {
      case 'day':
        setCurrentDate(prev => subDays(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
      case 'year':
        setCurrentDate(prev => subYears(prev, 1));
        break;
    }
  };

  // Navigate to next period (day/month/year)
  const goToNextPeriod = () => {
    switch (currentView) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
      case 'year':
        setCurrentDate(prev => addYears(prev, 1));
        break;
    }
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedChatThread(event);
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setCurrentView('day');
  };

  // Handle month click
  const handleMonthClick = (date: Date) => {
    setCurrentDate(date);
    setCurrentView('month');
  };

  // Start new chat
  const startNewChat = () => {
    router.push('/dream-interpreter');
  };

  // Check if a date has events
  const hasEventsOnDate = (date: Date) => {
    // Standardize the input date by setting time to midnight
    const standardDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

    // Check if any event dates match this standardized date
    return calendarEvents.some(event => {
      // Ensure event date is also standardized
      const eventDate = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate(), 0, 0, 0, 0);

      // Compare year, month and day directly for more reliable comparison
      return eventDate.getTime() === standardDate.getTime();
    });
  };

  // Toggle mobile view
  const toggleMobileView = () => {
    setIsMobileCalendarView(!isMobileCalendarView);
  };

  // Handle mobile day click
  const handleMobileDayClick = (date: Date) => {
    setSelectedDay(date);
    setCurrentDate(date);
    setIsMobileCalendarView(false);
  };

  // Handle mobile date tab click
  const handleMobileDateTabClick = (date: Date) => {
    setCurrentDate(date);
  };

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto py-12 text-center">
        <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="mt-4 text-xl font-semibold">Login Required</h2>
        <p className="text-muted-foreground mt-2">Please sign in to view your chat history</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Chat History</h1>
        <p className="text-muted-foreground mt-1">View and manage your previous conversations</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : calendarEvents.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border shadow-sm p-8">
          <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground opacity-20" />
          <h2 className="mt-4 text-xl font-semibold">No Chats Yet</h2>
          <p className="text-muted-foreground mt-2 mb-6">Start your first dream analysis conversation</p>
          <Button onClick={startNewChat} className="px-6">
            New Chat
          </Button>
        </div>
      ) : (
        <>
          {/* Render controls based on device type */}
          {isMobile ? (
            <MobileTopControls
              currentDate={currentDate}
              onNewChatClick={startNewChat}
              onTodayClick={goToToday}
              onPrevClick={goToPreviousPeriod}
              onNextClick={goToNextPeriod}
              isCalendarView={isMobileCalendarView}
              onToggleView={toggleMobileView}
            />
          ) : (
            <TopControls
              currentView={currentView}
              currentDate={currentDate}
              onNewChatClick={startNewChat}
              onTodayClick={goToToday}
              onPrevClick={goToPreviousPeriod}
              onNextClick={goToNextPeriod}
              onViewChange={handleViewChange}
            />
          )}

          <div className={`transition-opacity duration-150 ${isViewTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* Mobile device view */}
            {isMobile ? (
              <>
                <MobileStyles />

                {isMobileCalendarView ? (
                  <MobileMonthView currentDate={currentDate} events={calendarEvents} onDayClick={handleMobileDayClick} />
                ) : (
                  <>
                    <DateTabs currentDate={currentDate} onDateChange={handleMobileDateTabClick} hasEvents={hasEventsOnDate} />
                    <MobileDayList currentDate={currentDate} events={calendarEvents} onEventClick={handleEventClick} />
                  </>
                )}
              </>
            ) : (
              /* Desktop device view */
              <>
                {currentView === 'day' && <DayView currentDate={currentDate} events={calendarEvents} onEventClick={handleEventClick} />}

                {currentView === 'month' && <MonthView currentDate={currentDate} events={calendarEvents} onDayClick={handleDayClick} onEventClick={handleEventClick} />}

                {currentView === 'year' && <YearView currentDate={currentDate} events={calendarEvents} onMonthClick={handleMonthClick} />}
              </>
            )}
          </div>

          <ChatDetailPopup event={selectedChatThread} onClose={() => setSelectedChatThread(null)} />
        </>
      )}
    </div>
  );
}
