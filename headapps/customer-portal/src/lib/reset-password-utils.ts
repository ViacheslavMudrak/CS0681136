/**
 * Utility functions for forgot password flow
 * Handles parameter extraction from URL and localStorage
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */

export interface ForgotPasswordParameters {
  otp: string | null;
  state: string | null;
}

/**
 * Expiration time for reset password parameters (10 minutes in milliseconds)
 */
export const RESET_PASSWORD_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Extract forgot password parameters from URL search params
 */
export function getForgotPasswordParamsFromUrl(
  searchParams: URLSearchParams
): ForgotPasswordParameters {
  return {
    // code: searchParams.get("code"),
    // interactionCode: searchParams.get("interaction_code"),
    otp: searchParams.get("otp"),
    state: searchParams.get("state")
  };
}

/**
 * Extract forgot password parameters from localStorage (fallback)
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function getForgotPasswordParamsFromStorage(): ForgotPasswordParameters {
  if (typeof window === "undefined") {
    return { otp: null, state: null };
  }

  return {
    // code: localStorage.getItem("okta_forgot_password_code"),
    // interactionCode: localStorage.getItem(
    //   "okta_forgot_password_interaction_code"
    // ),
    otp: localStorage.getItem("okta_forgot_password_otp"),
    state: localStorage.getItem("okta_forgot_password_state")
  };
}

/**
 * Get effective forgot password parameters (URL first, then localStorage)
 */
export function getEffectiveForgotPasswordParams(
  searchParams: URLSearchParams
): ForgotPasswordParameters {
  const urlParams = getForgotPasswordParamsFromUrl(searchParams);
  const storageParams = getForgotPasswordParamsFromStorage();

  return {
    // code: urlParams.code || storageParams.code,
    // interactionCode: urlParams.interactionCode || storageParams.interactionCode,
    otp: urlParams.otp || storageParams.otp,
    state: urlParams.state || storageParams.state
  };
}

/**
 * Check if we have any forgot password code (code, interaction_code, or otp)
 */
export function hasForgotPasswordCode(
  params: ForgotPasswordParameters
): boolean {
  return !!(params.state || params.otp);
}

/**
 * Store forgot password parameters in localStorage
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function storeForgotPasswordParamsInStorage(
  params: ForgotPasswordParameters
): void {
  if (typeof window === "undefined") return;

  // if (params.code) {
  //   localStorage.setItem("okta_forgot_password_code", params.code);
  // }
  // if (params.interactionCode) {
  //   localStorage.setItem(
  //     "okta_forgot_password_interaction_code",
  //     params.interactionCode
  //   );
  // }
  if (params.otp) {
    localStorage.setItem("okta_forgot_password_otp", params.otp);
  }
  if (params.state) {
    localStorage.setItem("okta_forgot_password_state", params.state);
  }
}

/**
 * Store forgot password parameters in localStorage with timestamp
 * This is used to track when parameters were received for expiration checking
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function storeForgotPasswordParamsWithTimestamp(
  params: ForgotPasswordParameters
): void {
  if (typeof window === "undefined") return;

  // Store parameters
  storeForgotPasswordParamsInStorage(params);

  // Store timestamp when parameters were received
  localStorage.setItem("okta_forgot_password_timestamp", Date.now().toString());
}

/**
 * Get the age of forgot password parameters in milliseconds
 * Returns 0 if no timestamp is stored
 */
export function getForgotPasswordParamsAge(): number {
  if (typeof window === "undefined") return 0;

  const timestamp = localStorage.getItem("okta_forgot_password_timestamp");
  if (!timestamp) {
    return 0;
  }

  const storedTime = parseInt(timestamp, 10);
  if (isNaN(storedTime)) {
    return 0;
  }

  return Date.now() - storedTime;
}

/**
 * Check if forgot password parameters have expired
 * Returns true if parameters are expired or if no timestamp is stored
 */
export function isForgotPasswordParamsExpired(): boolean {
  if (typeof window === "undefined") return false;

  const age = getForgotPasswordParamsAge();

  // If no timestamp stored, consider it expired if we have parameters
  // This handles cases where parameters exist but timestamp wasn't stored
  if (age === 0) {
    const params = getForgotPasswordParamsFromStorage();
    const hasParams = !!(
      // params.code ||
      // params.interactionCode ||
      (params.otp || params.state)
    );
    // If we have parameters but no timestamp, we can't verify expiration
    // Return false to allow the flow to continue (Okta will validate)
    return false;
  }

  return age > RESET_PASSWORD_EXPIRATION_TIME;
}

/**
 * Check if expiration error should be shown (persists after clearing params)
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function shouldShowExpirationError(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("okta_forgot_password_expired") === "true";
}

/**
 * Mark expiration error as shown (persists after clearing params)
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function markExpirationError(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("okta_forgot_password_expired", "true");
}

/**
 * Clear expiration error flag (when starting new reset)
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function clearExpirationError(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("okta_forgot_password_expired");
}

/**
 * Clear forgot password parameters from localStorage
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function clearForgotPasswordParamsFromStorage(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("okta_forgot_password_code");
  localStorage.removeItem("okta_forgot_password_interaction_code");
  localStorage.removeItem("okta_forgot_password_otp");
  localStorage.removeItem("okta_forgot_password_state");
  localStorage.removeItem("okta_forgot_password_flow");
  localStorage.removeItem("okta_forgot_password_email_sent");
  localStorage.removeItem("okta_forgot_password_timestamp");
  // Note: We don't clear "okta_forgot_password_expired" here
  // It needs to persist to show the error message
}
