import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { GoogleGroupData } from 'ts/google';
import { buildGatedVisibilityFilter } from 'src/lib/sitecore-search/filters/gated-visibility-filter';

/** true when NEXT_PUBLIC_USE_HASHED_SEARCH_GROUPS=true at build time */
const HASHED_GROUPS_ENABLED = process.env.NEXT_PUBLIC_USE_HASHED_SEARCH_GROUPS === 'true';
/** true when NEXT_PUBLIC_USE_UNFILTERED_SEARCH_GROUPS=true at build time */
const UNFILTERED_GROUPS_ENABLED = process.env.NEXT_PUBLIC_USE_UNFILTERED_SEARCH_GROUPS === 'true';

// Resolve which session field holds the groups for this build's configuration.
// Because the flags are constants, exactly one branch is reachable at runtime,
// so the memo depends only on the single field that is actually read.
function resolveSessionGroups(session: ReturnType<typeof useSession>['data']) {
  if (UNFILTERED_GROUPS_ENABLED) {
    return ((session?.googleGroups as GoogleGroupData[]) ?? [])
      .map((g) => g.email?.toLowerCase().trim())
      .filter((e): e is string => Boolean(e));
  }
  return HASHED_GROUPS_ENABLED
    ? (session?.filteredGroupEmailHashes ?? [])
    : (session?.filteredGroupEmails ?? []);
}

const USE_HASHED_FILTER = HASHED_GROUPS_ENABLED && !UNFILTERED_GROUPS_ENABLED;

/**
 * Returns a Sitecore Search filter that restricts results to pages the current
 * user is permitted to see, based on indexed page and ancestor visibleBy groups.
 *
 * - Authenticated users: public pages + gated pages where their groups satisfy
 *   all configured restriction levels (page and ancestor).
 * - Unauthenticated / session loading: public pages only.
 *
 * Group resolution (flags are evaluated at build time):
 *   NEXT_PUBLIC_USE_UNFILTERED_SEARCH_GROUPS=true  → all Google group emails, plain index fields
 *   NEXT_PUBLIC_USE_HASHED_SEARCH_GROUPS=true       → visibleBy-filtered emails, hashed index fields
 *   (default)                                        → visibleBy-filtered emails, plain index fields
 *
 * Apply this filter in every search widget's query callback or request effect.
 */
export function useGatedVisibilityFilter() {
  const { data: session } = useSession();

  const sessionGroups = UNFILTERED_GROUPS_ENABLED
    ? (session?.googleGroups as GoogleGroupData[] | undefined)
    : HASHED_GROUPS_ENABLED
      ? session?.filteredGroupEmailHashes
      : session?.filteredGroupEmails;

  const userGroups = useMemo(() => resolveSessionGroups(session), [sessionGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  return useMemo(() => buildGatedVisibilityFilter(userGroups, USE_HASHED_FILTER), [userGroups]);
}
