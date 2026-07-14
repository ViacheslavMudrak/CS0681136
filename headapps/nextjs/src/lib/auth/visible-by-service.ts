import { clientFactory } from 'lib/sitecore-client';
import { getRedisClient } from 'lib/cache/redis';
import { GetVisibleByGroupEmails_GQL } from 'src/util/graphql/queries/getVisibleByGroupEmails.graphql';
import { log } from 'src/util/helpers/log-helper';

const COMPONENT = 'VisibleByService';
const CACHE_KEY = 'auth:visible-by-emails';
const CACHE_TTL_SECONDS = 60 * 60 * 1; // 1 hour

type VisibleByQueryResult = {
  search: {
    pageInfo: { endCursor: string; hasNext: boolean };
    results: Array<{
      email?: { value?: string };
      disableGroup?: { value?: string };
    }>;
  };
};

/**
 * Returns all enabled Visible By Item emails from Sitecore, Redis-cached for 1 hour.
 * On cache miss, paginates through all items (50/page) via Sitecore Edge GraphQL.
 * Returns an empty array on error so callers degrade gracefully.
 */
export async function getVisibleByEmails(): Promise<string[]> {
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached) as string[];

    const emails: string[] = [];
    let cursor: string | undefined;
    let hasNext = true;

    while (hasNext) {
      const data = await clientFactory().request<VisibleByQueryResult>(
        GetVisibleByGroupEmails_GQL,
        { after: cursor }
      );
      const page = data?.search;

      for (const item of page?.results ?? []) {
        if (item.disableGroup?.value === '1') continue;
        const email = item.email?.value?.toLowerCase().trim();
        if (email) emails.push(email);
      }

      hasNext = page?.pageInfo?.hasNext ?? false;
      cursor = page?.pageInfo?.endCursor;
    }

    await redis.set(CACHE_KEY, JSON.stringify(emails), 'EX', CACHE_TTL_SECONDS);
    log('INFO', COMPONENT, 'Got emails', { count: emails.length });
    return emails;
  } catch (err) {
    log('ERROR', COMPONENT, 'Failed to fetch visible-by emails', { error: String(err) });
    return [];
  }
}
