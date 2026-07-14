export const GlobalHeader_GQL = `
fragment VisibleByFields on MultilistField {
  targetItems {
    id
    name
    ... on VisibleByItem {
      email {
        jsonValue
      }
    }
  }
}

fragment NavigationColumnFields on MultilistField {
  targetItems {
    id
    name
    ... on SiteNavigationItem {
      menuItem: field(name: "menuItem") {
        jsonValue
      }
      visibleBy: field(name: "visibleBy") {
        ... on MultilistField {
          ...VisibleByFields
        }
      }
    }
  }
}

query GlobalHeader($language: String!, $datasource: String!) {
  datasource: item(path: $datasource, language: $language) {
    ... on GlobalHeader {
      headerImage {
        jsonValue
      }
      headerText {
        jsonValue
      }
      actionItemsIcon {
        jsonValue
      }
      notificationsIcon {
        jsonValue
      }
      favoritesIcon {
        jsonValue
      }
      searchIcon {
        jsonValue
      }
      headerLink {
        jsonValue
      }
      browseAllApplicationsLink {
        jsonValue
      }
    }
    children(first: 10) {
      results {
        ... on GlobalHeaderPrimaryNavigation {
          _type: __typename
          navigationLabel {
            jsonValue
          }
          children(first: 10) {
            results {
              ... on GlobalHeaderSecondaryNavigation {
                navigationLabel {
                  jsonValue
                }
                visibleBy: field(name: "visibleBy") {
                  ... on MultilistField {
                    ...VisibleByFields
                  }
                }
                column1: field(name: "column1") {
                  ... on MultilistField {
                    ...NavigationColumnFields
                  }
                }
                column2: field(name: "column2") {
                  ... on MultilistField {
                    ...NavigationColumnFields
                  }
                }
                column3: field(name: "column3") {
                  ... on MultilistField {
                    ...NavigationColumnFields
                  }
                }
              }
            }
          }
        }
        ... on GlobalHeaderAccountMenu {
           _type: __typename
          accountMenuTitle {
            jsonValue
          }
          accountMenuAssociateIdLabel {
            jsonValue
          }
          children(first: 10) {
            results {
              ... on SiteNavigationItemWithIcon {
                name
                navigationLink {
                  jsonValue
                }
                navigationIcon {
                  jsonValue
                }
              }
            }
          }
        }
      }
    }
  }
}

`;
