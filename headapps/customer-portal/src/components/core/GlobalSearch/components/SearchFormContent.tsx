"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { NextImage as ContentSdkImage, Text as ContentSdkText } from "@sitecore-content-sdk/nextjs";
import ChevronDownIcon from "components/shared/icons/ChevronDownIcon";
import ChevronUpIcon from "components/shared/icons/ChevronUpIcon";
import React, { FormEvent, useId } from "react";
import {
  GLOBAL_SEARCH_LISTBOX_ID,
  GLOBAL_SEARCH_MAX_QUERY_LENGTH,
} from "@/lib/global-search-constants";
import type { IGlobalSearchCategory, IGlobalSearchFields } from "../GlobalSearch.type";

export interface SearchFormContentProps {
  fields: IGlobalSearchFields;
  categories: IGlobalSearchCategory[];
  selectedCategory: IGlobalSearchCategory | null;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (v: boolean) => void;
  handleCategorySelect: (c: IGlobalSearchCategory) => void;
  handleSearchSubmit: (e: FormEvent<HTMLFormElement>) => void;
  placeholder: string;
  onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLFormElement>) => void;
  suggestionsOpen?: boolean;
  highlightedOptionId?: string | null;
  onTypeSelectorPress?: () => void;
  onSearchIconPress?: () => void;
  autoFocus?: boolean;
}

export function SearchFormContent({
  fields,
  categories,
  selectedCategory,
  searchQuery,
  setSearchQuery,
  isDropdownOpen,
  setIsDropdownOpen,
  handleCategorySelect,
  handleSearchSubmit,
  placeholder,
  onInputKeyDown,
  suggestionsOpen,
  highlightedOptionId,
  onTypeSelectorPress,
  onSearchIconPress,
  autoFocus,
}: SearchFormContentProps): React.ReactElement {
  const searchTypeListboxId = useId();
  const searchLabel = String(placeholder || fields?.SearchTitle?.value || "Search").trim();
  const handleTypeButtonPress = () => {
    if (onTypeSelectorPress) onTypeSelectorPress();
    else setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <form onSubmit={handleSearchSubmit} className={"flex items-center w-full gap-4"}>
      <div
        className={"flex items-center relative shrink-0 self-stretch flex-none order-0 grow-0"}
        data-search-type-selector
      >
        <Button
          variant="muted"
          onPress={handleTypeButtonPress}
          className={
            "flex flex-row justify-center items-center gap-4 py-3 px-3 min-w-[134px] rounded-none bg-[var(--color-bg-basic-color)] border-solid border-e border-[var(--color-border-gray-300)] text-[var(--color-text-secondary)] text-[14px] font-normal leading-[19.5px] tracking-[-0.0762px] transition-colors duration-150 cursor-pointer whitespace-nowrap self-stretch flex-none order-0 grow-0"
          }
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          aria-controls={isDropdownOpen ? searchTypeListboxId : undefined}
          aria-label={fields?.SearchTitle?.value ?? "Select search type"}
        >
          {selectedCategory ? (
            <span className={"flex-1 min-w-0 leading-[19.5px] tracking-[-0.0762px]"}>
              {selectedCategory.fields.Title.value}
            </span>
          ) : (
            <ContentSdkText
              field={fields.SearchTitle}
              tag="span"
              className={"flex-1 min-w-0 leading-[19.5px] tracking-[-0.0762px]"}
            />
          )}
          {isDropdownOpen ? (
            <ChevronUpIcon
              width={11}
              height={11}
              className={"w-[11px] h-[11px] shrink-0 transition-transform duration-150"}
              decorative={true}
            />
          ) : (
            <ChevronDownIcon
              width={11}
              height={11}
              className={"w-[11px] h-[11px] shrink-0 transition-transform duration-150"}
              decorative={true}
            />
          )}
        </Button>
        {isDropdownOpen && categories.length > 0 && (
          <div
            className={
              "absolute top-full mt-[5px] bg-[var(--color-bg-basic-color)] border border-solid border-black/10 rounded-[8px] py-[5px] px-[5px] z-[100] w-max min-w-[134px] shadow-[var(--color-shadow-dropdown)] start-0"
            }
          >
            {categories.map((category) => {
              const isSelected = selectedCategory?.id === category.id;
              return (
                <Button
                  key={category.id}
                  variant="muted"
                  onPress={() => handleCategorySelect(category)}
                  //  className={cn(styles.dropdownItem, isSelected && styles.dropdownItemActive)}
                  className={cn(
                    "flex items-center h-[38px] px-3 rounded-lg w-full bg-transparent border-none cursor-pointer transition-colors duration-150 relative",
                    isSelected && "bg-[var(--color-bg-selected-tint)]"
                  )}
                >
                  <ContentSdkText
                    field={category.fields.Title}
                    tag="span"
                    className={cn(
                      "flex-1",
                      "text-[14px] font-normal leading-[19.5px] tracking-[-0.0762px]",
                      isSelected
                        ? "text-[var(--color-link-text)]"
                        : "text-[var(--color-text-black)]"
                    )}
                  />
                </Button>
              );
            })}
          </div>
        )}
      </div>
      <div className={"flex items-center h-full gap-2 flex-1 min-w-0"}>
        {onSearchIconPress ? (
          <Button
            variant="transparent"
            type="button"
            onPress={onSearchIconPress}
            className={
              "shrink-0 w-8 h-8 min-w-0 p-0 flex items-center justify-center rounded-[2px] cursor-pointer"
            }
            aria-label="Search"
          >
            <ContentSdkImage
              field={fields.SearchIcon}
              alt=""
              aria-hidden="true"
              width={16}
              height={16}
            />
          </Button>
        ) : (
          <div className={"w-[14px] h-[14px] shrink-0"}>
            <ContentSdkImage
              field={fields.SearchIcon}
              alt=""
              aria-hidden="true"
              width={16}
              height={16}
            />
          </div>
        )}
        <Input
          type="text"
          role="combobox"
          aria-label={searchLabel}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDownCapture={onInputKeyDown}
          maxLength={GLOBAL_SEARCH_MAX_QUERY_LENGTH}
          className={
            "flex-1 min-w-0 border-0 outline-none bg-transparent text-[16px] md:text-[14px] font-normal text-[var(--color-text-placeholder)] placeholder:text-[var(--color-text-placeholder)] focus:outline-none focus:ring-0 focus:border-0"
          }
          aria-autocomplete="list"
          aria-controls={suggestionsOpen ? GLOBAL_SEARCH_LISTBOX_ID : undefined}
          aria-expanded={suggestionsOpen}
          aria-activedescendant={
            suggestionsOpen && highlightedOptionId ? highlightedOptionId : undefined
          }
          autoFocus={autoFocus}
        />
      </div>
    </form>
  );
}
