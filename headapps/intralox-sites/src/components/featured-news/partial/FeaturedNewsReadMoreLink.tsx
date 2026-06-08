"use client";

import { JSX } from "react";
import { ICON_CHEVRON_RIGHT_12PX, ICON_CHEVRON_RIGHT_14PX } from "lib/chrome-icons";
import { useTranslations } from "next-intl";

import { I18N } from "lib/dictionary-keys";

/**
 * Chevron after Featured News “View All” — 12×12 at all breakpoints.
 */
export function FeaturedNewsViewAllChevron(): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-3 shrink-0 items-center justify-center text-current"
    >
      {ICON_CHEVRON_RIGHT_12PX}
    </span>
  );
}

/**
 * Chevron after “Read More” — 14×14 at all breakpoints.
 */
export function FeaturedNewsChevronRight(): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-[14px] shrink-0 items-center justify-center text-current"
    >
      {ICON_CHEVRON_RIGHT_14PX}
    </span>
  );
}

export interface FeaturedNewsReadMoreLinkProps {
  href: string;
}

/**
 * Read More anchor with 14px chevron (matches live Featured News / View All).
 */
export function FeaturedNewsReadMoreLink({
  href,
}: FeaturedNewsReadMoreLinkProps): JSX.Element {
  const t = useTranslations();
  const readMoreLabel = t(I18N.READMORE);

  return (
    <a
      href={href}
      className="box-border cursor-pointer font-media-tile text-font-media-tile-eyebrow font-normal leading-[21px] text-link no-underline decoration-solid underline-offset-2 transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-in-out motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] hover:text-link-alt hover:underline rounded-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-0 inline-flex items-center gap-0"
      aria-label={readMoreLabel}
    >
      <span>{readMoreLabel}</span>
      <FeaturedNewsChevronRight />
    </a>
  );
}
