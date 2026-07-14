import { CustomSiteSettings_GraphQL } from 'src/models/graphql/custom-site-settings';
import { GetCustomSiteSettings_GQL } from 'src/util/graphql/queries/getCustomSiteSettings.graphql';

import { type LayoutServiceData } from '@sitecore-content-sdk/nextjs';
import { type GraphQLRequestClientFactory } from '@sitecore-content-sdk/nextjs/client';
import { EditingService } from '@sitecore-content-sdk/nextjs/editing';
import { EditingOptions } from '@sitecore-content-sdk/content/editing';

export class CustomEditingService extends EditingService {
  constructor(private readonly graphQLClientFactory: GraphQLRequestClientFactory) {
    super({ clientFactory: graphQLClientFactory });
  }

  async fetchEditingData({
    itemId,
    language,
    version,
    layoutKind,
    mode,
  }: EditingOptions): Promise<{ layoutData: LayoutServiceData }> {
    const editingData = await super.fetchEditingData({
      itemId,
      language,
      version,
      layoutKind,
      mode,
	  variantId,
    });

    const graphQLClient = this.graphQLClientFactory();
    const contextLanguage = language || 'en';

    const customSettingsResponse = await graphQLClient.request<CustomSiteSettings_GraphQL>(
      GetCustomSiteSettings_GQL,
      {
        language: contextLanguage,
      }
    );

    return {
      ...editingData,
      layoutData: {
        ...editingData.layoutData,
        sitecore: {
          ...editingData.layoutData.sitecore,
          context: {
            ...editingData.layoutData.sitecore.context,
            defaultImages:
              customSettingsResponse.layout.item.site.defaultImages?.jsonValue?.fields ?? null,
            landingPageSettings:
              customSettingsResponse.layout.item.site.landingPageSettings?.jsonValue?.fields ??
              null,
          },
        },
      },
    };
  }
}
