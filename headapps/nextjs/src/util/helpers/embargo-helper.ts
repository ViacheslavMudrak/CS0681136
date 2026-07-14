/**
 * Publication-date embargo for listings, related-content, and search.
 *
 * Sitecore lets authors set a publishDate in the future. The page itself
 * stays reachable at its URL once published, but components that *surface*
 * the content (listings, related news, related pages, search) must hide it
 * until the publication date arrives.
 *
 * The cutoff is start-of-tomorrow UTC, so anything with publishDate strictly
 * before tomorrow midnight is visible — i.e., today's content surfaces today,
 * and content dated tomorrow or later stays hidden.
 */
export const EMBARGO_CUTOFF_TOKEN = '__EMBARGO_CUTOFF__';

/**
 * Returns the embargo cutoff as an ISO 8601 string (start of tomorrow, UTC).
 */
export const getEmbargoCutoffValue = (): string => {
  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString();
};

/**
 * Substitutes the embargo-cutoff token in a Sitecore Edge GraphQL query
 * string. Apply alongside the query's other token replacements (ancestor id,
 * template id, language, etc.) before sending to the GraphQL client.
 */
export const applyEmbargoCutoff = (query: string): string =>
  query.replaceAll(EMBARGO_CUTOFF_TOKEN, getEmbargoCutoffValue());
