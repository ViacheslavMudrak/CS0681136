export const ContextSiteHomeInfo_GQL = `
query GetSitePagesWithVisibleBy {
  pageOne: search(
    where: {
      AND: [
        {
          name: "_templates"
          operator: CONTAINS
          value: "4DC70463-DF58-4C54-BB99-67EFBCFD887D"
        }
        {
          name: "_path"
          operator: CONTAINS
          value: "103C8B2F-80E2-4FA6-A6C6-B1C621D0110D"
        }
        { name: "visibleBy", operator: NEQ, value: " " }
      ]
    }
    # defaults to 10
    first: 10
  ) {
    total
    pageInfo {
      endCursor
      hasNext
    }
    results {
      url {
        path
      }
      visibleBy: field(name: "visibleBy") {
        ... on MultilistField {
          targetItems {
            key: field(name: "key") {
              jsonValue
            }
          }
        }
      }
    }
  }
}
`;
