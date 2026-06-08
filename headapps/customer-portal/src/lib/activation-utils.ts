/**
 * Utility functions for account activation flow
 * Handles parameter extraction from URL and localStorage
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */

export interface ActivationParameters {
  // code: string | null;
  // interactionCode: string | null;
  otp: string | null;
  state: string | null;
}

/**
 * Expiration time for activation parameters (10 minutes in milliseconds)
 */
export const ACTIVATION_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Extract activation parameters from URL search params
 */
export function getActivationParamsFromUrl(
  searchParams: URLSearchParams
): ActivationParameters {
  return {
    // code: searchParams.get("code"),
    // interactionCode: searchParams.get("interaction_code"),
    otp: searchParams.get("otp"),
    state: searchParams.get("state")
  };
}

/**
 * Extract activation parameters from localStorage (fallback)
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function getActivationParamsFromStorage(): ActivationParameters {
  if (typeof window === "undefined") {
    return { otp: null, state: null };
  }

  return {
    // code: localStorage.getItem("okta_activation_code"),
    // interactionCode: localStorage.getItem("okta_activation_interaction_code"),
    otp: localStorage.getItem("okta_activation_otp"),
    state: localStorage.getItem("okta_activation_state")
  };
}

/**
 * Get effective activation parameters (URL first, then localStorage)
 */
export function getEffectiveActivationParams(
  searchParams: URLSearchParams
): ActivationParameters {
  const urlParams = getActivationParamsFromUrl(searchParams);
  const storageParams = getActivationParamsFromStorage();

  return {
    // code: urlParams.code || storageParams.code,
    // interactionCode: urlParams.interactionCode || storageParams.interactionCode,
    otp: urlParams.otp || storageParams.otp,
    state: urlParams.state || storageParams.state
  };
}

/**
 * Check if we have any activation code (code, interaction_code, or otp)
 */
export function hasActivationCode(params: ActivationParameters): boolean {
  return !!params.otp;
}

/**
 * Store activation parameters in localStorage
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function storeActivationParamsInStorage(
  params: ActivationParameters
): void {
  if (typeof window === "undefined") return;

  // if (params.code) {
  //   localStorage.setItem("okta_activation_code", params.code);
  // }
  // if (params.interactionCode) {
  //   localStorage.setItem(
  //     "okta_activation_interaction_code",
  //     params.interactionCode
  //   );
  // }
  if (params.otp) {
    localStorage.setItem("okta_activation_otp", params.otp);
  }
  if (params.state) {
    localStorage.setItem("okta_activation_state", params.state);
  }
}

/**
 * Store activation parameters in localStorage with timestamp
 * This is used to track when parameters were received for expiration checking
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function storeActivationParamsWithTimestamp(
  params: ActivationParameters
): void {
  if (typeof window === "undefined") return;

  // Store parameters
  storeActivationParamsInStorage(params);

  // Store timestamp when parameters were received
  localStorage.setItem("okta_activation_timestamp", Date.now().toString());
}

/**
 * Get the age of activation parameters in milliseconds
 * Returns 0 if no timestamp is stored
 */
export function getActivationParamsAge(): number {
  if (typeof window === "undefined") return 0;

  const timestamp = localStorage.getItem("okta_activation_timestamp");
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
 * Check if activation parameters have expired
 * Returns true if parameters are expired or if no timestamp is stored
 */
export function isActivationParamsExpired(): boolean {
  if (typeof window === "undefined") return false;

  const age = getActivationParamsAge();

  // If no timestamp stored, consider it expired if we have parameters
  // This handles cases where parameters exist but timestamp wasn't stored
  if (age === 0) {
    const params = getActivationParamsFromStorage();
    const hasParams = !!(
      // params.code ||
      // params.interactionCode ||
      (params.otp || params.state)
    );
    // If we have parameters but no timestamp, we can't verify expiration
    // Return false to allow the flow to continue (Okta will validate)
    return false;
  }

  return age > ACTIVATION_EXPIRATION_TIME;
}

/**
 * Clear activation parameters from localStorage
 * Uses localStorage instead of sessionStorage to support cross-tab functionality
 */
export function clearActivationParamsFromStorage(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("okta_activation_code");
  localStorage.removeItem("okta_activation_interaction_code");
  localStorage.removeItem("okta_activation_otp");
  localStorage.removeItem("okta_activation_state");
  localStorage.removeItem("okta_activation_timestamp");
}

/**
 * Build login URL with preserved activation parameters
 */
export function buildRegisterUrlWithActivationParams(
  params: ActivationParameters
): string {
  const loginUrl = new URL("/register", window.location.origin);

  // if (params.code) loginUrl.searchParams.set("code", params.code);
  // if (params.interactionCode)
  //   loginUrl.searchParams.set("interaction_code", params.interactionCode);
  if (params.otp) loginUrl.searchParams.set("otp", params.otp);
  if (params.state) loginUrl.searchParams.set("state", params.state);

  const isExpired = isActivationParamsExpired();
  if (isExpired) {
    loginUrl.searchParams.set("expired", "true");
  }

  return loginUrl.pathname + loginUrl.search;
}
