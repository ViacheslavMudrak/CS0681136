import { FilterAnd, FilterAnyOf, FilterEqual, FilterOr } from '@sitecore-search/react';

/**
 * Builds the base gated visibility filter for Sitecore Search.
 *
 * A page is included in results if:
 *   - is_gated is false (public page), OR
 *   - For each restriction level (page, ancestor): that level is not configured (boolean false)
 *     OR the user's groups contain at least one matching group.
 *
 * Both levels must pass independently (AND across levels). A level with no groups configured
 * is treated as unrestricted — only levels that are explicitly set are enforced.
 *
 * Pass an empty array for unauthenticated users — only public pages are returned.
 */
export function buildGatedVisibilityFilter(userGroups: string[], useHashed = false) {
  if (!userGroups.length) {
    return new FilterEqual('is_gated', false);
  }

  const pageField = useHashed ? 'page_visible_by_groups_hashed' : 'page_visible_by_groups';
  const ancestorField = useHashed
    ? 'ancestor_visible_by_groups_hashed'
    : 'ancestor_visible_by_groups';

  return new FilterOr([
    new FilterEqual('is_gated', false),
    new FilterAnd([
      new FilterOr([
        new FilterEqual('is_gated_by_page', false),
        new FilterAnyOf(pageField, userGroups),
      ]),
      new FilterOr([
        new FilterEqual('is_gated_by_ancestor', false),
        new FilterAnyOf(ancestorField, userGroups),
      ]),
    ]),
  ]);
}
