import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ButtonHTMLAttributes, MouseEvent, ReactElement, ReactNode } from "react";

import { OrderItemMobileCard } from "@/components/core/OrderDetail/partial/OrderItemMobileCard";
import type {
  IOrderDetailFields,
  OrderDetailActiveColumnItem,
  OrderDetailLineItem,
} from "@/components/core/OrderDetail/OrderDetail.type";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field }: { field?: { value?: string } }): ReactElement | null =>
    field?.value ? <span>{field.value}</span> : null,
  Image: ({ field }: { field?: { value?: { src?: string } } }): ReactElement | null =>
    field?.value?.src ? <img src={field.value.src} alt="" data-testid="kebab-img" /> : null,
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: (): ReactElement => <span data-testid="card-icon" />,
}));

vi.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onPress,
    isDisabled,
    btnVariant: _btnVariant,
    onClick: onClickProp,
    ...rest
  }: {
    children?: ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
    btnVariant?: string;
  } & ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => (
    <button
      type="button"
      disabled={isDisabled}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClickProp?.(e);
        onPress?.();
      }}
      {...rest}
    >
      {children}
    </button>
  ),
}));

const baseFields: IOrderDetailFields = {
  ColumnHeader: { value: "PART # / DESCRIPTION" },
  CustomerPartLabel: { value: "Customer Part" },
  IntraloxPartLabel: { value: "Intralox Part" },
};

const baseLineItem: OrderDetailLineItem = {
  customerPartNumber: "58970",
  intraloxPartNumber: "A1H8HYAGJ5ZB",
  partDescription: { value: "SERIES 4500 belt" },
  quantity: { value: 192, unit: "EACH" },
};

const money = { value: 10, currency: "USD", displayValue: "$10.00" };

describe("OrderItemMobileCard", () => {
  const OriginalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.ResizeObserver = OriginalResizeObserver;
  });

  it("renders customer and intralox part lines with separator", () => {
    render(
      <OrderItemMobileCard
        fields={baseFields}
        item={baseLineItem}
        rowKey="row-0"
        isExpanded={false}
        onExpandInteraction={() => {}}
        orderNumber="12345"
        activeColumns={[]}
        locale="en-US"
        canRequestDocumentation={false}
        canInitiateRfq={false}
        lineActionItems={[]}
      />
    );

    expect(screen.getByText(/Customer Part #58970/)).toBeInTheDocument();
    expect(screen.getByText(/Intralox Part #A1H8HYAGJ5ZB/)).toBeInTheDocument();
    expect(screen.getByText("SERIES 4500 belt")).toBeInTheDocument();
  });

  it("renders metrics using ColumnHeader when Value field is absent", () => {
    const columns: OrderDetailActiveColumnItem[] = [
      {
        id: "col-1",
        displayName: "NET UNIT PRICE",
        fields: {
          ColumnHeader: { value: "Net unit" },
        },
      },
    ];
    render(
      <OrderItemMobileCard
        fields={baseFields}
        item={{ ...baseLineItem, netUnitPrice: money }}
        rowKey="row-0"
        isExpanded={false}
        onExpandInteraction={() => {}}
        orderNumber="12345"
        activeColumns={columns}
        locale="en-US"
        canRequestDocumentation={false}
        canInitiateRfq={false}
        lineActionItems={[]}
      />
    );

    expect(screen.getByText("Net unit")).toBeInTheDocument();
    expect(screen.getByText(/\$10|10\.00/)).toBeInTheDocument();
  });

  it("opens kebab menu and invokes line action", async () => {
    const user = userEvent.setup();
    const onLine = vi.fn();
    render(
      <OrderItemMobileCard
        fields={{
          ...baseFields,
          InvoiceKebabMenuIcon: { value: { src: "https://example.com/k.png" } },
        }}
        item={baseLineItem}
        rowKey="row-0"
        isExpanded={false}
        onExpandInteraction={() => {}}
        orderNumber="12345"
        activeColumns={[]}
        locale="en-US"
        canRequestDocumentation={false}
        canInitiateRfq={false}
        lineActionItems={[{ key: "a", label: "Do thing", onPress: onLine }]}
      />
    );

    expect(screen.getByTestId("kebab-img")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Line item actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Do thing" }));
    expect(onLine).toHaveBeenCalledTimes(1);
  });

  it("shows expand chevron when description overflows", async () => {
    globalThis.ResizeObserver = class {
      constructor(private cb: ResizeObserverCallback) {}
      observe(target: Element) {
        const el = target as HTMLElement;
        Object.defineProperty(el, "scrollHeight", { configurable: true, value: 500 });
        Object.defineProperty(el, "clientHeight", { configurable: true, value: 20 });
        this.cb([], this as unknown as ResizeObserver);
      }
      unobserve() {}
      disconnect() {}
    };

    const user = userEvent.setup();
    const onExpand = vi.fn();
    render(
      <OrderItemMobileCard
        fields={baseFields}
        item={{
          ...baseLineItem,
          partDescription: { value: "Long text ".repeat(40) },
        }}
        rowKey="row-0"
        isExpanded={false}
        onExpandInteraction={onExpand}
        orderNumber="12345"
        activeColumns={[]}
        locale="en-US"
        canRequestDocumentation={false}
        canInitiateRfq={false}
        lineActionItems={[]}
      />
    );

    const expandBtn = await screen.findByRole("button", { name: "Expand description" });
    await user.click(expandBtn);
    expect(onExpand).toHaveBeenCalledWith("chevron");
  });
});
