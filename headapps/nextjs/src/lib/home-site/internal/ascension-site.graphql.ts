export const AscensionSite_GQL = `
query GetAscensionSite($itemId: String!, $language: String!) {
  item(path: $itemId, language: $language) {
    id
    name
    displayName
    template {
      id
      name
    }
    title: field(name: "title") {
      ... on TextField { value }
    }
    legacyLumappsSiteName: field(name: "SiteNameMapping") {
      ... on TextField { value }
    }
    navigationTitle: field(name: "NavigationTitle") {
      ... on TextField { value }
    }
    siteLevelAssociationTags: field(name: "siteLevelAssociationTags") {
      ... on MultilistField {
        targetItems { 
          id,
          name,
          title: field(name: "title") {
      			... on TextField { value }
          }
          facetCategory: field(name: "facetCategory") {
      			... on TextField { value }
          }
        }
      }
    }
  }
}`;
