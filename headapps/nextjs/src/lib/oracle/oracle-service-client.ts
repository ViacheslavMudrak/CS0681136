// =============================================================================
// Oracle Cloud REST API — OAuth2 Token Management
// =============================================================================
// Uses an OAuth2 Client Credentials grant to authenticate with Oracle Identity
// Cloud Service (IDCS) and caches the access token in Redis.
// =============================================================================

import jwt from 'jsonwebtoken';
import { getRedisClient } from 'src/lib/cache/redis';
import { getVoyagerSettings } from 'src/lib/voyager/voyager-settings-service';
import { log } from 'src/util/helpers/log-helper';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface OracleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

// -----------------------------------------------------------------------------
// Configuration
//
// NOTE: Some Oracle settings are stored in the Sitecore Voyager settings item:
// - oracleTokenUrl: Token endpoint URL (falls back to ORACLE_TOKEN_URL env var)
// - oracleScope: OAuth2 scope (falls back to ORACLE_SCOPE env var)
//
// The following settings are managed via environment variables only:
// - ORACLE_CLIENT_ID: OAuth2 client identifier
// - ORACLE_CLIENT_SECRET: OAuth2 client secret
//
// -----------------------------------------------------------------------------
const ORACLE_CONFIG = {
  clientId: process.env.ORACLE_CLIENT_ID || '',
  clientSecret: process.env.ORACLE_CLIENT_SECRET || '',
  thumbprint: process.env.ORACLE_CLIENT_THUMBPRINT || '',
  privateKey: process.env.ORACLE_PRIVATE_KEY || '',
};

// Buffer in seconds — refresh the token 60 seconds before it actually expires
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

// -----------------------------------------------------------------------------
// Token management
// -----------------------------------------------------------------------------

/**
 * Build a cache key for an employee-specific token.
 * Format: oracle:token:{employeeId}
 */
function getTokenCacheKey(employeeId?: string): string {
  return `oracle:token:${employeeId || 'default'}`;
}

/**
 * Authenticate with Oracle IDCS using the OAuth2 Client Credentials grant.
 * Returns a fresh access token and caches it in Redis.
 *
 * @param employeeId - Optional employee ID to use as the JWT subject (sub). Falls back to default if not provided.
 */
async function authenticate(employeeId?: string): Promise<string> {
  const { clientId, clientSecret, thumbprint, privateKey } = ORACLE_CONFIG;

  if (!clientId || !clientSecret || !thumbprint || !privateKey) {
    log(
      'ERROR',
      'Oracle OAuth credentials are not configured. Set ORACLE_CLIENT_ID, ORACLE_CLIENT_SECRET, ORACLE_CLIENT_THUMBPRINT, and ORACLE_PRIVATE_KEY environment variables.',
      'oracle-service-client'
    );
    throw new Error(
      'Oracle OAuth credentials are not configured. Set ORACLE_CLIENT_ID, ORACLE_CLIENT_SECRET, ORACLE_CLIENT_THUMBPRINT, and ORACLE_PRIVATE_KEY environment variables.'
    );
  }

  const voyagerSettings = await getVoyagerSettings();
  const tokenUrl = voyagerSettings?.oracleTokenUrl;
  const scope = voyagerSettings?.oracleScope;
  const jwtAudience = voyagerSettings?.oracleJWTAudience;

  if (!tokenUrl || !scope || !jwtAudience) {
    log(
      'ERROR',
      'Oracle settings are not configured. Configure voyagerSettings in Sitecore.',
      'oracle-service-client'
    );
    throw new Error('Oracle settings are not configured. Configure voyagerSettings in Sitecore.');
  }

  const now = Math.floor(Date.now() / 1000);
  const headers = {
    x5t: thumbprint,
    typ: 'JWT',
    alg: 'RS256',
  };
  const jwtExpiry = 60 * 60;
  const payload = {
    sub: employeeId,
    aud: jwtAudience,
    iss: clientId,
    exp: now - 60 + jwtExpiry,
    iat: now - 60,
  };

  log('INFO', '[Oracle] Generating JWT assertion for employee ID:', employeeId || 'default', {
    payload: payload,
  });

  const assertion = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    header: headers,
  });

  if (assertion) {
    log('INFO', '[Oracle] Generating JWT assertion for employee ID:', employeeId || 'default', {
      assertion: assertion,
    });

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
      scope: scope,
    }).toString();

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      log(
        'ERROR',
        `Oracle OAuth token request failed (${response.status}): ${errorText}`,
        'oracle-service-client'
      );
      throw new Error(`Oracle OAuth token request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as OracleTokenResponse;

    // Cache the token in Redis with TTL derived from expires_in minus buffer
    const ttlSeconds = Math.max(data.expires_in - TOKEN_EXPIRY_BUFFER_SECONDS, 0);
    const cacheKey = getTokenCacheKey(employeeId);
    const redis = await getRedisClient();

    try {
      await redis.set(
        cacheKey,
        JSON.stringify({ accessToken: data.access_token }),
        'EX',
        ttlSeconds
      );
      log(
        'INFO',
        `[Oracle] Service client access token cached for user ${employeeId || 'default'}, expires in ${data.expires_in} seconds`,
        'oracle-service-client'
      );
    } catch (error) {
      log(
        'WARNING',
        `Failed to cache token in Redis for user ${employeeId || 'default'}`,
        'oracle-service-client',
        { error: error instanceof Error ? error.message : String(error) }
      );
      // Continue without caching; token is still usable
    }

    return data.access_token;
  } else {
    log(
      'ERROR',
      'Failed to create JWT assertion for Oracle OAuth authentication.',
      'oracle-service-client'
    );
    throw new Error('Failed to create JWT assertion for Oracle OAuth authentication.');
  }
}

/**
 * Authenticate with Oracle IDCS using an alternative service client.
 * Uses credentials from _1 suffixed environment variables.
 * Returns a fresh access token and caches it in Redis.
 * Note: Uses Client Credentials flow, not JWT assertion.
 */
async function authenticateWithServiceClient(): Promise<string> {
  const { clientId, clientSecret } = ORACLE_CONFIG;

  if (!clientId || !clientSecret) {
    log(
      'ERROR',
      'Alternative Oracle service client credentials are not configured. Set ORACLE_CLIENT_ID and ORACLE_CLIENT_SECRET environment variables, or use primary client configuration as fallback.',
      'oracle-service-client'
    );
    throw new Error(
      'Alternative Oracle service client credentials are not configured. Set ORACLE_CLIENT_ID and ORACLE_CLIENT_SECRET environment variables, or use primary client configuration as fallback.'
    );
  }

  const voyagerSettings = await getVoyagerSettings();
  const tokenUrl = voyagerSettings?.oracleTokenUrl;
  const scope = voyagerSettings?.oracleScope;

  if (!tokenUrl || !scope) {
    log(
      'ERROR',
      'Oracle settings are not configured. Configure voyagerSettings in Sitecore.',
      'oracle-service-client'
    );
    throw new Error('Oracle settings are not configured. Configure voyagerSettings in Sitecore.');
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    log(
      'ERROR',
      `Oracle OAuth token request for service client failed (${response.status}): ${errorText}`,
      'oracle-service-client'
    );
    throw new Error(`Oracle OAuth token request failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OracleTokenResponse;

  // Cache the token in Redis with TTL derived from expires_in minus buffer
  const ttlSeconds = Math.max(data.expires_in - TOKEN_EXPIRY_BUFFER_SECONDS, 0);
  const cacheKey = 'oracle:token:service-client';
  const redis = await getRedisClient();

  try {
    await redis.set(cacheKey, JSON.stringify({ accessToken: data.access_token }), 'EX', ttlSeconds);
    log(
      'INFO',
      '[Oracle] Service client access token cached, expires in',
      'oracle-service-client',
      {
        ExpiresIn: data.expires_in,
      }
    );
  } catch (error) {
    log('WARNING', `Failed to cache service client token in Redis`, 'oracle-service-client', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Continue without caching; token is still usable
  }

  return data.access_token;
}

/**
 * Returns a valid access token, refreshing it automatically if expired or
 * about to expire. Checks Redis cache first, then authenticates if not cached.
 *
 * @param employeeId - Optional employee ID to use when requesting a new token.
 */
async function getAccessToken(employeeId?: string): Promise<string> {
  const cacheKey = getTokenCacheKey(employeeId);
  const redis = await getRedisClient();

  try {
    // Check Redis cache first
    const cachedToken = await redis.get(cacheKey);
    if (cachedToken) {
      const parsed = JSON.parse(cachedToken);
      return parsed.accessToken;
    }
  } catch (error) {
    log('WARNING', `Redis cache miss or error for key ${cacheKey}`, 'oracle-service-client', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Degrade to cache miss, continue to authenticate
  }

  return authenticate(employeeId);
}

/**
 * Returns a valid access token for the alternative service client, refreshing
 * it automatically if expired or about to expire.
 * Uses the Client Credentials OAuth2 flow. Checks Redis cache first.
 */
async function getAccessTokenForServiceClient(): Promise<string> {
  const cacheKey = 'oracle:token:service-client';
  const redis = await getRedisClient();

  try {
    // Check Redis cache first
    const cachedToken = await redis.get(cacheKey);
    if (cachedToken) {
      const parsed = JSON.parse(cachedToken);
      return parsed.accessToken;
    }
  } catch (error) {
    log('WARNING', `Redis cache miss or error for service client token`, 'oracle-service-client', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Degrade to cache miss, continue to authenticate
  }

  return authenticateWithServiceClient();
}

/**
 * Force-clear the cached token (e.g. on a 401 response).
 * This clears the default employee token from Redis.
 */
async function clearTokenCache(): Promise<void> {
  const cacheKey = getTokenCacheKey();
  const redis = await getRedisClient();

  try {
    await redis.del(cacheKey);
  } catch (error) {
    log('WARNING', `Failed to clear token cache for default user`, 'oracle-service-client', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Force-clear the cached token for the alternative service client
 * (e.g. on a 401 response).
 */
async function clearTokenCacheForServiceClient(): Promise<void> {
  const cacheKey = 'oracle:token:service-client';
  const redis = await getRedisClient();

  try {
    await redis.del(cacheKey);
  } catch (error) {
    log('WARNING', `Failed to clear service client token cache`, 'oracle-service-client', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export {
  authenticate,
  getAccessToken,
  clearTokenCache,
  authenticateWithServiceClient,
  getAccessTokenForServiceClient,
  clearTokenCacheForServiceClient,
};
export type { OracleTokenResponse };
