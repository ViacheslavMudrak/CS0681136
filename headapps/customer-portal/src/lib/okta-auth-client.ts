import { clearUserProfile } from "@/lib/user-profile-session-storage";
import { clearOktaTransactionStorage } from "./okta-widget-utils";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { clearServerOktaAndClientAuth } from "./client-auth-sign-out";
import OktaAuth from "@okta/okta-auth-js";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "okta_access_token",
  ID_TOKEN: "okta_id_token",
  REFRESH_TOKEN: "okta_refresh_token",
} as const;

export function setTokensInLocalStorage(
  accessToken: string,
  idToken?: string | null,
  refreshToken?: string | null
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (idToken) localStorage.setItem(STORAGE_KEYS.ID_TOKEN, idToken);
    if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  } catch (e) {
    console.warn("Failed to store tokens in localStorage:", e);
  }
}

export function getAccessTokenFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

export function clearTokensFromLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {}
}

export function clearAllStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    clearUserProfile();
    clearTokensFromLocalStorage();
    sessionStorage.removeItem("okta_id_token");
    sessionStorage.removeItem("okta_access_token");
    localStorage.removeItem("okta_reset_flow");
    sessionStorage.removeItem("okta_reset_email_sent");
    sessionStorage.removeItem("login_return_url");
    sessionStorage.removeItem("okta_fresh_login_session");

    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach((key) => {
      if (key.toLowerCase().includes("okta") || key.toLowerCase().includes("token")) {
        sessionStorage.removeItem(key);
      }
    });

    const localKeys = Object.keys(localStorage);
    localKeys.forEach((key) => {
      if (key.toLowerCase().includes("okta") || key.toLowerCase().includes("token")) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Error clearing storage during logout:", error);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return !!sessionStorage.getItem("okta_id_token");
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("okta_id_token");
    sessionStorage.removeItem("okta_access_token");
  }
}

export function markFreshLoginSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("okta_fresh_login_session", "true");
  }
}

export function isFreshLoginSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("okta_fresh_login_session") === "true";
}

export const oktaUpdateFieldValue = (selector: string, value: string) => {
  const oktaField = document.querySelector(selector) as HTMLInputElement;
  if (oktaField) {
    oktaField.value = value;

    oktaField.dispatchEvent(new Event("input", { bubbles: true }));
    oktaField.dispatchEvent(new Event("change", { bubbles: true }));
    oktaField.dispatchEvent(new Event("blur", { bubbles: true }));
  }
};

export const redirectToLogin = async (router: AppRouterInstance, oktaAuth: OktaAuth) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("okta_forgot_password_flow");
    localStorage.removeItem("okta_forgot_password_email_sent");
    localStorage.removeItem("okta_reset_password_success");
    localStorage.setItem("okta_force_refresh", Date.now().toString());

    await clearServerOktaAndClientAuth(oktaAuth);
    clearOktaTransactionStorage();
  }

  router.push("/login");
};
