"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ITabItemsFields } from "../ContentSwitcher.type";
import { useWindowSize } from "src/hooks/useWindowSize";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from '@laitram-l-l-c/intralox-icon-library';
import { CHROME_ICON_BASE } from 'lib/chrome-icons';
import { cn } from "lib/utils";
import {
  ComponentRendering,
  RichText,
  Page,
} from "@sitecore-content-sdk/nextjs";
import { ImageView } from "components/shared/ImageView/ImageView";
import { MediaType } from "src/utils/enum";
import Video from "src/components/shared/video/Video";
import { IParams } from "src/utils/interface";
import {
  contentSwitcherTabMatchesSolutionParam,
  contentSwitcherTabPlaceholderHasRenderings,
  contentSwitcherTabPlaceholderName,
  fixContentSwitcherTabContentHtml,
  getContentSwitcherTabSolutionKey,
} from "components/contentSwitcher/contentSwitcherUtils";
import { TabAccordionTabPlaceholder } from "./TabAccordionTabPlaceholder";

/** Authoring hint when `TabLabel` is missing (Pages click-to-edit still works on the field when present). */
const EMPTY_TAB_LABEL_PLACEHOLDER = "Tab label";

/** Landmark for the switcher shell (tabs + panels); not a `tablist` so panels may live outside the tab strip. */
const CONTENT_SWITCHER_REGION_LABEL = "Content switcher";

/** Desktop vertical tab strip (`role="tablist"`). */
const CONTENT_SWITCHER_TABLIST_LABEL = "Section tabs";

function tabMediaTypeValue(tabItem: ITabItemsFields): string | undefined {
  const raw = tabItem.fields?.MediaType?.fields?.Value?.value;
  return typeof raw === "string" ? raw : undefined;
}

export interface ITabAccordionProps extends IParams {
  tabItems: ITabItemsFields[];
  rendering: ComponentRendering;
  page: Page;
}
export const TabAccordion = ({
  tabItems,
  rendering,
  page,
}: ITabAccordionProps) => {
  const isEditing = page.mode.isEditing;
  const isPreview = page.mode.isPreview;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentAccordionFocus, setCurrentAccordionFocus] = useState<
    number | null | undefined
  >();

  const [openItemIndex, setOpenItemIndex] = useState<number | null>(() => {
    const solution = searchParams.get("solution");
    if (!solution?.trim()) return null;
    const idx = tabItems.findIndex((item: ITabItemsFields) =>
      contentSwitcherTabMatchesSolutionParam(item, solution),
    );
    return idx > -1 ? idx : null;
  });
  const [currentItemQuery, setCurrentItemQuery] = useState<string | null>(
    () => {
      const solution = searchParams.get("solution");
      if (!solution?.trim()) return null;
      const idx = tabItems.findIndex((item: ITabItemsFields) =>
        contentSwitcherTabMatchesSolutionParam(item, solution),
      );
      return idx > -1 ? getContentSwitcherTabSolutionKey(tabItems[idx]!) : null;
    },
  );
  const switcherRef = useRef<HTMLDivElement>(null);
  /** Skips URL→state sync while Next.js searchParams is catching up after our router.replace. */
  const pendingOwnNavigationRef = useRef(false);
  const tabRefs = useRef<Record<number, HTMLButtonElement | undefined>>({});
  const accordionRefs = useRef<Record<number, HTMLButtonElement | undefined>>(
    {},
  );
  /** Desktop tab panels (right column); used to scroll content into view — mobile uses accordion headers. */
  const panelContentRefs = useRef<Record<number, HTMLDivElement | undefined>>(
    {},
  );
  const [isMobile, setIsMobile] = useState(false);
  const { width } = useWindowSize();

  useEffect(() => {
    setIsMobile(window?.matchMedia("(max-width: 767px)")?.matches);
  }, [width]);

  useEffect(() => {
    if (isEditing || isPreview) {
      return;
    }

    const urlParams = new URLSearchParams(searchParams.toString());

    if (!currentItemQuery) {
      urlParams.delete("solution");
    } else {
      urlParams.set("solution", currentItemQuery);
    }

    const nextQuery = urlParams.toString();
    if (nextQuery === searchParams.toString()) {
      return;
    }

    pendingOwnNavigationRef.current = true;
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [currentItemQuery, isEditing, pathname, router, searchParams, isPreview]);

  useEffect(() => {
    setCurrentAccordionFocus((prev: number | null | undefined) => {
      // this is to ensure that if an accordion item is open, and then clicked,
      // it will retain focus, rather than setting focus to null
      if (prev !== null && !openItemIndex) return prev;
      return openItemIndex;
    });
  }, [openItemIndex]);
  useEffect(() => {
    if (currentAccordionFocus != null) {
      accordionRefs.current[currentAccordionFocus]?.focus();
    }
  }, [currentAccordionFocus]);

  useEffect(() => {
    setCurrentAccordionFocus((prev) => {
      return isMobile ? null : prev;
    });
  }, [isMobile]);

  useEffect(() => {
    const currentAccordionFocus = searchParams.get("accordionFocus");
    if (currentAccordionFocus) {
      setCurrentAccordionFocus(Number(currentAccordionFocus));
    }
  }, [searchParams]);

  /** Roving focus for mobile accordion headers only — ignore focus inside tab panels to avoid dropping clicks. */
  const handleOnFocus = useCallback((event: FocusEvent) => {
    const target = event?.target as HTMLElement | null;
    const tabHeader = target?.closest(
      "[data-focus-index]",
    ) as HTMLElement | null;
    if (!tabHeader) {
      return;
    }
    const focusedButtonIndex = parseInt(
      tabHeader.getAttribute("data-focus-index") ?? "",
      10,
    );
    if (Number.isNaN(focusedButtonIndex)) {
      return;
    }
    setCurrentAccordionFocus(focusedButtonIndex);
  }, []);
  const handleSwitcherChange = useCallback(
    (i: number) => {
      const contentItem = tabItems[i];
      setOpenItemIndex((prev: number | null) => {
        if (isMobile && prev != null) {
          if (i === prev) {
            return null;
          }
        }
        return i;
      });

      setCurrentItemQuery((previousQuery) => {
        const nextKey = contentItem
          ? getContentSwitcherTabSolutionKey(contentItem)
          : null;
        if (!nextKey) return null;
        if (isMobile) {
          return nextKey === previousQuery ? null : nextKey;
        }
        return nextKey;
      });
    },
    [tabItems, isMobile],
  );
  useEffect(() => {
    if (isEditing || isPreview) {
      return;
    }

    const solutionFromUrl = searchParams.get("solution");
    if (pendingOwnNavigationRef.current) {
      const urlMatchesState =
        solutionFromUrl === currentItemQuery ||
        (!solutionFromUrl && !currentItemQuery);
      if (urlMatchesState) {
        pendingOwnNavigationRef.current = false;
      }
      return;
    }

    const initialContentIndex = tabItems.findIndex(
      (item: ITabItemsFields) =>
        solutionFromUrl != null &&
        contentSwitcherTabMatchesSolutionParam(item, solutionFromUrl),
    );
    if (initialContentIndex > -1 && initialContentIndex !== openItemIndex) {
      if (isMobile) {
        accordionRefs.current[initialContentIndex]?.focus();
      } else {
        tabRefs.current[initialContentIndex]?.focus();
      }
      setCurrentAccordionFocus((prev) =>
        isMobile ? initialContentIndex : prev,
      );
      handleSwitcherChange(initialContentIndex);
    }
  }, [
    tabItems,
    isEditing,
    isMobile,
    openItemIndex,
    searchParams,
    handleSwitcherChange,
    currentItemQuery,
    isPreview,
  ]);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isMobile) return;
      const getNextIndex = () => {
        switch (event.key) {
          case "ArrowLeft":
          case "ArrowUp":
            event.preventDefault();
            return openItemIndex === 0
              ? tabItems.length - 1
              : openItemIndex === null
                ? null
                : openItemIndex - 1;
          case "ArrowRight":
          case "ArrowDown":
            event.preventDefault();
            return openItemIndex === tabItems.length - 1
              ? 0
              : openItemIndex === null
                ? null
                : openItemIndex + 1;
          case "Home":
            return 0;
          case "End":
            return tabItems.length - 1;
          default:
            // this is to avoid overriding behaviour for tab / shift+tab
            return null;
        }
      };
      const nextIndex = getNextIndex();
      if (nextIndex === null) return;

      handleSwitcherChange(nextIndex);

      tabRefs.current?.[nextIndex]?.focus();
    },
    [isMobile, openItemIndex, handleSwitcherChange, tabItems],
  );

  const handleKeyDownAccordion = useCallback(
    (event: KeyboardEvent) => {
      if (!isMobile) return;
      const getFocusIndex = (prev: number | null | undefined) => {
        switch (event.key) {
          case "ArrowLeft":
          case "ArrowUp":
            event.preventDefault();
            return prev === null || prev === undefined
              ? null
              : prev === 0
                ? tabItems.length - 1
                : prev - 1;
          case "ArrowRight":
          case "ArrowDown":
            event.preventDefault();
            return prev === null || prev === undefined
              ? null
              : prev === tabItems.length - 1
                ? 0
                : prev + 1;
          case "Home":
            return 0;
          case "End":
            return tabItems.length - 1;
          default:
            return prev;
        }
      };

      setCurrentAccordionFocus((prev: number | null | undefined) =>
        getFocusIndex(prev),
      );
    },
    [isMobile, tabItems],
  );

  useEffect(() => {
    if (switcherRef.current) {
      const switcher = switcherRef.current;
      switcher.addEventListener("keydown", handleKeyDown);
      switcher.addEventListener("keydown", handleKeyDownAccordion);
      switcher.addEventListener("focusin", handleOnFocus);
      return () => {
        switcher.removeEventListener("keydown", handleKeyDown);
        switcher.removeEventListener("keydown", handleKeyDownAccordion);
        switcher.removeEventListener("focusin", handleOnFocus);
      };
    }
  }, [handleKeyDown, handleKeyDownAccordion, handleOnFocus]);

  /** Scroll expanded accordion header (mobile) or active panel (desktop) into view on tab change. */
  useEffect(() => {
    if (openItemIndex === null) return;
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const prefersReduced =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const target = isMobile
          ? accordionRefs.current[openItemIndex]
          : panelContentRefs.current[openItemIndex];
        target?.scrollIntoView({
          block: "start",
          behavior: prefersReduced ? "auto" : "smooth",
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [isMobile, openItemIndex]);

  const createContentSelector = useCallback(
    (contentItems: ITabItemsFields[]) => {
      const buttons = contentItems.map(
        (contentItem: ITabItemsFields, index: number) => {
          const TabLabel = contentItem.fields?.TabLabel;
          const tabKey = getContentSwitcherTabSolutionKey(contentItem);
          // Set first button to active if no query param is set
          const isOpen =
            tabKey === currentItemQuery || (!currentItemQuery && index === 0);

          return (
            <li
              className="block w-full ml-0!"
              key={contentItem.id}
              role="presentation"
            >
              <button
                className={cn(
                  `block w-full text-lg py-3 pl-4 pr-6 rounded-tl-lg rounded-bl-lg text-left font-medium transition-colors duration-150 focus:outline-none focus:ring border-stroke-default border leading-tight border-r-0 overflow-hidden`,
                  {
                    "bg-surface-selected text-ink-primary": isOpen,
                    "bg-surface text-action-link hover:bg-surface-muted": !isOpen,
                  },
                )}
                onClick={() => {
                  handleSwitcherChange(index);
                }}
                role="tab"
                aria-selected={isOpen}
                aria-controls={`content-switcher-panel-${index}`}
                tabIndex={isOpen ? 0 : -1}
                id={`tab-${index}`}
                ref={(el) => {
                  if (el) tabRefs.current[index] = el;
                }}
                style={{
                  whiteSpace: `break-spaces`,
                  textOverflow: `ellipsis`,
                }}
              >
                {TabLabel?.value ??
                  (isEditing ? EMPTY_TAB_LABEL_PLACEHOLDER : "")}
              </button>
            </li>
          );
        },
      );
      return buttons;
    },
    [currentItemQuery, handleSwitcherChange, isEditing],
  );
  return (
    <div
      className="flex flex-wrap md:flex-nowrap relative"
      data-analytics-region={"Content Switcher"}
      role="region"
      aria-label={CONTENT_SWITCHER_REGION_LABEL}
      ref={switcherRef}
    >
      <div className="md:w-64 relative hidden md:block">
        <ul
          role="tablist"
          aria-label={CONTENT_SWITCHER_TABLIST_LABEL}
          className="space-y-4 md:sticky md:left-0 md:top-56 md:mt-8 md:mb-8 !ml-0"
        >
          {createContentSelector(tabItems)}
        </ul>
      </div>
      <div className="w-full min-w-0 md:w-auto md:flex-1 md:min-w-0 z-10">
        {tabItems.map((tabItem: ITabItemsFields, index: number) => {
          const tabPlaceholderName = contentSwitcherTabPlaceholderName(
            index + 1,
          );
          const showTabPlaceholder =
            isEditing ||
            contentSwitcherTabPlaceholderHasRenderings(
              rendering,
              tabPlaceholderName,
            );
          const mediaTypeRaw = tabMediaTypeValue(tabItem);
          const tabLabelText =
            tabItem.fields?.TabLabel?.value ??
            (isEditing ? EMPTY_TAB_LABEL_PLACEHOLDER : "");
          const tabContentField = tabItem.fields?.TabContent;
          const tabContentRaw = tabContentField?.value;
          const richTextField = {
            ...(tabContentField ?? { value: "" as string }),
            value:
              fixContentSwitcherTabContentHtml(tabContentRaw) ??
              tabContentRaw ??
              "",
          };
          const brightcoveId =
            tabItem.fields?.Video?.fields?.BrightcoveId?.value;
          const videoId =
            typeof brightcoveId === "string" ? brightcoveId.trim() : "";
          const coverImage = tabItem.fields?.Video?.fields?.CoverImage;
          const showImageRail =
            mediaTypeRaw === MediaType.IMAGE && Boolean(tabItem.fields?.Image);
          const showVideoRail =
            mediaTypeRaw === MediaType.VIDEO && videoId.length > 0;

          return (
            <div key={tabItem.id}>
              <button
                type="button"
                data-focus-index={index}
                id={`mobile-accordion-${index}`}
                className={cn(
                  `flex md:hidden relative text-ink-primary w-full text-lg text-left font-medium py-3 focus:outline-none focus:ring
                  leading-tight border-b overflow-hidden justify-between scroll-mt-[calc(var(--headerTop)+36px)]`,
                  {
                    "border-stroke-default": openItemIndex !== index,
                    "border-transparent": openItemIndex === index,
                  },
                )}
                onClick={() => {
                  handleSwitcherChange(index);
                }}
                ref={(el) => {
                  if (el) accordionRefs.current[index] = el;
                }}
                aria-expanded={openItemIndex === index}
                aria-controls={`content-switcher-panel-${index}`}
                style={{
                  whiteSpace: `break-spaces`,
                  textOverflow: `ellipsis`,
                }}
              >
                {tabLabelText}
                <div className="flex self-start items-center h-lh">
                  <ChevronDown
                    className={cn(
                      CHROME_ICON_BASE,
                      'block size-[12px] text-ink-secondary leading-snug py-3 top-0 right-0 transition-transform duration-150',
                      {
                        'rotate-180': openItemIndex === index,
                        'rotate-0': openItemIndex !== index,
                      },
                    )}
                    aria-hidden="true"
                  />
                </div>
              </button>
              <div
                id={`content-switcher-panel-${index}`}
                role="tabpanel"
                aria-labelledby={
                  isMobile ? `mobile-accordion-${index}` : `tab-${index}`
                }
                className={cn(
                  // Default overflow-hidden keeps media corners inside rounded-lg. Callout/Testimonial use full-bleed
                  // breakout + Callout stats use -mt-8 and fixed lg min-widths — :has() lifts overflow so rows are
                  // not clipped; top media stays clipped via its own wrapper below.
                  // Inner PAGE_WRAP: strip mx/padding for nested full-bleed. Callout stats: `flex-wrap` below desktop only;
                  // at desktop the callout list uses flex row (`lg:flex` + equal `flex-1` tiles); `flex-nowrap` aligns with the list shell.
                  `focus:outline-none focus:ring rounded-lg shadow-md border border-stroke-default overflow-hidden bg-surface scroll-mt-[calc(var(--headerTop)+36px)] min-w-0 has-[.callout]:overflow-visible has-[.testimonial]:overflow-visible [&_.testimonial]:!ml-0 [&_.testimonial]:!w-full [&_.testimonial]:!max-w-full [&_.testimonial]:min-w-0 [&_.testimonial]:!p-0 [&_.testimonial]:lg:!p-0 [&_.testimonial_.component-content>div]:!mx-0 [&_.testimonial_.component-content>div]:!max-w-full [&_.testimonial_.component-content>div]:!px-0 [&_.callout]:!ml-0 [&_.callout]:!w-full [&_.callout]:!max-w-full [&_.callout]:min-w-0 [&_.callout]:!shrink [&_.callout_.component-content>div]:!mx-0 [&_.callout_.component-content>div]:!max-w-full [&_.callout_.component-content>div]:!px-0 [&_.callout_.component-content_[role=list]]:!mt-0 [&_.callout_.component-content_[role=list]]:md:!mt-0 [&_.callout_.component-content_[role=list]]:w-full [&_.callout_.component-content_[role=list]]:min-w-0 [&_.callout_.component-content_[role=list]]:max-w-full [&_.callout_.component-content_[role=list]]:below-desktop:flex-wrap [&_.callout_.component-content_[role=list]]:desktop-up:flex-nowrap [&_.callout_.component-content_[role=listitem]]:md:!min-w-0`,
                  (() => {
                    const isActivePanel = isMobile
                      ? openItemIndex === index
                      : openItemIndex === index ||
                        (openItemIndex === null && index === 0);
                    return {
                      hidden: !isActivePanel,
                      "md:block": isActivePanel,
                      "md:hidden": !isActivePanel,
                    };
                  })(),
                )}
                ref={(el) => {
                  if (el) panelContentRefs.current[index] = el;
                }}
              >
                <div className="overflow-hidden rounded-t-lg empty:hidden">
                  {showImageRail && <ImageView image={tabItem.fields.Image} />}
                  {showVideoRail && (
                    <Video
                      videoId={videoId}
                      cover={false}
                      coverImageCropWidth={1600}
                      className="h-full"
                      suppressCaption={true}
                      coverImage={coverImage}
                    />
                  )}
                </div>
                <div className="p-8">
                  <div className="uppercase tracking-wide font-bold block text-ink-secondary text-sm/tight mb-[0.333em]">
                    {tabLabelText}
                  </div>
                  {(richTextField.value || isEditing) && (
                    <RichText
                      field={richTextField}
                      className="text-ink-primary text-base prose [&_h2]:leading-tight [&_h2]:text-xl
                  [&_h2]:!my-0 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:!py-0 [&_.p-8]:p-0
                 [&_a]:text-action-link [&_a]:hover:text-action [&_a]:transition-colors
                 [&_a]:duration-150 [&_li]:mt-2"
                    />
                  )}
                </div>
                {showTabPlaceholder && (
                  <div className="w-full min-w-0 overflow-hidden rounded-b-lg">
                    <TabAccordionTabPlaceholder
                      name={tabPlaceholderName}
                      rendering={rendering}
                      page={page}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
