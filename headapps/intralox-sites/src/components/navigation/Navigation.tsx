"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  JSX,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import {
  isAppHomePathname,
  mainNavItemMatchesCurrentPath,
  routeShowsSubNavigation,
} from "components/local-navigation/localNavigationUtils";

import type { NavigationFields, NavigationProps } from "./Navigation.type";
import {
  MOBILE_MENU_LAYOUT_MEDIA_QUERY,
  NAV_LABELS,
  SIMPLE_LAYOUT_OVERRIDES,
  getLogoHomeHref,
  isLogoOnHomePage,
  getNavItemTitle,
  resolveChildLinksForHeaderDisplay,
  filterMainNavItemsForHeaderDisplay,
  getPageContentLanguage,
  firstNonEmptyTextField,
  getLanguagesFromTopBar,
  getTopNavLinksFromTopBar,
  resolveNavigationFields,
} from "./navigationUtils";
import { HEADER_ICON_DEFAULTS } from "./partial/NavigationIcons";
import { HeaderLogo } from "./partial/NavigationDesktopPartials";
import { NavMainNavItem } from "./partial/NavMainNavItem";
import {
  DesktopSearch,
  MobileControls,
} from "./partial/NavigationSearchPartials";
import { MobileOverlay } from "./partial/NavigationMobilePartials";
import { UtilityBar } from "./partial/UtilityBar";
import { cn } from "lib/utils";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";

/** Sitecore layout context path for the active route — aligns mega-menu “current” with derived local nav. */
function readSitecoreItemPathFromPage(
  page: NavigationProps["page"],
): string | undefined {
  const ctx = page.layout?.sitecore?.context;
  if (!ctx || typeof ctx !== "object" || !("itemPath" in ctx)) return undefined;
  const raw = (ctx as { itemPath?: unknown }).itemPath;
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

/** Route item id — matches General Link `id` on nav rows when URL/path and CMS itemPath disagree. */
function readRouteItemGuidFromPage(
  page: NavigationProps["page"],
): string | undefined {
  const route = page.layout?.sitecore?.route;
  if (!route || typeof route !== "object" || !("itemId" in route))
    return undefined;
  const raw = (route as { itemId?: unknown }).itemId;
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

/** Site navigation: utility bar, logo, mega-menu, search, and mobile overlay. */
export const Default = ({
  fields,
  params,
  page,
}: NavigationProps): JSX.Element => {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const pathname = usePathname() ?? "";
  const sitecoreItemPath = readSitecoreItemPathFromPage(page);
  const routeItemGuid = readRouteItemGuidFromPage(page);
  const homeHref = getLogoHomeHref();
  const isHomePage = isLogoOnHomePage(pathname);

  const {
    TopBar,
    ShowTopBar,
    Logo,
    MainNavigationLinks,
    SearchPage,
    SearchIconCssClass,
    IconCssClass,
    SearchBoxPlaceholder,
  } = resolveNavigationFields(fields ?? {}) as NavigationFields;

  /** Footer uses `IconCssClass`; header may use `SearchIconCssClass` — try both, then hardcoded default. */
  const searchIconCssClass =
    firstNonEmptyTextField(SearchIconCssClass, IconCssClass) ||
    HEADER_ICON_DEFAULTS.search;

  const showTopBar = ShowTopBar?.value !== false;
  const topNavLinks = getTopNavLinksFromTopBar(TopBar);
  const languages = getLanguagesFromTopBar(TopBar);
  const languageTitle =
    TopBar?.fields?.LanguageTitle?.value?.toString() ||
    NAV_LABELS.languageFallback;
  const searchLabel =
    SearchBoxPlaceholder?.value?.toString() || NAV_LABELS.searchFallback;

  const visibleNavItems =
    filterMainNavItemsForHeaderDisplay(MainNavigationLinks);

  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  /** When the hamburger opens after the user has scrolled, slide sticky chrome away; at scrollY 0 keep the header visible. */
  const [
    concealStickyChromeForMobileMenu,
    setConcealStickyChromeForMobileMenu,
  ] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) setSearchQuery("");
      return !prev;
    });
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
  }, []);

  const handleToggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => {
      const opening = !prev;
      if (opening) {
        setConcealStickyChromeForMobileMenu(window.scrollY > 0);
      }
      return opening;
    });
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    const href = SearchPage?.value?.href || "/search";
    window.location.href = `${href}?q=${encodeURIComponent(trimmed)}`;
  }, [searchQuery, SearchPage]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setActiveMegaMenu(null);
      setIsMobileMenuOpen(false);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setActiveMegaMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setConcealStickyChromeForMobileMenu(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.dataset.navMobileMenuOpen = "true";
      if (concealStickyChromeForMobileMenu) {
        document.body.dataset.navMobileMenuConcealChrome = "true";
      } else {
        delete document.body.dataset.navMobileMenuConcealChrome;
      }
    } else {
      delete document.body.dataset.navMobileMenuOpen;
      delete document.body.dataset.navMobileMenuConcealChrome;
    }
    return () => {
      delete document.body.dataset.navMobileMenuOpen;
      delete document.body.dataset.navMobileMenuConcealChrome;
    };
  }, [isMobileMenuOpen, concealStickyChromeForMobileMenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const pageWrap = document.getElementById("page-wrap");
    const previousBodyOverflow = document.body.style.overflow;
    /** Must match drawer push distance used on `#page-wrap` (see Layout.tsx transition on `#page-wrap`). */
    const pushOffset = "min(85vw, 300px)";

    const syncMobileMenuLayout = () => {
      const isNarrow = window.matchMedia(
        MOBILE_MENU_LAYOUT_MEDIA_QUERY,
      ).matches;
      if (isNarrow) {
        document.body.style.overflow = "hidden";
        if (pageWrap) {
          pageWrap.style.transform = `translateX(calc(-1 * ${pushOffset}))`;
        }
      } else {
        document.body.style.overflow = previousBodyOverflow;
        if (pageWrap) {
          pageWrap.style.transform = "";
        }
      }
    };

    syncMobileMenuLayout();

    const mediaQuery = window.matchMedia(MOBILE_MENU_LAYOUT_MEDIA_QUERY);
    mediaQuery.addEventListener("change", syncMobileMenuLayout);

    return () => {
      mediaQuery.removeEventListener("change", syncMobileMenuLayout);
      document.body.style.overflow = previousBodyOverflow;
      if (pageWrap) {
        pageWrap.style.transform = "";
      }
    };
  }, [isMobileMenuOpen]);

  /** Reserve layout space under fixed `#layout-sticky-chrome` (header + local nav) for `main` via `--headerTop`. */
  useLayoutEffect(() => {
    const syncLayoutChromeOffset = () => {
      const narrow = window.matchMedia(MOBILE_MENU_LAYOUT_MEDIA_QUERY).matches;
      if (isMobileMenuOpen && narrow && concealStickyChromeForMobileMenu) {
        document.documentElement.style.setProperty("--headerTop", "0px");
        return;
      }
      const chrome = document.getElementById("layout-sticky-chrome");
      if (chrome) {
        const { height } = chrome.getBoundingClientRect();
        document.documentElement.style.setProperty(
          "--headerTop",
          `${Math.max(0, Math.round(height))}px`,
        );
      }
    };

    syncLayoutChromeOffset();
    window.addEventListener("resize", syncLayoutChromeOffset);

    const chrome = document.getElementById("layout-sticky-chrome");
    const ro =
      chrome && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            syncLayoutChromeOffset();
          })
        : null;
    if (chrome && ro) {
      ro.observe(chrome);
    }

    return () => {
      window.removeEventListener("resize", syncLayoutChromeOffset);
      ro?.disconnect();
    };
  }, [pathname, isMobileMenuOpen, concealStickyChromeForMobileMenu]);

  if (!fields) {
    return (
      <div
        className={cn(
          "component navigation header-navigation m-0! p-0! [&>.component-content]:m-0! [&>.component-content]:p-0! motion-reduce:[&_*]:!duration-[0.01ms] motion-reduce:[&_*]:!animate-duration-[0.01ms] motion-reduce:[&_*::before]:!duration-[0.01ms] motion-reduce:[&_*::after]:!duration-[0.01ms]",
          styles,
        )}
        {...anchorId}
      >
        <div className="component-content">
          <span className="is-empty-hint">
            {NAV_LABELS.navigationEmptyHint}
          </span>
        </div>
      </div>
    );
  }

  const logoAriaLabel =
    (Logo?.value?.alt as string) || NAV_LABELS.logoAriaLabel;

  /** Same gate as local navigation chrome: sub-nav may show (editing, or `ShowSubNavigation` + non-home). */
  const routeFields = page.layout?.sitecore?.route?.fields;
  const showSubRoute = routeShowsSubNavigation(routeFields);
  const localNavStripContext =
    isEditing || (showSubRoute && !isAppHomePathname(pathname));

  return (
    <div
      className={cn(
        "component navigation header-navigation m-0! p-0! [&>.component-content]:m-0! [&>.component-content]:p-0! motion-reduce:[&_*]:!duration-[0.01ms] motion-reduce:[&_*]:!animate-duration-[0.01ms] motion-reduce:[&_*::before]:!duration-[0.01ms] motion-reduce:[&_*::after]:!duration-[0.01ms]",
        styles,
      )}
      {...anchorId}
      ref={headerRef}
    >
      <div className="component-content">
        {showTopBar &&
          (!!topNavLinks.length || !!languages.length || isEditing) && (
            <UtilityBar
              topNavLinks={topNavLinks}
              languages={languages}
              languageTitle={languageTitle}
              topBar={TopBar}
              isEditing={isEditing}
              pageContentLanguage={getPageContentLanguage(page)}
            />
          )}

        <div className="bg-surface w-full relative z-[22] shadow">
          <div className="w-full flex items-stretch relative z-10 h-12 tablet-up:h-[72px]">
            <HeaderLogo
              logo={Logo}
              logoAriaLabel={logoAriaLabel}
              isEditing={isEditing}
              isHomePage={isHomePage}
              homeHref={homeHref}
            />

            {!isSearchOpen && (
              <nav
                className="hidden desktop:flex flex-1 min-h-0 min-w-0 items-stretch self-stretch py-0 h-12 min-[768px]:h-[72px]"
                aria-label={NAV_LABELS.mainNavigation}
              >
                <ul
                  className="m-0 flex w-full min-w-0 list-none items-stretch justify-center p-0 py-0! pt-0! pb-0! mt-0! mb-0! h-12 min-[768px]:h-[72px]"
                  role="menubar"
                >
                  {visibleNavItems
                    ?.filter((item) => item?.fields)
                    .map((item) => {
                      const childLinks = resolveChildLinksForHeaderDisplay(
                        item.fields?.ChildLinks,
                      );
                      const title = getNavItemTitle(item);
                      const forceSimple = SIMPLE_LAYOUT_OVERRIDES.has(
                        title.toLowerCase(),
                      );
                      const hasComplexLayout =
                        !forceSimple &&
                        childLinks.some((child) => {
                          const resolved = resolveChildLinksForHeaderDisplay(
                            child.fields?.ChildLinks,
                          );
                          return resolved.length > 0;
                        });
                      const hasFeatured = !!(
                        (item.fields?.Heading?.value &&
                          String(item.fields.Heading.value).trim()) ||
                        (item.fields?.Description?.value &&
                          String(item.fields.Description.value).trim()) ||
                        item.fields?.Image?.value?.src
                      );
                      const hasDropdown = childLinks.length > 0 || hasFeatured;
                      const isMenuOpen = activeMegaMenu === item.id;
                      const isRouteActive = mainNavItemMatchesCurrentPath(
                        pathname,
                        item,
                      );
                      /** Inset bars + language row: mega open, or route match without sub-nav strip (deep page). */
                      const fullMainNavSelection =
                        isMenuOpen || (isRouteActive && !localNavStripContext);
                      /** Sub-nav strip context: show hover-style row for current section, not inset bars, until mega opens. */
                      const routeSoftHighlight =
                        isRouteActive && localNavStripContext && !isMenuOpen;

                      return (
                        <NavMainNavItem
                          key={item.id}
                          item={item}
                          isEditing={isEditing}
                          pathname={pathname}
                          sitecoreItemPath={sitecoreItemPath}
                          routeItemGuid={routeItemGuid}
                          hasComplexLayout={hasComplexLayout}
                          hasDropdown={hasDropdown}
                          isMenuOpen={isMenuOpen}
                          fullMainNavSelection={fullMainNavSelection}
                          routeSoftHighlight={routeSoftHighlight}
                          isRouteActive={isRouteActive}
                          onMenuOpenChange={(open) => {
                            setActiveMegaMenu(open ? item.id : null);
                          }}
                        />
                      );
                    })}
                </ul>
              </nav>
            )}

            <DesktopSearch
              searchBoxPlaceholderField={SearchBoxPlaceholder}
              searchIconCssClass={searchIconCssClass}
              searchLabel={searchLabel}
              isEditing={isEditing}
              isSearchOpen={isSearchOpen}
              searchQuery={searchQuery}
              onToggleSearch={toggleSearch}
              onSearchQueryChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
            />

            <MobileControls
              searchBoxPlaceholderField={SearchBoxPlaceholder}
              searchIconCssClass={searchIconCssClass}
              searchLabel={searchLabel}
              isMobileMenuOpen={isMobileMenuOpen}
              isMobileSearchOpen={isSearchOpen}
              searchQuery={searchQuery}
              isEditing={isEditing}
              onToggleMobileMenu={handleToggleMobileMenu}
              onToggleMobileSearch={toggleSearch}
              onSearchQueryChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>
        </div>
      </div>

      {isMounted &&
        createPortal(
          <MobileOverlay
            isOpen={isMobileMenuOpen}
            visibleNavItems={visibleNavItems}
            topNavLinks={topNavLinks}
            isEditing={isEditing}
            pathname={pathname}
            sitecoreItemPath={sitecoreItemPath}
            routeItemGuid={routeItemGuid}
            onClose={() => setIsMobileMenuOpen(false)}
          />,
          document.body,
        )}
    </div>
  );
};
