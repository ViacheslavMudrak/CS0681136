"use client";

import { useOktaAuth } from "@okta/okta-react";
import type { ReactNode } from "react";

import { QuoteRequestDraftProvider } from "@/contexts/QuoteRequestDraftContext";

/** Supplies the signed-in user email to {@link QuoteRequestDraftProvider} (must render inside Okta `<Security>`). */
export function QuoteRequestDraftAuthBridge({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const oktaAuth = useOktaAuth();
  const userEmail =
    (oktaAuth?.authState?.idToken?.claims?.email as string | undefined)?.trim() ?? "";

  return <QuoteRequestDraftProvider userEmail={userEmail}>{children}</QuoteRequestDraftProvider>;
}
