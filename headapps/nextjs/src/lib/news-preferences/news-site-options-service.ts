import { buildUserGroupSet, filterVisibleItems } from 'lib/auth/visibility-filter';
import { fetchUserSettings } from 'lib/user-settings/user-settings-service';
import type { SiteChoiceModel } from 'ts/user-default-settings';

import type { NewsSiteOptionsResponse, PublicSiteOption } from './types';

type SiteOption = NonNullable<SiteChoiceModel['targetItems']>[number];

/** Project to the client-safe shape, dropping the gated `visibleBy` block. */
const toPublicOption = (item: SiteOption): PublicSiteOption => ({
  id: item.id,
  name: item.name,
  title: item.title,
});

export async function getNewsSiteOptions(
  googleGroups: ReadonlyArray<{ email?: string | null }> | null | undefined
): Promise<NewsSiteOptionsResponse> {
  const settings = await fetchUserSettings();
  const userGroupEmails = buildUserGroupSet(googleGroups);

  const homeItems = settings?.targetItem?.newsSiteChoiceSelection?.targetItems ?? [];
  const supplementalItems =
    settings?.targetItem?.supplementalSiteChoiceSelection?.targetItems ?? [];

  const home = filterVisibleItems(homeItems, userGroupEmails).map(toPublicOption);
  const supplemental = filterVisibleItems(supplementalItems, userGroupEmails).map(toPublicOption);

  return { home, supplemental };
}
