export const RelatedPagesSearch_GQL = `
  query {
    search(
      where: {
        AND: [
          { name: "_path",      value: "__ANCESTOR_ID__", operator: CONTAINS },
          { name: "_language",  value: "__LANGUAGE__" },
          {
            OR: [
              __TAG_PREDICATES__
            ]
          }
        ]
      }
      orderBy: { name: "_name", direction: ASC }
    ) {
      total
      results {
        id
        name
        url { path }
        ... on Item {
          title: field(name: "title") {
            ... on TextField {
              value
            }
          }
          pageIntroduction: field(name: "pageIntroduction") {
            ... on TextField {
              value
            }
          }
          eyebrow: field(name: "optionalEyebrow") {
            ... on TextField {
              value
            }
          }
        }
        ... on DetailPage {
          topicTags {
            ... on MultilistField  {
              targetItems {
                id
                name
                ... on Tag {
                  title {
                    value
                  }
                }
              }
            }
          }
          areaTags {
            ... on MultilistField  {
              targetItems {
                id
                name
                ... on Tag {
                  title {
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
`;
