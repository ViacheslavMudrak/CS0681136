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
  organizer?: {
    email: string;
    displayName?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
  status: string;
  htmlLink: string;
}

export interface GoogleCalendarEventListProps {
  calendarId?: string;
  calendarEmail?: string;
  startDate?: Date;
  timespan?: number; // in months
  className?: string;
}

export interface CalendarEventsResponse {
  events: GoogleCalendarEvent[];
  error?: string;
  /**
   * Signals the client that the user's Google session cannot self-recover
   * (e.g. expired access token with no refresh token). When true, the client
   * should redirect to /auth/signin?error=Callback to trigger the consent
   * retry flow and obtain a fresh refresh token.
   */
  requiresReauth?: boolean;
}

export interface CalendarEventsApiRequest {
  calendarId?: string;
  calendarEmail?: string;
  timeMin: string;
  timeMax: string;
}
