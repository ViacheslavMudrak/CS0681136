/**
 * GraphQL fragment that projects the visibleBy field on a page-template
 * result, resolving each VisibleByItem to its email and disableGroup values
 * inline. Mirrors the VisibilityFields fragment in getPageSecurity.graphql.ts
 * used by GatekeeperProxy, so the data shape slots into the same
 * VisibilitySettings type.
 *
 * Ancestor visibleBy is intentionally NOT projected here. Empirically the
 * Sitecore Edge endpoint returns "Depth is 22 levels" when
 * `ancestors(hasLayout: true)` is added alongside this spread inside a
 * `search > results > … on NewsDetailPage` chain. Ancestor-level gates are
 * still enforced by GatekeeperProxy on click-through.
 *
 * Usage:
 *   const query = `
 *     ${LISTING_VISIBILITY_FRAGMENT}
 *     query { search(...) { results {
 *       ... on NewsDetailPage {
 *         title { value }
 *         ...ListingVisibilityFields
 *       }
 *     } } }
 *   `;
 */
export const LISTING_VISIBILITY_FRAGMENT = `
  fragment ListingVisibilityFields on Item {
    visibleBy: field(name: "visibleBy") {
      ... on MultilistField {
        targetItems {
          email: field(name: "email") { value }
          disableGroup: field(name: "disableGroup") { value }
        }
      }
    }
  }
`;
