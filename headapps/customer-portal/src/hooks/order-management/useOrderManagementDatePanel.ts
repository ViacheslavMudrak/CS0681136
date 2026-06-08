import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import {
  DATE_RANGE_END_BEFORE_START_FALLBACK,
  DATE_RANGE_INVALID_YEAR_FALLBACK,
  DATE_RANGE_OUTSIDE_ROLLING_FALLBACK,
  MAX_DATE_RANGE_DAYS,
  DATE_RANGE_SPAN_EXCEEDS_ROLLING_FALLBACK,
  PRESET_CUSTOM_ID,
  PRESET_LAST_12_MONTHS_ID,
  PRESET_NONE_ID,
} from "@/components/core/OrderManagement/orderManagementLabels";
import {
  datesToRangeValue,
  rangeValueToDates,
  type RangeCalendarValue,
} from "@/components/core/OrderManagement/partial/OrderManagementRangeCalendar";
import { parseDate, type CalendarDate } from "@internationalized/date";
import {
  dateRangeFromPresetItem,
  endOfDayClone,
  getDefaultLast12MonthsRange,
  isCustomPresetItem,
  isDateRangeWithinCalendarBounds,
  isInvalidOrderManagementDraftYmd,
  parseIsoYmdToLocalDate,
  rangeSpanExceedsMaxCalendarDays,
  resolveAppliedDatePresetId,
  resolveDefaultPresetFromCms,
  startOfDayClone,
  toLocalYmd,
  type DateRangeValue,
} from "@/lib/orderManagementUtils";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function draftStrToCalendarDate(s: string): CalendarDate | null {
  const t = s.trim();
  if (!t || !parseIsoYmdToLocalDate(t)) return null;
  try {
    return parseDate(t.slice(0, 10));
  } catch {
    return null;
  }
}

function draftStringsToRangeCalendarValue(
  draftStartStr: string,
  draftEndStr: string
): RangeCalendarValue | null {
  const start = parseIsoYmdToLocalDate(draftStartStr.trim());
  const end = parseIsoYmdToLocalDate(draftEndStr.trim());
  if (start && end) return datesToRangeValue(start, end);
  if (start) return datesToRangeValue(start, start);
  if (end) return datesToRangeValue(end, end);
  return null;
}

export interface UseOrderManagementDatePanelParams {
  tabFields: OrderManagementTabFields | undefined;
  rollingDurationDays: number | null;
  dateRange: DateRangeValue | null;
  setDateRange: Dispatch<SetStateAction<DateRangeValue | null>>;
  selectedPresetId: string;
  setSelectedPresetId: Dispatch<SetStateAction<string>>;
  setOpenDate: Dispatch<SetStateAction<boolean>>;
  setMobileSheet: Dispatch<SetStateAction<"filters" | "date" | null>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  allowCustomDateRange?: boolean;
  locale?: string;
}

export type DraftDateRangeStrings = {
  startYmd: string;
  endYmd: string;
};

function parseDraftDateRange(startYmd: string, endYmd: string): DateRangeValue | null {
  const s = parseIsoYmdToLocalDate(startYmd.trim());
  const e = parseIsoYmdToLocalDate(endYmd.trim());
  if (!s || !e) return null;
  const start = startOfDayClone(s);
  const end = endOfDayClone(e);
  if (end < start) return null;
  return { start, end };
}

function draftRangeEndBeforeStart(startYmd: string, endYmd: string): boolean {
  const s = parseIsoYmdToLocalDate(startYmd.trim());
  const e = parseIsoYmdToLocalDate(endYmd.trim());
  if (!s || !e) return false;
  return endOfDayClone(e) < startOfDayClone(s);
}

/**
 * Date-range popover / sheet: draft state, validation, apply/clear (shared across OM tabs).
 */
export function useOrderManagementDatePanel({
  tabFields,
  rollingDurationDays,
  dateRange,
  setDateRange,
  selectedPresetId,
  setSelectedPresetId,
  setOpenDate,
  setMobileSheet,
  setCurrentPage,
  allowCustomDateRange = true,
  locale = "en",
}: UseOrderManagementDatePanelParams) {
  const datePresetOptions = useMemo(() => ({ locale }), [locale]);
  const [draftRange, setDraftRange] = useState<DateRangeValue | null>(null);
  const [draftPresetId, setDraftPresetId] = useState<string>(PRESET_NONE_ID);
  const [draftStartStr, setDraftStartStr] = useState("");
  const [draftEndStr, setDraftEndStr] = useState("");
  const [draftInvalidYearFields, setDraftInvalidYearFields] = useState({
    start: false,
    end: false,
  });
  const [calendarFocusSide, setCalendarFocusSide] = useState<"start" | "end">("start");

  const openDatePanel = useCallback(() => {
    setCalendarFocusSide("start");
    setDraftInvalidYearFields({ start: false, end: false });
    setDraftRange(dateRange);
    const presets = tabFields?.DatePickerSelection ?? [];
    setDraftPresetId(
      dateRange
        ? resolveAppliedDatePresetId(selectedPresetId, dateRange, presets, datePresetOptions)
        : selectedPresetId
    );
    if (dateRange) {
      setDraftStartStr(toLocalYmd(dateRange.start));
      setDraftEndStr(toLocalYmd(dateRange.end));
    } else {
      setDraftStartStr("");
      setDraftEndStr("");
    }
    setOpenDate(true);
  }, [dateRange, datePresetOptions, selectedPresetId, setOpenDate, tabFields?.DatePickerSelection]);

  const applyPresetRange = useCallback(
    (presetId: string) => {
      if (presetId === PRESET_LAST_12_MONTHS_ID) {
        const r = getDefaultLast12MonthsRange();
        setDraftPresetId(presetId);
        setDraftRange(r);
        setDraftStartStr(toLocalYmd(r.start));
        setDraftEndStr(toLocalYmd(r.end));
        setDraftInvalidYearFields({ start: false, end: false });
        return;
      }

      if (presetId === PRESET_CUSTOM_ID) {
        if (!allowCustomDateRange) return;
        setDraftPresetId(PRESET_CUSTOM_ID);
        return;
      }

      const presets = tabFields?.DatePickerSelection ?? [];
      const item = presets.find((p) => p.id === presetId);
      if (!item) return;

      if (isCustomPresetItem(item)) {
        if (!allowCustomDateRange) return;
        setDraftPresetId(PRESET_CUSTOM_ID);
        return;
      }

      const r = dateRangeFromPresetItem(item, datePresetOptions);
      if (!r) return;

      setDraftPresetId(presetId);
      setDraftRange(r);
      setDraftStartStr(toLocalYmd(r.start));
      setDraftEndStr(toLocalYmd(r.end));
      setDraftInvalidYearFields({ start: false, end: false });
    },
    [allowCustomDateRange, datePresetOptions, tabFields?.DatePickerSelection]
  );

  const onDraftRangeCalendarChange = useCallback(
    (rv: RangeCalendarValue | null) => {
      if (!allowCustomDateRange) return;
      const parsed = rangeValueToDates(rv);
      if (!parsed) {
        setDraftPresetId(PRESET_NONE_ID);
        setDraftRange(null);
        setDraftStartStr("");
        setDraftEndStr("");
        return;
      }
      // Ignore no-op updates (controlled value sync, remount, or same range) so preset id is not
      // forced to Custom when the user selected a fixed preset with the same YMD, or on first paint.
      if (draftRange) {
        const sameYmd =
          toLocalYmd(parsed.start) === toLocalYmd(draftRange.start) &&
          toLocalYmd(parsed.end) === toLocalYmd(draftRange.end);
        if (sameYmd) {
          return;
        }
      }
      setDraftPresetId(PRESET_CUSTOM_ID);
      setDraftRange(parsed);
      setDraftStartStr(toLocalYmd(parsed.start));
      setDraftEndStr(toLocalYmd(parsed.end));
      setDraftInvalidYearFields({ start: false, end: false });
    },
    [allowCustomDateRange, draftRange]
  );

  const parsedDraftRange = useMemo(
    () => parseDraftDateRange(draftStartStr, draftEndStr),
    [draftStartStr, draftEndStr]
  );

  const draftEndBeforeStart = useMemo(() => {
    return draftRangeEndBeforeStart(draftStartStr, draftEndStr);
  }, [draftStartStr, draftEndStr]);

  useEffect(() => {
    if (!parsedDraftRange) return;
    setDraftRange((prev) => {
      if (!prev) return parsedDraftRange;
      if (
        prev.start.getTime() === parsedDraftRange.start.getTime() &&
        prev.end.getTime() === parsedDraftRange.end.getTime()
      ) {
        return prev;
      }
      return parsedDraftRange;
    });
  }, [parsedDraftRange]);

  const onDraftStartStrChange = useCallback(
    (v: string) => {
      if (!allowCustomDateRange) return;
      setCalendarFocusSide("start");
      setDraftStartStr((prev) => {
        if (prev !== v) {
          setDraftPresetId(PRESET_CUSTOM_ID);
        }
        return v;
      });
    },
    [allowCustomDateRange]
  );

  const onDraftEndStrChange = useCallback(
    (v: string) => {
      if (!allowCustomDateRange) return;
      setCalendarFocusSide("end");
      setDraftEndStr((prev) => {
        if (prev !== v) {
          setDraftPresetId(PRESET_CUSTOM_ID);
        }
        return v;
      });
    },
    [allowCustomDateRange]
  );

  const onDraftStartFocus = useCallback(() => {
    setCalendarFocusSide("start");
  }, []);

  const onDraftEndFocus = useCallback(() => {
    setCalendarFocusSide("end");
  }, []);

  const onDraftInvalidYearFieldsChange = useCallback(
    (next: { start: boolean; end: boolean }) => {
      setDraftInvalidYearFields(next);
    },
    []
  );

  const draftInvalidYear = draftInvalidYearFields.start || draftInvalidYearFields.end;

  const rangeExceedsTwelveMonths = useMemo(
    () =>
      parsedDraftRange != null &&
      rangeSpanExceedsMaxCalendarDays(
        parsedDraftRange.start,
        parsedDraftRange.end,
        MAX_DATE_RANGE_DAYS
      ),
    [parsedDraftRange]
  );

  const rangeOutsideRollingWindow = useMemo(
    () =>
      rollingDurationDays != null &&
      parsedDraftRange != null &&
      !isDateRangeWithinCalendarBounds(
        parsedDraftRange.start,
        parsedDraftRange.end,
        rollingDurationDays
      ),
    [parsedDraftRange, rollingDurationDays]
  );

  const rangeConstraintInvalid =
    draftEndBeforeStart || rangeExceedsTwelveMonths || rangeOutsideRollingWindow;

  const rangeInvalid = draftInvalidYear || rangeConstraintInvalid;

  const parsedDraftRangeRef = useRef<DateRangeValue | null>(null);
  const rangeInvalidRef = useRef(false);
  const draftPresetIdRef = useRef(draftPresetId);
  parsedDraftRangeRef.current = parsedDraftRange;
  rangeInvalidRef.current = rangeInvalid;
  draftPresetIdRef.current = draftPresetId;

  const validationMessage = useMemo(() => {
    if (!tabFields) return "";

    if (draftInvalidYear) {
      return (
        tabFields.DateRangeInvalidYearMessage?.value?.trim() ||
        DATE_RANGE_INVALID_YEAR_FALLBACK
      );
    }
    if (draftEndBeforeStart) {
      return (
        tabFields.DateRangeEndBeforeStartMessage?.value?.trim() ||
        DATE_RANGE_END_BEFORE_START_FALLBACK
      );
    }
    if (rangeExceedsTwelveMonths) {
      return (
        tabFields.DateRangeExceedsMaxSpanMessage?.value?.trim() ||
        tabFields.ValidationError?.value?.trim() ||
        DATE_RANGE_SPAN_EXCEEDS_ROLLING_FALLBACK
      );
    }
    if (rangeOutsideRollingWindow) {
      return (
        tabFields.DateRangeOutsideCalendarBoundsMessage?.value?.trim() ||
        DATE_RANGE_OUTSIDE_ROLLING_FALLBACK
      );
    }
    return "";
  }, [
    draftEndBeforeStart,
    draftInvalidYear,
    rangeExceedsTwelveMonths,
    rangeOutsideRollingWindow,
    tabFields,
  ]);

  const draftRangeCalendarValue = useMemo((): RangeCalendarValue | null => {
    if (rangeInvalid) return null;
    return draftStringsToRangeCalendarValue(draftStartStr, draftEndStr);
  }, [draftStartStr, draftEndStr, rangeInvalid]);

  const draftCalendarViewFocus = useMemo((): CalendarDate | null => {
    const primary =
      calendarFocusSide === "end"
        ? draftStrToCalendarDate(draftEndStr)
        : draftStrToCalendarDate(draftStartStr);
    if (primary) return primary;
    const fallback =
      calendarFocusSide === "end"
        ? draftStrToCalendarDate(draftStartStr)
        : draftStrToCalendarDate(draftEndStr);
    return fallback;
  }, [calendarFocusSide, draftEndStr, draftStartStr]);

  /**
   * @param committedPresetId - Optional override for the draft preset id at commit time. Omit so commit uses
   * {@link draftPresetIdRef} after {@link OrderManagementDateRangeField} `flush()` (Apply must read preset
   * state post-flush so manual input commits can set {@link PRESET_CUSTOM_ID} before resolve).
   * @param committedRangeStrings - Optional manual input strings returned by the date field flush. When present,
   * validation runs against these exact strings so Apply cannot commit a stale pre-flush range.
   */
  const applyDatePanel = useCallback(
    (committedPresetId?: string, committedRangeStrings?: DraftDateRangeStrings) => {
      const parsed = committedRangeStrings
        ? parseDraftDateRange(committedRangeStrings.startYmd, committedRangeStrings.endYmd)
        : parsedDraftRangeRef.current;
      const invalid = committedRangeStrings
        ? isInvalidOrderManagementDraftYmd(committedRangeStrings.startYmd) ||
          isInvalidOrderManagementDraftYmd(committedRangeStrings.endYmd) ||
          draftRangeEndBeforeStart(committedRangeStrings.startYmd, committedRangeStrings.endYmd) ||
          (parsed != null &&
            (rangeSpanExceedsMaxCalendarDays(parsed.start, parsed.end, MAX_DATE_RANGE_DAYS) ||
              (rollingDurationDays != null &&
                !isDateRangeWithinCalendarBounds(parsed.start, parsed.end, rollingDurationDays))))
        : rangeInvalidRef.current;
      if (parsed == null || invalid) {
        return null;
      }
      setDateRange(parsed);
      const rawPresetId = committedPresetId ?? draftPresetIdRef.current;
      setSelectedPresetId(
        resolveAppliedDatePresetId(
          rawPresetId,
          parsed,
          tabFields?.DatePickerSelection,
          datePresetOptions
        )
      );
      setOpenDate(false);
      setMobileSheet(null);
      setCurrentPage(1);
      return parsed;
    },
    [
      setCurrentPage,
      setDateRange,
      setMobileSheet,
      setOpenDate,
      setSelectedPresetId,
      datePresetOptions,
      rollingDurationDays,
      tabFields?.DatePickerSelection,
    ]
  );

  const clearDatePanel = useCallback(() => {
    const { presetId, range } = resolveDefaultPresetFromCms(tabFields ?? {}, datePresetOptions);
    setDraftInvalidYearFields({ start: false, end: false });
    setDraftRange(range);
    setDateRange(range);
    setSelectedPresetId(presetId);
    setDraftPresetId(presetId);
    if (range) {
      setDraftStartStr(toLocalYmd(range.start));
      setDraftEndStr(toLocalYmd(range.end));
    } else {
      setDraftStartStr("");
      setDraftEndStr("");
    }
    setCurrentPage(1);
  }, [setCurrentPage, setDateRange, setSelectedPresetId, datePresetOptions, tabFields]);

  const defaultDatePreset = useMemo(
    () => resolveDefaultPresetFromCms(tabFields ?? {}, datePresetOptions),
    [datePresetOptions, tabFields]
  );

  const datePanelApplyDisabled =
    draftStartStr.trim() === "" ||
    draftEndStr.trim() === "" ||
    parsedDraftRange === null ||
    rangeInvalid;

  return {
    draftRange,
    setDraftRange,
    draftPresetId,
    setDraftPresetId,
    draftStartStr,
    setDraftStartStr,
    draftEndStr,
    setDraftEndStr,
    openDatePanel,
    applyPresetRange,
    onDraftRangeCalendarChange,
    onDraftStartStrChange,
    onDraftEndStrChange,
    onDraftStartFocus,
    onDraftEndFocus,
    onDraftInvalidYearFieldsChange,
    parsedDraftRange,
    draftEndBeforeStart,
    draftInvalidYear,
    draftInvalidYearFields,
    rangeExceedsTwelveMonths,
    rangeOutsideRollingWindow,
    rangeConstraintInvalid,
    rangeInvalid,
    validationMessage,
    draftRangeCalendarValue,
    draftCalendarViewFocus,
    applyDatePanel,
    clearDatePanel,
    defaultDatePreset,
    datePanelApplyDisabled,
    parsedDraftRangeRef,
    rangeInvalidRef,
  };
}
