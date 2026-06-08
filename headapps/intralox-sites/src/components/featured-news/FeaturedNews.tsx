import { JSX } from 'react';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';
import type { MediaTileHeadlineThemeKey } from 'components/media-tile/MediaTile.type';
import type { FeaturedNewsProps } from 'components/featured-news/FeaturedNews.type';
import {
  extractArticleListings,
  FEATURED_NEWS_EMPTY_DATASOURCE,
  FEATURED_NEWS_EMPTY_LISTINGS_EDITING_HINT,
  FEATURED_NEWS_REGION_ARIA,
  featuredNewsHasVisitorContent,
  normalizeFeaturedNewsThemeKey,
  parseViewAllLinkField,
  readFeaturedNewsParamValue,
  resolveFeaturedNewsCardSizeKey,
} from 'components/featured-news/featuredNewsUtils';
import { FeaturedNewsAside, FeaturedNewsHero } from 'components/featured-news/partial/FeaturedNewsPartials';
import { renderingAnchorId, renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

/**
 * Content Highlight (Featured News): latest article feature plus secondary list and View All link.
 * Article rows are populated by Sitecore FeaturedNewsContentResolver; datasource headline / view-all are editable.
 *
 * @param fields - Layout fields including `ArticleListings` and `ViewAllLink`
 * @param params - Rendering params (`ColorScheme`, `CardSize`, optional `Theme`, `styles`, `RenderingIdentifier`).
 *   Omitting `Theme` keeps the legacy live aside headline; set `Theme` to opt into base / article / compact / landing typography.
 * @param page - Page context for `isEditing`
 */
export function Default({ fields, params, page }: FeaturedNewsProps): JSX.Element | null {
  const isEditing = page.mode.isEditing;
  const anchor = renderingAnchorIdProps(params.RenderingIdentifier);
  const styles = params.styles ?? '';
  const paramsRecord = params as Record<string, unknown>;
  const colorSchemeRaw = readFeaturedNewsParamValue(paramsRecord, 'ColorScheme');
  const cardSizeRaw = readFeaturedNewsParamValue(paramsRecord, 'CardSize');
  const themeRaw = readFeaturedNewsParamValue(paramsRecord, 'Theme');
  const hasExplicitFeaturedNewsTheme = Boolean(themeRaw?.trim());
  const themeKey = normalizeFeaturedNewsThemeKey(themeRaw);
  const colorScheme = colorSchemeRaw?.toLowerCase().trim();
  const isDarkFeaturedNewsSurface = colorScheme === 'dark';
  const cardSizeKey = resolveFeaturedNewsCardSizeKey(cardSizeRaw);
  const baseId = renderingAnchorId(params.RenderingIdentifier) ?? 'featured-news';
  const asideHeadingId = `${baseId}-aside-heading`;

  if (!fields) {
    if (!isEditing) {
      return null;
    }
    return (
      <section
        className={cn(
          'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0! w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
          'component featured-news',
          colorScheme === 'dark' && 'bg-surface-inverse text-ink-inverse',
          (colorScheme === 'gray' || colorScheme === 'grey') && 'bg-surface-muted text-ink-primary',
          colorScheme !== 'dark' && colorScheme !== 'gray' && colorScheme !== 'grey' &&
            'bg-surface text-ink-primary',
          styles,
        )}
        {...anchor}
        aria-label={FEATURED_NEWS_REGION_ARIA}
        data-testid="featured-news"
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
          <div className="featured-news-outer box-border mx-auto w-full min-w-0 max-w-full px-4 py-12 min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[992px]:max-w-[992px] min-[992px]:py-16 min-[1200px]:max-w-[1200px] [.two-column-left-column_&]:pt-0">
            <span className="is-empty-hint">{FEATURED_NEWS_EMPTY_DATASOURCE}</span>
          </div>
        </div>
      </section>
    );
  }

  const listings = extractArticleListings(fields.ArticleListings);
  const featuredRow = listings[0];
  const secondaryRows = listings.slice(1);
  const hasVisitorContent = featuredNewsHasVisitorContent(listings);

  if (!hasVisitorContent && !isEditing) {
    return null;
  }

  const viewAllLink = parseViewAllLinkField(fields.ViewAllLink);
  const headlineField = fields.Headline;
  const showDatasourceChrome =
    isEditing && (fields.Eyebrow != null || fields.Description != null);

  const showHero =
    featuredRow != null &&
    (featuredNewsHasVisitorContent([featuredRow]) || isEditing);

  return (
    <section
      className={cn(
        'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0! w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
        'component featured-news',
        colorScheme === 'dark' && 'bg-surface-inverse text-ink-inverse',
        (colorScheme === 'gray' || colorScheme === 'grey') && 'bg-surface-muted text-ink-primary',
        colorScheme !== 'dark' && colorScheme !== 'gray' && colorScheme !== 'grey' &&
          'bg-surface text-ink-primary',
        styles,
      )}
      {...anchor}
      aria-label={FEATURED_NEWS_REGION_ARIA}
      data-testid="featured-news"
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
        <div
          className="featured-news-outer box-border mx-auto w-full min-w-0 max-w-full px-4 py-12 min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[992px]:max-w-[992px] min-[992px]:py-16 min-[1200px]:max-w-[1200px] [.two-column-left-column_&]:pt-0"
          data-testid="featured-news-outer"
        >
          {showDatasourceChrome ?
            <div className="mb-6 space-y-3 border-b border-stroke-default pb-6">
              {fields.Eyebrow != null && (String(fields.Eyebrow.value ?? '').trim() || isEditing) ?
                <Text tag="p" field={fields.Eyebrow} className="font-roboto text-font-small text-ink-secondary" />
              : null}
              {fields.Description != null &&
              (String(fields.Description.value ?? '').trim() || isEditing) ?
                <RichText field={fields.Description} />
              : null}
            </div>
          : null}

          <div className="flex flex-col gap-0 min-[600px]:flex-row min-[600px]:items-start">
            {showHero && featuredRow ?
              <FeaturedNewsHero
                row={featuredRow}
                cardSizeKey={cardSizeKey}
                isEditing={isEditing}
              />
            : isEditing ?
              <div className="min-w-0 flex-1">
                <span className="is-empty-hint">{FEATURED_NEWS_EMPTY_LISTINGS_EDITING_HINT}</span>
              </div>
            : null}

            <FeaturedNewsAside
              headlineField={headlineField}
              themeKey={themeKey}
              isDarkSurface={isDarkFeaturedNewsSurface}
              hasExplicitTheme={hasExplicitFeaturedNewsTheme}
              viewAllLink={viewAllLink}
              secondaryRows={secondaryRows}
              headingId={asideHeadingId}
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
