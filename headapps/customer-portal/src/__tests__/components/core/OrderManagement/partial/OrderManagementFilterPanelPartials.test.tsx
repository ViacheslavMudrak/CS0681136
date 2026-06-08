import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import {
  OrderManagementBeltFilterFooter,
  OrderManagementBeltFilterGroups,
  OrderManagementFilterAccordionTrigger,
  OrderManagementStatusFilterList,
} from "@/components/core/OrderManagement/partial/OrderManagementFilterPanelPartials";
import type {
  BeltSubgroupMetaRow,
  OrderManagementTabFields,
  OrderManagementValueItem,
} from "@/components/core/OrderManagement/OrderManagement.type";
import { createEmptyBeltSelections } from "@/lib/orderManagementUtils";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field }: { field?: { value?: string } }): ReactElement | null =>
    field?.value != null && field.value !== "" ? (
      <span>{field.value}</span>
    ) : null,
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: (): ReactElement => <span data-testid="accordion-chevron-icon" />,
  Checkbox: ({
    children,
    isSelected,
    onChange,
    className,
  }: {
    children?: React.ReactNode;
    isSelected?: boolean;
    onChange?: () => void;
    className?: string;
  }): ReactElement => (
    <label className={className}>
      <input type="checkbox" checked={!!isSelected} onChange={() => onChange?.()} />
      {children}
    </label>
  ),
}));

vi.mock("src/components/shared/icons/SearchIcon", () => ({
  __esModule: true,
  default: (): ReactElement => <span data-testid="belt-search-icon" />,
}));

vi.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onPress,
    isDisabled,
    ...rest
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => (
    <button type="button" disabled={isDisabled} onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/Input", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<"input">): ReactElement => <input {...props} />,
}));

const placedOption: OrderManagementValueItem = {
  id: "opt-placed",
  displayName: "Placed",
  fields: {
    StatusValue: { value: "Placed" },
    Statuskey: { value: "PLACED" },
  },
};

const shippedOption: OrderManagementValueItem = {
  id: "opt-shipped",
  displayName: "Shipped",
  fields: {
    StatusValue: { value: "Shipped" },
    Statuskey: { value: "SHIPPED" },
  },
};

function tabFieldsWithFilterOptions(
  options: OrderManagementValueItem[]
): OrderManagementTabFields {
  return { FilterOptions: options };
}

describe("OrderManagementFilterAccordionTrigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onPress when clicked", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <OrderManagementFilterAccordionTrigger
        expanded={false}
        onPress={onPress}
        label="Filters"
      />
    );
    await user.click(screen.getByRole("button", { name: "Filters" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("sets aria-expanded from expanded and supports aria-label override", () => {
    const { rerender } = render(
      <OrderManagementFilterAccordionTrigger
        expanded={false}
        onPress={vi.fn()}
        label="Section"
        ariaLabel="Expand filters"
      />
    );
    const btn = screen.getByRole("button", { name: "Expand filters" });
    expect(btn).toHaveAttribute("aria-expanded", "false");

    rerender(
      <OrderManagementFilterAccordionTrigger
        expanded
        onPress={vi.fn()}
        label="Section"
        ariaLabel="Expand filters"
      />
    );
    expect(screen.getByRole("button", { name: "Expand filters" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });
});

describe("OrderManagementStatusFilterList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders no rows when FilterOptions is empty", () => {
    const toggle = vi.fn();
    const { container } = render(
      <OrderManagementStatusFilterList
        tabFields={tabFieldsWithFilterOptions([])}
        statusDraft={new Set()}
        toggleStatusDraftOption={toggle}
      />
    );
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
  });

  it("renders checkboxes and invokes toggle with the option label", async () => {
    const user = userEvent.setup();
    const toggle = vi.fn();
    const tabFields = tabFieldsWithFilterOptions([placedOption]);
    render(
      <OrderManagementStatusFilterList
        tabFields={tabFields}
        statusDraft={new Set()}
        toggleStatusDraftOption={toggle}
      />
    );
    await user.click(screen.getByRole("checkbox", { name: /placed/i }));
    expect(toggle).toHaveBeenCalledWith("Placed");
  });

  it("marks checkbox checked when statusDraft contains the resolved key", () => {
    const tabFields = tabFieldsWithFilterOptions([placedOption, shippedOption]);
    render(
      <OrderManagementStatusFilterList
        tabFields={tabFields}
        statusDraft={new Set(["order_placed"])}
        toggleStatusDraftOption={vi.fn()}
      />
    );
    expect(screen.getByRole("checkbox", { name: /placed/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /shipped/i })).not.toBeChecked();
  });

  it("wraps options in a fieldset with legend when groupLegend is non-empty", () => {
    const { container } = render(
      <OrderManagementStatusFilterList
        tabFields={tabFieldsWithFilterOptions([placedOption])}
        statusDraft={new Set()}
        toggleStatusDraftOption={vi.fn()}
        groupLegend="Order status"
      />
    );
    const fs = container.querySelector("fieldset");
    expect(fs).not.toBeNull();
    expect(container.querySelector("legend")).toHaveTextContent("Order status");
  });

  it("uses a div wrapper when groupLegend is absent or whitespace-only", () => {
    const { container: c1 } = render(
      <OrderManagementStatusFilterList
        tabFields={tabFieldsWithFilterOptions([placedOption])}
        statusDraft={new Set()}
        toggleStatusDraftOption={vi.fn()}
      />
    );
    expect(c1.querySelector("fieldset")).toBeNull();

    const { container: c2 } = render(
      <OrderManagementStatusFilterList
        tabFields={tabFieldsWithFilterOptions([placedOption])}
        statusDraft={new Set()}
        toggleStatusDraftOption={vi.fn()}
        groupLegend="   "
      />
    );
    expect(c2.querySelector("fieldset")).toBeNull();
  });

  it("falls back to plain label text when StatusValue and Value are missing", () => {
    const legacyOnly: OrderManagementValueItem = {
      id: "legacy",
      displayName: "Display only",
      fields: {
        Statuskey: { value: "PLACED" },
      },
    };
    render(
      <OrderManagementStatusFilterList
        tabFields={tabFieldsWithFilterOptions([legacyOnly])}
        statusDraft={new Set()}
        toggleStatusDraftOption={vi.fn()}
      />
    );
    expect(screen.getByText("Display only")).toBeInTheDocument();
  });
});

describe("OrderManagementBeltFilterGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const seriesMeta: BeltSubgroupMetaRow = {
    key: "series",
    label: "Series",
    labelField: { value: "Series group" },
    options: ["A", "B", "C"],
  };

  it("calls toggleBeltDraft when a belt checkbox is toggled", async () => {
    const user = userEvent.setup();
    const toggleBeltDraft = vi.fn();
    const beltDraft = createEmptyBeltSelections();
    const setBeltSearch = vi.fn();
    render(
      <OrderManagementBeltFilterGroups
        beltSubgroupMeta={[seriesMeta]}
        beltSearch={{}}
        setBeltSearch={setBeltSearch}
        beltDraft={beltDraft}
        toggleBeltDraft={toggleBeltDraft}
        scrollThreshold={10}
        searchThreshold={10}
        beltSearchPh="Search"
      />
    );
    await user.click(screen.getByRole("checkbox", { name: "B" }));
    expect(toggleBeltDraft).toHaveBeenCalledWith("series", "B");
  });

  it("shows category search when option count exceeds searchThreshold", () => {
    const manyOptions = ["Alpha", "Beta", "Gamma", "Delta"];
    const meta: BeltSubgroupMetaRow = {
      ...seriesMeta,
      options: manyOptions,
    };
    render(
      <OrderManagementBeltFilterGroups
        beltSubgroupMeta={[meta]}
        beltSearch={{}}
        setBeltSearch={vi.fn()}
        beltDraft={createEmptyBeltSelections()}
        toggleBeltDraft={vi.fn()}
        scrollThreshold={2}
        searchThreshold={2}
        beltSearchPh="Filter"
      />
    );
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(4);
  });

  it("filters belt checkboxes by beltSearch substring (case-insensitive)", () => {
    const manyOptions = ["Alpha", "Beta", "Gamma"];
    const meta: BeltSubgroupMetaRow = {
      ...seriesMeta,
      options: manyOptions,
    };
    render(
      <OrderManagementBeltFilterGroups
        beltSubgroupMeta={[meta]}
        beltSearch={{ series: "al" }}
        setBeltSearch={vi.fn()}
        beltDraft={createEmptyBeltSelections()}
        toggleBeltDraft={vi.fn()}
        scrollThreshold={2}
        searchThreshold={2}
        beltSearchPh="Filter"
      />
    );
    expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Beta" })).not.toBeInTheDocument();
  });

  it("does not show search when options count is at or below searchThreshold", () => {
    render(
      <OrderManagementBeltFilterGroups
        beltSubgroupMeta={[seriesMeta]}
        beltSearch={{}}
        setBeltSearch={vi.fn()}
        beltDraft={createEmptyBeltSelections()}
        toggleBeltDraft={vi.fn()}
        scrollThreshold={10}
        searchThreshold={10}
        beltSearchPh="Search"
      />
    );
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("renders subgroup title from labelField when provided", () => {
    render(
      <OrderManagementBeltFilterGroups
        beltSubgroupMeta={[seriesMeta]}
        beltSearch={{}}
        setBeltSearch={vi.fn()}
        beltDraft={createEmptyBeltSelections()}
        toggleBeltDraft={vi.fn()}
        scrollThreshold={10}
        searchThreshold={10}
        beltSearchPh="Search"
      />
    );
    expect(screen.getByText("Series group")).toBeInTheDocument();
  });

  it("sets search aria-label from placeholder and group label when both exist", () => {
    const manyOptions = ["a", "b", "c", "d"];
    render(
      <OrderManagementBeltFilterGroups
        beltSubgroupMeta={[
          {
            key: "style",
            label: "Style column",
            labelField: { value: "Style column" },
            options: manyOptions,
          },
        ]}
        beltSearch={{}}
        setBeltSearch={vi.fn()}
        beltDraft={createEmptyBeltSelections()}
        toggleBeltDraft={vi.fn()}
        scrollThreshold={2}
        searchThreshold={2}
        beltSearchPh="Search belts"
      />
    );
    expect(screen.getByRole("searchbox")).toHaveAttribute(
      "aria-label",
      "Search belts Style column"
    );
  });

  it("uses group label only for search aria-label when placeholder is empty", () => {
    const manyOptions = ["a", "b", "c"];
    render(
      <OrderManagementBeltFilterGroups
        beltSubgroupMeta={[
          {
            key: "series",
            label: "Series only",
            options: manyOptions,
          },
        ]}
        beltSearch={{}}
        setBeltSearch={vi.fn()}
        beltDraft={createEmptyBeltSelections()}
        toggleBeltDraft={vi.fn()}
        scrollThreshold={2}
        searchThreshold={2}
        beltSearchPh=""
      />
    );
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-label", "Series only");
  });

  it("filters belt options when search text is entered", async () => {
    const user = userEvent.setup();
    const setBeltSearch = vi.fn();
    const manyOptions = ["Alpha", "Beta", "Gamma", "Delta"];

    render(
      <OrderManagementBeltFilterGroups
        beltSubgroupMeta={[
          {
            key: "series",
            label: "Series",
            options: manyOptions,
          },
        ]}
        beltSearch={{ series: "alp" }}
        setBeltSearch={setBeltSearch}
        beltDraft={createEmptyBeltSelections()}
        toggleBeltDraft={vi.fn()}
        scrollThreshold={2}
        searchThreshold={2}
        beltSearchPh="Search"
      />
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();

    await user.type(screen.getByRole("searchbox"), "x");
    expect(setBeltSearch).toHaveBeenCalled();
  });
});

describe("OrderManagementBeltFilterFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides Clear and disables Apply when no selection", () => {
    render(
      <OrderManagementBeltFilterFooter
        clearLabel="Clear all"
        applyLabel="Apply"
        hasSelection={false}
        onClear={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No selection" })).toBeDisabled();
  });

  it("enables Apply when applied filters exist but draft was cleared", () => {
    render(
      <OrderManagementBeltFilterFooter
        clearLabel="Clear all"
        applyLabel="Apply"
        hasSelection={false}
        hasAppliedFilters
        onClear={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled();
  });

  it("shows Clear next to Apply and enables Apply when selection exists", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const onApply = vi.fn();
    render(
      <OrderManagementBeltFilterFooter
        clearLabel="Clear all"
        applyLabel="Apply"
        hasSelection
        onClear={onClear}
        onApply={onApply}
      />
    );
    const clearButton = screen.getByRole("button", { name: "Clear all" });
    const applyButton = screen.getByRole("button", { name: "Apply" });
    expect(clearButton).toBeInTheDocument();
    expect(applyButton).toBeEnabled();
    await user.click(clearButton);
    await user.click(applyButton);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});
