import { JSX, type ReactNode } from 'react';
import { Text, Link as ContentSdkLink } from '@sitecore-content-sdk/nextjs';

import type { CalloutConfig, CalloutProps } from 'components/callout/Callout.type';
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
} from 'components/callout/calloutUtils';
import { CalloutItem } from 'components/callout/partial/CalloutPartials';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';
import { ICON_CHEVRON_RIGHT_XS } from 'lib/chrome-icons';
import { cn } from 'lib/utils';

import { storyCalloutLabels } from '../storyLabels';

export type CalloutStoryPreviewLabels = typeof storyCalloutLabels;

export type CalloutStoryPreviewProps = CalloutProps & {
  /** Defaults to {@link storyCalloutLabels} (same shape as `lib/callout-i18n` fallbacks). */
  labels?: CalloutStoryPreviewLabels;
};

export function CalloutStoryPreview({
  fields,
  params,
  page,
  rendering,
  embeddedLayout = false,
  contentSwitcherLayout = false,
  textAsideAsideLayout = false,
  labels = storyCalloutLabels,
}: CalloutStoryPreviewProps): JSX.Element {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const listLabel = rendering?.componentName ? String(rendering.componentName) : undefined;

  const effectiveEmbedded = embeddedLayout || contentSwitcherLayout;
  const useEmbeddedInner = effectiveEmbedded;

  if (!fields) {
    return (
      <section
        className={cn(
          'component callout',
          contentSwitcherLayout
            ? '!mt-0 mb-0 mx-0 w-full min-w-0 max-w-full !px-0'
            : 'mt-8',
          embeddedLayout && !contentSwitcherLayout && '!px-0',
          !effectiveEmbedded &&
            'relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)]',
          styles,
        )}
        {...anchorId}
      >
        <div
          className={cn('component-content', useEmbeddedInner && '!px-0 min-w-0 max-w-full')}
        >
          {!effectiveEmbedded && <div className="relative box-border w-full [unicode-bidi:isolate] md:mx-auto md:max-w-[var(--width-media-tile-split-max)] md:max-[768px]:mx-0 md:max-[768px]:w-full md:max-[768px]:max-w-full md:min-[769px]:tablet-only:mx-[72px] md:min-[769px]:tablet-only:w-[calc(100%-144px)] md:min-[769px]:tablet-only:max-w-[768px] md:tablet-only:px-4 lg:mx-auto lg:max-w-[var(--width-media-tile-split-max)] lg:px-4 max-md:px-4 min-w-0 max-md:max-w-full overflow-x-clip" />}
          <span className="is-empty-hint">{labels.emptyHint}</span>
        </div>
      </section>
    );
  }

  const resolvedFields = resolveCalloutComponentFields(fields, isEditing) ?? fields;
  const { Callouts, Footnote, Link, Heading } = resolvedFields ?? {};
  const mergedParams =
    embeddedLayout && !contentSwitcherLayout
      ? { ...(params as Record<string, unknown>) }
      : mergeCalloutRenderingParams(rendering, params as Record<string, unknown>);
  const config = resolveCalloutConfig(mergedParams);
  const isContentSwitcherTextRow =
    contentSwitcherLayout && config.style === 'text' && config.direction === 'row';
  const footnoteShellPadClass =
    config.style === 'card' ?
      'p-0 m-0'
    : textAsideAsideLayout ?
      'p-0 m-0'
    : contentSwitcherLayout ?
      'pb-0 pt-0 m-0'
    : embeddedLayout ?
      'max-md:pb-4 pb-6 sm:pb-7 lg:pb-0'
    : 'pb-4 sm:pb-6 md:pb-8 lg:pb-8';
  const displayTextAlignment = isCalloutCardIgnoresCmsTextAlign(config)
    ? 'left'
    : resolveCalloutDisplayTextAlignment(config);
  const containerTextAlignClass =
    displayTextAlignment === 'center' ? 'text-center' : 'text-left';
  const headingAlignClass =
    displayTextAlignment === 'center' ? 'text-center' : 'text-left';
  const containerTextInkClass = `${containerTextAlignClass} text-ink-primary`;

  logCalloutTextAlignmentDebug(
    rendering,
    params as Record<string, unknown>,
    coalesceMediaTileCalloutPrefixedParams({ ...mergedParams }),
    config,
    {
      renderingIdentifier: params.RenderingIdentifier,
      componentName: listLabel,
      embeddedLayout: effectiveEmbedded,
      containerTextAlignClass,
    },
  );

  /** Keep rows with a stable id; `fields` may be missing when CMS uses `field` or GraphQL flattens the row. */
  const filteredCallouts =
    Callouts?.filter((item) => item?.id != null && String(item.id).length > 0) ?? [];
  const visibleCallouts = isEditing
    ? filteredCallouts
    : filteredCallouts.filter((item) => calloutItemHasPreviewContent(item.fields));

  /**
   * Single stat (non–Content Switcher): force Direction `row` for stacked card bands.
   * Content Switcher: skip so lone `card`+`column`+xs/sm/base keeps {@link isCalloutCardColumnHorizontalSplit}.
   */
  const calloutItemConfig: CalloutConfig =
    visibleCallouts.length === 1 &&
    config.direction === 'column' &&
    !contentSwitcherLayout
      ? { ...config, direction: 'row' }
      : config;

  const isSingleStandalone = !effectiveEmbedded && visibleCallouts.length === 1;
  const isCardStyle = config.style === 'card';
  const singleStandaloneFootnoteStripClass =
    isCardStyle ? 'w-full max-w-[80rem] mx-auto px-0' : "w-full max-w-[80rem] mx-auto px-4";
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
  const statsShellPadClass =
    contentSwitcherLayout ? 'w-full py-0'
    : textAsideAsideLayout ?
      'w-full py-0'
    : embeddedLayout ?
      'w-full max-md:py-0 md:pt-6 md:max-lg:pb-2 lg:pt-8 lg:pb-0'
    : isSingleStandalone ?
      'w-full py-0 max-md:py-0 md:py-0 lg:py-0'
    : 'w-full py-4 sm:py-6 md:py-6 lg:py-8';
  const itemLivePadClass =
    effectiveEmbedded ||
    isSingleStandalone ||
    (isCardStyle && layoutIsRow) ||
    isContentSwitcherTextRow ||
    contentSwitcherLayout
      ? 'sm:pl-0 sm:pr-0 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0'
      : "sm:pl-12 sm:pr-0 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0";
  const gridJustifyMd =
    (effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow) ? 'md:justify-start' : 'md:justify-center';
  const containerListOffsetClass =
    textAsideMultiStack || textAsideAsideLayout ? ''
    : contentSwitcherLayout ? ''
    : isSingleStandalone ? ''
    : embeddedLayout ? 'max-md:mt-0 md:-mt-8'
    : '-mt-8';
  const rowListContainerClass =
    contentSwitcherLayout ? ''
    : embeddedLayout && layoutIsRow ? "md:grid md:grid-cols-2 md:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] md:items-stretch md:min-w-0 lg:flex lg:flex-row lg:flex-wrap lg:items-start lg:justify-start lg:gap-0 lg:min-w-0" : layoutIsRow ?
      'md:grid md:grid-cols-[var(--width-callout-stat-cell)_var(--width-callout-stat-cell)] md:items-stretch lg:flex lg:flex-row lg:items-start lg:justify-start lg:gap-0'
    : '';
  const contentSwitcherListShell =
    visibleCallouts.length > 1 ?
      `box-border w-full min-w-0 max-w-full max-lg:flex max-lg:flex-col max-lg:flex-nowrap max-lg:items-stretch max-lg:gap-0 lg:flex lg:items-stretch lg:gap-4 lg:min-h-0 lg:-mt-4 lg:min-w-0 ${containerTextInkClass}`
    : `flex w-full min-w-0 max-w-full flex-col items-stretch gap-0 ${containerTextInkClass}`;
  const containerClasses =
    contentSwitcherLayout && visibleCallouts.length > 0 ? contentSwitcherListShell
    : textAsideMultiStack ?
      `flex w-full min-w-0 max-w-full flex-col flex-nowrap items-stretch gap-0 ${containerTextInkClass}`
    : isSingleStandalone ?
      `flex w-full flex-col flex-nowrap items-start justify-start gap-0 ${containerTextInkClass}`
    : layoutIsRow ?
      textAsideSingleFullWidthRow ?
        `flex w-full min-w-0 max-w-full flex-col flex-nowrap items-stretch justify-start gap-0 ${containerTextInkClass}`
      : `flex w-full flex-col flex-nowrap items-start justify-start gap-0 ${containerTextInkClass} ${containerListOffsetClass} ${rowListContainerClass} ${gridJustifyMd}`
    : textAsideAsideLayout ?
      `flex w-full min-w-0 max-w-full flex-col flex-nowrap items-stretch justify-start gap-0 ${containerTextInkClass}`
    : `flex w-full flex-col flex-nowrap items-start justify-start gap-0 ${containerTextInkClass} ${containerListOffsetClass}`;
  const embeddedRowStatCellClass =
    embeddedLayout && layoutIsRow && !isCardStyle ? `md:box-border md:w-full md:min-w-0 md:max-w-full md:h-[var(--min-height-callout-stat-cell)] md:min-h-[var(--min-height-callout-stat-cell)] md:max-h-none md:shrink-0 lg:max-xl:box-border lg:max-xl:min-h-[var(--min-height-callout-stat-embedded-narrow)] lg:max-xl:h-auto lg:max-xl:max-h-none lg:max-xl:w-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:min-w-0 lg:max-xl:max-w-none lg:max-xl:basis-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:grow lg:max-xl:shrink lg:max-xl:justify-start lg:max-xl:items-start lg:max-xl:px-0 xl:box-border xl:min-h-0 xl:max-h-[var(--height-callout-stat-desktop-cell)] xl:h-[var(--height-callout-stat-desktop-cell)] xl:min-w-0 xl:max-w-[var(--width-callout-stat-desktop-cell)] xl:w-[var(--width-callout-stat-desktop-cell)] xl:basis-[var(--width-callout-stat-desktop-cell)] xl:grow xl:shrink xl:justify-start xl:items-start xl:px-0` : "md:box-border md:w-full md:min-w-0 md:max-w-[var(--width-callout-stat-cell)] md:h-[var(--min-height-callout-stat-cell)] md:min-h-[var(--min-height-callout-stat-cell)] md:max-h-[var(--min-height-callout-stat-cell)] md:shrink-0 lg:box-border lg:flex lg:min-h-0 lg:max-h-[var(--height-callout-stat-desktop-cell)] lg:w-[var(--width-callout-stat-desktop-cell)] lg:min-w-[var(--width-callout-stat-desktop-cell)] lg:max-w-[var(--width-callout-stat-desktop-cell)] lg:h-[var(--height-callout-stat-desktop-cell)] lg:shrink-0 lg:justify-start lg:items-start lg:px-0";

  const statsRowAlignClass =
    contentSwitcherLayout ? 'w-full min-w-0'
    : textAsideAsideLayout && visibleCallouts.length > 0 ? 'w-full min-w-0'
    : isSingleStandalone || (effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow)
      ? 'md:flex md:justify-start'
      : layoutIsRow
        ? 'md:flex md:justify-center'
        : 'md:flex md:justify-start';
  /** CS multi-stat row: list shell is `w-full`; avoid double width constraints from the row layout helper. */
  const statsListWidthClass =
    textAsideAsideLayout && visibleCallouts.length > 0 ?
      'w-full max-w-none mx-0'
    : layoutIsRow && !(contentSwitcherLayout && visibleCallouts.length > 1) ?
      'w-full max-w-none mx-0'
    : '';
  const footnoteRowAlignClass =
    contentSwitcherLayout ? 'w-full min-w-0'
    : textAsideAsideLayout && visibleCallouts.length > 0 ? 'w-full min-w-0'
    : (effectiveEmbedded && layoutIsRow) || (isCardStyle && layoutIsRow)
      ? 'md:flex md:justify-start'
      : layoutIsRow
        ? 'md:flex md:justify-center'
        : 'md:flex md:justify-start';
  const footnoteInnerWidthClass =
    contentSwitcherLayout ? 'w-full max-w-none'
    : textAsideAsideLayout && visibleCallouts.length > 0 ? 'w-full max-w-none'
    : layoutIsRow ? 'w-full max-w-none'
    : "w-[var(--width-callout-stat-mobile)] max-w-full";

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

  const footnoteBlockGap = isContentSwitcherTextRow ? 'max-md:mt-3 mt-3' : 'max-md:mt-3 mt-4';
  const footnoteLinkTopGapClass =
    isCardStyle ? 'mt-0 max-md:mt-0' : footnoteBlockGap;
  const footnoteInner: ReactNode = (
    <>
      {showGroupFootnoteField && (
        <Text
          field={Footnote}
          tag="p"
          className={cn(footnoteBlockGap, 'text-font-small text-ink-secondary italic', headingAlignClass)}
        />
      )}
      {(hasGroupLinkHref || isEditing) && Link && (
        contentSwitcherLayout ?
          <div className="min-w-0 max-w-full p-0 mx-0 mb-0">
            <ContentSdkLink
              field={Link}
              editable={isEditing}
              showLinkTextWithChildrenPresent={false}
              className="box-border inline-flex max-w-full cursor-pointer items-center gap-[2px] border-0 !mx-0 !mb-0 !mt-3 !p-0 font-media-tile text-[length:14px] font-normal leading-[21px] text-link no-underline underline-offset-2 decoration-solid decoration-[var(--color-link)] transition-[color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent] hover:text-link-strong hover:decoration-[var(--color-link-strong)] hover:[&_.content-switcher-callout-link-label]:underline focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2 focus:ring-offset-surface-subtle"
              target={linkTarget || undefined}
              rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
              {...(groupLinkAriaLabel ? { 'aria-label': groupLinkAriaLabel } : {})}
            >
              <span className="content-switcher-callout-link-label min-w-0 shrink underline-offset-2">
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
            className={`${footnoteLinkTopGapClass} inline-block text-nav-link-hover hover:text-nav-link-active transition-colors no-underline hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2`}
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
          contentSwitcherLayout ?
            "box-border block w-full max-w-full min-h-0 !mt-0 !mb-2.5 !mx-0 border-0 !p-0 text-left !font-bold uppercase tracking-[0.35px] text-[length:var(--text-font-media-tile-eyebrow)] leading-[length:var(--leading-font-media-tile-eyebrow)] !text-ink-muted font-media-tile [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
          : cn(
              'mb-4 w-full text-font-big font-bold text-ink-primary',
              headingAlignClass,
              textAsideAsideLayout && 'mt-0! mx-0! px-0!',
            ),
        )}
      />
    : null;

  /** CS tab: vertical gap under the eyebrow heading is only `!mb-2.5` on the h2 — no extra `mt-*` on this shell. */
  const statsSection: ReactNode =
    visibleCallouts.length > 0 ?
      <div
        className={`${statsShellPadClass} ${statsRowAlignClass}`}
      >
        <div
          className={`${containerClasses} ${statsListWidthClass}`}
          role="list"
          {...(listLabel ? { 'aria-label': listLabel } : {})}
        >
          {visibleCallouts.map((item, index) => {
            const separatorIndex = index - 1;
            const isMiddleSeparator = layoutIsRow && visibleCallouts.length > 2 && separatorIndex === 1;
            const isTabletSecondColumn = layoutIsRow && index % 2 === 1;
            const itemMarginTopClass =
              contentSwitcherLayout || isContentSwitcherTextRow ? 'md:mt-0 lg:mt-0'
              : textAsideAsideLayout ? 'md:mt-0 lg:mt-0'
              : layoutIsRow && Math.floor(index / 2) > 0 ? 'md:mt-0 lg:mt-8'
              : "md:mt-8 lg:mt-8";
            const rowWrapperClass =
              contentSwitcherLayout ?
                visibleCallouts.length > 1 ?
                  "w-auto min-w-0 max-w-full lg:flex lg:flex-col lg:min-h-0 lg:min-w-0 lg:max-w-full lg:self-stretch"
                : 'w-full min-w-0'
              : textAsideMultiStack ? 'w-full min-w-0 max-w-full'
              : isSingleStandalone ? 'w-full'
              : layoutIsRow ? 'contents'
              : '';
            const mobileRowBetweenClass =
              index > 0 ?
                cn(
                  'max-md:mt-0 max-md:py-0 max-md:pt-8 max-md:pb-8',
                  isCardStyle ?
                    'max-md:border-t-0'
                  : 'max-md:border-t max-md:border-stroke-default',
                )
              : '';
            const tabletBetweenColsClass =
              isEmbeddedRow ?
                isTabletSecondColumn ?
                  isCardStyle ?
                    "md:max-lg:border-l-0 md:max-lg:pl-[var(--padding-callout-tablet-after-vertical)] md:max-lg:pr-0"
                  : "md:max-lg:border-l md:max-lg:border-stroke-default md:max-lg:pl-[var(--padding-callout-tablet-after-vertical)]"
                : "md:pr-0"
              : isTabletSecondColumn ?
                isCardStyle ?
                  "md:border-l-0 md:pl-[var(--padding-callout-tablet-after-vertical)] md:pr-0"
                : "md:border-l md:border-stroke-default md:pl-[var(--padding-callout-tablet-after-vertical)]"
              : "md:pr-0";
            const desktopBetweenCellsClass =
              isEmbeddedRow ?
                index === 0 ?
                  "lg:border-l-0 lg:pl-0"
                : isCardStyle ?
                  "lg:max-xl:border-l-0 lg:max-xl:pl-[var(--padding-callout-embedded-narrow-after-vertical)] xl:border-l-0 xl:pl-[var(--padding-callout-desktop-after-vertical)]"
                : "lg:max-xl:border-l lg:max-xl:border-stroke-default lg:max-xl:pl-[var(--padding-callout-embedded-narrow-after-vertical)] xl:border-l xl:border-stroke-default xl:pl-[var(--padding-callout-desktop-after-vertical)]"
              : index === 0 ?
                "lg:border-l-0 lg:pl-0"
              : isCardStyle ?
                "lg:border-l-0 lg:pl-[var(--padding-callout-desktop-after-vertical)]"
              : "lg:border-l lg:border-stroke-default lg:pl-[var(--padding-callout-desktop-after-vertical)]";
            const listItemClass =
              isSingleStandalone ?
                'flex min-w-0 w-full flex-col px-0 py-0 max-md:border-0 max-md:pt-0 max-md:pb-0'
              : textAsideMultiStack ?
                `flex min-w-0 w-full max-w-full flex-col px-0 py-0 m-0 mb-4`
              : contentSwitcherLayout ?
                cn("box-border flex min-w-0 max-w-full flex-col items-stretch border-0 pl-4 pr-0 py-0 m-0 text-base font-normal leading-6 text-ink-primary font-media-tile [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]",
                  index === 0 ? 'mt-0' : 'max-lg:mt-[16px] lg:mt-0',
                  visibleCallouts.length === 1 && '!pl-0',
                  visibleCallouts.length !== 1 && isCardStyle && 'max-lg:pl-0',
                  visibleCallouts.length > 1 && 'lg:pl-0',
                  contentSwitcherEqualHeightRow && 'lg:min-h-0 lg:flex-1',
                )
              : textAsideAsideLayout ?
                layoutIsRow ?
                  cn(
                    'flex min-w-0 w-full max-w-full flex-col px-0 max-md:pt-0 max-md:pb-0 py-0 md:px-0 md:py-0 lg:py-0',
                    textAsideSingleFullWidthRow ? 'md:w-full md:max-w-full' : 'max-md:flex-none md:flex-1',
                    isCardStyle &&
                      isEmbeddedRow &&
                      !textAsideSingleFullWidthRow &&
                      "lg:max-xl:box-border lg:max-xl:min-h-[var(--min-height-callout-stat-embedded-narrow)] lg:max-xl:h-auto lg:max-xl:max-h-none lg:max-xl:w-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:min-w-0 lg:max-xl:max-w-none lg:max-xl:basis-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:grow lg:max-xl:shrink lg:max-xl:justify-start lg:max-xl:items-start lg:max-xl:px-0 xl:box-border xl:min-h-0 xl:max-h-[var(--height-callout-stat-desktop-cell)] xl:h-[var(--height-callout-stat-desktop-cell)] xl:min-w-0 xl:max-w-[var(--width-callout-stat-desktop-cell)] xl:w-[var(--width-callout-stat-desktop-cell)] xl:basis-[var(--width-callout-stat-desktop-cell)] xl:grow xl:shrink xl:justify-start xl:items-start xl:px-0",
                    !isCardStyle && textAsideSingleFullWidthRow && 'md:box-border md:min-w-0 md:shrink-0',
                    !isCardStyle && !textAsideSingleFullWidthRow && embeddedRowStatCellClass,
                    mobileRowBetweenClass,
                    itemLivePadClass,
                    itemMarginTopClass,
                    tabletBetweenColsClass,
                    desktopBetweenCellsClass,
                  )
                : cn(
                    'flex min-w-0 w-full max-w-full flex-col px-0 py-0',
                    index > 0 &&
                      cn(
                        'mt-0 py-0 pt-8 pb-8',
                        isCardStyle ? 'border-t-0' : 'border-t border-stroke-default',
                      ),
                  )
              : layoutIsRow ?
                isCardStyle ?
                  cn(
                    'flex min-w-0 max-md:flex-none md:flex-1 flex-col px-2 max-md:pt-0 max-md:pb-8 py-2 md:px-0 md:py-0 lg:py-0',
                    isEmbeddedRow && "lg:max-xl:box-border lg:max-xl:min-h-[var(--min-height-callout-stat-embedded-narrow)] lg:max-xl:h-auto lg:max-xl:max-h-none lg:max-xl:w-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:min-w-0 lg:max-xl:max-w-none lg:max-xl:basis-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:grow lg:max-xl:shrink lg:max-xl:justify-start lg:max-xl:items-start lg:max-xl:px-0 xl:box-border xl:min-h-0 xl:max-h-[var(--height-callout-stat-desktop-cell)] xl:h-[var(--height-callout-stat-desktop-cell)] xl:min-w-0 xl:max-w-[var(--width-callout-stat-desktop-cell)] xl:w-[var(--width-callout-stat-desktop-cell)] xl:basis-[var(--width-callout-stat-desktop-cell)] xl:grow xl:shrink xl:justify-start xl:items-start xl:px-0",
                    mobileRowBetweenClass,
                    itemLivePadClass,
                    itemMarginTopClass,
                    tabletBetweenColsClass,
                    desktopBetweenCellsClass,
                  )
                : `flex min-w-0 max-md:flex-none md:flex-1 flex-col px-2 max-md:pt-0 max-md:pb-8 py-2 md:px-0 md:py-0 lg:py-0 ${mobileRowBetweenClass} ${embeddedRowStatCellClass} ${itemLivePadClass} ${itemMarginTopClass} ${tabletBetweenColsClass} ${desktopBetweenCellsClass}`
              : cn(
                  'flex min-w-0 max-md:flex-none flex-col px-2',
                  index > 0 ?
                    cn(
                      'mt-0 py-0 pt-8 pb-8',
                      isCardStyle ? 'border-t-0' : 'border-t border-stroke-default',
                    )
                  : 'max-md:pt-0 max-md:pb-8 py-2',
                );
            return (
              <div key={item.id} className={rowWrapperClass}>
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
                      className={cn("max-md:hidden my-8 shrink-0 border-t border-stroke-default lg:hidden", "w-[var(--width-callout-stat-mobile)] max-w-full", isMiddleSeparator ? 'md:col-span-2 md:my-8 md:max-w-[var(--width-callout-tablet-horizontal-rule)] md:w-full md:justify-self-center' : 'md:hidden')}
                    />
                    {/* Vertical line is border-l on desktop cells after first; no separate divider */}
                    <div
                      role="separator"
                      aria-hidden="true"
                      className="mx-2 hidden w-px shrink-0 border-l border-stroke-default md:hidden lg:hidden"
                    />
                  </>
                )}
                <div
                  role="listitem"
                  className={cn(
                    listItemClass,
                    textAsideAsideLayout &&
                      !textAsideMultiStack &&
                      "m-0 mb-4",
                  )}
                >
                  <CalloutItem
                    item={item}
                    config={calloutItemConfig}
                    isEditing={isEditing}
                    isDesktopStatRow={layoutIsRow && !contentSwitcherLayout}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    : null;

  const footnoteSection: ReactNode =
    showFootnoteSection ?
      <div
        className={cn(footnoteShellPadClass, footnoteRowAlignClass, isContentSwitcherTextRow ? '-mt-4 -ml-4 max-md:mt-0 max-md:ml-0' : '')}
      >
        <div className={footnoteInnerWidthClass}>{footnoteInner}</div>
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
    <section
      className={cn(
        'component callout',
        contentSwitcherLayout ||
          (textAsideAsideLayout && embeddedLayout && !contentSwitcherLayout)
          ? '!mt-0 mb-0 mx-0 w-full min-w-0 max-w-full !px-0'
          : 'mt-8',
        embeddedLayout && !contentSwitcherLayout && '!px-0',
        !effectiveEmbedded &&
          'relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)]',
        !contentSwitcherLayout && config.style === 'base' && 'bg-surface-muted',
        styles,
      )}
      {...anchorId}
    >
      <div
        className={cn('component-content', useEmbeddedInner && '!px-0 min-w-0 max-w-full')}
      >
        {useEmbeddedInner ?
          mainContent
        : isSingleStandalone ?
          <>
            <div className={cn("box-border block w-full max-w-[80rem] mx-auto my-0 p-4 leading-6 [text-size-adjust:100%] font-callout [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] border-0 border-solid border-stroke-default [-webkit-tap-highlight-color:transparent]", config.style === "card" ? "min-h-[var(--height-callout-card-shell)]" : "min-h-[116px]")}>
              {headingBlock}
              {statsSection}
            </div>
            {showFootnoteSection ?
              <div
                className={`${singleStandaloneFootnoteStripClass} ${footnoteShellPadClass} ${footnoteRowAlignClass}`}
              >
                <div className="w-full max-w-none">{footnoteInner}</div>
              </div>
            : null}
          </>
        : <div className="relative box-border w-full [unicode-bidi:isolate] md:mx-auto md:max-w-[var(--width-media-tile-split-max)] md:max-[768px]:mx-0 md:max-[768px]:w-full md:max-[768px]:max-w-full md:min-[769px]:tablet-only:mx-[72px] md:min-[769px]:tablet-only:w-[calc(100%-144px)] md:min-[769px]:tablet-only:max-w-[768px] md:tablet-only:px-4 lg:mx-auto lg:max-w-[var(--width-media-tile-split-max)] lg:px-4 max-md:px-4 min-w-0 max-md:max-w-full overflow-x-clip">{mainContent}</div>}
      </div>
    </section>
  );
}
