"use client";

import { API_ROUTES } from "@/lib/apis/api-routes";
import { request } from "@/lib/apis/api-service";
import { clearUserProfile } from "../user-profile-session-storage";

/** Payload for user preferences POST (account/language defaults). */
export interface UserPreferencePayload {
  userEmail: string;
  defaultLanguage: string;
  defaultAccount: string;
  /** 0 = account switch, 1 = language change */
  userPreference: 0 | 1;
}

/**
 * Saves user preferences (default language / default account) to the DXP API.
 * Uses common api-service. Call after account switch (userPreference: 0) or language change (userPreference: 1).
 * Failures are logged but do not throw so UI is not blocked.
 */
export async function saveUserPreferences(
  payload: UserPreferencePayload
): Promise<Record<string, unknown> | null> {
  try {
    const data = await request<Record<string, unknown>>({
      method: "POST",
      path: API_ROUTES.USER_PREFERENCES,
      body: {
        userEmail: payload.userEmail,
        defaultLanguage: payload.defaultLanguage,
        defaultAccount: payload.defaultAccount,
        userPreference: payload.userPreference,
      }
    });
    clearUserProfile();
    return data ?? null;
  } catch (err) {
    console.warn("[user-preference-api] saveUserPreferences failed:", err);
    return null;
  }
}
