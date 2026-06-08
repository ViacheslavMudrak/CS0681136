import { Link as ContentSdkLink, RichText, Text } from '@sitecore-content-sdk/nextjs';
import Image from 'next/image';
import type { JSX } from 'react';

import { readFeaturedNewsParamValue } from 'components/featured-news/featuredNewsUtils';
import { UI_ICONS } from 'components/navigation/partial/NavigationIcons';
import { CHROME_ICON_SLOT_14PX } from 'lib/chrome-icons';
import type { RelatedCaseStudiesProps } from 'components/related-case-studies/RelatedCaseStudies.type';
import {
  extractCaseStudyListings,
  getCaseStudyCompanyLinkTarget,
  getCaseStudyCompanyLinkUrl,
  getCaseStudyCompanyNameText,
  getCaseStudyHeadlineText,
  getCaseStudyListingImageUrl,
  getCaseStudyListingUrl,
  mergeRelatedCaseStudiesRenderingParams,
  parseRelatedCaseStudiesColumnCount,
  parseRelatedCaseStudiesMaxCount,
  parseRelatedCaseStudiesStyleTokenList,
  readRelatedCaseStudiesColorSchemeLayout,
  readRelatedCaseStudiesShowCompany,
  relatedCaseStudiesHasVisitorContent,
  relatedCaseStudyListingKey,
  RELATED_CASE_STUDIES_EMPTY_DATASOURCE,
  RELATED_CASE_STUDIES_EMPTY_LIST_EDITING_HINT,
  RELATED_CASE_STUDIES_REGION_ARIA,
  resolveRelatedCaseStudiesBaseImageSizes,
  resolveRelatedCaseStudiesCardSizeKey,
  resolveRelatedCaseStudiesDescriptionField,
} from 'components/related-case-studies/relatedCaseStudiesUtils';
import { RelatedCaseStudyBaseCardKindLabel } from 'components/related-case-studies/partial/RelatedCaseStudyBaseCardKindLabel';
import { cn } from 'lib/utils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

function caseStudyCompanyLinkField(href: string, text: string, target?: string) {
  return {
    value: {
      href,
      text,
      ...(target && target.trim().length > 0 ? { target: target.trim() } : {}),
    },
  };
}

function caseStudyDetailLinkField(href: string, text: string) {
  return { value: { href, text } };
}

function RelatedCaseStudyHeadlineChevron(): JSX.Element {
  return (
    <span className={`ml-0.5 inline-flex size-[14px] shrink-0 items-center justify-center overflow-visible align-baseline text-current transition-colors duration-150 motion-reduce:transition-none group-hover:text-ink-muted ${CHROME_ICON_SLOT_14PX}`} aria-hidden="true">
      {UI_ICONS.chevronRight}
    </span>
  );
}

/** Related case studies: compact rail or base card grid from `CardSize` and `ColorScheme`. */
export function Default({ fields, params, page, rendering }: RelatedCaseStudiesProps): JSX.Element | null {
  const isEditing = page.mode.isEditing;
  const anchor = renderingAnchorIdProps(params.RenderingIdentifier);
  const styles = params.styles ?? '';
  const paramsRecord = mergeRelatedCaseStudiesRenderingParams(
    rendering,
    params as Record<string, unknown>,
  );
  const colorSchemeRaw = readFeaturedNewsParamValue(paramsRecord, 'ColorScheme');
  const {
    isDarkSurface,
    isGraySurface,
    isLegacyRailHeadline,
    isArticleRailHeadline,
    isCompactRailHeadline,
    isThemedRailHeadline,
    isArticleBaseHeadline,
    landingDescriptionBold,
  } = readRelatedCaseStudiesColorSchemeLayout(colorSchemeRaw);
  const cardSizeKey = resolveRelatedCaseStudiesCardSizeKey(paramsRecord);
  const layoutStyleTokens = parseRelatedCaseStudiesStyleTokenList(paramsRecord);

  if (!fields) {
    if (!isEditing) {
      return null;
    }
    return (
      <aside
        className={cn(
          'component related-case-studies',
          isDarkSurface ? 'bg-surface-inverse text-ink-inverse'
          : isGraySurface ? 'bg-surface-muted text-ink-primary'
          : 'bg-surface text-ink-primary',
          styles,
        )}
        {...anchor}
        aria-label={RELATED_CASE_STUDIES_REGION_ARIA}
        data-testid="related-case-studies"
      >
        <div className="component-content">
          <div className="related-case-studies-outer box-border w-full min-w-0" data-testid="related-case-studies-outer">
            <span className="is-empty-hint">{RELATED_CASE_STUDIES_EMPTY_DATASOURCE}</span>
          </div>
        </div>
      </aside>
    );
  }

  const listingsAll = extractCaseStudyListings(fields.CaseStudyListings);

  const headlineField = fields.Headline;
  const showEyebrow =
    fields.Eyebrow != null && (String(fields.Eyebrow.value ?? '').trim().length > 0 || isEditing);
  const descriptionField = resolveRelatedCaseStudiesDescriptionField(fields, paramsRecord);
  const showDescription =
    descriptionField != null &&
    (String(descriptionField.value ?? '').trim().length > 0 || isEditing);
  const showHeadline =
    headlineField != null &&
    (String(headlineField.value ?? '').trim().length > 0 || isEditing);

  const showCompanyInBaseCards = readRelatedCaseStudiesShowCompany(fields);

  if (cardSizeKey === 'base') {
    // For the base grid, ItemCount controls the number of columns (2–5); all listings are shown.
    const columnCount = parseRelatedCaseStudiesColumnCount(fields.ItemCount?.Value);
    const clampedColumnCount = Math.min(Math.max(Math.round(columnCount), 2), 5);
    const baseImageSizes = resolveRelatedCaseStudiesBaseImageSizes(columnCount);
    const baseListings = listingsAll;
    const hasBaseContent = relatedCaseStudiesHasVisitorContent(baseListings);

    if (!hasBaseContent && !isEditing) {
      return null;
    }

    return (
      <aside
        className={cn(
          'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0! w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
          'component related-case-studies',
          '[.two-column-container_&]:flex-[0_1_auto] [.two-column-container_&]:ml-0 [.two-column-container_&]:mr-0 [.two-column-container_&]:max-w-full [.two-column-container_&]:min-w-0 [.two-column-container_&]:p-0 [.two-column-container_&]:w-full',
          isDarkSurface ? 'bg-surface-inverse text-ink-inverse'
          : isGraySurface ? 'bg-surface-muted text-ink-primary'
          : 'bg-surface text-ink-primary',
          styles,
        )}
        {...anchor}
        aria-label={RELATED_CASE_STUDIES_REGION_ARIA}
        data-testid="related-case-studies"
        data-card-size="base"
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none [.two-column-container_&]:ml-0 [.two-column-container_&]:mr-0 [.two-column-container_&]:max-w-none [.two-column-container_&]:min-w-0 [.two-column-container_&]:w-full">
          <div
            className={cn(
              'two-column-container-outer box-border w-full min-w-0',
              'mx-auto max-w-full px-4 py-12 min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[992px]:max-w-[992px] min-[992px]:py-16 min-[1200px]:max-w-[1200px] [.two-column-container_&]:mx-0 [.two-column-container_&]:max-w-none [.two-column-container_&]:p-0 [.two-column-container_&]:w-full',
              layoutStyleTokens.includes('indent-top') && '!pt-[48px]',
              layoutStyleTokens.includes('indent') && '!px-[32px] md:!px-[80px]',
            )}
          >
            <div
              className="related-case-studies-outer box-border flex w-full min-w-0 flex-col gap-[24px]"
              data-testid="related-case-studies-outer"
            >
            {showHeadline || showEyebrow || showDescription ?
              <div className="flex min-w-0 flex-col gap-[8px]">
                {showHeadline ?
                  <h2
                    className={cn(
                      'box-border block !m-0 !border-0 !p-0 text-left font-media-tile text-[length:30px] font-bold leading-[37.5px] antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
                      isArticleBaseHeadline ? 'uppercase text-accent-cyan' : 'normal-case text-ink-primary',
                    )}
                  >
                    <Text tag="span" field={headlineField ?? { value: '' }} />
                  </h2>
                : null}

                {showEyebrow ?
                  <Text
                    tag="p"
                    field={fields.Eyebrow ?? { value: '' }}
                    className='box-border block !m-0 max-w-full border-0 p-0 text-left font-media-tile text-font-medium font-normal leading-6 text-ink-muted [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]'
                  />
                : null}

                {showDescription ?
                  <div className="min-w-0 max-w-full">
                    <RichText
                      field={descriptionField ?? { value: '' }}
                      className={cn(
                        'related-case-studies-base-section-description-rte box-border block !m-0 min-w-0 max-w-full !border-0 !p-0 cursor-default text-left font-media-tile text-font-medium font-normal leading-6 text-ink-muted [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] [&_strong]:font-bold [&_strong]:text-ink-primary [&_a]:box-border [&_a]:inline [&_a]:h-auto [&_a]:w-auto [&_a]:cursor-pointer [&_a]:list-none [&_a]:p-0 [&_a]:mt-2 [&_a]:mb-0 [&_a]:ml-0 [&_a]:mr-0 [&_a]:font-media-tile [&_a]:text-font-medium [&_a]:font-normal [&_a]:leading-6 [&_a]:text-link [&_a]:underline [&_a]:decoration-solid [&_a]:[text-decoration-color:var(--color-link)] [&_a]:[text-decoration-thickness:auto] [&_a]:[-webkit-tap-highlight-color:transparent] [&_a]:transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] [&_a]:duration-150 [&_a]:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:[&_a]:transition-none [&_a:hover]:text-link-strong [&_a:hover]:[text-decoration-color:var(--color-link-strong)] [&_a]:rounded-xs [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-focus-interactive [&_a]:focus-visible:ring-offset-0',
                        landingDescriptionBold && '[&_a]:!font-bold',
                      )}
                    />
                  </div>
                : null}
              </div>
            : null}

            {baseListings.length > 0 ?
              <ul
                className={cn(
                  'm-0! grid list-none grid-cols-1 items-stretch gap-[16px] p-0 min-[600px]:grid-cols-2 md:gap-[24px]',
                  clampedColumnCount === 3 && 'lg:grid-cols-3',
                  clampedColumnCount === 4 && 'lg:grid-cols-4',
                  clampedColumnCount === 5 && 'lg:grid-cols-5',
                )}
                role="list"
              >
                {baseListings.map((row, idx) => {
                    const key = relatedCaseStudyListingKey(row, idx);
                    const headline = getCaseStudyHeadlineText(row);
                    const detailUrl = getCaseStudyListingUrl(row);
                    const summaryHtml = typeof row.Summary === 'string' ? row.Summary.trim() : '';
                    const imageUrl = getCaseStudyListingImageUrl(row);
                    const hasHeadline = headline.length > 0;
                    const hasDetailUrl = detailUrl.length > 0;
                    const hasSummary = summaryHtml.length > 0;
                    const hasImage = imageUrl.length > 0;
                    const showRow =
                      hasHeadline || hasDetailUrl || hasSummary || hasImage;

                    if (!showRow && !isEditing) {
                      return null;
                    }

                    const detailLinkLabel = hasHeadline ? headline : 'Case study';
                    const cardHitTarget = !isEditing && hasDetailUrl;
                    const companyNameForFooter = getCaseStudyCompanyNameText(row);

                    return (
                      <li key={key} className="box-border !ml-0 flex h-full min-h-0 min-w-0 list-none !pl-0 my-0" role="listitem">
                        <article className='group box-border flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-xl border border-solid border-stroke-default bg-surface relative transition-shadow duration-150 motion-reduce:transition-none sm:shadow-md max-sm:hover:shadow-lg sm:hover:shadow-lg'>
                          {cardHitTarget ?
                            <ContentSdkLink
                              field={caseStudyDetailLinkField(detailUrl, detailLinkLabel)}
                              className='related-case-studies-base-card-stretch-link pointer-events-auto absolute inset-0 z-[1] rounded-xl focus:outline-none focus-visible:outline-none'
                              aria-label={detailLinkLabel}
                            >
                              <span className="sr-only">{detailLinkLabel}</span>
                            </ContentSdkLink>
                          : null}
                          <div
                            className={cn(
                              'relative z-[2] flex min-h-0 flex-1 flex-col',
                              cardHitTarget && 'pointer-events-none',
                            )}
                          >
                            <div
                              className={cn('relative aspect-[604/317] w-full shrink-0 overflow-hidden bg-neutral-200',
                                cardHitTarget && 'pointer-events-none',
                              )}
                            >
                              {hasImage ?
                                <Image
                                  src={imageUrl}
                                  alt={hasHeadline ? headline : 'Case study'}
                                  fill
                                  className={cn('box-border h-full w-full max-w-full cursor-pointer object-cover align-middle [-webkit-tap-highlight-color:transparent]',
                                    cardHitTarget && 'pointer-events-none',
                                  )}
                                  sizes={baseImageSizes}
                                  priority={idx === 0}
                                />
                              : isEditing ?
                                <span className="absolute inset-0 flex items-center justify-center px-4 text-center font-media-tile text-[length:13px] leading-snug text-ink-tertiary">
                                  Add an image or a video cover image for this case study.
                                </span>
                              : null}
                            </div>

                            <div
                              className={cn('box-border flex min-h-0 min-w-0 flex-1 flex-col px-5 pb-5 pt-4',
                                cardHitTarget && 'pointer-events-none',
                              )}
                            >
                              {hasHeadline ?
                                <h3
                                  className={cn('!m-0 !mb-1 block w-full max-w-full min-w-0 shrink-0 text-left font-media-tile text-font-large font-bold leading-[24.75px] text-ink-primary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] transition-colors duration-150 motion-reduce:transition-none group-hover:text-ink-muted',
                                    cardHitTarget ? 'cursor-pointer' : 'cursor-default',
                                  )}
                                >
                                  <span className='inline min-w-0'>
                                    {headline}
                                  </span>
                                  <RelatedCaseStudyHeadlineChevron />
                                </h3>
                              : null}

                              {hasSummary ?
                                <div
                                  className={cn(
                                    'min-h-0 flex-1 min-w-0 max-w-full',
                                    cardHitTarget && 'pointer-events-none',
                                  )}
                                >
                                  <RichText
                                    field={{ value: summaryHtml }}
                                    className={cn('related-case-studies-base-card-summary-rte !mb-1 box-border min-w-0 max-w-full cursor-default text-left font-media-tile text-font-media-tile-eyebrow font-normal leading-[19.25px] text-ink-muted [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] [&_strong]:font-bold [&_strong]:text-ink-primary [&_a]:relative [&_a]:z-20 [&_a]:cursor-pointer [&_a]:text-link [&_a]:underline',
                                      cardHitTarget && 'pointer-events-auto',
                                    )}
                                  />
                                </div>
                              : <div className="min-h-0 flex-1" aria-hidden={true} />}

                              <RelatedCaseStudyBaseCardKindLabel
                                showCompany={showCompanyInBaseCards}
                                companyName={companyNameForFooter}
                              />
                            </div>
                          </div>
                          {cardHitTarget ?
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-0 z-[10] shadow-[inset_0_0_0_0px_transparent] transition-[box-shadow] duration-150 motion-reduce:transition-none group-focus-within:shadow-[inset_0_0_0_3px_var(--color-accent-nav)] rounded-xl"
                            />
                          : null}
                        </article>
                      </li>
                    );
                  })}
              </ul>
            : isEditing ?
              <p className="!m-0">
                <span className="is-empty-hint">{RELATED_CASE_STUDIES_EMPTY_LIST_EDITING_HINT}</span>
              </p>
            : null}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Compact rail: ItemCount still caps the number of rows shown.
  const maxCount = parseRelatedCaseStudiesMaxCount(fields.ItemCount?.Value);
  const listings = listingsAll.slice(0, maxCount);
  const hasVisitorContent = relatedCaseStudiesHasVisitorContent(listings);

  if (!hasVisitorContent && !isEditing) {
    return null;
  }

  /* `CardSize` = compact (default): when a row has `Company`, the company name links (detail URL is fallback) and the headline is plain text; rows without a company still use a headline detail link. Base layout uses full-card stretch, focus overlay, and headline chevron (see `cardSizeKey === 'base'` above). */
  return (
    <aside
      className={cn(
        'component related-case-studies box-border px-0!',
        isDarkSurface ? 'bg-surface-inverse text-ink-inverse'
        : isGraySurface ? 'bg-surface-muted text-ink-primary'
        : 'bg-surface text-ink-primary',
        styles,
      )}
      {...anchor}
      aria-label={RELATED_CASE_STUDIES_REGION_ARIA}
      data-testid="related-case-studies"
      data-card-size="compact"
    >
      <div className="component-content">
        <div className="related-case-studies-outer box-border w-full min-w-0" data-testid="related-case-studies-outer">
          {showEyebrow ?
            <Text
              tag="p"
              field={fields.Eyebrow ?? { value: '' }}
              className="mb-2 font-roboto text-font-small uppercase tracking-wide text-ink-secondary"
            />
          : null}

          {showHeadline ?
            <h2
              className={cn(
                'box-border block !m-0 !border-0 !p-0 font-media-tile font-bold [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
                isLegacyRailHeadline && 'text-font-big leading-font-media-tile-headline uppercase text-ink-tertiary',
                isArticleRailHeadline && 'text-font-big leading-[27.5px] uppercase text-accent-cyan',
                isCompactRailHeadline && 'text-font-large leading-[24.75px] normal-case text-ink-primary',
                isThemedRailHeadline && 'text-font-big leading-[27.5px] normal-case text-ink-primary',
              )}
            >
              <Text tag="span" field={headlineField ?? { value: '' }} />
            </h2>
          : null}

          {showDescription ?
            <div className='mt-[8px] mb-0'>
              <RichText
                field={descriptionField ?? { value: '' }}
                className={cn(
                  'related-case-studies-description-rte box-border min-w-0 max-w-full cursor-default text-left font-media-tile text-font-media-tile-eyebrow font-normal leading-[19.25px] text-ink-muted [unicode-bidi:isolate] [&_strong]:font-bold [&_strong]:text-ink-primary [&_a]:box-border [&_a]:inline [&_a]:h-auto [&_a]:w-auto [&_a]:cursor-pointer [&_a]:list-none [&_a]:p-0 [&_a]:mt-2 [&_a]:mb-0 [&_a]:ml-0 [&_a]:mr-0 [&_a]:font-media-tile [&_a]:text-font-media-tile-eyebrow [&_a]:font-normal [&_a]:leading-[19.25px] [&_a]:text-link [&_a]:underline [&_a]:decoration-solid [&_a]:[text-decoration-color:var(--color-link)] [&_a]:[text-decoration-thickness:auto] [&_a]:[-webkit-tap-highlight-color:transparent] [&_a]:transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] [&_a]:duration-150 [&_a]:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:[&_a]:transition-none [&_a:hover]:text-link-strong [&_a:hover]:[text-decoration-color:var(--color-link-strong)] [&_a]:rounded-xs [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-focus-interactive [&_a]:focus-visible:ring-offset-0',
                  landingDescriptionBold && '[&_a]:!font-bold',
                )}
              />
            </div>
          : null}

          {listings.length > 0 ?
            <div
              className="min-w-0 mt-[8px] max-[430px]:mt-[10px]"
              data-testid="related-case-studies-list-wrap"
            >
              <ul className='m-0 flex list-none flex-col gap-[10px] p-0' role="list">
              {listings.map((row, idx) => {
                const key = relatedCaseStudyListingKey(row, idx);
                const headline = getCaseStudyHeadlineText(row);
                const detailUrl = getCaseStudyListingUrl(row);
                const companyName = getCaseStudyCompanyNameText(row);
                const companyUrl = getCaseStudyCompanyLinkUrl(row);
                const companyTarget = getCaseStudyCompanyLinkTarget(row);
                const hasHeadline = headline.length > 0;
                const hasCompany = companyName.length > 0;
                const hasDetailUrl = detailUrl.length > 0;
                const hasCompanyUrl = companyUrl.length > 0;
                const showRow = hasHeadline || hasCompany || hasDetailUrl || hasCompanyUrl;

                if (!showRow && !isEditing) {
                  return null;
                }

                const compactDetailLinkText = hasHeadline ? headline : 'Case study';

                return (
                  <li key={key} className="box-border min-w-0" role="listitem">
                    {hasCompany ?
                      !isEditing && hasCompanyUrl ?
                        <p className="!m-0">
                          <ContentSdkLink
                            field={caseStudyCompanyLinkField(companyUrl, companyName, companyTarget)}
                            className='box-border m-0 inline h-auto w-auto cursor-pointer list-none rounded-xs border-0 p-0 font-media-tile font-normal leading-6 text-link underline decoration-solid [text-decoration-color:var(--color-link)] [text-decoration-thickness:auto] [-webkit-tap-highlight-color:transparent] transition-[color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none hover:text-link-alt hover:[text-decoration-color:var(--color-link-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-0'
                            aria-label={companyName}
                            rel={companyTarget === '_blank' ? 'noopener noreferrer' : undefined}
                          />
                        </p>
                      : <p className="!m-0 box-border m-0 inline h-auto w-auto cursor-default list-none border-0 p-0 font-media-tile font-normal leading-6 text-link underline decoration-solid [text-decoration-color:var(--color-link)] [text-decoration-thickness:auto] [-webkit-tap-highlight-color:transparent]">{companyName}</p>
                    : null}
                    {hasHeadline ?
                      !isEditing && hasDetailUrl && !hasCompany ?
                        <p className="!m-0 mt-1 text-left">
                          <ContentSdkLink
                            field={caseStudyDetailLinkField(detailUrl, compactDetailLinkText)}
                            className="box-border block !m-0 w-full max-w-full border-0 p-0 text-left font-media-tile text-font-media-tile-eyebrow font-normal leading-[19.25px] text-ink-primary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] rounded-xs cursor-pointer no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-0"
                            aria-label={compactDetailLinkText}
                          />
                        </p>
                      : <p className="!m-0 mt-1 text-left box-border block w-full max-w-full border-0 p-0 font-media-tile text-font-media-tile-eyebrow font-normal leading-[19.25px] text-ink-primary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]">
                          {headline}
                        </p>
                    : null}
                  </li>
                );
              })}
              </ul>
            </div>
          : isEditing ?
            <p className="mt-4">
              <span className="is-empty-hint">{RELATED_CASE_STUDIES_EMPTY_LIST_EDITING_HINT}</span>
            </p>
          : null}
        </div>
      </div>
    </aside>
  );
}
