"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Text } from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

import Button from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { I18N } from "@/lib/dictionary-keys";
import { getBeltSelectionCount } from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";

import {
  MOBILE_BELT_SECTION_FALLBACK,
  MOBILE_DATE_SHEET_TITLE,
  MOBILE_FILTER_SHEET_HEADING,
  MOBILE_FILTERS_CLEAR_ALL,
  MOBILE_ORDER_STATUS_SECTION,
} from "../orderManagementLabels";
import { OrderManagementDatePanel } from "./OrderManagementDatePanel";
import {
  OrderManagementBeltFilterFooter,
  OrderManagementBeltFilterGroups,
  OrderManagementFilterAccordionTrigger,
  OrderManagementStatusFilterList,
} from "./OrderManagementFilterPanelPartials";

/**
 * Mobile bottom sheets: combined filters (order status + belt) and date range.
 */
export function OrderManagementMobileSheets({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement | null {
  const t = useTranslations();
  const {
    isListingCompactViewport,
    mobileSheet,
    setMobileSheet,
    hideStatusFilter,
    showBeltFilter,
    tabFields,
    beltSubgroupMeta,
    beltSearch,
    setBeltSearch,
    scrollThreshold,
    searchThreshold,
    beltSearchPh,
    toggleBeltDraft,
    applyBelt,
    clearBeltDraft,
    clearAllChips,
    beltDraft,
    toggleStatusDraftOption,
    statusDraft,
    statusSelections,
    beltCount,
  } = orderManagement;

  const [statusSectionOpen, setStatusSectionOpen] = useState(true);
  const [beltSectionOpen, setBeltSectionOpen] = useState(false);

  const filterSheetPanelRef = useRef<HTMLDivElement>(null);
  const dateSheetPanelRef = useRef<HTMLDivElement>(null);
  const preSheetFocusRef = useRef<HTMLElement | null>(null);
  const sheetSessionActiveRef = useRef(false);

  const showStatusFilter = !hideStatusFilter;

  useBodyScrollLock(
    Boolean(
      isListingCompactViewport &&
        tabFields &&
        ((mobileSheet === "filters" && (showStatusFilter || showBeltFilter)) ||
          mobileSheet === "date")
    )
  );

  /** Escape, initial focus, focus restore for modal sheets (2.1.1 / 2.4.3). */
  useLayoutEffect(() => {
    if (!isListingCompactViewport) return;
    if (mobileSheet !== "filters" && mobileSheet !== "date") {
      if (sheetSessionActiveRef.current) {
        sheetSessionActiveRef.current = false;
        const el = preSheetFocusRef.current;
        preSheetFocusRef.current = null;
        queueMicrotask(() => {
          try {
            el?.focus();
          } catch {
            /* detached node */
          }
        });
      }
      return;
    }

    if (!sheetSessionActiveRef.current) {
      preSheetFocusRef.current = document.activeElement as HTMLElement | null;
      sheetSessionActiveRef.current = true;
    }

    const panel =
      mobileSheet === "filters" ? filterSheetPanelRef.current : dateSheetPanelRef.current;
    queueMicrotask(() => {
      try {
        panel?.focus();
      } catch {
        /* detached */
      }
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setMobileSheet(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isListingCompactViewport, mobileSheet, setMobileSheet]);

  useEffect(() => {
    if (mobileSheet !== "filters") return;
    if (!showStatusFilter && showBeltFilter) {
      setStatusSectionOpen(false);
      setBeltSectionOpen(true);
      return;
    }
    if (showStatusFilter && !showBeltFilter) {
      setStatusSectionOpen(true);
      setBeltSectionOpen(false);
      return;
    }
    setStatusSectionOpen(true);
    setBeltSectionOpen(false);
  }, [mobileSheet, showStatusFilter, showBeltFilter]);

  if (!tabFields) return null;

  const handleMobileFilterApply = () => {
    applyBelt();
    setMobileSheet(null);
  };

  const handleMobileFilterClearAll = () => {
    clearAllChips();
    clearBeltDraft();
    setMobileSheet(null);
  };

  const sheetBackdropClass =
    "fixed inset-0 z-40 flex items-end justify-center overscroll-y-contain bg-[color-mix(in_srgb,var(--color-bg-black)_40%,transparent)]";
  const mobileFilterHasSelection = statusDraft.size > 0 || getBeltSelectionCount(beltDraft) > 0;
  const mobileFilterHasApplied = statusSelections.size > 0 || beltCount > 0;

  return (
    <>
      {isListingCompactViewport &&
      mobileSheet === "filters" &&
      (showStatusFilter || showBeltFilter) ? (
        <div
          className={sheetBackdropClass}
          role="presentation"
          onClick={() => setMobileSheet(null)}
        >
          <div
            ref={filterSheetPanelRef}
            tabIndex={-1}
            className="flex w-full max-h-[min(88vh,720px)] flex-col overflow-hidden rounded-t-[16px] border border-b-0 border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] shadow-[var(--color-shadow-dropdown)]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-mgmt-mobile-filters-title"
          >
            <div className="h-px w-full shrink-0 bg-[var(--color-border-gray)]" aria-hidden />
            <div className="flex shrink-0 items-center gap-[10px] py-[16px] pl-[20px] pr-[12px]">
              <h2
                id="order-mgmt-mobile-filters-title"
                className="m-0 min-w-0 flex-1 text-[16px] font-medium leading-[1.25] text-[var(--color-text-heading-color)]"
              >
                {MOBILE_FILTER_SHEET_HEADING}
              </h2>
              <Button
                type="button"
                variant="ghost"
                btnVariant="iconBtn"
                className="!h-[28px] !min-w-[28px] !w-[28px] shrink-0 rounded-[12px] bg-[var(--color-bg-submenu)] text-[var(--color-text-basic)] hover:bg-[var(--color-bg-light-gray-active)]"
                onPress={() => setMobileSheet(null)}
                aria-label="Close"
              >
                <Icon icon={faXmark} width={14} aria-hidden />
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-px">
              <div className="flex flex-col gap-[8px] px-[20px] pb-[20px]">
                {showStatusFilter ? (
                  <>
                    <OrderManagementFilterAccordionTrigger
                      expanded={statusSectionOpen}
                      onPress={() => setStatusSectionOpen((o) => !o)}
                      label={MOBILE_ORDER_STATUS_SECTION}
                    />
                    {statusSectionOpen ? (
                      <OrderManagementStatusFilterList
                        tabFields={tabFields}
                        statusDraft={statusDraft}
                        toggleStatusDraftOption={toggleStatusDraftOption}
                        groupLegend={MOBILE_ORDER_STATUS_SECTION}
                      />
                    ) : null}
                  </>
                ) : null}

                {showBeltFilter ? (
                  <>
                    <OrderManagementFilterAccordionTrigger
                      expanded={beltSectionOpen}
                      onPress={() => setBeltSectionOpen((o) => !o)}
                      label={
                        tabFields.BeltFilterLabel?.value ? (
                          <Text field={tabFields.BeltFilterLabel} tag="span" />
                        ) : (
                          MOBILE_BELT_SECTION_FALLBACK
                        )
                      }
                    />
                    {beltSectionOpen ? (
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
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col border-t border-[var(--color-border-gray)] px-[20px] py-[12px]">
              <OrderManagementBeltFilterFooter
                clearLabel={t(I18N.BeltClear)}
                applyLabel={t(I18N.BeltApply)}
                hasSelection={mobileFilterHasSelection}
                hasAppliedFilters={mobileFilterHasApplied}
                onClear={handleMobileFilterClearAll}
                onApply={handleMobileFilterApply}
              />
            </div>
          </div>
        </div>
      ) : null}

      {isListingCompactViewport && mobileSheet === "date" ? (
        <div
          className={sheetBackdropClass}
          role="presentation"
          onClick={() => setMobileSheet(null)}
        >
          <div
            ref={dateSheetPanelRef}
            tabIndex={-1}
            className="flex w-full max-h-[min(85dvh,720px)] flex-col overflow-hidden rounded-t-[16px] border border-b-0 border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] shadow-[var(--color-shadow-dropdown)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-mgmt-mobile-date-title"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-3 pt-3 pb-0">
              <h2
                id="order-mgmt-mobile-date-title"
                className="m-0 text-[16px] font-semibold text-[var(--color-text-heading-color)]"
              >
                {MOBILE_DATE_SHEET_TITLE}
              </h2>
              <Button
                type="button"
                variant="ghost"
                btnVariant="iconBtn"
                className="!h-[36px] !min-w-[36px] !w-[36px] shrink-0 rounded-full bg-[var(--color-bg-lighter-gray)] text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-light-gray-active)]"
                onPress={() => setMobileSheet(null)}
                aria-label="Close"
              >
                <Icon icon={faXmark} width={16} aria-hidden />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3 pb-3">
              <OrderManagementDatePanel orderManagement={orderManagement} embedded={false} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
