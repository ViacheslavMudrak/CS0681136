import { LISTING_VISIBILITY_FRAGMENT } from 'src/util/graphql/fragments/listingVisibility.graphql';

/**
 * `first` is intentionally larger than the 4 the component renders so that,
 * after the client-side visibleBy filter drops items the user isn't allowed
 * to see, there's still a reasonable chance the listing fills out.
 */
export const RelatedReflectionsSearch_GQL = `
  ${LISTING_VISIBILITY_FRAGMENT}
  query {
    search(
      first: 12
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_path",      value: "__ANCESTOR_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          { name: "publishDate", value: "__EMBARGO_CUTOFF__", operator: LT },
          {
            OR: [
              __TAG_PREDICATES__
            ]
          }
        ]
      }
      orderBy: { name: "publishDate", direction: DESC }
    ) {
      total
      results {
        id
        url { path }
        ... on ReflectionDetailPage {
          title {
            value
          }
          publishDate {
            value
          }
          quote {
            value
          }
          author {
            value
          }
          ...ListingVisibilityFields
        }
      }
    }
  }
`;
