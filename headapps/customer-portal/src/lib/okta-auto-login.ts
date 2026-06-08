/**
 * Utility functions for handling auto-login after password reset success
 */

export interface ResetPasswordSuccessData {
  email?: string | null;
  sessionToken?: string | null;
  stateHandle?: string | null;
  interactionHandle?: string | null;
  tokens?: any;
  timestamp?: number;
}

const STORAGE_KEY = "okta_reset_password_success_data";
const DATA_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Get stored reset password success data
 */
export function getResetPasswordSuccessData(): ResetPasswordSuccessData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: ResetPasswordSuccessData = JSON.parse(stored);

    // Check if data has expired
    if (data.timestamp && Date.now() - data.timestamp > DATA_EXPIRY_MS) {
      clearResetPasswordSuccessData();
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to parse reset password success data:", error);
    clearResetPasswordSuccessData();
    return null;
  }
}

/**
 * Clear stored reset password success data
 */
export function clearResetPasswordSuccessData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Check if stored data has tokens or session info for auto-login
 */
export function hasAutoLoginData(): boolean {
  const data = getResetPasswordSuccessData();
  return !!(
    data &&
    (data.tokens ||
      data.sessionToken ||
      data.stateHandle ||
      data.interactionHandle)
  );
}

/**
 * Get email from stored reset password success data
 */
export function getStoredEmail(): string | null {
  const data = getResetPasswordSuccessData();
  return data?.email || null;
}

/**
 * Store email in sessionStorage for pre-filling login form
 * This is used when we only have email (no tokens/session)
 */
export function storeEmailForPrefill(email: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("okta_reset_password_email", email);
  }
}

/**
 * Get email from sessionStorage for pre-filling
 */
export function getEmailForPrefill(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return sessionStorage.getItem("okta_reset_password_email");
}

/**
 * Clear email pre-fill data
 */
export function clearEmailPrefill(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("okta_reset_password_email");
  }
}
