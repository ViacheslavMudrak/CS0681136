"use client";

import Button from "@/components/ui/Button";
import { NextImage as ContentSdkImage } from "@sitecore-content-sdk/nextjs";
import React, { useEffect, useId, useState } from "react";

import { IParams } from "src/helpers/interface";
import type { IGlobalSearchFields } from "../GlobalSearch.type";
import { CategoryPromptDropdown } from "@/components/core/GlobalSearch/components/CategoryPromptDropdown";
import { SearchFormContent } from "@/components/core/GlobalSearch/components/SearchFormContent";
import { useGlobalSearchState } from "@/hooks/useGlobalSearchState";
import { createPortal } from "react-dom";

interface IGlobalSearchVariantProps {
  testId: string;
  fields: IGlobalSearchFields;
  params: IParams;
}

const GlobalSearchDefaultVariantBase = ({
  testId,
  fields,
}: IGlobalSearchVariantProps): React.ReactElement => {
  const popupId = useId();
  const [portalMounted, setPortalMounted] = useState(false);
  const {
    containerRef,
    mobileOverlayRef,
    isDropdownOpen,
    setIsDropdownOpen,
    isPopupOpen,
    setIsPopupOpen,
    selectedCategory,
    searchQuery,
    categories,
    showCategoryPrompt,
    highlightedIndex,
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
  } = useGlobalSearchState({ fields });

  useEffect(() => {
    setPortalMounted(true);
  }, []);

  useEffect(() => {
    if (!isPopupOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPopupOpen, setIsPopupOpen]);

  if (!fields) {
    return <div data-testid={testId} />;
  }

  const formProps = {
    fields,
    categories,
    selectedCategory,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    isDropdownOpen,
    setIsDropdownOpen,
    handleCategorySelect,
    handleSearchSubmit,
    placeholder,
    onInputKeyDown: handleInputKeyDown,
    suggestionsOpen: showCategoryPrompt,
    highlightedOptionId,
    onTypeSelectorPress: handleTypeSelectorPress,
    onSearchIconPress: handleSearchIconPress,
  };

  const mobileSearchOverlay =
    isPopupOpen && portalMounted && typeof document !== "undefined" ? (
      <div ref={mobileOverlayRef} className="lg:hidden">
        <div
          className="fixed start-0 end-0 bottom-0 z-[49] lg:hidden top-[60px] md:top-[72px] w-full max-w-[100dvw] bg-[#08090DBF] backdrop-blur-sm"
          onClick={() => setIsPopupOpen(false)}
          aria-hidden="true"
        />
        <div
          id={popupId}
          className="fixed start-0 end-0 flex w-full max-w-[100dvw] min-w-0 box-border gap-4 p-[20px] z-50 top-[60px] md:top-[72px] overflow-x-hidden bg-[var(--color-bg-basic-color)] shadow-[0_4px_12px_0_rgba(0,_0,_0,_0.13)]"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div
            className={
              "flex w-full min-w-0 border border-solid border-[var(--color-border-gray-300)]"
            }
          >
            <div className={"flex flex-col flex-1 min-w-0 w-full max-w-[622px] relative"}>
              <SearchFormContent {...formProps} autoFocus />
              {showCategoryPrompt && (
                <CategoryPromptDropdown
                  searchQuery={searchQuery}
                  categories={categories}
                  highlightedIndex={highlightedIndex}
                  onExecuteSearch={handleExecuteSearchFromPrompt}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div
      className={
        "flex items-center relative px-[0px] md:px-[8px] lg:px-[20px] max-md:px-0 max-md:me-auto"
      }
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      data-testid={testId}
    >
      <div
        className={
          "hidden lg:flex items-center rounded-[2px] w-full max-w-[622px] gap-4 relative bg-[var(--color-bg-basic-color)] border border-solid border-[var(--color-border-gray-300)]"
        }
      >
        <div className={"flex flex-col flex-1 min-w-0 w-full max-w-[622px] relative"}>
          <SearchFormContent {...formProps} />
          {showCategoryPrompt && !isPopupOpen && (
            <CategoryPromptDropdown
              searchQuery={searchQuery}
              categories={categories}
              highlightedIndex={highlightedIndex}
              onExecuteSearch={handleExecuteSearchFromPrompt}
            />
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        type="button"
        className={
          "flex lg:hidden items-center justify-center shrink-0 w-[44px] h-[39px] rounded-[2px] border-0 cursor-pointer bg-transparent text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)] focus-visible:ring-inset p-0 m-0 min-w-0 max-md:relative max-md:z-[1]"
        }
        onPress={() => setIsPopupOpen(!isPopupOpen)}
        aria-label={isPopupOpen ? "Close search" : "Open search"}
        aria-expanded={isPopupOpen}
        aria-controls={isPopupOpen ? popupId : undefined}
      >
        <ContentSdkImage
          field={fields.SearchIcon}
          alt=""
          aria-hidden="true"
          className={
            "w-[15px] md:w-[19px] h-[15px] md:h-[19px] shrink-0 max-md:w-[22.777px] max-md:h-[22.777px]"
          }
          width={19}
          height={19}
        />
      </Button>

      {mobileSearchOverlay && createPortal(mobileSearchOverlay, document.body)}
    </div>
  );
};

export const GlobalSearchDefaultVariant = React.memo(GlobalSearchDefaultVariantBase);
