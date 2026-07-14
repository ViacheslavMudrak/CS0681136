import { LISTING_VISIBILITY_FRAGMENT } from 'src/util/graphql/fragments/listingVisibility.graphql';

export const RelatedNewsListingSearch_GQL = `
  ${LISTING_VISIBILITY_FRAGMENT}
  query {
    search(
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
        url { path }
        ... on NewsDetailPage {
          title {
            value
          }
          excerpt {
            value
          }
          publishDate {
            value
          }
          thumbnail {
            jsonValue
          }
          isFeatured {
            value
          }
          topicTags {
            ... on MultilistField  {
              targetItems {
                id
                name
                ... on Tag {
                  title {
                    value
                  }
                }
              }
            }
          }
          areaTags {
            ... on MultilistField  {
              targetItems {
                id
                name
                ... on Tag {
                  title {
                    value
                  }
                }
              }
            }
          }
          ...ListingVisibilityFields
        }
      }
    }
  }
`;
