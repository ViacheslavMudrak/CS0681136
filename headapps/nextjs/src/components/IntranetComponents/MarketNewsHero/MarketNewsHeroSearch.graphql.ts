import { LISTING_VISIBILITY_FRAGMENT } from 'src/util/graphql/fragments/listingVisibility.graphql';

export const MarketNewsHeroSearch_GQL = `
  ${LISTING_VISIBILITY_FRAGMENT}
  query {
    featured: search(
      first: 1,
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_path",      value: "__ANCESTOR_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          { name: "componentDisplayTags", value: "__DFD_FEATURED_TAG_ID__", operator: CONTAINS },
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
          pageIntroduction {
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
      first: 3,
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_path",      value: "__ANCESTOR_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          { name: "componentDisplayTags", value: "__DFD_NON_FEATURED_TAG_ID__", operator: CONTAINS },
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
          ...ListingVisibilityFields
        }
     }
    }
	}
`;

export const MarketNewsHeroPersonalizedSearch_GQL = `
  ${LISTING_VISIBILITY_FRAGMENT}
  query {
    featured: search(
      first: 5,
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          { name: "componentDisplayTags", value: "__DFD_FEATURED_TAG_ID__", operator: CONTAINS },
          { name: "publishDate", value: "__EMBARGO_CUTOFF__", operator: LT },
          __AREA_TAGS_PREDICATE__
        ]
      }
      orderBy: { name: "publishDate", direction: DESC }
    ) {
      results {
        url { path }
        ... on NewsDetailPage {
          title { value }
          pageIntroduction { value }
          publishDate { value }
          thumbnail { jsonValue }
          ...ListingVisibilityFields
        }
      }
    }
    nonFeatured: search(
      first: 10,
      where: {
        AND: [
          { name: "_templates", value: "__TEMPLATE_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          { name: "componentDisplayTags", value: "__DFD_NON_FEATURED_TAG_ID__", operator: CONTAINS },
          { name: "publishDate", value: "__EMBARGO_CUTOFF__", operator: LT },
          __AREA_TAGS_PREDICATE__
        ]
      }
      orderBy: { name: "publishDate", direction: DESC }
    ) {
      results {
        url { path }
        ... on NewsDetailPage {
          title { value }
          thumbnail { jsonValue }
          ...ListingVisibilityFields
        }
      }
    }
  }
`;

export const SiteAreaTagMeta_GQL = `
  query GetSiteAreaTagMeta($itemId: String!, $language: String!) {
    item(path: $itemId, language: $language) {
      id
      title: field(name: "title") {
        ... on TextField { value }
      }
      facetCategory: field(name: "facetCategory") {
        ... on TextField { value }
      }
    }
  }
`;
