"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { NewsInsightArticle } from "@/components/core/SearchComponent/SearchComponent.type";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { fetchNewsWidgetArticles } from "@/lib/sitecore-cloud-search";

export interface UseNewsInsightsWidgetResult {
  articles: NewsInsightArticle[];
  loading: boolean;
}

export function useNewsInsightsWidget(
  widgetId: string | undefined,
  limit: number,
  defaultImageUrl: string,
  enabled = true
): UseNewsInsightsWidgetResult {
  const pathname = usePathname();
  const activeLocale = useActiveLocale();
  const [articles, setArticles] = useState<NewsInsightArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setArticles([]);
      setLoading(false);
      return;
    }

    const id = widgetId?.trim() ?? "";
    if (!id) {
      setArticles([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const rows = await fetchNewsWidgetArticles(
          {
            widgetId: id,
            limit,
            language: activeLocale,
            pathname,
          },
          defaultImageUrl
        );
        if (!cancelled) {
          setArticles(rows);
        }
      } catch {
        if (!cancelled) {
          setArticles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, widgetId, limit, defaultImageUrl, activeLocale, pathname]);

  return { articles, loading };
}
