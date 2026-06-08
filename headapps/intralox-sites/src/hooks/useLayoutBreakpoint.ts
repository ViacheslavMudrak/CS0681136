'use client';

import { useEffect, useState } from 'react';
import {
  getLayoutBreakpoint,
  type LayoutBreakpoint,
  LAYOUT_MEDIA,
} from 'lib/breakpoints';

/**
 * Current layout tier: mobile (&lt;600), tablet (600–991), desktop (≥992).
 * Initial render uses `null` until mounted to avoid hydration mismatch.
 */
export function useLayoutBreakpoint(): LayoutBreakpoint | null {
  const [bp, setBp] = useState<LayoutBreakpoint | null>(null);

  useEffect(() => {
    const desktopMq = window.matchMedia(LAYOUT_MEDIA.desktopUp);
    const tabletMq = window.matchMedia(LAYOUT_MEDIA.tabletOnly);

    const sync = () => {
      setBp(getLayoutBreakpoint(window.innerWidth));
    };

    sync();
    desktopMq.addEventListener('change', sync);
    tabletMq.addEventListener('change', sync);
    window.addEventListener('resize', sync);

    return () => {
      desktopMq.removeEventListener('change', sync);
      tabletMq.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return bp;
}
