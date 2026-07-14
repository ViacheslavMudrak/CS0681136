// =============================================================================
// Oracle OAuth API Client Factory
// =============================================================================
// Provides two factory methods for making authenticated requests to
// ORACLE_OAUTH_API_BASE_URL:
//
//   1. oracleClientWithToken  — Uses an OAuth2 Bearer token obtained via JWT.
//       Automatically refreshes the token on 401.
//
//   2. oracleClientWithServiceToken — Uses an OAuth2 Bearer token obtained via the
//      service client's Client Credentials grant. Automatically refreshes the
//      token on 401.
//
// Both delegate to a shared internal request helper so URL building, headers,
// and error handling remain consistent.
// =============================================================================

import {
  getAccessToken,
  clearTokenCache,
  getAccessTokenForServiceClient,
  clearTokenCacheForServiceClient,
} from './oracle-service-client';
import { getVoyagerSettings } from 'src/lib/voyager/voyager-settings-service';
import { log } from 'src/util/helpers/log-helper';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface OracleRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  /** Query parameters to append to the URL */
  params?: Record<string, string>;
}

interface OracleBasicAuthCredentials {
  employeeId: string;
  employeePassword: string;
}

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const OAUTH_CLIENT_CONFIG = {
  /** Base URL for Oracle OAuth API calls (without trailing slash) */
  baseUrl: process.env.ORACLE_OAUTH_API_BASE_URL || '',
};

// -----------------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------------

/**
 * Build the full URL from `path` (absolute or relative to baseUrl) and
 * optional query parameters.
 *
 * Resolves the base URL from cached Voyager settings (Sitecore) first,
 * falling back to the `ORACLE_OAUTH_API_BASE_URL` environment variable.
 */
async function buildUrl(path: string, params?: Record<string, string>): Promise<string> {
  const voyagerSettings = await getVoyagerSettings();
  const baseUrl = voyagerSettings?.oracleOAuthBaseUrl || OAUTH_CLIENT_CONFIG.baseUrl;
  log('INFO', '[OracleOAuthClient] Using base URL:', OAUTH_CLIENT_CONFIG.baseUrl);

  if (!baseUrl) {
    throw new Error(
      'Oracle OAuth API base URL is not configured. Set ORACLE_OAUTH_API_BASE_URL environment variable or configure voyagerSettings in Sitecore.'
    );
  }

  let url = path.startsWith('http') ? path : `${baseUrl}${path}`;

  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += (url.includes('?') ? '&' : '?') + qs;
  }

  return url;
}

/**
 * Execute a fetch request with the given auth header and options.
 * Throws on non-OK responses with a descriptive error message.
 */
async function executeRequest(
  url: string,
  authHeader: string,
  options: OracleRequestOptions
): Promise<Response> {
  const { method = 'GET', body, headers = {} } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  return fetch(url, fetchOptions);
}

/**
 * Assert that a response is OK; throw with a descriptive message otherwise.
 */
async function assertOk(response: Response): Promise<void> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Oracle OAuth API request failed (${response.status} ${response.statusText}): ${errorText}`
    );
  }
}

// -----------------------------------------------------------------------------
// Factory method 1 — OAuth Bearer token
// -----------------------------------------------------------------------------

/**
 * Make an authenticated request using the OAuth2 Bearer token from the service
 * client. If a 401 is received the token cache is cleared and the request is
 * retried once with a fresh token.
 *
 * @param path      - API path relative to `ORACLE_OAUTH_API_BASE_URL` or an
 *                    absolute URL.
 * @param options   - Fetch options (method, body, extra headers, query params).
 * @param employeeId - Optional employee ID to use in the OAuth token. Defaults to hardcoded value.
 * @returns         The parsed JSON response.
 *
 * @example
 * ```ts
 * const tasks = await oracleClientWithToken<TasksResponse>('/bpm/api/4.0/tasks', {
 *   params: { assignment: 'MY', limit: '100' },
 * }, 'EMP123');
 * ```
 */
export async function oracleClientWithToken<T = unknown>(
  path: string,
  options: OracleRequestOptions = {},
  employeeId?: string
): Promise<T> {
  const url = await buildUrl(path, options.params);

  const accessToken = await getAccessToken(employeeId);
  let response = await executeRequest(url, `Bearer ${accessToken}`, options);

  // On 401, refresh the token and retry once
  if (response.status === 401 || response.status === 403) {
    log(
      'WARNING',
      '[OracleOAuthClient] 401/403 received, refreshing token and retrying...',
      'oracle-oauth-client'
    );
    await clearTokenCache();
    const newToken = await getAccessToken(employeeId);
    response = await executeRequest(url, `Bearer ${newToken}`, options);
  }

  await assertOk(response);
  return response.json() as Promise<T>;
}

// -----------------------------------------------------------------------------
// Factory method 1b — OAuth Bearer token (alternative service client)
// -----------------------------------------------------------------------------

/**
 * Make an authenticated request using the OAuth2 Bearer token from an
 * alternative service client. If a 401 is received the token cache is cleared
 * and the request is retried once with a fresh token.
 *
 * This method uses credentials from ORACLE_CLIENT_ID1, ORACLE_CLIENT_SECRET1,
 * etc., allowing for a different service client than the primary one.
 * Uses the Client Credentials OAuth2 flow (does not support custom employeeId).
 *
 * @param path    - API path relative to `ORACLE_OAUTH_API_BASE_URL` or an
 *                  absolute URL.
 * @param options - Fetch options (method, body, extra headers, query params).
 * @returns       The parsed JSON response.
 *
 * @example
 * ```ts
 * const tasks = await oracleClientWithServiceToken<TasksResponse>('/bpm/api/4.0/tasks', {
 *   params: { assignment: 'MY', limit: '100' },
 * });
 * ```
 */
export async function oracleClientWithServiceToken<T = unknown>(
  path: string,
  options: OracleRequestOptions = {}
): Promise<T> {
  const url = await buildUrl(path, options.params);

  const accessToken = await getAccessTokenForServiceClient();
  let response = await executeRequest(url, `Bearer ${accessToken}`, options);

  // On 401, refresh the token and retry once
  if (response.status === 401 || response.status === 403) {
    log(
      'WARNING',
      '[OracleOAuthClient] 401/403 received with service client, refreshing token and retrying...',
      'oracle-oauth-client'
    );
    await clearTokenCacheForServiceClient();
    const newToken = await getAccessTokenForServiceClient();
    response = await executeRequest(url, `Bearer ${newToken}`, options);
  }

  await assertOk(response);
  return response.json() as Promise<T>;
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { OAUTH_CLIENT_CONFIG };
export type { OracleRequestOptions, OracleBasicAuthCredentials };
