import type { Meta, StoryObj, Decorator } from '@storybook/nextjs-vite';
import { SessionProvider } from 'next-auth/react';

import UpcomingEventCalendar from './UpcomingEventCalendar';
import type { UpcomingEventCalendarProps } from './UpcomingEventCalendar.types';

const futureIso = (daysFromNow: number): string =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();

const mockGoogleEvents = [
  {
    summary: 'Healthcare Innovation Summit',
    description: 'Big ideas, bigger coffee. Join us for talks, panels, and networking.',
    htmlLink: 'https://calendar.google.com/calendar/event?eid=mock1',
    start: { dateTime: futureIso(7), timeZone: 'UTC' },
    end: { dateTime: futureIso(7), timeZone: 'UTC' },
  },
  {
    summary: 'All Hands (All Day)',
    description: 'Company-wide updates and Q&A.',
    htmlLink: 'https://calendar.google.com/calendar/event?eid=mock2',
    start: { date: '2099-10-10', timeZone: 'UTC' },
    end: { date: '2099-10-11', timeZone: 'UTC' },
  },
  {
    summary: 'UX Review Session',
    description: 'Review flows, spot friction, fix it',
    htmlLink: 'https://calendar.google.com/calendar/event?eid=mock3',
    start: { dateTime: futureIso(10), timeZone: 'UTC' },
    end: { dateTime: futureIso(10), timeZone: 'UTC' },
  },
  {
    summary: 'Planning Session',
    description:
      'Changes made to the title by someone in Google Tasks (this part should be removed)',
    htmlLink: 'https://calendar.google.com/calendar/event?eid=mock4',
    start: { dateTime: futureIso(12), timeZone: 'UTC' },
    end: { dateTime: futureIso(12), timeZone: 'UTC' },
  },
];

const mockSession = {
  user: { name: 'Storybook User', email: 'storybook@example.com' },
  googleAccessToken: 'storybook-mock-access-token',
  expires: '2099-01-01T00:00:00.000Z',
};

const mockFetchDecorator: Decorator = (Story) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes('/api/google/calendar/events/list')) {
      return new Response(JSON.stringify({ events: mockGoogleEvents }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch(input, init);
  };

  queueMicrotask(() => {
    globalThis.fetch = originalFetch;
  });

  return (
    <SessionProvider session={mockSession}>
      <Story />
    </SessionProvider>
  );
};

const meta: Meta<typeof UpcomingEventCalendar> = {
  title: 'Components/Upcoming Event Calendar',
  component: UpcomingEventCalendar,
  tags: ['autodocs'],
  decorators: [mockFetchDecorator],
};

export default meta;

type Story = StoryObj<UpcomingEventCalendarProps>;

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'UpcomingEventCalendar',
      dataSource: 'mock-datasource',
      placeholders: {},
      params: {},
    },
    fields: {
      headline: { value: 'Upcoming Events' },
      subtext: {
        value:
          'Lorem ipsum dolor sit amet, mentitum reprimique et eum. Ne eam affert congue. Ius vide accumsan suscipit an.',
      },
      buttonText: { value: 'See Calendar' },
      googleCalendarId: { value: 'mock-calendar-id@group.calendar.google.com' },
    },
    params: {
      showCalendarCta: '1',
      showAllEventDescriptions: '1',
      showAllEventTimes: '1',
    },
  },
};
