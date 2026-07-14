import { TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';

const COLLAB_SPACE_TEMPLATE_ID = TEMPLATE_ID_CONSTANTS.COLLAB_SPACE_SITE_HOME;

export const CollabSiteSearch_GQL = `
  query GetAllCollabSitePages($first: Int = 50, $after: String) {
    collabSites: search(
      first: $first
      after: $after
      where: {
        AND: [
          { name: "_templates", value: "${COLLAB_SPACE_TEMPLATE_ID}", operator: CONTAINS }
          { name: "_path", value: "__ANCESTOR_ID__", operator: CONTAINS }
          { name: "_language", value: "en" }
        ]
      }
      orderBy: { name: "collabSpaceCreationDate", direction: DESC }
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
        collabSiteName: field(name: "title") {
          value
        }
        collabSiteDescription: field(name: "collabSpaceDescription") {
          value
        }
        collabSpaceThumbnail: field(name: "collabSpaceThumbnail") {
          jsonValue
        }
        isHiddenCollabSite: field(name: "isHiddenCollabSite") {
          value
        }
        collabSpaceCreationDate: field(name: "collabSpaceCreationDate") {
          value
        }
        joinRequestEmails: field(name: "joinRequestEmails") {
          value
        }
        visibleBy: field(name: "visibleBy") {
          ... on MultilistField {
            targetItems {
              email: field(name: "email") {
                value
              }
            }
          }
        }
      }
    }
  }
`;
