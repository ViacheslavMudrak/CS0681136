import { getRedisClient } from 'src/lib/cache/redis';
import { clientFactory } from 'src/lib/sitecore-client';
import { log } from 'src/util/helpers/log-helper';
import type { VoyagerSettingsItem } from 'ts/voyager-settings';

import { GetVoyagerSettings_GQL } from './get-voyager-settings.graphql';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type VoyagerSettingsResponse = {
  layout: {
    item: {
      site: {
        voyagerSettings: {
          jsonValue: { fields: VoyagerSettingsItem | null };
        };
      };
    };
  };
};

/** Plain-value representation stored in Redis (no Sitecore Field wrappers). */
export type VoyagerSettings = {
  oracleOAuthBaseUrl: string;
  oracleTokenUrl: string;
  oracleScope: string;
  oracleJWTAudience: string;
};

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const COMPONENT = 'VoyagerSettingsService';
const CACHE_KEY = 'voyager:settings';
const CACHE_TTL_SECONDS = process.env.NEXT_PUBLIC_ENV === 'LOCAL' ? 15 : 8 * 60 * 60; // local: 15s TTL for easy testing, prod: 8 hours

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Extract plain string values from the Sitecore Field wrappers returned by GraphQL.
 */
function mapToVoyagerSettings(fields: VoyagerSettingsItem): VoyagerSettings {
  return {
    oracleOAuthBaseUrl: fields.oracleOAuthBaseUrl?.value ?? '',
    oracleTokenUrl: fields.oracleTokenUrl?.value ?? '',
    oracleScope: fields.oracleScope?.value ?? '',
    oracleJWTAudience: fields.oracleJWTAudience?.value ?? '',
  };
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Persist voyager settings into Redis.
 * Called from `CustomLayoutService` during page build / revalidation so the
 * cache stays fresh without an extra GraphQL round-trip at request time.
 */
export async function cacheVoyagerSettings(fields: VoyagerSettingsItem): Promise<void> {
  try {
    const settings = mapToVoyagerSettings(fields);
    const redis = await getRedisClient();
    await redis.set(CACHE_KEY, JSON.stringify(settings), 'EX', CACHE_TTL_SECONDS);
    log('INFO', COMPONENT, 'Voyager settings cached', { ttl: CACHE_TTL_SECONDS });
  } catch (err) {
    log('ERROR', COMPONENT, 'Failed to cache voyager settings', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Retrieve voyager settings, checking Redis first and falling back to a
 * direct GraphQL fetch when the cache is empty or expired.
 */
export async function getVoyagerSettings(): Promise<VoyagerSettings | null> {
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      log('INFO', COMPONENT, 'Voyager settings cache hit');
      return JSON.parse(cached) as VoyagerSettings;
    }

    log('INFO', COMPONENT, 'Voyager settings cache miss — fetching from Sitecore');

    const graphQLClient = clientFactory();
    const response = await graphQLClient.request<VoyagerSettingsResponse>(GetVoyagerSettings_GQL, {
      language: 'en',
    });

    const fields = response.layout.item.site.voyagerSettings.jsonValue.fields;
    if (!fields) {
      log('WARNING', COMPONENT, 'Voyager settings returned null fields from Sitecore');
      return null;
    }

    const settings = mapToVoyagerSettings(fields);
    await redis.set(CACHE_KEY, JSON.stringify(settings), 'EX', CACHE_TTL_SECONDS);
    log('INFO', COMPONENT, 'Voyager settings fetched and cached', { ttl: CACHE_TTL_SECONDS });

    return settings;
  } catch (err) {
    log('ERROR', COMPONENT, 'Failed to get voyager settings', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
