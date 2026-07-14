export const GetCustomSiteSettings_GQL = `
fragment favorite on MultilistField {
  targetItems {
    id
    name
    url: field(name: "entryLink") {
      ... on LinkField {
        url
        text
        target
        anchor
      }
    }
    icon: field(name: "entryIcon") {
      ... on LookupField {
        targetItem {
          name
          value: field(name: "value") {
            value
          }
        }
      }
    }
  }
}

query DefaultImages($language: String!) {
  layout(site: "DFD", routePath: "/", language: $language) {
    item {
      id
      site: parent {
        defaultImages: field(name: "defaultImages") {
          jsonValue
        }
        landingPageSettings: field(name: "landingPageSettings") {
          jsonValue
        }
        voyagerSettings: field(name: "voyagerSettings") {
          jsonValue
        }
        scriptingSettings: field(name: "scriptingSettings") {
          jsonValue
        }
        userDefaultSettings: field(name: "userDefaultSettings") {
          ... on LookupField {
            targetItem {
              recommendedFavorites: field(name: "recommendedFavorites") {
                ... on MultilistField {
                  ...favorite
                }
              }
              defaultFavorites: field(name: "defaultFavorites") {
                ... on MultilistField {
                  ...favorite
                }
              }
              iconsForFavorites: field(name: "iconsForFavorites") {
                ... on MultilistField {
                  targetItems {
                    name
                    value: field(name: "value") {
                      value
                    }
                  }
                }
              }
              newsSiteChoiceSelection: field(name: "newsSiteChoiceSelection") {
                ... on MultilistField {
                  targetItems {
                    id(format: "B")
                    name
                    title: field(name: "title") {
                      value
                    }
                    visibleBy: field(name: "visibleBy") {
                      ... on MultilistField {
                        targetItems {
                          id
                          name
                          email: field(name: "email") {
                            value
                          }
                          disableGroup: field(name: "disableGroup") {
                            value
                          }
                        }
                      }
                    }
                  }
                }
              }
              supplementalSiteChoiceSelection: field(name: "supplementalSiteChoiceSelection") {
                ... on MultilistField {
                  targetItems {
                    id(format: "B")
                    name
                    title: field(name: "title") {
                      value
                    }
                    visibleBy: field(name: "visibleBy") {
                      ... on MultilistField {
                        targetItems {
                          id
                          name
                          email: field(name: "email") {
                            value
                          }
                          disableGroup: field(name: "disableGroup") {
                            value
                          }
                        }
                      }
                    }
                  }
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
