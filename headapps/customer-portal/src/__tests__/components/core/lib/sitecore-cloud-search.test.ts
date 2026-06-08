import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchNewsWidgetArticles } from "@/lib/sitecore-cloud-search";

const invalidLocaleErrorResponse = {
  dt: 1,
  ts: 1779965751139,
  errors: [
    {
      message: "Validation errors",
      code: 102,
      type: "bad_request",
      severity: "HIGH",
      details: {
        validation_error_1: "requested locale not valid for domain",
      },
    },
  ],
};

const mockComparisonFilter = vi.fn();
const mockGetWidgetData = vi.fn();

vi.mock("@sitecore-cloudsdk/search/browser", () => ({
  ComparisonFilter: vi.fn().mockImplementation(function ComparisonFilter(...args: unknown[]) {
    mockComparisonFilter(...args);
    return { filter: args };
  }),
  Context: vi.fn().mockImplementation((config: { locale: { language: string } }) => ({
    locale: config.locale,
  })),
  SearchWidgetItem: vi.fn().mockImplementation(function SearchWidgetItem(this: {
    limit?: number;
    content?: Record<string, never>;
    filter?: unknown;
  }) {
    return this;
  }),
  WidgetRequestData: vi.fn().mockImplementation((widgets: unknown[]) => ({ widgets })),
  getWidgetData: (...args: unknown[]) => mockGetWidgetData(...args),
  widgetView: vi.fn(),
  widgetItemClick: vi.fn(),
}));

import { SearchWidgetItem } from "@sitecore-cloudsdk/search/browser";

describe("fetchNewsWidgetArticles locale fallback", () => {
  const originalSearchEnv = process.env.NEXT_PUBLIC_SEARCH_ENV;

  beforeEach(() => {
    mockGetWidgetData.mockReset();
    mockComparisonFilter.mockReset();
    vi.mocked(SearchWidgetItem).mockClear();
    delete process.env.NEXT_PUBLIC_SEARCH_ENV;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SEARCH_ENV = originalSearchEnv;
  });

  it("retries with en when the requested locale is invalid for the domain", async () => {
    mockGetWidgetData
      .mockResolvedValueOnce(invalidLocaleErrorResponse)
      .mockResolvedValueOnce({
        widgets: [
          {
            content: [
              {
                id: "1",
                headline: "News title",
                url: "/news/article",
              },
            ],
          },
        ],
      });

    const articles = await fetchNewsWidgetArticles(
      {
        widgetId: "widget-1",
        limit: 3,
        language: "fr",
        pathname: "/dashboard",
      },
      "/default.png"
    );

    expect(mockGetWidgetData).toHaveBeenCalledTimes(2);
    expect(articles).toHaveLength(1);
    expect(articles[0]?.title).toBe("News title");
  });

  it("returns empty results when en is already requested and locale is invalid", async () => {
    mockGetWidgetData.mockResolvedValueOnce(invalidLocaleErrorResponse);

    const articles = await fetchNewsWidgetArticles({
      widgetId: "widget-1",
      limit: 3,
      language: "en",
      pathname: "/dashboard",
    });

    expect(mockGetWidgetData).toHaveBeenCalledTimes(1);
    expect(articles).toEqual([]);
  });

  it("returns empty results for non-locale search errors", async () => {
    mockGetWidgetData.mockResolvedValueOnce({
      dt: 1,
      ts: 1779965751139,
      errors: [
        {
          message: "Validation errors",
          code: 400,
          type: "bad_request",
          severity: "HIGH",
          details: {
            validation_error_1: "some other validation error",
          },
        },
      ],
    });

    const articles = await fetchNewsWidgetArticles({
      widgetId: "widget-1",
      limit: 3,
      language: "fr",
      pathname: "/dashboard",
    });

    expect(mockGetWidgetData).toHaveBeenCalledTimes(1);
    expect(articles).toEqual([]);
  });

  it("applies environment filter when NEXT_PUBLIC_SEARCH_ENV is set", async () => {
    process.env.NEXT_PUBLIC_SEARCH_ENV = "portal";
    mockGetWidgetData.mockResolvedValueOnce({
      widgets: [
        {
          content: [
            {
              id: "1",
              headline: "News title",
              url: "/news/article",
            },
          ],
        },
      ],
    });

    await fetchNewsWidgetArticles({
      widgetId: "widget-1",
      limit: 3,
      language: "en",
      pathname: "/dashboard",
    });

    expect(mockComparisonFilter).toHaveBeenCalledWith("environment", "eq", "portal");
    const widgetInstance = vi.mocked(SearchWidgetItem).mock.instances[0] as {
      filter?: unknown;
    };
    expect(widgetInstance.filter).toEqual({
      filter: ["environment", "eq", "portal"],
    });
  });
});
