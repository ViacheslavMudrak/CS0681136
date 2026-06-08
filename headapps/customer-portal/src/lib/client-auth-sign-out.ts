"use client";

import type { OktaAuth } from "@okta/okta-auth-js";
import { buildLoginUrl } from "@/lib/auth-utils";
import { clearAllStorage, markFreshLoginSession } from "@/lib/okta-auth-client";

export async function clearServerOktaAndClientAuth(oktaAuth?: OktaAuth | null): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    await oktaAuth?.closeSession?.();
    clearAllStorage();
  } catch {}
}

export type NavigateToLoginOptions = {
  returnPathWithSearch?: string;
  skipReturnUrl?: boolean;
};

export function navigateToLoginPage(options?: NavigateToLoginOptions): void {
  if (typeof window === "undefined") {
    return;
  }

  if (options?.skipReturnUrl) {
    window.location.assign("/login");
    return;
  }

  const raw =
    options?.returnPathWithSearch ?? `${window.location.pathname}${window.location.search}`;
  const normalized = raw.trim() === "" ? "/" : raw;
  window.location.assign(buildLoginUrl(normalized));
}

export async function signOutAndNavigateToLogin(
  oktaAuth?: OktaAuth | null,
  options?: NavigateToLoginOptions
): Promise<void> {
  await clearServerOktaAndClientAuth(oktaAuth);
  navigateToLoginPage(options);
}

export async function logout(oktaAuth?: OktaAuth | null): Promise<void> {
  await clearServerOktaAndClientAuth(oktaAuth);
  markFreshLoginSession();
  navigateToLoginPage({ skipReturnUrl: true });
}
