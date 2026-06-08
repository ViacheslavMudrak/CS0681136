"use client";

import React from "react";

import { Text } from "@sitecore-content-sdk/nextjs";
import { Checkbox, Icon } from "@laitram-l-l-c/intralox-ui-components";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

import SearchIcon from "src/components/shared/icons/SearchIcon";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { BeltSelections } from "@/lib/orderManagementUtils";
import { filterLabelToStatusKey } from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";

import type {
  BeltSubgroupMetaRow,
  OrderManagementTabFields,
  OrderManagementValueItem,
} from "../OrderManagement.type";

export interface OrderManagementFilterAccordionTriggerProps {
  expanded: boolean;
  onPress: () => void;
  label: React.ReactNode;
  ariaLabel?: string;
}

export function OrderManagementFilterAccordionTrigger({
  expanded,
  onPress,
  label,
  ariaLabel,
}: OrderManagementFilterAccordionTriggerProps): React.ReactElement {
  return (
    <Button
      type="button"
      variant="transparent"
      className={cn(
        "flex w-full items-center gap-[4px] rounded-[4px] border-0 cursor-pointer text-left !min-h-0 bg-[var(--color-bg-selected-tint)] p-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-basic-color)] focus-visible:ring-offset-2",
        expanded && "bg-[var(--color-bg-selected-tint)]"
      )}
      onPress={onPress}
      aria-expanded={expanded}
      aria-label={ariaLabel}
    >
      <span
        className={
          "flex-1 min-w-0 text-[13px] leading-[1.25] text-[var(--color-text-heading-color)]"
        }
      >
        {label}
      </span>
      <Icon
        icon={expanded ? faChevronUp : faChevronDown}
        width={12}
        className={"shrink-0 text-[var(--color-text-basic)]"}
        aria-hidden
      />
    </Button>
  );
}

export interface OrderManagementStatusFilterListProps {
  tabFields: OrderManagementTabFields;
  statusDraft: Set<string>;
  toggleStatusDraftOption: (label: string) => void;
  groupLegend?: string;
}

export function OrderManagementStatusFilterList({
  tabFields,
  statusDraft,
  toggleStatusDraftOption,
  groupLegend,
}: OrderManagementStatusFilterListProps): React.ReactElement {
  const rows = (tabFields.FilterOptions ?? []).map((opt: OrderManagementValueItem) => {
    const label =
      opt.fields?.StatusValue?.value ?? opt.fields?.Value?.value ?? opt.displayName ?? "";
    const key = filterLabelToStatusKey(String(label), tabFields);
    const checked = key ? statusDraft.has(key) : false;
    return (
      <label key={opt.id} className={"flex gap-[8px] items-center w-full cursor-pointer"}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggleStatusDraftOption(String(label))}
        />
        <span
          className={
            "flex-1 min-w-0 text-[12px] leading-[1.375] text-[var(--color-text-heading-color)]"
          }
        >
          {opt.fields?.StatusValue || opt.fields?.Value ? (
            <Text field={opt.fields?.StatusValue ?? opt.fields?.Value} tag="span" />
          ) : (
            label
          )}
        </span>
      </label>
    );
  });

  const legendText = groupLegend?.trim();
  if (legendText) {
    return (
      <fieldset
        className={cn("flex flex-col gap-[14px] px-[8px] py-[10px]", "m-0 min-w-0 border-0")}
      >
        <legend className="sr-only">{legendText}</legend>
        {rows}
      </fieldset>
    );
  }

  return <div className={"flex flex-col gap-[14px] px-[8px] py-[10px]"}>{rows}</div>;
}

export interface OrderManagementBeltFilterGroupsProps {
  beltSubgroupMeta: BeltSubgroupMetaRow[];
  beltSearch: Record<string, string>;
  setBeltSearch: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  beltDraft: BeltSelections;
  toggleBeltDraft: (group: keyof BeltSelections, value: string) => void;
  scrollThreshold: number;
  searchThreshold: number;
  beltSearchPh: string;
}

export function OrderManagementBeltFilterGroups({
  beltSubgroupMeta,
  beltSearch,
  setBeltSearch,
  beltDraft,
  toggleBeltDraft,
  scrollThreshold,
  searchThreshold,
  beltSearchPh,
}: OrderManagementBeltFilterGroupsProps): React.ReactElement {
  return (
    <div
      className={
        "flex max-w-full flex-row flex-wrap items-stretch justify-start gap-3 px-[8px] py-[10px]"
      }
    >
      {beltSubgroupMeta.map((sub: BeltSubgroupMetaRow) => {
        const q = (beltSearch[sub.key] ?? "").trim().toLowerCase();
        const opts = sub.options.filter((o: string) => o.toLowerCase().includes(q));
        const listScrollable = sub.options.length > scrollThreshold;
        const showCategorySearch = sub.options.length > searchThreshold;
        const groupLabel = String(sub.label ?? "").trim();
        return (
          <div
            key={sub.key}
            className={
              "flex max-w-full flex-1 flex-col gap-[8px] rounded-[2px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] p-[10px] pl-[9px] pr-[9px]"
            }
          >
            <div
              className={"text-[12px] font-bold uppercase text-[var(--color-text-heading-color)]"}
            >
              {sub.labelField ? <Text field={sub.labelField} tag="span" /> : null}
            </div>
            {showCategorySearch ? (
              <div className={"relative w-full"}>
                <span
                  className={
                    "absolute left-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-basic)]"
                  }
                  aria-hidden
                >
                  <SearchIcon width={14} height={14} decorative />
                </span>
                <Input
                  type="search"
                  className={
                    "w-full h-[40px] rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] pl-[36px] pr-[12px] text-[14px] text-[var(--color-text-heading-color)] placeholder:text-[var(--color-text-basic)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-basic-color)]"
                  }
                  placeholder={beltSearchPh}
                  value={beltSearch[sub.key] ?? ""}
                  onChange={(e) =>
                    setBeltSearch((prev: Record<string, string>) => ({
                      ...prev,
                      [sub.key]: e.target.value,
                    }))
                  }
                  aria-label={
                    beltSearchPh && groupLabel
                      ? `${beltSearchPh} ${groupLabel}`
                      : groupLabel || beltSearchPh
                  }
                />
              </div>
            ) : null}
            <div
              className={
                listScrollable
                  ? "max-h-[200px] overflow-y-auto pr-[4px] flex flex-col gap-[8px]"
                  : "flex flex-col gap-[8px]"
              }
            >
              {opts.map((opt: string) => (
                <label
                  key={opt}
                  className={
                    "flex items-center gap-[8px] text-[12px] leading-[1.375] text-[var(--color-text-heading-color)] cursor-pointer"
                  }
                >
                  <input
                    type="checkbox"
                    checked={beltDraft[sub.key].has(opt)}
                    onChange={() => toggleBeltDraft(sub.key, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface OrderManagementBeltFilterFooterProps {
  clearLabel: string;
  applyLabel: string;
  /** Draft checkbox selections in the belt filter panel. */
  hasSelection: boolean;
  /** Applied belt filter count (committed filters), e.g. beltCount > 0. */
  hasAppliedFilters?: boolean;
  onClear: () => void;
  onApply: () => void;
}

/**
 * Clear + outlined Apply row (mobile combined sheet and desktop belt popover).
 */
export function OrderManagementBeltFilterFooter({
  clearLabel,
  applyLabel,
  hasSelection,
  hasAppliedFilters = false,
  onClear,
  onApply,
}: OrderManagementBeltFilterFooterProps): React.ReactElement {
  const canApply = hasSelection || hasAppliedFilters;

  return (
    <div className={"flex items-center justify-end gap-3 shrink-0 w-full"}>
     {hasSelection && <Button
        type="button"
        variant="transparent"
        className={
          "!min-h-0 !h-auto !p-0 !px-0 !py-0 rounded-[4px] text-[12px] leading-[1.375] font-normal shadow-none text-[var(--color-action-primary)] underline-offset-2 hover:underline hover:!bg-transparent active:!bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-basic-color)]"
        }
        onPress={onClear}
      >
        {clearLabel}
      </Button>}
      <Button
        type="button"
        variant="transparent"
        className={cn(
          "!min-h-[36px] !h-auto !px-[18px] !py-[6px] rounded-full border shadow-none bg-transparent text-[12px] leading-[1.375] font-normal focus-visible:ring-2 focus-visible:ring-[var(--color-border-basic-color)]",
          canApply
            ? "border-[var(--color-action-primary)] text-[var(--color-action-primary)] hover:bg-[var(--color-action-primary-hover)] active:bg-[var(--color-action-primary-hover)]"
            : "!border-[var(--color-border-gray)] text-[var(--color-text-basic)] cursor-not-allowed hover:!bg-transparent active:!bg-transparent disabled:!opacity-100"
        )}
        onPress={onApply}
        isDisabled={!canApply}
        aria-disabled={!canApply}
        aria-label={!canApply ? "No selection" : applyLabel}
      >
        {applyLabel}
      </Button>
    </div>
  );
}
