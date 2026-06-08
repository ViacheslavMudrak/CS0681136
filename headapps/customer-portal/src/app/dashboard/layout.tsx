"use client";

import { OktaAuth } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";
import { getOktaAuthConfig } from "lib/okta-config";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Create OktaAuth instance - memoized to prevent recreation
  const oktaAuth = useMemo(() => {
    try {
      const config = getOktaAuthConfig();
      return new OktaAuth(config);
    } catch (error) {
      console.warn(
        "Okta not configured, continuing without authentication:",
        error
      );
      return null;
    }
  }, []);

  // Custom auth handler for Next.js routing
  const customAuthHandler = useCallback(() => {
    router.push("/login");
  }, [router]);

  // Restore original URI after authentication
  const restoreOriginalUri = useCallback(
    async (_oktaAuth: OktaAuth, originalUri: string) => {
      // For dashboard routes, we handle redirects in the components
      // This is mainly for compatibility with Okta Security wrapper
    },
    []
  );

  // If Okta is not configured, render without Security wrapper
  if (!oktaAuth) {
    return <>{children}</>;
  }

  return (
    <Security
      oktaAuth={oktaAuth}
      onAuthRequired={customAuthHandler}
      restoreOriginalUri={restoreOriginalUri}
    >
      {children}
    </Security>
  );
}

