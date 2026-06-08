import { clearOrderManagementFiltersStorage } from "@/lib/order-management-session-storage";
import type { UserProfileResponse } from "@/lib/types/user-profile";

/** sessionStorage key for cached user profile (single JSON object: `UserProfileResponse`). */
export const USER_PROFILE_SESSION_KEY = "cp_user_profile_v1";

type StoredUserProfilePayload = {
  profile: UserProfileResponse;
  /** Normalized email that was used when fetching this profile cache entry. */
  forEmail?: string;
};

function normalizeEmail(email?: string | null): string {
  return email?.trim().toLowerCase() ?? "";
}

/**
 * Persist profile JSON in sessionStorage.
 * Stores fetch email metadata to avoid false cache misses when API `userEmail` differs.
 */
export function storeUserProfile(profile: UserProfileResponse, forEmail?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredUserProfilePayload = {
      profile,
      forEmail: normalizeEmail(forEmail),
    };
    sessionStorage.setItem(USER_PROFILE_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // Quota or private mode
  }
}

/**
 * Read cached profile when present and, if `forEmail` is given, it matches `userPreference.userEmail` on the profile.
 */
export function getStoredUserProfile(forEmail?: string | null): UserProfileResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_PROFILE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfileResponse | StoredUserProfilePayload;
    const hasWrappedPayload =
      parsed &&
      typeof parsed === "object" &&
      "profile" in parsed &&
      parsed.profile &&
      typeof parsed.profile === "object";

    const profile = hasWrappedPayload
      ? (parsed as StoredUserProfilePayload).profile
      : (parsed as UserProfileResponse);

    const cachedForEmail = hasWrappedPayload
      ? normalizeEmail((parsed as StoredUserProfilePayload).forEmail)
      : "";

    const requested = normalizeEmail(forEmail);
    if (!profile || typeof profile !== "object") return null;

    if (requested && cachedForEmail && requested !== cachedForEmail) {
      return null;
    }

    return profile;
  } catch {
    return null;
  }
}

/** Remove cached profile (call on logout and when clearing user session). */
export function clearUserProfile(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(USER_PROFILE_SESSION_KEY);
  } catch {
    // ignore
  }
  clearOrderManagementFiltersStorage();
}
