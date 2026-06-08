"use client";

import { OktaAuth } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";
import ToastProvider from "components/shared/toast/ToastProvider";
import { getOktaAuthConfig } from "lib/okta-config";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo } from "react";

export default function AuthorizationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const oktaAuth = useMemo(() => {
    try {
      const config = getOktaAuthConfig();
      return new OktaAuth(config);
    } catch (error) {
      console.warn("Okta not configured, continuing without authentication:", error);
      return null;
    }
  }, []);

  const customAuthHandler = useCallback(() => {
    router.push("/login");
  }, [router]);

  const restoreOriginalUri = useCallback(async (_oktaAuth: OktaAuth, originalUri: string) => {
    // For callback routes, we handle redirects in the callback component
    // This is mainly for compatibility with Okta Security wrapper
  }, []);

  if (!oktaAuth) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <Security
      oktaAuth={oktaAuth}
      onAuthRequired={customAuthHandler}
      restoreOriginalUri={restoreOriginalUri}
    >
      <ToastProvider>{children}</ToastProvider>
    </Security>
  );
}
