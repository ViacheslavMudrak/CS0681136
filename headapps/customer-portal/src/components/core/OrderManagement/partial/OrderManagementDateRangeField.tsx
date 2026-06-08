"use client";

import { parseDate, type CalendarDate } from "@internationalized/date";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  DateField,
  DateInput,
  DateSegment,
  type DateSegmentProps,
  I18nProvider,
} from "react-aria-components";

import useClickOutside from "@/hooks/useClickOutside";
import {
  isOrderManagementDateFieldCompleteOnBlur,
  isValidOrderManagementDateFieldValue,
  parseIsoYmdToLocalDate,
  resolveDateFieldLocale,
  type OrderManagementDateFieldSegmentTexts,
} from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";

function ymdFromCalendarDate(d: CalendarDate): string {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

/** When syncing from parent draft strings (presets / calendar / prior commit). */
function calendarDateFromYmdString(s: string): CalendarDate | null {
  const t = s.trim();
  if (!t) return null;
  if (!parseIsoYmdToLocalDate(t)) return null;
  try {
    return parseDate(t.slice(0, 10));
  } catch {
    return null;
  }
}

function toParentYmd(d: CalendarDate | null): string {
  return d ? ymdFromCalendarDate(d) : "";
}

const EMPTY_SEGMENTS: OrderManagementDateFieldSegmentTexts = {
  year: "",
  month: "",
  day: "",
};

function captureSegmentText(
  target: OrderManagementDateFieldSegmentTexts,
  segment: DateSegmentProps["segment"]
): void {
  const text = segment.isPlaceholder ? "" : segment.text;
  if (segment.type === "year") {
    target.year = text;
  } else if (segment.type === "month") {
    target.month = text;
  } else if (segment.type === "day") {
    target.day = text;
  }
}

export type OrderManagementDateFieldInvalidYearState = {
  start: boolean;
  end: boolean;
};

export interface OrderManagementDateRangeFieldProps {
  /** App locale (next-intl / profile); drives segment placeholders (e.g. mm/dd/yyyy for `en`). */
  locale: string;
  draftStartStr: string;
  draftEndStr: string;
  onDraftStartStrChange: (v: string) => void;
  onDraftEndStrChange: (v: string) => void;
  onDraftStartFocus?: () => void;
  onDraftEndFocus?: () => void;
  /** End-before-start, span, and rolling-window errors (highlights both fields). */
  rangeConstraintInvalid: boolean;
  onDraftInvalidYearFieldsChange?: (next: OrderManagementDateFieldInvalidYearState) => void;
  /** When true, date segments are not editable (CMS disables custom range). */
  readOnly?: boolean;
  /**
   * If set, mousedown is treated as "inside" when the target is within this node *or* the
   * input row. That prevents flush + fake `Custom` when the user clicks the range calendar, preset
   * list, or select (clicks that are outside the input div only).
   */
  useClickOutsideRootRef?: RefObject<HTMLElement | null>;
}

export type OrderManagementDateRangeFieldHandle = {
  /** Push local values to the shell draft (e.g. before Apply). */
  flush: () => { startYmd: string; endYmd: string };
};

type LocalRange = {
  start: CalendarDate | null;
  end: CalendarDate | null;
};

function syncInvalidYearFields(
  startInvalid: boolean,
  endInvalid: boolean,
  onDraftInvalidYearFieldsChange?: (next: OrderManagementDateFieldInvalidYearState) => void
): void {
  onDraftInvalidYearFieldsChange?.({ start: startInvalid, end: endInvalid });
}

/**
 * Single local draft: {@link CalendarDate} values for React Aria {@link DateField} only.
 * Parent draft strings update on each {@link DateField} change so the range calendar stays in sync while typing.
 */
export const OrderManagementDateRangeField = forwardRef<
  OrderManagementDateRangeFieldHandle,
  OrderManagementDateRangeFieldProps
>(function OrderManagementDateRangeField(
  {
    locale,
    draftStartStr,
    draftEndStr,
    onDraftStartStrChange,
    onDraftEndStrChange,
    onDraftStartFocus,
    onDraftEndFocus,
    rangeConstraintInvalid,
    onDraftInvalidYearFieldsChange,
    readOnly = false,
    useClickOutsideRootRef,
  },
  ref
): React.ReactElement {
  const dateFieldLocale = resolveDateFieldLocale(locale);
  const [local, setLocal] = useState<LocalRange>(() => ({
    start: calendarDateFromYmdString(draftStartStr),
    end: calendarDateFromYmdString(draftEndStr),
  }));
  const [startInvalidYear, setStartInvalidYear] = useState(false);
  const [endInvalidYear, setEndInvalidYear] = useState(false);
  const startInteractedRef = useRef(false);
  const endInteractedRef = useRef(false);
  const localRef = useRef(local);
  localRef.current = local;
  const startSegmentsRef = useRef<OrderManagementDateFieldSegmentTexts>({ ...EMPTY_SEGMENTS });
  const endSegmentsRef = useRef<OrderManagementDateFieldSegmentTexts>({ ...EMPTY_SEGMENTS });
  const invalidYearRef = useRef<OrderManagementDateFieldInvalidYearState>({
    start: false,
    end: false,
  });

  const fieldContainerRef = useRef<HTMLDivElement>(null);

  const resetInvalidYearState = useCallback(() => {
    startInteractedRef.current = false;
    endInteractedRef.current = false;
    setStartInvalidYear(false);
    setEndInvalidYear(false);
    syncInvalidYearFields(false, false, onDraftInvalidYearFieldsChange);
  }, [onDraftInvalidYearFieldsChange]);

  useEffect(() => {
    setLocal((prev) => {
      const prevStartYmd = toParentYmd(prev.start);
      const prevEndYmd = toParentYmd(prev.end);
      if (prevStartYmd === draftStartStr.trim() && prevEndYmd === draftEndStr.trim()) {
        return prev;
      }
      resetInvalidYearState();
      return {
        start: calendarDateFromYmdString(draftStartStr),
        end: calendarDateFromYmdString(draftEndStr),
      };
    });
  }, [draftEndStr, draftStartStr, resetInvalidYearState]);

  const evaluateStartInvalidYear = useCallback((): boolean => {
    return !isOrderManagementDateFieldCompleteOnBlur(
      localRef.current.start,
      startSegmentsRef.current,
      startInteractedRef.current
    );
  }, []);

  const evaluateEndInvalidYear = useCallback((): boolean => {
    return !isOrderManagementDateFieldCompleteOnBlur(
      localRef.current.end,
      endSegmentsRef.current,
      endInteractedRef.current
    );
  }, []);

  const applyInvalidYearState = useCallback(
    (startInvalid: boolean, endInvalid: boolean) => {
      invalidYearRef.current = { start: startInvalid, end: endInvalid };
      setStartInvalidYear(startInvalid);
      setEndInvalidYear(endInvalid);
      syncInvalidYearFields(startInvalid, endInvalid, onDraftInvalidYearFieldsChange);
    },
    [onDraftInvalidYearFieldsChange]
  );

  const syncStringsToParent = useCallback(() => {
    const next = {
      startYmd: toParentYmd(localRef.current.start),
      endYmd: toParentYmd(localRef.current.end),
    };
    onDraftStartStrChange(next.startYmd);
    onDraftEndStrChange(next.endYmd);
    return next;
  }, [onDraftEndStrChange, onDraftStartStrChange]);

  const commitStartOnBlur = useCallback(() => {
    queueMicrotask(() => {
      const startInvalid = evaluateStartInvalidYear();
      applyInvalidYearState(startInvalid, invalidYearRef.current.end);
      onDraftStartStrChange(toParentYmd(localRef.current.start));
    });
  }, [applyInvalidYearState, evaluateStartInvalidYear, onDraftStartStrChange]);

  const commitEndOnBlur = useCallback(() => {
    queueMicrotask(() => {
      const endInvalid = evaluateEndInvalidYear();
      applyInvalidYearState(invalidYearRef.current.start, endInvalid);
      onDraftEndStrChange(toParentYmd(localRef.current.end));
    });
  }, [applyInvalidYearState, evaluateEndInvalidYear, onDraftEndStrChange]);

  const flush = useCallback(() => {
    const startInvalid = evaluateStartInvalidYear();
    const endInvalid = evaluateEndInvalidYear();
    applyInvalidYearState(startInvalid, endInvalid);
    return syncStringsToParent();
  }, [applyInvalidYearState, evaluateEndInvalidYear, evaluateStartInvalidYear, syncStringsToParent]);

  const commitRef = useRef(flush);
  commitRef.current = flush;

  useImperativeHandle(ref, () => ({ flush }), [flush]);

  const mousedownIfOutsideDatePanel = useCallback(
    (event: MouseEvent) => {
      if (readOnly) return;
      const t = event.target;
      if (!(t instanceof Node)) return;
      if (useClickOutsideRootRef?.current?.contains(t)) {
        return;
      }
      syncStringsToParent();
    },
    [readOnly, syncStringsToParent, useClickOutsideRootRef]
  );

  useEffect(() => {
    if (readOnly || !useClickOutsideRootRef) {
      return;
    }
    document.addEventListener("mousedown", mousedownIfOutsideDatePanel);
    return () => {
      document.removeEventListener("mousedown", mousedownIfOutsideDatePanel);
    };
  }, [mousedownIfOutsideDatePanel, readOnly, useClickOutsideRootRef]);

  /** When no panel root, only the input row counts as "inside" (original behavior). */
  useClickOutside(
    fieldContainerRef,
    () => {
      syncStringsToParent();
    },
    !readOnly && !useClickOutsideRootRef
  );

  const onStartChange = useCallback(
    (v: CalendarDate | null) => {
      startInteractedRef.current = true;
      setLocal((prev) => {
        const next = { ...prev, start: v };
        localRef.current = next;
        return next;
      });
      if (isValidOrderManagementDateFieldValue(v)) {
        setStartInvalidYear(false);
        syncInvalidYearFields(false, endInvalidYear, onDraftInvalidYearFieldsChange);
        onDraftStartStrChange(toParentYmd(v));
      }
    },
    [endInvalidYear, onDraftInvalidYearFieldsChange, onDraftStartStrChange]
  );

  const onEndChange = useCallback(
    (v: CalendarDate | null) => {
      endInteractedRef.current = true;
      setLocal((prev) => {
        const next = { ...prev, end: v };
        localRef.current = next;
        return next;
      });
      if (isValidOrderManagementDateFieldValue(v)) {
        setEndInvalidYear(false);
        syncInvalidYearFields(startInvalidYear, false, onDraftInvalidYearFieldsChange);
        onDraftEndStrChange(toParentYmd(v));
      }
    },
    [onDraftEndStrChange, onDraftInvalidYearFieldsChange, startInvalidYear]
  );

  const markStartInteracted = useCallback(() => {
    startInteractedRef.current = true;
  }, []);

  const markEndInteracted = useCallback(() => {
    endInteractedRef.current = true;
  }, []);

  const onStartFocus = useCallback(() => {
    onDraftStartFocus?.();
  }, [onDraftStartFocus]);

  const onEndFocus = useCallback(() => {
    onDraftEndFocus?.();
  }, [onDraftEndFocus]);

  const renderStartSegment = useCallback(
    (segment: DateSegmentProps["segment"]) => {
      captureSegmentText(startSegmentsRef.current, segment);
      return (
        <DateSegment
          segment={segment}
          className={
            "text-[14px] text-[var(--color-text-heading-color)] rounded px-0.5 py-0.5 outline-none focus:bg-[var(--color-bg-selected-tint)] focus:outline-none caret-[var(--color-action-primary)]"
          }
        />
      );
    },
    []
  );

  const renderEndSegment = useCallback((segment: DateSegmentProps["segment"]) => {
    captureSegmentText(endSegmentsRef.current, segment);
    return (
      <DateSegment
        segment={segment}
        className={
          "text-[14px] text-[var(--color-text-heading-color)] rounded px-0.5 py-0.5 outline-none focus:bg-[var(--color-bg-selected-tint)] focus:outline-none caret-[var(--color-action-primary)]"
        }
      />
    );
  }, []);

  const startFieldInvalid = rangeConstraintInvalid || startInvalidYear;
  const endFieldInvalid = rangeConstraintInvalid || endInvalidYear;

  return (
    <div ref={fieldContainerRef} className="min-w-0">
      <I18nProvider locale={dateFieldLocale}>
      <div className={"flex flex-nowrap gap-5 items-center"}>
        <DateField
          aria-label="Order start date"
          value={local.start}
          onChange={onStartChange}
          onFocus={onStartFocus}
          onBlur={commitStartOnBlur}
          onKeyDown={markStartInteracted}
          onPointerDown={markStartInteracted}
          granularity="day"
          isReadOnly={readOnly}
          isInvalid={startFieldInvalid}
          className={cn(
            "flex flex-1 min-w-[128px] min-h-[34px] rounded-[6px] border border-[var(--color-border-gray)] px-[10px] py-[6px] text-[14px] text-[var(--color-text-heading-color)] bg-[var(--color-bg-basic-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)]",
            startFieldInvalid && "border-[var(--color-text-red)]",
            "flex flex-1 min-w-[128px] min-h-[34px] items-center"
          )}
        >
          <DateInput className={"flex flex-1 flex-wrap items-center gap-0.5 min-w-0 caret-[var(--color-action-primary)]"}>
            {renderStartSegment}
          </DateInput>
        </DateField>
        <span className={"shrink-0 w-[14px] text-[14px] leading-none border-t border-[var(--color-border-gray)] text-[var(--color-text-basic)] mt-[16px]"} aria-hidden>
          &nbsp;
        </span>
        <DateField
          aria-label="Order end date"
          value={local.end}
          onChange={onEndChange}
          onFocus={onEndFocus}
          onBlur={commitEndOnBlur}
          onKeyDown={markEndInteracted}
          onPointerDown={markEndInteracted}
          granularity="day"
          isReadOnly={readOnly}
          isInvalid={endFieldInvalid}
          className={cn(
            "flex flex-1 min-w-[128px] min-h-[34px] rounded-[6px] border border-[var(--color-border-gray)] px-[10px] py-[6px] text-[14px] text-[var(--color-text-heading-color)] bg-[var(--color-bg-basic-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)]",
            endFieldInvalid && "border-[var(--color-text-red)]",
            "flex flex-1 min-w-[128px] min-h-[34px] items-center"
          )}
        >
          <DateInput className={"flex flex-1 flex-wrap items-center gap-0.5 min-w-0 caret-[var(--color-action-primary)]"}>
            {renderEndSegment}
          </DateInput>
        </DateField>
      </div>
      </I18nProvider>
    </div>
  );
});
