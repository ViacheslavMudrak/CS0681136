import { JSX } from "react";
import { Link as ContentSdkLink, Text } from "@sitecore-content-sdk/nextjs";
import type {
  FooterMainLinkItem,
  FooterSocialLinkItem,
  FooterSubLinkItem,
} from "../Footer.type";
import {
  ChromeIconFromCms,
  FOOTER_SOCIAL_ICON_CLASS,
  FOOTER_SOCIAL_YOUTUBE_ICON_CLASS,
  isFooterYoutubeSocialIcon,
  SocialPlatformIcon,
} from "lib/chrome-icons";
import { firstNonEmptyTextField } from "components/navigation/navigationUtils";
import { cn } from "lib/utils";

import { detectSocialPlatform, getLinkText } from "../footerUtils";

interface FooterLinkItemProps {
  child: FooterSubLinkItem;
  isEditing: boolean;
  isBold?: boolean;
}

/** Footer nav link in a column (bold or regular weight). */
const FooterLinkItem = ({
  child,
  isEditing,
  isBold = false,
}: FooterLinkItemProps): JSX.Element | null => {
  const link = child?.fields?.Link;
  const hasHref = !!link?.value?.href;
  const text = getLinkText(child);
  const linkTarget = link?.value?.target;

  if (!hasHref && !isEditing) {
    if (!text) return null;
    return (
      <li
        className={cn(
          "list-none text-sm leading-[1.25]",
          isBold
            ? "footer-link-bold m-0 p-0"
            : "footer-link-regular mt-0 mb-0 p-0 text-stroke-default",
        )}
      >
        <span
          className={cn(
            "inline-block py-1 text-sm text-ink-inverse",
            isBold
              ? "font-medium leading-[1.25] tracking-[0.05em] uppercase [&_*]:font-inherit"
              : "box-border m-0 font-normal leading-[1.25] tracking-[0.7px]",
          )}
        >
          {text}
        </span>
      </li>
    );
  }

  if (!link) return null;

  return (
    <li
      className={cn(
        "list-none text-sm leading-[1.25]",
        isBold
          ? "footer-link-bold m-0 p-0"
          : "footer-link-regular mt-0 mb-0 p-0 text-stroke-default",
      )}
    >
      <ContentSdkLink
        field={link}
        editable={isEditing}
        className={cn(
          "focus:outline-none focus-visible:outline-none focus-visible:text-ink-inverse focus-visible:no-underline focus-visible:rounded-[2px] focus-visible:shadow-[0_0_0_2px_var(--color-focus-interactive),0_0_0_3px_var(--color-ink-inverse)] inline-block py-1 text-sm text-ink-inverse no-underline hover:text-stroke-default hover:underline",
          isBold
            ? "font-medium leading-[1.25] tracking-[0.05em] uppercase [&_*]:font-inherit"
            : "box-border m-0 font-normal leading-[1.25] tracking-[0.7px] normal-case cursor-pointer [-webkit-tap-highlight-color:transparent] transition-[color,background-color,border-color,outline-color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none",
        )}
        aria-label={text || child.displayName || undefined}
        target={linkTarget || undefined}
        rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
      >
        {!link?.value?.text &&
          (String(child.fields?.Title?.value ?? "").trim() ||
            child.displayName)}
      </ContentSdkLink>
    </li>
  );
};

interface FooterNavColumnProps {
  item: FooterMainLinkItem;
  columnIndex: number;
  isEditing: boolean;
}

/**
 * Footer nav column with optional heading and child links.
 * Prefers item `Title` (+ optional `Link`); column 0 uses bold primary links only.
 * Otherwise derives heading from children without href, or first child as bold link when all have hrefs.
 */
export const FooterNavColumn = ({
  item,
  columnIndex,
  isEditing,
}: FooterNavColumnProps): JSX.Element => {
  const titleField = item.fields?.Title;
  const columnLink = item.fields?.Link;
  const columnLinkTarget = columnLink?.value?.target;
  const children = item.fields?.ChildLinks?.filter((c) => c?.fields) ?? [];
  const hasTitle = !!String(titleField?.value ?? "").trim();
  const showColumnHeadingLink =
    !!columnLink?.value?.href || (isEditing && !!columnLink);

  if (hasTitle || (isEditing && titleField)) {
    const headingAriaLabel = String(
      titleField?.value ?? item.displayName ?? "Navigation group",
    ).trim();

    return (
      <div
        className={cn(
          "footer-nav-column mt-4 w-1/2 max-w-[240px] pl-3 md:pl-12 md:w-1/4 lg:w-1/5",
          columnIndex === 2 &&
            "-ml-3 sm:-ml-4 md:-ml-2 lg:ml-0 xl:ml-2",
        )}
        role="group"
        aria-label={headingAriaLabel}
      >
        {showColumnHeadingLink && columnLink ? (
          <h3 className="footer-column-heading m-0 inline-block py-1 text-sm !font-medium leading-[1.2] tracking-[0.05em] text-ink-inverse uppercase [&_*]:font-inherit">
            <ContentSdkLink
              field={columnLink}
              editable={isEditing}
              className={
                "footer-column-heading-link focus:outline-none focus-visible:outline-none focus-visible:text-ink-inverse focus-visible:no-underline focus-visible:rounded-[2px] focus-visible:shadow-[0_0_0_2px_var(--color-focus-interactive),0_0_0_3px_var(--color-ink-inverse)] text-sm font-medium leading-[1.2] tracking-[0.05em] text-ink-inverse uppercase [&_*]:font-inherit inline-block py-1 no-underline hover:text-stroke-default hover:underline box-border cursor-pointer [-webkit-tap-highlight-color:transparent]"
              }
              aria-label={headingAriaLabel}
              target={columnLinkTarget || undefined}
              rel={
                columnLinkTarget === "_blank"
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              {!String(columnLink?.value?.text ?? "").trim() && titleField && (
                <Text field={titleField} tag="span" />
              )}
            </ContentSdkLink>
          </h3>
        ) : (
          <Text
            field={titleField}
            tag="h3"
            className="footer-column-heading m-0 inline-block py-1 text-sm !font-medium leading-[1.2] tracking-[0.05em] text-ink-inverse uppercase [&_*]:font-inherit"
          />
        )}
        <ul
          className="footer-nav-links flex flex-col list-none p-0 m-0"
          role="list"
        >
          {children.map((child) => (
            <FooterLinkItem
              key={child.id}
              child={child}
              isEditing={isEditing}
            />
          ))}
          {!children.length && isEditing && (
            <li>
              <span className="is-empty-hint">No links configured</span>
            </li>
          )}
        </ul>
      </div>
    );
  }

  if (columnIndex === 0) {
    return (
      <div
        className="footer-nav-column mt-4 w-1/2 max-w-[240px] md:pl-12 md:w-1/4 lg:w-1/5"
        role="group"
        aria-label={item.displayName ?? "Primary links"}
      >
        <ul
          className="footer-nav-links flex flex-col list-none p-0 m-0 !py-0"
          role="list"
        >
          {children.map((child) => (
            <FooterLinkItem
              key={child.id}
              child={child}
              isEditing={isEditing}
              isBold
            />
          ))}
          {!children.length && isEditing && (
            <li>
              <span className="is-empty-hint">No links configured</span>
            </li>
          )}
        </ul>
      </div>
    );
  }

  const noHrefItems = children.filter((c) => !c.fields?.Link?.value?.href);
  const allChildrenHaveHref = children.length > 0 && noHrefItems.length === 0;
  const headingItem =
    noHrefItems.length > 0
      ? noHrefItems[noHrefItems.length - 1]
      : (children[0] ?? null);
  const headingId = headingItem?.id;
  const linkItems =
    headingId && !allChildrenHaveHref
      ? children.filter((c) => c.id !== headingId)
      : allChildrenHaveHref && headingId
        ? children.filter((c) => c.id !== headingId)
        : children;
  const headingText = headingItem ? getLinkText(headingItem) : "";
  const derivedGroupLabel =
    headingText || item.displayName || "Navigation group";

  const derivedHeadingAsLink =
    showColumnHeadingLink &&
    !!columnLink &&
    !!headingText &&
    !allChildrenHaveHref;

  let derivedHeadingBlock: JSX.Element | null = null;
  if (!allChildrenHaveHref) {
    if (derivedHeadingAsLink && columnLink) {
      derivedHeadingBlock = (
        <h3 className="footer-column-heading m-0 inline-block py-1 text-sm !font-medium leading-[1.2] tracking-[0.05em] text-ink-inverse uppercase [&_*]:font-inherit">
          <ContentSdkLink
            field={columnLink}
            editable={isEditing}
            className={
              "footer-column-heading-link focus:outline-none focus-visible:outline-none focus-visible:text-ink-inverse focus-visible:no-underline focus-visible:rounded-[2px] focus-visible:shadow-[0_0_0_2px_var(--color-focus-interactive),0_0_0_3px_var(--color-ink-inverse)] text-sm font-medium leading-[1.2] tracking-[0.05em] text-ink-inverse uppercase [&_*]:font-inherit inline-block py-1 no-underline hover:text-stroke-default hover:underline box-border cursor-pointer [-webkit-tap-highlight-color:transparent]"
            }
            aria-label={derivedGroupLabel}
            target={columnLinkTarget || undefined}
            rel={
              columnLinkTarget === "_blank" ? "noopener noreferrer" : undefined
            }
          >
            {!String(columnLink?.value?.text ?? "").trim() ? headingText : null}
          </ContentSdkLink>
        </h3>
      );
    } else if (headingText) {
      derivedHeadingBlock = (
        <h3 className="footer-column-heading m-0 inline-block py-1 text-sm !font-medium leading-[1.2] tracking-[0.05em] text-ink-inverse uppercase [&_*]:font-inherit">
          {headingText}
        </h3>
      );
    }
  }

  return (
    <div
      className={cn(
        "footer-nav-column mt-4 w-1/2 pl-3 max-w-[240px] md:pl-12 md:w-1/4 lg:w-1/5",
        columnIndex === 2 &&
          "-ml-3 sm:-ml-4 md:-ml-2 lg:ml-0 xl:ml-2",
      )}
      role="group"
      aria-label={derivedGroupLabel}
    >
      {derivedHeadingBlock}
      <ul
        className="footer-nav-links flex flex-col list-none p-0 m-0 !py-0"
        role="list"
      >
        {allChildrenHaveHref && headingItem && (
          <FooterLinkItem
            key={headingItem.id}
            child={headingItem}
            isEditing={isEditing}
            isBold
          />
        )}
        {linkItems.map((child) => (
          <FooterLinkItem key={child.id} child={child} isEditing={isEditing} />
        ))}
        {!linkItems.length &&
          !(allChildrenHaveHref && headingItem) &&
          isEditing && (
            <li>
              <span className="is-empty-hint">No links configured</span>
            </li>
          )}
      </ul>
    </div>
  );
};

interface FooterSocialLinkProps {
  item: FooterSocialLinkItem;
  isEditing: boolean;
}

/** Intralox icon library glyph from Sitecore `IconCssClass`, or platform-detected fallback from href. */
const SocialIcon = ({
  iconClass,
  href,
}: {
  iconClass: string;
  href?: string;
}): JSX.Element | null => {
  if (iconClass) {
    const socialIconClass = isFooterYoutubeSocialIcon(iconClass, href)
      ? FOOTER_SOCIAL_YOUTUBE_ICON_CLASS
      : FOOTER_SOCIAL_ICON_CLASS;
    return (
      <ChromeIconFromCms cssClass={iconClass} className={socialIconClass} />
    );
  }

  const platform = detectSocialPlatform(href);
  if (platform) {
    return <SocialPlatformIcon platform={platform} />;
  }

  return null;
};

/** Social link with platform icon; Sitecore icon class or href-detected Font Awesome fallback. */
export const FooterSocialLink = ({
  item,
  isEditing,
}: FooterSocialLinkProps): JSX.Element | null => {
  const link = item?.fields?.Link;
  const fieldBag = item?.fields as Record<string, unknown> | undefined;
  const iconClass = firstNonEmptyTextField(
    fieldBag?.IconCssClass,
    fieldBag?.iconCssClass,
    fieldBag?.CssClass,
    fieldBag?.cssClass,
  );
  const linkTarget = link?.value?.target;
  const label =
    link?.value?.title ??
    link?.value?.text ??
    item.displayName ??
    "Social link";

  if (!link?.value?.href && !isEditing) return null;
  if (!link) return null;

  return (
    <div
      role="listitem"
      className="flex shrink-0 grow-0 basis-auto items-center justify-center"
    >
      <ContentSdkLink
        field={link}
        editable={isEditing}
        aria-label={label}
        className={
          "footer-social-link focus:outline-none focus-visible:outline-none focus-visible:text-ink-inverse focus-visible:no-underline focus-visible:rounded-[2px] focus-visible:shadow-[0_0_0_2px_var(--color-focus-interactive),0_0_0_3px_var(--color-ink-inverse)] inline-flex items-center justify-center p-0.5 leading-none text-ink-inverse no-underline [&_svg]:align-middle [&_svg]:leading-none"
        }
        target={linkTarget || undefined}
        rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
      >
        <SocialIcon iconClass={iconClass} href={link?.value?.href} />
      </ContentSdkLink>
    </div>
  );
};
