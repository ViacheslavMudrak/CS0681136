"use client";

import { useSitecore } from "@sitecore-content-sdk/nextjs";
import { getUserSpecificPermissions } from "@/lib/apis/permissions-api";
import type { PermissionMatchMode } from "@/lib/permissions";
import {
  buildEnabledPermissionCodeSet,
  extractPermissionCodesFromSelection,
  hasPermissionAccess,
} from "@/lib/permissions";
import { useOktaAuth } from "@okta/okta-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useProfileContext } from "./profile-context";
import { useUserProfile } from "./user-profile-context";

interface PermissionContextType {
  grantedCodes: Set<string>;
  isLoading: boolean;
  hasResolved: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  can: (code: string) => boolean;
  canAny: (codes: string[]) => boolean;
  canAll: (codes: string[]) => boolean;
  /** True while XM Cloud Pages / editor experience is active — UI skips DXP permission checks. */
  sitecoreEditingPermissionBypass: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

/** Internal: only {@link SitecoreEditingPermissionBridge} may set Sitecore editing bypass. */
const SitecoreEditingBypassSetterContext = createContext<Dispatch<SetStateAction<boolean>> | null>(
  null
);
const permissionCache = new Map<string, Set<string>>();

interface PermissionIdentity {
  email: string;
  accountId: string;
  isAuthResolved: boolean;
  isAuthenticated: boolean;
  isProfileLoading: boolean;
}

function usePermissionIdentity(): PermissionIdentity {
  const oktaAuth = useOktaAuth();
  const { selectedAccount } = useProfileContext();
  const { loading: isProfileLoading } = useUserProfile();
  const authState = oktaAuth?.authState;
  const isAuthResolved = authState !== null && authState !== undefined;
  const isAuthenticated = authState?.isAuthenticated ?? false;
  const email = (oktaAuth?.authState?.idToken?.claims?.email as string | undefined) ?? "";
  const accountId = selectedAccount?.id ?? "";
  return { email, accountId, isAuthResolved, isAuthenticated, isProfileLoading };
}

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { email, accountId, isAuthResolved, isAuthenticated, isProfileLoading } =
    usePermissionIdentity();
  const [grantedCodes, setGrantedCodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [hasResolved, setHasResolved] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sitecoreEditingPermissionBypass, setSitecoreEditingPermissionBypass] = useState(false);
  const identityKey = email && accountId ? `${email.toLowerCase()}::${accountId}` : "";

  const fetchPermissions = useCallback(async () => {
    if (!identityKey) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserSpecificPermissions(email, accountId);
      const nextCodes = buildEnabledPermissionCodeSet(response?.data);
      permissionCache.set(identityKey, nextCodes);
      setGrantedCodes(nextCodes);
      setHasResolved(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setHasResolved(true);
    } finally {
      setIsLoading(false);
    }
  }, [identityKey, email, accountId]);

  useEffect(() => {
    if (!isAuthResolved) {
      setIsLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setGrantedCodes(new Set());
      setIsLoading(false);
      setHasResolved(true);
      setError(null);
      return;
    }
    if (isProfileLoading || !identityKey) {
      setIsLoading(true);
      return;
    }

    const cachedCodes = permissionCache.get(identityKey);
    if (cachedCodes) {
      setGrantedCodes(cachedCodes);
      setIsLoading(false);
      setHasResolved(true);
      setError(null);
      return;
    }

    void fetchPermissions();
  }, [isAuthResolved, isAuthenticated, isProfileLoading, identityKey, fetchPermissions]);

  const can = useCallback(
    (code: string) => {
      if (sitecoreEditingPermissionBypass) return true;
      return hasPermissionAccess([code], grantedCodes, "any");
    },
    [grantedCodes, sitecoreEditingPermissionBypass]
  );

  const canAny = useCallback(
    (codes: string[]) => {
      if (sitecoreEditingPermissionBypass) return true;
      return hasPermissionAccess(codes, grantedCodes, "any");
    },
    [grantedCodes, sitecoreEditingPermissionBypass]
  );

  const canAll = useCallback(
    (codes: string[]) => {
      if (sitecoreEditingPermissionBypass) return true;
      return hasPermissionAccess(codes, grantedCodes, "all");
    },
    [grantedCodes, sitecoreEditingPermissionBypass]
  );

  const value = useMemo<PermissionContextType>(
    () => ({
      grantedCodes,
      isLoading,
      hasResolved,
      error,
      refresh: fetchPermissions,
      can,
      canAny,
      canAll,
      sitecoreEditingPermissionBypass,
    }),
    [
      grantedCodes,
      isLoading,
      hasResolved,
      error,
      fetchPermissions,
      can,
      canAny,
      canAll,
      sitecoreEditingPermissionBypass,
    ]
  );

  return (
    <SitecoreEditingBypassSetterContext.Provider value={setSitecoreEditingPermissionBypass}>
      <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
    </SitecoreEditingBypassSetterContext.Provider>
  );
}

/**
 * Mount once inside {@link SitecoreProvider} so `page.mode.isEditing` toggles permission bypass for authors.
 * No-op if rendered outside {@link PermissionProvider}.
 */
export function SitecoreEditingPermissionBridge(): null {
  const setBypass = useContext(SitecoreEditingBypassSetterContext);
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing || page?.mode?.isPreview || false;

  useLayoutEffect(() => {
    if (!setBypass) return;
    setBypass(isEditing);
    return () => {
      setBypass(false);
    };
  }, [isEditing, setBypass]);

  return null;
}

export function usePermissionContext(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionContext must be used within a PermissionProvider");
  }
  return context;
}

interface UsePermissionGuardResult {
  requiredCodes: string[];
  isProtected: boolean;
  isAllowed: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Evaluates permission access for a Sitecore PermissionSelection value or code list.
 * Uses secure default behavior: protected targets remain hidden while loading.
 * @param required - Sitecore selection array or explicit permission code array
 * @param mode - "any" or "all" required matching
 * @returns guard state for rendering decisions
 */
export function usePermissionGuard(
  required: unknown,
  mode: PermissionMatchMode = "any"
): UsePermissionGuardResult {
  const { canAny, canAll, isLoading, hasResolved, error, sitecoreEditingPermissionBypass } =
    usePermissionContext();

  const requiredCodes = useMemo(() => {
    if (Array.isArray(required) && required.every((item) => typeof item === "string")) {
      return required as string[];
    }
    return extractPermissionCodesFromSelection(required);
  }, [required]);

  const isProtected = requiredCodes.length > 0;
  if (!isProtected) {
    return { requiredCodes, isProtected, isAllowed: true, isLoading: false, error };
  }

  if (sitecoreEditingPermissionBypass) {
    return { requiredCodes, isProtected, isAllowed: true, isLoading: false, error };
  }

  const hasAccess = mode === "all" ? canAll(requiredCodes) : canAny(requiredCodes);
  const shouldBlockOnLoading = isLoading && !hasResolved;
  const isAllowed = hasAccess && !shouldBlockOnLoading;

  return { requiredCodes, isProtected, isAllowed, isLoading: shouldBlockOnLoading, error };
}
