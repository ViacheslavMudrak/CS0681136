"use client";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import ChevronRightIcon from "components/shared/icons/ChevronRightIcon";
import { useTranslations } from "next-intl";
import React, { useLayoutEffect, useRef } from "react";
import {
  GLOBAL_SEARCH_LISTBOX_ID,
  GLOBAL_SEARCH_OPTION_ID_PREFIX,
} from "@/lib/global-search-constants";
import { I18N } from "src/lib/dictionary-keys";
import type { IGlobalSearchCategory } from "../GlobalSearch.type";


export interface CategoryPromptDropdownProps {
  searchQuery: string;
  categories: IGlobalSearchCategory[];
  highlightedIndex: number;
  onExecuteSearch: (c: IGlobalSearchCategory) => void;
}

/**
 * Category prompt dropdown (Figma: Search-InputDropdown).
 * Shown when user types in search without selecting a category; lists categories to search "in".
 * Clicking an option or pressing Enter executes search with that category and current query.
 */
export function CategoryPromptDropdown({
  searchQuery,
  categories,
  highlightedIndex,
  onExecuteSearch,
}: CategoryPromptDropdownProps): React.ReactElement | null {
  const t = useTranslations();
  const listRef = useRef<HTMLDivElement>(null);
  const trimmed = searchQuery.trim();

  useLayoutEffect(() => {
    if (!trimmed || categories.length === 0 || highlightedIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-global-search-option-index="${String(highlightedIndex)}"]`
    );
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [highlightedIndex, trimmed, categories.length]);

  if (!trimmed || categories.length === 0) return null;

  const highlightedId =
    highlightedIndex >= 0 && highlightedIndex < categories.length
      ? `${GLOBAL_SEARCH_OPTION_ID_PREFIX}${highlightedIndex}`
      : null;

  return (
    <div
      id={GLOBAL_SEARCH_LISTBOX_ID}
      className={"absolute top-full end-0 mt-[5px] z-[100] w-full max-w-full min-w-0 lg:min-w-[488px] flex flex-col items-end p-4 rounded-[4px] bg-[var(--color-bg-basic-color)] border border-solid border-[var(--color-border-default)] shadow-[var(--color-shadow-dropdown)]"}
      role="listbox"
      aria-label="Select search category"
      aria-activedescendant={highlightedId ?? undefined}
      data-search-suggestions
    >
      <div className={"flex flex-col gap-[10px] w-full"}>
        <p className={"flex gap-1 items-center min-w-0 w-full max-w-full text-[16px] leading-[1.5] font-normal text-[var(--color-text-black)]"}>
          Search <span className={"font-medium min-w-0 flex-1 truncate"}>&quot;{trimmed}&quot;</span>
        </p>
      </div>
      <div ref={listRef} className={"flex flex-col gap-[4px] w-full min-w-[200px]"}>
        {categories.map((category, index) => {
          const isHighlighted = index === highlightedIndex;
          const optionId = `${GLOBAL_SEARCH_OPTION_ID_PREFIX}${index}`;
          const categoryTitle = category?.fields?.Title?.value ?? category?.name ?? "";
          return (
            <Button
              key={category.id}
              data-global-search-option-index={String(index)}
              variant="transparent"
              type="button"
              onPress={() => onExecuteSearch(category)}
              className={cn(
                "flex items-center justify-between py-2.5 w-full cursor-pointer rounded-[2px] transition-colors duration-150 border-0 bg-transparent",
                isHighlighted && "bg-[var(--color-bg-selected-tint)]"
              )}
              role="option"
              id={optionId}
              aria-selected={isHighlighted}
            >
              <span className={"flex gap-1.5 items-center text-[14px] leading-[1.375] font-normal"}>
                <span className={"text-[var(--color-text-black)]"}>{t(I18N.GlobalSortList)}</span>{" "}
                <span className={"text-[var(--color-gray-700)]"}>{categoryTitle}</span>
              </span>
              <ChevronRightIcon
                width={14}
                height={14}
                className={"shrink-0 w-[14px] h-[14px] text-[var(--color-gray-700)]"}
                decorative={true}
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
