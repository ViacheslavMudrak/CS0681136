import type { JSX, ReactNode } from 'react';

import { cn } from 'lib/utils';

export interface CalloutGroupListItemProps {
  index: number;
  contentSwitcherLayout: boolean;
  textAsideMultiStack: boolean;
  textAsideAsideLayout: boolean;
  isSingleStandalone: boolean;
  layoutIsRow: boolean;
  textAsideSingleFullWidthRow: boolean;
  isCardStyle: boolean;
  isEmbeddedRow: boolean;
  visibleCalloutCount: number;
  contentSwitcherEqualHeightRow: boolean;
  isTabletSecondColumn: boolean;
  itemPadCompact: boolean;
  embeddedLayoutRowNonCard: boolean;
  textAsideAsideMargin: boolean;
  children: ReactNode;
}

/**
 * Group list cell wrapper (`role="listitem"`) — layout Tailwind inlined per IT-INLINE.
 */
export function CalloutGroupListItem(props: CalloutGroupListItemProps): JSX.Element {
  const {
    index,
    contentSwitcherLayout,
    textAsideMultiStack,
    textAsideAsideLayout,
    isSingleStandalone,
    layoutIsRow,
    textAsideSingleFullWidthRow,
    isCardStyle,
    isEmbeddedRow,
    visibleCalloutCount,
    contentSwitcherEqualHeightRow,
    isTabletSecondColumn,
    itemPadCompact,
    embeddedLayoutRowNonCard,
    textAsideAsideMargin,
    children,
  } = props;

  if (isSingleStandalone) {
    return (
      <div role="listitem" className="flex min-w-0 w-full flex-col px-0 py-0 max-md:border-0 max-md:pt-0 max-md:pb-0">
        {children}
      </div>
    );
  }

  if (textAsideMultiStack) {
    return (
      <div role="listitem" className="flex min-w-0 w-full max-w-full flex-col px-0 py-0 m-0 mb-4">
        {children}
      </div>
    );
  }

  if (contentSwitcherLayout) {
    return (
      <div
        role="listitem"
        className={cn(
          'box-border flex min-w-0 max-w-full flex-col items-stretch border-0 pl-4 pr-0 py-0 m-0 text-base font-normal leading-6 text-ink-primary font-media-tile [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
          index === 0 ? 'mt-0' : 'max-lg:mt-[16px] lg:mt-0',
          visibleCalloutCount === 1 && '!pl-0',
          visibleCalloutCount > 1 && isCardStyle && 'max-lg:pl-0',
          visibleCalloutCount > 1 && 'lg:pl-0',
          contentSwitcherEqualHeightRow && 'lg:min-h-0 lg:flex-1',
        )}
      >
        {children}
      </div>
    );
  }

  if (textAsideAsideLayout && layoutIsRow) {
    return (
      <div
        role="listitem"
        className={cn(
          isCardStyle
            ? cn(
                'flex min-w-0 w-full max-w-full flex-col px-0 max-md:pt-0 max-md:pb-0 py-0 md:px-0 md:py-0 lg:py-0',
                textAsideSingleFullWidthRow ? 'md:w-full md:max-w-full' : 'max-md:flex-none md:flex-1',
                isEmbeddedRow &&
                  !textAsideSingleFullWidthRow &&
                  'lg:max-xl:box-border lg:max-xl:min-h-[var(--min-height-callout-stat-embedded-narrow)] lg:max-xl:h-auto lg:max-xl:max-h-none lg:max-xl:w-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:min-w-0 lg:max-xl:max-w-none lg:max-xl:basis-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:grow lg:max-xl:shrink lg:max-xl:justify-start lg:max-xl:items-start lg:max-xl:px-0 xl:box-border xl:min-h-0 xl:max-h-[var(--height-callout-stat-desktop-cell)] xl:h-[var(--height-callout-stat-desktop-cell)] xl:min-w-0 xl:max-w-[var(--width-callout-stat-desktop-cell)] xl:w-[var(--width-callout-stat-desktop-cell)] xl:basis-[var(--width-callout-stat-desktop-cell)] xl:grow xl:shrink xl:justify-start xl:items-start xl:px-0',
                index > 0 &&
                  (isCardStyle
                    ? 'max-md:mt-0 max-md:border-t-0 max-md:py-0 max-md:pt-8 max-md:pb-8'
                    : 'max-md:mt-0 max-md:border-t max-md:border-stroke-default max-md:py-0 max-md:pt-8 max-md:pb-8'),
                itemPadCompact
                  ? 'sm:pl-0 sm:pr-0 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0'
                  : 'sm:pl-12 sm:pr-0 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0',
                textAsideAsideLayout ? 'md:mt-0 lg:mt-0' : layoutIsRow && Math.floor(index / 2) > 0 ? 'md:mt-0 lg:mt-8' : 'md:mt-8 lg:mt-8',
                isEmbeddedRow &&
                  isTabletSecondColumn &&
                  (isCardStyle
                    ? 'md:max-lg:border-l-0 md:max-lg:pl-[var(--padding-callout-tablet-after-vertical)] md:max-lg:pr-0'
                    : 'md:max-lg:border-l md:max-lg:border-stroke-default md:max-lg:pl-[var(--padding-callout-tablet-after-vertical)]'),
                isEmbeddedRow && !isTabletSecondColumn && 'md:pr-0',
                !isEmbeddedRow &&
                  isTabletSecondColumn &&
                  (isCardStyle
                    ? 'md:border-l-0 md:pl-[var(--padding-callout-tablet-after-vertical)] md:pr-0'
                    : 'md:border-l md:border-stroke-default md:pl-[var(--padding-callout-tablet-after-vertical)]'),
                !isEmbeddedRow && !isTabletSecondColumn && 'md:pr-0',
                isEmbeddedRow &&
                  index !== 0 &&
                  (isCardStyle
                    ? 'lg:max-xl:border-l-0 lg:max-xl:pl-[var(--padding-callout-embedded-narrow-after-vertical)] xl:border-l-0 xl:pl-[var(--padding-callout-desktop-after-vertical)]'
                    : 'lg:max-xl:border-l lg:max-xl:border-stroke-default lg:max-xl:pl-[var(--padding-callout-embedded-narrow-after-vertical)] xl:border-l xl:border-stroke-default xl:pl-[var(--padding-callout-desktop-after-vertical)]'),
                isEmbeddedRow && index === 0 && 'lg:border-l-0 lg:pl-0',
                !isEmbeddedRow && index === 0 && 'lg:border-l-0 lg:pl-0',
                !isEmbeddedRow &&
                  index !== 0 &&
                  (isCardStyle
                    ? 'lg:border-l-0 lg:pl-[var(--padding-callout-desktop-after-vertical)]'
                    : 'lg:border-l lg:border-stroke-default lg:pl-[var(--padding-callout-desktop-after-vertical)]'),
              )
            : cn(
                'flex min-w-0 w-full max-w-full flex-col px-0 max-md:pt-0 max-md:pb-0 py-0 md:px-0 md:py-0 lg:py-0',
                textAsideSingleFullWidthRow ? 'md:w-full md:max-w-full' : 'max-md:flex-none md:flex-1',
                textAsideSingleFullWidthRow
                  ? 'md:box-border md:min-w-0 md:shrink-0'
                  : embeddedLayoutRowNonCard
                    ? cn(
                        'sm:box-border sm:w-full sm:min-w-0 sm:max-w-full sm:h-[var(--min-height-callout-stat-cell)] sm:min-h-[var(--min-height-callout-stat-cell)] sm:max-h-none sm:shrink-0',
                        'lg:max-xl:box-border lg:max-xl:min-h-[var(--min-height-callout-stat-embedded-narrow)] lg:max-xl:h-auto lg:max-xl:max-h-none lg:max-xl:w-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:min-w-0 lg:max-xl:max-w-none lg:max-xl:basis-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:grow lg:max-xl:shrink lg:max-xl:justify-start lg:max-xl:items-start lg:max-xl:px-0 xl:box-border xl:min-h-0 xl:max-h-[var(--height-callout-stat-desktop-cell)] xl:h-[var(--height-callout-stat-desktop-cell)] xl:min-w-0 xl:max-w-[var(--width-callout-stat-desktop-cell)] xl:w-[var(--width-callout-stat-desktop-cell)] xl:basis-[var(--width-callout-stat-desktop-cell)] xl:grow xl:shrink xl:justify-start xl:items-start xl:px-0',
                      )
                    : 'md:box-border md:w-full md:min-w-0 md:max-w-[var(--width-callout-stat-cell)] md:h-[var(--min-height-callout-stat-cell)] md:min-h-[var(--min-height-callout-stat-cell)] md:max-h-[var(--min-height-callout-stat-cell)] md:shrink-0 lg:box-border lg:flex lg:min-h-0 lg:max-h-[var(--height-callout-stat-desktop-cell)] lg:w-[var(--width-callout-stat-desktop-cell)] lg:min-w-[var(--width-callout-stat-desktop-cell)] lg:max-w-[var(--width-callout-stat-desktop-cell)] lg:h-[var(--height-callout-stat-desktop-cell)] lg:shrink-0 lg:justify-start lg:items-start lg:px-0',
                index > 0 &&
                  'max-md:mt-0 max-md:border-t max-md:border-stroke-default max-md:py-0 max-md:pt-8 max-md:pb-8',
                itemPadCompact
                  ? 'sm:pl-0 sm:pr-0 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0'
                  : 'sm:pl-12 sm:pr-0 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0',
                'md:mt-0 lg:mt-0',
                isEmbeddedRow &&
                  isTabletSecondColumn &&
                  'md:max-lg:border-l md:max-lg:border-stroke-default md:max-lg:pl-[var(--padding-callout-tablet-after-vertical)]',
                isEmbeddedRow && !isTabletSecondColumn && 'md:pr-0',
                !isEmbeddedRow &&
                  isTabletSecondColumn &&
                  'md:border-l md:border-stroke-default md:pl-[var(--padding-callout-tablet-after-vertical)]',
                !isEmbeddedRow && !isTabletSecondColumn && 'md:pr-0',
                isEmbeddedRow &&
                  index !== 0 &&
                  'lg:max-xl:border-l lg:max-xl:border-stroke-default lg:max-xl:pl-[var(--padding-callout-embedded-narrow-after-vertical)] xl:border-l xl:border-stroke-default xl:pl-[var(--padding-callout-desktop-after-vertical)]',
                isEmbeddedRow && index === 0 && 'lg:border-l-0 lg:pl-0',
                !isEmbeddedRow && index === 0 && 'lg:border-l-0 lg:pl-0',
                !isEmbeddedRow &&
                  index !== 0 &&
                  'lg:border-l lg:border-stroke-default lg:pl-[var(--padding-callout-desktop-after-vertical)]',
              ),
          textAsideAsideMargin && 'm-0 mb-4',
        )}
      >
        {children}
      </div>
    );
  }

  if (textAsideAsideLayout && !layoutIsRow) {
    return (
      <div
        role="listitem"
        className={cn(
          'flex min-w-0 w-full max-w-full flex-col px-0 py-0',
          index > 0 &&
            (isCardStyle
              ? 'mt-0 border-t-0 py-0 pt-8 pb-8'
              : 'mt-0 border-t border-stroke-default py-0 pt-8 pb-8'),
          textAsideAsideMargin && 'm-0 mb-4',
        )}
      >
        {children}
      </div>
    );
  }

  if (layoutIsRow) {
    return (
      <div
        role="listitem"
        className={cn(
          isCardStyle
            ? cn(
                'flex min-w-0 max-md:flex-none md:flex-1 flex-col px-2 max-md:pt-0 max-md:pb-8 py-2 md:px-0 md:py-0 lg:py-0',
                isEmbeddedRow &&
                  'lg:max-xl:box-border lg:max-xl:min-h-[var(--min-height-callout-stat-embedded-narrow)] lg:max-xl:h-auto lg:max-xl:max-h-none lg:max-xl:w-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:min-w-0 lg:max-xl:max-w-none lg:max-xl:basis-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:grow lg:max-xl:shrink lg:max-xl:justify-start lg:max-xl:items-start lg:max-xl:px-0 xl:box-border xl:min-h-0 xl:max-h-[var(--height-callout-stat-desktop-cell)] xl:h-[var(--height-callout-stat-desktop-cell)] xl:min-w-0 xl:max-w-[var(--width-callout-stat-desktop-cell)] xl:w-[var(--width-callout-stat-desktop-cell)] xl:basis-[var(--width-callout-stat-desktop-cell)] xl:grow xl:shrink xl:justify-start xl:items-start xl:px-0',
                index > 0 && 'max-md:mt-0 max-md:border-t-0 max-md:py-0 max-md:pt-8 max-md:pb-8',
                itemPadCompact
                  ? 'sm:pl-0 sm:pr-0 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0'
                  : 'sm:pl-12 sm:pr-0 md:pl-0 md:pr-0 lg:pl-0 lg:pr-0',
                layoutIsRow && Math.floor(index / 2) > 0 ? 'md:mt-0 lg:mt-8' : 'md:mt-8 lg:mt-8',
                isEmbeddedRow &&
                  isTabletSecondColumn &&
                  'md:max-lg:border-l-0 md:max-lg:pl-[var(--padding-callout-tablet-after-vertical)] md:max-lg:pr-0',
                isEmbeddedRow && !isTabletSecondColumn && 'md:pr-0',
                !isEmbeddedRow &&
                  isTabletSecondColumn &&
                  'md:border-l-0 md:pl-[var(--padding-callout-tablet-after-vertical)] md:pr-0',
                !isEmbeddedRow && !isTabletSecondColumn && 'md:pr-0',
                isEmbeddedRow &&
                  index !== 0 &&
                  'lg:max-xl:border-l-0 lg:max-xl:pl-[var(--padding-callout-embedded-narrow-after-vertical)] xl:border-l-0 xl:pl-[var(--padding-callout-desktop-after-vertical)]',
                isEmbeddedRow && index === 0 && 'lg:border-l-0 lg:pl-0',
                !isEmbeddedRow && index === 0 && 'lg:border-l-0 lg:pl-0',
                !isEmbeddedRow &&
                  index !== 0 &&
                  'lg:border-l-0 lg:pl-[var(--padding-callout-desktop-after-vertical)]',
              )
            : cn(
                'flex min-w-0 max-sm:w-[var(--width-callout-stat-media-tile-fluid)] max-sm:max-w-[var(--width-callout-stat-media-tile-fluid)] max-sm:flex-none sm:flex-1 flex-col px-0 max-sm:pt-0 max-sm:pb-8 py-0 sm:py-0 lg:py-0',
                index > 0 &&
                  'max-sm:mt-0 max-sm:border-t max-sm:border-stroke-default max-sm:py-0 max-sm:pt-8 max-sm:pb-8',
                embeddedLayoutRowNonCard
                  ? cn(
                      'sm:box-border sm:w-full sm:min-w-0 sm:max-w-full sm:h-[var(--min-height-callout-stat-cell)] sm:min-h-[var(--min-height-callout-stat-cell)] sm:max-h-none sm:shrink-0',
                      'lg:max-xl:box-border lg:max-xl:min-h-[var(--min-height-callout-stat-embedded-narrow)] lg:max-xl:h-auto lg:max-xl:max-h-none lg:max-xl:w-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:min-w-0 lg:max-xl:max-w-none lg:max-xl:basis-[var(--width-callout-stat-embedded-narrow)] lg:max-xl:grow lg:max-xl:shrink lg:max-xl:justify-start lg:max-xl:items-start lg:max-xl:px-0 xl:box-border xl:min-h-0 xl:max-h-[var(--height-callout-stat-desktop-cell)] xl:h-[var(--height-callout-stat-desktop-cell)] xl:min-w-0 xl:max-w-[var(--width-callout-stat-desktop-cell)] xl:w-[var(--width-callout-stat-desktop-cell)] xl:basis-[var(--width-callout-stat-desktop-cell)] xl:grow xl:shrink xl:justify-start xl:items-start xl:px-0',
                    )
                  : 'md:box-border md:w-full md:min-w-0 md:max-w-[var(--width-callout-stat-cell)] md:h-[var(--min-height-callout-stat-cell)] md:min-h-[var(--min-height-callout-stat-cell)] md:max-h-[var(--min-height-callout-stat-cell)] md:shrink-0 lg:box-border lg:flex lg:min-h-0 lg:max-h-[var(--height-callout-stat-desktop-cell)] lg:w-[var(--width-callout-stat-desktop-cell)] lg:min-w-[var(--width-callout-stat-desktop-cell)] lg:max-w-[var(--width-callout-stat-desktop-cell)] lg:h-[var(--height-callout-stat-desktop-cell)] lg:shrink-0 lg:justify-start lg:items-start lg:px-0',
                itemPadCompact
                  ? 'sm:pl-0 sm:pr-0 lg:pl-0 lg:pr-0'
                  : 'sm:pl-12 sm:pr-0 lg:pl-0 lg:pr-0',
                layoutIsRow && Math.floor(index / 2) > 0 ? 'sm:mt-0 lg:mt-8' : 'sm:mt-8 lg:mt-8',
                isEmbeddedRow &&
                  isTabletSecondColumn &&
                  'sm:max-lg:border-l sm:max-lg:border-stroke-default sm:max-lg:pl-[var(--padding-callout-tablet-after-vertical)]',
                isEmbeddedRow && !isTabletSecondColumn && 'sm:pr-0',
                !isEmbeddedRow &&
                  isTabletSecondColumn &&
                  'md:border-l md:border-stroke-default md:pl-[var(--padding-callout-tablet-after-vertical)]',
                !isEmbeddedRow && !isTabletSecondColumn && 'md:pr-0',
                isEmbeddedRow &&
                  index !== 0 &&
                  'lg:max-xl:border-l lg:max-xl:border-stroke-default lg:max-xl:pl-[var(--padding-callout-embedded-narrow-after-vertical)] xl:border-l xl:border-stroke-default xl:pl-[var(--padding-callout-desktop-after-vertical)]',
                isEmbeddedRow && index === 0 && 'lg:border-l-0 lg:pl-0',
                !isEmbeddedRow && index === 0 && 'lg:border-l-0 lg:pl-0',
                !isEmbeddedRow &&
                  index !== 0 &&
                  'lg:border-l lg:border-stroke-default lg:pl-[var(--padding-callout-desktop-after-vertical)]',
              ),
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      role="listitem"
      className={cn(
        'flex min-w-0 max-md:flex-none flex-col px-2',
        index > 0
          ? isCardStyle
            ? 'mt-0 border-t-0 py-0 pt-8 pb-8'
            : 'mt-0 border-t border-stroke-default py-0 pt-8 pb-8'
          : 'max-md:pt-0 max-md:pb-8 py-2',
      )}
    >
      {children}
    </div>
  );
}
