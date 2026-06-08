"use client";

import { faCalendarDays, faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { NextImage, Text } from "@sitecore-content-sdk/nextjs";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import SearchIcon from "src/components/shared/icons/SearchIcon";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { buildTabSearchPlaceholder } from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";

import { computeOrderManagementDatePanelLayout } from "../../partial/computeOrderManagementDatePanelLayout";
import { OrderManagementDatePanel } from "../../partial/OrderManagementDatePanel";
import { OrderManagementStatusFilterList } from "../../partial/OrderManagementFilterPanelPartials";

export function QuotesSearchBarFilter({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement | null {
  const {
    fields,
    tabFields,
    isListingCompactViewport,
    searchInput,
    handleSearchInputChange,
    handleSearchInputKeyDown,
    setAppliedSearch,
    setCurrentPage,
    applySearchAllAttributes,
    openStatus,
    setOpenStatus,
    openDate,
    setOpenDate,
    setMobileSheet,
    statusRef,
    dateRef,
    openDatePanel,
    dateTriggerLabel,
    selectedPresetId,
    defaultPresetId,
    statusSelections,
    statusDraft,
    toggleStatusDraftOption,
    syncStatusDraftFromApplied,
    mobileSheet,
    hideStatusFilter,
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

  /** Desktop: dismiss status or date popover with Escape (2.1.1). */
  useEffect(() => {
    if (isListingCompactViewport) return;
    if (!openStatus && !openDate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpenStatus(false);
      setOpenDate(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isListingCompactViewport, openStatus, openDate, setOpenStatus, setOpenDate]);

  if (!tabFields) return null;
  const searchPlaceholder = buildTabSearchPlaceholder(tabFields);

  const statusCount = statusSelections.size;
  const mobileFilterCount = statusCount;
  const mobileFiltersLabel = tabFields.FilterLabel?.value ?? "Filters";
  const mobileFiltersAriaLabel =
    mobileFilterCount > 0
      ? `${mobileFiltersLabel}, ${mobileFilterCount} selected`
      : mobileFiltersLabel;
  const dateFilterActive = selectedPresetId !== defaultPresetId;

  const openStatusPanel = () => {
    setOpenDate(false);
    if (!openStatus) {
      syncStatusDraftFromApplied();
    }
    setOpenStatus((o) => !o);
  };

  const openMobileFiltersSheet = () => {
    syncStatusDraftFromApplied();
    setOpenStatus(false);
    setOpenDate(false);
    setMobileSheet((s) => (s === "filters" ? null : "filters"));
  };

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
              aria-label={searchPlaceholder}
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

        <div
          className={cn(
            "flex items-center gap-2 sm:gap-3 flex-wrap min-w-0",
            isListingCompactViewport && "shrink-0 !flex-nowrap w-auto"
          )}
        >
          {!hideStatusFilter ? (
            <>
              <div className={"w-px h-[32px] bg-[var(--color-border-gray)] shrink-0"} aria-hidden />
              {fields.TabsFilterIcon?.value?.src ? (
                isListingCompactViewport ? (
                  <Button
                    type="button"
                    variant="transparent"
                    className={
                      "inline-flex items-center justify-center gap-1 shrink-0 p-0 min-w-[40px] min-h-[40px] -m-[6px] rounded-[8px] border-0 bg-transparent cursor-pointer text-[var(--color-text-basic)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-basic-color)] focus-visible:ring-offset-2"
                    }
                    onPress={openMobileFiltersSheet}
                    aria-expanded={mobileSheet === "filters"}
                    aria-haspopup="dialog"
                    aria-label={mobileFiltersAriaLabel}
                  >
                    <span
                      className={
                        "flex items-center justify-center shrink-0 text-[var(--color-text-basic)] pointer-events-none select-none"
                      }
                      aria-hidden
                    >
                      <NextImage
                        field={fields.TabsFilterIcon}
                        width={18}
                        height={18}
                        sizes="18px"
                        className={"block w-[18px] h-[18px] object-contain shrink-0"}
                      />
                    </span>
                    {mobileFilterCount > 0 ? (
                      <span
                        className={
                          "inline-flex min-w-[20px] h-[20px] items-center justify-center text-[11px] font-bold px-[6px] bg-[var(--color-bg-selected-tint)] text-[var(--color-action-primary)] rounded-[4px]"
                        }
                      >
                        {mobileFilterCount}
                      </span>
                    ) : null}
                  </Button>
                ) : (
                  <span
                    className={
                      "flex items-center justify-center shrink-0 text-[var(--color-text-basic)] pointer-events-none select-none"
                    }
                    aria-hidden
                  >
                    <NextImage
                      field={fields.TabsFilterIcon}
                      width={18}
                      height={18}
                      sizes="18px"
                      className={"block w-[18px] h-[18px] object-contain shrink-0"}
                    />
                  </span>
                )
              ) : null}

              <div
                className={cn(
                  "flex items-center gap-[12px] flex-wrap",
                  isListingCompactViewport && "hidden"
                )}
              >
                <div className="relative" ref={statusRef}>
                  <Button
                    type="button"
                    variant="transparent"
                    className={cn(
                      "!h-auto !min-h-0 inline-flex items-center gap-1 px-[2px] py-[4px] rounded-[4px] text-[13px] font-[400] text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)] bg-transparent border-0 shadow-none max-w-full",
                      openStatus &&
                        "bg-[var(--color-bg-selected-tint)] hover:bg-[var(--color-bg-selected-tint)]"
                    )}
                    aria-expanded={openStatus}
                    aria-label={tabFields.FilterLabel?.value}
                    onPress={openStatusPanel}
                  >
                    {tabFields.FilterLabel?.value ? (
                      <Text field={tabFields.FilterLabel} tag="span" />
                    ) : null}
                    {statusCount > 0 ? (
                      <span
                        className={
                          "inline-flex min-w-[20px] h-[20px] items-center justify-center text-[11px] font-bold px-[6px] bg-[var(--color-bg-selected-tint)] text-[var(--color-action-primary)]"
                        }
                      >
                        {statusCount}
                      </span>
                    ) : null}
                    <Icon
                      icon={faChevronDown}
                      width={14}
                      className={cn("shrink-0", openStatus && "text-[var(--color-gray-700)]")}
                      aria-hidden
                    />
                  </Button>
                  {openStatus && !isListingCompactViewport ? (
                    <div
                      className={
                        "absolute z-30 mt-[6px] left-0 min-w-[260px] max-w-[min(100vw-32px,360px)] rounded-[6px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] flex flex-col overflow-hidden shadow-[var(--color-shadow-dropdown)]"
                      }
                    >
                      <div className={"flex flex-col pt-2 pb-4 px-4"}>
                        <div className={"max-h-[min(280px,45vh)] overflow-y-auto"}>
                          <OrderManagementStatusFilterList
                            tabFields={tabFields}
                            statusDraft={statusDraft}
                            toggleStatusDraftOption={toggleStatusDraftOption}
                            groupLegend={
                              tabFields.FilterLabel?.value
                                ? String(tabFields.FilterLabel.value)
                                : "Quote status filters"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
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
              setOpenStatus(false);
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
