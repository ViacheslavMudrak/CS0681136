import { useSwrWithAuth } from 'lib/swr';
import type { MarketNewsHeroApiResponse } from 'src/pages/api/component-data-fetching/market-news-hero';

export interface UseMarketNewsHeroOptions {
  /** Sitecore item ID of the non-market fallback site area tag (from datasource field) */
  nonMarketSiteAreaItemId: string | undefined;
  /** Content language — defaults to 'en' */
  language?: string;
}

export interface UseMarketNewsHeroReturn {
  data: MarketNewsHeroApiResponse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  sessionStatus: string;
}

export function useMarketNewsHero({
  nonMarketSiteAreaItemId,
  language = 'en',
}: UseMarketNewsHeroOptions): UseMarketNewsHeroReturn {
  const params = nonMarketSiteAreaItemId
    ? `nonMarketSiteAreaItemId=${encodeURIComponent(nonMarketSiteAreaItemId)}&language=${encodeURIComponent(language)}`
    : null;

  const { data, isLoading, error, sessionStatus } = useSwrWithAuth<MarketNewsHeroApiResponse>({
    key: params ? `/api/component-data-fetching/market-news-hero?${params}` : null,
    allowAnonymous: true,
  });

  return { data, isLoading, error, sessionStatus };
}
