"use client";

import useClickOutside from "@/hooks/useClickOutside";
import {
  GLOBAL_SEARCH_DESTINATION_SEGMENTS,
  GLOBAL_SEARCH_MAX_QUERY_LENGTH,
  GLOBAL_SEARCH_OPTION_ID_PREFIX,
} from "@/lib/global-search-constants";
import { sendSearchEvent } from "@/lib/CDPEvents";
import { logGTMSearch } from "@/lib/gtm";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type {
  IGlobalSearchCategory,
  IGlobalSearchFields,
} from "@/components/core/GlobalSearch/GlobalSearch.type";

export interface UseGlobalSearchStateProps {
  fields: IGlobalSearchFields | null;
}

function getDefaultHighlightIndex(categories: IGlobalSearchCategory[]): number {
  const idx = categories.findIndex((c) => c?.fields?.DefaultSearchType?.value === true);
  return idx >= 0 ? idx : 0;
}

function categoryPromptNavIntent(e: React.KeyboardEvent): "down" | "up" | "enter" | null {
  const { key, code } = e;
  const keyCode = e.keyCode || e.which || e.nativeEvent?.keyCode;

  if (
    key === "ArrowDown" ||
    key === "Down" ||
    key === "UIKeyInputDownArrow" ||
    code === "ArrowDown" ||
    keyCode === 40
  ) {
    return "down";
  }

  if (
    key === "ArrowUp" ||
    key === "Up" ||
    key === "UIKeyInputUpArrow" ||
    code === "ArrowUp" ||
    keyCode === 38
  ) {
    return "up";
  }

  if (key === "Enter" || code === "Enter" || code === "NumpadEnter" || keyCode === 13) {
    return "enter";
  }

  return null;
}

const toRootRelativePath = (href: string): string => {
  const trimmed = href.trim();
  if (!trimmed) return "/";

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).pathname || "/";
    } catch {
      return "/";
    }
  }

  const pathOnly = trimmed.split("?")[0].split("#")[0] || "/";
  return pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
};

export function useGlobalSearchState({ fields }: UseGlobalSearchStateProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IGlobalSearchCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const highlightedIndexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const categories = fields?.Categories ?? [];

  const closeAllSearchUi = useCallback(() => {
    setIsDropdownOpen(false);
    setIsPopupOpen(false);
    setSuggestionsOpen(false);
  }, []);

  useClickOutside(containerRef, closeAllSearchUi, isDropdownOpen || suggestionsOpen);

  useEffect(() => {
    if (!isPopupOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (mobileOverlayRef.current?.contains(target)) return;
      closeAllSearchUi();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isPopupOpen, closeAllSearchUi]);

  const handleContainerMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest?.("[data-search-suggestions]")) return;
    if (target.closest?.("[data-search-type-selector]")) {
      setSuggestionsOpen(false);
      return;
    }
    setIsDropdownOpen(false);
    setSuggestionsOpen(false);
  }, []);

  useEffect(() => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const isSearchDestination = segments.some((seg) =>
      GLOBAL_SEARCH_DESTINATION_SEGMENTS.includes(seg)
    );
    if (isSearchDestination) {
      setSelectedCategory(null);
      setSearchQuery("");
      setSuggestionsOpen(false);
    }
  }, [pathname]);

  const defaultHighlightIndex = useMemo(() => getDefaultHighlightIndex(categories), [categories]);

  const showCategoryPrompt =
    suggestionsOpen && !selectedCategory && searchQuery.trim().length > 0 && categories.length > 0;

  useEffect(() => {
    if (showCategoryPrompt) {
      setHighlightedIndex(defaultHighlightIndex);
    }
  }, [showCategoryPrompt, defaultHighlightIndex]);

  useLayoutEffect(() => {
    highlightedIndexRef.current = highlightedIndex;
  }, [highlightedIndex]);

  const handleSearchQueryChange = useCallback((value: string) => {
    const capped = value.slice(0, GLOBAL_SEARCH_MAX_QUERY_LENGTH);
    setSearchQuery(capped);
    if (capped.trim().length > 0) {
      setSuggestionsOpen(true);
    }
  }, []);

  const executeSearchWithCategoryAndQuery = useCallback(
    (category: IGlobalSearchCategory, trimmedQuery: string) => {
      const categoryName = category.fields.Title.value;
      const categoryUrl = category.fields.URL.value?.href ?? null;
      const categoryTarget = category.fields.URL.value?.target;
      const linkType = category.fields.URL.value?.linktype;

      if (!categoryUrl) return;

      logGTMSearch({
        search_term: trimmedQuery,
        search_category: categoryName,
        no_results: false,
      });
      sendSearchEvent({
        type: "customerportal:SEARCH",
        searchTerm: trimmedQuery,
        searchCategory: categoryName,
        noResults: false,
      });

      const searchParam = encodeURIComponent(trimmedQuery ?? "");

      if (linkType === "external" && categoryTarget === "_blank") {
        if (/^https?:\/\//i.test(categoryUrl)) {
          try {
            const u = new URL(categoryUrl);
            u.searchParams.set("search", trimmedQuery);
            window.open(u.toString(), "_blank", "noopener,noreferrer");
          } catch {
            /* ignore invalid URL */
          }
          return;
        }

        const basePath = toRootRelativePath(categoryUrl).replace(/\/$/, "") || "/";
        const externalUrl = `${basePath}?search=${searchParam}`;
        window.open(externalUrl, "_blank", "noopener,noreferrer");
        return;
      }

      if (/^https?:\/\//i.test(categoryUrl)) {
        try {
          const u = new URL(categoryUrl);
          u.searchParams.set("search", trimmedQuery);
          const dest = u.toString();
          if (categoryTarget === "_blank") {
            window.open(dest, "_blank", "noopener,noreferrer");
          } else {
            router.push(dest);
          }
        } catch {
          /* ignore invalid URL */
        }
        return;
      }

      const basePath = toRootRelativePath(categoryUrl);
      const searchUrl = `${basePath}?search=${searchParam}`;

      if (categoryTarget === "_blank") {
        window.open(searchUrl, "_blank", "noopener,noreferrer");
      } else {
        router.push(searchUrl);
      }
    },
    [router]
  );

  const handleCategorySelect = useCallback((category: IGlobalSearchCategory) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
    setSearchQuery("");
    setSuggestionsOpen(false);
  }, []);

  const handleTypeSelectorPress = useCallback(() => {
    setSuggestionsOpen(false);
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleExecuteSearchFromPrompt = useCallback(
    (category: IGlobalSearchCategory) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;
      executeSearchWithCategoryAndQuery(category, trimmed);
      setSelectedCategory(null);
      setSearchQuery("");
      setIsPopupOpen(false);
      setSuggestionsOpen(false);
    },
    [searchQuery, executeSearchWithCategoryAndQuery]
  );

  /** Resolve category: selected one, or default (DefaultSearchType or first). */
  const effectiveCategory = useMemo(
    () =>
      selectedCategory ??
      (categories.length > 0 ? (categories[defaultHighlightIndex] ?? categories[0]) : null),
    [selectedCategory, categories, defaultHighlightIndex]
  );

  const handleSearchSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (!effectiveCategory || !trimmed) return;
      executeSearchWithCategoryAndQuery(effectiveCategory, trimmed);
      setSelectedCategory(null);
      setSearchQuery("");
      setIsPopupOpen(false);
      setSuggestionsOpen(false);
    },
    [effectiveCategory, searchQuery, executeSearchWithCategoryAndQuery]
  );

  const handleSearchIconPress = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (!effectiveCategory || !trimmed) return;
    executeSearchWithCategoryAndQuery(effectiveCategory, trimmed);
    setSelectedCategory(null);
    setSearchQuery("");
    setIsPopupOpen(false);
    setSuggestionsOpen(false);
  }, [effectiveCategory, searchQuery, executeSearchWithCategoryAndQuery]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLFormElement>) => {
      if (!showCategoryPrompt || categories.length === 0) return;
      const nav = categoryPromptNavIntent(e);
      if (nav === "down") {
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((i) => (i < categories.length - 1 ? i + 1 : i));
      } else if (nav === "up") {
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : 0));
      } else if (nav === "enter") {
        e.preventDefault();
        const index = highlightedIndexRef.current;
        const category = categories[index];
        if (category && searchQuery.trim()) {
          handleExecuteSearchFromPrompt(category);
        }
      }
    },
    [showCategoryPrompt, categories, searchQuery, handleExecuteSearchFromPrompt]
  );

  const placeholder = fields?.SearchPlaceholder?.value ?? "";
  const highlightedOptionId =
    showCategoryPrompt && highlightedIndex >= 0 && highlightedIndex < categories.length
      ? `${GLOBAL_SEARCH_OPTION_ID_PREFIX}${highlightedIndex}`
      : null;

  return {
    containerRef,
    mobileOverlayRef,
    isDropdownOpen,
    setIsDropdownOpen,
    isPopupOpen,
    setIsPopupOpen,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    highlightedIndex,
    categories,
    showCategoryPrompt,
    handleContainerMouseDown,
    handleSearchQueryChange,
    handleCategorySelect,
    handleTypeSelectorPress,
    handleExecuteSearchFromPrompt,
    handleSearchSubmit,
    handleSearchIconPress,
    handleInputKeyDown,
    placeholder,
    highlightedOptionId,
  };
}
