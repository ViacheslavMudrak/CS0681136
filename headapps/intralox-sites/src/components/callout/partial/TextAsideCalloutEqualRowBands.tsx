'use client';

import { useCallback, useLayoutEffect, useRef, type JSX, type ReactNode } from 'react';

import {
  CalloutCardColumnOuterShell,
  type CalloutCardColumnOuterShellProps,
} from './CalloutStatAtoms';
import {
  CalloutCardLabelBand,
  CalloutCardStatBand,
  type CalloutCardBandChromeProps,
} from './CalloutCardBandShells';

type TextAsideCalloutEqualRowBandsProps = Omit<CalloutCardColumnOuterShellProps, 'children'> &
  Omit<CalloutCardBandChromeProps, 'children' | 'equalRowBand'> & {
    statInner: ReactNode;
    labelInner: ReactNode;
  };

/**
 * Stacked card row (teal stat above dark label) for Text-and-Aside with **2+** callouts: keeps both bands the same height
 * as the taller band when prepend/append grows the stat or the label wraps to multiple lines.
 */
export function TextAsideCalloutEqualRowBands({
  statInner,
  labelInner,
  ...shellAndBandProps
}: TextAsideCalloutEqualRowBandsProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);

  const syncHeights = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const bands = root.querySelectorAll<HTMLElement>('[data-callout-equal-row-band]');
    if (bands.length < 2) return;
    bands.forEach((b) => {
      b.style.minHeight = '';
    });
    void root.offsetHeight;
    const heights = Array.from(bands).map((b) => b.getBoundingClientRect().height);
    const maxH = Math.max(0, ...heights);
    if (maxH <= 0) return;
    bands.forEach((b) => {
      b.style.minHeight = `${maxH}px`;
    });
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    syncHeights();
    const ro = new ResizeObserver(() => {
      syncHeights();
    });
    ro.observe(root);
    return () => {
      ro.disconnect();
    };
  }, [syncHeights]);

  return (
    <CalloutCardColumnOuterShell ref={rootRef} {...shellAndBandProps}>
      <CalloutCardStatBand {...shellAndBandProps} equalRowBand>
        {statInner}
      </CalloutCardStatBand>
      <CalloutCardLabelBand {...shellAndBandProps} equalRowBand>
        {labelInner}
      </CalloutCardLabelBand>
    </CalloutCardColumnOuterShell>
  );
}
