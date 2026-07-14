import { createHash, randomUUID } from 'crypto';
import { adminFirestore } from 'lib/firebase/config';
import { getNewsHomeSite } from 'lib/home-site';
import { getNewsSupplementalSites } from 'lib/home-site/home-site-service';
import type { Session } from 'next-auth';
import { log } from 'src/util/helpers/log-helper';
import { getVisibleByEmails } from 'lib/auth/visible-by-service';
import { hashEmailForSearch } from 'src/util/helpers/visibility-helpers';

const db = adminFirestore;

// Mock user for development - can be overridden via environment variables
export const MOCK_USER = {
  email: process.env.MOCK_USER_EMAIL || 'mock.user@example.com',
  name: process.env.MOCK_USER_NAME || 'Mickey Mock',
};

/** Deterministic ID from email so the same email always maps to the same userId / cache keys. */
export const getMockUserId = (email: string): string =>
  createHash('md5').update(email.trim().toLowerCase()).digest('hex');

/** Returns true when mock auth is enabled via environment variables. */
export const isMockAuthEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true' || process.env.ENABLE_MOCK_AUTH === 'true';

/** Returns true when mock auth is enabled and the userId matches the mock hash for the given email. */
export const checkIsMockUser = (email: string | undefined, userId: string): boolean =>
  isMockAuthEnabled() && !!email && userId === getMockUserId(email);

/**
 * Ensure the mock user and a valid session exist in Firestore.
 * CredentialsProvider in NextAuth v4 does NOT call the database adapter's
 * createUser / createSession methods, so we must do it manually.
 */
export const ensureMockUserSession = async (
  user: {
    id: string;
    email: string;
    name: string;
    companyCode?: string;
    businessUnit?: string;
    groupEmail?: string;
  },
  sessionMaxAge: number
) => {
  const userRef = db.collection('users').doc(user.id);
  const userDoc = await userRef.get();

  const mockUserData = {
    name: user.name,
    email: user.email,
    employeeNumber: process.env.MOCK_USER_UKG_PERSON_NUMBER,
    employeeNumbers: process.env.MOCK_USER_UKG_MANAGED_PERSONS,
    ...(user.companyCode && { companyCode: user.companyCode }),
    ...(user.businessUnit && { businessUnit: user.businessUnit }),
    groupEmail: user.groupEmail || null,
  };

  if (!userDoc.exists) {
    await userRef.set({
      ...mockUserData,
      emailVerified: null,
      image: null,
    });
  } else {
    await userRef.update(mockUserData);
  }

  // Create a new session document
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + sessionMaxAge * 1000);

  await db.collection('sessions').add({
    sessionToken,
    userId: user.id,
    expires,
  });

  return sessionToken;
};

/**
 * Enrich a NextAuth session with mock Google profile and group data.
 * This is the development-only path used when the current user is a mock user.
 */
export const enrichSessionWithMockData = async (
  session: Session,
  userId: string,
  userData: Record<string, unknown> | undefined,
  user: { groupEmail?: string }
): Promise<Session> => {
  session.googleProfile = {
    id: userId,
    organizations: [
      {
        name: process.env.MOCK_USER_COMPANY || 'Ascension',
        department: process.env.MOCK_USER_DEPARTMENT || 'Engineering',
        title: process.env.MOCK_USER_JOB_TITLE || 'Developer',
      },
    ],
    name: {
      displayName: MOCK_USER.name,
    },
    userInfo: {
      companyCode:
        (userData?.companyCode as string) || process.env.MOCK_USER_COMPANY_CODE || 'AscTech',
      businessUnit: Number(userData?.businessUnit || process.env.MOCK_USER_BUSINESS_UNIT) || 123,
      businessUnitDescription:
        (userData?.businessUnitDescription as string) ||
        process.env.MOCK_USER_BUSINESS_UNIT_DESCRIPTION ||
        'Ascension Technologies',
      employeeClass: 'Mock Class',
      employeeNumber: userId,
      isManager: 'No',
      managerLevel: 0,
      workLocationCode: 'MOCK_LOC',
      city: (userData?.city as string) || process.env.MOCK_USER_CITY || '',
      state: (userData?.state as string) || process.env.MOCK_USER_STATE || '',
    },
  };

  // Parse mock groups from sign-in credentials (stored in Firestore), env var, or default.
  // userData.groupEmail is persisted by ensureMockUserSession so it survives across session
  // callbacks — without this, switching mock users never updates the visible-by groups.
  const firestoreGroupEmail = userData?.groupEmail as string | null | undefined;
  const adapterGroupEmail = (user as Record<string, unknown>)?.groupEmail as
    | string
    | null
    | undefined;
  const envGroupEmail = process.env.MOCK_GROUP_EMAIL;
  const mockGroupRaw =
    firestoreGroupEmail || adapterGroupEmail || envGroupEmail || 'atexec@ascension.org';

  session.googleGroups = mockGroupRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .map((email) => ({ id: email, email, name: email }));

  log('INFO', 'NextAuth', 'mock session groups', {
    groups: (session.googleGroups as Array<{ email: string }>)?.map((g) => g.email).join(', '),
  });

  try {
    const visibleByEmails = await getVisibleByEmails();
    const visibleBySet = new Set(visibleByEmails);
    const filteredEmails = session.googleGroups
      .map((g) => g.email?.toLowerCase().trim())
      .filter((e): e is string => Boolean(e) && visibleBySet.has(e));
    session.filteredGroupEmails = filteredEmails;
    session.filteredGroupEmailHashes = filteredEmails.map(hashEmailForSearch);
  } catch {
    session.filteredGroupEmails = [];
    session.filteredGroupEmailHashes = [];
  }

  // Resolve home site and news sites for mock user
  if (!session.newsHomeSite || !session.newsSupplementalSites) {
    try {
      session.newsHomeSite = await getNewsHomeSite(userId, session.googleProfile);
      session.newsSupplementalSites = await getNewsSupplementalSites(userId);
    } catch (error) {
      log('WARNING', 'NextAuth', 'Failed to resolve mock home site', { error });
    }
  }

  return session;
};
