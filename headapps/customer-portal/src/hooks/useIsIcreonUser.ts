"use client";

import { useOktaAuth } from "@okta/okta-react";
import { useMemo } from "react";

export function useIsIcreonUser(): boolean {
  const oktaAuthContext = useOktaAuth();
  const authState = oktaAuthContext?.authState || null;

  return useMemo(() => {
    if (!authState?.isAuthenticated || !authState.idToken?.claims) {
      return false;
    }
    const email = authState.idToken.claims.email as string | undefined;
    return (
      (email?.toLowerCase().endsWith("icreon.com") ||
        email?.toLowerCase().endsWith("mailinator.com")) ??
      false
    );
  }, [authState]);
}
