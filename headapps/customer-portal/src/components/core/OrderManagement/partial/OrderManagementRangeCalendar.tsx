"use client";

import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import type { CalendarDate, DateValue } from "@internationalized/date";
import {
  CalendarDate as CalDate,
  getLocalTimeZone,
  startOfWeek,
  today,
} from "@internationalized/date";
import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  I18nProvider,
  RangeCalendar,
  RangeCalendarStateContext,
} from "react-aria-components";

import { resolveDateFieldLocale } from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";

export type RangeCalendarValue = { start: DateValue; end: DateValue } | null;

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** Unbounded year dropdown: 10 years ending at the current calendar year (no future years). */
const UNBOUNDED_YEAR_COUNT = 10;

function getUnboundedCalendarYears(): number[] {
  const maxYear = today(getLocalTimeZone()).year;
  const startYear = maxYear - (UNBOUNDED_YEAR_COUNT - 1);
  return Array.from({ length: UNBOUNDED_YEAR_COUNT }, (_, i) => startYear + i);
}

function dateToCalendarDate(d: Date): CalendarDate {
  return new CalDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function calendarDateToDate(cd: DateValue): Date {
  return new Date(cd.year, cd.month - 1, cd.day, 12, 0, 0, 0);
}

export function datesToRangeValue(start: Date, end: Date): RangeCalendarValue {
  return {
    start: dateToCalendarDate(start),
    end: dateToCalendarDate(end),
  };
}

export function rangeValueToDates(v: RangeCalendarValue): { start: Date; end: Date } | null {
  if (!v?.start || !v?.end) return null;
  const start = calendarDateToDate(v.start);
  const end = calendarDateToDate(v.end);
  return { start, end };
}

/** True if the two-month pane starting at m0's first day intersects the selectable [min, max] range. */
function dualViewStartOverlapsSelectableRange(
  min: CalendarDate,
  max: CalendarDate,
  m0MonthStart: CalendarDate
): boolean {
  const start = m0MonthStart.set({ day: 1 });
  const end = start.add({ months: 2 }).subtract({ days: 1 });
  return start.compare(max) <= 0 && end.compare(min) >= 0;
}

function boundedYears(min: CalendarDate, max: CalendarDate): number[] {
  const ys = new Set<number>();
  for (let y = min.year; y <= max.year; y++) {
    for (const m of ALL_MONTHS) {
      if (dualViewStartOverlapsSelectableRange(min, max, new CalDate(y, m, 1))) {
        ys.add(y);
        break;
      }
    }
  }
  return [...ys].sort((a, b) => a - b);
}

function monthsForLeftYear(min: CalendarDate, max: CalendarDate, year: number): number[] {
  return ALL_MONTHS.filter((m) =>
    dualViewStartOverlapsSelectableRange(min, max, new CalDate(year, m, 1))
  );
}

function monthsForRightYear(min: CalendarDate, max: CalendarDate, year: number): number[] {
  return ALL_MONTHS.filter((mo) => {
    const m1 = new CalDate(year, mo, 1);
    const m0 = m1.add({ months: -1 });
    return dualViewStartOverlapsSelectableRange(min, max, m0);
  });
}

/** True if the one-month visible pane starting at monthStart's first day intersects [min, max]. */
function singleViewStartOverlapsSelectableRange(
  min: CalendarDate,
  max: CalendarDate,
  monthStart: CalendarDate
): boolean {
  const start = monthStart.set({ day: 1 });
  const end = start.add({ months: 1 }).subtract({ days: 1 });
  return start.compare(max) <= 0 && end.compare(min) >= 0;
}

function boundedYearsSingle(min: CalendarDate, max: CalendarDate): number[] {
  const ys = new Set<number>();
  for (let y = min.year; y <= max.year; y++) {
    for (const m of ALL_MONTHS) {
      if (singleViewStartOverlapsSelectableRange(min, max, new CalDate(y, m, 1))) {
        ys.add(y);
        break;
      }
    }
  }
  return [...ys].sort((a, b) => a - b);
}

function monthsForSingleVisibleYear(min: CalendarDate, max: CalendarDate, year: number): number[] {
  return ALL_MONTHS.filter((m) =>
    singleViewStartOverlapsSelectableRange(min, max, new CalDate(year, m, 1))
  );
}

function clampMonthPick(preferred: number, allowed: number[], fallback: number): number {
  if (allowed.length === 0) return fallback;
  if (allowed.includes(preferred)) return preferred;
  const ge = allowed.find((m) => m >= preferred);
  if (ge !== undefined) return ge;
  return allowed[allowed.length - 1]!;
}

/** React Stately only scrolls the visible window when focus moves outside the current range; nudging uses {@link RangeCalendarState.focusNextPage}. */
const SNAP_ALIGN_MAX_STEPS = 40;

type RangeCalState = NonNullable<React.ContextType<typeof RangeCalendarStateContext>>;

/**
 * Custom month/year selects call {@link RangeCalendarState.setFocusedDate}. With multi-month
 * `visibleDuration`, a date can stay *inside* the current window (e.g. January while the view is
 * Dec–Jan), so the first pane never updates. Also, `pageBehavior: visible` pages by the full
 * visible width (2 months), which creates an odd/even parity. This hook sets focus then steps the
 * calendar by **one month** at a time until `visibleRange.start` matches the desired left month.
 */
function useGoToLeftMonth(state: RangeCalState): (cd: CalendarDate) => void {
  const [pending, setPending] = useState<CalendarDate | null>(null);
  const attemptsRef = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const vis = state.visibleRange.start;
  const visibleStartKey = `${vis.year}-${vis.month}`;

  useLayoutEffect(() => {
    if (!pending) return;
    const s = stateRef.current;
    const want = pending.set({ day: 1 });
    const v = s.visibleRange.start;
    if (v.year === want.year && v.month === want.month) {
      setPending(null);
      attemptsRef.current = 0;
      return;
    }
    if (attemptsRef.current++ > SNAP_ALIGN_MAX_STEPS) {
      setPending(null);
      attemptsRef.current = 0;
      return;
    }
    if (v.compare(want) < 0) {
      if (!s.isNextVisibleRangeInvalid()) s.focusNextPage();
    } else if (!s.isPreviousVisibleRangeInvalid()) {
      s.focusPreviousPage();
    }
  }, [pending, visibleStartKey]);

  return useCallback((cd: CalendarDate) => {
    const want = cd.set({ day: 1 });
    attemptsRef.current = 0;
    setPending(want);
    stateRef.current.setFocusedDate(want);
  }, []);
}

interface OrderManagementRangeCalendarProps {
  /** `null` = no range selected (Order Management default until user applies dates). */
  value: RangeCalendarValue | null;
  onChange: (next: RangeCalendarValue | null) => void;
  locale: string;
  /** Month shown while editing date inputs (start vs end field). */
  viewFocusDate?: CalendarDate | null;
  /** Inclusive min/max selectable dates (e.g. rolling history window from CMS). */
  calendarBounds?: { min: CalendarDate; max: CalendarDate } | null;
  /** Mobile bottom sheet: stacked months + weekday row order. */
  isMobile?: boolean;
  /** When true, range selection is disabled (preset-only mode). */
  isReadOnly?: boolean;
}

const MOBILE_STACKED_MONTH_COUNT = 2;

/** Two-letter weekday headers (e.g. SU, MO) aligned with {@link startOfWeek} for the locale. */
export function getOrderManagementCalendarWeekdayLabels(locale: string): string[] {
  const tz = getLocalTimeZone();
  const weekStart = startOfWeek(today(tz), locale);
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });

  return Array.from({ length: 7 }, (_, i) => {
    const label = fmt.format(weekStart.add({ days: i }).toDate(tz));
    return formatOrderManagementCalendarWeekdayHeaderLabel(label);
  });
}

/** Normalizes react-aria / Intl weekday strings to two uppercase letters for column headers. */
export function formatOrderManagementCalendarWeekdayHeaderLabel(day: string): string {
  return day.replace(/\./g, "").trim().slice(0, 2).toUpperCase();
}

const CALENDAR_WEEKDAY_HEADER_CELL_CLASS =
  "py-[18px] text-center text-[11px] font-normal uppercase text-[var(--color-icon-muted)]";

function WeekdayStrip({ locale }: { locale: string }): React.ReactElement {
  const labels = useMemo(() => getOrderManagementCalendarWeekdayLabels(locale), [locale]);

  return (
    <div className="mb-2 grid w-full grid-cols-7 gap-0" role="presentation">
      {labels.map((label, i) => (
        <span
          key={i}
          className="py-2 text-center text-[11px] font-normal uppercase text-[var(--color-icon-muted)]"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function OrderManagementRangeDayCell({ date }: { date: CalendarDate }): React.ReactElement {
  return (
    <CalendarCell
      date={date}
      className={cn(
        "group relative z-[1] flex h-[36px] w-full min-w-0 cursor-default items-center justify-center text-center outline-none",
        "[&[data-disabled]:not([data-outside-month])]:opacity-40",
        "[&[data-outside-month]]:opacity-50 [&[data-outside-month]]:[text-decoration:none]",
        "[&[data-selected]:not([data-outside-month])]:rounded-none [&[data-selected]:not([data-outside-month])]:bg-[var(--color-bg-selected-tint)]",
        "[&[data-selection-start]:not([data-outside-month])]:rounded-l-full [&[data-selection-start]:not([data-outside-month])]:bg-[var(--color-action-primary)]",
        "[&[data-selection-end]:not([data-outside-month])]:rounded-r-full [&[data-selection-end]:not([data-outside-month])]:bg-[var(--color-action-primary)]",
        "[&[data-selection-start][data-selection-end]:not([data-outside-month])]:rounded-full",
        "[&[data-selected][data-outside-month]]:bg-transparent",
        "[&[data-selection-start]]:z-[2] [&[data-selection-start]]:bg-[var(--color-bg-selected-tint)]",
        "[&[data-selection-end]]:z-[2] [&[data-selection-end]]:bg-[var(--color-bg-selected-tint)]"
      )}
    >
      {({ formattedDate, isSelectionStart, isSelectionEnd }) => (
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-medium text-[var(--color-text-heading-color)]",
            "group-data-[outside-month]:text-[var(--color-text-basic)]",
            (isSelectionStart || isSelectionEnd) &&
              "relative z-[2] bg-[var(--color-action-primary)] text-[var(--color-text-white)]"
          )}
        >
          {formattedDate}
        </span>
      )}
    </CalendarCell>
  );
}

function useMonthNames(locale: string): string[] {
  return useMemo(() => {
    try {
      return Array.from({ length: 12 }, (_, i) =>
        new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2000, i, 1))
      );
    } catch {
      return [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
    }
  }, [locale]);
}

/**
 * Mobile: weekday row above month nav, then vertically scrollable stacked months (Figma).
 */
function MobileStackedMonthsChromeBody({
  state,
  locale,
  calendarBounds,
}: {
  state: RangeCalState;
  locale: string;
  calendarBounds?: { min: CalendarDate; max: CalendarDate } | null;
}): React.ReactElement {
  const monthNames = useMonthNames(locale);

  const unboundedYears = useMemo(() => getUnboundedCalendarYears(), []);

  const m0 = state.visibleRange.start;

  const goToLeftMonth = useGoToLeftMonth(state);

  const minB = calendarBounds?.min;
  const maxB = calendarBounds?.max;
  const hasBounds = minB != null && maxB != null;

  const leftYears = useMemo(
    () => (hasBounds ? boundedYearsSingle(minB, maxB) : unboundedYears),
    [hasBounds, minB, maxB, unboundedYears]
  );

  const leftMonths = useMemo(
    () => (hasBounds ? monthsForSingleVisibleYear(minB, maxB, m0.year) : [...ALL_MONTHS]),
    [hasBounds, minB, maxB, m0.year]
  );

  const m1 = m0.add({ months: 1 });

  const rightMonths = useMemo(
    () => (hasBounds ? monthsForRightYear(minB, maxB, m1.year) : [...ALL_MONTHS]),
    [hasBounds, minB, maxB, m1.year]
  );

  const dualYears = useMemo(
    () => (hasBounds ? boundedYears(minB, maxB) : unboundedYears),
    [hasBounds, minB, maxB, unboundedYears]
  );

  useLayoutEffect(() => {
    if (!hasBounds) return;
    let fixed: CalendarDate = m0;
    if (leftYears.length > 0 && !leftYears.includes(fixed.year)) {
      const y = leftYears.find((yy) => yy >= fixed.year) ?? leftYears[leftYears.length - 1]!;
      fixed = fixed.set({ year: y, day: 1 });
    }
    const lm = hasBounds ? monthsForSingleVisibleYear(minB, maxB, fixed.year) : [...ALL_MONTHS];
    if (lm.length > 0 && !lm.includes(fixed.month)) {
      const pick = clampMonthPick(fixed.month, lm, lm[0]!);
      fixed = fixed.set({ month: pick, day: 1 });
    }
    if (fixed.compare(m0) !== 0) {
      goToLeftMonth(fixed);
    }
  }, [hasBounds, minB, maxB, m0, leftYears, goToLeftMonth]);

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col items-stretch">
      <div className="flex w-full min-w-0 max-w-full flex-col">
        <WeekdayStrip locale={locale} />
        <header className="mb-3 flex w-full min-w-0 flex-nowrap items-center justify-between gap-4 overflow-x-auto pb-1">
          <Button
            slot="previous"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-transparent text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)]"
          >
            <Icon icon={faChevronLeft} width={12} aria-hidden />
          </Button>
          <div className="flex min-w-0 shrink items-center gap-2">
            <label
              className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [-m-px] [clip:rect(0,0,0,0)]"
              htmlFor="om-cal-s-month"
            >
              Month
            </label>
            <select
              id="om-cal-s-month"
              className="h-7 rounded-[4px] bg-[var(--color-bg-basic-color)] px-2 text-[14px] font-semibold text-[var(--color-text-heading-color)]"
              value={leftMonths.includes(m0.month) ? m0.month : (leftMonths[0] ?? m0.month)}
              onChange={(e) => {
                const month = Number(e.target.value);
                const allowed = hasBounds
                  ? monthsForSingleVisibleYear(minB, maxB, m0.year)
                  : [...ALL_MONTHS];
                const pick = clampMonthPick(month, allowed, month);
                goToLeftMonth(m0.set({ month: pick, day: 1 }));
              }}
            >
              {leftMonths.map((mi) => (
                <option key={mi} value={mi}>
                  {monthNames[mi - 1]}
                </option>
              ))}
            </select>
            <label
              className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [-m-px] [clip:rect(0,0,0,0)]"
              htmlFor="om-cal-s-year"
            >
              Year
            </label>
            <select
              id="om-cal-s-year"
              className="h-7 rounded-[4px] bg-[var(--color-bg-basic-color)] px-2 text-[14px] font-semibold text-[var(--color-text-heading-color)]"
              value={leftYears.includes(m0.year) ? m0.year : (leftYears[0] ?? m0.year)}
              onChange={(e) => {
                const year = Number(e.target.value);
                const allowedY = hasBounds ? boundedYearsSingle(minB, maxB) : unboundedYears;
                const y = allowedY.includes(year) ? year : (allowedY[0] ?? year);
                const lm = hasBounds ? monthsForSingleVisibleYear(minB, maxB, y) : [...ALL_MONTHS];
                const pick = clampMonthPick(m0.month, lm, lm[0] ?? m0.month);
                goToLeftMonth(m0.set({ year: y, month: pick, day: 1 }));
              }}
            >
              {leftYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <Button
            slot="next"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-transparent text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)]"
          >
            <Icon icon={faChevronRight} width={12} aria-hidden />
          </Button>
        </header>

        <div className="flex max-h-[min(50vh,420px)] w-full flex-col gap-6 overflow-y-auto overflow-x-hidden pr-1">
          {Array.from({ length: MOBILE_STACKED_MONTH_COUNT }, (_, offset) => (
            <div key={offset} className="flex w-full flex-col">
              {offset > 0 ? (
                <header className="mb-2 flex w-full min-w-0 justify-center">
                  <div className="flex min-w-0 shrink items-center gap-2">
                    <label
                      className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [-m-px] [clip:rect(0,0,0,0)]"
                      htmlFor="om-cal-s-month-2"
                    >
                      Month
                    </label>
                    <select
                      id="om-cal-s-month-2"
                      className="h-7 rounded-[4px] bg-[var(--color-bg-basic-color)] px-2 text-[14px] font-semibold text-[var(--color-text-heading-color)]"
                      value={
                        rightMonths.includes(m1.month) ? m1.month : (rightMonths[0] ?? m1.month)
                      }
                      onChange={(e) => {
                        const month = Number(e.target.value);
                        const year = m1.year;
                        const allowed = hasBounds
                          ? monthsForRightYear(minB, maxB, year)
                          : [...ALL_MONTHS];
                        const pick = clampMonthPick(month, allowed, month);
                        const second = new CalDate(year, pick, 1);
                        goToLeftMonth(second.add({ months: -1 }));
                      }}
                    >
                      {rightMonths.map((mi) => (
                        <option key={`mobile-m1-${mi}`} value={mi}>
                          {monthNames[mi - 1]}
                        </option>
                      ))}
                    </select>
                    <label
                      className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [-m-px] [clip:rect(0,0,0,0)]"
                      htmlFor="om-cal-s-year-2"
                    >
                      Year
                    </label>
                    <select
                      id="om-cal-s-year-2"
                      className="h-7 rounded-[4px] bg-[var(--color-bg-basic-color)] px-2 text-[14px] font-semibold text-[var(--color-text-heading-color)]"
                      value={dualYears.includes(m1.year) ? m1.year : (dualYears[0] ?? m1.year)}
                      onChange={(e) => {
                        const year = Number(e.target.value);
                        const allowedY = hasBounds ? boundedYears(minB, maxB) : unboundedYears;
                        const y = allowedY.includes(year) ? year : (allowedY[0] ?? year);
                        const rm = hasBounds ? monthsForRightYear(minB, maxB, y) : [...ALL_MONTHS];
                        const pick = clampMonthPick(m1.month, rm, rm[0] ?? m1.month);
                        const second = new CalDate(y, pick, 1);
                        goToLeftMonth(second.add({ months: -1 }));
                      }}
                    >
                      {dualYears.map((y) => (
                        <option key={`mobile-y1-${y}`} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </header>
              ) : null}
              <CalendarGrid
                key={offset}
                className="w-full border-collapse [&_td]:p-0"
                offset={{ months: offset }}
              >
                <CalendarGridBody>
                  {(date) => <OrderManagementRangeDayCell date={date} />}
                </CalendarGridBody>
              </CalendarGrid>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DualMonthWeekdayHeader(): React.ReactElement {
  return (
    <CalendarGridHeader className="border-0">
      {(day) => (
        <CalendarHeaderCell className={CALENDAR_WEEKDAY_HEADER_CELL_CLASS}>
          {formatOrderManagementCalendarWeekdayHeaderLabel(day)}
        </CalendarHeaderCell>
      )}
    </CalendarGridHeader>
  );
}

function DualMonthChromeBody({
  state,
  locale,
  calendarBounds,
}: {
  state: RangeCalState;
  locale: string;
  calendarBounds?: { min: CalendarDate; max: CalendarDate } | null;
}): React.ReactElement {
  const monthNames = useMonthNames(locale);

  const unboundedYears = useMemo(() => getUnboundedCalendarYears(), []);

  const m0 = state.visibleRange.start;
  const m1 = m0.add({ months: 1 });

  const goToLeftMonth = useGoToLeftMonth(state);

  const minB = calendarBounds?.min;
  const maxB = calendarBounds?.max;
  const hasBounds = minB != null && maxB != null;

  const leftYears = useMemo(
    () => (hasBounds ? boundedYears(minB, maxB) : unboundedYears),
    [hasBounds, minB, maxB, unboundedYears]
  );

  const leftMonths = useMemo(
    () => (hasBounds ? monthsForLeftYear(minB, maxB, m0.year) : [...ALL_MONTHS]),
    [hasBounds, minB, maxB, m0.year]
  );

  const rightMonths = useMemo(
    () => (hasBounds ? monthsForRightYear(minB, maxB, m1.year) : [...ALL_MONTHS]),
    [hasBounds, minB, maxB, m1.year]
  );

  useLayoutEffect(() => {
    if (!hasBounds) return;
    let fixed: CalendarDate = m0;
    if (leftYears.length > 0 && !leftYears.includes(fixed.year)) {
      const y = leftYears.find((yy) => yy >= fixed.year) ?? leftYears[leftYears.length - 1]!;
      fixed = fixed.set({ year: y, day: 1 });
    }
    const lm = monthsForLeftYear(minB, maxB, fixed.year);
    if (lm.length > 0 && !lm.includes(fixed.month)) {
      const pick = clampMonthPick(fixed.month, lm, lm[0]!);
      fixed = fixed.set({ month: pick, day: 1 });
    }
    if (fixed.compare(m0) !== 0) {
      goToLeftMonth(fixed);
    }
  }, [hasBounds, minB, maxB, m0, leftYears, goToLeftMonth]);

  return (
    <>
      <div className="flex w-full min-w-0 flex-row flex-nowrap items-start justify-between gap-[40px] [min-width:600px]">
        <div className="flex min-w-[272px] flex-1 basis-0 flex-col [&_.react-aria-CalendarGrid]:w-full [&_.react-aria-CalendarGrid]:max-w-full">
          <header className="mb-3 flex min-w-0 flex-nowrap items-center justify-start gap-[40px] overflow-x-auto pb-1">
            <Button
              slot="previous"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-transparent text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)]"
            >
              <Icon icon={faChevronLeft} width={12} aria-hidden />
            </Button>
            <div className="flex min-w-0 shrink items-center gap-2">
              <label
                className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [-m-px] [clip:rect(0,0,0,0)]"
                htmlFor="om-cal-m0-month"
              >
                First month
              </label>
              <select
                id="om-cal-m0-month"
                className="h-7 rounded-[4px] bg-[var(--color-bg-basic-color)] px-2 text-[14px] font-semibold text-[var(--color-text-heading-color)]"
                value={leftMonths.includes(m0.month) ? m0.month : (leftMonths[0] ?? m0.month)}
                onChange={(e) => {
                  const month = Number(e.target.value);
                  const allowed = hasBounds
                    ? monthsForLeftYear(minB, maxB, m0.year)
                    : [...ALL_MONTHS];
                  const pick = clampMonthPick(month, allowed, month);
                  goToLeftMonth(m0.set({ month: pick, day: 1 }));
                }}
              >
                {leftMonths.map((mi) => (
                  <option key={mi} value={mi}>
                    {monthNames[mi - 1]}
                  </option>
                ))}
              </select>
              <label
                className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [-m-px] [clip:rect(0,0,0,0)]"
                htmlFor="om-cal-m0-year"
              >
                First year
              </label>
              <select
                id="om-cal-m0-year"
                className="h-7 rounded-[4px] bg-[var(--color-bg-basic-color)] px-2 text-[14px] font-semibold text-[var(--color-text-heading-color)]"
                value={leftYears.includes(m0.year) ? m0.year : (leftYears[0] ?? m0.year)}
                onChange={(e) => {
                  const year = Number(e.target.value);
                  const allowedY = hasBounds ? boundedYears(minB, maxB) : unboundedYears;
                  const y = allowedY.includes(year) ? year : (allowedY[0] ?? year);
                  const lm = hasBounds ? monthsForLeftYear(minB, maxB, y) : [...ALL_MONTHS];
                  const pick = clampMonthPick(m0.month, lm, lm[0] ?? m0.month);
                  goToLeftMonth(m0.set({ year: y, month: pick, day: 1 }));
                }}
              >
                {leftYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </header>

          <CalendarGrid
            className="w-full border-collapse [&_td]:p-0"
            weekdayStyle="short"
            offset={{ months: 0 }}
          >
            <DualMonthWeekdayHeader />
            <CalendarGridBody>
              {(date) => <OrderManagementRangeDayCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </div>
        <div className="flex min-w-[272px] flex-1 basis-0 flex-col [&_.react-aria-CalendarGrid]:w-full [&_.react-aria-CalendarGrid]:max-w-full">
          <header className="mb-3 flex min-w-0 flex-nowrap items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex min-w-0 shrink items-center gap-2">
              <label
                className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [-m-px] [clip:rect(0,0,0,0)]"
                htmlFor="om-cal-m1-month"
              >
                Second month
              </label>
              <select
                id="om-cal-m1-month"
                className="h-7 rounded-[4px] bg-[var(--color-bg-basic-color)] px-2 text-[14px] font-semibold text-[var(--color-text-heading-color)]"
                value={rightMonths.includes(m1.month) ? m1.month : (rightMonths[0] ?? m1.month)}
                onChange={(e) => {
                  const month = Number(e.target.value);
                  const year = m1.year;
                  const allowed = hasBounds
                    ? monthsForRightYear(minB, maxB, year)
                    : [...ALL_MONTHS];
                  const pick = clampMonthPick(month, allowed, month);
                  const second = new CalDate(year, pick, 1);
                  const first = second.add({ months: -1 });
                  goToLeftMonth(first);
                }}
              >
                {rightMonths.map((mi) => (
                  <option key={`m1-${mi}`} value={mi}>
                    {monthNames[mi - 1]}
                  </option>
                ))}
              </select>
              <label
                className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [-m-px] [clip:rect(0,0,0,0)]"
                htmlFor="om-cal-m1-year"
              >
                Second year
              </label>
              <select
                id="om-cal-m1-year"
                className="h-7 rounded-[4px] bg-[var(--color-bg-basic-color)] px-2 text-[14px] font-semibold text-[var(--color-text-heading-color)]"
                value={leftYears.includes(m1.year) ? m1.year : (leftYears[0] ?? m1.year)}
                onChange={(e) => {
                  const year = Number(e.target.value);
                  const allowedY = hasBounds ? boundedYears(minB, maxB) : unboundedYears;
                  const y = allowedY.includes(year) ? year : (allowedY[0] ?? year);
                  const rm = hasBounds ? monthsForRightYear(minB, maxB, y) : [...ALL_MONTHS];
                  const pick = clampMonthPick(m1.month, rm, rm[0] ?? m1.month);
                  const second = new CalDate(y, pick, 1);
                  const first = second.add({ months: -1 });
                  goToLeftMonth(first);
                }}
              >
                {leftYears.map((y) => (
                  <option key={`y1-${y}`} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <Heading className="hidden" />
            <Button
              slot="next"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-transparent text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)]"
            >
              <Icon icon={faChevronRight} width={12} aria-hidden />
            </Button>
          </header>

          <CalendarGrid
            className="w-full border-collapse [&_td]:p-0"
            weekdayStyle="short"
            offset={{ months: 1 }}
          >
            <DualMonthWeekdayHeader />
            <CalendarGridBody>
              {(date) => <OrderManagementRangeDayCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </div>
      </div>
    </>
  );
}

function CalendarChrome({
  locale,
  calendarBounds,
  isMobile,
}: {
  locale: string;
  calendarBounds?: { min: CalendarDate; max: CalendarDate } | null;
  isMobile: boolean;
}): React.ReactElement | null {
  const state = useContext(RangeCalendarStateContext);
  if (!state) return null;
  if (isMobile) {
    return (
      <MobileStackedMonthsChromeBody
        state={state}
        locale={locale}
        calendarBounds={calendarBounds}
      />
    );
  }
  return <DualMonthChromeBody state={state} locale={locale} calendarBounds={calendarBounds} />;
}

/**
 * Range calendar (react-aria RangeCalendar + month/year dropdowns + prev/next).
 * Desktop: two months; mobile: stacked scrollable months in the sheet.
 * @see https://react-aria.adobe.com/Calendar
 */
export function OrderManagementRangeCalendar({
  value,
  onChange,
  locale,
  viewFocusDate = null,
  calendarBounds,
  isMobile = false,
  isReadOnly = false,
}: OrderManagementRangeCalendarProps): React.ReactElement {
  const timeZone = getLocalTimeZone();
  const visibleMonthCount = 2;
  const dateFieldLocale = resolveDateFieldLocale(locale);

  const rangeFocusKey = useMemo(() => {
    if (!value?.start || !value?.end) return "";
    const a = value.start as CalendarDate;
    const b = value.end as CalendarDate;
    return `${a.year}-${a.month}-${a.day}|${b.year}-${b.month}-${b.day}`;
  }, [value?.end, value?.start]);

  const viewFocusKey = useMemo(() => {
    if (!viewFocusDate) return "";
    return `${viewFocusDate.year}-${viewFocusDate.month}-${viewFocusDate.day}`;
  }, [viewFocusDate]);

  /**
   * Do not control `focusedValue` from React state. Custom month/year selects call
   * `RangeCalendarState.setFocusedDate()`; in controlled mode, if `onFocusChange` does not run for
   * that update, the next render passes a stale `focusedValue` and the grid snaps back (often
   * to `value.start`), which looks like "I picked January but see December (previous year)".
   * Remount when the selected range or input focus target changes so `defaultFocusedValue` tracks edits.
   */
  const defaultFocusedValue = useMemo((): CalendarDate => {
    if (viewFocusDate) return viewFocusDate.set({ day: 1 });
    if (value?.start) return (value.start as CalendarDate).set({ day: 1 });
    return today(timeZone);
  }, [rangeFocusKey, timeZone, value, viewFocusDate, viewFocusKey]);

  const calendarMountKey = `${rangeFocusKey || "om-rc-no-range"}|view-${viewFocusKey || "none"}`;

  return (
    <I18nProvider locale={dateFieldLocale}>
      <RangeCalendar
        key={calendarMountKey}
        className={cn(
          "flex min-w-0 w-full flex-col gap-2 text-[var(--color-text-heading-color)]",
          isMobile && "max-w-full",
          "[&_td:first-child_[data-selected]:not([data-outside-month])]:rounded-l-full",
          "[&_td:last-child_[data-selected]:not([data-outside-month])]:rounded-r-full",
          "[&_.react-aria-CalendarGrid_tbody_tr]:border-0"
        )}
        value={value}
        onChange={onChange}
        pageBehavior="single"
        selectionAlignment="start"
        isReadOnly={isReadOnly}
        minValue={calendarBounds?.min}
        maxValue={calendarBounds?.max}
        defaultFocusedValue={defaultFocusedValue}
        visibleDuration={{ months: visibleMonthCount }}
        aria-label="Order date range"
      >
        <CalendarChrome
          locale={locale}
          calendarBounds={calendarBounds}
          isMobile={isMobile}
        />
      </RangeCalendar>
    </I18nProvider>
  );
}
