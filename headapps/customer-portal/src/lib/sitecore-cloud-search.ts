import {
  ComparisonFilter,
  Context,
  getWidgetData,
  SearchWidgetItem,
  WidgetRequestData,
  widgetItemClick,
  widgetView,
  type SearchEventEntity,
} from "@sitecore-cloudsdk/search/browser";

import type { NewsInsightArticle } from "@/components/core/SearchComponent/SearchComponent.type";

/** Sitecore Search entity for editorial / news content (see intralox-sites search widgets). */
export const SEARCH_CONTENT_ENTITY = "content";

interface RawSearchContentItem {
  id?: string;
  type?: string;
  headline?: string;
  name?: string;
  image_url?: string;
  url?: string;
  post_date?: string;
  summary?: string;
  [key: string]: unknown;
}

interface SearchWidgetResponse {
  content?: RawSearchContentItem[];
}

interface SearchApiError {
  message?: string;
  code?: number;
  details?: Record<string, unknown>;
}

interface SearchApiResponse {
  widgets?: SearchWidgetResponse[];
  errors?: SearchApiError[];
}

/** Fallback when Sitecore Search rejects a locale for the current domain. */
const DEFAULT_SEARCH_LANGUAGE = "en";
const INVALID_LOCALE_MESSAGE = "requested locale not valid for domain";

function normalizeSearchLanguage(language: string): string {
  return language.trim().toLowerCase() || DEFAULT_SEARCH_LANGUAGE;
}

function getResponseErrors(response: unknown): SearchApiError[] {
  if (!response || typeof response !== "object") {
    return [];
  }

  const errors = (response as SearchApiResponse).errors;
  return Array.isArray(errors) ? errors : [];
}

function hasInvalidLocaleError(errors: SearchApiError[]): boolean {
  return errors.some((error) =>
    Object.values(error.details ?? {}).some(
      (detail) =>
        typeof detail === "string" && detail.toLowerCase().includes(INVALID_LOCALE_MESSAGE)
    )
  );
}

function extractWidgetContent(response: unknown): RawSearchContentItem[] {
  const widgets = (response as SearchApiResponse | null)?.widgets;
  return widgets?.[0]?.content ?? [];
}

function applySearchEnvironmentFilter(widget: SearchWidgetItem): void {
  const searchEnvFilter = process.env.NEXT_PUBLIC_SEARCH_ENV?.trim();
  if (searchEnvFilter) {
    widget.filter = new ComparisonFilter("environment", "eq", searchEnvFilter);
  }
}

async function loadWidgetSearchContent(
  widgetId: string,
  limit: number,
  language: string
): Promise<RawSearchContentItem[]> {
  const normalizedLanguage = normalizeSearchLanguage(language);
  const context = new Context({
    locale: {
      language: normalizedLanguage,
      country: countryForLanguage(normalizedLanguage),
    },
  });

  const widget = new SearchWidgetItem(SEARCH_CONTENT_ENTITY, widgetId);
  widget.limit = Math.max(1, limit);
  widget.content = {};
  applySearchEnvironmentFilter(widget);

  const response = await getWidgetData(new WidgetRequestData([widget]), context);
  const errors = getResponseErrors(response);

  if (errors.length > 0) {
    if (normalizedLanguage !== DEFAULT_SEARCH_LANGUAGE && hasInvalidLocaleError(errors)) {
      return loadWidgetSearchContent(widgetId, limit, DEFAULT_SEARCH_LANGUAGE);
    }

    return [];
  }

  return extractWidgetContent(response);
}

function countryForLanguage(language: string): string {
  const lang = language.trim().toLowerCase();
  if (lang === "en-ca") return "ca";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("ja")) return "jp";
  if (lang.startsWith("zh")) return "cn";
  return "us";
}

function pickString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function mapContentItemToArticle(
  item: RawSearchContentItem,
  index: number,
  defaultImageUrl: string
): NewsInsightArticle | null {
  const url = pickString(item.url);
  const title = pickString(item.headline, item.name, item.summary);
  if (!url || !title) return null;

  const id = pickString(item.id) || `news-${index}`;
  const imageUrl = pickString(item.image_url) || defaultImageUrl;

  return {
    id,
    title,
    url,
    imageUrl,
    postDate: pickString(item.post_date),
    entityType: pickString(item.type) || SEARCH_CONTENT_ENTITY,
  };
}

export function formatNewsArticleDate(postDate: string, locale: string): string {
  const raw = postDate.trim();
  if (!raw) return "";

  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return raw;

  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(parsed));
  } catch {
    return raw;
  }
}

/**
 * Loads news articles from a Sitecore Search widget via Cloud SDK (`getWidgetData`).
 * When `NEXT_PUBLIC_SEARCH_ENV` is set, results are filtered by the `environment` field.
 */
export async function fetchNewsWidgetArticles(
  options: FetchNewsWidgetOptions,
  defaultImageUrl = ""
): Promise<NewsInsightArticle[]> {
  const widgetId = options.widgetId.trim();
  if (!widgetId) return [];

  const requestedLanguage = normalizeSearchLanguage(options.language);
  const content = await loadWidgetSearchContent(widgetId, options.limit, requestedLanguage);

  const articles = content
    .map((item, index) => mapContentItemToArticle(item, index, defaultImageUrl))
    .filter((row): row is NewsInsightArticle => row != null);

  if (articles.length > 0) {
    const entities: SearchEventEntity[] = articles.map((a) => ({
      entity: a.entityType ?? SEARCH_CONTENT_ENTITY,
      id: a.id,
      uri: a.url,
    }));

    widgetView({
      pathname: options.pathname,
      widgetId,
      request: {
        numResults: articles.length,
        numRequested: options.limit,
      },
      entities,
    });
  }

  return articles;
}

export function trackNewsArticleClick(options: {
  pathname: string;
  widgetId: string;
  article: NewsInsightArticle;
  itemPosition: number;
}): void {
  const widgetId = options.widgetId.trim();
  if (!widgetId) return;

  widgetItemClick({
    pathname: options.pathname,
    widgetId,
    itemPosition: options.itemPosition,
    request: {},
    entity: {
      entity: options.article.entityType ?? SEARCH_CONTENT_ENTITY,
      id: options.article.id,
      uri: options.article.url,
    },
  });
}

export interface FetchNewsWidgetOptions {
  widgetId: string;
  limit: number;
  language: string;
  pathname: string;
}
