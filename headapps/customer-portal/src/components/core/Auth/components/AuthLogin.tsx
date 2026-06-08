"use client";

import { LoginCallback, useOktaAuth } from "@okta/okta-react";

import AuthCard from "@/components/shared/auth-card/AuthCard";
import Button from "@/components/ui/Button";
import { assignPostLoginNavigation, resolvePostLoginDestination } from "@/lib/auth-utils";
import {
  CP_FRESH_LOGIN_SESSION_KEY,
  OKTA_COOKIE_SYNC_SKIP_TOKEN_KEY,
} from "@/lib/auth-session-keys";
import { sendLoginEvent } from "@/lib/CDPEvents";
import { setTokensInLocalStorage } from "@/lib/okta-auth-client";
import { setEmailVerifyFlowHint } from "@/lib/okta-email-verify";
import type { UserInfo } from "@/lib/types/okta";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { AUTH_ERROR_MESSAGES, AUTH_METHODS } from "src/helpers/enums";
import { logGTMLoginFailure, logGTMLoginSuccess } from "src/lib/gtm";
import type { OktaSignInResponse } from "src/lib/types/okta";
import ErrorMessage from "../../../shared/error-message/ErrorMessage";
import LoadingSkeleton from "../../../shared/loading-skeleton/LoadingSkeleton";
import { cn } from "@/lib/utils";
import OktaSignInWidget from "../octa-widget/OktaSignInWidget";

interface AuthLoginProps {
  onError?: (error: string) => void;
}

function extractUserInfo(authState: {
  idToken?: { claims?: { sub?: string; email?: string; name?: string } };
}): UserInfo | undefined {
  try {
    if (authState?.idToken?.claims) {
      const claims = authState.idToken.claims;
      return {
        userId: claims.sub,
        email: claims.email,
        name: claims.name,
      };
    }
  } catch (err) {
    console.warn("Failed to extract user info from authState:", err);
  }
  return undefined;
}

type RawTokenSet = {
  accessToken?: string;
  idToken?: string | null;
  refreshToken?: string | null;
  expiresIn?: number;
};

function normalizeTokenSet(tokens: {
  accessToken?: string | { accessToken?: string; expiresAt?: number };
  idToken?: string | { idToken?: string };
  refreshToken?: string | { refreshToken?: string };
}): RawTokenSet {
  const accessTokenValue =
    typeof tokens.accessToken === "string" ? tokens.accessToken : tokens.accessToken?.accessToken;
  const idTokenValue =
    typeof tokens.idToken === "string" ? tokens.idToken : tokens.idToken?.idToken;
  const refreshTokenValue =
    typeof tokens.refreshToken === "string"
      ? tokens.refreshToken
      : tokens.refreshToken?.refreshToken;

  const expiresAt =
    typeof tokens.accessToken === "object" ? tokens.accessToken?.expiresAt : undefined;
  const expiresIn =
    expiresAt != null ? Math.max(0, Math.floor(expiresAt - Date.now() / 1000)) : 3600;

  return {
    accessToken: accessTokenValue,
    idToken: idTokenValue ?? null,
    refreshToken: refreshTokenValue ?? null,
    expiresIn,
  };
}

const AuthLogin: React.FC<AuthLoginProps> = ({ onError }) => {
  const markCookieSyncCompletedForToken = (accessToken?: string | null) => {
    if (typeof window === "undefined" || !accessToken) {
      return;
    }
    sessionStorage.setItem(OKTA_COOKIE_SYNC_SKIP_TOKEN_KEY, accessToken);
  };
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const oktaAuthContext = useOktaAuth();

  const authState = oktaAuthContext?.authState || null;
  const oktaAuth = oktaAuthContext?.oktaAuth || null;
  const authRedirectTriggeredRef = useRef(false);
  const skipAuthenticatedFlowRef = useRef(false);

  const forceRefresh =
    typeof window !== "undefined" ? localStorage.getItem("okta_force_refresh") : null;

  useEffect(() => {
    setEmailVerifyFlowHint("login");
  }, []);

  useEffect(() => {
    if (forceRefresh && typeof window !== "undefined") {
      localStorage.removeItem("okta_force_refresh");
    }
  }, [forceRefresh]);

  const handleSuccess = async (tokens: OktaSignInResponse) => {
    skipAuthenticatedFlowRef.current = true;
    setError(null);

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("okta_reset_password_email");
    }

    let userInfo: { userId?: string; email?: string; name?: string } | undefined;
    try {
      if (tokens.tokens?.idToken?.claims) {
        const claims = tokens.tokens.idToken.claims;
        userInfo = {
          userId: claims.sub,
          email: claims.email,
          name: claims.name,
        };
      }
    } catch (err) {
      console.warn("Failed to extract user info from token:", err);
    }

    logGTMLoginSuccess({ ...userInfo, authMethod: AUTH_METHODS.PASSWORD });

    sendLoginEvent({
      type: "customerportal:LOGIN",
      ...userInfo,
      auth_method: AUTH_METHODS.PASSWORD,
    });

    const normalizedTokens = normalizeTokenSet(
      (tokens.tokens || {}) as {
        accessToken?: string | { accessToken?: string; expiresAt?: number };
        idToken?: string | { idToken?: string };
        refreshToken?: string | { refreshToken?: string };
      }
    );

    if (normalizedTokens.accessToken) {
      setTokensInLocalStorage(
        normalizedTokens.accessToken,
        normalizedTokens.idToken ?? null,
        normalizedTokens.refreshToken ?? null
      );
    }

    const modeParam = searchParams.get("mode");
    const resetFlow =
      typeof window !== "undefined" ? localStorage.getItem("okta_reset_flow") : null;

    if (modeParam === "reset" || resetFlow === "true") {
      return;
    }

    const returnUrlParam = searchParams.get("returnUrl");
    const returnUrl = await resolvePostLoginDestination({
      userEmail: userInfo?.email,
      explicitReturnUrl: returnUrlParam,
      includeStoredReturnUrl: false,
      clearStoredReturnUrl: false,
    });

    if (typeof window !== "undefined") {
      sessionStorage.setItem("login_return_url", returnUrl);
      localStorage.removeItem("okta_prefill_email");
    }

    if (normalizedTokens.accessToken) {
      try {
        const res = await fetch("/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: normalizedTokens.accessToken,
            id_token: normalizedTokens.idToken ?? undefined,
            refresh_token: normalizedTokens.refreshToken ?? undefined,
            expires_in: normalizedTokens.expiresIn ?? 3600,
            returnUrl,
          }),
          credentials: "same-origin",
        });
        const data = (await res.json()) as {
          redirectUrl?: string;
          access_token?: string;
          id_token?: string;
          refresh_token?: string;
        };
        if (res.ok) {
          if (data.access_token) {
            setTokensInLocalStorage(
              data.access_token,
              data.id_token ?? null,
              data.refresh_token ?? null
            );
          } else {
            setTokensInLocalStorage(
              normalizedTokens.accessToken,
              normalizedTokens.idToken ?? null,
              normalizedTokens.refreshToken ?? null
            );
          }
          markCookieSyncCompletedForToken(data.access_token ?? normalizedTokens.accessToken);
          assignPostLoginNavigation(returnUrl);
          return;
        }
      } catch (err) {
        console.warn("Failed to set auth cookies, falling back to client navigation:", err);
      }
    }

    assignPostLoginNavigation(returnUrl);
  };

  const handleError = (err: Error) => {
    if (!err) {
      return;
    }

    logGTMLoginFailure(AUTH_METHODS.PASSWORD, err.message);

    sendLoginEvent({
      type: "customerportal:LOGIN_ERROR",
      error: err.message,
      auth_method: AUTH_METHODS.PASSWORD,
    });

    const errorMessage = err.message || AUTH_ERROR_MESSAGES.LOGIN_FAILED;

    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };

  const code = searchParams.get("code");
  const interactionCode = searchParams.get("interaction_code");
  const oauthError = searchParams.get("error");
  const modeParam = searchParams.get("mode");
  const resetFlow = typeof window !== "undefined" ? localStorage.getItem("okta_reset_flow") : null;
  // const otp = searchParams.get("otp");
  const hasOAuthParams = !!(code || interactionCode);
  const shouldBypassAuthenticatedRedirect = modeParam === "reset" || resetFlow === "true";

  useEffect(() => {
    if (oauthError !== "interaction_required" || hasOAuthParams) {
      return;
    }

    // Interaction-required on login is a stale redirect artifact; clean URL and show widget.
    router.replace("/login");
  }, [oauthError, hasOAuthParams, router]);

  useEffect(() => {
    if (authState && !authState.isAuthenticated && typeof window !== "undefined") {
      sessionStorage.removeItem(CP_FRESH_LOGIN_SESSION_KEY);
    }
  }, [authState?.isAuthenticated]);

  useEffect(() => {
    if (!authState?.isAuthenticated || shouldBypassAuthenticatedRedirect) {
      authRedirectTriggeredRef.current = false;
      return;
    }
    if (skipAuthenticatedFlowRef.current) {
      return;
    }
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem(CP_FRESH_LOGIN_SESSION_KEY) === "1"
    ) {
      sessionStorage.removeItem(CP_FRESH_LOGIN_SESSION_KEY);
      authRedirectTriggeredRef.current = false;
      oktaAuth?.tokenManager?.clear?.();
      return;
    }

    if (authRedirectTriggeredRef.current) {
      return;
    }
    authRedirectTriggeredRef.current = true;

    const runAuthenticatedFlow = async () => {
      try {
        const userInfo = extractUserInfo(authState);
        const returnUrl = await resolvePostLoginDestination({
          userEmail: userInfo?.email,
          includeStoredReturnUrl: true,
          clearStoredReturnUrl: true,
        });

        logGTMLoginSuccess({ ...userInfo, authMethod: AUTH_METHODS.SSO });
        sendLoginEvent({
          type: "customerportal:LOGIN",
          ...userInfo,
          auth_method: AUTH_METHODS.SSO,
        });

        const tokenManagerTokens = await oktaAuth?.tokenManager?.getTokens?.();
        const normalizedTokens = normalizeTokenSet(
          (tokenManagerTokens || {}) as {
            accessToken?: string | { accessToken?: string; expiresAt?: number };
            idToken?: string | { idToken?: string };
            refreshToken?: string | { refreshToken?: string };
          }
        );

        if (normalizedTokens.accessToken) {
          const tokenRes = await fetch("/api/auth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: normalizedTokens.accessToken,
              id_token: normalizedTokens.idToken ?? undefined,
              refresh_token: normalizedTokens.refreshToken ?? undefined,
              expires_in: normalizedTokens.expiresIn ?? 3600,
              returnUrl,
            }),
            credentials: "same-origin",
          });

          const tokenData = (await tokenRes.json().catch(() => ({}))) as {
            access_token?: string;
            id_token?: string;
            refresh_token?: string;
          };
          if (tokenRes.ok) {
            setTokensInLocalStorage(
              tokenData.access_token ?? normalizedTokens.accessToken,
              tokenData.id_token ?? normalizedTokens.idToken ?? null,
              tokenData.refresh_token ?? normalizedTokens.refreshToken ?? null
            );
            markCookieSyncCompletedForToken(tokenData.access_token ?? normalizedTokens.accessToken);
          }
        }
        assignPostLoginNavigation(returnUrl);
      } catch (error) {
        authRedirectTriggeredRef.current = false;
        console.warn("Authenticated login flow failed:", error);
      }
    };

    void runAuthenticatedFlow();
  }, [authState, oktaAuth, router, shouldBypassAuthenticatedRedirect]);

  // If we have OAuth callback parameters, show LoginCallback component
  if (hasOAuthParams) {
    return (
      <LoginCallback
        errorComponent={({ error: errorObj }) => {
          console.error("Okta callback error:", errorObj);

          const handleErrorRedirect = () => {
            router.push("/login");
          };

          return (
            <div className={cn("flex w-full flex-col items-center justify-center")}>
              <div className={cn("w-full")}>
                <AuthCard>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                      gap: "25px",
                      padding: "32px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        padding: "32px",
                      }}
                    >
                      <div style={{ marginBottom: "24px" }}>
                        <ErrorMessage message="Authentication failed. Please try again." />
                      </div>
                      <Button onPress={handleErrorRedirect} variant="primary" className="w-full">
                        Return to Login
                      </Button>
                    </div>
                  </div>
                </AuthCard>
              </div>
            </div>
          );
        }}
        loadingElement={
          <div className={cn("flex w-full flex-col items-center justify-center")}>
            <div className={cn("w-full")}>
              <LoadingSkeleton
                variant="spinner"
                message={<span>Validating authentication...</span>}
                size="large"
              />
            </div>
          </div>
        }
      />
    );
  }

  if (!authState) {
    return (
      <div
        className={cn("flex w-full flex-col items-center justify-center")}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading authentication"
      >
        <div className={cn("w-full")}>
          <LoadingSkeleton variant="card" message={`Loading sign-in form...`} />
        </div>
      </div>
    );
  }

  if (authState.isAuthenticated && !shouldBypassAuthenticatedRedirect) {
    return (
      <div
        className={cn("flex w-full flex-col items-center justify-center")}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Redirecting authenticated user"
      >
        <div className={cn("w-full")}>
          <LoadingSkeleton variant="spinner" message={<span>Redirecting...</span>} size="large" />
        </div>
      </div>
    );
  }

  const errorId = error ? "login-error" : undefined;
  const formId = "login-form";

  return (
    <div
      className={cn("flex w-full flex-col items-center justify-center")}
      role="region"
      aria-label="Sign in form"
      aria-live="polite"
      aria-atomic="false"
    >
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          aria-relevant="additions text"
        >
          <ErrorMessage message={error} />
        </div>
      )}
      <div
        id={formId}
        className={cn("w-full")}
        role="form"
        aria-label="Sign in credentials"
        aria-describedby={error ? errorId : undefined}
      >
        <OktaSignInWidget
          key={`${pathname}-${forceRefresh || "default"}`}
          onSuccess={handleSuccess}
          onError={handleError}
          mode="signin"
        />
      </div>
    </div>
  );
};

export default AuthLogin;
