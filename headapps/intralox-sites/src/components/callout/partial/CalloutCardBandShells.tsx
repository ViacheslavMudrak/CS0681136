import type { JSX, ReactNode } from 'react';

import { cn } from 'lib/utils';

import type { CalloutTextAlignment } from '../Callout.type';

export interface CalloutCardBandChromeProps {
  contentSwitcherSingleHorizontalSplitReference: boolean;
  contentSwitcherLayout: boolean;
  singleVisibleCallout: boolean;
  isCardColumnHorizontalSplit: boolean;
  isCardColumnSplitXs: boolean;
  isCardColumnSplitSm: boolean;
  textAsideFullWidthItem: boolean;
  textAsideSingleReferenceRowLabel: boolean;
  textAsideMultiCardEqualBands: boolean;
  textAlignment: CalloutTextAlignment;
  csCompactBelowLg: boolean;
  /** Product modal: responsive label column width via `--width-callout-product-modal-label-sm`. */
  productModalCalloutLayout?: boolean;
  equalRowBand?: boolean;
  children: ReactNode;
}

type CalloutCardBandShellProps = CalloutCardBandChromeProps;

function calloutCardBandShellAttrs(equalRowBand: boolean | undefined): Record<string, boolean> {
  return equalRowBand ? { 'data-callout-equal-row-band': true } : {};
}

/**
 * Card stat band chrome (teal region) — same if/else priority as legacy `resolveCalloutCardStatRegionClass` + band extras.
 */
export function CalloutCardStatBand({
  contentSwitcherSingleHorizontalSplitReference,
  contentSwitcherLayout,
  singleVisibleCallout,
  isCardColumnHorizontalSplit,
  isCardColumnSplitXs,
  isCardColumnSplitSm,
  textAsideFullWidthItem,
  textAsideMultiCardEqualBands,
  textAlignment,
  equalRowBand,
  children,
}: CalloutCardBandShellProps): JSX.Element {
  const equalHsplit = Boolean(textAsideMultiCardEqualBands && isCardColumnHorizontalSplit);
  const shellAttrs = calloutCardBandShellAttrs(equalRowBand);

  if (contentSwitcherSingleHorizontalSplitReference) {
    return (
      <div
        {...shellAttrs}
        className={cn(
          isCardColumnSplitXs
            ? equalHsplit
              ? 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] py-[length:var(--padding-callout-card-column-xs-block)] px-[length:var(--padding-callout-card-column-xs-inline)] min-h-0 rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
              : 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] py-[length:var(--padding-callout-card-column-xs-block)] px-[length:var(--padding-callout-card-column-xs-inline)] min-h-0 h-auto rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
            : isCardColumnSplitSm
              ? equalHsplit
                ? 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-0 rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
                : 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-0 h-auto rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
              : equalHsplit
                ? 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-0 rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
                : 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-0 h-auto rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
          equalHsplit && 'min-h-0 h-full',
        )}
      >
        {children}
      </div>
    );
  }

  if (contentSwitcherLayout) {
    if (singleVisibleCallout && !isCardColumnHorizontalSplit) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            'box-border flex h-auto min-h-0 w-full shrink-0 flex-col items-stretch justify-start bg-[var(--color-accent-cyan)] px-6 pb-2 pt-6 antialiased [unicode-bidi:isolate]',
            !isCardColumnHorizontalSplit &&
              !contentSwitcherLayout &&
              (textAlignment === 'center' ? 'items-center text-center' : 'items-start text-left'),
          )}
        >
          {children}
        </div>
      );
    }
    if (!isCardColumnHorizontalSplit) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            'box-border flex h-auto min-h-0 w-full shrink-0 flex-col items-stretch justify-center bg-[var(--color-accent-cyan)] px-6 pb-2 pt-6 antialiased [unicode-bidi:isolate]',
            !isCardColumnHorizontalSplit &&
              !contentSwitcherLayout &&
              (textAlignment === 'center' ? 'items-center text-center' : 'items-start text-left'),
          )}
        >
          {children}
        </div>
      );
    }
    return (
      <div
        {...shellAttrs}
        className={cn(
          isCardColumnSplitXs
            ? equalHsplit
              ? 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] py-[length:var(--padding-callout-card-column-xs-block)] px-[length:var(--padding-callout-card-column-xs-inline)] min-h-0 rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
              : 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] py-[length:var(--padding-callout-card-column-xs-block)] px-[length:var(--padding-callout-card-column-xs-inline)] min-h-0 h-auto rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
            : isCardColumnSplitSm
              ? equalHsplit
                ? 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-0 rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
                : 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-0 h-auto rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
              : equalHsplit
                ? 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-0 rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
                : 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-0 h-auto rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
          equalHsplit && 'min-h-0 h-full',
        )}
      >
        {children}
      </div>
    );
  }

  if (textAsideFullWidthItem) {
    if (isCardColumnHorizontalSplit) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            equalHsplit
              ? 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] py-2 px-4 min-h-0 rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
              : 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] py-2 px-4 min-h-0 h-auto rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
            equalHsplit && 'min-h-0 h-full',
          )}
        >
          {children}
        </div>
      );
    }
    return (
      <div
        {...shellAttrs}
        className={cn(
          'box-border flex h-auto min-h-0 w-full shrink-0 flex-col justify-center bg-[var(--color-accent-cyan)] py-2 px-4 antialiased [unicode-bidi:isolate]',
          !isCardColumnHorizontalSplit &&
            !contentSwitcherLayout &&
            (textAlignment === 'center' ? 'items-center text-center' : 'items-start text-left'),
        )}
      >
        {children}
      </div>
    );
  }

  if (isCardColumnHorizontalSplit) {
    if (isCardColumnSplitXs) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] py-[length:var(--padding-callout-card-column-xs-block)] px-[length:var(--padding-callout-card-column-xs-inline)] min-h-[length:var(--height-callout-card-column-row-xs)] h-[length:var(--height-callout-card-column-row-xs)] rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
            equalHsplit && 'min-h-0 h-full',
          )}
        >
          {children}
        </div>
      );
    }
    if (isCardColumnSplitSm) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-[length:var(--height-callout-card-column-row-sm)] h-[length:var(--height-callout-card-column-row-sm)] rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
            equalHsplit && 'min-h-0 h-full',
          )}
        >
          {children}
        </div>
      );
    }
    return (
      <div
        {...shellAttrs}
        className={cn(
          equalHsplit
            ? 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-[length:var(--height-callout-card-column-row)] rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
            : 'box-border flex w-max max-w-full min-w-0 shrink-0 flex-col items-center justify-center gap-0 bg-[var(--color-accent-cyan)] p-[length:var(--padding-callout-card-stat-column-base)] min-h-[length:var(--height-callout-card-column-row)] h-auto rounded-tl-[length:var(--radius-callout-card-stat-column-base)] rounded-bl-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
          equalHsplit && 'min-h-0 h-full',
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      {...shellAttrs}
      className={cn(
        'box-border flex h-[var(--height-callout-card-stat)] w-full shrink-0 flex-col justify-start bg-[var(--color-accent-cyan)] px-6 pb-2 pt-6 antialiased [unicode-bidi:isolate]',
        !isCardColumnHorizontalSplit &&
          !contentSwitcherLayout &&
          (textAlignment === 'center' ? 'items-center text-center' : 'items-start text-left'),
      )}
    >
      {children}
    </div>
  );
}

/**
 * Card label band chrome (dark stripe region) — same if/else priority as legacy `resolveCalloutCardLabelRegionClass` + band extras.
 */
export function CalloutCardLabelBand({
  contentSwitcherSingleHorizontalSplitReference,
  contentSwitcherLayout,
  singleVisibleCallout,
  isCardColumnHorizontalSplit,
  isCardColumnSplitXs,
  isCardColumnSplitSm,
  textAsideFullWidthItem,
  textAsideSingleReferenceRowLabel,
  textAsideMultiCardEqualBands,
  csCompactBelowLg,
  equalRowBand,
  productModalCalloutLayout,
  children,
}: CalloutCardBandShellProps): JSX.Element {
  const equalHsplit = Boolean(textAsideMultiCardEqualBands && isCardColumnHorizontalSplit);
  const shellAttrs = calloutCardBandShellAttrs(equalRowBand);

  if (productModalCalloutLayout && isCardColumnHorizontalSplit && isCardColumnSplitSm) {
    return (
      <div
        {...shellAttrs}
        className={cn(
          'box-border flex min-h-0 min-w-0 flex-col items-stretch justify-center overflow-visible h-auto border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe p-[length:var(--padding-callout-card-stat-column-base)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
          'max-md:flex-1 max-md:min-w-0 max-md:w-auto',
          'min-[768px]:max-[991px]:flex-1 min-[768px]:max-[991px]:min-w-[length:var(--width-callout-product-modal-label-sm)] min-[768px]:max-[991px]:w-auto min-[768px]:max-[991px]:max-w-none min-[768px]:max-[991px]:shrink',
          'min-[992px]:w-[length:var(--width-callout-product-modal-label-sm)] min-[992px]:min-w-[length:var(--width-callout-product-modal-label-sm)] min-[992px]:max-w-[length:var(--width-callout-product-modal-label-sm)] min-[992px]:flex-none min-[992px]:shrink-0',
          equalHsplit && 'min-h-0 h-full w-full',
        )}
      >
        {children}
      </div>
    );
  }

  if (contentSwitcherSingleHorizontalSplitReference) {
    return (
      <div
        {...shellAttrs}
        className={cn(
          isCardColumnSplitXs
            ? 'box-border flex h-auto min-h-0 min-w-0 max-w-[length:var(--width-callout-content-switcher-hsplit-label-xs)] flex-1 shrink flex-col items-stretch justify-start overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe py-[length:var(--padding-callout-card-column-xs-block)] px-[length:var(--padding-callout-card-column-xs-inline)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
            : isCardColumnSplitSm
              ? 'box-border flex h-auto min-h-0 min-w-0 max-w-[length:var(--width-callout-content-switcher-hsplit-label-sm)] flex-1 shrink flex-col items-stretch justify-start overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe p-[length:var(--padding-callout-card-stat-column-base)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
              : 'box-border flex h-auto min-h-0 min-w-0 max-w-[length:var(--width-callout-content-switcher-hsplit-label-base)] flex-1 shrink flex-col items-stretch justify-start overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe p-[length:var(--padding-callout-card-stat-column-base)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
          equalHsplit && 'min-h-0 h-full w-full',
        )}
      >
        {children}
      </div>
    );
  }

  if (contentSwitcherLayout) {
    if (singleVisibleCallout && !isCardColumnHorizontalSplit) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            'box-border flex min-h-0 w-full flex-none flex-col justify-start border-t-4 border-ink-inverse bg-chrome-stripe px-6 pb-6 pt-0 antialiased [unicode-bidi:isolate]',
            csCompactBelowLg && 'max-lg:min-w-0 max-lg:max-w-full',
          )}
        >
          {children}
        </div>
      );
    }
    if (!isCardColumnHorizontalSplit) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            'box-border flex min-h-0 w-full flex-1 flex-col justify-center border-t-4 border-ink-inverse bg-chrome-stripe px-6 pb-6 pt-0 antialiased [unicode-bidi:isolate]',
            csCompactBelowLg && 'max-lg:min-w-0 max-lg:max-w-full',
          )}
        >
          {children}
        </div>
      );
    }
    if (isCardColumnSplitXs) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            equalHsplit
              ? 'box-border flex min-h-0 min-w-0 grow-0 shrink w-max max-w-full flex-col items-start justify-center overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe py-[length:var(--padding-callout-card-column-xs-block)] px-[length:var(--padding-callout-card-column-xs-inline)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
              : 'box-border flex min-h-0 min-w-0 grow-0 shrink w-max max-w-full flex-col items-start justify-center overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe py-[length:var(--padding-callout-card-column-xs-block)] px-[length:var(--padding-callout-card-column-xs-inline)] antialiased h-auto rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
            csCompactBelowLg && 'max-lg:min-w-0 max-lg:max-w-full',
            equalHsplit && 'min-h-0 h-full w-full',
          )}
        >
          {children}
        </div>
      );
    }
    if (isCardColumnSplitSm) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            equalHsplit
              ? 'box-border flex min-h-0 min-w-0 grow-0 shrink w-max max-w-full flex-col items-start justify-center overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe p-[length:var(--padding-callout-card-stat-column-base)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
              : 'box-border flex min-h-0 min-w-0 grow-0 shrink w-max max-w-full flex-col items-start justify-center overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe p-[length:var(--padding-callout-card-stat-column-base)] antialiased h-auto rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
            csCompactBelowLg && 'max-lg:min-w-0 max-lg:max-w-full',
            equalHsplit && 'min-h-0 h-full w-full',
          )}
        >
          {children}
        </div>
      );
    }
    return (
      <div
        {...shellAttrs}
        className={cn(
          equalHsplit
            ? 'box-border flex min-h-0 min-w-0 grow-0 shrink w-max max-w-full flex-col items-start justify-center overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe p-[length:var(--padding-callout-card-stat-column-base)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
            : 'box-border flex min-h-0 min-w-0 grow-0 shrink w-max max-w-full flex-col items-start justify-center overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe p-[length:var(--padding-callout-card-stat-column-base)] antialiased h-auto rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
          csCompactBelowLg && 'max-lg:min-w-0 max-lg:max-w-full',
          equalHsplit && 'min-h-0 h-full w-full',
        )}
      >
        {children}
      </div>
    );
  }

  if (textAsideFullWidthItem) {
    if (isCardColumnHorizontalSplit) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            equalHsplit
              ? 'box-border flex min-h-0 min-w-0 flex-col items-start justify-center overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe py-2 px-4 rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]'
              : 'box-border flex min-h-0 min-w-0 flex-1 shrink flex-col items-start justify-center overflow-y-auto overflow-x-hidden border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe py-2 px-4 h-auto rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] antialiased [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
            equalHsplit && 'min-h-0 h-full w-full',
            csCompactBelowLg && 'max-lg:min-w-0 max-lg:max-w-full',
          )}
        >
          {children}
        </div>
      );
    }
    if (textAsideSingleReferenceRowLabel) {
      return (
        <div
          {...shellAttrs}
          className="box-border flex min-h-[var(--min-height-callout-card-label-band)] w-full flex-1 flex-col justify-center border-t-4 border-ink-inverse bg-chrome-stripe px-6 pb-6 pt-4 antialiased [unicode-bidi:isolate]"
        >
          {children}
        </div>
      );
    }
    return (
      <div
        {...shellAttrs}
        className="box-border flex min-h-0 w-full flex-1 flex-col justify-center border-t-4 border-ink-inverse bg-chrome-stripe py-2 px-4 antialiased [unicode-bidi:isolate]"
      >
        {children}
      </div>
    );
  }

  if (isCardColumnHorizontalSplit) {
    if (isCardColumnSplitXs) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            'box-border flex h-[length:var(--height-callout-card-column-row-xs)] w-[length:var(--width-callout-card-column-label-xs)] flex-none shrink-0 flex-col items-stretch justify-center overflow-y-auto border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe py-[length:var(--padding-callout-card-column-xs-block)] px-[length:var(--padding-callout-card-column-xs-inline)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
            equalHsplit && 'min-h-0 h-full w-full',
          )}
        >
          {children}
        </div>
      );
    }
    if (isCardColumnSplitSm) {
      return (
        <div
          {...shellAttrs}
          className={cn(
            'box-border flex h-[length:var(--height-callout-card-column-row-sm)] w-[length:var(--width-callout-card-column-label-sm)] flex-none shrink-0 flex-col items-stretch justify-center overflow-y-auto border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe p-[length:var(--padding-callout-card-stat-column-base)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
            equalHsplit && 'min-h-0 h-full w-full',
          )}
        >
          {children}
        </div>
      );
    }
    return (
      <div
        {...shellAttrs}
        className={cn(
          'box-border flex h-[length:var(--height-callout-card-column-row)] w-[length:var(--width-callout-card-column-label)] flex-none shrink-0 flex-col items-stretch justify-center overflow-y-auto border-t-0 border-r-0 border-b-0 border-l-4 border-solid border-ink-inverse bg-chrome-stripe p-[length:var(--padding-callout-card-stat-column-base)] antialiased rounded-tr-[length:var(--radius-callout-card-stat-column-base)] rounded-br-[length:var(--radius-callout-card-stat-column-base)] [unicode-bidi:isolate] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [-webkit-tap-highlight-color:transparent]',
          equalHsplit && 'min-h-0 h-full w-full',
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      {...shellAttrs}
      className="box-border flex min-h-[var(--min-height-callout-card-label-band)] w-full flex-1 flex-col justify-center border-t-4 border-ink-inverse bg-chrome-stripe px-6 pb-6 pt-4 antialiased [unicode-bidi:isolate]"
    >
      {children}
    </div>
  );
}
