import { LISTING_VISIBILITY_FRAGMENT } from 'src/util/graphql/fragments/listingVisibility.graphql';

/**
 * `first` is intentionally larger than the 1 (featured) / 4 (non-featured)
 * the component renders. The list is filtered client-side by visibleBy at
 * render time, so over-fetching here keeps the rendered slot full when the
 * topmost matches are restricted to groups the current user is not in.
 */
export const MarketNewsSearch_GQL = `
  ${LISTING_VISIBILITY_FRAGMENT}
  query {
    featured: search(
      first: 5,
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_path",      value: "__ANCESTOR_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          { name: "componentDisplayTags", value: "__MARKET_NEWS_FEATURED_TAG_ID__", operator: CONTAINS },
          { name: "publishDate", value: "__EMBARGO_CUTOFF__", operator: LT },
          __TAG_PREDICATES_FEATURED__
        ]
      }
      orderBy: { name: "publishDate", direction: DESC }
    ) {
      total
     results {
        url { path }
        ... on NewsDetailPage {
          title {
            value
          }
          publishDate {
            value
          }
          thumbnail {
            jsonValue
          }
          ...ListingVisibilityFields
      	}
     }
    }
  nonFeatured: search(
      first: 12,
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_path",      value: "__ANCESTOR_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          { name: "componentDisplayTags", value: "__MARKET_NEWS_NON_FEATURED_TAG_ID__", operator: CONTAINS },
          { name: "publishDate", value: "__EMBARGO_CUTOFF__", operator: LT },
          __TAG_PREDICATES_NONFEATURED__
        ]
      }
      orderBy: { name: "publishDate", direction: DESC }
    ) {
      total
     results {
        url { path }
        ... on NewsDetailPage {
          title {
            value
          }
          publishDate {
            value
          }
          thumbnail {
            jsonValue
          }
          ...ListingVisibilityFields
        }
     }
    }
	}
`;
