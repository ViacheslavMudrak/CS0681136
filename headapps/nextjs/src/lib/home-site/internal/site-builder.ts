/**
 * Fetches a single Ascension Site from Sitecore Edge GraphQL by item ID.
 */

import { clientFactory } from 'lib/sitecore-client';
import { matchesTemplate, TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';
import { log } from 'src/util/helpers/log-helper';
import type { AscensionSite, AscensionSiteTag } from '../types';
import { AscensionSite_GQL } from './ascension-site.graphql';

const COMPONENT = 'home-site:site-builder';

interface GraphQLAscensionSiteResponse {
  item: {
    id: string;
    name: string;
    displayName: string;
    template: { id: string; name: string };
    title: { value: string } | null;
    legacyLumappsSiteName: { value: string } | null;
    navigationTitle: { value: string } | null;
    siteLevelAssociationTags: {
      targetItems: Array<AscensionSiteTag>;
    } | null;
  } | null;
}

function buildAscensionSiteFromGraphQL(
  item: NonNullable<GraphQLAscensionSiteResponse['item']>
): AscensionSite {
  const siteName =
    item.title?.value ||
    item.navigationTitle?.value ||
    item.displayName ||
    item.legacyLumappsSiteName?.value ||
    item.name ||
    '';
  const isMarket = matchesTemplate(item.template?.id, TEMPLATE_ID_CONSTANTS.MINISTRY_HOME_PAGE);
  const siteLevelAssociationTags = item.siteLevelAssociationTags?.targetItems ?? [];

  return {
    itemId: item.id,
    siteName,
    isMarket,
    siteLevelAssociationTags,
  };
}

export async function fetchAscensionSiteById(
  itemId: string,
  language: string = 'en'
): Promise<AscensionSite | null> {
  if (!itemId) {
    log('ERROR', COMPONENT, 'fetchAscensionSiteById called with falsy itemId', { itemId });
    return null;
  }
  const edgeClient = clientFactory();
  try {
    const data = await edgeClient.request<GraphQLAscensionSiteResponse>(AscensionSite_GQL, {
      itemId,
      language,
    });
    if (!data.item) {
      log('WARNING', COMPONENT, 'Item not found in Edge', { itemId });
      return null;
    }
    return buildAscensionSiteFromGraphQL(data.item);
  } catch (error) {
    log('ERROR', COMPONENT, 'GraphQL fetch failed', { itemId, error: String(error) });
    return null;
  }
}
