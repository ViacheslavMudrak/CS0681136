// types/next-auth.d.ts
import type { AscensionSite } from 'lib/home-site/types';
import NextAuth from 'next-auth';
import type { DefaultSession, DefaultUser, Profile as AuthProfile } from 'next-auth';
import type { EntraIdProfile } from 'ts/entra-id';
import type { GoogleErrorResponse, GoogleProfileData, GoogleGroupData } from 'ts/google';
import type { VoyagerMockData } from 'ts/voyager-mock-data';

declare module 'next-auth' {
  interface User extends DefaultUser {
    groupEmail?: string; // This extends the User type
  }

  interface Session extends DefaultSession {
    /** Exposed only if you intentionally add it in session callback */
    googleAccessToken?: string;
    googleAccessTokenExpires?: number;
    refreshToken?: string;
    idToken?: string; // Azure AD ID token (via Google WIF)
    error?: string; // Error message for session issues

    googleProfile?: GoogleProfileData;
    googleGroups?: Array<GoogleGroupData>;
    entraIdProfile?: EntraIdProfile;
    employeeNumber?: string;
    employeeNumbers?: string[];
    user: DefaultSession['user'] & {
      /** Custom Google access token for the user */
      id?: string;
      googleAccessToken?: string;
      entraAccessToken?: string;
      groupEmail?: string;
    };
    voyagerMockJson?: VoyagerMockData;
    /** Resolved home site from site mapping rules (cached, 1h TTL) */
    newsHomeSite?: AscensionSite;
    newsSupplementalSites?: AscensionSite[];
    /** User's Google group emails filtered to only those registered as Sitecore Visible By Items. Search-only — never used for component or page-level gating. */
    filteredGroupEmails?: string[];
    /** SHA-256 hashes of filteredGroupEmails. Search-only — never used for component or page-level gating. */
    filteredGroupEmailHashes?: string[];
  }
}

// Extend the JWT interface to include custom properties (these types are used in the JWT callback)
declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    idToken?: string; // Azure AD ID token (via Google WIF)
    refreshToken?: string;
    groupEmail?: string;

    /** Persisted on the server-side JWT */
    googleAccessToken?: string;
    googleAccessTokenExpires?: number;
    entraAccessToken?: string;

    googleProfile?: GoogleProfileData;
    googleGroups?: Array<GoogleGroupData>;
    entraIdProfile?: EntraIdProfile;
    ukgPersonNumber?: string;
    ukgManagedPersonNumbers?: string[];
  }
}
