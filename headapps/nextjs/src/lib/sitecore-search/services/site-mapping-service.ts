/**
 * Site mapping service for Sitecore Search Discover API
 */

import { post, createPayload } from '../repositories/discover-repository';
import type { SiteMappingResponse } from '../types/discover';

const SITE_MAPPING_ENTITY = 'sitemapping';

export async function getSiteMappings(
  rfkId: string = 'global-search'
): Promise<SiteMappingResponse> {
  const result = await post(
    createPayload([
      { rfk_id: rfkId, entity: SITE_MAPPING_ENTITY, search: { limit: 100, content: {} } },
    ])
  );
  return result as unknown as SiteMappingResponse;
}
