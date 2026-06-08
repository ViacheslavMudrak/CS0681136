"use client";

import { useOktaAuth } from "@okta/okta-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isPublicRoute, normalizeAuthPath } from "@/lib/auth-utils";
import { signOutAndNavigateToLogin } from "@/lib/client-auth-sign-out";
import { useProfileContext } from "./profile-context";
import type {
  ProfileAccount,
  SetProfileData,
  UserProfileChildContact,
  UserProfileDisplay,
  UserProfileResponse,
} from "./types/user-profile";
import { fetchUserProfile } from "@/lib/apis/user-profile-api";
import {
  getStoredUserProfile,
  storeUserProfile,
} from "@/lib/user-profile-session-storage";
import { sendIdentityEvent } from "@/lib/CDPEvents";

export type { ProfileAccount, UserProfileDisplay } from "./types/user-profile";

export type UserProfileRefetchOptions = {
  /** When true, skip session cache and call the API. */
  force?: boolean;
};

interface UserProfileContextType {
  profile: UserProfileResponse | null;
  loading: boolean;
  error: Error | null;
  hasNoAccounts: boolean;
  accounts: ProfileAccount[];
  defaultAccountId: string | null;
  userDisplay: UserProfileDisplay | null;
  refetch: (email?: string, options?: UserProfileRefetchOptions) => Promise<void>;
  setProfileData: (data: SetProfileData) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

function formatAddress(account: UserProfileChildContact["account"]): string {
  if (!account) return "";
  const parts = [
    account.partyAddressStreet1,
    account.partyAddressStreet2,
    account.partyCity,
    account.partyIsoCountry,
  ].filter(Boolean) as string[];
  return parts.join(", ");
}

/**
 * One row per account (id = account id). Default: API `userPreference.defaultAccount`
 * when it matches an account id, otherwise the first account.
 */
function deriveAccountsFromProfile(profile: UserProfileResponse): {
  accounts: ProfileAccount[];
  defaultAccountId: string | null;
} {
  const rows: Omit<ProfileAccount, "isActive">[] = [];

  for (const parent of profile.parentContact ?? []) {
    for (const child of parent.childContacts ?? []) {
      const acc = child.account;
      if (!acc) continue;

      const address = formatAddress(acc);
      const companyName = acc.displayName ?? acc.partyName ?? "";
      rows.push({
        id: acc.id,
        companyName,
        address,
        accountNumber: acc.ebsPartyNumber ?? acc.ebsAccountId ?? "",
        accountRep: acc.accountRep,
        accountRepEmail: acc?.accountRep?.email ?? undefined,
        supportEmail: acc.supportEmail?.trim() || undefined,
        hotlineNumber: acc.hotlineNumber?.trim() || undefined,
        role: child.jobRole ?? "",
        organization: acc.partyName ?? acc.groupCode ?? "",
      });
    }
  }

  const preferredId = profile.userPreference?.defaultAccount?.trim() || null;
  let defaultId: string | null = rows[0]?.id ?? null;
  if (preferredId && rows.some((r) => r.id === preferredId)) {
    defaultId = preferredId;
  }

  const accounts: ProfileAccount[] = rows.map((r) => ({
    ...r,
    isActive: r.id === defaultId,
  }));

  return { accounts, defaultAccountId: defaultId };
}

function deriveUserDisplay(profile: UserProfileResponse): UserProfileDisplay | null {
  const firstParent = profile.parentContact?.[0];
  const firstLead = profile.leads?.[0];

  if (firstParent) {
    const fullName =
      [firstParent.firstName, firstParent.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || "User";
    return { fullName, email: "", isVerified: true };
  }

  if (firstLead) {
    const fullName =
      ([firstLead.firstName, firstLead.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || firstLead.companyName) ?? "User";
    return {
      fullName,
      email: firstLead.email ?? "",
      isVerified: false,
    };
  }

  return null;
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { setSelectedAccount, currentLanguage, setCurrentLanguage } = useProfileContext();
  const [profile, setProfileState] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const setProfileData = useCallback((data: SetProfileData) => {
    setProfileState(data.profile);
    setLoading(data.loading);
    setError(data.error);
  }, []);

  const derived = useMemo(() => {
    if (!profile) {
      return {
        accounts: [] as ProfileAccount[],
        defaultAccountId: null as string | null,
        userDisplay: null as UserProfileDisplay | null,
      };
    }
    const { accounts, defaultAccountId } = deriveAccountsFromProfile(profile);
    const userDisplay = deriveUserDisplay(profile);
    return {
      accounts,
      defaultAccountId,
      userDisplay,
    };
  }, [profile]);

  useEffect(() => {
    if (derived.accounts.length === 0) return;
    const defaultAccount =
      derived.accounts.find((a) => a.id === derived.defaultAccountId) ?? derived.accounts[0];
    
    if (defaultAccount) {
      setSelectedAccount(defaultAccount);
    }
  }, [derived.defaultAccountId, derived.accounts, setSelectedAccount]);

  useEffect(() => {
    const lang = profile?.userPreference?.defaultLanguage?.trim();
    if (lang) {
      if (!currentLanguage) setCurrentLanguage(lang);
    }
  }, [profile?.userPreference?.defaultLanguage, currentLanguage, setCurrentLanguage]);

  const refetch = useCallback(async (email?: string, options?: UserProfileRefetchOptions) => {
    setLoading(true);
    setError(null);
    try {
      if (!options?.force) {
        const cached = getStoredUserProfile(email);
        if (cached) {
          setProfileState(cached);
          return;
        }
      }
      const data = await fetchUserProfile(email ? { email } : undefined);
      storeUserProfile(data, email);
      setProfileState(data);

      const contact = data?.parentContact?.[0];
      const lead = data?.leads?.[0];
      const identityEmail = email || lead?.email;
      if (identityEmail) {
        sendIdentityEvent({
          firstName: contact?.firstName || lead?.firstName,
          lastName: contact?.lastName || lead?.lastName,
          email: identityEmail,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setProfileState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const hasNoAccounts =
    !loading &&
    !error &&
    profile !== null &&
    derived.accounts.length === 0;

  const value = useMemo<UserProfileContextType>(
    () => ({
      profile,
      loading,
      error,
      accounts: derived.accounts,
      defaultAccountId: derived.defaultAccountId,
      userDisplay: derived.userDisplay,
      hasNoAccounts,
      refetch,
      setProfileData,
    }),
    [
      profile,
      loading,
      error,
      derived.accounts,
      derived.defaultAccountId,
      derived.userDisplay,
      refetch,
      hasNoAccounts,
      setProfileData,
    ]
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

/**
 * When Okta is not configured, profile is never fetched. This component sets loading to false
 * so that UI does not stay in a perpetual loading state. Use only in the non-Okta branch.
 */
export function UserProfileNoAuthClear({ children }: { children: ReactNode }) {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("UserProfileNoAuthClear must be used within UserProfileProvider");
  const { setProfileData } = ctx;
  useEffect(() => {
    setProfileData({ profile: null, loading: false, error: null });
  }, [setProfileData]);
  return <>{children}</>;
}

/**
 * Loads profile when Okta reports authenticated; clears profile when not.
 * After idle/session expiry, Okta can flip to unauthenticated while the user was on a
 * protected page — then we clear server cookies, Okta session, client storage, and hard-navigate
 * to login with a return URL (avoids the “empty profile / no locations” partial state).
 * Waits until `authState` is non-null so we do not treat Okta’s initial “unresolved” state as logout.
 * Must be inside Security (Okta) and UserProfileProvider. Rendered only in the Okta branch.
 */
export function UserProfileDataLoader({ children }: { children: ReactNode }) {
  const oktaAuth = useOktaAuth();
  const authState = oktaAuth?.authState;
  const isAuthResolved = authState != null;
  const isAuthenticated = authState?.isAuthenticated ?? false;
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("UserProfileDataLoader must be used within UserProfileProvider");
  const { refetch, setProfileData } = ctx;

  const hadAuthenticatedSessionRef = useRef(false);
  const sessionLossRedirectScheduledRef = useRef(false);

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }

    const sitePath = normalizeAuthPath(
      typeof window !== "undefined" ? window.location.pathname || "/" : "/"
    );

    if (isAuthenticated && !isPublicRoute(sitePath)) {
      hadAuthenticatedSessionRef.current = true;
      const email = authState?.idToken?.claims?.email as string | undefined;
      void refetch(email);
      return;
    }

    setProfileData({ profile: null, loading: false, error: null });

    if (
      !hadAuthenticatedSessionRef.current ||
      sessionLossRedirectScheduledRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }

    if (isPublicRoute(sitePath)) {
      hadAuthenticatedSessionRef.current = false;
      return;
    }

    sessionLossRedirectScheduledRef.current = true;
    hadAuthenticatedSessionRef.current = false;

    void signOutAndNavigateToLogin(oktaAuth?.oktaAuth);
  }, [
    isAuthResolved,
    isAuthenticated,
    authState?.idToken?.claims?.email,
    refetch,
    setProfileData,
    oktaAuth?.oktaAuth,
  ]);

  return <>{children}</>;
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
