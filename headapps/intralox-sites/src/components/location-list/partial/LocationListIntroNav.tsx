'use client';

import type { JSX, MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { LOCATION_LIST_INTRO_NAV_ARIA, type LocationListIntroGroup } from 'components/location-list/locationListUtils';

/** NeueHelvetica stack via `--font-media-tile` (same as live intralox.com location intro). */
const BULLET_SEPARATOR = ' \u2022 ';

interface LocationListIntroNavProps {
  groups: LocationListIntroGroup[];
}

/**
 * Introduction quick links: in-page anchors with smooth scrolling (respects reduced motion).
 */
export function LocationListIntroNav({ groups }: LocationListIntroNavProps): JSX.Element | null {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setPrefersReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, anchorId: string) => {
      const el = document.getElementById(anchorId);
      if (!el) {
        return;
      }
      e.preventDefault();
      el.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      if (typeof window.history?.replaceState === 'function') {
        window.history.replaceState(null, '', `#${anchorId}`);
      }
    },
    [prefersReducedMotion],
  );

  if (!groups.length) {
    return null;
  }

  return (
    <nav className='box-border block py-0 text-center font-media-tile text-font-medium font-normal leading-6 text-ink-primary antialiased [-webkit-tap-highlight-color:transparent]' aria-label={LOCATION_LIST_INTRO_NAV_ARIA}>
      {groups.map((g) => (
        <p key={g.sectionKey} className='m-0 mb-4 last:mb-0 block [unicode-bidi:isolate]'>
          <span className='font-bold text-ink-primary'>{`${g.sectionHeading}:`}</span>{' '}
          {g.links.map((link, idx) => (
            <span key={link.anchorId}>
              {idx > 0 ? BULLET_SEPARATOR : null}
              <a
                href={`#${link.anchorId}`}
                className='font-inherit text-link underline decoration-solid underline-offset-2 outline-none transition-[color,text-decoration-color,text-decoration-thickness] duration-150 ease-in-out motion-reduce:transition-none hover:text-link-strong hover:no-underline focus:outline-none focus-visible:outline-none focus-visible:text-link-strong focus-visible:no-underline [-webkit-tap-highlight-color:transparent]'
                onClick={(ev) => handleClick(ev, link.anchorId)}
              >
                {link.label}
              </a>
            </span>
          ))}
        </p>
      ))}
    </nav>
  );
}
