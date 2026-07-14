import { getRedisClient } from 'lib/cache/redis';
import { clientFactory } from 'lib/sitecore-client';
import { CustomSiteSettings_GraphQL } from 'src/models/graphql/custom-site-settings';
import { GetCustomSiteSettings_GQL } from 'src/util/graphql/queries/getCustomSiteSettings.graphql';
import { log } from 'src/util/helpers/log-helper';
import { UserDefaultSettings } from 'ts/user-default-settings';

const Component = 'user-settings-service';
const CacheTTLSeconds = process.env.NEXT_PUBLIC_ENV === 'LOCAL' ? 15 : 8 * 60 * 60;
const SettingsCacheKey = 'user-settings:dfd-site';

export async function cacheUserSettings(fields: UserDefaultSettings): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.setex(SettingsCacheKey, CacheTTLSeconds, JSON.stringify(fields));
    log('INFO', Component, 'User settings cached', { ttl: CacheTTLSeconds });
  } catch (err) {
    log('ERROR', Component, 'Failed to cache User settings', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function fetchUserSettings(): Promise<UserDefaultSettings | null> {
  const redis = await getRedisClient();
  const rawValue = await redis.get(SettingsCacheKey);
  try {
    if (rawValue) {
      log('INFO', Component, 'User settings cache hit');
      return JSON.parse(rawValue) as UserDefaultSettings;
    } else {
      const edgeClient = clientFactory();
      const customSettingsResponse = await edgeClient.request<CustomSiteSettings_GraphQL>(
        GetCustomSiteSettings_GQL,
        {
          language: 'en',
        }
      );
      if (!customSettingsResponse?.layout?.item?.site?.userDefaultSettings?.targetItem) {
        log('WARNING', Component, 'Usersettings not found in Edge');
        return null;
      }
      const userSettings = customSettingsResponse.layout.item.site.userDefaultSettings;
      await redis.setex(SettingsCacheKey, CacheTTLSeconds, JSON.stringify(userSettings));
      return userSettings;
    }
  } catch (error) {
    log('ERROR', Component, 'GraphQL fetch or parsing failed to get user settings', {
      error: String(error),
    });
    return null;
  }
}
