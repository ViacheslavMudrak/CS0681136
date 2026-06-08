"use client";

import { useTranslations } from "next-intl";
import React, { useMemo, useRef } from "react";
import { flushSync } from "react-dom";
import LibraryIcon from "@/components/shared/icons/Icon";
import Button from "@/components/ui/Button";
import { I18N } from "@/lib/dictionary-keys";

import type { OrderManagementDatePresetItem } from "../OrderManagement.type";
import {
  MOBILE_DATE_PRESET_SELECT_LABEL,
  MOBILE_FILTERS_CLEAR_ALL,
  PRESET_CUSTOM_ID,
} from "../orderManagementLabels";
import {
  OrderManagementDateRangeField,
  type OrderManagementDateRangeFieldHandle,
} from "./OrderManagementDateRangeField";
import { OrderManagementRangeCalendar } from "./OrderManagementRangeCalendar";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { isCustomPresetItem } from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";



/** Draft preset uses {@link PRESET_CUSTOM_ID} while CMS Custom row has its own item id. */
function isDraftPresetActive(p: OrderManagementDatePresetItem, draftPresetId: string): boolean {
  if (draftPresetId === p.id) return true;
  return isCustomPresetItem(p) && draftPresetId === PRESET_CUSTOM_ID;
}

export function OrderManagementDatePanel({
  orderManagement,
  embedded,
  fixedDropdownLayout,
}: {
  orderManagement: OrderManagementShell;
  embedded: boolean;
  /** Desktop toolbar: `position:fixed` rect from viewport (see OrderManagementToolbar). */
  fixedDropdownLayout?: { top: number; left: number; width: number };
}): React.ReactElement {
  const t = useTranslations();
  const {
    tabFields,
    locale,
    isListingCompactViewport,
    draftPresetId,
    draftStartStr,
    draftEndStr,
    applyPresetRange,
    applyDatePanel,
    clearDatePanel,
    datePanelApplyDisabled,
    draftRangeCalendarValue,
    draftCalendarViewFocus,
    onDraftRangeCalendarChange,
    rangeCalendarBounds,
    onDraftStartStrChange,
    onDraftEndStrChange,
    onDraftStartFocus,
    onDraftEndFocus,
    onDraftInvalidYearFieldsChange,
    validationMessage,
    rangeConstraintInvalid,
    rangeInvalid,
    allowCustomDateRange,
  } = orderManagement;

  const presets = useMemo(() => {
    const raw = tabFields?.DatePickerSelection ?? [];
    if (allowCustomDateRange === false) {
      return raw.filter((p) => !isCustomPresetItem(p));
    }
    return raw;
  }, [tabFields?.DatePickerSelection, allowCustomDateRange]);
  const dateRangeFieldRef = useRef<OrderManagementDateRangeFieldHandle | null>(null);
  /** Wraps calendar + inputs + presets so mousedown on those does not run date-field "outside" flush. */
  const dateRangeCommitBoundaryRef = useRef<HTMLDivElement>(null);
  /**
   * Remount the calendar when switching *presets* with the same YMD (e.g. Last 7 days vs last week)
   * so the focused month/selection state refreshes. For Custom, keep a stable key so changing
   * dates in the range picker does not remount on every change (avoids two-click / broken selection).
   */
  const rangeCalendarMountKey =
    draftPresetId === PRESET_CUSTOM_ID
      ? "om-rc-custom"
      : `${draftPresetId}|${draftStartStr}|${draftEndStr}`;

  const handleApplyDatePanel = () => {
    const flushedRange = flushSync(() => {
      return dateRangeFieldRef.current?.flush();
    });
    applyDatePanel(undefined, flushedRange);
  };

  const presetSelectValue = (() => {
    if (presets.some((p) => p.id === draftPresetId)) return draftPresetId;
    const customItem = presets.find((x) => isCustomPresetItem(x));
    if (customItem && draftPresetId === PRESET_CUSTOM_ID) return customItem.id;
    return presets[0]?.id ?? "";
  })();

  const manualDateLocked = allowCustomDateRange === false;

  const dateRangeField = (
    <OrderManagementDateRangeField
      ref={dateRangeFieldRef}
      locale={locale}
      draftStartStr={draftStartStr}
      draftEndStr={draftEndStr}
      onDraftStartStrChange={onDraftStartStrChange}
      onDraftEndStrChange={onDraftEndStrChange}
      onDraftStartFocus={onDraftStartFocus}
      onDraftEndFocus={onDraftEndFocus}
      rangeConstraintInvalid={rangeConstraintInvalid}
      onDraftInvalidYearFieldsChange={onDraftInvalidYearFieldsChange}
      readOnly={manualDateLocked}
      useClickOutsideRootRef={dateRangeCommitBoundaryRef}
    />
  );

  const validationBlock =
    rangeInvalid && validationMessage ? (
      <div className={"flex gap-[8px] items-center text-[14px] font-[400] text-[#9F0712] bg-[#FEF2F2] border-[#FFC9C9] p-[10px] rounded-[6px]"} role="alert">
        {/* TODO: Update icon from Pro library */}
        <LibraryIcon
          width={18}
          height={18}
          viewBox="0 0 18 18"
          aria-hidden
          className="shrink-0 text-[var(--color-text-red)]"
        >
          <path
            d="M8.00016 14.6667C11.6821 14.6667 14.6668 11.6819 14.6668 8.00004C14.6668 4.31814 11.6821 1.33337 8.00016 1.33337C4.31826 1.33337 1.3335 4.31814 1.3335 8.00004C1.3335 11.6819 4.31826 14.6667 8.00016 14.6667Z"
            stroke="#E7000B"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8 5.33337V8.00004"
            stroke="#E7000B"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8 10.6666H8.00667"
            stroke="#E7000B"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </LibraryIcon>

        <span>{validationMessage}</span>
      </div>
    ) : null;

  const calendarBlock = (
    <div className={"overflow-x-visible w-full min-w-0 overflow-x-auto"}>
      <OrderManagementRangeCalendar
        key={rangeCalendarMountKey}
        locale={locale}
        value={draftRangeCalendarValue}
        viewFocusDate={draftCalendarViewFocus}
        onChange={onDraftRangeCalendarChange}
        calendarBounds={rangeCalendarBounds}
        isMobile={isListingCompactViewport}
        isReadOnly={manualDateLocked}
      />
    </div>
  );

  if (isListingCompactViewport) {
    return (
      <div
        className={cn(
          "rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] flex flex-col lg:flex-row overflow-hidden shadow-[var(--color-portal-switch-modal-shadow)]",
          "flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-transparent shadow-none",
          embedded && fixedDropdownLayout
            ? "fixed z-99 flex max-h-[min(90vh,720px)] min-h-0 overflow-hidden"
            : embedded
              ? "absolute z-30 mt-[6px] right-0 left-auto w-[min(100vw-24px,920px)] max-w-[calc(100vw-24px)]"
              : cn("flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-transparent shadow-none relative w-full max-w-none mt-0 shadow-[none]", "relative")
        )}
        style={
          embedded && fixedDropdownLayout
            ? {
                top: fixedDropdownLayout.top,
                left: fixedDropdownLayout.left,
                width: fixedDropdownLayout.width,
              }
            : undefined
        }
      >
        <div ref={dateRangeCommitBoundaryRef} className={"[display:contents]"}>
          <div className={"w-full shrink-0 pb-[12px] shrink-0"}>
            <label htmlFor="om-date-preset-select" className={"absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"}>
              {MOBILE_DATE_PRESET_SELECT_LABEL}
            </label>
            <select
              id="om-date-preset-select"
              className={"h-[40px] w-full cursor-pointer appearance-none rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] px-[12px] pr-[36px] text-[14px] font-medium text-[var(--color-text-heading-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)]"}
              value={presetSelectValue}
              onChange={(e) => applyPresetRange(e.target.value)}
            >
              {presets.map((p: OrderManagementDatePresetItem) => (
                <option key={p.id} value={p.id}>
                  {p.fields?.PresentLabel?.value ?? p.displayName ?? ""}
                </option>
              ))}
            </select>
          </div>

          <div className={"flex flex-1 min-h-0 min-w-0 flex-col gap-0 p-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden flex min-h-0 flex-1 flex-col overflow-hidden flex-1 p-[16px] lg:pl-[24px] lg:pr-[24px] lg:pt-[24px] lg:pb-[24px] flex flex-col gap-[12px]"}>
            <div className={"flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto overscroll-y-contain"}>
              <div className={"w-full min-w-0"} aria-live="polite">
                {dateRangeField}
              </div>
              {calendarBlock}
              {validationBlock}
            </div>
            <div className={"flex w-full shrink-0 flex-row items-center justify-between gap-4 border-t border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] pt-3 pb-[max(12px,env(safe-area-inset-bottom,0px))]"}>
              <Button
                type="button"
                variant="transparent"
                className={"cursor-pointer border-0 bg-transparent p-0 text-[14px] font-medium text-[var(--color-action-primary)] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)]"}
                onPress={clearDatePanel}
              >
                {MOBILE_FILTERS_CLEAR_ALL}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={"h-[40px] min-w-[88px] shrink-0 rounded-[8px] border-2 border-[var(--color-action-primary)] bg-[var(--color-bg-basic-color)] px-[20px] text-[13px] font-medium text-[var(--color-action-primary)] hover:bg-[var(--color-bg-selected-tint)] focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40"}
                isDisabled={datePanelApplyDisabled}
                onPress={handleApplyDatePanel}
              >
                {t(I18N.DateApply)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] flex flex-col lg:flex-row overflow-hidden shadow-[var(--color-portal-switch-modal-shadow)]",
        embedded && fixedDropdownLayout
          ? "fixed z-99 flex max-h-[min(90vh,720px)] min-h-0 overflow-hidden"
          : embedded
            ? "absolute z-30 mt-[6px] right-0 left-auto w-[min(100vw-24px,920px)] max-w-[calc(100vw-24px)]"
            : cn("flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-transparent shadow-none relative w-full max-w-none mt-0 shadow-[none]", "relative")
      )}
      style={
        embedded && fixedDropdownLayout
          ? {
              top: fixedDropdownLayout.top,
              left: fixedDropdownLayout.left,
              width: fixedDropdownLayout.width,
            }
          : undefined
      }
    >
      <div ref={dateRangeCommitBoundaryRef} className={"[display:contents]"}>
        <div className={"flex flex-row lg:flex-col gap-[2px] p-[12px] border-b lg:border-b-0 lg:border-r border-[var(--color-border-gray)] bg-[var(--color-bg-lighter-gray)] overflow-x-auto lg:min-w-[150px]"}>
          {presets.map((p: OrderManagementDatePresetItem) => (
            <Button
              key={p.id}
              type="button"
              variant="transparent"
              className={cn(
                "w-full min-w-0 justify-start text-left text-[14px] font-medium py-[8px] px-[10px] rounded-[4px] whitespace-break-spaces break-words lg:whitespace-normal text-[var(--color-text-heading-color)] border border-transparent hover:bg-[var(--color-bg-basic-color)] focus:outline-none focus-visible:ring-2",
                isDraftPresetActive(p, draftPresetId) && "bg-[var(--color-bg-selected-tint)] border-[var(--color-border-basic-color)] text-[var(--color-action-primary)]"
              )}
              onPress={() => applyPresetRange(p.id)}
            >
              {p.fields?.PresentLabel?.value ?? p.displayName ?? ""}
            </Button>
          ))}
        </div>
        <div className={"flex flex-1 min-h-0 min-w-0 flex-col gap-0 p-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden flex min-h-0 flex-1 flex-col overflow-hidden flex-1 p-[16px] lg:pl-[24px] lg:pr-[24px] lg:pt-[24px] lg:pb-[24px] flex flex-col gap-[12px]"}>
          {calendarBlock}
          {validationBlock}
          <div className={"flex flex-nowrap justify-between items-center gap-[8px] w-full min-w-0"} aria-live="polite">
            {dateRangeField}

            <div className="flex justify-end gap-[12px]">
              <Button
                type="button"
                variant="inverse"
                border
                className="h-[34px]"
                onPress={clearDatePanel}
              >
                {t(I18N.DateClear)}
              </Button>
              <Button
                type="button"
                variant="primary"
                className="h-[34px]"
                isDisabled={datePanelApplyDisabled}
                onPress={handleApplyDatePanel}
              >
                {t(I18N.DateApply)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
