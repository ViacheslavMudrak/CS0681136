export const ContextSiteHomeInfo_GQL = `
query {
  layout(site: "__SiteName__", routePath: "/", language: "__Language__") {
    item {
      homeItemPath: path
      homeItemId: id
      site: parent {
        id
        path
      }
    }
  }
}`;
