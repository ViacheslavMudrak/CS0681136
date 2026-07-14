import { LISTING_VISIBILITY_FRAGMENT } from 'src/util/graphql/fragments/listingVisibility.graphql';

export const UserNewsFeedSearch_GQL = `
  ${LISTING_VISIBILITY_FRAGMENT}
  query {
    userfeed: search(
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_path",      value: "__ANCESTOR_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          { name: "publishDate", value: "__MIN_DATE__", operator: GTE },
          { name: "publishDate", value: "__EMBARGO_CUTOFF__", operator: LT },
          __TAG_PREDICATES__
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
