export const PageSecurity_GQL = `
  fragment VisibilityFields on Item {
    visibleBy: field(name: "visibleBy") {
      ... on MultilistField {
        targetItems {
          ... on VisibleByItem {
            email: field(name: "email") { value }
            disableGroup: field(name: "disableGroup") { value }
          }
        }
      }
    }
    allowAccessRequests: field(name: "allowAccessRequests") { value }
  }

  query GetPageAccessPermissions($site: String!, $path: String!, $language: String!) {

    page: layout(site: $site, routePath: $path, language: $language) {
      item {
        ...VisibilityFields
        ancestors(hasLayout: true) {
          name
          template {
            baseTemplates {
              id
            }
          }
          ...VisibilityFields
        }
      }
    }

    siteRoot: layout(site: $site, routePath: "/", language: $language) {
      item {
        site: parent {
          ...VisibilityFields
        }
      }
    }
  }
`;
