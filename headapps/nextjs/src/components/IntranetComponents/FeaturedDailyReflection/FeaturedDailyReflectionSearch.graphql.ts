import { LISTING_VISIBILITY_FRAGMENT } from 'src/util/graphql/fragments/listingVisibility.graphql';

/**
 * `first` is intentionally larger than the 1 result the component renders.
 * The query is filtered server-side by visibleBy in getComponentServerProps,
 * so over-fetching here lets us still surface the next-newest visible
 * reflection if today's most recent one is restricted to groups the current
 * user is not in.
 */
export const FeaturedDailyReflectionSearch_GQL = `
  ${LISTING_VISIBILITY_FRAGMENT}
  query {
    reflections: search(
      first: 10,
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_path", value: "__ANCESTOR_ID__", operator: CONTAINS },
          { name: "_language", value: "__LANGUAGE__" },
          { name: "publishdate", value: "__TODAY_DATE__", operator: LTE }
        ]
      }
      orderBy: { name: "publishdate", direction: DESC }
    ) {
      total
      results {
        url {
          path
        }
        ... on Item {
          title: field(name: "Title") {
            jsonValue
          }
          body: field(name: "quote") {
            jsonValue
          }
          author: field(name: "Author") {
            jsonValue
          }
          publishDate: field(name: "publishDate") {
            jsonValue
          }
          ...ListingVisibilityFields
        }
      }
    }
  }
`;
