"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";

import {
  Link as SitecoreLink,
  useSitecore,
} from "@sitecore-content-sdk/nextjs";
import scConfig from "sitecore.config";

import { Popover } from "@laitram-l-l-c/intralox-ui-components";

import { cn } from "lib/utils";

import { UI_ICONS } from "components/navigation/partial/NavigationIcons";
import {
  MOBILE_MENU_LAYOUT_MEDIA_QUERY,
  NAV_SAME_TAB_TARGET,
  getLinkFieldHref,
  getLinkRel,
  normalizeAppPathname,
} from "components/navigation/navigationUtils";

import type { LocalNavResolvedItem } from "../LocalNavigation.type";
import {
  contentPathUnderBase,
  findActivePrimaryIndex,
  getContentPathFromAppPathname,
  hrefToContentPathForMatch,
  isAppHomePathname,
  localNavPrimaryOverviewIsCurrent,
  localNavSiblingActiveItem,
  resolveLocalNavLinkFieldForAppRouter,
  resolvedItemOrDescendantActive,
} from "../localNavigationUtils";

/** User-visible strings — replace with dictionary keys when i18n is wired for this component. */
const LOCAL_NAV_LABELS = {
  navAria: "Local navigation",
  mobileToggleOpen: "Open section navigation",
  mobileToggleClose: "Close section navigation",
  mobileMenuFallback: "In this section",
} as const;

/** True when this item is the last visible submenu row (flatten order matches `collectVisibleMobileSubmenuLinkIds`). */
function mobileSubmenuRowIsLastVisible(
  itemId: string,
  lastLinkId: string | undefined,
): boolean {
  if (lastLinkId === undefined) return false;
  return String(itemId).toLowerCase() === String(lastLinkId).toLowerCase();
}

type LocalNavigationClientProps = {
  isEditing: boolean;
  showSubRoute: boolean;
  primaries: LocalNavResolvedItem[];
  secondaries: LocalNavResolvedItem[];
  /** @deprecated No longer gates desktop dropdowns; kept for API compatibility with layout-derived nav. */
  useIndustryNavDropdowns?: boolean;
  /** `layout.sitecore.route.itemId` — matches General Link `id` when href/path disagree with the URL. */
  routeItemGuid?: string;
  styles?: string;
  id?: string;
};

type LocalNavDesktopDropdownItemProps = {
  item: LocalNavResolvedItem;
  isOpen: boolean;
  isEditing: boolean;
  selfActive: boolean;
  branchActive: boolean;
  linkForAppRouter: (link: LocalNavResolvedItem["link"]) => LocalNavResolvedItem["link"];
  onOpenChange: (open: boolean) => void;
  flyoutItems: JSX.Element[];
};

/** Desktop secondary with nested children — Popover avoids strip overflow clipping the panel. */
function LocalNavDesktopDropdownItem({
  item,
  isOpen,
  isEditing,
  selfActive,
  branchActive,
  linkForAppRouter,
  onOpenChange,
  flyoutItems,
}: LocalNavDesktopDropdownItemProps): JSX.Element {
  const triggerActive = selfActive || branchActive;
  const controlRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);

  const toggleFlyout = () => {
    onOpenChange(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (controlRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };

    document.addEventListener("pointerdown", handlePointerDownOutside, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside, true);
    };
  }, [isOpen, onOpenChange]);

  return (
    <li
      className="relative m-0 flex h-9 list-none items-center overflow-visible pl-2 pr-0 pt-0 pb-0 [unicode-bidi:isolate]"
      role="listitem"
    >
      <div ref={controlRef} className="inline-flex h-9 items-center">
        {isEditing ? (
          <SitecoreLink
            field={linkForAppRouter(item.link)}
            editable={isEditing}
            target={NAV_SAME_TAB_TARGET}
            rel={getLinkRel(NAV_SAME_TAB_TARGET)}
            className={cn(
              "inline-flex h-9 items-center box-border whitespace-nowrap text-sm font-normal leading-[21px] text-ink-muted no-underline m-0 border-0 border-b-[3px] border-solid border-transparent px-1 pt-[3px] pb-0 [font-feature-settings:normal] [font-variation-settings:normal] [text-decoration-color:var(--color-ink-muted)] font-nav-belt-finder [text-size-adjust:100%] [tab-size:4] [-webkit-tap-highlight-color:transparent] focus:outline-none cursor-pointer bg-transparent",
              triggerActive &&
                "!font-medium !text-ink-primary ![text-decoration-color:var(--color-ink-primary)] ![border-bottom-color:var(--color-accent-danger)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)] focus-visible:ring-offset-0",
              !triggerActive &&
                "focus-visible:[border-bottom-color:var(--color-stroke-default)] hover:[border-bottom-color:var(--color-stroke-default)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)] focus-visible:ring-offset-0",
            )}
            aria-current={selfActive ? "page" : undefined}
            aria-haspopup="true"
            aria-expanded={isOpen}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              toggleFlyout();
            }}
          >
            <span>{item.label}</span>
            <span
              className="text-chrome-chevron pointer-events-none inline-flex shrink-0 items-center leading-none [&_svg]:size-[14px]"
              aria-hidden="true"
            >
              {UI_ICONS.chevronDown}
            </span>
          </SitecoreLink>
        ) : (
          <button
            type="button"
            className={cn(
              "inline-flex h-9 items-center box-border whitespace-nowrap text-sm font-normal leading-[21px] text-ink-muted no-underline m-0 border-0 border-b-[3px] border-solid border-transparent px-1 pt-[3px] pb-0 [font-feature-settings:normal] [font-variation-settings:normal] [text-decoration-color:var(--color-ink-muted)] font-nav-belt-finder [text-size-adjust:100%] [tab-size:4] [-webkit-tap-highlight-color:transparent] focus:outline-none cursor-pointer bg-transparent",
              triggerActive &&
                "!font-medium !text-ink-primary ![text-decoration-color:var(--color-ink-primary)] ![border-bottom-color:var(--color-accent-danger)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)] focus-visible:ring-offset-0",
              !triggerActive &&
                "focus-visible:[border-bottom-color:var(--color-stroke-default)] hover:[border-bottom-color:var(--color-stroke-default)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)] focus-visible:ring-offset-0",
            )}
            aria-current={selfActive ? "page" : undefined}
            aria-haspopup="true"
            aria-expanded={isOpen}
            onClick={toggleFlyout}
          >
            <span>{item.label}</span>
            <span
              className="text-chrome-chevron pointer-events-none inline-flex shrink-0 items-center leading-none [&_svg]:size-[14px]"
              aria-hidden="true"
            >
              {UI_ICONS.chevronDown}
            </span>
          </button>
        )}
      </div>
      <Popover
        triggerRef={controlRef}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="bottom start"
        offset={0}
        crossOffset={4}
        isNonModal
        className="pointer-events-auto !z-[999] !m-0 !p-0 w-max max-w-none overflow-hidden rounded-b-lg border-x border-b border-stroke-default !border-t-0 bg-surface shadow-[var(--shadow-local-nav-strip)] [&>div]:!m-0 [&>div]:!border-t-0 [&>div]:!p-0"
      >
        <ul
          ref={panelRef}
          className="!m-0 w-max min-w-full list-none !p-0 [&>li]:!m-0 [&>li]:!p-0 [&>li]:list-none [&_a]:box-border [&_a]:w-full"
          data-slot="local-nav-flyout"
          role="menu"
          aria-label={item.label}
        >
          {flyoutItems}
        </ul>
      </Popover>
    </li>
  );
}

function pathMatchesCurrent(
  pathname: string,
  contentPath: string,
  href: string | undefined,
): boolean {
  const c = normalizeAppPathname(contentPath).toLowerCase();
  const h = hrefToContentPathForMatch(href, pathname).toLowerCase();
  if (h === "/" || h === "") return false;
  return c === h || c.startsWith(`${h}/`);
}

/**
 * Link ids in mobile drawer render order (each row + expanded subtrees) — finds the visually last row.
 */
function collectVisibleMobileSubmenuLinkIds(
  items: LocalNavResolvedItem[],
  pathname: string,
  contentPath: string,
): string[] {
  const ids: string[] = [];
  for (const item of items) {
    ids.push(item.id);
    if (item.children.length > 0) {
      ids.push(
        ...collectVisibleMobileSubmenuLinkIds(
          item.children,
          pathname,
          contentPath,
        ),
      );
    }
  }
  return ids;
}

function getLocalNavPageScrollY(): number {
  if (typeof window === "undefined") {
    return 0;
  }
  const scrollingElement =
    document.scrollingElement ?? document.documentElement;
  return Math.max(
    window.scrollY ?? 0,
    scrollingElement.scrollTop ?? 0,
    document.documentElement.scrollTop ?? 0,
    document.body.scrollTop ?? 0,
  );
}

/**
 * Desktop horizontal strip and mobile collapsible local nav (`'use client'`).
 * Hidden on home or when `ShowSubNavigation` is off; nested secondaries use chevron flyouts on desktop.
 * Active tab uses URL-derived content path and optional route item GUID for sibling matching.
 */
export function LocalNavigationClient({
  isEditing,
  showSubRoute,
  primaries,
  secondaries,
  routeItemGuid,
  styles,
  id,
}: LocalNavigationClientProps): JSX.Element | null {
  const pathname = usePathname() ?? "";
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const { page } = useSitecore();
  const isPreview = Boolean(page.mode.isPreview);

  const routeContext = useMemo(
    () => ({
      site:
        typeof routeParams?.site === "string" ? routeParams.site : undefined,
      locale:
        typeof routeParams?.locale === "string"
          ? routeParams.locale
          : undefined,
      defaultLocale: scConfig.defaultLanguage || "en",
    }),
    [routeParams?.site, routeParams?.locale],
  );

  const contentPath = getContentPathFromAppPathname(pathname, routeContext);
  const isHome = isAppHomePathname(pathname);

  const previewSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  /** Sitecore hrefs are content paths; prefix with `[site]/[locale]` and preserve preview query params. */
  const linkForAppRouter = useCallback(
    (link: LocalNavResolvedItem["link"]): LocalNavResolvedItem["link"] =>
      isEditing
        ? link
        : (resolveLocalNavLinkFieldForAppRouter(link, pathname, {
            routeContext,
            isPreview,
            previewSearchParams: isPreview ? previewSearchParams : undefined,
          }) ?? link),
    [isEditing, isPreview, pathname, previewSearchParams, routeContext],
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFlyoutId, setOpenFlyoutId] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);

  const closeFlyouts = useCallback(() => setOpenFlyoutId(null), []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (stripRef.current?.contains(target)) return;
      if ((target as Element).closest?.('[data-slot="local-nav-flyout"]')) return;
      setOpenFlyoutId(null);
      setMobileOpen(false);
    };
    if (openFlyoutId || mobileOpen) {
      document.addEventListener("mousedown", onDoc, true);
    }
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, [openFlyoutId, mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenFlyoutId(null);
        setMobileOpen(false);
      }
    };
    const onScroll = () => {
      if (window.scrollY > 0) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenFlyoutId(null);
  }, [pathname]);

  /** Below-desktop: close the dropdown panel (strip stays) once the page scrolls. */
  useEffect(() => {
    const closeMobilePanelOnScroll = () => {
      if (typeof window.matchMedia !== "function") {
        return;
      }
      if (!window.matchMedia(MOBILE_MENU_LAYOUT_MEDIA_QUERY).matches) {
        return;
      }
      if (getLocalNavPageScrollY() > 0) {
        setMobileOpen(false);
      }
    };

    const passive = { passive: true } as const;
    window.addEventListener("scroll", closeMobilePanelOnScroll, passive);
    document.addEventListener("scroll", closeMobilePanelOnScroll, passive);
    return () => {
      window.removeEventListener("scroll", closeMobilePanelOnScroll);
      document.removeEventListener("scroll", closeMobilePanelOnScroll);
    };
  }, []);

  const hasPrimaries = primaries.length > 0;
  const hasSecondaries = secondaries.length > 0;
  const routePathMatchesLocalNav = useMemo(() => {
    const matchesItem = (item: LocalNavResolvedItem): boolean => {
      const base = hrefToContentPathForMatch(getLinkFieldHref(item.link), pathname);
      if (contentPathUnderBase(contentPath, base)) {
        return true;
      }
      return item.children.some((child) => matchesItem(child));
    };

    return primaries.some((item) => matchesItem(item)) || secondaries.some((item) => matchesItem(item));
  }, [contentPath, pathname, primaries, secondaries]);
  const activePrimaryIdx = findActivePrimaryIndex(
    contentPath,
    pathname,
    primaries,
  );
  const primaryItem =
    activePrimaryIdx >= 0
      ? primaries[activePrimaryIdx]
      : hasPrimaries
        ? primaries[0]
        : undefined;

  const mobileSubmenuLastLinkId = useMemo(() => {
    const ids = collectVisibleMobileSubmenuLinkIds(
      secondaries,
      pathname,
      contentPath,
    );
    return ids.length > 0 ? ids[ids.length - 1] : undefined;
  }, [secondaries, pathname, contentPath]);

  /** One “current” tab per sibling group — use URL-derived `contentPath` (not Sitecore `itemPath`). */
  const desktopStripActiveSibling = useMemo(
    () =>
      localNavSiblingActiveItem(
        contentPath,
        pathname,
        secondaries,
        routeItemGuid,
      ),
    [contentPath, pathname, secondaries, routeItemGuid],
  );

  /** Primary section link matches the active sibling (e.g. Overview) or exact section URL — mirrors secondary Overview styling. */
  const primaryOverviewIsCurrent = useMemo(() => {
    if (!primaryItem) return false;
    return localNavPrimaryOverviewIsCurrent(
      contentPath,
      pathname,
      primaryItem,
      secondaries,
      routeItemGuid,
    );
  }, [contentPath, pathname, primaryItem, secondaries, routeItemGuid]);

  const shouldShowSubRoute =
    showSubRoute || routePathMatchesLocalNav || hasPrimaries || hasSecondaries;
  const hideChrome = !isEditing && (!shouldShowSubRoute || isHome);

  if (hideChrome) {
    return null;
  }

  if (!hasPrimaries && !hasSecondaries && !isEditing) {
    return null;
  }

  /** Same section title as desktop strip primary (`primaryItem`), not the current secondary page label. */
  const mobileTabletStripTitle =
    primaryItem?.label ?? LOCAL_NAV_LABELS.mobileMenuFallback;
  const mobilePanelId = `${id ?? "local-nav"}-mobile-panel`;

  const renderNestedMobile = (
    items: LocalNavResolvedItem[],
    depth: number,
    lastLinkId: string | undefined,
  ): JSX.Element => {
    const levelActive = localNavSiblingActiveItem(
      contentPath,
      pathname,
      items,
      routeItemGuid,
    );
    return (
      <ul
        className="m-0 list-none border-0 p-0 !m-0 !mt-0 !mb-0 !ml-0 !p-0 !py-0"
        role="list"
      >
        {items.map((item) => {
          const active = levelActive?.id === item.id;
          const isLastVisibleRow = mobileSubmenuRowIsLastVisible(
            item.id,
            lastLinkId,
          );
          return (
            <li
              key={item.id}
              className={cn(
                "m-0 list-none !m-0 !mt-0 !mb-0 !ml-0",
                isLastVisibleRow && "overflow-hidden rounded-b-lg",
              )}
              role="listitem"
              {...(isLastVisibleRow ? { "data-slot": "submenu-last" } : {})}
            >
              <SitecoreLink
                field={linkForAppRouter(item.link)}
                editable={isEditing}
                target={NAV_SAME_TAB_TARGET}
                rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                className={cn(
                  "box-border m-0 block w-full text-left text-sm font-normal leading-[21px] no-underline antialiased border-0 border-b border-solid border-stroke-default py-2 pr-4 [text-decoration-line:none] [text-decoration-style:solid] [text-decoration-thickness:auto] touch-manipulation [-webkit-tap-highlight-color:transparent] cursor-pointer font-nav-belt-finder [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)]",
                  isLastVisibleRow
                    ? "h-[37px] border-b-0 rounded-b-lg"
                    : "h-[38px]",
                  depth === 0 ? "pl-8" : "pl-12",
                  active
                    ? "bg-[var(--color-neutral-200)] font-medium font-nav-belt-finder list-none [list-style-image:none] [list-style-position:inside] text-[var(--color-surface-strong)] [text-decoration-color:var(--color-surface-strong)]"
                    : "bg-transparent text-ink-muted [text-decoration-color:var(--color-ink-muted)]",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </SitecoreLink>
              {item.children.length > 0 && (
                <div className="m-0 p-0">
                  {renderNestedMobile(item.children, depth + 1, lastLinkId)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  /** Desktop nested flyout rows — sibling best-match avoids prefix Overview rows active on deeper pages. */
  const renderIndustryChildItems = (
    parent: LocalNavResolvedItem,
  ): JSX.Element[] => {
    const bestAmongChildren = localNavSiblingActiveItem(
      contentPath,
      pathname,
      parent.children,
      routeItemGuid,
    );
    return parent.children.map((child, childIndex) => {
      const cActive = bestAmongChildren?.id === child.id;
      const hasNested = child.children.length > 0;
      const isLastChild = childIndex === parent.children.length - 1;
      const bestAmongQuaternary =
        hasNested
          ? localNavSiblingActiveItem(
              contentPath,
              pathname,
              child.children,
              routeItemGuid,
            )
          : null;
      return (
        <li key={child.id} role="none">
          <SitecoreLink
            field={linkForAppRouter(child.link)}
            editable={isEditing}
            target={NAV_SAME_TAB_TARGET}
            rel={getLinkRel(NAV_SAME_TAB_TARGET)}
            className={cn(
              "box-border !m-0 block h-[38px] w-full cursor-pointer touch-manipulation whitespace-nowrap border-0 border-b border-solid border-stroke-default px-2 py-2 text-left text-sm font-normal leading-[21px] text-ink-muted no-underline antialiased font-nav-belt-finder [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [text-decoration-color:var(--color-ink-muted)] [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)]",
              cActive && "font-bold text-ink-primary [text-decoration-color:var(--color-ink-primary)]",
              isLastChild && !hasNested && "border-b-0 rounded-b-lg",
            )}
            aria-current={cActive ? "page" : undefined}
            onClick={() => closeFlyouts()}
          >
            {child.label}
          </SitecoreLink>
          {hasNested && (
            <ul
              className="m-0 list-none border-0 bg-surface p-0 [&>li]:!m-0 [&>li]:!p-0 [&>li]:list-none [&_a]:box-border [&_a]:w-full"
              role="list"
            >
              {child.children.map((q, qIndex) => {
                const qActive = bestAmongQuaternary?.id === q.id;
                const isLastQuaternary = qIndex === child.children.length - 1;
                return (
                  <li key={q.id} role="listitem">
                    <SitecoreLink
                      field={linkForAppRouter(q.link)}
                      editable={isEditing}
                      target={NAV_SAME_TAB_TARGET}
                      rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                      className={cn(
                        "box-border !m-0 block h-[38px] w-full cursor-pointer touch-manipulation whitespace-nowrap border-0 border-b border-solid border-stroke-default px-2 py-2 text-left text-sm font-normal leading-[21px] text-ink-muted no-underline antialiased font-nav-belt-finder [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [text-decoration-color:var(--color-ink-muted)] [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)]",
                        qActive &&
                          "font-bold text-ink-primary [text-decoration-color:var(--color-ink-primary)]",
                        isLastChild && isLastQuaternary && "border-b-0 rounded-b-lg",
                      )}
                      aria-current={qActive ? "page" : undefined}
                      onClick={() => closeFlyouts()}
                    >
                      {q.label}
                    </SitecoreLink>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    });
  };

  const renderDesktopSecondary = (item: LocalNavResolvedItem): JSX.Element => {
    const hasChildren = item.children.length > 0;
    const useDropdown = hasChildren;
    const isOpen = openFlyoutId === item.id;

    /** Flat strip: only the most specific matching sibling tab is selected (Overview on section URL, not on child URLs). */
    if (!useDropdown) {
      const selected = desktopStripActiveSibling?.id === item.id;
      return (
        <li
          key={item.id}
          className="relative m-0 flex h-9 list-none items-center pl-2 pr-0 pt-0 pb-0 [unicode-bidi:isolate]"
          role="listitem"
        >
          <SitecoreLink
            field={linkForAppRouter(item.link)}
            editable={isEditing}
            target={NAV_SAME_TAB_TARGET}
            rel={getLinkRel(NAV_SAME_TAB_TARGET)}
            className={cn(
              "inline-flex h-9 items-center box-border whitespace-nowrap text-sm font-normal leading-[21px] text-ink-muted no-underline m-0 border-0 border-b-[3px] border-solid border-transparent px-1 pt-[3px] pb-0 [font-feature-settings:normal] [font-variation-settings:normal] [text-decoration-color:var(--color-ink-muted)] font-nav-belt-finder [text-size-adjust:100%] [tab-size:4] [-webkit-tap-highlight-color:transparent] focus:outline-none",
              selected &&
                "!font-medium !text-ink-primary ![text-decoration-color:var(--color-ink-primary)] ![border-bottom-color:var(--color-accent-danger)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)] focus-visible:ring-offset-0",
              !selected &&
                "focus-visible:[border-bottom-color:var(--color-stroke-default)] hover:[border-bottom-color:var(--color-stroke-default)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)] focus-visible:ring-offset-0",
            )}
            aria-current={selected ? "page" : undefined}
          >
            {item.label}
          </SitecoreLink>
        </li>
      );
    }

    const selfActive = pathMatchesCurrent(
      pathname,
      contentPath,
      getLinkFieldHref(item.link),
    );
    const branchActive = resolvedItemOrDescendantActive(
      contentPath,
      pathname,
      item,
    );

    return (
      <LocalNavDesktopDropdownItem
        key={item.id}
        item={item}
        isOpen={isOpen}
        isEditing={isEditing}
        selfActive={selfActive}
        branchActive={branchActive}
        linkForAppRouter={linkForAppRouter}
        onOpenChange={(open) => {
          setOpenFlyoutId(open ? item.id : null);
        }}
        flyoutItems={renderIndustryChildItems(item)}
      />
    );
  };

  return (
    <div
      className={cn(
        "component local-navigation relative isolate box-border w-full border-b border-stroke-default !m-0 !p-0 bg-surface-subtle desktop:overflow-visible text-base leading-6 text-ink-primary antialiased font-nav-belt-finder [-webkit-tap-highlight-color:transparent] [text-size-adjust:100%] [tab-size:4] [unicode-bidi:isolate] shadow",
        styles,
      )}
      id={id}
    >
      <div className="component-content relative z-10 !m-0 !p-0 box-border overflow-visible">
        {!hasPrimaries && !hasSecondaries && isEditing && (
          <div className="py-2 px-3 desktop:px-4">
            <span className="is-empty-hint">Local navigation</span>
          </div>
        )}

        <div
          ref={stripRef}
          className="box-border ml-0 mr-auto w-full min-w-0 max-w-[1440px]"
          data-slot="navigation-inner"
        >
          <nav
            className="w-full [&_ul]:!m-0 [&_ul]:!mt-0 [&_ul]:!mb-0 [&_ul]:!ml-0 [&_ul]:!py-0 [&_ul>li]:!m-0 [&_ul>li]:!mt-0 [&_ul>li]:!mb-0 [&_ul>li]:!ml-0"
            aria-label={LOCAL_NAV_LABELS.navAria}
          >
            <div className="relative hidden desktop:flex h-9 min-h-9 max-h-9 flex-row flex-nowrap items-center gap-0 box-border overflow-visible bg-surface-subtle px-4">
              {primaryItem && (
                <SitecoreLink
                  field={linkForAppRouter(primaryItem.link)}
                  editable={isEditing}
                  target={NAV_SAME_TAB_TARGET}
                  rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                  className={cn(
                    "relative mr-2 block h-9 shrink-0 box-border border-y-0 border-l-0 border-r border-solid border-stroke-default py-2 pl-0 pr-4 font-bold leading-5 text-ink-primary no-underline",
                    "rounded-[2px]",
                    "font-nav-belt-finder [text-size-adjust:100%] [tab-size:4] [-webkit-tap-highlight-color:transparent]",
                    "focus:outline-none",
                    "focus-visible:border-x-2 focus-visible:border-y-0 focus-visible:border-solid",
                    "focus-visible:[border-left-color:var(--color-focus-interactive)]",
                    "focus-visible:[border-right-color:var(--color-focus-interactive)]",
                    primaryOverviewIsCurrent &&
                      "!font-medium !text-ink-primary ![text-decoration-color:var(--color-ink-primary)] ![border-bottom-color:var(--color-accent-danger)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)] focus-visible:ring-offset-0",
                  )}
                  aria-current={
                    primaryOverviewIsCurrent && secondaries.length === 0
                      ? "page"
                      : undefined
                  }
                >
                  {primaryItem.label}
                </SitecoreLink>
              )}

              {hasSecondaries && (
                <div className="flex h-9 min-h-0 min-w-0 flex-1 items-center overflow-x-auto desktop:overflow-visible pl-0">
                  <ul
                    className="m-0 flex h-9 min-h-0 min-w-0 flex-1 list-none flex-nowrap items-center gap-x-0 gap-y-0 overflow-visible p-0 !m-0 !mt-0 !mb-0 !ml-0 !p-0 !py-0"
                    role="list"
                  >
                    {secondaries.map((s) => renderDesktopSecondary(s))}
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile + tablet: strip + open panel each use `--shadow-header-navigation-mobile` (same stack as main header row under 992px). */}
            <div className="desktop:hidden relative m-0 flex w-full flex-col box-border p-0">
              <div
                className={cn(
                  "relative w-full",
                  mobileOpen ? "shadow z-[21]" : "z-[1]",
                )}
              >
                {hasSecondaries ? (
                  <button
                    type="button"
                    className={cn(
                      "box-border m-0 h-9 max-w-full py-2 px-4 block w-fit rounded-none text-center normal-case text-base leading-5 font-bold text-ink-primary not-italic bg-transparent opacity-100 border-0 border-solid border-stroke-default font-nav-belt-finder [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [font-kerning:auto] [font-optical-sizing:auto] [tab-size:4] [text-indent:0] [text-shadow:none] [letter-spacing:normal] [word-spacing:normal] [-webkit-tap-highlight-color:transparent] touch-manipulation cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-nav-mobile)] focus-visible:ring-offset-0",
                      primaryOverviewIsCurrent && "bg-surface-muted-light",
                    )}
                    aria-expanded={mobileOpen}
                    aria-controls={mobilePanelId}
                    aria-label={
                      mobileOpen
                        ? LOCAL_NAV_LABELS.mobileToggleClose
                        : LOCAL_NAV_LABELS.mobileToggleOpen
                    }
                    onClick={() => setMobileOpen((o) => !o)}
                  >
                    <span className="inline-flex max-w-full min-w-0 items-center justify-center">
                      <span className="min-w-0 truncate">
                        {mobileTabletStripTitle}
                      </span>
                      <span
                        className="shrink-0 text-ink-primary inline-flex [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0"
                        aria-hidden="true"
                      >
                        {UI_ICONS.chevronDown}
                      </span>
                    </span>
                  </button>
                ) : (
                  primaryItem && (
                    <SitecoreLink
                      field={linkForAppRouter(primaryItem.link)}
                      editable={isEditing}
                      target={NAV_SAME_TAB_TARGET}
                      rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                      className={cn(
                        "box-border m-0 h-9 max-w-full py-2 px-4 block w-fit rounded-none text-center normal-case text-base leading-5 font-bold text-ink-primary not-italic bg-transparent opacity-100 border-0 border-solid border-stroke-default font-nav-belt-finder [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [font-kerning:auto] [font-optical-sizing:auto] [tab-size:4] [text-indent:0] [text-shadow:none] [letter-spacing:normal] [word-spacing:normal] [-webkit-tap-highlight-color:transparent] touch-manipulation cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-nav-mobile)] focus-visible:ring-offset-0",
                        "no-underline cursor-pointer",
                        primaryOverviewIsCurrent && "bg-surface-muted-light",
                      )}
                      aria-current={
                        primaryOverviewIsCurrent ? "page" : undefined
                      }
                    >
                      {primaryItem.label}
                    </SitecoreLink>
                  )
                )}
              </div>

              {mobileOpen && hasSecondaries && (
                <div
                  id={mobilePanelId}
                  className="absolute top-full left-0 right-0 z-20 overflow-hidden border border-t-0 border-stroke-default bg-surface rounded-t-none rounded-b-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.05)]"
                  data-slot="mobile-panel"
                >
                  {primaryItem && (
                    <SitecoreLink
                      field={linkForAppRouter(primaryItem.link)}
                      editable={isEditing}
                      target={NAV_SAME_TAB_TARGET}
                      rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                      className={cn(
                        "box-border m-0 flex h-[35px] w-full max-w-full min-w-0 items-center gap-0 px-4 py-2 border-0 border-b border-solid border-stroke-default text-[12px] leading-[18px] font-bold uppercase text-black [letter-spacing:0.3px] [tab-size:4] [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] font-nav-belt-finder no-underline [text-decoration-line:none] [text-decoration-color:rgb(0,0,0)] [text-decoration-style:solid] cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-stroke-default)]",
                        primaryOverviewIsCurrent &&
                          "bg-[var(--color-neutral-200)] font-medium font-nav-belt-finder list-none [list-style-image:none] [list-style-position:inside] text-[var(--color-surface-strong)] [text-decoration-color:var(--color-surface-strong)]",
                        primaryOverviewIsCurrent && "!font-medium",
                      )}
                      aria-current={
                        primaryOverviewIsCurrent && secondaries.length === 0
                          ? "page"
                          : undefined
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      {primaryItem.label}
                      <span
                        className="inline-flex mt-[-1px] shrink-0 items-center justify-center box-border m-0 size-[14px] border-0 p-0 translate-y-px [letter-spacing:0] uppercase text-black antialiased [font-feature-settings:normal] [font-variation-settings:normal] [text-rendering:auto] [-webkit-font-smoothing:antialiased] cursor-pointer [&_i]:m-0 [&_i]:inline-block [&_i]:border-0 [&_i]:p-0 [&_i]:text-[14px] [&_i]:leading-none [&_i]:font-normal [&_svg]:m-0 [&_svg]:inline-block [&_svg]:size-[12px] [&_svg]:shrink-0"
                        aria-hidden="true"
                      >
                        {UI_ICONS.localNavMobilePrimaryRowChevron}
                      </span>
                    </SitecoreLink>
                  )}
                  {renderNestedMobile(secondaries, 0, mobileSubmenuLastLinkId)}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
