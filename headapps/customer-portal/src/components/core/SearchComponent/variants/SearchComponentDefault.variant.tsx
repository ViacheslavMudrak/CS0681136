"use client";

import { Text } from "@sitecore-content-sdk/nextjs";
import { faArrowUpRightFromSquare, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useCallback, useMemo } from "react";

import { LinkRender } from "@/components/shared/link-render/LinkRender";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { useNewsInsightsWidget } from "@/hooks/useNewsInsightsWidget";
import type { ComponentProps } from "@/lib/component-props";
import {
  trackDashboardNewsArticleClick,
  trackDashboardNewsViewAll,
} from "@/lib/dashboardAnalytics";
import { toOrderManagementLinkFieldWithHref } from "@/lib/orderManagementUtils";
import { formatNewsArticleDate, trackNewsArticleClick } from "@/lib/sitecore-cloud-search";

import type { ISearchComponentFields, NewsInsightArticle } from "../SearchComponent.type";

export type SearchComponentDefaultVariantProps = ComponentProps & {
  fields?: ISearchComponentFields | null;
};

function NewsArticleRow({
  article,
  defaultImageUrl,
  widgetId,
  locale,
  pathname,
  itemPosition,
}: {
  article: NewsInsightArticle;
  defaultImageUrl: string;
  widgetId: string;
  locale: string;
  pathname: string;
  itemPosition: number;
}): React.ReactElement {
  const imageSrc = article.imageUrl || defaultImageUrl;
  const formattedDate = formatNewsArticleDate(article.postDate, locale);

  const onArticleClick = () => {
    trackNewsArticleClick({ pathname, widgetId, article, itemPosition });
    trackDashboardNewsArticleClick({
      articleTitle: article.title,
      rowPosition: itemPosition,
      linkUrl: article.url,
    });
  };

  return (
    <li className="flex min-h-[90px] items-center border-b border-[var(--color-gray-200,#e8eaeb)] bg-white last:rounded-b-lg last:border-b-0">
      <NewsArticleRowInner
        article={article}
        imageSrc={imageSrc}
        formattedDate={formattedDate}
        onArticleClick={onArticleClick}
      />
    </li>
  );
}

function NewsArticleRowInner({
  article,
  imageSrc,
  formattedDate,
  onArticleClick,
}: {
  article: NewsInsightArticle;
  imageSrc: string;
  formattedDate: string;
  onArticleClick: () => void;
}): React.ReactElement {
  return (
    <div className="flex w-full items-center gap-3 px-5 py-[11px]">
      {imageSrc ? (
        <div className="relative size-[62px] shrink-0 overflow-hidden rounded-[3.5px] bg-[var(--color-gray-100,#f4f4f4)]">
          <Image
            src={imageSrc}
            alt=""
            width={62}
            height={62}
            className="size-full object-cover"
            sizes="62px"
          />
        </div>
      ) : (
        <ThumbPlaceholder />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[5px] py-1">
        <a
          href={article.url}
          className="group inline text-left text-[12px] font-medium leading-[1.375] text-[var(--color-gray-900,#222)] no-underline outline-none transition-colors hover:text-[var(--color-action-link,#0377ba)] focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)]"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onArticleClick}
        >
          <span className="align-middle">{article.title}</span>
          <Icon
            icon={faArrowUpRightFromSquare}
            className="ml-1 inline-block align-middle text-[11px] text-[var(--color-gray-900,#222)] group-hover:text-[var(--color-action-link,#0377ba)]"
            width={11}
            height={11}
            aria-hidden
          />
          <span className="sr-only">Opens in a new tab</span>
        </a>
        {formattedDate ? (
          <p className="text-[10.5px] font-normal leading-[14px] text-[var(--color-gray-600,#7a7b7f)]">
            {formattedDate}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ThumbPlaceholder(): React.ReactElement {
  return (
    <div
      className="relative size-[62px] shrink-0 overflow-hidden rounded-[3.5px] bg-[var(--color-gray-100,#f4f4f4)]"
      aria-hidden
    />
  );
}

function SearchComponentEmptyShell({
  testId,
  paramsStyles,
  id,
  label,
}: {
  testId: string;
  paramsStyles?: string;
  id?: string;
  label: string;
}): React.ReactElement {
  return (
    <div
      className={`component search-component ${paramsStyles ?? ""}`.trim()}
      id={id}
      data-testid={testId}
    >
      <div className="component-content">
        <span className="is-empty-hint">{label}</span>
      </div>
    </div>
  );
}

export function SearchComponentDefaultVariant({
  fields,
  params,
  page,
}: SearchComponentDefaultVariantProps): React.ReactElement | null {
  const { styles: paramsStyles, RenderingIdentifier: id, HideComponent } = params;
  const { isEditing } = page.mode;
  const showSection = isEditing || !Boolean(Number(HideComponent));
  const pathname = usePathname();
  const activeLocale = useActiveLocale();

  const widgetId = String(fields?.SearchWidgetId?.value ?? "").trim();
  const maxItems = Math.max(1, Number(fields?.MaxItemsDisplayed?.value ?? 3) || 3);
  const defaultImageUrl = String(fields?.DefaultImage?.value?.src ?? "").trim();

  const { articles, loading } = useNewsInsightsWidget(
    widgetId,
    maxItems,
    defaultImageUrl,
    showSection
  );

  const viewAllField = useMemo(
    () =>
      fields?.ViewAllURL ? toOrderManagementLinkFieldWithHref(fields.ViewAllURL) ?? fields.ViewAllURL : undefined,
    [fields?.ViewAllURL]
  );

  const viewAllLabelText = String(viewAllField?.value?.text ?? "").trim();
  const hasViewAll = Boolean(viewAllField?.value?.href && (viewAllLabelText || isEditing));

  if (!fields) {
    return (
      <SearchComponentEmptyShell
        testId="search-component"
        paramsStyles={paramsStyles}
        id={id}
        label="Latest news & insights"
      />
    );
  }
  if (!showSection) {
    return null;
  }

  const hasArticles = articles.length > 0;

  const onViewAllClickCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isEditing || !hasArticles) return;
      const t = e.target as HTMLElement | null;
      if (!t?.closest("a")) return;
      trackDashboardNewsViewAll({ itemsDisplayed: articles.length });
    },
    [articles.length, hasArticles, isEditing]
  );

  /** Zero published articles: hide the whole section on the live dashboard (no empty state). */
  if (!isEditing && (loading || !hasArticles)) {
    return null;
  }

  return (
    <section
      className={`component search-component ${paramsStyles ?? ""}`.trim()}
      id={id}
      data-testid="search-component"
      aria-label={String(fields.SectionTitle?.value ?? "Latest news and insights")}
    >
      <div
        className={
          "overflow-hidden rounded-lg border border-[var(--color-gray-200,#e8eaeb)] bg-white p-px"
        }
      >
        <div
          className={
            "flex min-h-[61px] flex-wrap shrink-0 items-center justify-between gap-3 border-b border-[var(--color-gray-200,#e8eaeb)] px-[20px] pt-[20px] pb-[16px]"
          }
        >
          <div className="min-h-0 min-w-0 flex-1">
            {fields.SectionTitle?.value && (
              <h2 className="text-left text-[14px] font-medium leading-[1.375] text-black">
                <Text field={fields.SectionTitle} tag="span" />
              </h2>
            )}
          </div>
          {hasViewAll && viewAllField ? (
            <div onClickCapture={onViewAllClickCapture}>
              {isEditing ? (
                <span className={`${"shrink-0 text-[13px] font-bold leading-tight text-[var(--color-link-text)] no-underline hover:underline"} ${"inline-flex items-center gap-1"}`}>
                  <LinkRender
                    field={viewAllField}
                    className="shrink-0 text-[13px] font-bold leading-tight text-[var(--color-link-text)] no-underline hover:underline"
                    editable
                  />
                  <Icon
                    icon={faChevronRight}
                    className="text-[10px] text-[var(--color-link-text)]"
                    aria-hidden
                  />
                </span>
              ) : (
                <LinkRender
                  field={viewAllField}
                  className={`${"shrink-0 text-[13px] font-bold leading-tight text-[var(--color-link-text)] no-underline hover:underline"} ${"inline-flex items-center gap-1"}`}
                  editable={false}
                  showLinkTextWithChildrenPresent
                >
                  <Icon
                    icon={faChevronRight}
                    className="text-[10px] text-[var(--color-link-text)]"
                    aria-hidden
                  />
                </LinkRender>
              )}
            </div>
          ) : null}
        </div>

        {hasArticles || (!isEditing && loading) ? (
          <div className="flex flex-1 flex-col">
            {loading && !isEditing ? (
              <div className="animate-pulse space-y-0 px-5 py-4" aria-busy="true">
                <div className="mb-3 h-[68px] rounded bg-[var(--color-gray-200,#e8e8e8)] last:mb-0" />
                <div className="mb-3 h-[68px] rounded bg-[var(--color-gray-200,#e8e8e8)] last:mb-0" />
                <div className="mb-3 h-[68px] rounded bg-[var(--color-gray-200,#e8e8e8)] last:mb-0" />
              </div>
            ) : hasArticles ? (
              <ul className="m-0 list-none p-0">
                {articles.map((article, index) => (
                  <NewsArticleRow
                    key={article.id}
                    article={article}
                    defaultImageUrl={defaultImageUrl}
                    widgetId={widgetId}
                    locale={activeLocale}
                    pathname={pathname}
                    itemPosition={index + 1}
                  />
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
