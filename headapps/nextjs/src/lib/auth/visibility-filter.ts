import type { VisibilitySettings } from 'lib/auth/page-security-service';
import { extractEnabledGroupEmails } from 'src/util/helpers/visibility-helpers';

/**
 * Shape a listing-query result must satisfy to be filterable. Matches the
 * fields projected by ListingVisibilityFields in
 * util/graphql/fragments/listingVisibility.graphql.ts, which mirrors the
 * VisibilitySettings type used by GatekeeperProxy.checkGroupAccess.
 *
 * Ancestor visibleBy is intentionally absent — see the fragment's docstring.
 */
export type GatedListingItem = {
  visibleBy?: {
    targetItems?: VisibilitySettings[];
  } | null;
};

/**
 * Decide whether the page's own visibleBy block lets a user through. Mirrors
 * GatekeeperProxy.checkGroupAccess semantics exactly:
 *   - No targetItems → no gate, allow.
 *   - All targetItems disabled (disableGroup === '1') → deny.
 *   - Otherwise → user must be in at least one enabled allowed group.
 */
function passesGate(
  visibleBy: { targetItems?: VisibilitySettings[] } | null | undefined,
  userGroupEmails: Set<string>
): boolean {
  const items = visibleBy?.targetItems ?? [];
  if (items.length === 0) return true;

  const allowedEmails = extractEnabledGroupEmails(items);
  if (allowedEmails.length === 0) return false;

  return allowedEmails.some((email) => userGroupEmails.has(email));
}

/**
 * Whether a listing item is visible to a user, applying the page-level
 * visibleBy check. Ancestor and site-level gates are enforced by
 * GatekeeperProxy on click-through.
 */
export function isVisibleToUser(item: GatedListingItem, userGroupEmails: Set<string>): boolean {
  return passesGate(item.visibleBy, userGroupEmails);
}

/**
 * Drop any items the user cannot see. Use in API routes after the Edge
 * GraphQL response, passing session.googleGroups via buildUserGroupSet.
 */
export function filterVisibleItems<T extends GatedListingItem>(
  items: T[],
  userGroupEmails: Set<string>
): T[] {
  return items.filter((item) => isVisibleToUser(item, userGroupEmails));
}

/**
 * Build the lowercase-trimmed set of group emails from session.googleGroups.
 */
export function buildUserGroupSet(
  groups: ReadonlyArray<{ email?: string | null }> | null | undefined
): Set<string> {
  const set = new Set<string>();
  for (const group of groups ?? []) {
    const email = group.email?.toLowerCase().trim();
    if (email) set.add(email);
  }
  return set;
}
