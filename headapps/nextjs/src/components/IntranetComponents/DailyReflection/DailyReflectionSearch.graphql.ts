import { LISTING_VISIBILITY_FRAGMENT } from 'src/util/graphql/fragments/listingVisibility.graphql';

/**
 * `first` is intentionally larger than the 1 result the component renders.
 * The list is filtered client-side by visibleBy at render time, so over-
 * fetching here lets us still surface the next-newest visible reflection
 * if the most recent one is restricted to groups the current user is not in.
 */
export const DailyReflectionSearch_GQL = `
  ${LISTING_VISIBILITY_FRAGMENT}
  query {
    reflections:search(
			first: 14,
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_path",      value: "__ANCESTOR_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          { name: "publishdate", value: "__TOMORROW_START__", operator: LT },
        ]
      }
      orderBy: { name: "publishDate", direction: DESC }
    ) {
      total
      results {
        url { path }
        ... on ReflectionDetailPage {
          title {
            value
          }
          description {
            value
          }
          quote {
            value
          }
          author {
            value
          }
          publishDate {
            value
          }
          ...ListingVisibilityFields
        }
      }
    }
  }
`;
