import type { UserProfileResponse } from "@/lib/types/user-profile";
import { getCopyrightWithYear } from "@/lib/copyright-utils";

export { getCopyrightWithYear };

export const CUSTOMER_SUPPORT_COMPONENT_NAME = "Customer Support Component";
export const CUSTOMER_SUPPORT_EMPTY_HINT = "Customer Support Component";
export const CUSTOMER_SUPPORT_SECTION_LABEL = "Blocked access contact support";
export const SUPPORT_LINK_FALLBACK_HREF = "#";
export const SUPPORT_LINK_ARIA_LABEL = "Contact customer support in a new tab";
export const RETURN_LINK_ARIA_LABEL = "Return to Intralox website";
export const BACK_SIGN_IN_FALLBACK_LABEL = "Back to Sign In";

/**
 * Resolves a support link from the first parent contact's child accounts.
 * Uses the first available `accountRep.email` as a mailto target; otherwise returns the CMS fallback URL.
 */
export function getSupportHref(
  profile: UserProfileResponse | null | undefined,
  fallbackHref: string = SUPPORT_LINK_FALLBACK_HREF
): string {
  const customerSupportEmail = profile?.customerSupportEmail;
  if (customerSupportEmail) {
    return `mailto:${customerSupportEmail}`;
  }
  return fallbackHref.trim();
}
