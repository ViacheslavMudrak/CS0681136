import type { JSX, ReactNode } from 'react';

import { cn } from 'lib/utils';

export interface TimelineContentCardShellProps {
  isReversed: boolean;
  /** When true, applies desktop max-width constraint for grid placement. */
  desktopGrid?: boolean;
  children: ReactNode;
}

/**
 * Orange-border content card shell — shared by mobile stack and desktop grid branches.
 */
export function TimelineContentCardShell({
  isReversed,
  desktopGrid = false,
  children,
}: TimelineContentCardShellProps): JSX.Element {
  return (
    <div
      className={cn(
        'box-border block w-full shrink-0 border-solid border-orange bg-surface px-[14px] py-5 text-left font-media-tile text-[length:18.67px] font-normal leading-[28px] text-ink-muted shadow-quick-link-card z-[1] [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] motion-reduce:shadow-none md:min-w-0',
        isReversed
          ? 'max-md:[box-shadow:4px_0_8px_-2px_rgba(0,0,0,0.07),0_4px_8px_-2px_rgba(0,0,0,0.07),0_-4px_8px_-2px_rgba(0,0,0,0.07)] md:[box-shadow:-4px_0_8px_-2px_rgba(0,0,0,0.07),0_4px_8px_-2px_rgba(0,0,0,0.07),0_-4px_8px_-2px_rgba(0,0,0,0.07)]'
          : '[box-shadow:4px_0_8px_-2px_rgba(0,0,0,0.07),0_4px_8px_-2px_rgba(0,0,0,0.07),0_-4px_8px_-2px_rgba(0,0,0,0.07)]',
        'max-md:z-[1] max-md:mx-0 max-md:mb-0 max-md:mt-[14px] max-md:max-w-full max-md:border-l-4',
        'max-[599px]:w-full max-[599px]:max-w-full',
        'min-[600px]:max-md:w-[518px] min-[600px]:max-md:max-w-[518px]',
        isReversed ? 'md:border-l-0 md:border-r-4' : 'md:border-l-4 md:border-r-0',
        desktopGrid &&
          'md:w-full md:max-lg:max-w-[calc(237px+(100vw-768px)*0.3587)] lg:max-[1199px]:max-w-[calc(269px+(100vw-992px)*0.3865)] min-[1200px]:max-w-[373px] min-[1400px]:max-w-[453px]',
      )}
    >
      {children}
    </div>
  );
}
