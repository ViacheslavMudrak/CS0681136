"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  Link as SitecoreLink,
  LinkField,
  useSitecore,
} from "@sitecore-content-sdk/nextjs";

import { ChromeIconFromCms } from "lib/chrome-icons";
import { cn } from "lib/utils";

import UiLink from "components/ui/Link";
import MediaCardView from "components/shared/MediaCardView";
import {
  linkFieldHref,
  linkFieldRel,
  type LinkChromeButtonTheme,
  type LinkChromeViewButtonType,
} from "components/shared/linkCtaChrome";
import {
  ctaButtonClasses,
  type CtaButtonType,
} from "components/ui/ctaVariants";

export type LinkViewButtonTheme = LinkChromeButtonTheme;
export type LinkViewButtonType = LinkChromeViewButtonType;
export type LinkViewIconPosition =
  | "Before label"
  | "After label"
  | (string & {});

/** CMS may use title case (e.g. "Before Label"); compare case-insensitively. */
function isIconBeforeLabel(iconPosition: string | undefined): boolean {
  return iconPosition?.trim().toLowerCase() === "before label";
}

function isIconAfterLabel(iconPosition: string | undefined): boolean {
  return iconPosition?.trim().toLowerCase() === "after label";
}

/** Maps Sitecore button type to CTA chrome; unknown legacy values (e.g. grid) → rect. */
function resolveLinkViewCtaButtonType(
  buttonType: string | undefined,
): CtaButtonType | undefined {
  if (buttonType === "pill") {
    return "pill";
  }
  if (
    buttonType !== undefined &&
    buttonType !== "pill" &&
    buttonType !== "more" &&
    buttonType !== "link"
  ) {
    return "rect";
  }
  return undefined;
}

export interface ILinkViewProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children"
> {
  link: LinkField;
  className?: string;
  children?: ReactNode;
  buttonType?: LinkViewButtonType;
  contrast?: boolean;
  buttonTheme?: LinkViewButtonTheme;
  icon?: string;
  iconPosition?: LinkViewIconPosition;
  isTile?: boolean;
  /** When omitted, uses `useSitecore().page.mode.isEditing`. */
  isEditing?: boolean;
  /** Extra classes on the CMS icon (e.g. belt identifier step-4 CTA). */
  iconClassName?: string;
}

const LinkView = ({
  link,
  className,
  children,
  buttonType = "link",
  contrast,
  buttonTheme,
  icon,
  iconPosition,
  isTile,
  isEditing: isEditingProp,
  iconClassName,
  ...anchorProps
}: ILinkViewProps) => {
  const { page } = useSitecore();
  const isEditing = isEditingProp ?? page?.mode?.isEditing ?? false;

  const href = linkFieldHref(link);
  const target = link?.value?.target;
  const rel = linkFieldRel(target);

  const iconBefore =
    icon && isIconBeforeLabel(iconPosition) ? (
      <ChromeIconFromCms
        cssClass={icon}
        className={cn("size-4 mr-1 !top-0", iconClassName)}
      />
    ) : null;
  const iconAfter =
    icon && isIconAfterLabel(iconPosition) ? (
      <ChromeIconFromCms
        cssClass={icon}
        className={cn("size-4 ml-1 !top-0", iconClassName)}
      />
    ) : null;

  const labelContent = (
    <>
      {iconBefore}
      {children}
      {iconAfter}
    </>
  );

  const ctaButtonType = resolveLinkViewCtaButtonType(buttonType);

  if (isTile) {
    return (
      <MediaCardView
        link={link}
        className={className}
        isEditing={isEditing}
        {...anchorProps}
      >
        {children}
      </MediaCardView>
    );
  }

  if (isEditing) {
    return (
      <SitecoreLink
        field={link}
        className={
          ctaButtonType
            ? cn(
                ctaButtonClasses({
                  buttonType: ctaButtonType,
                  buttonTheme,
                  contrast,
                }),
                className,
              )
            : cn(
                "font-normal transition-colors no-underline hover:underline focus:outline-none focus:ring",
                contrast
                  ? "text-ink-inverse hover:text-chrome-chevron"
                  : "text-action-link hover:text-action",
                className,
              )
        }
        {...anchorProps}
      >
        {labelContent}
      </SitecoreLink>
    );
  }

  if (!href) {
    return null;
  }

  if (ctaButtonType) {
    return (
      <UiLink
        href={href}
        target={target}
        rel={rel}
        buttonType={ctaButtonType}
        buttonTheme={buttonTheme}
        contrast={contrast}
        className={className}
        {...anchorProps}
      >
        {labelContent}
      </UiLink>
    );
  }

  return (
    <UiLink
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "font-normal inline-flex items-center transition-colors no-underline hover:underline focus:outline-none focus:ring",
        contrast
          ? "text-ink-inverse hover:text-chrome-chevron"
          : "text-action-link hover:text-action",
        className,
      )}
      {...anchorProps}
    >
      {labelContent}
    </UiLink>
  );
};

export default LinkView;
