import { parseDate } from "@internationalized/date";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import {
  OrderManagementRangeCalendar,
  datesToRangeValue,
  formatOrderManagementCalendarWeekdayHeaderLabel,
  getOrderManagementCalendarWeekdayLabels,
  rangeValueToDates,
  type RangeCalendarValue,
} from "@/components/core/OrderManagement/partial/OrderManagementRangeCalendar";

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: (): ReactElement => <span data-testid="range-cal-icon" aria-hidden />,
}));

const JAN_15_2024 = new Date(2024, 0, 15, 12, 0, 0, 0);
const MAR_20_2024 = new Date(2024, 2, 20, 12, 0, 0, 0);

function renderDesktopCalendar(
  props: Partial<React.ComponentProps<typeof OrderManagementRangeCalendar>> = {}
) {
  const onChange = vi.fn();
  const value =
    props.value !== undefined
      ? props.value
      : datesToRangeValue(JAN_15_2024, MAR_20_2024);

  render(
    <OrderManagementRangeCalendar
      locale="en"
      value={value}
      onChange={onChange}
      viewFocusDate={parseDate("2024-01-01")}
      {...props}
    />
  );

  return { onChange };
}

function getCalendarRoot(): HTMLElement {
  return screen.getByRole("application", { name: /^Order date range/ });
}

/** Clicks a day in the first calendar grid (left month) using its accessible name. */
async function clickDayInFirstGrid(user: ReturnType<typeof userEvent.setup>, day: number) {
  const monthNames = [
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
  const firstMonth = Number(
    (screen.getByLabelText("First month") as HTMLSelectElement).value
  );
  const year = Number((screen.getByLabelText("First year") as HTMLSelectElement).value);
  const monthLabel = monthNames[firstMonth - 1] ?? "January";
  const datePattern = new RegExp(`${monthLabel}\\s+${day},\\s+${year}`, "i");

  await user.click(within(getCalendarRoot()).getByRole("button", { name: datePattern }));
}

describe("OrderManagementRangeCalendar helpers", () => {
  it("formats weekday headers as two uppercase letters", () => {
    expect(formatOrderManagementCalendarWeekdayHeaderLabel("Sun")).toBe("SU");
    expect(formatOrderManagementCalendarWeekdayHeaderLabel("Mon.")).toBe("MO");
    expect(getOrderManagementCalendarWeekdayLabels("en")).toEqual([
      "SU",
      "MO",
      "TU",
      "WE",
      "TH",
      "FR",
      "SA",
    ]);
  });

  it("datesToRangeValue and rangeValueToDates round-trip local dates", () => {
    const rv = datesToRangeValue(JAN_15_2024, MAR_20_2024);
    const parsed = rangeValueToDates(rv);

    expect(parsed).not.toBeNull();
    expect(parsed!.start.getFullYear()).toBe(2024);
    expect(parsed!.start.getMonth()).toBe(0);
    expect(parsed!.start.getDate()).toBe(15);
    expect(parsed!.end.getFullYear()).toBe(2024);
    expect(parsed!.end.getMonth()).toBe(2);
    expect(parsed!.end.getDate()).toBe(20);
  });

  it("rangeValueToDates returns null for missing start or end", () => {
    expect(rangeValueToDates(null)).toBeNull();
    expect(
      rangeValueToDates({ start: parseDate("2024-01-01"), end: null } as unknown as RangeCalendarValue)
    ).toBeNull();
  });
});

describe("OrderManagementRangeCalendar (desktop)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dual-month chrome with month and year dropdowns", () => {
    renderDesktopCalendar();

    expect(getCalendarRoot()).toBeInTheDocument();
    expect(screen.getByLabelText("First month")).toBeInTheDocument();
    expect(screen.getByLabelText("First year")).toBeInTheDocument();
    expect(screen.getByLabelText("Second month")).toBeInTheDocument();
    expect(screen.getByLabelText("Second year")).toBeInTheDocument();
    expect(screen.getAllByRole("grid").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("SU").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("MO").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onChange when selecting a new range via day clicks", async () => {
    const user = userEvent.setup();
    const { onChange } = renderDesktopCalendar({ value: null });

    await clickDayInFirstGrid(user, 10);
    await clickDayInFirstGrid(user, 20);
    expect(onChange).toHaveBeenCalled();

    const lastCall = onChange.mock.calls.at(-1)?.[0] as RangeCalendarValue;
    expect(lastCall?.start).toBeTruthy();
    expect(lastCall?.end).toBeTruthy();
  });

  it("changes visible month when first-month select is updated", async () => {
    const user = userEvent.setup();
    renderDesktopCalendar();

    const firstMonthSelect = screen.getByLabelText("First month") as HTMLSelectElement;
    const initialMonth = Number(firstMonthSelect.value);

    const targetMonth = initialMonth === 6 ? 7 : 6;
    await user.selectOptions(firstMonthSelect, String(targetMonth));

    expect(Number((screen.getByLabelText("First month") as HTMLSelectElement).value)).toBe(
      targetMonth
    );
  });

  it("changes visible year when first-year select is updated", async () => {
    const user = userEvent.setup();
    renderDesktopCalendar();

    const firstYearSelect = screen.getByLabelText("First year") as HTMLSelectElement;
    const years = Array.from(firstYearSelect.options).map((o) => Number(o.value));
    const alternateYear = years.find((y) => y !== Number(firstYearSelect.value)) ?? years[0]!;

    await user.selectOptions(firstYearSelect, String(alternateYear));

    expect(Number((screen.getByLabelText("First year") as HTMLSelectElement).value)).toBe(
      alternateYear
    );
  });

  it("navigates via second-month and second-year dropdowns", async () => {
    const user = userEvent.setup();
    renderDesktopCalendar();

    const secondMonthSelect = screen.getByLabelText("Second month") as HTMLSelectElement;
    const monthOptions = Array.from(secondMonthSelect.options).map((o) => Number(o.value));
    const pickMonth = monthOptions.includes(8) ? 8 : monthOptions[0]!;

    await user.selectOptions(secondMonthSelect, String(pickMonth));
    expect(Number((screen.getByLabelText("Second month") as HTMLSelectElement).value)).toBe(
      pickMonth
    );

    const secondYearSelect = screen.getByLabelText("Second year") as HTMLSelectElement;
    const yearOptions = Array.from(secondYearSelect.options).map((o) => Number(o.value));
    const pickYear = yearOptions.find((y) => y !== Number(secondYearSelect.value)) ?? yearOptions[0]!;

    await user.selectOptions(secondYearSelect, String(pickYear));
    expect(Number((screen.getByLabelText("Second year") as HTMLSelectElement).value)).toBe(pickYear);
  });

  it("pages months with previous and next navigation buttons", async () => {
    const user = userEvent.setup();
    renderDesktopCalendar();

    const firstMonthBefore = Number(
      (screen.getByLabelText("First month") as HTMLSelectElement).value
    );

    await user.click(within(getCalendarRoot()).getAllByRole("button", { name: "Next" })[0]!);

    const firstMonthAfterNext = Number(
      (screen.getByLabelText("First month") as HTMLSelectElement).value
    );
    expect(firstMonthAfterNext).not.toBe(firstMonthBefore);

    await user.click(within(getCalendarRoot()).getAllByRole("button", { name: "Previous" })[0]!);

    expect(Number((screen.getByLabelText("First month") as HTMLSelectElement).value)).toBe(
      firstMonthBefore
    );
  });

  it("respects calendarBounds min and max on selectable days", () => {
    renderDesktopCalendar({
      value: null,
      calendarBounds: {
        min: parseDate("2024-01-01"),
        max: parseDate("2024-01-31"),
      },
      viewFocusDate: parseDate("2024-01-01"),
    });

    const inRangeDay = within(getCalendarRoot()).getByRole("button", {
      name: /January 15, 2024/i,
    });
    const outOfRangeDay = within(getCalendarRoot()).getByRole("button", {
      name: /February 1, 2024/i,
    });

    expect(inRangeDay).not.toHaveAttribute("aria-disabled", "true");
    expect(outOfRangeDay).toHaveAttribute("aria-disabled", "true");
  });

  it("does not call onChange when isReadOnly", async () => {
    const user = userEvent.setup();
    const { onChange } = renderDesktopCalendar({ value: null, isReadOnly: true });

    await clickDayInFirstGrid(user, 12);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("focuses viewFocusDate month when provided", () => {
    renderDesktopCalendar({
      viewFocusDate: parseDate("2024-06-15"),
      value: datesToRangeValue(new Date(2024, 5, 1), new Date(2024, 5, 30)),
    });

    expect(Number((screen.getByLabelText("First month") as HTMLSelectElement).value)).toBe(6);
  });

  it("defaults focused month to today when no value or viewFocusDate is provided", () => {
    const now = new Date();
    render(
      <OrderManagementRangeCalendar locale="en" value={null} onChange={vi.fn()} />
    );

    expect(
      Number((screen.getByLabelText("First month") as HTMLSelectElement).value)
    ).toBe(now.getMonth() + 1);
  });

  it("clamps visible month into calendarBounds when viewFocusDate is outside the window", () => {
    render(
      <OrderManagementRangeCalendar
        locale="en"
        value={null}
        onChange={vi.fn()}
        viewFocusDate={parseDate("2024-08-01")}
        calendarBounds={{
          min: parseDate("2024-01-01"),
          max: parseDate("2024-03-31"),
        }}
      />
    );

    const firstMonth = Number(
      (screen.getByLabelText("First month") as HTMLSelectElement).value
    );
    expect(firstMonth).toBeLessThanOrEqual(3);
  });

  it("uses bounded month options when changing desktop selects inside calendarBounds", async () => {
    const user = userEvent.setup();
    render(
      <OrderManagementRangeCalendar
        locale="en"
        value={datesToRangeValue(JAN_15_2024, MAR_20_2024)}
        onChange={vi.fn()}
        viewFocusDate={parseDate("2024-02-01")}
        calendarBounds={{
          min: parseDate("2024-01-01"),
          max: parseDate("2024-04-30"),
        }}
      />
    );

    await user.selectOptions(screen.getByLabelText("First month"), "3");
    expect(Number((screen.getByLabelText("First month") as HTMLSelectElement).value)).toBe(3);

    await user.selectOptions(screen.getByLabelText("Second month"), "4");
    expect(Number((screen.getByLabelText("Second month") as HTMLSelectElement).value)).toBe(4);
  });
});

describe("OrderManagementRangeCalendar (mobile)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders mobile stacked layout with weekday strip and mobile month selects", () => {
    render(
      <OrderManagementRangeCalendar
        locale="en"
        value={datesToRangeValue(JAN_15_2024, MAR_20_2024)}
        onChange={vi.fn()}
        viewFocusDate={parseDate("2024-01-01")}
        isMobile
      />
    );

    expect(getCalendarRoot()).toBeInTheDocument();
    expect(screen.getByLabelText("Month", { selector: "#om-cal-s-month" })).toBeInTheDocument();
    expect(screen.getByLabelText("Year", { selector: "#om-cal-s-year" })).toBeInTheDocument();
    expect(document.getElementById("om-cal-s-month-2")).toBeInTheDocument();
    expect(document.getElementById("om-cal-s-year-2")).toBeInTheDocument();
    expect(within(getCalendarRoot()).getAllByRole("grid").length).toBeGreaterThanOrEqual(2);
  });

  it("updates mobile month and year selects", async () => {
    const user = userEvent.setup();
    render(
      <OrderManagementRangeCalendar
        locale="en"
        value={null}
        onChange={vi.fn()}
        viewFocusDate={parseDate("2024-03-01")}
        isMobile
      />
    );

    const monthSelect = screen.getByLabelText("Month", { selector: "#om-cal-s-month" });
    await user.selectOptions(monthSelect, "5");
    expect(Number((monthSelect as HTMLSelectElement).value)).toBe(5);

    const yearSelect = screen.getByLabelText("Year", { selector: "#om-cal-s-year" });
    const years = Array.from((yearSelect as HTMLSelectElement).options).map((o) => o.value);
    const alternateYear = years.find((y) => y !== (yearSelect as HTMLSelectElement).value) ?? years[0]!;
    await user.selectOptions(yearSelect, alternateYear);
    expect((yearSelect as HTMLSelectElement).value).toBe(alternateYear);
  });

  it("updates stacked second-month mobile selects", async () => {
    const user = userEvent.setup();
    render(
      <OrderManagementRangeCalendar
        locale="en"
        value={null}
        onChange={vi.fn()}
        viewFocusDate={parseDate("2024-01-01")}
        isMobile
        calendarBounds={{
          min: parseDate("2024-01-01"),
          max: parseDate("2024-12-31"),
        }}
      />
    );

    const secondMonthSelect = document.getElementById("om-cal-s-month-2") as HTMLSelectElement;
    const monthOptions = Array.from(secondMonthSelect.options).map((o) => Number(o.value));
    const pick = monthOptions.includes(9) ? 9 : monthOptions[0]!;
    await user.selectOptions(secondMonthSelect, String(pick));
    expect(Number(secondMonthSelect.value)).toBe(pick);

    const secondYearSelect = document.getElementById("om-cal-s-year-2") as HTMLSelectElement;
    const yearOptions = Array.from(secondYearSelect.options).map((o) => Number(o.value));
    const pickYear = yearOptions.includes(2024) ? 2024 : yearOptions[0]!;
    await user.selectOptions(secondYearSelect, String(pickYear));
    expect(Number(secondYearSelect.value)).toBe(pickYear);
  });

  it("clamps mobile view into calendarBounds when initial month is outside the window", () => {
    render(
      <OrderManagementRangeCalendar
        locale="en"
        value={null}
        onChange={vi.fn()}
        viewFocusDate={parseDate("2024-11-01")}
        isMobile
        calendarBounds={{
          min: parseDate("2024-02-01"),
          max: parseDate("2024-04-30"),
        }}
      />
    );

    const monthSelect = document.getElementById("om-cal-s-month") as HTMLSelectElement;
    expect(Number(monthSelect.value)).toBeGreaterThanOrEqual(2);
    expect(Number(monthSelect.value)).toBeLessThanOrEqual(4);
  });

  it("changes bounded mobile stacked second-month select", async () => {
    const user = userEvent.setup();
    render(
      <OrderManagementRangeCalendar
        locale="en"
        value={null}
        onChange={vi.fn()}
        viewFocusDate={parseDate("2024-02-01")}
        isMobile
        calendarBounds={{
          min: parseDate("2024-01-01"),
          max: parseDate("2024-05-31"),
        }}
      />
    );

    const secondMonthSelect = document.getElementById("om-cal-s-month-2") as HTMLSelectElement;
    await user.selectOptions(secondMonthSelect, "4");
    expect(Number(secondMonthSelect.value)).toBe(4);
  });
});
