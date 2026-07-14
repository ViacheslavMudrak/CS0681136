export const GlobalFooter_GQL = `
query GlobalFooter($language: String!, $datasource: String!) {
  datasource: item(path: $datasource, language: $language) {
    footerImage: field(name: "footerImage") { jsonValue }
    footerImageLink: field(name: "footerImageLink") { jsonValue }
    footerMissionTagLine: field(name: "footerMissionTagLine") { jsonValue }
    socialIconLinks: field(name: "socialIconLinks") { jsonValue }
    copyrightText: field(name: "copyrightText") { jsonValue }
    legalLinks: field(name: "legalLinks") { jsonValue }

    children(first: 4) {
      results {
        footerColumnHeader: field(name: "footerColumnHeader") { jsonValue }
        children(first: 10) {
          results {
            menuItem: field(name: "menuItem") { jsonValue }
          }
        }
      }
    }
  }
}
`;
