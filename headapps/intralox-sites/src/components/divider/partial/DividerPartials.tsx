import { JSX } from 'react';
import { cn } from 'lib/utils';

interface DividerLineProps {
  positionClass: string;
  spacingClass: string;
  /** `null` = full width (100%); otherwise rule width as a percentage of the content strip (10–90). */
  widthPercent: number | null;
}

/** Visible 1px horizontal rule; left/right positions wrap in a flex aligner. */
export const DividerLine = ({
  positionClass,
  spacingClass,
  widthPercent,
}: DividerLineProps): JSX.Element => {
  const isFullWidth = widthPercent == null;
  const widthStyle = isFullWidth ? undefined : { width: `${widthPercent}%` };
  const rule = (
    <hr
      aria-hidden="true"
      className={cn(
        'box-border block h-px min-h-0 min-w-0 shrink-0 overflow-x-hidden overflow-y-hidden border-0 border-t border-solid border-stroke-default font-divider text-ink-primary leading-6 [unicode-bidi:isolate]',
        isFullWidth ? 'w-full' : 'max-w-full',
        !isFullWidth && positionClass === 'justify-center' ? 'mx-auto' : '',
        spacingClass,
      )}
      style={widthStyle}
    />
  );

  return positionClass === 'justify-center' ? (
    rule
  ) : (
    <div
      className={cn(
        'flex min-w-0 w-full text-ink-primary font-divider',
        positionClass,
      )}
    >
      {rule}
    </div>
  );
};

interface DividerSpacingProps {
  spacingClass: string;
}

/** Spacing-only variant — vertical gap without a visible rule. */
export const DividerSpacing = ({ spacingClass }: DividerSpacingProps): JSX.Element => {
  return (
    <div className={cn('min-w-0 w-full', spacingClass)} aria-hidden="true" />
  );
};
