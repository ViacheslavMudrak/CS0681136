import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';

import { TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';
import { clientFactory } from 'src/lib/sitecore-client';
import type {
  GetPagesByLastUpdatedParams,
  PublishedPageResult,
  SearchResponse,
  SearchResultItem,
} from './types/PagesByLastUpdated';
import { buildGetPagesByLastUpdatedQuery } from 'src/util/graphql/queries/getPagesByLastUpdated.graphql';
import { log } from 'src/util/helpers/log-helper';

const COMPONENT = 'SitecoreReportingService';
const PAGE_SIZE = 250;
const LANGUAGE = 'en';
const START_LOCATION_ID = '103C8B2F-80E2-4FA6-A6C6-B1C621D0110D';

/** Parse Sitecore compact ISO date "20251119T224229Z" into a Date. */
function parseSitecoreDate(value: string): Date {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) return new Date(value);
  const [, y, mo, d, h, mi, s] = match;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
}

function isWithinDateRange(item: SearchResultItem, startDate: string, endDate?: string): boolean {
  const updatedMs = parseSitecoreDate(item.lastUpdated.value).getTime();
  const startMs = new Date(startDate).getTime();
  if (updatedMs < startMs) return false;
  if (endDate) {
    const endMs = new Date(endDate).getTime();
    if (updatedMs > endMs) return false;
  }
  return true;
}

export async function getPagesByLastUpdated(
  params: GetPagesByLastUpdatedParams
): Promise<PublishedPageResult[]> {
  const { startDate, endDate, edgeContextId, templateFiltersInclude, templateFiltersExclude } =
    params;

  log('INFO', COMPONENT, 'start', {
    startDate,
    endDate,
    edgeContextId: edgeContextId ?? 'default',
    templateFiltersInclude,
    templateFiltersExclude,
  });

  const factory = edgeContextId
    ? createGraphQLClientFactory({ api: { edge: { contextId: edgeContextId } } })
    : clientFactory;

  const query = buildGetPagesByLastUpdatedQuery({
    templateFiltersInclude,
    templateFiltersExclude,
  });
  const allResults: PublishedPageResult[] = [];
  let endCursor = '';
  let hasNext = true;
  const hasCustomInclude = Boolean(templateFiltersInclude?.length);

  try {
    while (hasNext) {
      const variables: Record<string, unknown> = {
        startLocationId: START_LOCATION_ID,
        language: LANGUAGE,
        pageSize: PAGE_SIZE,
        endCursor,
      };

      if (!hasCustomInclude) {
        variables.baseTemplateId = TEMPLATE_ID_CONSTANTS.BASE_PAGE;
      }

      const client = factory();
      const data = await client.request<SearchResponse>(query, variables);

      // log('INFO', COMPONENT, 'page fetched', {
      //   total: data.search.total,
      //   resultsInPage: data.search.results.length,
      //   hasNext: data.search.pageInfo.hasNext,
      //   endCursor: data.search.pageInfo.endCursor,
      // });

      for (const item of data.search.results) {
        if (isWithinDateRange(item, startDate, endDate)) {
          allResults.push({
            Name: item.name,
            'Page Path': item.url.path,
            'Last Updated': item.lastUpdated.value,
            ID: item.id,
            'Template ID': item.template.id,
            'Template Name': item.template.name,
          });
        }
      }

      hasNext = data.search.pageInfo.hasNext;
      endCursor = data.search.pageInfo.endCursor;
    }

    allResults.sort((a, b) => b['Last Updated'].localeCompare(a['Last Updated']));

    log('INFO', COMPONENT, 'complete', { totalResults: allResults.length });
    return allResults;
  } catch (error) {
    log('ERROR', COMPONENT, 'query failed', { error: String(error) });
    throw error;
  }
}
