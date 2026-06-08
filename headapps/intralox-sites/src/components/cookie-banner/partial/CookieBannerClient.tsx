"use client";

import type { JSX } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { RichText } from "@sitecore-content-sdk/nextjs";

import { getRichTextRegionAriaLabel } from "components/rich-text/richTextUtils";
import Button from "components/ui/Button";

import { renderingAnchorId } from "src/utils/renderingAnchorProps";

import { cn } from "lib/utils";

import type { CookieBannerClientProps } from "../CookieBanner.type";
import {
  COOKIE_BANNER_CTA_ARIA_FALLBACK,
  COOKIE_BANNER_EMPTY_RICH_TEXT,
  COOKIE_BANNER_REGION_ARIA_FALLBACK,
  COOKIE_BANNER_STORAGE_KEY,
  formatCookieBannerConsentDocumentCookie,
  getCookieBannerCtaAriaLabel,
  getCookieBannerPageScrollY,
  hasCookieBannerScrolledEnoughForConsent,
  hasMeaningfulRichTextValue,
  readCookieBannerDismissedFromBrowser,
  shouldRenderBannerText,
  shouldRenderButtonLink,
} from "../cookieBannerUtils";

function isJavaScriptHref(href: string | undefined): boolean {
  return (
    typeof href === "string" &&
    href.toLowerCase().trim().startsWith("javascript:")
  );
}

function persistDismiss(
  isEditing: boolean,
  setDismissed: (value: boolean) => void,
): void {
  if (isEditing) {
    return;
  }
  try {
    const isSecure =
      typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = formatCookieBannerConsentDocumentCookie(isSecure);
  } catch {}
  try {
    localStorage.removeItem(COOKIE_BANNER_STORAGE_KEY);
  } catch {}
  setDismissed(true);
}

export const CookieBannerClient = ({
  bannerText,
  buttonTextWithLink,
  isEditing,
  rendering,
  RenderingIdentifier,
  styles,
}: CookieBannerClientProps): JSX.Element | null => {
  const [isDismissed, setDismissed] = useState(false);
  const bannerRootRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const lastPathnameRef = useRef(pathname);
  const baselineScrollYRef = useRef(0);

  const syncDismissedFromBrowser = useCallback(() => {
    try {
      setDismissed(readCookieBannerDismissedFromBrowser(isEditing));
    } catch {}
  }, [isEditing]);

  useLayoutEffect(() => {
    syncDismissedFromBrowser();
  }, [syncDismissedFromBrowser]);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        syncDismissedFromBrowser();
      }
    };

    window.addEventListener("focus", syncDismissedFromBrowser);
    window.addEventListener("pageshow", syncDismissedFromBrowser);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", syncDismissedFromBrowser);
      window.removeEventListener("pageshow", syncDismissedFromBrowser);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isEditing, syncDismissedFromBrowser]);

  useEffect(() => {
    if (isEditing || isDismissed) {
      return;
    }

    baselineScrollYRef.current = getCookieBannerPageScrollY();

    const tryImplicitAccept = (): void => {
      persistDismiss(isEditing, setDismissed);
    };

    const isEventInsideBanner = (target: EventTarget | null): boolean =>
      Boolean(target && bannerRootRef.current?.contains(target as Node));

    const evaluateScroll = (): void => {
      if (hasCookieBannerScrolledEnoughForConsent(baselineScrollYRef.current)) {
        tryImplicitAccept();
      }
    };

    const handleClick = (e: globalThis.MouseEvent): void => {
      if (isEventInsideBanner(e.target)) {
        return;
      }
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!anchor) {
        return;
      }
      const href = anchor.getAttribute("href")?.trim();
      if (!href || href === "#") {
        return;
      }
      tryImplicitAccept();
    };

    const passive = { passive: true } as const;
    window.addEventListener("scroll", evaluateScroll, passive);
    document.addEventListener("scroll", evaluateScroll, passive);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("scroll", evaluateScroll);
      document.removeEventListener("scroll", evaluateScroll);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isEditing, isDismissed]);

  useEffect(() => {
    if (isEditing || isDismissed) {
      return;
    }
    if (lastPathnameRef.current !== pathname) {
      persistDismiss(isEditing, setDismissed);
    }
    lastPathnameRef.current = pathname;
  }, [pathname, isEditing, isDismissed]);

  const shellId = renderingAnchorId(RenderingIdentifier);

  if (!isEditing && isDismissed) {
    return (
      <div
        className={cn(
          "component cookie-banner h-0 min-h-0 w-full max-w-none overflow-visible !px-0",
          styles,
        )}
        id={shellId}
        hidden
        aria-hidden="true"
      />
    );
  }

  const regionLabel = getRichTextRegionAriaLabel(
    rendering,
    COOKIE_BANNER_REGION_ARIA_FALLBACK,
  );
  const showBanner = shouldRenderBannerText(bannerText, isEditing);
  const showButton = shouldRenderButtonLink(buttonTextWithLink, isEditing);
  const bannerField = bannerText ?? COOKIE_BANNER_EMPTY_RICH_TEXT;
  const ctaAriaLabel = getCookieBannerCtaAriaLabel(
    buttonTextWithLink,
    COOKIE_BANNER_CTA_ARIA_FALLBACK,
  );
  const ctaHref = buttonTextWithLink?.value?.href;
  const ctaTarget = buttonTextWithLink?.value?.target;
  const ctaRel = ctaTarget === "_blank" ? "noopener noreferrer" : undefined;
  const ctaText =
    buttonTextWithLink?.value?.text?.trim() ||
    buttonTextWithLink?.value?.title?.trim() ||
    ctaAriaLabel;
  const ctaIsDismissOnly =
    isJavaScriptHref(ctaHref) || !ctaHref?.trim() || ctaHref.trim() === "#";
  const resolvedHref = ctaHref?.trim() || "#";

  const handleCtaActivate = (): void => {
    persistDismiss(isEditing, setDismissed);
  };

  return (
    <div className={cn("component cookie-banner w-full", styles)} id={shellId}>
      <div className="component-content ">
        <section
          ref={bannerRootRef}
          aria-label={regionLabel}
          className="fixed items-baseline bottom-0 left-0 right-0 z-50 box-border flex flex-wrap justify-between w-full bg-chrome-bar shadow-md"
          role="region"
        >
          {showBanner &&
            (hasMeaningfulRichTextValue(bannerText?.value) || isEditing) && (
              <div className="flex-[1_0_300px] m-[15px]">
                <RichText
                  className="text-sm leading-normal text-surface [&_a]:text-accent-danger [&_a:hover]:text-chrome-link-hover [&_a]:font-medium"
                  field={bannerField}
                />
              </div>
            )}
          {showButton && (
            <>
              {ctaIsDismissOnly ? (
                <Button
                  aria-label={ctaAriaLabel}
                  className="inline-flex min-w-[inherit] m-[15px] shrink-0 items-center justify-center whitespace-nowrap rounded-none border-0 bg-accent-cta text-center font-normal text-font-medium text-ink-primary no-underline hover:bg-accent-cta hover:text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-chrome-bar px-2.5 py-[5px] text-base"
                  onPress={handleCtaActivate}
                  type="button"
                >
                  {ctaText}
                </Button>
              ) : (
                <Button
                  aria-label={ctaAriaLabel}
                  btnVariant="link"
                  className="min-w-[inherit] inline-flex box-border max-w-full shrink-0 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-none border-0 bg-accent-cta text-center font-normal font-media-tile text-font-medium leading-normal text-ink-primary no-underline hover:bg-accent-cta hover:text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-chrome-bar max-[519px]:h-auto max-[519px]:min-h-[32px] max-[519px]:w-auto px-2.5 py-[5px] text-base"
                  href={resolvedHref}
                  onPress={handleCtaActivate}
                  rel={ctaRel}
                  target={ctaTarget || undefined}
                >
                  {ctaText}
                </Button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
