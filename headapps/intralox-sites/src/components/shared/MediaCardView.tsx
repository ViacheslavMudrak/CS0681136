"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link as SitecoreLink, type LinkField, useSitecore } from "@sitecore-content-sdk/nextjs";

import MediaCard from "components/ui/MediaCard";
import { linkFieldHref, linkFieldRel } from "components/shared/linkCtaChrome";

export interface MediaCardViewProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> {
  link: LinkField;
  className?: string;
  children?: ReactNode;
  /** Optional media slot (DS MediaCard `mediaElement`). Omit to render all content in `children`. */
  mediaElement?: ReactNode;
  /** When omitted, uses `useSitecore().page.mode.isEditing`. */
  isEditing?: boolean;
  /**
   * DS MediaCard wraps children in `px-4 pb-6 pt-4`. Use `none` when the tile supplies its own content padding
   * (e.g. Quick Link standalone rail with `p-6` on the text column).
   */
  contentPadding?: "default" | "none";
}

/**
 * Sitecore-aware tile wrapper: preview uses `ui/MediaCard`, editing uses SDK `Link`.
 */
export default function MediaCardView({
  link,
  className,
  children,
  mediaElement,
  isEditing: isEditingProp,
  contentPadding = "default",
  ...anchorProps
}: MediaCardViewProps) {
  const { page } = useSitecore();
  const isEditing = isEditingProp ?? page?.mode?.isEditing ?? false;

  const href = linkFieldHref(link);
  const target = link?.value?.target;
  const rel = linkFieldRel(target);

  if (isEditing) {
    return href || link ?
        <SitecoreLink field={link} className={className} {...anchorProps}>
          {mediaElement}
          {children}
        </SitecoreLink>
      : <div className={className}>{mediaElement}{children}</div>;
  }

  if (href) {
    if (contentPadding === "none") {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={className}
          {...anchorProps}
        >
          {mediaElement}
          {children}
        </a>
      );
    }

    return (
      <MediaCard
        href={href}
        target={target}
        rel={rel}
        className={className}
        mediaElement={mediaElement}
        {...anchorProps}
      >
        {children}
      </MediaCard>
    );
  }

  return (
    <div className={className}>
      {mediaElement}
      {children}
    </div>
  );
}
