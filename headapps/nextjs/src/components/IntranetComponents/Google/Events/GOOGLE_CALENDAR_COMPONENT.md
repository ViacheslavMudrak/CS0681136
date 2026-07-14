## Google Calendar Event List Component

This component fetches and displays Google Calendar events using Material-UI and Tailwind CSS.

### Features

✅ **Calendar Integration**: Fetches events from Google Calendar API
✅ **Authentication**: Uses NextAuth Google access token
✅ **Caching**: API responses cached for 5 minutes based on calendar identifier
✅ **Error Handling**: Displays appropriate messages for access denied scenarios
✅ **Responsive Design**: Built with Material-UI and Tailwind CSS
✅ **TypeScript**: Fully typed with comprehensive interfaces

### Files Created

1. **GoogleCalendarEventList.types.tsx** - TypeScript interfaces and types
2. **GoogleCalendarEventList.tsx** - Main React component
3. **index.ts** - Export file for the component
4. **events.ts** - Next.js API route (`/api/google/calendar/events/list`)
5. **poc/google-api-demo.dev.tsx** - Demo page showing usage examples

### Component Props

```typescript
interface GoogleCalendarEventListProps {
  calendarId?: string; // Google Calendar ID
  calendarEmail?: string; // Calendar email address
  startDate?: Date; // Start date (defaults to current date)
  timespan?: number; // Timespan in months (defaults to 3)
  className?: string; // Additional CSS classes
}
```

### Usage Examples

```tsx
// Primary calendar, 3 months
<GoogleCalendarEventList />

// Specific calendar by email, 1 month
<GoogleCalendarEventList
  calendarEmail="team@company.com"
  timespan={1}
/>

// Calendar by ID, 6 months
<GoogleCalendarEventList
  calendarId="abc123def456"
  startDate={new Date()}
  timespan={6}
/>
```

### API Endpoint

**POST** `/api/google/events`

Request body:

```json
{
  "calendarId": "primary",
  "calendarEmail": "user@company.com",
  "timeMin": "2025-01-01T00:00:00.000Z",
  "timeMax": "2025-04-01T00:00:00.000Z"
}
```

### Dependencies

- `@googleapis/calendar` - Google Calendar API client
- `@mui/material` - Material-UI components
- `next-auth` - Authentication with Google

### Authentication

The component requires a valid Google access token from NextAuth. The token should be available in the session as `googleAccessToken`.

### Caching

API responses are cached in memory for 5 minutes based on a cache key that includes:

- Calendar identifier (ID or email)
- Time range (timeMin and timeMax)

### Error Handling

The component handles various error scenarios:

- **403 Forbidden**: No access to calendar
- **404 Not Found**: Calendar doesn't exist
- **401 Unauthorized**: Authentication failed
- **Network errors**: General API failures

### Demo Page

Visit `/poc/google-api-demo` to see the component in action with different configurations.
