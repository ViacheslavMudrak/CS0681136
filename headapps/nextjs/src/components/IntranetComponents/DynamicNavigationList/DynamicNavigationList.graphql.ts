export const DynamicNavigationList_GQL = `
query DynamicNavigationList($after: String) {
  subItemLinks: search(
    first: 50
    after: $after
    where: {
      AND: [
        { name: "_path", value: "__ANCESTOR_ID__", operator: CONTAINS },
        { name: "_hasLayout", value: "true", operator: EQ }
        { name: "_language", value: "en" }
        { name: "_latestversion", value: "true", operator: EQ }
        { name: "hideInDynamicNavigation", value: "true", operator: NEQ }
      ]
    }
  ) {
    pageInfo {
      endCursor
      hasNext
    }
    total
    results {
      name
      url {
        path
      }
      ... on _BasePage {
        title {
          value
        }
        navigationTitle {
          value
        }
      }
    }
  }
}
`;
