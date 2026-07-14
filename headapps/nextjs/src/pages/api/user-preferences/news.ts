import { UserNewsFeedSearch_GQL } from 'components/IntranetComponents/UserNewsFeed/UserNewsFeed.graphql';
import { getRedisClient } from 'lib/cache/redis';
import { buildUserGroupSet, filterVisibleItems } from 'lib/auth/visibility-filter';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import scConfig from 'sitecore.config';
import { TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';
import { UserNewsFeed_GraphQL } from 'src/models/graphql/user-news-feed';
import { buildMultiFieldOrPredicateString } from 'src/util/graphql/helpers/buildMultiFieldOrPredicateString';
import { toSitecoreDate } from 'src/util/helpers/date-helper';
import { applyEmbargoCutoff } from 'src/util/helpers/embargo-helper';
import { log } from 'src/util/helpers/log-helper';

import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';

import { authOptions } from '../auth/[...nextauth]';

const COMPONENT = 'api:user-preferences/news';
const CACHE_TTL_SECONDS = 15 * 60; // 15 minutes

interface QueryData {
  userfeed?: {
    results: UserNewsFeed_GraphQL[];
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await getServerSession(req, res, authOptions);
  // Inner getServerSession call below populates the session used for filtering.

  try {
    const { tags, systemNewsTags, homePageId, language = 'en', lookupRange = '14' } = req.query;

    const siteHomePageId =
      Array.isArray(homePageId) && homePageId?.length > 0 ? homePageId[0] : (homePageId as string);
    const siteLanguage =
      Array.isArray(language) && language?.length > 0 ? language[0] : (language as string);

    if (!siteHomePageId) {
      log('WARNING', COMPONENT, 'Site home page item ID not found');
      return res.status(404).json({ error: 'Site home page not found' });
    }

    const userTags = tags && !Array.isArray(tags) ? tags?.split(',') : [];
    const fallbackTags =
      systemNewsTags && !Array.isArray(systemNewsTags) ? systemNewsTags.split(',') : [];

    // Get user session and fetch site-level association tags
    const session = await getServerSession(req, res, authOptions);
    const siteLevelTags: string[] = [];

    if (
      session?.newsHomeSite &&
      session?.newsHomeSite?.siteLevelAssociationTags &&
      session?.newsHomeSite?.siteLevelAssociationTags.length > 0
    ) {
      siteLevelTags.push(...session.newsHomeSite.siteLevelAssociationTags.map((tag) => tag.id));
    }
    if (session?.newsSupplementalSites && session?.newsSupplementalSites?.length > 0) {
      siteLevelTags.push(
        ...session.newsSupplementalSites.flatMap(
          (site) => site.siteLevelAssociationTags?.map((tag) => tag.id) || []
        )
      );
    }

    /**
     * Tag precedence: prefer the union of user-selected tags and site-level
     * association tags when either exists; only fall back to system tags when
     * the user has no preferences and the site has no associations, so an
     * unconfigured user still sees a non-empty feed.
     */
    const allTagsToFetch = [...new Set([...userTags, ...siteLevelTags, ...fallbackTags])];

    if (allTagsToFetch.length === 0) {
      return res
        .status(400)
        .json({ error: 'At least one tag is required (either user tags or system tags)' });
    }

    const lookupDays = Number(Array.isArray(lookupRange) ? lookupRange[0] : lookupRange) || 14;

    /**
     * Cache the UNFILTERED article list by query parameters only. The Edge
     * GraphQL response doesn't vary by user (no per-user predicates), so the
     * expensive roundtrip is shareable across every user asking for the same
     * tag combo. The cheap visibleBy filter runs per request below.
     */
    const sortedTags = allTagsToFetch.sort().join(',');
    const cacheKey = `news-feed:${siteHomePageId}:${siteLanguage}:${sortedTags}:${lookupDays}`;

    let allArticles: UserNewsFeed_GraphQL[] | null = null;
    try {
      const redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { articles: UserNewsFeed_GraphQL[] };
        allArticles = parsed.articles ?? [];
      }
    } catch (cacheError) {
      log('WARNING', COMPONENT, 'Cache read failed, proceeding without cache', {
        error: cacheError instanceof Error ? cacheError.message : String(cacheError),
      });
    }

    if (allArticles === null) {
      // Initialize GraphQL client
      const graphQLClientFactory = createGraphQLClientFactory({ api: scConfig.api });
      const graphQLClient = graphQLClientFactory();

      // Build combined OR predicate for all tag fields
      const tagFields = ['areaTags', 'topicTags', 'contentTags'];
      const combinedTagPredicate = buildMultiFieldOrPredicateString(allTagsToFetch, tagFields);

      // Calculate minimum date based on lookupRange
      const oldestAllowedDate = new Date();
      oldestAllowedDate.setUTCDate(oldestAllowedDate.getUTCDate() - lookupDays);
      oldestAllowedDate.setUTCHours(0, 0, 0, 0);
      const minDate = toSitecoreDate(oldestAllowedDate);

      log('INFO', COMPONENT, 'Constructed combinedTagPredicate', {
        combinedTagPredicate,
      });
      let query = UserNewsFeedSearch_GQL;
      query = query.replace('__TAG_PREDICATES__', combinedTagPredicate);
      query = query.replaceAll('__ANCESTOR_ID__', siteHomePageId);
      query = query.replaceAll('__TEMPLATE_ID__', TEMPLATE_ID_CONSTANTS.NEWS_DETAIL_PAGE);
      query = query.replaceAll('__LANGUAGE__', siteLanguage);
      query = query.replaceAll('__MIN_DATE__', minDate);
      query = applyEmbargoCutoff(query);

      log('INFO', COMPONENT, 'Constructed GraphQL query', { query });

      const response = await graphQLClient.request<QueryData>(query);
      allArticles = response.userfeed?.results || [];

      // Cache the unfiltered response so subsequent users can reuse it.
      try {
        const redis = await getRedisClient();
        await redis.set(
          cacheKey,
          JSON.stringify({ articles: allArticles }),
          'EX',
          CACHE_TTL_SECONDS
        );
      } catch (cacheError) {
        log('WARNING', COMPONENT, 'Cache write failed', {
          error: cacheError instanceof Error ? cacheError.message : String(cacheError),
        });
      }
    }

    /**
     * Per-request filter — cheap in-memory iteration. Mirrors the
     * GatekeeperProxy's page + ancestor visibleBy checks so users never see
     * articles in their feed that they would be 403'd from on click.
     */
    const userGroupEmails = buildUserGroupSet(session?.googleGroups);
    const articles = filterVisibleItems(allArticles, userGroupEmails);

    log('INFO', COMPONENT, 'Filtered news feed by visibleBy', {
      total: allArticles.length,
      visible: articles.length,
      userGroupCount: userGroupEmails.size,
    });

    return res.status(200).json({ articles });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('ERROR', COMPONENT, 'Failed to fetch news articles', { error: message });
    return res.status(500).json({ error: message });
  }
}
