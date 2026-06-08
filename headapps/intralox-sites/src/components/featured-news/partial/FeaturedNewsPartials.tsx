import { JSX } from 'react';
import {
  Link as ContentSdkLink,
  NextImage,
  Text,
  type LinkField,
  type TextField,
} from '@sitecore-content-sdk/nextjs';

import {
  FeaturedNewsReadMoreLink,
  FeaturedNewsViewAllChevron,
} from 'components/featured-news/partial/FeaturedNewsReadMoreLink';
import type { FeaturedNewsArticleRow } from 'components/featured-news/FeaturedNews.type';
import {
  FEATURED_NEWS_HERO_THUMB_LINK_FALLBACK_ARIA,
  FEATURED_NEWS_LIST_FALLBACK_ARIA,
  featuredNewsListingKey,
  getArticleListingUrl,
  imageFieldFromUrl,
  resolveArticleThumbnailUrl,
  stripFeaturedNewsSummaryHtml,
  type FeaturedNewsCardSizeKey,
} from 'components/featured-news/featuredNewsUtils';
import type { MediaTileHeadlineThemeKey } from 'components/media-tile/MediaTile.type';
import { cn } from 'lib/utils';

export interface FeaturedNewsHeroProps {
  row: FeaturedNewsArticleRow;
  cardSizeKey: FeaturedNewsCardSizeKey;
  isEditing: boolean;
}

/**
 * Primary featured article: thumbnail, title, category, date, summary, and Read More when an article URL exists.
 */
export function FeaturedNewsHero({
  row,
  cardSizeKey,
  isEditing,
}: FeaturedNewsHeroProps): JSX.Element {
  const thumbSrc = resolveArticleThumbnailUrl(row);
  const titleText = typeof row.Title === 'string' ? row.Title.trim() : '';
  const showTitle = titleText.length > 0;
  const summaryPlain = stripFeaturedNewsSummaryHtml(row.Summary);
  const showSummary = summaryPlain.length > 0;
  const articleType = typeof row.ArticleType === 'string' ? row.ArticleType.trim() : '';
  const showBadge = articleType.length > 0;
  const showDate =
    !row.HideDate && typeof row.PostDate === 'string' && row.PostDate.trim().length > 0;
  const articleUrl = getArticleListingUrl(row);
  const showImage = Boolean(thumbSrc);
  const hasArticleUrl = articleUrl.length > 0;
  const linkImageThumb = hasArticleUrl && !isEditing;
  const heroThumbLinkAriaLabel =
    titleText.length > 0 ? titleText
    : articleType.length > 0 ? articleType
    : FEATURED_NEWS_HERO_THUMB_LINK_FALLBACK_ARIA;

  const titleBlock =
    showTitle ?
      hasArticleUrl ?
        <h2 className="!m-0">
          <ContentSdkLink
            field={{ value: { href: articleUrl, text: titleText } }}
            className={cn(
              'block font-media-tile font-bold text-ink-primary transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-in-out motion-reduce:transition-none [-webkit-tap-highlight-color:transparent]',
              'cursor-pointer no-underline hover:text-ink-tertiary rounded-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              cardSizeKey === 'sm' && 'text-font-medium leading-5',
              cardSizeKey === 'lg' && 'text-font-extrabig leading-[30px]',
              cardSizeKey === 'default' && 'text-font-large leading-[22.5px]',
            )}
          />
        </h2>
      : <h2
          className={cn(
            'font-media-tile font-bold text-ink-primary !m-0 [-webkit-tap-highlight-color:transparent]',
            cardSizeKey === 'sm' && 'text-font-medium leading-5',
            cardSizeKey === 'lg' && 'text-font-extrabig leading-[30px]',
            cardSizeKey === 'default' && 'text-font-large leading-[22.5px]',
          )}
        >
          {titleText}
        </h2>
    : null;

  const metaRow =
    showBadge || showDate ?
      <div className="mt-1 mb-2 flex flex-wrap items-center gap-4">
        {showBadge ?
          <span className="inline-block max-w-full shrink-0 rounded border border-accent-warning bg-accent-tag px-2 pb-[3px] pt-[2px] font-media-tile text-[length:12px] font-normal leading-[15px] text-ink-primary [-webkit-tap-highlight-color:transparent]">
            {articleType}
          </span>
        : null}
        {showDate ?
          <time
            className="block font-media-tile text-[length:12px] font-normal leading-[18px] text-ink-tertiary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
            dateTime={undefined}
          >
            {row.PostDate}
          </time>
        : null}
      </div>
    : null;

  const summaryBlock =
    showSummary ?
      <p className="mt-4 font-media-tile text-font-media-tile-eyebrow font-normal leading-[21px] text-chrome-stripe [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]">
        {summaryPlain}
      </p>
    : null;

  const readMoreBlock =
    hasArticleUrl ?
      <div className="mt-2">
        <FeaturedNewsReadMoreLink href={articleUrl} />
      </div>
    : null;

  const heroThumbImage = (
    <NextImage
      field={imageFieldFromUrl(thumbSrc!, titleText || articleType)}
      fill
      className="absolute inset-0 bottom-0 left-0 right-0 top-0 box-border m-0 block h-full w-full max-w-full min-h-0 overflow-x-clip overflow-y-clip p-0 align-middle object-cover object-center font-media-tile text-font-medium leading-6 [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent] transition-opacity duration-150 ease-in-out motion-reduce:transition-none border-0 border-solid border-stroke-default text-ink-primary"
      sizes="(max-width: 599px) 50vw, (max-width: 767px) 173px, (max-width: 991px) 120px, (max-width: 1199px) 165px, 206px"
    />
  );

  const imageBlock =
    showImage ?
      <div className="relative box-border block shrink-0 cursor-pointer overflow-x-clip overflow-y-clip border-4 border-solid border-stroke-default bg-surface-muted-light transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to] duration-150 ease-in-out motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] h-[calc(94.8px+0.175*(100vw-600px))] w-[min(100%,calc((100vw-104px)/3+8px))] min-[600px]:h-[calc(86.8px+8px)] min-[600px]:w-[calc(165.33px+8px)] min-[768px]:h-[calc(58.52px+8px)] min-[768px]:w-[calc(111.46px+8px)] min-[992px]:h-[calc(82.03px+8px)] min-[992px]:w-[calc(156.26px+8px)] min-[1200px]:h-[calc(103.88px+8px)] min-[1200px]:w-[calc(197.86px+8px)]">
        {linkImageThumb ?
          <ContentSdkLink
            field={{ value: { href: articleUrl, text: titleText || articleType || heroThumbLinkAriaLabel } }}
            className="relative block h-full w-full rounded-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label={heroThumbLinkAriaLabel}
          >
            {heroThumbImage}
          </ContentSdkLink>
        : heroThumbImage}
      </div>
    : null;

  return (
    <article className="min-w-0 w-full flex-1 md:w-auto md:flex-none md:min-w-0">
      <div className="flex flex-row items-start gap-0">
        {imageBlock}
        <div className="min-w-0 flex-1 max-w-[min(100%,calc(100vw*2/3-5.34px))] pl-6 min-[601px]:pl-8 min-[600px]:max-w-[394.66px] min-[768px]:max-w-[302.93px] min-[992px]:max-w-[392.53px] min-[1200px]:max-w-[475.73px]">
          {titleBlock}
          {metaRow}
          {summaryBlock}
          {readMoreBlock}
        </div>
      </div>
    </article>
  );
}

export interface FeaturedNewsAsideProps {
  headlineField: TextField | undefined;
  themeKey: MediaTileHeadlineThemeKey;
  isDarkSurface: boolean;
  hasExplicitTheme: boolean;
  viewAllLink: LinkField | undefined;
  secondaryRows: FeaturedNewsArticleRow[];
  headingId: string;
  isEditing: boolean;
}

/**
 * Secondary column: section title, View All link, list of additional articles.
 */
export function FeaturedNewsAside({
  headlineField,
  themeKey,
  isDarkSurface,
  hasExplicitTheme,
  viewAllLink,
  secondaryRows,
  headingId,
  isEditing,
}: FeaturedNewsAsideProps): JSX.Element {
  const headlineHasValue =
    headlineField != null &&
    (String(headlineField.value ?? '').trim().length > 0 || isEditing);
  const showViewAll =
    viewAllLink != null &&
    typeof viewAllLink.value?.href === 'string' &&
    viewAllLink.value.href.trim().length > 0;

  const headingContent =
    headlineHasValue ?
      <h2
        id={headingId}
        className={cn(
          !hasExplicitTheme && [
            'box-border block !m-0 !border-0 !p-0 font-media-tile text-font-medium font-bold leading-6 uppercase tracking-[0.4px] [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
            isDarkSurface ? 'text-ink-inverse' : 'text-ink-muted',
          ],
          hasExplicitTheme && [
            'box-border block !m-0 !border-0 !p-0 font-media-tile font-bold [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
            isDarkSurface && 'text-font-big leading-[27.5px] normal-case text-ink-inverse',
            !isDarkSurface && themeKey === 'article' && 'text-font-big leading-[27.5px] uppercase text-accent-cyan',
            !isDarkSurface && themeKey === 'compact' && 'text-font-large leading-[24.75px] normal-case text-ink-primary',
            !isDarkSurface && themeKey !== 'article' && themeKey !== 'compact' && 'text-font-big leading-[27.5px] normal-case text-ink-primary',
          ],
        )}
      >
        <Text tag="span" field={headlineField ?? { value: '' }} />
      </h2>
    : (
        <h2 id={headingId} className="!m-0 sr-only">
          {FEATURED_NEWS_LIST_FALLBACK_ARIA}
        </h2>
      );

  return (
    <aside className="hidden min-w-0 w-full md:block md:min-w-0 md:flex-1 md:pl-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-stroke-default pb-1">
        <div className="min-w-0 flex-1">{headingContent}</div>
        {showViewAll ?
          <ContentSdkLink
            field={viewAllLink}
            className="box-border inline-flex shrink-0 cursor-pointer items-center gap-0 border-0 bg-transparent !p-0 font-media-tile text-[length:12px] font-normal leading-[18px] text-link no-underline decoration-solid underline-offset-2 transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-in-out motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] hover:text-link-strong hover:underline rounded-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <span>{viewAllLink.value?.text ?? viewAllLink.value?.href}</span>
            <FeaturedNewsViewAllChevron />
          </ContentSdkLink>
        : null}
      </div>
      {secondaryRows.length > 0 ?
        <ul
          className="m-0 ml-0! list-none divide-y divide-stroke-default p-0 pl-0!"
          role="list"
        >
          {secondaryRows.map((row, idx) => {
            const key = featuredNewsListingKey(row, idx + 1);
            const date =
              !row.HideDate && typeof row.PostDate === 'string' && row.PostDate.trim().length > 0 ?
                row.PostDate.trim()
              : '';
            const title = typeof row.Title === 'string' ? row.Title.trim() : '';
            const url = getArticleListingUrl(row);
            const hasResolvedArticleUrl = url.length > 0;
            const hasTitleLink = Boolean(title) && hasResolvedArticleUrl;

            if (!date && !title) {
              return null;
            }

            return (
              <li key={key} className="m-0 ml-0! list-none pl-0!" role="listitem">
                {hasTitleLink ?
                  <ContentSdkLink
                    field={{ value: { href: url, text: title } }}
                    className="group box-border m-0 block w-full cursor-pointer border-0 bg-transparent py-3 px-0 text-left no-underline transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-in-out motion-reduce:transition-none [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] rounded-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-0"
                  >
                    {date ?
                      <p className="box-border m-0 block border-0 p-0 font-media-tile text-[length:12px] font-normal leading-[15px] text-ink-tertiary [-webkit-tap-highlight-color:transparent]">
                        {date}
                      </p>
                    : null}
                    <span className="box-border m-0 block w-full border-0 p-0 text-left font-media-tile text-font-media-tile-eyebrow font-bold leading-font-media-tile-eyebrow text-ink-muted transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-in-out motion-reduce:transition-none [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] group-hover:text-ink-tertiary">
                      {title}
                    </span>
                  </ContentSdkLink>
                : (
                  <div className="py-3">
                    {date ?
                      <p className="box-border m-0 block border-0 p-0 font-media-tile text-[length:12px] font-normal leading-[15px] text-ink-tertiary [-webkit-tap-highlight-color:transparent]">
                        {date}
                      </p>
                    : null}
                    {title ?
                      <p className="box-border m-0 block border-0 p-0 text-left font-media-tile text-font-media-tile-eyebrow font-bold leading-font-media-tile-eyebrow text-ink-muted [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]">
                        {title}
                      </p>
                    : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      : null}
    </aside>
  );
}
