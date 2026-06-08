"use client";

import type { KeyboardEvent } from "react";
import {
  JSX,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  Link as SitecoreLink,
  useSitecore,
} from "@sitecore-content-sdk/nextjs";
import { cn } from "lib/utils";

import type {
  LanguageItem,
  TopBarFields,
  TopNavLinkItem,
} from "../Navigation.type";
import {
  EMPTY_LINK,
  getFieldsTextByKey,
  getLinkRel,
  getLinkText,
  getLanguageDisplayLabel,
  getPageContentLanguage,
  getTopNavLinkFieldFromItem,
  firstNonEmptyTextField,
  isQuoteUtilityBarLink,
  NAV_LABELS,
  NAV_SAME_TAB_TARGET,
  resolveActiveLanguageId,
} from "../navigationUtils";
import { FaIconFromCms, HEADER_ICON_DEFAULTS } from "./NavigationIcons";
import {
  CHROME_ICON_SIZE_UTILITY_STRIP,
  ICON_CHEVRON_DOWN_14PX,
} from "lib/chrome-icons";

interface UtilityBarProps {
  topNavLinks: TopNavLinkItem[];
  languages: LanguageItem[];
  languageTitle: string;
  topBar?: TopBarFields;
  isEditing: boolean;
  /**
   * Sitecore content language (`page.language`, `page.locale`, or `layout.sitecore.route.itemLanguage`)
   * for matching each row’s `LanguageSource.name`.
   */
  pageContentLanguage?: string;
}

const LANGUAGE_LISTBOX_ID = "language-switcher-listbox";

/** `div` (not `ul`/`li`) avoids global `base.scss` list margins / `list-item` layout that inset rows from the panel edge. */
/** Row separators use per-option `border-b` — `divide-y` is ineffective here because options use `border-0` (resets all sides). */

/** Top utility bar: Sitecore quick links and language switcher. */
export const UtilityBar = ({
  topNavLinks,
  languages,
  languageTitle,
  topBar,
  isEditing,
  pageContentLanguage,
}: UtilityBarProps): JSX.Element => {
  const { page: sitecorePage } = useSitecore();
  const params = useParams();
  const routeLocale =
    typeof params?.locale === "string" ? params.locale : undefined;
  const languageFromProvider = useMemo(
    () => getPageContentLanguage(sitecorePage),
    [sitecorePage],
  );
  const activeLocale =
    pageContentLanguage?.trim() || languageFromProvider?.trim() || routeLocale;

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const languageOptionRefs = useRef<Record<string, HTMLButtonElement | null>>(
    {},
  );
  const pendingListFocusRef = useRef<"first" | "last" | "selected" | null>(
    null,
  );

  const sortedLanguages = useMemo(
    () => languages.filter((lang) => lang?.fields),
    [languages],
  );

  const activeLanguageId = useMemo(
    () => resolveActiveLanguageId(activeLocale, sortedLanguages),
    [activeLocale, sortedLanguages],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (sortedLanguages.length === 0) return;
    console.debug("[intralox language switcher]", {
      activeLocale: activeLocale ?? null,
      resolvedRowId: activeLanguageId ?? null,
      pageContentLanguageProp: pageContentLanguage ?? null,
      languageFromProvider: languageFromProvider ?? null,
      routeLocale: routeLocale ?? null,
      languageSourceByRow: sortedLanguages.map((l) => ({
        listItemId: l.id,
        sourceName: l.fields?.LanguageSource?.name ?? null,
        sourceDisplayName: l.fields?.LanguageSource?.displayName ?? null,
      })),
    });
  }, [
    activeLanguageId,
    activeLocale,
    languageFromProvider,
    pageContentLanguage,
    routeLocale,
    sortedLanguages,
  ]);

  /** Top Bar language row that matches the active page locale (dropdown selection + optional focus target). */
  const activeLanguageItem = useMemo(
    () => sortedLanguages.find((l) => l.id === activeLanguageId),
    [sortedLanguages, activeLanguageId],
  );

  const languageControlLabel =
    languageTitle.trim() || NAV_LABELS.languageFallback;

  const currentLocaleMenuLabel = activeLanguageItem
    ? getLanguageDisplayLabel(activeLanguageItem)
    : "";

  const focusLanguageOptionById = useCallback((id: string) => {
    requestAnimationFrame(() => {
      languageOptionRefs.current[id]?.focus();
    });
  }, []);

  const focusLanguageTrigger = useCallback(() => {
    requestAnimationFrame(() => {
      languageTriggerRef.current?.focus();
    });
  }, []);

  const handleLanguageTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (sortedLanguages.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isLanguageOpen) {
          pendingListFocusRef.current = activeLanguageItem
            ? "selected"
            : "first";
          setIsLanguageOpen(true);
          return;
        }
        const firstId = sortedLanguages[0]?.id;
        if (firstId) focusLanguageOptionById(firstId);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isLanguageOpen) {
          pendingListFocusRef.current = activeLanguageItem
            ? "selected"
            : "last";
          setIsLanguageOpen(true);
          return;
        }
        const lastId = sortedLanguages[sortedLanguages.length - 1]?.id;
        if (lastId) focusLanguageOptionById(lastId);
        return;
      }

      if (e.key === "Escape" && isLanguageOpen) {
        e.preventDefault();
        setIsLanguageOpen(false);
      }
    },
    [
      activeLanguageItem,
      focusLanguageOptionById,
      isLanguageOpen,
      sortedLanguages,
    ],
  );

  const handleLanguageOptionKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = sortedLanguages[index + 1];
        if (next) focusLanguageOptionById(next.id);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (index <= 0) {
          focusLanguageTrigger();
          return;
        }
        const prev = sortedLanguages[index - 1];
        if (prev) focusLanguageOptionById(prev.id);
        return;
      }

      if (e.key === "Home") {
        e.preventDefault();
        const firstId = sortedLanguages[0]?.id;
        if (firstId) focusLanguageOptionById(firstId);
        return;
      }

      if (e.key === "End") {
        e.preventDefault();
        const lastId = sortedLanguages[sortedLanguages.length - 1]?.id;
        if (lastId) focusLanguageOptionById(lastId);
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setIsLanguageOpen(false);
        focusLanguageTrigger();
      }
    },
    [focusLanguageOptionById, focusLanguageTrigger, sortedLanguages],
  );

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsLanguageOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isLanguageOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLanguageOpen, handleClickOutside]);

  useLayoutEffect(() => {
    if (!isLanguageOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const layoutChrome = document.getElementById("layout-sticky-chrome");
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      chromePaddingRight: layoutChrome?.style.paddingRight ?? "",
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
      if (layoutChrome) {
        layoutChrome.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.paddingRight = previous.bodyPaddingRight;
      if (layoutChrome) {
        layoutChrome.style.paddingRight = previous.chromePaddingRight;
      }
    };
  }, [isLanguageOpen]);

  useLayoutEffect(() => {
    if (!isLanguageOpen) {
      pendingListFocusRef.current = null;
      return;
    }
    const target = pendingListFocusRef.current;
    if (target === "selected") {
      const id = activeLanguageItem?.id;
      if (id) languageOptionRefs.current[id]?.focus();
    } else if (target === "first") {
      const id = sortedLanguages[0]?.id;
      if (id) languageOptionRefs.current[id]?.focus();
    } else if (target === "last") {
      const id = sortedLanguages[sortedLanguages.length - 1]?.id;
      if (id) languageOptionRefs.current[id]?.focus();
    }
    pendingListFocusRef.current = null;
  }, [activeLanguageItem, isLanguageOpen, sortedLanguages]);

  return (
    <div
      className={cn(
        "bg-chrome-stripe text-ink-inverse w-full relative z-20 leading-normal overflow-visible",
        isLanguageOpen && "z-[30]",
      )}
      role="navigation"
      aria-label={NAV_LABELS.utilityNavigation}
    >
      <div className="w-full flex items-center justify-end px-4 py-1  max-md:px-3">
        <nav className="flex items-center lg:mr-[-8px] gap-2">
          {topNavLinks
            .filter((item) => item?.fields)
            .map((item) => {
              const link = getTopNavLinkFieldFromItem(item.fields);
              const fieldBag = item.fields as
                | Record<string, unknown>
                | undefined;
              const cssFromCms = firstNonEmptyTextField(
                fieldBag?.CssClass,
                fieldBag?.cssClass,
                fieldBag?.IconCssClass,
                fieldBag?.iconCssClass,
              );
              const hrefLower = link?.value?.href?.trim().toLowerCase() ?? "";
              const cssClass =
                cssFromCms ||
                (hrefLower.startsWith("tel:")
                  ? HEADER_ICON_DEFAULTS.utilityPhone
                  : "");
              if (!link?.value?.href && !isEditing) return null;

              const hideQuoteOnMobile = isQuoteUtilityBarLink(
                link,
                item.displayName,
              );

              return (
                <SitecoreLink
                  key={item.id}
                  field={link ?? EMPTY_LINK}
                  editable={isEditing}
                  target={NAV_SAME_TAB_TARGET}
                  rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                  className={cn(
                    "inline-flex items-center text-ink-inverse text-xs sm:text-sm font-normal py-1 px-2 whitespace-nowrap transition-colors rounded leading-normal hover:bg-black/25 focus:bg-black/25 focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-focus-utility)] focus-visible:ring-offset-0 no-underline",
                    hideQuoteOnMobile && "max-md:hidden",
                  )}
                >
                  {cssClass ? (
                    <span className="mr-1 shrink-0 leading-none">
                      <FaIconFromCms
                        cssClass={cssClass}
                        className={CHROME_ICON_SIZE_UTILITY_STRIP}
                      />
                    </span>
                  ) : null}
                  {item.fields?.Title?.value?.toString().trim() ||
                    getLinkText(link ?? EMPTY_LINK) ||
                    item.displayName}
                </SitecoreLink>
              );
            })}

          {languages.length > 0 && (
            <div className="relative overflow-visible" ref={dropdownRef}>
              <button
                ref={languageTriggerRef}
                type="button"
                id="language-switcher"
                className={cn(
                  "inline-flex items-center text-ink-inverse text-xs sm:text-sm font-normal py-1 px-2 whitespace-nowrap transition-colors rounded leading-normal hover:bg-black/25 focus:bg-black/25 focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-focus-utility)] focus-visible:ring-offset-0 no-underline",
                  "cursor-default",
                  isLanguageOpen ? " bg-black/25" : "",
                )}
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                onKeyDown={handleLanguageTriggerKeyDown}
                aria-expanded={isLanguageOpen}
                aria-haspopup="listbox"
                aria-controls={LANGUAGE_LISTBOX_ID}
                aria-label={
                  currentLocaleMenuLabel
                    ? `${languageControlLabel}, ${currentLocaleMenuLabel} selected`
                    : languageControlLabel
                }
              >
                <span className="mr-1 shrink-0 leading-none">
                  <FaIconFromCms
                    cssClass={
                      firstNonEmptyTextField(
                        getFieldsTextByKey(
                          topBar?.fields as Record<string, unknown> | undefined,
                          "LanguageIconCssClass",
                          "languageIconCssClass",
                        ),
                        getFieldsTextByKey(
                          topBar?.fields as Record<string, unknown> | undefined,
                          "IconCssClass",
                          "iconCssClass",
                        ),
                      ) || HEADER_ICON_DEFAULTS.language
                    }
                    className={CHROME_ICON_SIZE_UTILITY_STRIP}
                  />
                </span>
                {languageControlLabel}
                <span className="ml-0.5 inline-flex size-[14px] shrink-0 items-center justify-center leading-none">
                  {ICON_CHEVRON_DOWN_14PX}
                </span>
              </button>
              {/* Single listbox: stable `id` for `aria-controls` (SC 4.1.2); native `hidden` so closed state is pruned from the a11y tree (and matches RTL in jsdom without Tailwind CSS). */}
              <div
                id={LANGUAGE_LISTBOX_ID}
                hidden={!isLanguageOpen}
                className="absolute top-full right-0 z-[1000] min-w-[174px] box-border m-0 p-0 bg-surface border border-solid border-stroke-default shadow-lg mt-1 overflow-hidden flex flex-col items-stretch"
                role="listbox"
                aria-label={languageControlLabel}
              >
                {sortedLanguages.map((lang, index) => {
                  const title = getLanguageDisplayLabel(lang);
                  const isCurrentLocale = lang.id === activeLanguageId;
                  return (
                    <button
                      key={lang.id}
                      ref={(el) => {
                        languageOptionRefs.current[lang.id] = el;
                      }}
                      type="button"
                      role="option"
                      aria-selected={isCurrentLocale}
                      className={cn(
                        "appearance-none box-border w-full min-w-0 shrink-0 self-stretch text-left font-inherit text-sm leading-normal px-4 py-2 m-0 text-ink-primary transition-colors duration-150 cursor-pointer border-0 border-b border-solid border-stroke-default last:border-b-0 outline-none font-normal bg-transparent hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:ring-0 focus-visible:outline-none touch-manipulation last:rounded-b-sm",
                        isCurrentLocale && "bg-surface-selected font-medium",
                      )}
                      onClick={() => setIsLanguageOpen(false)}
                      onKeyDown={(e) => handleLanguageOptionKeyDown(e, index)}
                    >
                      {title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};
