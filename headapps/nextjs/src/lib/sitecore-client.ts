import { SitecoreClient, createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import { CustomEditingService } from './custom-services/custom-editing-service';
import { CustomLayoutService } from './custom-services/custom-layout-service';

export const clientFactory = createGraphQLClientFactory({ api: scConfig.api });

const client = new SitecoreClient({
  ...scConfig,
  custom: {
    layoutService: new CustomLayoutService(clientFactory),
    editingService: new CustomEditingService(clientFactory),
  },
});

export default client;
