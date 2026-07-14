export type TemplateFilterOptions = {
  templateFiltersInclude?: string[];
  templateFiltersExclude?: string[];
};

function buildIncludePredicate(templateFiltersInclude?: string[]): string {
  if (!templateFiltersInclude?.length) {
    return `{ name: "_templates", value: $baseTemplateId, operator: CONTAINS }`;
  }

  if (templateFiltersInclude.length === 1) {
    return `{ name: "_templates", value: "${templateFiltersInclude[0]}", operator: CONTAINS }`;
  }

  const orClauses = templateFiltersInclude
    .map((id) => `{ name: "_templates", value: "${id}", operator: CONTAINS }`)
    .join('\n              ');

  return `{
              OR: [
                ${orClauses}
              ]
            }`;
}

function buildExcludePredicates(templateFiltersExclude?: string[]): string {
  if (!templateFiltersExclude?.length) return '';

  return templateFiltersExclude
    .map((id) => `{ name: "_templates", value: "${id}", operator: NCONTAINS }`)
    .join('\n            ');
}

export function buildGetPagesByLastUpdatedQuery(options: TemplateFilterOptions = {}): string {
  const { templateFiltersInclude, templateFiltersExclude } = options;
  const hasCustomInclude = Boolean(templateFiltersInclude?.length);

  const includePredicate = buildIncludePredicate(templateFiltersInclude);
  const excludePredicates = buildExcludePredicates(templateFiltersExclude);

  const baseTemplateVariable = hasCustomInclude ? '' : '$baseTemplateId: String!';

  return /* GraphQL */ `
    query SearchBasePages(
      $startLocationId: String!
      ${baseTemplateVariable}
      $language: String!
      $pageSize: Int = 10
      $endCursor: String = ""
    ) {
      search(
        where: {
          AND: [
            { name: "_path", value: $startLocationId, operator: CONTAINS }
            ${includePredicate}
            ${excludePredicates}
            { name: "_language", value: $language }
            { name: "_latestversion", value: "1" }
          ]
        }
        first: $pageSize
        after: $endCursor
      ) {
        total
        pageInfo {
          endCursor
          hasNext
        }
        results {
          id
          name
          path
          lastUpdated: field(name: "__Updated") {
            value
          }
          template {
            id
            name
          }
          url {
            path
          }
        }
      }
    }
  `;
}
