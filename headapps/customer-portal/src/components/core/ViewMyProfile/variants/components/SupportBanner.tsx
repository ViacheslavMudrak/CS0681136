"use client";

import Link from "@/components/ui/Link";
import { sendContactRequestEvent } from "@/lib/CDPEvents";
import { logGTMContactRequest } from "@/lib/gtm";
import {
  NextImage as ContentSdkImage,
  Text as ContentSdkText,
  type Field,
  type ImageField,
  type LinkField,
} from "@sitecore-content-sdk/nextjs";
import { usePathname } from "next/navigation";
import React, { useCallback } from "react";

/** UI surface id for analytics (GTM / CDP) */
const SUPPORT_SURFACE_VIEW_MY_PROFILE_BANNER = "view_my_profile_banner";

interface SupportBannerProps {
  icon?: ImageField;
  bannerText?: Field<string>;
  bannerLink?: LinkField;
  /** CSR email for mailto; when set, link opens mailto instead of href */
  csrEmail?: string;
}

/**
 * Support banner with icon, text and email/support link.
 * If csrEmail is provided, the link uses mailto; otherwise uses BannerLink href from Sitecore.
 */
export function SupportBanner({
  icon,
  bannerText,
  bannerLink,
  csrEmail,
}: SupportBannerProps): React.ReactElement | null {
  const pathname = usePathname();
  const linkValue = bannerLink?.value;
  const linkText = linkValue?.text;
  const hasText = Boolean(bannerText?.value);
  const hasContent = hasText || linkText;

  const isMailto = Boolean(csrEmail);
  const href = isMailto ? `mailto:${csrEmail}` : (linkValue?.href ?? "#");
  const webHref = linkValue?.href ?? "#";

  const handleSupportContactClick = useCallback(() => {
    const contactChannel = isMailto ? "email" : "url";
    const linkTarget = isMailto ? "mailto" : webHref;

    logGTMContactRequest({
      page_path: pathname,
      link_text: linkText ?? "",
      contact_channel: contactChannel,
      support_surface: SUPPORT_SURFACE_VIEW_MY_PROFILE_BANNER,
      link_target: linkTarget,
    });

    sendContactRequestEvent({
      type: "Contact_Request",
      pagePath: pathname,
      linkText: linkText ?? "",
      contactChannel,
      supportSurface: SUPPORT_SURFACE_VIEW_MY_PROFILE_BANNER,
      linkTarget,
    });
  }, [isMailto, linkText, pathname, webHref]);

  if (!hasContent) {
    return null;
  }

  const linkProps = {
    className:
      "break-words text-[12px] font-[400] leading-normal text-[var(--color-link-text)] no-underline",
    onClick: handleSupportContactClick,
  };

  return (
    <div
      className="flex w-full max-w-full flex-nowrap items-start gap-2 rounded bg-[var(--color-border-default)] p-4 md:w-auto md:max-w-[479px]"
      role="region"
      aria-label="Support information"
    >
      {icon?.value?.src && (
        <div className="mt-[1px] flex h-4 w-3 shrink-0">
          <ContentSdkImage
            field={icon}
            width={12}
            height={16}
            alt={(icon.value.alt ?? "Support icon") as string}
            loading="lazy"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:flex-row md:flex-wrap md:gap-2 lg:flex-row lg:gap-2">
        {bannerText && (
          <ContentSdkText
            field={bannerText}
            tag="span"
            className="min-w-0 break-words text-[12px] font-[400] leading-normal text-[var(--color-text-heading-color)]"
          />
        )}
        {linkText &&
          (isMailto ? (
            <Link href={href} {...linkProps}>
              {linkText}
            </Link>
          ) : (
            <Link href={webHref} {...linkProps}>
              {linkText}
            </Link>
          ))}
      </div>
    </div>
  );
}
