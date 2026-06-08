import { OktaAuth } from "@okta/okta-auth-js";
import { getOktaAuthConfig } from "./okta-config";

/**
 * OktaAuth instance for use with Okta Sign-In Widget
 * Created as a singleton to prevent multiple instances
 */
let oktaAuthInstance: OktaAuth | null = null;

export function getOktaAuth(): OktaAuth {
  if (!oktaAuthInstance) {
    const config = getOktaAuthConfig();
    oktaAuthInstance = new OktaAuth(config);
  }
  return oktaAuthInstance;
}

// Export as default for convenience
export const oktaAuth = typeof window !== "undefined" ? getOktaAuth() : null;

