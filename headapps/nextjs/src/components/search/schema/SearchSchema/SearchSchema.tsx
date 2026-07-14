import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import Head from 'next/head';
import { JSX } from 'react';
import {
  TEMPLATE_ID_CONSTANTS,
  matchesTemplate,
  hasBaseTemplate,
} from 'src/constants/template-ids';
import { getBasePageFields } from 'src/util/helpers/base-page-helper';
import { getNewsPageFields } from 'src/util/helpers/news-page-helper';
import { getReflectionPageFields } from 'src/util/helpers/reflection-page-helper';
import {
  extractEnabledGroupEmails,
  collectAncestorGroupEmails,
  hashEmailForSearch,
} from 'src/util/helpers/visibility-helpers';
import { getPagePermissions } from 'lib/auth/page-security-service';
import { log } from 'src/util/helpers/log-helper';

import {
  Item,
  ImageField,
  useSitecore,
  GetComponentServerProps,
  ComponentRendering,
  LayoutServiceData,
} from '@sitecore-content-sdk/nextjs';

import { SearchSchemaProps } from './SearchSchema.types';
import { processTags } from './tag-helpers';

const DEFAULT_EMPTY_DATE = '0001-01-01T00:00:00Z';

function isDefaultEmptyDate(dateString: string | undefined): boolean {
  if (!dateString) return true;
  return dateString === DEFAULT_EMPTY_DATE || dateString.startsWith('0001-01-01');
}

/**
 * Parses a date string that may be in various formats.
 * Handles formats like:
 * - ISO 8601: "2026-01-27T19:36:52Z"
 * - Compact: "20260127T193652Z"
 * - Other standard formats
 */
function parseDateString(dateString: string): Date | null {
  if (!dateString) return null;

  // Try parsing as-is first (handles standard ISO 8601)
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Handle compact format: YYYYMMDDTHHMMSSZ (e.g., "20260127T193652Z")
  const compactFormatMatch = dateString.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (compactFormatMatch) {
    const [, year, month, day, hour, minute, second] = compactFormatMatch;
    // Create ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    date = new Date(isoString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

const LABEL_ALL = 'All' as const;

/** Each bucket owns its label and the maximum age (in days) that qualifies for it. */
const LAST_UPDATE_BUCKETS = [
  { label: 'Past Week', maxDays: 7 },
  { label: 'Past Month', maxDays: 30 },
  { label: 'Past 3 Months', maxDays: 90 },
  { label: 'Past Year', maxDays: 365 },
] as const;

/** Full ordered label list derived from buckets. Export for use in filter components. */
export const LAST_UPDATE_LABELS = [...LAST_UPDATE_BUCKETS.map((b) => b.label), LABEL_ALL] as const;

function computeLastUpdateLabel(dateString: string | undefined): string[] {
  const fallback = [LABEL_ALL];

  if (!dateString || isDefaultEmptyDate(dateString)) return fallback;

  const updatedDate = parseDateString(dateString);
  if (!updatedDate) return fallback;

  const diffDays = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
  if (isNaN(diffDays) || diffDays < 0) return fallback;

  const matchIndex = LAST_UPDATE_BUCKETS.findIndex((b) => diffDays <= b.maxDays);
  if (matchIndex === -1) return fallback;

  return [...LAST_UPDATE_BUCKETS.slice(matchIndex).map((b) => b.label), LABEL_ALL];
}

// Search schema component - flat JSON structure for Sitecore search indexing
const SearchSchemaComponent = (props: SearchSchemaProps): JSX.Element | null => {
  const { fields } = props;
  const { page } = useSitecore();
  if (!page) {
    return null;
  }

  const { layout } = page;
  const route = layout.sitecore.route;
  const basePageFields = getBasePageFields(page);

  const routeWithTemplate = route as { templateName?: string; templateId?: string } | undefined;
  const templateName = routeWithTemplate?.templateName || '';
  const templateId = routeWithTemplate?.templateId;

  const isNewsPage =
    templateName?.toLowerCase().includes('news') ||
    matchesTemplate(templateId, TEMPLATE_ID_CONSTANTS.NEWS_DETAIL_PAGE) ||
    false;

  const isReflectionPage =
    templateName?.toLowerCase().includes('reflection') ||
    matchesTemplate(templateId, TEMPLATE_ID_CONSTANTS.REFLECTION_DETAIL_PAGE) ||
    false;

  const contextTemplate = fields?.data?.contextItem?.template;
  const baseTemplates = contextTemplate?.baseTemplates;

  const isAscensionSite = hasBaseTemplate(baseTemplates, TEMPLATE_ID_CONSTANTS.ASCENSION_SITE);

  const isMarket =
    matchesTemplate(templateId, TEMPLATE_ID_CONSTANTS.MINISTRY_HOME_PAGE) ||
    matchesTemplate(contextTemplate?.id, TEMPLATE_ID_CONSTANTS.MINISTRY_HOME_PAGE);

  // Get base page data (used by all pages)
  const itemId = route?.itemId || '';
  const title = basePageFields?.title?.value?.toString() || '';
  const pageIntroduction = basePageFields?.pageIntroduction?.value?.toString() || '';
  const content = basePageFields?.content?.value?.toString() || '';
  const excerpt = basePageFields?.excerpt?.value?.toString() || '';
  const optionalEyebrow = basePageFields?.optionalEyebrow?.value?.toString() || '';
  const updated = fields?.data?.contextItem?.lastUpdated?.value?.toString() || '';

  // Get thumbnail from route fields (ImageField)
  const thumbnailField = route?.fields?.thumbnail as ImageField | undefined;
  const thumbnail = thumbnailField?.value?.src || '';

  // Prefer direct GraphQL security data (bypasses potentially stale layout service cache)
  // Fall back to ComponentQuery contextItem data if pageSecurityData is unavailable
  const securityData = props.pageSecurityData;
  const pageVisibleByGroups = extractEnabledGroupEmails(
    securityData
      ? securityData.page?.item?.visibleBy?.targetItems
      : fields?.data?.contextItem?.visibleBy?.targetItems
  );
  const ancestorVisibleByGroups = collectAncestorGroupEmails(
    securityData ? securityData.page?.item?.ancestors : fields?.data?.contextItem?.ancestors
  );
  const isGatedByPage = pageVisibleByGroups.length > 0;
  const isGatedByAncestor = ancestorVisibleByGroups.length > 0;
  const isGated = isGatedByPage || isGatedByAncestor;

  // Get all tag fields (used by all pages)
  const siteAreaTags = (route?.fields?.areaTags as Item[]) || [];
  const topicTags = (route?.fields?.topicTags as Item[]) || [];
  const contentTags = (route?.fields?.contentTags as Item[]) || [];
  const siteLevelAssociationTags = (route?.fields?.siteLevelAssociationTags as Item[]) || [];

  // Process each tag field
  const siteAreaData = processTags(siteAreaTags);
  const topicData = processTags(topicTags);
  const contentData = processTags(contentTags);
  const siteLevelAssociationData = processTags(siteLevelAssociationTags);

  const allTags = [...siteAreaData.allTags, ...topicData.allTags, ...contentData.allTags];
  const schema: Record<string, unknown> = {
    templateName,
    itemId,
    resultType: 'Site Page',
    isAscensionSite,
    isMarket,
    isGated,
    isGatedByPage,
    isGatedByAncestor,
    lastUpdateComputed: updated,
    lastUpdateComputedLabel: computeLastUpdateLabel(updated),
    ...(title && { title }),
    ...(pageIntroduction && { pageIntroduction }),
    ...(content && { content }),
    ...(excerpt && { excerpt }),
    ...(optionalEyebrow && { optionalEyebrow }),
    ...(thumbnail && { thumbnail }),
    ...(allTags.length > 0 && { allTags }),
    ...(updated && { updated }),
    ...(siteLevelAssociationData.allTags.length > 0 && {
      siteLevelAssociationTags: siteLevelAssociationData.allTags,
    }),
    ...(pageVisibleByGroups.length > 0 && {
      pageVisibleByGroups,
      pageVisibleByGroupsHashed: pageVisibleByGroups.map(hashEmailForSearch),
    }),
    ...(ancestorVisibleByGroups.length > 0 && {
      ancestorVisibleByGroups,
      ancestorVisibleByGroupsHashed: ancestorVisibleByGroups.map(hashEmailForSearch),
    }),
  };

  if (siteAreaData.allTags.length > 0) {
    schema.siteAreaTags = siteAreaData.allTags;
  }
  if (topicData.allTags.length > 0) {
    schema.topicTags = topicData.allTags;
  }
  if (contentData.allTags.length > 0) {
    schema.contentTags = contentData.allTags;
  }

  // Add category-organized fields for siteAreaTags (only if they have values)
  Object.keys(siteAreaData.byCategoryField).forEach((fieldName) => {
    if (siteAreaData.byCategoryField[fieldName].length > 0) {
      schema[fieldName] = siteAreaData.byCategoryField[fieldName];
    }
  });

  // Add category-organized fields for topicTags (only if they have values)
  Object.keys(topicData.byCategoryField).forEach((fieldName) => {
    if (topicData.byCategoryField[fieldName].length > 0) {
      // If the category field already exists from siteAreaTags, merge the values
      if (schema[fieldName] && Array.isArray(schema[fieldName])) {
        const existingTags = schema[fieldName] as string[];
        const newTags = topicData.byCategoryField[fieldName];

        schema[fieldName] = [...new Set([...existingTags, ...newTags])];
      } else {
        schema[fieldName] = topicData.byCategoryField[fieldName];
      }
    }
  });

  if (isNewsPage) {
    const newsFields = getNewsPageFields(page);

    schema.resultType = 'News Article';

    const lastUpdatedDateOverride = (route?.fields?.lastUpdatedDateOverride as { value?: string })
      ?.value;
    const publishDate = newsFields?.publishDate?.value;
    const publishDateString = publishDate?.toString();

    // Filter out default empty date values
    const validLastUpdatedDateOverride =
      lastUpdatedDateOverride && !isDefaultEmptyDate(lastUpdatedDateOverride)
        ? lastUpdatedDateOverride
        : undefined;
    const validPublishDateString =
      publishDateString && !isDefaultEmptyDate(publishDateString) ? publishDateString : undefined;

    const dateForLabel = validLastUpdatedDateOverride || validPublishDateString;
    if (dateForLabel) {
      schema.lastUpdateComputed = dateForLabel;
      schema.lastUpdateComputedLabel = computeLastUpdateLabel(dateForLabel);
    } else {
      schema.lastUpdateComputedLabel = computeLastUpdateLabel(undefined);
    }

    if (validPublishDateString) {
      schema.publishedDate = publishDateString;
    }
  }

  if (isReflectionPage) {
    const reflectionFields = getReflectionPageFields(page);

    schema.quote = reflectionFields?.quote?.value?.toString() || '';
    schema.author = reflectionFields?.author?.value?.toString() || '';
    schema.description = reflectionFields?.description?.value?.toString() || '';
    schema.resultType = 'Reflection';

    const lastUpdatedDateOverride = (route?.fields?.lastUpdatedDateOverride as { value?: string })
      ?.value;
    const publishDate = reflectionFields?.publishDate?.value;
    const publishDateString = publishDate?.toString();

    // Filter out default empty date values
    const validLastUpdatedDateOverride =
      lastUpdatedDateOverride && !isDefaultEmptyDate(lastUpdatedDateOverride)
        ? lastUpdatedDateOverride
        : undefined;
    const validPublishDateString =
      publishDateString && !isDefaultEmptyDate(publishDateString) ? publishDateString : undefined;

    const dateForLabel = validLastUpdatedDateOverride || validPublishDateString;
    if (dateForLabel) {
      schema.lastUpdateComputed = dateForLabel;
      schema.lastUpdateComputedLabel = computeLastUpdateLabel(dateForLabel);
    } else {
      schema.lastUpdateComputedLabel = computeLastUpdateLabel(undefined);
    }

    if (validPublishDateString) {
      schema.publishedDate = publishDateString;
    }
  }

  return (
    <Head>
      <script
        id="search-schema"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </Head>
  );
};

// Export as Sitecore component with enhancers
export const SearchSchema = compose<SearchSchemaProps>(withStyles())(SearchSchemaComponent);

export default SearchSchema;

export const getComponentServerProps: GetComponentServerProps = async (
  _rendering: ComponentRendering,
  layoutData: LayoutServiceData,
  context
) => {
  const language = layoutData.sitecore.context.language || 'en';
  const pathSegments = (context?.params?.path as string[] | undefined) ?? [];
  const rawPath = pathSegments.length > 0 ? '/' + pathSegments.join('/') : '/';
  // Strip /_site_<name> virtual-folder prefix injected by local dev multi-site routing.
  // In production the site is resolved by hostname and this prefix should be absent.
  const routePath = rawPath.replace(/^\/_site_[^/]*/i, '') || '/';
  const pageSecurityData = await getPagePermissions(routePath, language);

  if (!pageSecurityData) {
    log('WARNING', 'SearchSchema', 'getPagePermissions returned null — visibility will be empty', {
      routePath,
    });
  }

  return { pageSecurityData };
};
