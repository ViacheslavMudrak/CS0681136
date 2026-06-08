"use client";

import { request } from "@/lib/apis/api-service";
import { API_ROUTES } from "@/lib/apis/api-routes";

/** Lead web registration payload (matches API route body) */
export interface LeadWebRegistrationPayload {
  email: string;
  authIdentity: string;
  languageCode?: string;
}

/**
 * Submits lead web registration to the API route (which proxies to Intralox).
 * @param payload - Lead registration payload
 * @returns Response from API or null on failure
 */
export async function submitLeadWebRegistration(
  payload: LeadWebRegistrationPayload
): Promise<Record<string, unknown> | null> {
  try {
    const data = await request<Record<string, unknown>>({
      method: "POST",
      path: API_ROUTES.LEADS_WEBREGISTRATION,
      body: payload
    });
    return data ?? null;
  } catch {
    return null;
  }
}

/**
 * After registration success: fetch Okta userinfo with access token, then submit lead web registration.
 * Call this from the client with the access token from the sign-in response.
 * Failures are logged but do not throw; registration success is not blocked.
 */
export async function runPostRegisterApi(payload: LeadWebRegistrationPayload): Promise<void> {
  const browserLanguage =
    typeof navigator !== "undefined"
      ? navigator.languages?.[0] ?? navigator.language ?? "en"
      : "en";

  const result = await submitLeadWebRegistration({
    ...payload,
    languageCode: browserLanguage
  });
  if (!result) {
    console.warn("[register] Lead web registration request failed or returned no data");
  }
}
