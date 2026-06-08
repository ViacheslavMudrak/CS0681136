import type { ComponentPropsWithoutRef, JSX, ReactNode } from 'react';

import { cn } from 'lib/utils';

export interface CalloutSectionShellProps extends ComponentPropsWithoutRef<'section'> {
  flushTopMargin: boolean;
  embeddedPaddingZero: boolean;
  fullBleedOuter: boolean;
  sectionBg?: string;
  styles?: string;
  children: ReactNode;
}

/**
 * Callout group outer `<section>` — shared shell `cn()` for empty and populated branches.
 */
export function CalloutSectionShell({
  flushTopMargin,
  embeddedPaddingZero,
  fullBleedOuter,
  sectionBg = '',
  styles = '',
  children,
  className,
  ...rest
}: CalloutSectionShellProps): JSX.Element {
  return (
    <section
      className={cn(
        'component callout',
        flushTopMargin ? '!mt-0 mb-0 mx-0 w-full min-w-0 max-w-full !px-0' : 'mt-8',
        embeddedPaddingZero && '!px-0',
        fullBleedOuter &&
          'relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)]',
        sectionBg,
        styles,
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

export interface CalloutComponentContentShellProps {
  useEmbeddedInner: boolean;
  children: ReactNode;
}

/**
 * `.component-content` wrapper — shared embedded inner padding `cn()`.
 */
export function CalloutComponentContentShell({
  useEmbeddedInner,
  children,
}: CalloutComponentContentShellProps): JSX.Element {
  return (
    <div
      className={cn(
        'component-content',
        useEmbeddedInner && '!px-0 min-w-0 max-w-full',
      )}
    >
      {children}
    </div>
  );
}

export interface CalloutMediaTileSplitMaxContainerProps {
  children: ReactNode;
}

/**
 * Standalone callout max-width container — shared between empty and multi-stat layouts.
 */
export function CalloutMediaTileSplitMaxContainer({
  children,
}: CalloutMediaTileSplitMaxContainerProps): JSX.Element {
  return (
    <div
      className={
        'relative box-border w-full [unicode-bidi:isolate] px-4 max-sm:mx-0 max-sm:max-w-full sm:max-md:mx-auto sm:max-md:w-full sm:max-md:max-w-[600px] md:max-lg:mx-[72px] md:max-lg:w-[calc(100%-144px)] md:max-lg:max-w-[768px] lg:mx-auto lg:w-full lg:max-w-[var(--width-media-tile-split-max)]'
      }
    >
      {children}
    </div>
  );
}

export interface CalloutGlobalLocationsStatsShellProps {
  visibleCalloutCount: number;
  globalLocationsFlexAlignClass?: string;
  children: ReactNode;
}

/**
 * Global Locations stats column shell — shared by stats list and editing empty hint.
 */
export function CalloutGlobalLocationsStatsShell({
  visibleCalloutCount,
  globalLocationsFlexAlignClass,
  children,
}: CalloutGlobalLocationsStatsShellProps): JSX.Element {
  const flexAlign = globalLocationsFlexAlignClass?.trim() || 'items-center justify-center';

  return (
    <div
      className={cn(
        'box-border mx-auto mt-0 flex w-full min-w-0 max-w-full flex-col items-center justify-center min-[600px]:max-md:max-w-[length:var(--width-global-locations-content-sm)] min-[768px]:max-lg:max-w-[length:var(--width-global-locations-content-md)] min-[992px]:max-xl:max-w-[length:var(--width-global-locations-content-lg)] min-[1200px]:max-w-[length:var(--width-global-locations-content-xl)] w-full min-[768px]:w-max max-w-full',
        visibleCalloutCount > 1 &&
          'min-[768px]:!mt-[length:var(--margin-global-locations-callout-item-top)]',
        flexAlign,
        flexAlign.includes('justify-end') ? 'self-end'
          : flexAlign.includes('justify-start') ? 'self-start'
          : 'self-center',
      )}
    >
      {children}
    </div>
  );
}
