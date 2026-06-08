import { JSX, type ReactNode } from 'react';
import { Text, Link as ContentSdkLink } from '@sitecore-content-sdk/nextjs';

import { getCalloutLabels } from 'lib/callout-i18n';

import type { CalloutConfig, CalloutProps } from './Callout.type';
import {
  resolveCalloutComponentFields,
  resolveCalloutConfig,
  mergeCalloutRenderingParams,
  logCalloutTextAlignmentDebug,
  calloutItemHasPreviewContent,
  calloutLinkFieldHasHref,
  coalesceMediaTileCalloutPrefixedParams,
  resolveCalloutDisplayTextAlignment,
  isCalloutCardIgnoresCmsTextAlign,
  isCalloutCardColumnHorizontalSplit,
} from './calloutUtils';
import { CalloutItem } from './partial/CalloutPartials';
import { CalloutGroupListItem } from './partial/CalloutGroupListItem';
import {
  CalloutComponentContentShell,
  CalloutGlobalLocationsStatsShell,
  CalloutMediaTileSplitMaxContainer,
  CalloutSectionShell,
} from './partial/CalloutGroupAtoms';
import { ICON_CHEVRON_RIGHT_XS } from 'lib/chrome-icons';
import { cn } from 'lib/utils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

/**
 * Callout group: stats, optional heading, footnote, and group link. Layout flags on {@link CalloutProps}.
 *
 * @param fields - Callout datasource fields (optional when not yet configured).
 * @param params - Rendering params (`styles`, `RenderingIdentifier`, layout options).
 * @param page - Page context including `page.mode.isEditing`.
 * @param rendering - Layout rendering metadata (e.g. component name for list labeling).
 * @param embeddedLayout - Omits standalone full-bleed shell when embedded in a parent column.
 * @param textAsideAsideLayout - Text-and-Aside aside placeholder; see {@link CalloutProps}.
 * @param contentSwitcherLayout - Content Switcher tab placeholder; see {@link CalloutProps}.
 * @returns Section markup for stats, optional group footnote, and link, or an empty-state hint when `fields` is missing.
 */
export async function Default({
  fields,
  params,
  page,
  rendering,
  embeddedLayout = false,
  contentSwitcherLayout = false,
  textAsideAsideLayout = false,
  globalLocationsLayout = false,
  globalLocationsFlexAlignClass,
  globalLocationsTextAlignClass,
  globalLocationsStatsEmptyHint,
}: CalloutProps): Promise<JSX.Element> {
  const labels = await getCalloutLabels();
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const listLabel = rendering?.componentName ? String(rendering.componentName) : undefined;

  const effectiveEmbedded =
    embeddedLayout || contentSwitcherLayout || Boolean(globalLocationsLayout);
  const useEmbeddedInner = effectiveEmbedded;

  if (!fields) {
    return (
      <CalloutSectionShell
        flushTopMargin={contentSwitcherLayout || globalLocationsLayout}
        embeddedPaddingZero={Boolean(embeddedLayout && !contentSwitcherLayout)}
        fullBleedOuter={!effectiveEmbedded}
        styles={styles ?? ''}
        {...anchorId}
      >
        <CalloutComponentContentShell useEmbeddedInner={useEmbeddedInner}>
          {!effectiveEmbedded && <CalloutMediaTileSplitMaxContainer>{null}</CalloutMediaTileSplitMaxContainer>}
          <span className="is-empty-hint">{labels.emptyHint}</span>
        </CalloutComponentContentShell>
      </CalloutSectionShell>
    );
  }

  const resolvedFields = resolveCalloutComponentFields(fields, isEditing) ?? fields;
  const { Callouts, Footnote, Link, Heading } = resolvedFields ?? {};
  const mergedParams =
    embeddedLayout && !contentSwitcherLayout && !globalLocationsLayout
      ? { ...(params as Record<string, unknown>) }
      : mergeCalloutRenderingParams(rendering, params as Record<string, unknown>);
  const config = resolveCalloutConfig(mergedParams);
  const isContentSwitcherTextRow =
    contentSwitcherLayout && config.style === 'text' && config.direction === 'row';
  const displayTextAlignment = isCalloutCardIgnoresCmsTextAlign(config)
    ? 'left'
    : resolveCalloutDisplayTextAlignment(config);

  logCalloutTextAlignmentDebug(
    rendering,
    params as Record<string, unknown>,
    coalesceMediaTileCalloutPrefixedParams({ ...mergedParams }),
    config,
    {
      renderingIdentifier: params.RenderingIdentifier,
      componentName: listLabel,
      embeddedLayout: effectiveEmbedded,
      containerTextAlignClass:
        globalLocationsLayout && globalLocationsTextAlignClass?.trim()
          ? globalLocationsTextAlignClass.trim()
          : displayTextAlignment === 'center'
            ? 'text-center'
            : 'text-left',
    },
  );

  /** Keep rows with a stable id; `fields` may be missing when CMS uses `field` or GraphQL flattens the row. */
  const filteredCallouts =
    Callouts?.filter((item) => item?.id != null && String(item.id).length > 0) ?? [];
  const visibleCallouts = isEditing
    ? filteredCallouts
    : filteredCallouts.filter((item) => calloutItemHasPreviewContent(item.fields));

  /**
   * Single stat (non–Content Switcher / Global Locations): force Direction `row` for stacked card bands.
   * Content Switcher: skip so lone `card`+`column`+xs/sm/base keeps {@link isCalloutCardColumnHorizontalSplit}.
   */
  const calloutItemConfig: CalloutConfig =
    visibleCallouts.length === 1 &&
    config.direction === 'column' &&
    !contentSwitcherLayout &&
    !globalLocationsLayout
      ? { ...config, direction: 'row' }
      : config;

  const isSingleStandalone = !effectiveEmbedded && visibleCallouts.length === 1;
  const isCardStyle = config.style === 'card';
  const contentSwitcherEqualHeightRow =
    Boolean(contentSwitcherLayout && visibleCallouts.length > 1);
  const isRow = config.direction === 'row';
  /** Text and Aside aside: two or more stats always stack vertically and use full column width (ignore row/grid at md+). */
  const textAsideMultiStack = textAsideAsideLayout && visibleCallouts.length > 1;
  const layoutIsRow =
    !textAsideMultiStack &&
    (isRow ||
      (visibleCallouts.length === 1 &&
        !(contentSwitcherLayout && isCalloutCardColumnHorizontalSplit(config))));
  /** Text-and-Aside aside + one stat: full-width column (do not use multi-stat md grid / flex-1 cell width). */
  const textAsideSingleFullWidthRow =
    textAsideAsideLayout && visibleCallouts.length === 1 && layoutIsRow;
  const isEmbeddedRow = effectiveEmbedded && layoutIsRow;
  const gridJustifyTablet =
    (effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow) ? 'sm:justify-start' : 'sm:justify-center';
  const statsRowStartAligned =
    isSingleStandalone ||
    (effectiveEmbedded && layoutIsRow) ||
    (isCardStyle && layoutIsRow);
  const footnoteRowStartAligned =
    (effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow);

  const sectionBg =
    contentSwitcherLayout || globalLocationsLayout ? ''
    : config.style === 'base' ? 'bg-surface-muted'
    : '';

  const linkTarget = Link?.value?.target;
  const headingPlain =
    typeof Heading?.value === 'string' ?
      Heading.value.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    : '';
  const hasHeading = headingPlain.length > 0;
  const hasFootnote = Footnote?.value;
  const hasGroupLinkHref = calloutLinkFieldHasHref(Link);
  const groupLinkVisibleText = Link?.value?.text?.trim();
  const groupLinkAriaLabel =
    !groupLinkVisibleText && Footnote?.value?.trim()
      ? String(Footnote.value).replace(/\s+/g, ' ').slice(0, 120)
      : undefined;

  /** Style `card`: omit group Footnote (disclaimer / asterisk line) and footnote-strip padding; group Link still renders. */
  const showGroupFootnoteField = !isCardStyle && (Boolean(hasFootnote) || isEditing);
  const showFootnoteSection =
    hasGroupLinkHref || isEditing || (!isCardStyle && (Boolean(hasFootnote) || isEditing));
  const showFootnoteSectionResolved = globalLocationsLayout ? false : showFootnoteSection;

  const footnoteBlockGap = isContentSwitcherTextRow ? 'max-md:mt-3 mt-3' : 'max-md:mt-3 mt-4';
  const footnoteInner: ReactNode = (
    <>
      {showGroupFootnoteField && (
        <Text
          field={Footnote}
          tag="p"
          className={cn(
            footnoteBlockGap,
            'text-font-small text-ink-secondary italic',
            displayTextAlignment === 'center' ? 'text-center' : 'text-left',
          )}
        />
      )}
      {(hasGroupLinkHref || isEditing) && Link && (
        contentSwitcherLayout ?
          <div className="min-w-0 max-w-full p-0 mx-0 mb-0">
            <ContentSdkLink
              field={Link}
              editable={isEditing}
              showLinkTextWithChildrenPresent={false}
              className={"box-border inline-flex max-w-full cursor-pointer items-center gap-[2px] border-0 !mx-0 !mb-0 !mt-3 !p-0 font-media-tile text-font-media-tile-eyebrow font-normal leading-[21px] text-link no-underline underline-offset-2 decoration-solid decoration-[var(--color-link)] transition-[color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] hover:text-link-strong hover:decoration-[var(--color-link-strong)] hover:[&_.content-switcher-callout-link-label]:underline focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2 focus:ring-offset-surface-subtle"}
              target={linkTarget || undefined}
              rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
              {...(groupLinkAriaLabel ? { 'aria-label': groupLinkAriaLabel } : {})}
            >
              <span className={"content-switcher-callout-link-label min-w-0 shrink underline-offset-2"}>
                {groupLinkVisibleText && groupLinkVisibleText.length > 0 ?
                  groupLinkVisibleText
                : isEditing ?
                  '\u00a0'
                : ''}
              </span>
              {ICON_CHEVRON_RIGHT_XS}
            </ContentSdkLink>
          </div>
        : <ContentSdkLink
            field={Link}
            editable={isEditing}
            className={cn(
              isCardStyle ? 'mt-0 max-md:mt-0' : footnoteBlockGap,
              'inline-block text-nav-link-hover hover:text-nav-link-active transition-colors no-underline hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2',
            )}
            target={linkTarget || undefined}
            rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
            {...(groupLinkAriaLabel ? { 'aria-label': groupLinkAriaLabel } : {})}
          />
      )}
    </>
  );

  const headingBlock: ReactNode =
    (hasHeading || isEditing) && Heading ?
      <Text
        field={Heading}
        tag="h2"
        className={cn(
          contentSwitcherLayout
            ? 'box-border block w-full max-w-full min-h-0 !mt-0 !mb-2.5 !mx-0 border-0 !p-0 text-left !font-bold uppercase tracking-[0.35px] text-[length:var(--text-font-media-tile-eyebrow)] leading-[length:var(--leading-font-media-tile-eyebrow)] !text-ink-muted font-media-tile [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]'
            : textAsideAsideLayout
              ? 'mt-0! mx-0! mb-4 px-0! w-full text-font-big font-bold text-ink-primary'
              : 'mb-4 w-full text-font-big font-bold text-ink-primary',
          !contentSwitcherLayout &&
            (displayTextAlignment === 'center' ? 'text-center' : 'text-left'),
        )}
      />
    : null;

  /** CS tab: vertical gap under the eyebrow heading is only `!mb-2.5` on the h2 — no extra `mt-*` on this shell. */
  const statsSectionDefault: ReactNode =
    visibleCallouts.length > 0 ?
      <div
        className={cn(
          contentSwitcherLayout
            ? 'w-full py-0'
            : textAsideAsideLayout
              ? 'w-full py-0'
              : embeddedLayout
                ? 'w-full max-sm:py-0 sm:pt-6 sm:max-lg:pb-2 lg:pt-8 lg:pb-0'
                : isSingleStandalone
                  ? 'w-full py-0 max-md:py-0 md:py-0 lg:py-0'
                  : 'w-full py-4 sm:py-6 md:py-6 lg:py-8',
          contentSwitcherLayout || (textAsideAsideLayout && visibleCallouts.length > 0)
            ? 'w-full min-w-0'
            : statsRowStartAligned
              ? effectiveEmbedded && layoutIsRow
                ? 'sm:flex sm:justify-start'
                : 'md:flex md:justify-start'
              : layoutIsRow
                ? effectiveEmbedded
                  ? 'sm:flex sm:justify-center'
                  : 'md:flex md:justify-center'
                : effectiveEmbedded
                  ? 'sm:flex sm:justify-start'
                  : 'md:flex md:justify-start',
        )}
      >
        <div
          className={cn(
            contentSwitcherLayout && visibleCallouts.length > 0
              ? visibleCallouts.length > 1
                ? cn(
                    'box-border w-full min-w-0 max-w-full max-lg:flex max-lg:flex-col max-lg:flex-nowrap max-lg:items-stretch max-lg:gap-0 lg:flex lg:items-stretch lg:gap-4 lg:min-h-0 lg:-mt-4 lg:min-w-0 text-ink-primary',
                    globalLocationsLayout && globalLocationsTextAlignClass?.trim()
                      ? globalLocationsTextAlignClass.trim()
                      : displayTextAlignment === 'center'
                        ? 'text-center'
                        : 'text-left',
                  )
                : cn(
                    'flex w-full min-w-0 max-w-full flex-col items-stretch gap-0 text-ink-primary',
                    globalLocationsLayout && globalLocationsTextAlignClass?.trim()
                      ? globalLocationsTextAlignClass.trim()
                      : displayTextAlignment === 'center'
                        ? 'text-center'
                        : 'text-left',
                  )
              : textAsideMultiStack
                ? cn(
                    'flex w-full min-w-0 max-w-full flex-col flex-nowrap items-stretch gap-0 text-ink-primary',
                    displayTextAlignment === 'center' ? 'text-center' : 'text-left',
                  )
                : isSingleStandalone
                  ? cn(
                      'flex w-full flex-col flex-nowrap items-start justify-start gap-0 text-ink-primary',
                      displayTextAlignment === 'center' ? 'text-center' : 'text-left',
                    )
                  : layoutIsRow
                    ? textAsideSingleFullWidthRow
                      ? cn(
                          'flex w-full min-w-0 max-w-full flex-col flex-nowrap items-stretch justify-start gap-0 text-ink-primary',
                          displayTextAlignment === 'center' ? 'text-center' : 'text-left',
                        )
                      : cn(
                          'flex w-full flex-col flex-nowrap items-start justify-start gap-0 text-ink-primary',
                          displayTextAlignment === 'center' ? 'text-center' : 'text-left',
                          !textAsideMultiStack &&
                            !textAsideAsideLayout &&
                            !contentSwitcherLayout &&
                            !isSingleStandalone &&
                            (embeddedLayout ? 'max-sm:mt-0 sm:-mt-8' : '-mt-8'),
                          !contentSwitcherLayout &&
                            embeddedLayout &&
                            layoutIsRow &&
                            'sm:grid sm:grid-cols-2 sm:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] sm:items-stretch sm:min-w-0 lg:flex lg:flex-row lg:flex-wrap lg:items-start lg:justify-start lg:gap-0 lg:min-w-0',
                          !contentSwitcherLayout &&
                            !embeddedLayout &&
                            layoutIsRow &&
                            'md:grid md:grid-cols-[var(--width-callout-stat-cell)_var(--width-callout-stat-cell)] md:items-stretch lg:flex lg:flex-row lg:items-start lg:justify-start lg:gap-0',
                          gridJustifyTablet,
                        )
                    : textAsideAsideLayout
                      ? cn(
                          'flex w-full min-w-0 max-w-full flex-col flex-nowrap items-stretch justify-start gap-0 text-ink-primary',
                          displayTextAlignment === 'center' ? 'text-center' : 'text-left',
                        )
                      : cn(
                          'flex w-full flex-col flex-nowrap items-start justify-start gap-0 text-ink-primary',
                          displayTextAlignment === 'center' ? 'text-center' : 'text-left',
                          !textAsideMultiStack &&
                            !textAsideAsideLayout &&
                            !contentSwitcherLayout &&
                            !isSingleStandalone &&
                            (embeddedLayout ? 'max-sm:mt-0 sm:-mt-8' : '-mt-8'),
                        ),
            ((textAsideAsideLayout && visibleCallouts.length > 0) ||
              (layoutIsRow && !(contentSwitcherLayout && visibleCallouts.length > 1)))
              ? 'w-full max-w-none mx-0'
              : '',
          )}
          role="list"
          {...(listLabel ? { 'aria-label': listLabel } : {})}
        >
          {visibleCallouts.map((item, index) => {
            const separatorIndex = index - 1;
            const isMiddleSeparator = layoutIsRow && visibleCallouts.length > 2 && separatorIndex === 1;
            const isTabletSecondColumn = layoutIsRow && index % 2 === 1;
            return (
              <div
                key={item.id}
                className={cn(
                  contentSwitcherLayout &&
                    visibleCallouts.length > 1 &&
                    'w-auto min-w-0 max-w-full lg:flex lg:flex-col lg:min-h-0 lg:min-w-0 lg:max-w-full lg:self-stretch',
                  contentSwitcherLayout &&
                    visibleCallouts.length <= 1 &&
                    'w-full min-w-0',
                  textAsideMultiStack && 'w-full min-w-0 max-w-full',
                  isSingleStandalone && 'w-full',
                  !contentSwitcherLayout &&
                    !textAsideMultiStack &&
                    !isSingleStandalone &&
                    layoutIsRow &&
                    'contents',
                )}
              >
                {!contentSwitcherLayout &&
                  layoutIsRow &&
                  index > 0 &&
                  !isSingleStandalone &&
                  !isCardStyle && (
                  <>
                    {/* Tablet/desktop only: mobile uses border-top + mt/pt on the listitem (live spacing). */}
                    <div
                      role="separator"
                      aria-hidden="true"
                      className={cn(
                        'max-sm:hidden my-8 shrink-0 border-t border-stroke-default lg:hidden w-full max-w-full',
                        embeddedLayout && layoutIsRow
                          ? 'max-sm:max-w-[var(--width-callout-stat-media-tile-fluid)]'
                          : 'max-sm:max-w-[var(--width-callout-stat-mobile)]',
                        isMiddleSeparator ?
                          'sm:col-span-2 sm:my-8 sm:max-w-[var(--width-callout-tablet-horizontal-rule)] sm:w-full sm:justify-self-center'
                        : 'sm:hidden',
                      )}
                    />
                    {/* Vertical line is border-l on desktop cells after first; no separate divider */}
                    <div
                      role="separator"
                      aria-hidden="true"
                      className="mx-2 hidden w-px shrink-0 border-l border-stroke-default sm:hidden lg:hidden"
                    />
                  </>
                )}
                <CalloutGroupListItem
                  index={index}
                  contentSwitcherLayout={contentSwitcherLayout}
                  textAsideMultiStack={textAsideMultiStack}
                  textAsideAsideLayout={textAsideAsideLayout}
                  isSingleStandalone={isSingleStandalone}
                  layoutIsRow={layoutIsRow}
                  textAsideSingleFullWidthRow={textAsideSingleFullWidthRow}
                  isCardStyle={isCardStyle}
                  isEmbeddedRow={isEmbeddedRow}
                  visibleCalloutCount={visibleCallouts.length}
                  contentSwitcherEqualHeightRow={contentSwitcherEqualHeightRow}
                  isTabletSecondColumn={isTabletSecondColumn}
                  itemPadCompact={
                    effectiveEmbedded ||
                    isSingleStandalone ||
                    (isCardStyle && layoutIsRow) ||
                    isContentSwitcherTextRow ||
                    contentSwitcherLayout
                  }
                  embeddedLayoutRowNonCard={Boolean(
                    embeddedLayout && layoutIsRow && !isCardStyle,
                  )}
                  textAsideAsideMargin={textAsideAsideLayout && !textAsideMultiStack}
                >
                  <CalloutItem
                    item={item}
                    config={calloutItemConfig}
                    isEditing={isEditing}
                    isDesktopStatRow={layoutIsRow && !contentSwitcherLayout}
                    embeddedLayoutRowNonCard={Boolean(
                      embeddedLayout && layoutIsRow && !isCardStyle,
                    )}
                    isSingleFullWidthLayout={isSingleStandalone}
                    contentSwitcherLayout={contentSwitcherLayout}
                    contentSwitcherStretchInRow={contentSwitcherEqualHeightRow}
                    textAsideFullWidthItem={textAsideAsideLayout && visibleCallouts.length > 0}
                    textAsideSingleReferenceRowLabel={
                      textAsideAsideLayout && visibleCallouts.length === 1
                    }
                    singleVisibleCallout={visibleCallouts.length === 1}
                    textAsideMultiCardEqualBands={
                      Boolean(textAsideAsideLayout && visibleCallouts.length > 1)
                    }
                    contentSwitcherCompactCardBelowLg={
                      Boolean(contentSwitcherLayout && visibleCallouts.length > 2)
                    }
                  />
                </CalloutGroupListItem>
              </div>
            );
          })}
        </div>
      </div>
    : null;

  const statsSectionGlobalLocations: ReactNode =
    globalLocationsLayout ?
      visibleCallouts.length > 0 ?
        <CalloutGlobalLocationsStatsShell
          visibleCalloutCount={visibleCallouts.length}
          globalLocationsFlexAlignClass={globalLocationsFlexAlignClass}
        >
          <div
            role="list"
            className={cn(
              "box-border flex w-full max-w-full min-w-0 flex-col items-center justify-center gap-0 min-[768px]:flex-row min-[768px]:flex-wrap min-[768px]:w-max min-[768px]:max-w-full min-[768px]:items-center max-[767px]:[&>[role=listitem]]:!mt-[length:var(--margin-global-locations-callout-item-top)]",
              globalLocationsFlexAlignClass?.trim() || "items-center justify-center",
              globalLocationsTextAlignClass?.trim(),
            )}
            {...(listLabel ? { 'aria-label': listLabel } : {})}
          >
            {visibleCallouts.map((item) => (
              <div
                key={item.id}
                role="listitem"
                className="box-border block w-full min-w-0 max-w-full shrink-0 !mt-0 !mb-0 !mx-0 p-0 text-center font-callout text-ink-muted [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] min-[768px]:max-lg:w-[length:var(--width-global-locations-callout-stat-md)] min-[768px]:max-lg:h-[length:var(--height-global-locations-callout-stat-md)] min-[992px]:max-xl:w-[length:var(--width-global-locations-callout-stat-lg)] min-[992px]:max-xl:h-[length:var(--height-global-locations-callout-stat-lg)] min-[1200px]:w-[length:var(--width-global-locations-callout-stat-xl)] min-[1200px]:h-[length:var(--height-global-locations-callout-stat-xl)]"
              >
                <CalloutItem
                  item={item}
                  config={calloutItemConfig}
                  isEditing={isEditing}
                  globalLocationsLayout
                  globalLocationsTextAlignClass={globalLocationsTextAlignClass?.trim()}
                />
              </div>
            ))}
          </div>
        </CalloutGlobalLocationsStatsShell>
      : isEditing && globalLocationsStatsEmptyHint?.trim() ?
        <CalloutGlobalLocationsStatsShell
          visibleCalloutCount={visibleCallouts.length}
          globalLocationsFlexAlignClass={globalLocationsFlexAlignClass}
        >
          <span className="is-empty-hint text-font-normal text-text-basic">
            {globalLocationsStatsEmptyHint.trim()}
          </span>
        </CalloutGlobalLocationsStatsShell>
      : null
    : null;

  const statsSection = globalLocationsLayout ? statsSectionGlobalLocations : statsSectionDefault;

  const footnoteSection: ReactNode =
    showFootnoteSectionResolved ?
      <div
        className={cn(
          isCardStyle && 'p-0 m-0',
          !isCardStyle && textAsideAsideLayout && 'p-0 m-0',
          !isCardStyle &&
            !textAsideAsideLayout &&
            contentSwitcherLayout &&
            'pb-0 pt-0 m-0',
          !isCardStyle &&
            !textAsideAsideLayout &&
            !contentSwitcherLayout &&
            embeddedLayout &&
            'max-sm:pb-4 pb-6 sm:pb-7 lg:pb-0',
          !isCardStyle &&
            !textAsideAsideLayout &&
            !contentSwitcherLayout &&
            !embeddedLayout &&
            'pb-4 sm:pb-6 md:pb-8 lg:pb-8',
          contentSwitcherLayout && 'w-full min-w-0',
          textAsideAsideLayout && visibleCallouts.length > 0 && 'w-full min-w-0',
          !contentSwitcherLayout &&
            !(textAsideAsideLayout && visibleCallouts.length > 0) &&
            ((effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow)) &&
            (effectiveEmbedded ? 'sm:flex sm:justify-start' : 'md:flex md:justify-start'),
          !contentSwitcherLayout &&
            !(textAsideAsideLayout && visibleCallouts.length > 0) &&
            !((effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow)) &&
            layoutIsRow &&
            'md:flex md:justify-center',
          !contentSwitcherLayout &&
            !(textAsideAsideLayout && visibleCallouts.length > 0) &&
            !((effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow)) &&
            !layoutIsRow &&
            'md:flex md:justify-start',
          isContentSwitcherTextRow && '-mt-4 -ml-4 max-md:mt-0 max-md:ml-0',
        )}
      >
        <div className={
          (contentSwitcherLayout ||
            (textAsideAsideLayout && visibleCallouts.length > 0) ||
            layoutIsRow)
            ? 'w-full max-w-none'
            : 'w-[var(--width-callout-stat-mobile)] max-w-full'
        }>
          {footnoteInner}
        </div>
      </div>
    : null;

  const mainContent: ReactNode = (
    <>
      {headingBlock}
      {statsSection}
      {footnoteSection}
    </>
  );

  return (
    <CalloutSectionShell
      flushTopMargin={
        contentSwitcherLayout ||
        (textAsideAsideLayout && embeddedLayout && !contentSwitcherLayout) ||
        Boolean(globalLocationsLayout)
      }
      embeddedPaddingZero={Boolean(embeddedLayout && !contentSwitcherLayout)}
      fullBleedOuter={!effectiveEmbedded}
      sectionBg={sectionBg}
      styles={styles ?? ''}
      {...anchorId}
    >
      <CalloutComponentContentShell useEmbeddedInner={useEmbeddedInner}>
        {useEmbeddedInner ?
          mainContent
        : isSingleStandalone ?
          <>
            <div className={cn('box-border block w-full max-w-[80rem] mx-auto my-0 p-4 leading-6 font-callout border-0 border-solid border-stroke-default [-webkit-tap-highlight-color:transparent]', config.style === 'card' ? 'min-h-[var(--height-callout-card-shell)]' : 'min-h-[116px]')}>
              {headingBlock}
              {statsSection}
            </div>
            {showFootnoteSectionResolved ?
              <div
                className={cn(
                  isCardStyle ? 'w-full max-w-[80rem] mx-auto px-0' : 'w-full max-w-[80rem] mx-auto px-4',
                  isCardStyle && 'p-0 m-0',
                  !isCardStyle && textAsideAsideLayout && 'p-0 m-0',
                  !isCardStyle &&
                    !textAsideAsideLayout &&
                    contentSwitcherLayout &&
                    'pb-0 pt-0 m-0',
                  !isCardStyle &&
                    !textAsideAsideLayout &&
                    !contentSwitcherLayout &&
                    embeddedLayout &&
                    'max-sm:pb-4 pb-6 sm:pb-7 lg:pb-0',
                  !isCardStyle &&
                    !textAsideAsideLayout &&
                    !contentSwitcherLayout &&
                    !embeddedLayout &&
                    'pb-4 sm:pb-6 md:pb-8 lg:pb-8',
                  contentSwitcherLayout && 'w-full min-w-0',
                  textAsideAsideLayout &&
                    visibleCallouts.length > 0 &&
                    !contentSwitcherLayout &&
                    'w-full min-w-0',
                  !contentSwitcherLayout &&
                    !(textAsideAsideLayout && visibleCallouts.length > 0) &&
                    ((effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow)) &&
                    (effectiveEmbedded ? 'sm:flex sm:justify-start' : 'md:flex md:justify-start'),
                  !contentSwitcherLayout &&
                    !(textAsideAsideLayout && visibleCallouts.length > 0) &&
                    !((effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow)) &&
                    layoutIsRow &&
                    'md:flex md:justify-center',
                  !contentSwitcherLayout &&
                    !(textAsideAsideLayout && visibleCallouts.length > 0) &&
                    !((effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow)) &&
                    !layoutIsRow &&
                    'md:flex md:justify-start',
                )}
              >
                <div className="w-full max-w-none">{footnoteInner}</div>
              </div>
            : null}
          </>
        : <CalloutMediaTileSplitMaxContainer>{mainContent}</CalloutMediaTileSplitMaxContainer>}
      </CalloutComponentContentShell>
    </CalloutSectionShell>
  );
}
