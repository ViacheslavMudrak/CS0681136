import { NewsFeedResponse, FetchNewsParams } from './types';

/**
 * Service for fetching user news feed articles
 * This service calls the API route which handles caching and GraphQL queries
 */

async function fetchNewsFeed(params: FetchNewsParams): Promise<NewsFeedResponse> {
  const { tags, homePageId, language = 'en', lookupRange = 14, systemNewsTags = [] } = params;

  // If no user tags and no system tags, return empty
  if ((!tags || tags.length === 0) && (!systemNewsTags || systemNewsTags.length === 0)) {
    return { articles: [] };
  }

  // Build query parameters
  const queryParams = new URLSearchParams({
    homePageId,
    language,
    lookupRange: lookupRange.toString(),
  });

  if (tags && tags.length > 0) {
    queryParams.append('tags', tags.join(','));
  }

  if (systemNewsTags && systemNewsTags.length > 0) {
    queryParams.append('systemNewsTags', systemNewsTags.join(','));
  }

  const url = `/api/user-preferences/news?${queryParams.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  return response.json() as Promise<NewsFeedResponse>;
}

export const newsService = {
  fetchNewsFeed,
};
