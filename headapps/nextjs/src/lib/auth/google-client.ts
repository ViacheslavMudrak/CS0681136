import { OAuth2Client, JWT } from 'googleapis-common';

// ============================================================================
// Types
// ============================================================================

/** Google Service Account JSON key structure */
export interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/** Options for creating a service account client */
export interface ServiceAccountClientOptions {
  /** Required scopes for the service account */
  scopes: string[];
  /** Override the service account key JSON (defaults to GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY env var) */
  serviceAccountKey?: ServiceAccountKey | string;
  /** Override the impersonate admin email (defaults to GOOGLE_IMPERSONATE_ADMIN_EMAIL env var) */
  impersonateEmail?: string;
}

// ============================================================================
// OAuth2 Client (User Token)
// ============================================================================

/**
 * Creates and configures a Google OAuth2 client
 * @param accessToken - The user's access token
 * @param refreshToken - The user's refresh token (optional)
 * @returns Configured OAuth2Client instance
 */
export function getGoogleClient(accessToken: string, refreshToken?: string): OAuth2Client {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );

  // Set credentials on the client
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Add event listener to handle token refresh
  oauth2Client.on('tokens', (tokens) => {
    console.log('New tokens received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expiry_date,
    });
  });

  return oauth2Client;
}

/**
 * Refreshes an expired access token using the refresh token
 * @param refreshToken - The user's refresh token
 * @returns New access token and expiry time
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  accessTokenExpires: number;
  refreshToken: string;
}> {
  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    // Request new access token
    const { credentials } = await oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token!,
      accessTokenExpires: credentials.expiry_date!,
      // Google may return a new refresh token, otherwise keep the old one
      refreshToken: credentials.refresh_token || refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('RefreshAccessTokenError');
  }
}

/**
 * Checks if an access token is expired
 * @param expiresAt - Token expiry timestamp
 * @returns True if token is expired or will expire in the next 5 minutes
 */
export function isTokenExpired(expiresAt: number): boolean {
  // Add 5 minute buffer before actual expiry
  const bufferTime = 5 * 60 * 1000;
  return Date.now() >= expiresAt - bufferTime;
}

// ============================================================================
// Service Account Client (Domain-Wide Delegation)
// ============================================================================

/**
 * Creates a JWT client using service account credentials with domain-wide delegation.
 * The service account impersonates the admin user for accessing Google Workspace APIs.
 *
 * @param options - Configuration options including scopes and optional overrides
 * @returns Configured JWT client instance
 *
 * @example
 * ```typescript
 * const jwtClient = getServiceAccountClient({
 *   scopes: ['https://www.googleapis.com/auth/admin.directory.group.readonly'],
 * });
 *
 * const directoryClient = admin({ version: 'directory_v1', auth: jwtClient });
 * ```
 */
export function getServiceAccountClient(options: ServiceAccountClientOptions): JWT {
  const { scopes, serviceAccountKey, impersonateEmail } = options;

  // Parse service account key
  let keyData: ServiceAccountKey;

  if (serviceAccountKey) {
    // Use provided key (either object or JSON string)
    if (typeof serviceAccountKey === 'string') {
      keyData = JSON.parse(serviceAccountKey);
    } else {
      keyData = serviceAccountKey;
    }
  } else {
    // Fall back to environment variable
    const envKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    if (!envKey) {
      throw new Error(
        'Service account configuration missing. Required: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (JSON string)'
      );
    }
    keyData = JSON.parse(envKey);
  }

  // Get impersonate email
  const subject = impersonateEmail || process.env.GOOGLE_IMPERSONATE_ADMIN_EMAIL;
  if (!subject) {
    throw new Error(
      'Impersonate email missing. Required: GOOGLE_IMPERSONATE_ADMIN_EMAIL or pass impersonateEmail option'
    );
  }

  if (!scopes || scopes.length === 0) {
    throw new Error('At least one scope is required for service account client');
  }

  // Ensure private key has proper line breaks
  const privateKey = keyData.private_key.replace(/\\n/g, '\n');

  const jwtClient = new JWT({
    email: keyData.client_email,
    key: privateKey,
    scopes,
    subject,
  });

  return jwtClient;
}
