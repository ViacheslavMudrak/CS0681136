import { PageSecurity_GQL } from '../../util/graphql/queries/getPageSecurity.graphql';
import { log } from 'src/util/helpers/log-helper';

const COMPONENT = 'PageSecurityService';
const CACHE_TTL_MS = process.env.GATEKEEPER_CACHE_TTL_MS
  ? parseInt(process.env.GATEKEEPER_CACHE_TTL_MS, 10)
  : 0;

// In-memory cache — Edge middleware cannot use Redis (node:fs dependency).
// Data is scoped to a single server process; entries are evicted after CACHE_TTL_MS.
const cache = new Map<string, { data: PageSecurityData; expiresAt: number }>();

export type VisibilitySettings = {
  email?: { value?: string };
  disableGroup?: { value?: string };
};

export type AncestorItem = {
  name?: string;
  template?: {
    baseTemplates?: Array<{ id?: string }>;
  };
  visibleBy?: {
    targetItems?: VisibilitySettings[];
  };
  allowAccessRequests?: { value?: string };
};

export type PageSecurityData = {
  page?: {
    item?: {
      visibleBy?: {
        targetItems?: VisibilitySettings[];
      };
      allowAccessRequests?: { value?: string };
      ancestors?: AncestorItem[];
    };
  };
  siteRoot?: {
    item?: {
      site?: {
        visibleBy?: {
          targetItems?: VisibilitySettings[];
        };
        allowAccessRequests?: { value?: string };
      };
    };
  };
};

// ---------------------------------------------------------------------------
// Module-scope constants — evaluated once at startup, not on every request.
// NOTE: clientFactory() from sitecore-client.ts is intentionally NOT used here.
// This service runs in the Next.js Edge runtime (middleware), which restricts
// Node.js APIs. clientFactory pulls in dependencies (SitecoreClient, custom
// services) that are incompatible with the Edge runtime and cause FEAS errors.
// The raw Web Fetch API used below is fully Edge-compatible.
// ---------------------------------------------------------------------------
const BASE_URL =
  process.env.SITECORE_GRAPHQL_ENDPOINT ||
  process.env.NEXT_PUBLIC_SITECORE_GRAPHQL_ENDPOINT ||
  'https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1';

const CONTEXT_ID =
  process.env.SITECORE_EDGE_CONTEXT_ID || process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;

const SITE_NAME = process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'DFD';

const ENDPOINT = CONTEXT_ID ? `${BASE_URL}?sitecoreContextId=${CONTEXT_ID}` : null;

export async function getPagePermissions(
  path: string,
  language: string = 'en'
): Promise<PageSecurityData | null> {
  const cacheKey = `gatekeeper:security:${SITE_NAME}:${path.toLowerCase()}:${language}`;

  // Check in-memory cache first
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    log('INFO', COMPONENT, 'Cache hit', { path, cacheKey });
    return cached.data;
  }
  if (cached) {
    cache.delete(cacheKey);
  }

  if (!ENDPOINT) {
    log('ERROR', COMPONENT, 'Missing Sitecore Edge contextId');
    return null;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: PageSecurity_GQL,
        variables: { site: SITE_NAME, path, language },
      }),
    });

    if (!res.ok) {
      log('ERROR', COMPONENT, 'HTTP Error', { status: res.status, statusText: res.statusText });
      return null;
    }

    const json = await res.json();

    if (json?.errors?.length) {
      log('ERROR', COMPONENT, 'GraphQL Errors', { errors: json.errors });
      return null;
    }

    const data = (json?.data as PageSecurityData) ?? null;

    // Cache the result in memory
    if (data) {
      cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
      log('INFO', COMPONENT, 'Cached security data', { path, cacheKey, ttlMs: CACHE_TTL_MS });
    }

    return data;
  } catch (error) {
    log('ERROR', COMPONENT, 'Critical Fetch Error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
