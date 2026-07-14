import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Alert,
  CircularProgress,
  Chip,
  Link,
  Divider,
} from '@mui/material';
import { CalendarToday, AccessTime, LocationOn, Person } from '@mui/icons-material';
import classNames from 'classnames';

import {
  GoogleCalendarEventListProps,
  GoogleCalendarEvent,
  CalendarEventsResponse,
  CalendarEventsApiRequest,
} from './GoogleCalendarEventList.types';

const GoogleCalendarEventList: React.FC<GoogleCalendarEventListProps> = ({
  calendarId,
  calendarEmail,
  startDate = new Date(),
  timespan = 3,
  className,
}) => {
  const { data: session } = useSession();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = useCallback((dateTime?: string, date?: string) => {
    if (!dateTime && !date) return '';

    const targetDate = new Date(dateTime || date || '');

    if (date && !dateTime) {
      // All-day event
      return targetDate.toLocaleDateString();
    }

    return targetDate.toLocaleString();
  }, []);

  const getEventDuration = useCallback(
    (start: GoogleCalendarEvent['start'], end: GoogleCalendarEvent['end']) => {
      if (!start.dateTime || !end.dateTime) return '';

      const startTime = new Date(start.dateTime);
      const endTime = new Date(end.dateTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      if (durationHours > 0) {
        return `${durationHours}h ${durationMinutes}m`;
      }
      return `${durationMinutes}m`;
    },
    []
  );

  const fetchEvents = useCallback(async () => {
    if (!session?.googleAccessToken) {
      setError('No Google access token available. Please sign in.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + timespan);

      const requestBody: CalendarEventsApiRequest = {
        calendarId: !calendarId && !calendarEmail ? 'primary' : calendarId,
        calendarEmail,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
      };

      const response = await fetch('/api/google/calendar/events/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: CalendarEventsResponse = await response.json();

      if (!response.ok) {
        /**
         * Session cannot self-recover (expired token, no refresh token, or Google
         * rejected the token). Redirect through the consent retry path so the user
         * re-consents and Google issues a fresh refresh token.
         */
        if (data.requiresReauth) {
          const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/auth/signin?error=Callback&callbackUrl=${callbackUrl}`;
          return;
        }
        throw new Error(data.error || 'Failed to fetch events');
      }

      setEvents(data.events || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.googleAccessToken, calendarId, calendarEmail, startDate, timespan]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <Box className={classNames('flex justify-center items-center p-8', className)}>
        <CircularProgress />
        <Typography variant="body2" className="ml-2">
          Loading calendar events...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classNames('w-full', className)}>
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box className={classNames('w-full', className)}>
        <Alert severity="info">No events found for the specified time period.</Alert>
      </Box>
    );
  }

  return (
    <Box className={classNames('w-full', className)}>
      <Typography variant="h5" component="h2" className="mb-4 flex items-center">
        <CalendarToday className="mr-2" />
        Calendar Events
        <Chip label={`${events.length} events`} size="small" className="ml-2" variant="outlined" />
      </Typography>

      <List className="space-y-2">
        {events.map((event, index) => (
          <React.Fragment key={event.id || index}>
            <ListItem className="p-0">
              <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Box className="flex flex-col space-y-2">
                    {/* Event Title */}
                    <Box className="flex items-start justify-between">
                      <Typography
                        variant="h6"
                        component="h3"
                        className="font-semibold text-gray-900 flex-1"
                      >
                        {event.htmlLink ? (
                          <Link
                            href={event.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 no-underline"
                          >
                            {event.summary || 'Untitled Event'}
                          </Link>
                        ) : (
                          event.summary || 'Untitled Event'
                        )}
                      </Typography>

                      <Chip
                        label={event.status}
                        size="small"
                        color={event.status === 'confirmed' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>

                    {/* Event Description */}
                    {event.description && (
                      <Typography variant="body2" className="text-gray-600 line-clamp-2">
                        {event.description}
                      </Typography>
                    )}

                    {/* Event Details */}
                    <Box className="flex flex-col space-y-1 text-sm text-gray-500">
                      {/* Date and Time */}
                      <Box className="flex items-center">
                        <AccessTime className="w-4 h-4 mr-2" />
                        <Typography variant="body2">
                          {formatDateTime(event.start.dateTime, event.start.date)}
                          {event.end && (
                            <>
                              {' - '}
                              {formatDateTime(event.end.dateTime, event.end.date)}
                              {event.start.dateTime && event.end.dateTime && (
                                <span className="ml-2 text-xs text-gray-400">
                                  ({getEventDuration(event.start, event.end)})
                                </span>
                              )}
                            </>
                          )}
                        </Typography>
                      </Box>

                      {/* Location */}
                      {event.location && (
                        <Box className="flex items-center">
                          <LocationOn className="w-4 h-4 mr-2" />
                          <Typography variant="body2">{event.location}</Typography>
                        </Box>
                      )}

                      {/* Organizer */}
                      {event.organizer && (
                        <Box className="flex items-center">
                          <Person className="w-4 h-4 mr-2" />
                          <Typography variant="body2">
                            {event.organizer.displayName || event.organizer.email}
                          </Typography>
                        </Box>
                      )}

                      {/* Attendees Count */}
                      {event.attendees && event.attendees.length > 0 && (
                        <Box className="flex items-center">
                          <Typography variant="body2" className="text-xs">
                            {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </ListItem>
            {index < events.length - 1 && <Divider className="my-2" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default GoogleCalendarEventList;
