import { JSX } from 'react';
import { Text, Link as ContentSdkLink, type TextField } from '@sitecore-content-sdk/nextjs';

import type { CalloutItem as CalloutItemType, CalloutConfig } from '../Callout.type';
import { TextAsideCalloutEqualRowBands } from './TextAsideCalloutEqualRowBands';
import {
  CalloutCardColumnAffixText,
  CalloutCardColumnLabelText,
  CalloutCardColumnOuterShell,
  CalloutCardColumnValueSpan,
} from './CalloutStatAtoms';
import {
  calloutFieldValueIsVisible,
  resolveCalloutDisplayTextAlignment,
  isCalloutCardIgnoresCmsTextAlign,
  isCalloutCardColumnHorizontalSplit,
  isCalloutCardColumnSplitXs,
  isCalloutCardColumnSplitSm,
} from '../calloutUtils';
import { CalloutCardLabelBand, CalloutCardStatBand } from './CalloutCardBandShells';
import { ICON_CHEVRON_RIGHT_XS } from 'lib/chrome-icons';
import { cn } from 'lib/utils';

interface CalloutItemProps {
  item: CalloutItemType;
  config: CalloutConfig;
  isEditing: boolean;
  isDesktopStatRow?: boolean;
  isSingleFullWidthLayout?: boolean;
  /** Content Switcher: fluid card chrome in `min-w-0` parents. */
  contentSwitcherLayout?: boolean;
  /** Content Switcher + 2+ stats at `lg+`: equal-height flex (requires `contentSwitcherLayout`). */
  contentSwitcherStretchInRow?: boolean;
  /** Text-and-Aside: full parent column width. */
  textAsideFullWidthItem?: boolean;
  /** Single callout in Text Aside: card row label band matches design reference. */
  textAsideSingleReferenceRowLabel?: boolean;
  singleVisibleCallout?: boolean;
  /** Text-and-Aside 2+ callouts: equal-height card stat + label bands. */
  textAsideMultiCardEqualBands?: boolean;
  /** Content Switcher 3+ stats: below `lg`, card label hugs content width. */
  contentSwitcherCompactCardBelowLg?: boolean;
  /** Global Locations: stat stack without per-item link row. */
  globalLocationsLayout?: boolean;
  globalLocationsTextAlignClass?: string;
  /** Media Tile embedded row (non-card): fluid stat width below 600px (`--width-callout-stat-media-tile-fluid`). */
  embeddedLayoutRowNonCard?: boolean;
  /** Product modal right column: responsive label band width tokens. */
  productModalCalloutLayout?: boolean;
}

/**
 * Renders a single callout item with value line, label, and optional CTA.
 * @param props.item - The callout child item data from Sitecore.
 * @param props.config - Resolved rendering parameters (style, size, alignment, color).
 * @param props.isEditing - Whether XM Cloud Pages is in editing mode.
 * @returns The rendered callout item or null when empty and not editing.
 */
export const CalloutItem = ({
  item,
  config,
  isEditing,
  isDesktopStatRow = false,
  isSingleFullWidthLayout = false,
  contentSwitcherLayout = false,
  contentSwitcherStretchInRow = false,
  textAsideFullWidthItem = false,
  textAsideSingleReferenceRowLabel = false,
  singleVisibleCallout = false,
  textAsideMultiCardEqualBands = false,
  contentSwitcherCompactCardBelowLg = false,
  globalLocationsLayout = false,
  globalLocationsTextAlignClass,
  embeddedLayoutRowNonCard = false,
  productModalCalloutLayout = false,
}: CalloutItemProps): JSX.Element | null => {
  const { PrependValue, Value, AppendValue, Label, Link } = item.fields ?? {};
  const hasPrepend = calloutFieldValueIsVisible(PrependValue?.value);
  const hasValue = calloutFieldValueIsVisible(Value?.value);
  const hasAppend = calloutFieldValueIsVisible(AppendValue?.value);
  const hasLabel = calloutFieldValueIsVisible(Label?.value);
  const hasLinkHref = Boolean(Link?.value?.href);
  const linkVisibleText = Link?.value?.text ? String(Link.value.text).trim() : '';

  const hasPreviewContent =
    hasPrepend || hasValue || hasAppend || hasLabel || hasLinkHref;

  if (!hasPreviewContent && !isEditing) return null;

  /** Value row: only when at least one stat segment exists, or in editor to add content. */
  const showValueRow =
    isEditing || hasPrepend || hasValue || hasAppend;

  if (globalLocationsLayout) {
    const emptyText: TextField = { value: '' };
    const showLabelGl = hasLabel || isEditing;
    const glValueSize =
      config.titleSize === 'xs'
        ? 'max-lg:text-[length:var(--text-callout-card-column-sm-value)] max-lg:leading-[length:var(--leading-callout-card-column-sm-value)] lg:text-font-extrabig lg:leading-6'
        : config.titleSize === 'sm'
          ? 'max-lg:text-[length:var(--text-callout-card-column-sm-value)] max-lg:leading-[length:var(--leading-callout-card-column-sm-value)] lg:text-4xl lg:leading-9'
          : 'max-lg:text-[length:var(--text-callout-card-column-sm-value)] max-lg:leading-[length:var(--leading-callout-card-column-sm-value)] lg:text-5xl lg:leading-none';
    const glAffixSize = 'text-font-normal';
    const glValueColor =
      config.style === 'text'
        ? 'text-accent-cyan'
        : config.colorScheme === 'dark'
          ? 'text-accent-teal'
          : 'text-accent-cyan';
    const glLabelColor =
      config.style === 'text'
        ? config.colorScheme === 'light'
          ? 'text-ink-muted'
          : 'text-ink-primary'
        : config.colorScheme === 'dark'
          ? 'text-ink-inverse'
          : 'text-ink-muted';
    const glTextAlign = globalLocationsTextAlignClass?.trim() || 'text-center';
    const glStackAlign =
      glTextAlign.includes('text-left') ? 'items-start'
      : glTextAlign.includes('text-right') ? 'items-end'
      : 'items-center';
    const glRowJustify =
      glTextAlign.includes('text-left') ? 'justify-start'
      : glTextAlign.includes('text-right') ? 'justify-end'
      : 'justify-center';

    return (
      <div
        className={cn(
          'font-callout flex h-full min-h-0 min-w-0 max-w-full flex-col justify-start gap-0 antialiased',
          glTextAlign,
        )}
      >
        {showValueRow && (
          <div className={cn('flex flex-col gap-0', glStackAlign)}>
            {(hasPrepend || isEditing) && (
              <Text
                field={PrependValue ?? emptyText}
                tag="span"
                className={cn(
                  config.style === 'text'
                    ? 'block w-full font-bold uppercase leading-4 tracking-[0.4px] text-ink-primary'
                    : 'block font-bold uppercase leading-none tracking-wide text-ink-primary',
                  config.style === 'text' && glTextAlign,
                  glAffixSize,
                )}
              />
            )}
            <div
              className={cn(
                'flex w-full min-w-0 flex-row flex-nowrap items-baseline gap-x-0.5 font-bold uppercase',
                glRowJustify,
              )}
            >
              {(hasValue || isEditing) && (
                <span className={cn('m-0 inline-block max-w-full shrink-0', glValueSize, glValueColor)}>
                  <Text field={Value ?? emptyText} tag="span" className="inline-block max-w-full" />
                </span>
              )}
              {(hasAppend || isEditing) && (
                <Text
                  field={AppendValue ?? emptyText}
                  tag="span"
                  className={cn(
                    config.style === 'text'
                      ? 'inline-block shrink-0 self-end pb-0.5 uppercase leading-4 tracking-[0.4px] text-ink-primary'
                      : 'inline-block shrink-0 self-end pb-0.5 font-bold uppercase leading-none tracking-wide text-ink-primary',
                    glAffixSize,
                  )}
                />
              )}
            </div>
          </div>
        )}
        {showLabelGl && (
          <Text
            field={Label ?? emptyText}
            tag="span"
            className={cn(
              'block min-h-0 w-full min-w-0 max-w-full break-words font-bold uppercase antialiased text-font-normal leading-5',
              glTextAlign,
              glLabelColor,
            )}
          />
        )}
      </div>
    );
  }

  const textAlignment = isCalloutCardIgnoresCmsTextAlign(config)
    ? 'left'
    : resolveCalloutDisplayTextAlignment(config);
  const valueSize =
    config.titleSize === 'xs' ? 'text-font-extrabig leading-6'
    : config.titleSize === 'sm' ? 'text-4xl leading-9'
    : 'text-5xl leading-none';
  const affixSize = 'text-font-normal';
  const labelSize =
    config.titleSize === 'xs'
      ? 'text-[length:var(--text-callout-label-xs)] leading-[length:var(--leading-callout-label-xs)] tracking-[length:var(--tracking-callout-card-column-sm-label)]'
    : config.titleSize === 'sm'
      ? 'text-font-media-tile-eyebrow leading-font-media-tile-eyebrow'
    : 'text-font-normal leading-5';
  const alignment = textAlignment === 'center' ? 'text-center' : 'text-left';
  const valueStackAlign = textAlignment === 'center' ? 'items-center' : 'items-start';
  const valueRowJustify = textAlignment === 'center' ? 'justify-center' : 'justify-start';
  const valueAppendInlineRow = textAlignment === 'left' || textAlignment === 'center';
  const valueColor =
    config.style === 'text'
      ? 'text-accent-cyan'
      : config.colorScheme === 'dark'
        ? 'text-accent-teal'
        : 'text-accent-cyan';
  const labelColor =
    config.style === 'text'
      ? config.colorScheme === 'light'
        ? 'text-ink-muted'
        : 'text-ink-primary'
      : config.colorScheme === 'dark'
        ? 'text-ink-inverse'
        : 'text-ink-muted';

  const isColumnTextStatLayout =
    config.style === 'text' && config.direction === 'column' && showValueRow;

  const isCardDirectionRow = config.style === 'card' && config.direction === 'row';

  const isTextStyleStackLayout = config.style === 'text' && !isColumnTextStatLayout;

  const columnTextSideLabelColor =
    config.colorScheme === 'light' ? 'text-ink-muted' : labelColor;

  const linkTarget = Link?.value?.target;
  const hasLink = hasLinkHref;

  /** Accessible name for link when anchor text is empty (no hardcoded fallbacks). */
  const itemLinkAriaLabel =
    !linkVisibleText && (hasLabel || item.displayName)
      ? String(Label?.value ?? item.displayName)
      : undefined;

  const isCardColumnHorizontalSplit = isCalloutCardColumnHorizontalSplit(config);

  /** Content Switcher + 2+ horizontal-split cards: content-width pill (`w-max`); else full width in tab. */
  const contentSwitcherMultiRowHorizontalSplit = Boolean(
    contentSwitcherLayout && !singleVisibleCallout && isCardColumnHorizontalSplit,
  );

  /**
   * CS preview: only the group-level Link is shown in the footnote; per-item links are hidden (not while editing).
   */
  const useCardChrome = config.style === 'card';
  const isCardColumnSplitXs = isCalloutCardColumnSplitXs(config);
  const isCardColumnSplitSm = isCalloutCardColumnSplitSm(config);

  /** CS + one visible stat: `w-max max-w-full` pill + label `max-w` tokens (`--width-callout-content-switcher-hsplit-label-*`, xs < sm < base). */
  const contentSwitcherSingleHorizontalSplitReference =
    contentSwitcherLayout && singleVisibleCallout && isCardColumnHorizontalSplit;

  /** Content Switcher multi-stat row stretch: both `contentSwitcherLayout` and `contentSwitcherStretchInRow` required. */
  const stretchCsRow = Boolean(contentSwitcherLayout && contentSwitcherStretchInRow);


  if (useCardChrome) {
    const csCompactBelowLg = Boolean(contentSwitcherLayout && contentSwitcherCompactCardBelowLg);
    const isCsHsplitOuterLayout =
      contentSwitcherSingleHorizontalSplitReference ||
      (contentSwitcherLayout && isCardColumnHorizontalSplit);
    const cardBandChromeProps = {
      contentSwitcherSingleHorizontalSplitReference,
      contentSwitcherLayout: Boolean(contentSwitcherLayout),
      singleVisibleCallout: Boolean(singleVisibleCallout),
      isCardColumnHorizontalSplit,
      isCardColumnSplitXs,
      isCardColumnSplitSm,
      textAsideFullWidthItem: Boolean(textAsideFullWidthItem),
      textAsideSingleReferenceRowLabel: Boolean(textAsideSingleReferenceRowLabel),
      textAsideMultiCardEqualBands: Boolean(textAsideMultiCardEqualBands),
      textAlignment,
      csCompactBelowLg,
      productModalCalloutLayout,
    };
    const cardStatInner = (
      <div
        className={cn(
          'flex w-full flex-col gap-0 antialiased',
          isCardColumnHorizontalSplit && 'min-w-0 max-w-full items-stretch',
          isCardColumnHorizontalSplit &&
            textAsideMultiCardEqualBands &&
            !contentSwitcherLayout &&
            'h-full min-h-0 justify-center',
          isCardColumnHorizontalSplit && stretchCsRow && 'lg:h-grow lg:justify-center',
          !isCardColumnHorizontalSplit && contentSwitcherLayout && 'min-w-0 max-w-full items-start',
          !isCardColumnHorizontalSplit && !contentSwitcherLayout && valueStackAlign,
        )}
      >
        {isCardColumnHorizontalSplit ? (
          <>
            {(hasPrepend || isEditing) && (
              <CalloutCardColumnAffixText
                field={PrependValue}
                includeMinHeight={
                  !(contentSwitcherSingleHorizontalSplitReference || !contentSwitcherLayout)
                }
              />
            )}
            {(hasValue || isEditing) && (
              <CalloutCardColumnValueSpan field={Value} config={config} />
            )}
            {(hasAppend || isEditing) && (
              <CalloutCardColumnAffixText
                field={AppendValue}
                includeMinHeight={
                  !(contentSwitcherSingleHorizontalSplitReference || !contentSwitcherLayout)
                }
              />
            )}
          </>
        ) : (
          <>
            {(hasPrepend || isEditing) && (
              <Text
                field={PrependValue}
                tag="span"
                className={cn(
                  'block w-full font-bold uppercase text-ink-inverse text-font-medium leading-4 [unicode-bidi:isolate]',
                  alignment,
                )}
              />
            )}
            <div
              className={cn(
                'flex w-full font-bold uppercase leading-none',
                valueAppendInlineRow
                  ? 'min-w-0 flex-row flex-nowrap items-baseline gap-x-0.5'
                  : 'flex-col gap-1 md:w-auto md:flex-row md:flex-wrap md:items-baseline md:gap-x-0.5 md:gap-y-0',
                valueRowJustify,
                !valueAppendInlineRow && valueStackAlign,
              )}
            >
              {(hasValue || isEditing) && (
                <span className="inline-block max-w-full shrink-0 font-bold uppercase text-ink-inverse text-[length:var(--text-callout-card-value)] leading-[length:var(--leading-callout-card-value)] [unicode-bidi:isolate]">
                  <Text field={Value} tag="span" className="inline-block max-w-full" />
                </span>
              )}
              {(hasAppend || isEditing) && (
                <Text
                  field={AppendValue}
                  tag="span"
                  className="inline-block shrink-0 font-bold uppercase text-ink-inverse text-font-extrabig leading-6 ml-1 [unicode-bidi:isolate]"
                />
              )}
            </div>
          </>
        )}
      </div>
    );

    const showStatBand = showValueRow || isEditing;
    const showLabelBand = hasLabel || isEditing;
    const useEqualRowBands =
      textAsideMultiCardEqualBands &&
      !isCardColumnHorizontalSplit &&
      !contentSwitcherLayout &&
      showStatBand &&
      showLabelBand;

    const cardLabelInner = isCardColumnHorizontalSplit ? (
      <div
        className={cn(
          'box-border min-w-0 w-full max-w-full [unicode-bidi:isolate]',
          productModalCalloutLayout && 'break-words',
          (contentSwitcherSingleHorizontalSplitReference || !contentSwitcherLayout) && 'text-left',
        )}
      >
        <CalloutCardColumnLabelText
          field={Label}
          config={config}
          isCardColumnSplitXs={isCardColumnSplitXs}
          isCardColumnSplitSm={isCardColumnSplitSm}
          productModalCalloutLayout={productModalCalloutLayout}
        />
      </div>
    ) : (
      <Text
        field={Label}
        tag="span"
        className={cn(
          'box-border inline-block min-w-0 max-w-full m-0 p-0 border-0 break-words font-bold uppercase text-ink-inverse tracking-[length:var(--tracking-callout-card-column-sm-label)] font-callout [-webkit-tap-highlight-color:transparent] antialiased [unicode-bidi:isolate]',
          singleVisibleCallout
            ? 'text-font-medium leading-[16px]'
            : 'text-[length:var(--text-callout-label-xs)] leading-[length:var(--leading-callout-label-xs)]',
          alignment,
          'max-md:min-h-0',
        )}
      />
    );

    const outerShellProps = {
      isCsHsplitOuterLayout,
      isCardColumnHorizontalSplit,
      textAsideMultiCardEqualBands: Boolean(textAsideMultiCardEqualBands),
      stretchCsRow,
      csCompactBelowLg,
      productModalCalloutLayout,
    };

    return (
      <div
        className={cn(
          'font-callout',
          alignment,
          contentSwitcherMultiRowHorizontalSplit ? '' : 'w-full ',
          contentSwitcherMultiRowHorizontalSplit &&
            (productModalCalloutLayout ? 'w-full max-w-full min-w-0' : 'w-max max-w-full min-w-0'),
          (contentSwitcherLayout ||
            textAsideFullWidthItem ||
            isSingleFullWidthLayout ||
            isCardDirectionRow ||
            isColumnTextStatLayout) &&
            !contentSwitcherMultiRowHorizontalSplit &&
            'w-full max-w-full min-w-0',
          isDesktopStatRow &&
            !contentSwitcherMultiRowHorizontalSplit &&
            !contentSwitcherLayout &&
            !textAsideFullWidthItem &&
            !isSingleFullWidthLayout &&
            !isCardDirectionRow &&
            !isColumnTextStatLayout &&
            (embeddedLayoutRowNonCard
              ? 'w-full max-w-[var(--width-callout-stat-media-tile-fluid)] sm:max-w-[var(--width-callout-stat-tablet-text)] lg:mx-0 lg:w-[var(--width-callout-stat-desktop-text)] lg:min-w-[var(--width-callout-stat-desktop-text)] lg:shrink-0'
              : 'max-w-[var(--width-callout-stat-mobile)] sm:max-w-[var(--width-callout-stat-tablet-text)] lg:mx-0 lg:w-[var(--width-callout-stat-desktop-text)] lg:min-w-[var(--width-callout-stat-desktop-text)] lg:shrink-0'),
          !contentSwitcherMultiRowHorizontalSplit &&
            !contentSwitcherLayout &&
            !textAsideFullWidthItem &&
            !isSingleFullWidthLayout &&
            !isCardDirectionRow &&
            !isColumnTextStatLayout &&
            !isDesktopStatRow &&
            'max-w-[var(--width-callout-stat-mobile)]',
          stretchCsRow && 'flex min-h-0 max-lg:flex-1 flex-col lg:h-grow',
          contentSwitcherLayout && 'leading-none',
        )}
      >
        {useEqualRowBands ? (
          <TextAsideCalloutEqualRowBands
            {...outerShellProps}
            {...cardBandChromeProps}
            statInner={cardStatInner}
            labelInner={cardLabelInner}
          />
        ) : (
          <CalloutCardColumnOuterShell {...outerShellProps}>
            {showStatBand && (
              <CalloutCardStatBand {...cardBandChromeProps}>{cardStatInner}</CalloutCardStatBand>
            )}
            {showLabelBand && (
              <CalloutCardLabelBand {...cardBandChromeProps}>{cardLabelInner}</CalloutCardLabelBand>
            )}
          </CalloutCardColumnOuterShell>
        )}

        {(hasLink || isEditing) && Link && (
          contentSwitcherLayout ? (
            <div
              className={cn(
                Boolean(contentSwitcherLayout) ? '' : (showValueRow || hasLabel || isEditing) ? 'mt-3' : '',
                stretchCsRow && 'shrink-0',
                contentSwitcherLayout && !isEditing && 'hidden',
              )}
            >
              <ContentSdkLink
                field={Link}
                editable={isEditing}
                showLinkTextWithChildrenPresent={false}
                className="box-border inline-flex max-w-full cursor-pointer items-center gap-[2px] border-0 !mx-0 !mb-0 !mt-3 !p-0 font-media-tile text-font-media-tile-eyebrow font-normal leading-[21px] text-link no-underline underline-offset-2 decoration-solid decoration-[var(--color-link)] transition-[color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] hover:text-link-strong hover:decoration-[var(--color-link-strong)] hover:[&_.content-switcher-callout-link-label]:underline focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2 focus:ring-offset-surface-subtle"
                target={linkTarget || undefined}
                rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
                {...(itemLinkAriaLabel ? { 'aria-label': itemLinkAriaLabel } : {})}
              >
                <span className="content-switcher-callout-link-label min-w-0 shrink underline-offset-2">
                  {linkVisibleText.length > 0 ? linkVisibleText : isEditing ? '\u00a0' : ''}
                </span>
                {ICON_CHEVRON_RIGHT_XS}
              </ContentSdkLink>
            </div>
          ) : (
            <ContentSdkLink
              field={Link}
              editable={isEditing}
              className={cn(
                Boolean(contentSwitcherLayout) ? '' : (showValueRow || hasLabel || isEditing) ? 'mt-3' : '',
                'inline-block text-nav-link-hover hover:text-nav-link-active transition-colors text-font-normal no-underline hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2',
              )}
              target={linkTarget || undefined}
              rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
              {...(itemLinkAriaLabel ? { 'aria-label': itemLinkAriaLabel } : {})}
            />
          )
        )}
      </div>
    );
  }

  return (
    <div
        className={cn(
        'font-callout',
        alignment,
        contentSwitcherMultiRowHorizontalSplit ? '' : 'w-full ',
        contentSwitcherMultiRowHorizontalSplit &&
          (productModalCalloutLayout ? 'w-full max-w-full min-w-0' : 'w-max max-w-full min-w-0'),
        (contentSwitcherLayout ||
          textAsideFullWidthItem ||
          isSingleFullWidthLayout ||
          isCardDirectionRow ||
          isColumnTextStatLayout) &&
          !contentSwitcherMultiRowHorizontalSplit &&
          'w-full max-w-full min-w-0',
        isDesktopStatRow &&
          !contentSwitcherMultiRowHorizontalSplit &&
          !contentSwitcherLayout &&
          !textAsideFullWidthItem &&
          !isSingleFullWidthLayout &&
          !isCardDirectionRow &&
          !isColumnTextStatLayout &&
          (embeddedLayoutRowNonCard
            ? 'w-full max-w-[var(--width-callout-stat-media-tile-fluid)] sm:max-w-[var(--width-callout-stat-tablet-text)] lg:mx-0 lg:w-[var(--width-callout-stat-desktop-text)] lg:min-w-[var(--width-callout-stat-desktop-text)] lg:shrink-0'
            : 'max-w-[var(--width-callout-stat-mobile)] sm:max-w-[var(--width-callout-stat-tablet-text)] lg:mx-0 lg:w-[var(--width-callout-stat-desktop-text)] lg:min-w-[var(--width-callout-stat-desktop-text)] lg:shrink-0'),
        !contentSwitcherMultiRowHorizontalSplit &&
          !contentSwitcherLayout &&
          !textAsideFullWidthItem &&
          !isSingleFullWidthLayout &&
          !isCardDirectionRow &&
          !isColumnTextStatLayout &&
          !isDesktopStatRow &&
          'max-w-[var(--width-callout-stat-mobile)]',
        stretchCsRow && 'flex min-h-0 max-lg:flex-1 flex-col lg:h-grow',
      )}
    >
      {isColumnTextStatLayout ? (
        <div
          className={cn('w-full', textAlignment === 'center' && 'flex justify-center')}
        >
          <div
            className={cn(
              'inline-grid grid-cols-1 antialiased',
              (hasLabel || isEditing) && 'max-w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-0',
              (hasLabel || isEditing) && textAlignment !== 'center' && 'w-full',
            )}
          >
            <div className="flex min-w-0 min-h-0 flex-col items-end justify-center gap-0">
              {(hasPrepend || isEditing) && (
                <Text
                field={PrependValue}
                tag="span"
                className={cn(
                  'block w-full text-right font-bold uppercase leading-4 tracking-[0.4px] text-ink-primary',
                  affixSize,
                )}
              />
              )}
              {(hasValue || isEditing) && (
                <span
                  className={cn(
                    'box-border mb-2 block w-full p-px text-right font-bold [unicode-bidi:isolate]',
                    valueSize,
                    valueColor,
                  )}
                >
                  <Text field={Value} tag="span" className="inline-block max-w-full" />
                </span>
              )}
              {(hasAppend || isEditing) && (
                <Text
                field={AppendValue}
                tag="span"
                className={cn(
                  'block w-full text-right font-bold uppercase leading-4 tracking-[0.4px] text-ink-primary',
                  affixSize,
                )}
              />
              )}
            </div>
            {(hasLabel || isEditing) && (
              <div className="flex min-h-0 min-w-0 items-center py-px pl-4 pr-px [unicode-bidi:isolate]">
                <Text
                  field={Label}
                  tag="span"
                  className={cn(
                    'block min-w-0 max-w-full break-words text-left font-bold normal-case antialiased',
                    labelSize,
                    columnTextSideLabelColor,
                  )}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        showValueRow && (
          <div
            className={cn(
              'flex flex-col antialiased',
              valueStackAlign,
              isTextStyleStackLayout && 'gap-0',
              !isTextStyleStackLayout && 'gap-1',
              (hasLabel || hasLink || isEditing) && isTextStyleStackLayout && 'mb-0',
              (hasLabel || hasLink || isEditing) && !isTextStyleStackLayout && 'mb-3',
            )}
          >
            {(hasPrepend || isEditing) && (
              <Text
                field={PrependValue}
                tag="span"
                className={cn(
                  isTextStyleStackLayout
                    ? 'block w-full font-bold uppercase leading-4 tracking-[0.4px] text-ink-primary'
                    : 'block font-bold uppercase leading-none tracking-wide text-ink-primary',
                  affixSize,
                  isTextStyleStackLayout && alignment,
                )}
              />
            )}
            {/* Left/center: value | append one line; SDK Text may be block — inline-block keeps one flex row. */}
            <div
              className={cn(
                'flex w-full font-bold uppercase',
                isTextStyleStackLayout &&
                  valueAppendInlineRow &&
                  'min-w-0 flex-row flex-nowrap items-baseline gap-x-0.5',
                isTextStyleStackLayout &&
                  !valueAppendInlineRow &&
                  'flex-col gap-1 leading-none md:w-auto md:flex-row md:flex-wrap md:items-baseline md:gap-x-0.5 md:gap-y-0',
                !isTextStyleStackLayout && 'leading-none',
                valueRowJustify,
                isTextStyleStackLayout && !valueAppendInlineRow && valueStackAlign,
                !isTextStyleStackLayout &&
                  valueAppendInlineRow &&
                  'min-w-0 flex-row flex-nowrap items-baseline gap-x-0.5',
                !isTextStyleStackLayout &&
                  !valueAppendInlineRow &&
                  'flex-col gap-1 md:w-auto md:flex-row md:flex-wrap md:items-baseline md:gap-x-0.5 md:gap-y-0',
                !isTextStyleStackLayout && !valueAppendInlineRow && valueStackAlign,
              )}
            >
              {(hasValue || isEditing) && (
                <span
                  className={cn(
                    'mb-2 inline-block max-w-full shrink-0',
                    valueSize,
                    valueColor,
                  )}
                >
                  <Text field={Value} tag="span" className="inline-block max-w-full" />
                </span>
              )}
              {(hasAppend || isEditing) && (
                <Text
                  field={AppendValue}
                  tag="span"
                  className={cn(
                    isTextStyleStackLayout
                      ? 'inline-block shrink-0 uppercase leading-4 pb-0.5 tracking-[0.4px] text-ink-primary'
                      : 'inline-block shrink-0 leading-none tracking-wide pb-0.5 text-ink-primary',
                    affixSize,
                    valueAppendInlineRow ? 'self-end' : 'md:self-end',
                  )}
                />
              )}
            </div>
          </div>
        )
      )}

      {!isColumnTextStatLayout && (hasLabel || isEditing) && (
        <Text
          field={Label}
          tag="span"
          className={cn(
            'block min-w-0 max-w-full w-full break-words font-bold uppercase antialiased max-md:min-h-0',
            alignment,
            labelSize,
            labelColor,
            !isTextStyleStackLayout && 'sm:min-h-[var(--min-height-callout-label)]',
            isDesktopStatRow &&
              !isSingleFullWidthLayout &&
              !isTextStyleStackLayout &&
              'lg:min-h-[var(--height-callout-desktop-label)] lg:max-h-[var(--height-callout-desktop-label)]',
          )}
        />
      )}

      {(hasLink || isEditing) && Link && (
        contentSwitcherLayout ?
          <div
            className={
              cn(
                Boolean(contentSwitcherLayout) ? '' : (showValueRow || hasLabel || isEditing) ? 'mt-3' : '',
                contentSwitcherLayout && !isEditing && 'hidden',
              ) || undefined
            }
          >
            <ContentSdkLink
              field={Link}
              editable={isEditing}
              showLinkTextWithChildrenPresent={false}
              className="box-border inline-flex max-w-full cursor-pointer items-center gap-[2px] border-0 !mx-0 !mb-0 !mt-3 !p-0 font-media-tile text-font-media-tile-eyebrow font-normal leading-[21px] text-link no-underline underline-offset-2 decoration-solid decoration-[var(--color-link)] transition-[color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] hover:text-link-strong hover:decoration-[var(--color-link-strong)] hover:[&_.content-switcher-callout-link-label]:underline focus:outline-none focus:ring-2 focus:ring-link focus:ring-offset-2 focus:ring-offset-surface-subtle"
              target={linkTarget || undefined}
              rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
              {...(itemLinkAriaLabel ? { 'aria-label': itemLinkAriaLabel } : {})}
            >
              <span className="content-switcher-callout-link-label min-w-0 shrink underline-offset-2">
                {linkVisibleText.length > 0 ? linkVisibleText : isEditing ? '\u00a0' : ''}
              </span>
              {ICON_CHEVRON_RIGHT_XS}
            </ContentSdkLink>
          </div>
        : <ContentSdkLink
            field={Link}
            editable={isEditing}
            className={cn(
              Boolean(contentSwitcherLayout) ? '' : (showValueRow || hasLabel || isEditing) ? 'mt-3' : '',
              'inline-block text-nav-link-hover hover:text-nav-link-active transition-colors text-font-normal no-underline hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2',
            )}
            target={linkTarget || undefined}
            rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
            {...(itemLinkAriaLabel ? { 'aria-label': itemLinkAriaLabel } : {})}
          />
      )}
    </div>
  );
};
