export const GetCompanyCodes_GQL = `
query GetCompanyCodes($itemId: String!, $language: String!, $endCursor: String = "") {
  item(path: $itemId, language: $language) {
    children(first: 50, after: $endCursor) {
      pageInfo {
        endCursor
        hasNext
      }
      results {
        value: field(name: "value") {
          value
        }
      }
    }
  }
}
`;
