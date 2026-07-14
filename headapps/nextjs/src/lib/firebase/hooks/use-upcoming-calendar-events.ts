import { useCallback } from 'react';
import { useSwrWithAuth } from 'lib/swr';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink?: string;
  organizer?: {
    email: string;
    displayName?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
}

export interface CalendarEventsApiRequest {
  calendarId: string;
  timeMin: string;
  timeMax: string;
}

export interface CalendarEventsResponse {
  events: GoogleCalendarEvent[];
  error?: string;
}

interface UseUpcomingCalendarEventsReturn {
  events: GoogleCalendarEvent[];
  isLoadingEvents: boolean;
  error: Error | undefined;
  refreshEvents: () => Promise<void>;
}

export const useUpcomingCalendarEvents = (
  calendarId: string | null | undefined
): UseUpcomingCalendarEventsReturn => {
  const getCalendarEvents = async (): Promise<GoogleCalendarEvent[]> => {
    if (!calendarId) return [];

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);

    const requestBody: CalendarEventsApiRequest = {
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
    };

    const response = await fetch('/api/google/calendar/events/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let message = response.statusText || 'Failed to fetch calendar events.';
      try {
        const data: { error?: string; message?: string } = await response.json();
        message = data.error || data.message || message;
      } catch {
        // ignore JSON parse errors, fallback to statusText message
      }
      throw new Error(message);
    }

    const data: CalendarEventsResponse = await response.json();
    return data.events || [];
  };

  // Gate fetch purely by calendarId; auth/session is handled by useSwrWithAuth.
  const key = calendarId ? `/api/google/calendar/events/list/${calendarId}` : null;

  const { data, isLoading, error, mutate } = useSwrWithAuth<GoogleCalendarEvent[]>({
    key,
    fetcher: getCalendarEvents,
    swrConfig: {
      dedupingInterval: 15 * 60 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
    },
    waitForSession: true,
  });

  const refreshEvents = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    events: data ?? [],
    isLoadingEvents: isLoading,
    error,
    refreshEvents,
  };
};
