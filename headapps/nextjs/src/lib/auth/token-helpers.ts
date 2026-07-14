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
