"use client";

import { faCalendarDays, faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { NextImage } from "@sitecore-content-sdk/nextjs";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import SearchIcon from "src/components/shared/icons/SearchIcon";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { buildTabSearchPlaceholder } from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";

import { computeOrderManagementDatePanelLayout } from "../../partial/computeOrderManagementDatePanelLayout";
import { OrderManagementDatePanel } from "../../partial/OrderManagementDatePanel";

export function ShipmentsToolbar({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement | null {
  const {
    tabFields,
    isListingCompactViewport,
    searchInput,
    handleSearchInputChange,
    handleSearchInputKeyDown,
    setAppliedSearch,
    setCurrentPage,
    applySearchAllAttributes,
    openDate,
    setOpenDate,
    setMobileSheet,
    dateRef,
    openDatePanel,
    dateTriggerLabel,
    selectedPresetId,
    defaultPresetId,
  } = orderManagement;

  const [datePanelLayout, setDatePanelLayout] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updateDatePanelLayout = useCallback(() => {
    if (!openDate || isListingCompactViewport || !dateRef.current) {
      setDatePanelLayout(null);
      return;
    }
    setDatePanelLayout(
      computeOrderManagementDatePanelLayout(dateRef.current.getBoundingClientRect())
    );
  }, [openDate, isListingCompactViewport]);

  useLayoutEffect(() => {
    updateDatePanelLayout();
  }, [updateDatePanelLayout]);

  useLayoutEffect(() => {
    if (!openDate || isListingCompactViewport) return;
    window.addEventListener("resize", updateDatePanelLayout);
    window.addEventListener("scroll", updateDatePanelLayout, true);
    return () => {
      window.removeEventListener("resize", updateDatePanelLayout);
      window.removeEventListener("scroll", updateDatePanelLayout, true);
    };
  }, [openDate, isListingCompactViewport, updateDatePanelLayout]);

  /** Desktop: dismiss date popover with Escape (2.1.1). */
  useEffect(() => {
    if (isListingCompactViewport) return;
    if (!openDate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpenDate(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isListingCompactViewport, openDate, setOpenDate]);

  if (!tabFields) return null;

  const dateFilterActive = selectedPresetId !== defaultPresetId;
  const searchPlaceholder = buildTabSearchPlaceholder(tabFields);

  return (
    <div
      className={cn(
        "box-border flex flex-col gap-3 w-full max-w-full min-w-0 self-stretch md:flex-row md:items-center md:justify-between md:gap-4",
        isListingCompactViewport && "!flex-row flex-nowrap items-center gap-2"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap min-w-0 flex-1",
          isListingCompactViewport && "!flex-row flex-nowrap items-center !gap-2 min-w-0"
        )}
      >
        <div
          className={cn(
            "relative flex flex-col flex-1 min-w-0 w-full sm:max-w-[420px] md:max-w-[min(560px,50%)]",
            isListingCompactViewport && "basis-0 grow min-w-0 shrink !w-auto !max-w-none"
          )}
        >
          <div
            className={
              "min-w-0 relative flex flex-row items-center flex-1 min-w-0 w-full h-[44px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] pl-[40px] pr-[12px]"
            }
          >
            <Button
              type="button"
              variant="inverse"
              className={
                "absolute left-[6px] top-1/2 -translate-y-1/2 z-[1] text-[var(--color-text-basic)] !min-w-[32px] !min-h-[32px] !w-[32px] !h-[32px] !p-0 rounded-[6px] border-0 bg-transparent cursor-pointer hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-basic-color)] focus-visible:ring-offset-1"
              }
              aria-label="Search"
              onPress={() => applySearchAllAttributes()}
            >
              <SearchIcon width={18} height={18} decorative />
            </Button>
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleSearchInputKeyDown}
              className={
                "flex-1 min-w-0 h-[36px] ml-[-8px] border-0 outline-none bg-transparent shadow-none text-[16px] md:text-[14px] text-[var(--color-text-heading-color)] placeholder:text-[var(--color-text-basic)] focus:outline-none focus:ring-0 focus-visible:ring-0"
              }
              aria-label={searchPlaceholder || "Search shipments"}
              enterKeyHint="search"
            />
            {searchInput ? (
              <Button
                type="button"
                variant="ghost"
                btnVariant="iconBtn"
                className={cn(
                  "absolute right-[10px] top-1/2 -translate-y-1/2",
                  "!w-[28px] !h-[28px] !min-w-[28px] cursor-pointer rounded-full text-[var(--color-text-basic)] hover:bg-[var(--color-bg-lighter-gray)]"
                )}
                aria-label="Clear search"
                onPress={() => {
                  handleSearchInputChange("");
                  setAppliedSearch("");
                  setCurrentPage(1);
                }}
              >
                <Icon icon={faXmark} width={14} height={14} aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-end w-full sm:w-auto shrink-0 md:ml-auto",
          isListingCompactViewport && "!w-auto shrink-0 self-center ml-0 justify-end"
        )}
      >
        <div className="relative" ref={dateRef}>
          <Button
            type="button"
            variant="transparent"
            className={cn(
              "inline-flex h-[36px] max-w-full min-w-[min(100%,240px)] items-stretch overflow-hidden rounded-[6px] border border-solid border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] p-0 !shadow-none !items-stretch !justify-start !bg-[var(--color-bg-basic-color)] text-left hover:!bg-[var(--color-bg-lighter-gray)]",
              dateFilterActive && "border-[#D7D9DA]",
              isListingCompactViewport && "min-w-[100px] sm:min-w-[min(100%,240px)]"
            )}
            aria-expanded={openDate}
            aria-haspopup="true"
            aria-label={dateTriggerLabel}
            onPress={() => {
              openDatePanel();
              if (isListingCompactViewport) {
                setMobileSheet((s) => (s === "date" ? null : "date"));
              }
            }}
          >
            <span
              className={
                "flex w-[40px] shrink-0 flex-col items-center justify-center self-stretch border-r border-[var(--color-border-gray)] bg-[var(--color-gray-100)] !bg-[var(--color-gray-100)] border-[#D7D9DA]"
              }
              aria-hidden
            >
              {tabFields.DatePickerIcon?.value?.src ? (
                <span className="[&_img]:block [&_img]:max-h-[14px] [&_img]:max-w-[14px] [&_img]:object-contain">
                  <NextImage field={tabFields.DatePickerIcon} width={14} height={14} sizes="14px" />
                </span>
              ) : (
                <Icon
                  icon={faCalendarDays}
                  width={14}
                  height={14}
                  className="text-[var(--color-text-basic)]"
                  aria-hidden
                />
              )}
            </span>
            <span
              className={
                "flex min-w-0 flex-1 items-center justify-between gap-[8px] px-[8px] py-[10px]"
              }
            >
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-left text-[13px] font-[400] leading-[1.25] text-[var(--color-text-heading-color)]",
                  "hidden sm:inline"
                )}
              >
                {dateTriggerLabel}
              </span>
              <Icon
                icon={faChevronDown}
                width={14}
                className={
                  "shrink-0 text-[var(--color-text-basic)] text-[var(--color-action-primary)]"
                }
                aria-hidden
              />
            </span>
          </Button>
          {openDate && !isListingCompactViewport && datePanelLayout ? (
            <OrderManagementDatePanel
              orderManagement={orderManagement}
              embedded={true}
              fixedDropdownLayout={datePanelLayout}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
