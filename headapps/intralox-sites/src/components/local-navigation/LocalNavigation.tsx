import { JSX } from 'react';

import type { LocalNavigationProps } from './LocalNavigation.type';
import { LocalNavigationClient } from './partial/LocalNavigationClient';
import {
  mapLinkListToResolved,
  resolveLocalNavigationFields,
  routeShowsSubNavigation,
} from './localNavigationUtils';
import { renderingAnchorId } from 'src/utils/renderingAnchorProps';

function readRouteItemGuidFromPage(page: LocalNavigationProps['page']): string | undefined {
  const route = page.layout?.sitecore?.route;
  if (!route || typeof route !== 'object' || !('itemId' in route)) return undefined;
  const raw = (route as { itemId?: unknown }).itemId;
  if (typeof raw !== 'string') return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

/** Local navigation strip; delegates to {@link LocalNavigationClient}. */
export const Default = ({ fields, params, page }: LocalNavigationProps): JSX.Element => {
  const { styles } = params;
  const resolved = resolveLocalNavigationFields(fields ?? {});
  const primaries = mapLinkListToResolved(resolved.PrimaryLinkList);
  const secondaries = mapLinkListToResolved(resolved.SecondaryLinkList);
  const routeFields = page.layout.sitecore.route?.fields;
  const showSubRoute = routeShowsSubNavigation(routeFields);
  const routeItemGuid = readRouteItemGuidFromPage(page);

  return (
    <LocalNavigationClient
      isEditing={page.mode.isEditing}
      showSubRoute={showSubRoute}
      primaries={primaries}
      secondaries={secondaries}
      useIndustryNavDropdowns={false}
      routeItemGuid={routeItemGuid}
      styles={styles}
      id={renderingAnchorId(params.RenderingIdentifier)}
    />
  );
};
