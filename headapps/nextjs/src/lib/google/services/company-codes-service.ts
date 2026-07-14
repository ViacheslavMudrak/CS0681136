import { getRedisClient } from 'src/lib/cache/redis';
import { clientFactory } from 'src/lib/sitecore-client';
import { log } from 'src/util/helpers/log-helper';
import { GetCompanyCodes_GQL } from 'src/util/graphql/queries/getCompanyCodes.graphql';

const COMPONENT = 'CompanyCodesService';
const CACHE_KEY = 'people-directory:company-codes';
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Sitecore item ID for `/sitecore/content/Intranet Evolution/DFD/Settings/Authoring Control Settings/Company Codes`.
 * Each child has a single-line text field named `value` containing the company code string.
 */
const COMPANY_CODES_ITEM_ID = '{5ca1ee7e-1ffb-46e5-bec4-1a9ced2b4a73}';

type CompanyCodesResponse = {
  item: {
    children: {
      pageInfo: {
        endCursor: string | null;
        hasNext: boolean;
      };
      results: Array<{
        value: { value?: string } | null;
      }>;
    };
  } | null;
};

/** Safety cap so a misconfigured Sitecore tree can't loop indefinitely. */
const MAX_PAGES = 20;

/**
 * Returns the list of company codes managed in Sitecore.
 * Cached in Redis for 1 hour; on cache miss, queries Sitecore Edge GraphQL.
 * Returns an empty array on failure rather than throwing — callers should treat
 * an empty result as "no codes available" and skip dependent work.
 */
export async function getCompanyCodes(): Promise<string[]> {
  let redis: Awaited<ReturnType<typeof getRedisClient>> | null = null;

  try {
    redis = await getRedisClient();
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      const codes = JSON.parse(cached) as string[];
      log('INFO', COMPONENT, 'Company codes cache hit', { count: codes.length });
      return codes;
    }
  } catch (err) {
    log('ERROR', COMPONENT, 'Redis read failed — falling through to Sitecore', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    const client = clientFactory();
    const codes: string[] = [];
    let endCursor = '';

    for (let i = 0; i < MAX_PAGES; i++) {
      const response = await client.request<CompanyCodesResponse>(GetCompanyCodes_GQL, {
        itemId: COMPANY_CODES_ITEM_ID,
        language: 'en',
        endCursor,
      });

      for (const result of response.item?.children.results ?? []) {
        const code = result.value?.value?.trim();
        if (code) codes.push(code);
      }

      const pageInfo = response.item?.children.pageInfo;
      if (!pageInfo?.hasNext || !pageInfo.endCursor) break;
      endCursor = pageInfo.endCursor;
    }

    log('INFO', COMPONENT, 'Company codes fetched from Sitecore', { count: codes.length });

    if (redis) {
      try {
        await redis.set(CACHE_KEY, JSON.stringify(codes), 'EX', CACHE_TTL_SECONDS);
      } catch (err) {
        log('ERROR', COMPONENT, 'Redis write failed', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return codes;
  } catch (err) {
    log('ERROR', COMPONENT, 'Failed to fetch company codes from Sitecore', {
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}
