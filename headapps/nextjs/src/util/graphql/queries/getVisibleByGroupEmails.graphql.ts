export const GetVisibleByGroupEmails_GQL = /* GraphQL */ `
  query GetVisibleByGroupEmails($after: String) {
    search(
      where: {
        name: "_templates"
        operator: CONTAINS
        value: "88AC9B81-E232-4B82-A49A-0A4283282A8D"
      }
      first: 50
      after: $after
    ) {
      pageInfo {
        endCursor
        hasNext
      }
      results {
        email: field(name: "email") {
          value
        }
        disableGroup: field(name: "disableGroup") {
          value
        }
      }
    }
  }
`;
