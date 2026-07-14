export const GetVoyagerSettings_GQL = `
query VoyagerSettings($language: String!) {
  layout(site: "DFD", routePath: "/", language: $language) {
    item {
      site: parent {
        voyagerSettings: field(name: "voyagerSettings") {
          jsonValue
        }
      }
    }
  }
}
`;
