"use client";

import type { UserProfileResponse } from "@/lib/types/user-profile";
import { request } from "@/lib/apis/api-service";
import { API_ROUTES } from "@/lib/apis/api-routes";

export interface FetchUserProfileOptions {
  /** Email passed as a query param when provided (e.g. profile lookup). */
  email?: string;
}

/**
* Fetches user profile by calling the external API URL via the common api-service.
* Requires BASE_API_URL to be set.
* @returns Parsed `UserProfileResponse` from the API
* @throws Error when base API URL is not set, the request fails, or the response is invalid
*/
export async function fetchUserProfile(
  options?: FetchUserProfileOptions
): Promise<UserProfileResponse> {
  const params =
    options?.email != null && options.email !== "" ? { email: options.email } : undefined;

  return request<UserProfileResponse>({
    method: "GET",
    path: API_ROUTES.USERS,
    params,
  });
}