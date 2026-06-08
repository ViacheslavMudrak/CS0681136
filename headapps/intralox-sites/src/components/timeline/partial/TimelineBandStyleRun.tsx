import type { JSX, ReactNode } from 'react';

import { NextImage } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

import type { TimelineGroup } from '../Timeline.type';

export interface TimelineBandStyleRunProps {
  /** Sitecore group whose background fields paint this run (shared across consecutive decade bands). */
  group: TimelineGroup;
  /** Decade sections inside the run (each renders its own `<section>` without a duplicate backdrop). */
  children: ReactNode;
}

/** Shared viewport-bleed backdrop for consecutive decades from the same Sitecore group. */
export function TimelineBandStyleRun({ group, children }: TimelineBandStyleRunProps): JSX.Element {
  const { BackgroundColor, BackgroundImage } = group.fields ?? {};
  const bgBandValue = BackgroundColor?.fields?.Value?.value?.toLowerCase().trim();
  const bgBandIsGrey = bgBandValue === 'grey' || bgBandValue === 'gray';
  const hasBgImage = Boolean(BackgroundImage?.value?.src);
  const isGrayBand = !hasBgImage && bgBandIsGrey;

  return (
    <div
      className={cn(
        /* Event cards use `box-shadow`; outer shell stays `overflow-visible` so shadows paint. */
        'relative overflow-visible w-full min-w-0 max-md:w-screen max-md:max-w-[100vw] max-md:shrink-0 max-md:ml-[calc(50%-50vw)] max-md:mr-[calc(50%-50vw)]',
        hasBgImage
          ? bgBandIsGrey
            ? 'bg-surface-muted'
            : 'bg-surface'
          : isGrayBand
            ? 'bg-surface'
            : bgBandIsGrey
              ? 'bg-surface-muted'
              : 'bg-surface',
      )}
    >
      {(isGrayBand || (hasBgImage && BackgroundImage)) && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          {isGrayBand && (
            <div className="pointer-events-none absolute inset-0 bg-surface-muted [clip-path:polygon(0_15%,100%_0,100%_92%,0_100%)]" />
          )}
          {hasBgImage && BackgroundImage && (
            <div className="pointer-events-none absolute inset-0">
              <NextImage
                field={BackgroundImage}
                fill
                className="object-cover object-center align-middle [overflow-clip-margin:content-box]"
                sizes="100vw"
                alt=""
              />
            </div>
          )}
        </div>
      )}
      {/* Stack above the z-0 backdrop: positioned z-0 layers paint above in-flow siblings without z-index. */}
      <div className="relative z-[1] w-full min-w-0">{children}</div>
    </div>
  );
}
