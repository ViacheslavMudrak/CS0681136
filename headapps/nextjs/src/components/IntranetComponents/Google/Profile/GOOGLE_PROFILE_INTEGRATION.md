## Google Profile Integration

This enhancement adds Google profile information retrieval to the existing Google Calendar component.

### 🎉 New Features Added:

#### 1. **Google Profile API Route** (`/api/google/profile`)

- **GET** endpoint that fetches user profile data from Google People API
- Uses the same Google access token from NextAuth session
- Caches profile data for 30 minutes
- Returns comprehensive profile information

#### 2. **Automatic Profile Fetch During Sign-in**

- Profile data is automatically fetched when user signs in
- Stored in NextAuth JWT token and session
- No additional API calls needed on subsequent requests
- Graceful fallback if profile fetch fails

#### 3. **GoogleProfileDisplay Component**

- React component to display Google profile information
- Material-UI design with responsive layout
- Shows profile photo, contact info, organization details, etc.
- Integrated into the demo page

#### 4. **TypeScript Extensions**

- Extended NextAuth types to include Google profile data
- Type-safe access to profile information in session

### 📁 Files Added/Modified:

**New Files:**

- `src/pages/api/google/profile.ts` - Profile API endpoint
- `src/components/IntranetComponents/Google/GoogleProfileDisplay.tsx` - Profile display component
- `src/types/next-auth.d.ts` - NextAuth type extensions

**Modified Files:**

- `src/pages/api/auth/[...nextauth].ts` - Added profile fetch during sign-in
- `src/pages/poc/google-api-demo.dev.tsx` - Added profile display
- `src/components/IntranetComponents/Google/index.ts` - Export new component

### 🔧 Dependencies Added:

- `@googleapis/people` - Google People API client

### 📊 Profile Data Available:

```typescript
interface GoogleProfileData {
  id: string;
  name?: {
    displayName?: string;
    givenName?: string;
    familyName?: string;
  };
  emailAddresses?: Array<{
    value: string;
    type?: string;
  }>;
  phoneNumbers?: Array<{
    value: string;
    type?: string;
  }>;
  photos?: Array<{
    url: string;
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
    department?: string;
  }>;
  addresses?: Array<{
    formattedValue?: string;
    type?: string;
  }>;
}
```

### 💻 Usage Examples:

#### 1. Access Profile in Session:

```tsx
import { useSession } from 'next-auth/react';

const MyComponent = () => {
  const { data: session } = useSession();

  if (session?.googleProfile) {
    const profile = session.googleProfile;
    return <div>Hello, {profile.name?.displayName}!</div>;
  }

  return <div>No profile available</div>;
};
```

#### 2. Use Profile Display Component:

```tsx
import { GoogleProfileDisplay } from '../components/IntranetComponents/Google';

const ProfilePage = () => {
  return (
    <div>
      <h1>My Profile</h1>
      <GoogleProfileDisplay className="custom-styling" />
    </div>
  );
};
```

#### 3. Call Profile API Directly:

```typescript
const fetchProfile = async () => {
  const response = await fetch('/api/google/profile');
  const data = await response.json();

  if (response.ok) {
    console.log('Profile:', data.profile);
  } else {
    console.error('Error:', data.error);
  }
};
```

### 🔒 Security & Privacy:

- Profile data is cached using hashed access token as key
- Sensitive data is not logged
- Graceful error handling for access denied scenarios
- Profile fetch doesn't block sign-in process if it fails

### 🎯 Integration Points:

- **Calendar Events**: Profile info can enhance calendar event displays
- **User Authentication**: Rich user information available immediately after sign-in
- **Personalization**: Organization and contact info for customized experiences

### 📍 Demo Page:

Visit `/poc/google-api-demo` to see both calendar events and profile information in action.

The profile information is automatically available after signing in with your Google account!
