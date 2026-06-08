import { resolveDocumentRequestContact } from "@/lib/document-request-payload";
import type { UserProfileResponse } from "@/lib/types/user-profile";

/**
 * Joins CMS greeting prefix with the user’s first name (e.g. “Welcome, Bob”).
 * Trims a trailing comma from the prefix when the first name is missing.
 */
export function joinUserGreetingPrefixAndFirstName(prefix: string, firstName: string): string {
  const p = prefix.trim();
  const n = firstName.trim();
  if (!p && !n) {
    return "";
  }
  if (!n) {
    return p.replace(/,\s*$/, "").trim();
  }
  if (!p) {
    return n;
  }
  if (p.endsWith(",")) {
    return `${p} ${n}`;
  }
  return `${p}, ${n}`;
}

function normalizeProfileNamePart(value: string | undefined): string {
  const trimmed = String(value ?? "").trim();
  return trimmed === "." ? "" : trimmed;
}

/** Display name from the first DXP `parentContact` row (`firstName` + `lastName`). */
export function resolveParentContactDisplayName(
  profile: UserProfileResponse | null | undefined
): string {
  const parent = profile?.parentContact?.[0];
  if (!parent) return "";

  return [parent.firstName, parent.lastName]
    .map(normalizeProfileNamePart)
    .filter(Boolean)
    .join(" ")
    .trim();
}

/** First name from the first DXP `parentContact` row for header greeting. */
export function resolveUserInfoFirstName(
  profile: UserProfileResponse | null | undefined
): string {
  return normalizeProfileNamePart(profile?.parentContact?.[0]?.firstName);
}

/** Personal info for View My Profile: parent contact name + profile/Okta email. */
export function resolveViewMyProfilePersonalInfo(params: {
  profile: UserProfileResponse | null;
  oktaClaims: Record<string, unknown> | undefined;
}): { fullName: string; email: string } {
  return {
    fullName: resolveParentContactDisplayName(params.profile),
    email: resolveDocumentRequestContact(params.profile, params.oktaClaims).email,
  };
}
