/**
 * Content entity service for Sitecore Search Discover API
 */

import { post, createPayload } from '../repositories/discover-repository';
import type { ContentResponse } from '../types/discover';

const CONTENT_ENTITY = 'content';

export async function getFacetValues(
  rfkId: string,
  facetName: string,
  max = 5
): Promise<Record<string, unknown>> {
  return post(
    createPayload([
      {
        rfk_id: rfkId,
        entity: CONTENT_ENTITY,
        search: { facet: { types: [{ name: facetName, max }] } },
      },
    ])
  );
}

export async function getAscensionSites(rfkId: string = 'global-search'): Promise<ContentResponse> {
  const result = await post(
    createPayload([
      {
        rfk_id: rfkId,
        entity: CONTENT_ENTITY,
        search: {
          filter: {
            type: 'and',
            filters: [{ name: 'is_ascension_site', type: 'eq', value: 'true' }],
          },
          limit: 100,
          content: {},
        },
      },
    ])
  );
  return result as unknown as ContentResponse;
}
