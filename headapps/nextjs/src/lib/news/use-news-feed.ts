import { newsService } from 'lib/news/news-service';
import { NewsFeedResponse } from 'lib/news/types';
import { useSwr } from 'lib/swr/use-swr-hook';
import { useCallback } from 'react';
import type { UserNewsFeed_GraphQL } from 'src/models/graphql/user-news-feed';

interface UseNewsFeedOptions {
  tags: string[] | null;
  homePageId: string;
  language?: string;
  lookupRange?: number;
  systemNewsTags?: string[];
}

interface UseNewsFeedResult {
  articles: UserNewsFeed_GraphQL[];
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => Promise<NewsFeedResponse | undefined>;
}

export function useNewsFeed({
  tags,
  homePageId,
  language = 'en',
  lookupRange = 14,
  systemNewsTags = [],
}: UseNewsFeedOptions): UseNewsFeedResult {
  // Generate cache key based on parameters
  // Return null if tags are not ready to prevent premature fetching
  const cacheKey = useCallback(() => {
    if ((!tags || tags.length === 0) && (!systemNewsTags || systemNewsTags.length === 0)) {
      return null;
    }
    // Dedupe and sort tags for consistent cache key
    const sortedTags = Array.from(new Set(tags || []))
      .sort()
      .join(',');
    const sortedSystemTags = Array.from(new Set(systemNewsTags || []))
      .sort()
      .join(',');
    return `/api/user-preferences/news?tags=${sortedTags}&systemNewsTags=${sortedSystemTags}&homePageId=${homePageId}&language=${language}&lookupRange=${lookupRange}`;
  }, [tags, systemNewsTags, homePageId, language, lookupRange]);

  // Custom fetcher that uses the news service
  const fetcher = useCallback(async (): Promise<NewsFeedResponse> => {
    if ((!tags || tags.length === 0) && (!systemNewsTags || systemNewsTags.length === 0)) {
      return { articles: [] };
    }
    return newsService.fetchNewsFeed({ tags, homePageId, language, lookupRange, systemNewsTags });
  }, [tags, systemNewsTags, homePageId, language, lookupRange]);

  // Use SWR hook for data fetching and caching
  const { data, isLoading, error, mutate } = useSwr<NewsFeedResponse>({
    key: cacheKey,
    fetcher,
  });

  return {
    articles: data?.articles || [],
    isLoading,
    error,
    mutate,
  };
}
