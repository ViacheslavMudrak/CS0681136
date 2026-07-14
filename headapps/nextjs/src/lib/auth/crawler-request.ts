import type { NextApiRequest } from 'next';
import type { NextRequest } from 'next/server';

type CrawlerRequest = NextRequest | NextApiRequest;

function getAuthHeader(req: CrawlerRequest): string | null {
  if (typeof req.headers.get === 'function') {
    return req.headers.get('authorization');
  }
  const raw = (req as NextApiRequest).headers['authorization'];
  return Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null);
}

/**
 * Returns true when the request carries valid Sitecore Search crawler credentials.
 * Requires SITECORE_SEARCH_CRAWLER_USERNAME and SITECORE_SEARCH_CRAWLER_PASSWORD to be set.
 */
export function isCrawlerRequest(req: CrawlerRequest): boolean {
  const expectedUsername = process.env.SITECORE_SEARCH_CRAWLER_USERNAME?.trim();
  const expectedPassword = process.env.SITECORE_SEARCH_CRAWLER_PASSWORD?.trim();
  if (!expectedUsername || !expectedPassword) return false;

  const auth = getAuthHeader(req);
  if (!auth?.startsWith('Basic ')) return false;

  const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  const colon = decoded.indexOf(':');
  return (
    decoded.slice(0, colon) === expectedUsername && decoded.slice(colon + 1) === expectedPassword
  );
}
