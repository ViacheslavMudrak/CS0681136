import type { UserNewsFeed_GraphQL } from 'src/models/graphql/user-news-feed';

/**
 * Response from the news feed API
 */
export interface NewsFeedResponse {
  articles: UserNewsFeed_GraphQL[];
}

/**
 * Parameters for fetching news
 */
export interface FetchNewsParams {
  tags?: string[] | null;
  homePageId: string;
  language?: string;
  lookupRange?: number;
  systemNewsTags?: string[];
}
