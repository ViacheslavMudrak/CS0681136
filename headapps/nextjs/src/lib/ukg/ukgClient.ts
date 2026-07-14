import { getRedisClient } from 'lib/cache/redis';
import type { UkgTokenResponse } from 'ts/ukg';

const UKG_BASE_URL = 'https://ascension-uat.npr.mykronos.com';
// const UKG_BASE_URL = 'https://ascension-trn.npr.mykronos.com';
const TOKEN_CACHE_KEY = 'ukg:access_token';
// Refresh 60 seconds before actual expiry to avoid edge-case failures
const TOKEN_TTL_BUFFER_SECONDS = 60;

/**
 * Authenticate with UKG and return a valid access token.
 * Tokens are cached in Redis; a new token is fetched only when the cache is empty or expired.
 */
async function getAccessToken(baseUrl?: string): Promise<string> {
  const effectiveBaseUrl = baseUrl || UKG_BASE_URL;
  const tokenCacheKey = baseUrl ? `${TOKEN_CACHE_KEY}:${baseUrl}` : TOKEN_CACHE_KEY;
  const redis = await getRedisClient();

  // Check Redis for a cached token
  const cached = await redis.get(tokenCacheKey);
  if (cached) {
    console.log(JSON.stringify({ severity: 'INFO', message: 'Using cached UKG token' }));
    return cached;
  }

  // Fetch a new token from UKG
  const { username, password, clientId, clientSecret } = getCredentials();

  const body = new URLSearchParams({
    username,
    password,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'password',
    auth_chain: 'OAuthLdapService',
  });

  const response = await fetch(`${effectiveBaseUrl}/api/authentication/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`UKG authentication failed (${response.status}): ${errorText}`);
  }

  const data: UkgTokenResponse = await response.json();

  // Cache the token in Redis with TTL
  const ttl = Math.max(data.expires_in - TOKEN_TTL_BUFFER_SECONDS, 30);
  await redis.set(tokenCacheKey, data.access_token, 'EX', ttl);

  return data.access_token;
}

/**
 * Execute an authenticated POST request against the UKG API.
 */
export async function ukgPost<T>(path: string, body: unknown, baseUrl?: string): Promise<T> {
  const effectiveBaseUrl = baseUrl || UKG_BASE_URL;
  const token = await getAccessToken(baseUrl);

  const response = await fetch(`${effectiveBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`UKG API POST request failed (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export async function ukgGet<T>(path: string, baseUrl?: string): Promise<T> {
  const effectiveBaseUrl = baseUrl || UKG_BASE_URL;
  const token = await getAccessToken(baseUrl);

  const response = await fetch(`${effectiveBaseUrl}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`UKG API request failed (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCredentials() {
  const username = process.env.UKG_USERNAME;
  const password = process.env.UKG_PASSWORD;
  const clientId = process.env.UKG_CLIENT_ID;
  const clientSecret = process.env.UKG_CLIENT_SECRET;

  if (!username || !password || !clientId || !clientSecret) {
    throw new Error(
      'Missing UKG credentials. Set UKG_USERNAME, UKG_PASSWORD, UKG_CLIENT_ID, and UKG_CLIENT_SECRET in .env.local'
    );
  }

  return { username, password, clientId, clientSecret };
}
