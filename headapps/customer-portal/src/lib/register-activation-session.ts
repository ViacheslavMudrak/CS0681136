"use client";

import type { OktaAuth } from "@okta/okta-auth-js";

import { runPostRegisterApi } from "@/lib/apis/register-apis";
import { resolvePostLoginDestination } from "@/lib/auth-utils";
import { setTokensInLocalStorage } from "@/lib/okta-auth-client";

const normalizeAccessTokenString = (raw: unknown): string | undefined => {
  if (typeof raw === "string") {
    return raw;
  }
  if (raw && typeof raw === "object") {
    const o = raw as { accessToken?: string; value?: string };
    if (typeof o.accessToken === "string") {
      return o.accessToken;
    }
    if (typeof o.value === "string") {
      return o.value;
    }
  }
  return undefined;
};

const normalizeIdTokenString = (raw: unknown): string | undefined => {
  if (typeof raw === "string") {
    return raw;
  }
  if (raw && typeof raw === "object") {
    const o = raw as { idToken?: string };
    if (typeof o.idToken === "string") {
      return o.idToken;
    }
  }
  return undefined;
};

const getEmailFromIdTokenLike = (raw: unknown): string | undefined => {
  if (raw && typeof raw === "object" && "claims" in raw) {
    const claims = (raw as { claims?: { email?: string } }).claims;
    return typeof claims?.email === "string" ? claims.email : undefined;
  }
  return undefined;
};

const getIdxTokensObject = (idxTransaction: unknown): Record<string, unknown> | null => {
  if (!idxTransaction || typeof idxTransaction !== "object") {
    return null;
  }
  const tokens = (idxTransaction as { tokens?: unknown }).tokens;
  if (!tokens || typeof tokens !== "object") {
    return null;
  }
  return tokens as Record<string, unknown>;
};

/**
 * After IDX email verification succeeds for registration: submit lead web registration and
 * persist session (httpOnly cookies + localStorage) using the same pattern as password login.
 *
 * @param oktaAuth - Same singleton used for IDX on `/authorization/verify`
 * @param idxTransaction - Optional IDX result from `handleEmailVerifyCallback` / `proceed` (carries `tokens` when SUCCESS)
 */
export const completeRegisterActivationSession = async (
  oktaAuth: OktaAuth,
  idxTransaction?: unknown
): Promise<void> => {
  const tm = oktaAuth.tokenManager;
  const idxTokens = getIdxTokensObject(idxTransaction);

  if (idxTokens && typeof tm.setTokens === "function") {
    try {
      await tm.setTokens(idxTokens as never);
    } catch (err) {
      console.warn("[register-activation] tokenManager.setTokens failed:", err);
    }
  }

  let accessRaw: unknown;
  let idRaw: unknown;
  let refreshRaw: unknown;

  try {
    accessRaw = await tm.get("accessToken");
    idRaw = await tm.get("idToken");
    refreshRaw = await tm.get("refreshToken");
  } catch (err) {
    console.warn("[register-activation] Failed to read tokens from tokenManager:", err);
  }

  let accessToken = normalizeAccessTokenString(accessRaw);
  let idToken = normalizeIdTokenString(idRaw);

  let refreshToken =
    typeof refreshRaw === "string"
      ? refreshRaw
      : refreshRaw && typeof refreshRaw === "object"
        ? (refreshRaw as { refreshToken?: string }).refreshToken
        : undefined;

  // IDX often delivers tokens only on the transaction object (same shape as AuthLogin raw `tokens`)
  if (!accessToken && idxTokens) {
    const rawTokens = idxTokens as {
      accessToken?: string | { accessToken?: string };
      idToken?: unknown;
      refreshToken?: string;
      expiresAt?: number;
    };
    accessRaw = rawTokens.accessToken;
    idRaw = rawTokens.idToken;
    refreshRaw = rawTokens.refreshToken;
    accessToken = normalizeAccessTokenString(accessRaw);
    idToken = normalizeIdTokenString(idRaw) ?? idToken;
    refreshToken =
      typeof refreshRaw === "string"
        ? refreshRaw
        : refreshRaw && typeof refreshRaw === "object"
          ? (refreshRaw as { refreshToken?: string }).refreshToken
          : refreshToken;
  }

  let email = getEmailFromIdTokenLike(idRaw);
  if (!email && typeof oktaAuth.getUser === "function") {
    try {
      const user = await oktaAuth.getUser();
      email = user?.email;
    } catch (e) {
      console.log(`Error reading okta user`, e);
    }
  }

  if (!accessToken) {
    console.warn(
      "[register-activation] No access token after email verification; skipping lead API and session persistence."
    );
    return;
  }

  try {
    await runPostRegisterApi({ email: email ?? "", authIdentity: accessToken });
  } catch (err) {
    console.warn("[register-activation] Post-register API failed:", err);
  }

  let returnUrl: string;
  try {
    returnUrl = await resolvePostLoginDestination({
      userEmail: email,
      includeStoredReturnUrl: true,
      clearStoredReturnUrl: true,
    });
  } catch (err) {
    console.warn("[register-activation] resolvePostLoginDestination failed, using /:", err);
    returnUrl = "/";
  }

  const expiresAtFromIdx =
    idxTokens && typeof idxTokens === "object" && "expiresAt" in idxTokens
      ? (idxTokens as { expiresAt?: number }).expiresAt
      : undefined;

  const expiresAt =
    accessRaw && typeof accessRaw === "object" && "expiresAt" in accessRaw
      ? (accessRaw as { expiresAt?: number }).expiresAt
      : expiresAtFromIdx;

  const expiresIn =
    expiresAt != null ? Math.max(0, Math.floor(expiresAt - Date.now() / 1000)) : 3600;

  try {
    const res = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        id_token: idToken ?? undefined,
        refresh_token: typeof refreshToken === "string" ? refreshToken : undefined,
        expires_in: expiresIn,
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
          accessToken,
          idToken ?? null,
          typeof refreshToken === "string" ? refreshToken : null
        );
      }
    } else {
      console.warn("[register-activation] /api/auth/token returned non-OK status:", res.status);
    }
  } catch (err) {
    console.warn("[register-activation] Failed to persist session via /api/auth/token:", err);
  }

  try {
    oktaAuth.authStateManager?.updateAuthState();
  } catch (e) {
    console.log("Error update AuthState", e);
  }
};
