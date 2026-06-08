"use client";

import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { Security, useOktaAuth } from "@okta/okta-react";
import ToastProvider from "components/shared/toast/ToastProvider";
import { useToast } from "components/shared/toast/ToastProvider";
import { getOktaAuth } from "lib/oktaAuth";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { usePageViewTracking } from "src/hooks/usePageViewTracking";
import { AUTH_EVENTS } from "src/lib/apis/api-service";
import { OKTA_COOKIE_SYNC_SKIP_TOKEN_KEY } from "src/lib/auth-session-keys";
import { DOCUMENT_BINARY_OPEN_FAILED_TOAST_EVENT } from "src/lib/documentBinaryPdf";
import { PermissionProvider } from "src/lib/permission-context";
import { ContactSupportModalProvider } from "src/lib/contact-support-modal-context";
import { LanguageSelectionModalProvider } from "src/lib/language-selection-modal-context";
import { getAccessTokenFromLocalStorage, setTokensInLocalStorage } from "src/lib/okta-auth-client";
import { ProfileContextProvider } from "src/lib/profile-context";
import {
  UserProfileDataLoader,
  UserProfileNoAuthClear,
  UserProfileProvider,
} from "src/lib/user-profile-context";
import { PortalRouteTransitionProvider } from "src/lib/portal-route-transition-context";
import { QuoteRequestDraftProvider } from "@/contexts/QuoteRequestDraftContext";
import { QuoteRequestDraftAuthBridge } from "@/contexts/QuoteRequestDraftAuthBridge";

function SessionExpiredToastBridge() {
  const { showToast } = useToast();

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ title?: string; message?: string }>;
      showToast({
        type: "warning",
        title: customEvent.detail?.title || "Session expired",
        message: customEvent.detail?.message || "Your session expired. Please sign in again.",
      });
    };

    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED_TOAST_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED_TOAST_EVENT, handleSessionExpired);
    };
  }, [showToast]);

  return null;
}

function DocumentBinaryOpenFailedToastBridge() {
  const { showToast } = useToast();

  useEffect(() => {
    const handleDocumentOpenFailed = (event: Event) => {
      const customEvent = event as CustomEvent<{ title?: string; message?: string }>;
      showToast({
        type: "error",
        title: customEvent.detail?.title || "Unable to open document",
        message:
          customEvent.detail?.message ||
          "The document could not be opened because the PDF response is invalid or incomplete.",
      });
    };

    window.addEventListener(DOCUMENT_BINARY_OPEN_FAILED_TOAST_EVENT, handleDocumentOpenFailed);
    return () => {
      window.removeEventListener(DOCUMENT_BINARY_OPEN_FAILED_TOAST_EVENT, handleDocumentOpenFailed);
    };
  }, [showToast]);

  return null;
}

function AuthStateTokenSync() {
  const { authState, oktaAuth } = useOktaAuth();
  const lastSyncedAccessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authState?.isAuthenticated) {
      lastSyncedAccessTokenRef.current = null;
      return;
    }

    const syncTokens = async () => {
      const tokenSet = await oktaAuth.tokenManager.getTokens();
      const accessTokenValue =
        typeof tokenSet.accessToken === "string"
          ? tokenSet.accessToken
          : tokenSet.accessToken?.accessToken;
      const idTokenValue =
        typeof tokenSet.idToken === "string" ? tokenSet.idToken : tokenSet.idToken?.idToken;
      const refreshTokenValue =
        typeof tokenSet.refreshToken === "string"
          ? tokenSet.refreshToken
          : tokenSet.refreshToken?.refreshToken;
      const expiresAt =
        typeof tokenSet.accessToken === "object" ? tokenSet.accessToken?.expiresAt : undefined;
      const expiresIn =
        expiresAt != null ? Math.max(0, Math.floor(expiresAt - Date.now() / 1000)) : 3600;

      if (!accessTokenValue || lastSyncedAccessTokenRef.current === accessTokenValue) {
        return;
      }

      if (typeof window !== "undefined") {
        const skipToken = sessionStorage.getItem(OKTA_COOKIE_SYNC_SKIP_TOKEN_KEY);
        if (skipToken && skipToken === accessTokenValue) {
          sessionStorage.removeItem(OKTA_COOKIE_SYNC_SKIP_TOKEN_KEY);
          lastSyncedAccessTokenRef.current = accessTokenValue;
          return;
        }
      }

      if (getAccessTokenFromLocalStorage() !== accessTokenValue) {
        setTokensInLocalStorage(accessTokenValue, idTokenValue ?? null, refreshTokenValue ?? null);
      }

      await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessTokenValue,
          id_token: idTokenValue ?? undefined,
          refresh_token: refreshTokenValue ?? undefined,
          expires_in: expiresIn,
        }),
        credentials: "same-origin",
      }).catch((error) => {
        console.warn("Failed to synchronize auth cookies from Okta token manager:", error);
      });

      lastSyncedAccessTokenRef.current = accessTokenValue;
    };

    void syncTokens();
  }, [authState?.isAuthenticated, oktaAuth]);

  return null;
}

export default function AuthShellProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  usePageViewTracking();

  const oktaAuth = useMemo(() => {
    try {
      return getOktaAuth();
    } catch (error) {
      console.warn("Okta not configured, continuing without authentication:", error);
      return null;
    }
  }, []);

  const customAuthHandler = useCallback(() => {
    router.push("/login");
  }, [router]);

  const restoreOriginalUri = useCallback(
    async (_oktaAuth: OktaAuth, originalUri: string) => {
      if (typeof window !== "undefined") {
        const forgotPasswordFlow = localStorage.getItem("okta_forgot_password_flow");
        const urlParams = new URLSearchParams(window.location.search);
        const modeParam = urlParams.get("mode");
        const pathname = window.location.pathname;
        const hasResetSuccess = urlParams.get("reset") === "success";

        if (
          modeParam === "reset" ||
          forgotPasswordFlow === "true" ||
          pathname === "/reset-password" ||
          pathname.startsWith("/reset-password/") ||
          hasResetSuccess
        ) {
          return;
        }
      }

      router.replace(toRelativeUrl(originalUri || "/", window.location.origin));
    },
    [router]
  );

  if (!oktaAuth) {
    return (
      <ProfileContextProvider>
        <LanguageSelectionModalProvider>
          <UserProfileProvider>
            <UserProfileNoAuthClear>
              <ContactSupportModalProvider>
                <PermissionProvider>
                  <PortalRouteTransitionProvider>
                    <ToastProvider>
                      <SessionExpiredToastBridge />
                      <DocumentBinaryOpenFailedToastBridge />
                      <QuoteRequestDraftProvider>
                        {children}
                      </QuoteRequestDraftProvider>
                    </ToastProvider>
                  </PortalRouteTransitionProvider>
                </PermissionProvider>
              </ContactSupportModalProvider>
            </UserProfileNoAuthClear>
          </UserProfileProvider>
        </LanguageSelectionModalProvider>
      </ProfileContextProvider>
    );
  }

  return (
    <Security
      oktaAuth={oktaAuth}
      onAuthRequired={customAuthHandler}
      restoreOriginalUri={restoreOriginalUri}
    >
      <ProfileContextProvider>
        <LanguageSelectionModalProvider>
          <UserProfileProvider>
            <UserProfileDataLoader>
              <AuthStateTokenSync />
              <ContactSupportModalProvider>
                <PermissionProvider>
                  <PortalRouteTransitionProvider>
                    <ToastProvider>
                      <SessionExpiredToastBridge />
                      <DocumentBinaryOpenFailedToastBridge />
                      <QuoteRequestDraftAuthBridge>
                        {children}
                      </QuoteRequestDraftAuthBridge>
                    </ToastProvider>
                  </PortalRouteTransitionProvider>
                </PermissionProvider>
              </ContactSupportModalProvider>
            </UserProfileDataLoader>
          </UserProfileProvider>
        </LanguageSelectionModalProvider>
      </ProfileContextProvider>
    </Security>
  );
}
