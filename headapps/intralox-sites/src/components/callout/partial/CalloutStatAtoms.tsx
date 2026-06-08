import { forwardRef, type JSX, type ReactNode } from 'react';

import { Text, type TextField } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

import {
  isCalloutCardColumnSplitSm,
  isCalloutCardColumnSplitXs,
} from '../calloutUtils';
import type { CalloutConfig } from '../Callout.type';

export interface CalloutCardColumnAffixTextProps {
  field: TextField | undefined;
  includeMinHeight: boolean;
}

/**
 * Horizontal-split card affix (prepend/append) — single affix typography `cn()`.
 */
export function CalloutCardColumnAffixText({
  field,
  includeMinHeight,
}: CalloutCardColumnAffixTextProps): JSX.Element {
  const emptyText: TextField = { value: '' };
  return (
    <Text
      field={field ?? emptyText}
      tag="span"
      className={cn(
        'box-border block w-full m-0 p-0 text-right font-bold uppercase text-ink-inverse [-webkit-tap-highlight-color:transparent] text-[length:var(--text-callout-card-column-base-affix)] leading-[length:var(--leading-callout-card-column-base-affix)] tracking-[length:var(--tracking-callout-card-column-base-affix)] [unicode-bidi:isolate]',
        includeMinHeight && 'min-h-[length:var(--leading-callout-card-column-base-affix)]',
      )}
    />
  );
}

export interface CalloutCardColumnValueSpanProps {
  field: TextField | undefined;
  config: CalloutConfig;
}

/**
 * Horizontal-split card value — size variant router for column xs / sm / base.
 */
export function CalloutCardColumnValueSpan({
  field,
  config,
}: CalloutCardColumnValueSpanProps): JSX.Element {
  const emptyText: TextField = { value: '' };

  return (
    <div className="box-border flex w-full max-w-full min-h-0 m-0 p-0 items-center justify-end text-right [unicode-bidi:isolate]">
      <span
        className={cn(
          'inline-block max-w-full font-bold text-ink-inverse [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]',
          isCalloutCardColumnSplitXs(config) &&
            'text-[length:var(--text-callout-card-column-xs-value)] leading-[length:var(--leading-callout-card-column-xs-value)]',
          isCalloutCardColumnSplitSm(config) &&
            'text-[length:var(--text-callout-card-column-sm-value)] leading-[length:var(--leading-callout-card-column-sm-value)]',
          !isCalloutCardColumnSplitXs(config) &&
            !isCalloutCardColumnSplitSm(config) &&
            'text-[length:var(--text-callout-card-column-base-value)] leading-[length:var(--leading-callout-card-column-base-value)]',
        )}
      >
        <Text field={field ?? emptyText} tag="span" className="inline-block max-w-full" />
      </span>
    </div>
  );
}

export interface CalloutCardColumnLabelTextProps {
  field: TextField | undefined;
  config: CalloutConfig;
  isCardColumnSplitXs: boolean;
  isCardColumnSplitSm: boolean;
  /** Product modal: allow label text to wrap within the responsive label band. */
  productModalCalloutLayout?: boolean;
}

/**
 * Horizontal-split card label — xs/sm vs base typography variants.
 */
export function CalloutCardColumnLabelText({
  field,
  config: _config,
  isCardColumnSplitXs,
  isCardColumnSplitSm,
  productModalCalloutLayout = false,
}: CalloutCardColumnLabelTextProps): JSX.Element {
  const emptyText: TextField = { value: '' };
  const isSmSplit = isCardColumnSplitXs || isCardColumnSplitSm;
  return (
    <Text
      field={field ?? emptyText}
      tag="span"
      className={cn(
        isSmSplit &&
          (productModalCalloutLayout
            ? 'box-border block w-full min-w-0 m-0 p-0 border-0 break-words font-bold uppercase whitespace-normal text-ink-inverse text-[length:var(--text-callout-label-xs)] leading-[length:var(--leading-callout-label-xs)] tracking-[length:var(--tracking-callout-card-column-sm-label)] font-callout [-webkit-tap-highlight-color:transparent] antialiased [unicode-bidi:isolate]'
            : 'box-border inline-block min-w-0 max-w-full m-0 p-0 border-0 break-words font-bold uppercase text-ink-inverse text-[length:var(--text-callout-label-xs)] leading-[length:var(--leading-callout-label-xs)] tracking-[length:var(--tracking-callout-card-column-sm-label)] font-callout [-webkit-tap-highlight-color:transparent] antialiased [unicode-bidi:isolate]'),
        !isSmSplit &&
          'inline-block min-w-0 max-w-full break-words text-left font-bold uppercase text-ink-inverse text-font-medium leading-[length:var(--leading-callout-card-column-base-label)] tracking-[length:var(--tracking-callout-card-column-base-label)] antialiased [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]',
        'max-md:min-h-0',
      )}
    />
  );
}

export interface CalloutCardColumnOuterShellProps {
  isCsHsplitOuterLayout: boolean;
  isCardColumnHorizontalSplit: boolean;
  textAsideMultiCardEqualBands: boolean;
  stretchCsRow: boolean;
  csCompactBelowLg: boolean;
  /** Product modal: full-width horizontal-split row + wrapping label band. */
  productModalCalloutLayout?: boolean;
  equalRowBand?: boolean;
  children: ReactNode;
}

/**
 * Card chrome outer flex/grid shell — shared by default band layout and equal-row bands.
 */
export const CalloutCardColumnOuterShell = forwardRef<HTMLDivElement, CalloutCardColumnOuterShellProps>(
  function CalloutCardColumnOuterShell(
    {
      isCsHsplitOuterLayout,
      isCardColumnHorizontalSplit,
      textAsideMultiCardEqualBands,
      stretchCsRow,
      csCompactBelowLg,
      productModalCalloutLayout,
      children,
    },
    ref,
  ): JSX.Element {
    return (
      <div
        ref={ref}
        className={cn(
          isCsHsplitOuterLayout &&
            cn(
              'flex min-w-0 max-w-full flex-row items-stretch overflow-hidden rounded-[length:var(--radius-callout-card-stat-column-base)]',
              productModalCalloutLayout ? 'w-full' : 'w-max',
            ),
          !isCsHsplitOuterLayout &&
            !isCardColumnHorizontalSplit &&
            'flex w-full max-w-full min-w-0 flex-col overflow-hidden',
          !isCsHsplitOuterLayout &&
            isCardColumnHorizontalSplit &&
            textAsideMultiCardEqualBands &&
            'grid w-max max-w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-stretch overflow-hidden',
          !isCsHsplitOuterLayout &&
            isCardColumnHorizontalSplit &&
            !textAsideMultiCardEqualBands &&
            'flex w-max max-w-full min-w-0 flex-row items-center overflow-hidden',
          stretchCsRow && 'min-h-0 max-lg:flex-1 lg:h-grow',
          csCompactBelowLg &&
            isCardColumnHorizontalSplit &&
            (productModalCalloutLayout
              ? 'max-lg:!w-full max-lg:max-w-full lg:!w-full lg:max-w-full'
              : 'max-lg:!w-max max-lg:max-w-full lg:w-max lg:max-w-full'),
          csCompactBelowLg && !isCardColumnHorizontalSplit && 'max-lg:items-start',
        )}
      >
        {children}
      </div>
    );
  },
);
