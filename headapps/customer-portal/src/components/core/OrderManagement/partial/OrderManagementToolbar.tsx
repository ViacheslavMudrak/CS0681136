"use client";

import { faCalendarDays, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { NextImage, Text } from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import SearchIcon from "src/components/shared/icons/SearchIcon";

/** Belt popover: keep left flush with trigger, grow right to 60vw; only then slide left to stay in viewport. */
function computeBeltPanelLayout(anchor: DOMRect): { top: number; left: number; width: number } {
  const margin = 16;
  const vw = window.innerWidth;
  const targetW = Math.min(0.6 * vw, vw - 2 * margin);
  const rightLimit = vw - margin;
  let left = anchor.left;
  if (left + targetW > rightLimit) {
    left = rightLimit - targetW;
  }
  if (left < margin) {
    left = margin;
  }
  const width = Math.min(targetW, rightLimit - left - 25);
  return { top: anchor.bottom + 6, left, width };
}

import Button from "@/components/ui/Button";
import { I18N } from "@/lib/dictionary-keys";
import { buildOrdersSearchPlaceholder, getBeltSelectionCount } from "@/lib/orderManagementUtils";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

import { computeOrderManagementDatePanelLayout } from "./computeOrderManagementDatePanelLayout";
import { OrderManagementDatePanel } from "./OrderManagementDatePanel";
import {
  OrderManagementBeltFilterFooter,
  OrderManagementBeltFilterGroups,
  OrderManagementStatusFilterList,
} from "./OrderManagementFilterPanelPartials";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";

export function OrderManagementToolbar({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement | null {
  const t = useTranslations();
  const {
    fields,
    tabFields,
    isListingCompactViewport,
    hideStatusFilter,
    showBeltFilter,
    searchInput,
    handleSearchInputChange,
    handleSearchInputKeyDown,
    applySearchAllAttributes,
    openStatus,
    setOpenStatus,
    openBelt,
    setOpenBelt,
    openDate,
    setOpenDate,
    setMobileSheet,
    mobileSheet,
    statusRef,
    beltRef,
    dateRef,
    beltApplied,
    beltDraft,
    beltCount,
    beltSubgroupMeta,
    beltSearch,
    setBeltSearch,
    scrollThreshold,
    searchThreshold,
    beltSearchPh,
    toggleBeltDraft,
    applyBelt,
    clearBeltDraft,
    toggleStatusDraftOption,
    syncStatusDraftFromApplied,
    syncBeltDraftFromApplied,
    statusSelections,
    statusDraft,
    openDatePanel,
    dateTriggerLabel,
    selectedPresetId,
    defaultPresetId,
  } = orderManagement;

  const [beltPanelLayout, setBeltPanelLayout] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const [datePanelLayout, setDatePanelLayout] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updateBeltPanelLayout = useCallback(() => {
    if (!openBelt || isListingCompactViewport || !beltRef.current) {
      setBeltPanelLayout(null);
      return;
    }
    setBeltPanelLayout(computeBeltPanelLayout(beltRef.current.getBoundingClientRect()));
  }, [openBelt, isListingCompactViewport]);

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
    updateBeltPanelLayout();
  }, [updateBeltPanelLayout]);

  useLayoutEffect(() => {
    updateDatePanelLayout();
  }, [updateDatePanelLayout]);

  useLayoutEffect(() => {
    if (!openBelt || isListingCompactViewport) return;
    window.addEventListener("resize", updateBeltPanelLayout);
    window.addEventListener("scroll", updateBeltPanelLayout, true);
    return () => {
      window.removeEventListener("resize", updateBeltPanelLayout);
      window.removeEventListener("scroll", updateBeltPanelLayout, true);
    };
  }, [openBelt, isListingCompactViewport, updateBeltPanelLayout]);

  useLayoutEffect(() => {
    if (!openDate || isListingCompactViewport) return;
    window.addEventListener("resize", updateDatePanelLayout);
    window.addEventListener("scroll", updateDatePanelLayout, true);
    return () => {
      window.removeEventListener("resize", updateDatePanelLayout);
      window.removeEventListener("scroll", updateDatePanelLayout, true);
    };
  }, [openDate, isListingCompactViewport, updateDatePanelLayout]);

  /** Desktop: dismiss filter popovers with Escape (2.1.1). */
  useEffect(() => {
    if (isListingCompactViewport) return;
    if (!openStatus && !openBelt && !openDate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpenStatus(false);
      setOpenBelt(false);
      setOpenDate(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    isListingCompactViewport,
    openStatus,
    openBelt,
    openDate,
    setOpenStatus,
    setOpenBelt,
    setOpenDate,
  ]);

  if (!tabFields) return null;

  const showStatusFilter = !hideStatusFilter;
  const showFilterToolbarRegion = showStatusFilter || showBeltFilter;

  const statusCount = statusSelections.size;
  const mobileFilterCount = (showStatusFilter ? statusCount : 0) + (showBeltFilter ? beltCount : 0);
  const beltFilterActive = beltCount > 0;
  const dateFilterActive = selectedPresetId !== defaultPresetId;

  const ordersSearchPlaceholder = buildOrdersSearchPlaceholder(tabFields);

  const mobileFiltersLabel = showStatusFilter
    ? (tabFields.FilterLabel?.value ?? "Filters")
    : (tabFields.BeltFilterLabel?.value ?? "Filters");
  const mobileFiltersAriaLabel =
    mobileFilterCount > 0
      ? `${mobileFiltersLabel}, ${mobileFilterCount} selected`
      : mobileFiltersLabel;

  const openStatusPanel = () => {
    setOpenBelt(false);
    setOpenDate(false);
    if (!openStatus) {
      syncStatusDraftFromApplied();
    }
    setOpenStatus((o) => !o);
  };

  const openMobileFiltersSheet = () => {
    syncStatusDraftFromApplied();
    syncBeltDraftFromApplied();
    setOpenStatus(false);
    setOpenBelt(false);
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
              type="search"
              placeholder={ordersSearchPlaceholder}
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleSearchInputKeyDown}
              className={
                "flex-1 min-w-0 h-[36px] ml-[-8px] border-0 outline-none bg-transparent shadow-none text-[16px] md:text-[14px] text-[var(--color-text-heading-color)] placeholder:text-[var(--color-text-basic)] focus:outline-none focus:ring-0 focus-visible:ring-0"
              }
              aria-label={ordersSearchPlaceholder || "Search orders"}
              enterKeyHint="search"
            />
          </div>
        </div>

        {showFilterToolbarRegion ? (
          <div
            className={cn(
              "flex items-center gap-2 sm:gap-3 flex-wrap min-w-0",
              isListingCompactViewport && "shrink-0 !flex-nowrap w-auto"
            )}
          >
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
              {showStatusFilter ? (
                <div className="relative" ref={statusRef}>
                  <Button
                    type="button"
                    variant="transparent"
                    className={cn(
                      "!h-auto !min-h-0 inline-flex items-center gap-1 px-[2px] py-[4px] rounded-[4px] text-[13px] font-[400] leading-[1.25] text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)] bg-transparent border-0 shadow-none max-w-full",
                      openStatus &&
                        "bg-[var(--color-bg-selected-tint)] hover:bg-[var(--color-bg-selected-tint)]"
                    )}
                    aria-expanded={openStatus}
                    aria-label={tabFields.FilterLabel?.value}
                    onPress={openStatusPanel}
                  >
                    {tabFields.FilterLabel?.value && (
                      <Text field={tabFields.FilterLabel} tag="span" />
                    )}
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
                                : "Order status filters"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {showBeltFilter ? (
                <div className="relative" ref={beltRef}>
                  <Button
                    type="button"
                    variant="transparent"
                    className={
                      "px-[2px] py-[4px] gap-[8px] rounded-[4px] text-[13px] font-[400] text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)] max-w-full"
                    }
                    aria-expanded={openBelt}
                    aria-haspopup="true"
                    aria-label={tabFields.BeltFilterLabel?.value}
                    onPress={() => {
                      if (!openBelt) {
                        syncBeltDraftFromApplied();
                      }
                      setOpenBelt((o) => !o);
                      setOpenStatus(false);
                      setOpenDate(false);
                    }}
                  >
                    {tabFields.BeltFilterLabel?.value ? (
                      <Text field={tabFields.BeltFilterLabel} tag="span" />
                    ) : null}
                    {beltCount > 0 ? (
                      <span
                        className={
                          "inline-flex min-w-[20px] h-[20px] items-center justify-center text-[11px] font-bold px-[6px] bg-[var(--color-bg-selected-tint)] text-[var(--color-action-primary)]"
                        }
                      >
                        {beltCount}
                      </span>
                    ) : null}
                    <Icon icon={faChevronDown} width={14} className="shrink-0" aria-hidden />
                  </Button>
                  {openBelt && beltPanelLayout && !isListingCompactViewport ? (
                    <div
                      className={
                        "fixed z-30 max-h-[min(70vh,520px)] flex flex-col overflow-hidden overflow-x-hidden rounded-[6px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] shadow-[var(--color-shadow-dropdown)]"
                      }
                      style={{
                        top: beltPanelLayout.top,
                        left: beltPanelLayout.left,
                        width: beltPanelLayout.width,
                      }}
                    >
                      <div
                        className={
                          "flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-[5px] pt-[8px] pb-[12px]"
                        }
                      >
                        <OrderManagementBeltFilterGroups
                          beltSubgroupMeta={beltSubgroupMeta}
                          beltSearch={beltSearch}
                          setBeltSearch={setBeltSearch}
                          beltDraft={beltDraft}
                          toggleBeltDraft={toggleBeltDraft}
                          scrollThreshold={scrollThreshold}
                          searchThreshold={searchThreshold}
                          beltSearchPh={beltSearchPh}
                        />
                      </div>
                      <div
                        className={
                          "shrink-0 px-[20px] py-[12px] border-t border-[var(--color-border-gray)]"
                        }
                      >
                        <OrderManagementBeltFilterFooter
                          clearLabel={t(I18N.BeltClear)}
                          applyLabel={t(I18N.BeltApply)}
                          hasSelection={getBeltSelectionCount(beltDraft) > 0}
                          hasAppliedFilters={beltFilterActive}
                          onClear={clearBeltDraft}
                          onApply={applyBelt}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
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
              setOpenStatus(false);
              setOpenBelt(false);
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
                  className="text-[var(--color-text-black)]"
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
