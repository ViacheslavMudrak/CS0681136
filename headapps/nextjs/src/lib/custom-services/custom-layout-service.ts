import { cacheUserSettings } from 'lib/user-settings/user-settings-service';
import { cacheVoyagerSettings } from 'src/lib/voyager/voyager-settings-service';
import { CustomSiteSettings_GraphQL } from 'src/models/graphql/custom-site-settings';
import { GetCustomSiteSettings_GQL } from 'src/util/graphql/queries/getCustomSiteSettings.graphql';

import { LayoutService, type LayoutServiceData } from '@sitecore-content-sdk/nextjs';
import { type GraphQLRequestClientFactory } from '@sitecore-content-sdk/nextjs/client';
import type { RouteOptions } from '@sitecore-content-sdk/content/layout';

export class CustomLayoutService extends LayoutService {
  constructor(private readonly graphQLClientFactory: GraphQLRequestClientFactory) {
    super({ clientFactory: graphQLClientFactory });
  }

  async fetchLayoutData(routePath: string, routeOptions: RouteOptions): Promise<LayoutServiceData> {
    const layoutData = await super.fetchLayoutData(routePath, routeOptions);

    const graphQLClient = this.graphQLClientFactory();
    const contextLanguage = layoutData?.sitecore?.context?.language || routeOptions?.locale || 'en';

    const customSettingsResponse = await graphQLClient.request<CustomSiteSettings_GraphQL>(
      GetCustomSiteSettings_GQL,
      {
        language: contextLanguage,
      }
    );

    // Cache Voyager settings in Redis for use by the Oracle OAuth client
    const voyagerSettingsFields =
      customSettingsResponse.layout.item.site.voyagerSettings?.jsonValue?.fields;

    if (voyagerSettingsFields) {
      await cacheVoyagerSettings(voyagerSettingsFields);
    }
    if (customSettingsResponse?.layout?.item?.site?.userDefaultSettings) {
      await cacheUserSettings(customSettingsResponse?.layout?.item?.site?.userDefaultSettings);
    }

    const fullUserSettings = customSettingsResponse.layout.item.site.userDefaultSettings;
    let clientUserSettings = fullUserSettings ?? null;
    if (fullUserSettings?.targetItem) {
      const targetItem = { ...fullUserSettings.targetItem };
      delete targetItem.newsSiteChoiceSelection;
      delete targetItem.supplementalSiteChoiceSelection;
      clientUserSettings = { ...fullUserSettings, targetItem };
    }

    return {
      ...layoutData,
      sitecore: {
        ...layoutData.sitecore,
        context: {
          ...layoutData.sitecore.context,
          homePageId: customSettingsResponse.layout.item.id ?? null,
          defaultImages:
            customSettingsResponse.layout.item.site.defaultImages?.jsonValue?.fields ?? null,
          landingPageSettings:
            customSettingsResponse.layout.item.site.landingPageSettings?.jsonValue?.fields ?? null,
          userDefaultSettings: clientUserSettings,
          scriptSettings:
            customSettingsResponse.layout.item.site.scriptingSettings?.jsonValue?.fields ?? null,
        },
      },
    };
  }
}
