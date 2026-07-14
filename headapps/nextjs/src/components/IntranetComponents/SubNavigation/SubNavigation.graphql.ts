export const SubNavigation_GQL = `
fragment NavNode on Item {
  id
  name
  sectionNameLink: field(name: "sectionNameLink") { jsonValue }
  children(first: 20) {
    results {
      id
      menuItem: field(name: "menuItem") { jsonValue }
      dropdownLabel: field(name: "dropdownLabel") { jsonValue }
      children(first: 20) {
        results {
          id
          menuItem: field(name: "menuItem") { jsonValue }
          visibleBy: field(name: "visibleBy") {
            ... on MultilistField {
              targetItems {
                email: field(name: "email") { value }
                identifier: field(name: "identifier") { value }
              }
            }
          }
        }
      }
      visibleBy: field(name: "visibleBy") {
        ... on MultilistField {
          targetItems {
            email: field(name: "email") { value }
            identifier: field(name: "identifier") { value }
          }
        }
      }
    }
  }
}

query SubNavigationLean($language: String!, $contextItem: String!) {
  current: item(path: $contextItem, language: $language) {
    id
    name
    subNavigation: field(name: "subNavigation") {
      ... on LookupField {
        targetItem { ...NavNode }
      }
      ... on MultilistField {
        targetItems { ...NavNode }
      }
    }
  }

  matches: item(path: $contextItem, language: $language) {
    ancestors: ancestors(includeTemplateIDs: ["16166f5c8e8a406093137383f2bc8250"]) {
      id
      name
      subNavigation: field(name: "subNavigation") {
        ... on LookupField {
          targetItem { ...NavNode }
        }
        ... on MultilistField {
          targetItems { ...NavNode }
        }
      }
    }
  }
}
`;
