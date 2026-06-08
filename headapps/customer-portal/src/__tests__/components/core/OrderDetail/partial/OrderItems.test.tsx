import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OrderItems } from "@/components/core/OrderDetail/partial/OrderItems";
import type {
  IOrderDetailFields,
  OrderDetailLineItem,
} from "@/components/core/OrderDetail/OrderDetail.type";
import type { UseQuoteRequestReturn } from "@/hooks/useQuoteRequest";
import useDeviceType from "@/hooks/use-device-type";

vi.mock("@/hooks/use-device-type");

vi.mock("@/lib/orderDetailAnalytics", () => ({
  trackOrderDetailCollapseAllItems: vi.fn(),
  trackOrderDetailExpandAllItems: vi.fn(),
  trackOrderDetailDocRequestInitiated: vi.fn(),
  trackOrderDetailLineItemDescriptionExpand: vi.fn(),
  trackOrderDetailQuoteRequestInitiated: vi.fn(),
}));

const baseFields: IOrderDetailFields = {
  SectionTitlePattern: { value: "Order items ({count})" },
  ColumnHeader: { value: "PART # / DESCRIPTION" },
  CustomerPartLabel: { value: "Customer Part" },
  IntraloxPartLabel: { value: "Intralox Part" },
  DefaultPageSize: { value: "50" },
  PageSizeOptionList: [{ id: "ps-50", fields: { Value: { value: "50" } } }],
  ActiveColumnsSelection: [
    {
      id: "col-qty",
      displayName: "Quantity",
      fields: {
        Value: { value: "QUANTITY" },
        ColumnHeader: { value: "QUANTITY (EACH)" },
      },
    },
  ],
};

const baseLineItem: OrderDetailLineItem = {
  customerPartNumber: "58970",
  intraloxPartNumber: "A1H8HYAGJ5ZB",
  partDescription: { value: "SERIES 4500" },
  quantity: { value: 192, unit: "EACH" },
};

describe("OrderItems", () => {
  const OriginalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    vi.mocked(useDeviceType).mockReturnValue({
      device: null,
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: false,
    });

    globalThis.ResizeObserver = class {
      private readonly callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element): void {
        Object.defineProperty(target, "scrollHeight", {
          configurable: true,
          value: 120,
        });
        Object.defineProperty(target, "clientHeight", {
          configurable: true,
          value: 40,
        });
        queueMicrotask(() => this.callback([], this));
      }

      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = OriginalResizeObserver;
  });

  it("renders data table when not mobile", () => {
    vi.mocked(useDeviceType).mockReturnValue({
      device: "desktop",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const orderHeader = {
      orderId: 12345,
      orderHeaderId: 1,
      accountId: 1,
      orderDate: "2024-01-01",
      orderStatus: "placed",
    };
    render(
      <OrderItems
        fields={baseFields}
        lineItems={[baseLineItem]}
        orderNumber="12345"
        orderHeader={orderHeader}
        canRequestDocumentation={false}
        canInitiateRfq={false}
        quoteRequest={null}
      />
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders mobile card list when mobile", () => {
    vi.mocked(useDeviceType).mockReturnValue({
      device: "mobile",
      isNarrowContactViewport: false,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const orderHeader = {
      orderId: 12345,
      orderHeaderId: 1,
      accountId: 1,
      orderDate: "2024-01-01",
      orderStatus: "placed",
    };
    render(
      <OrderItems
        fields={baseFields}
        lineItems={[baseLineItem]}
        orderNumber="12345"
        orderHeader={orderHeader}
        canRequestDocumentation={false}
        canInitiateRfq={false}
        quoteRequest={null}
      />
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText(/Customer Part #58970/)).toBeInTheDocument();
  });

  it("shows pagination when items exceed the default page size", () => {
    vi.mocked(useDeviceType).mockReturnValue({
      device: "desktop",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const fields: IOrderDetailFields = {
      ...baseFields,
      DefaultPageSize: { value: "2" },
      PageSizeOptionList: [
        { id: "ps-2", fields: { Value: { value: "2" } } },
        { id: "ps-10", fields: { Value: { value: "10" } } },
      ],
      ResultSummaryPattern: { value: "{start}–{end} of {total}" },
    };

    const orderHeader = {
      orderId: 12345,
      orderHeaderId: 1,
      accountId: 1,
      orderDate: "2024-01-01",
      orderStatus: "placed",
    };

    const lineItems: OrderDetailLineItem[] = [
      baseLineItem,
      { ...baseLineItem, customerPartNumber: "2" },
      { ...baseLineItem, customerPartNumber: "3" },
    ];

    render(
      <OrderItems
        fields={fields}
        lineItems={lineItems}
        orderNumber="12345"
        orderHeader={orderHeader}
        canRequestDocumentation={false}
        canInitiateRfq={false}
        quoteRequest={null}
      />
    );

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByText(/1–2 of 3/)).toBeInTheDocument();
  });

  it("hides expand all when no line descriptions are expandable", () => {
    globalThis.ResizeObserver = class {
      observe(): void {}
      disconnect(): void {}
      constructor(_callback: ResizeObserverCallback) {}
    } as unknown as typeof ResizeObserver;

    vi.mocked(useDeviceType).mockReturnValue({
      device: "desktop",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const fields: IOrderDetailFields = {
      ...baseFields,
      ExpandAllLabel: { value: "Expand all lines" },
      CollapseAllLabel: { value: "Collapse all lines" },
    };

    const orderHeader = {
      orderId: 12345,
      orderHeaderId: 1,
      accountId: 1,
      orderDate: "2024-01-01",
      orderStatus: "placed",
    };

    render(
      <OrderItems
        fields={fields}
        lineItems={[baseLineItem]}
        orderNumber="12345"
        orderHeader={orderHeader}
        canRequestDocumentation={false}
        canInitiateRfq={false}
        quoteRequest={null}
      />
    );

    expect(screen.queryByRole("button", { name: /Expand all lines/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Collapse all lines/ })).not.toBeInTheDocument();
  });

  it("scopes expand all visibility and actions to the current page only", async () => {
    const user = userEvent.setup();
    vi.mocked(useDeviceType).mockReturnValue({
      device: "desktop",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const OriginalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      private readonly callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element): void {
        const text = target.textContent ?? "";
        const overflowing = text.length > 80;
        Object.defineProperty(target, "scrollHeight", {
          configurable: true,
          value: overflowing ? 120 : 40,
        });
        Object.defineProperty(target, "clientHeight", {
          configurable: true,
          value: 40,
        });
        queueMicrotask(() => this.callback([], this));
      }

      disconnect(): void {}
    } as unknown as typeof ResizeObserver;

    const fields: IOrderDetailFields = {
      ...baseFields,
      DefaultPageSize: { value: "2" },
      PageSizeOptionList: [{ id: "ps-2", fields: { Value: { value: "2" } } }],
      ExpandAllLabel: { value: "Expand all lines" },
      CollapseAllLabel: { value: "Collapse all lines" },
    };

    const orderHeader = {
      orderId: 12345,
      orderHeaderId: 1,
      accountId: 1,
      orderDate: "2024-01-01",
      orderStatus: "placed",
    };

    render(
      <OrderItems
        fields={fields}
        lineItems={[
          { ...baseLineItem, customerPartNumber: "SHORT-1", partDescription: { value: "Short" } },
          { ...baseLineItem, customerPartNumber: "SHORT-2", partDescription: { value: "Brief" } },
          {
            ...baseLineItem,
            customerPartNumber: "LONG-3",
            partDescription: { value: "A".repeat(100) },
          },
        ]}
        orderNumber="12345"
        orderHeader={orderHeader}
        canRequestDocumentation={false}
        canInitiateRfq={false}
        quoteRequest={null}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /Expand all lines/ })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Next page" }));

    const expandAllButton = await screen.findByRole("button", { name: /Expand all lines/ });
    await user.click(expandAllButton);

    expect(screen.getByRole("button", { name: /Collapse all lines/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Collapse description" })).toHaveLength(1);

    globalThis.ResizeObserver = OriginalResizeObserver;
  });

  it("toggles expand all and collapse all only for expandable lines", async () => {
    const user = userEvent.setup();
    vi.mocked(useDeviceType).mockReturnValue({
      device: "desktop",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const fields: IOrderDetailFields = {
      ...baseFields,
      ExpandAllLabel: { value: "Expand all lines" },
      CollapseAllLabel: { value: "Collapse all lines" },
    };

    const orderHeader = {
      orderId: 12345,
      orderHeaderId: 1,
      accountId: 1,
      orderDate: "2024-01-01",
      orderStatus: "placed",
    };

    const longDescription = "A".repeat(100);
    const expandableItem: OrderDetailLineItem = {
      ...baseLineItem,
      customerPartNumber: "LONG-1",
      partDescription: { value: longDescription },
    };
    const shortItem: OrderDetailLineItem = {
      ...baseLineItem,
      customerPartNumber: "SHORT-1",
      partDescription: { value: "Short" },
    };

    render(
      <OrderItems
        fields={fields}
        lineItems={[expandableItem, shortItem]}
        orderNumber="12345"
        orderHeader={orderHeader}
        canRequestDocumentation={false}
        canInitiateRfq={false}
        quoteRequest={null}
      />
    );

    expect(
      await screen.findByRole("button", { name: /Expand all lines/ })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Expand all lines/ }));
    expect(screen.getByRole("button", { name: /Collapse all lines/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Collapse all lines/ }));
    expect(screen.getByRole("button", { name: /Expand all lines/ })).toBeInTheDocument();
  });

  it("does not show chevron on non-overflowing lines after expand all", async () => {
    const user = userEvent.setup();
    vi.mocked(useDeviceType).mockReturnValue({
      device: "desktop",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const OriginalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      private readonly callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element): void {
        const text = target.textContent ?? "";
        const overflowing = text.length > 80;
        Object.defineProperty(target, "scrollHeight", {
          configurable: true,
          value: overflowing ? 120 : 40,
        });
        Object.defineProperty(target, "clientHeight", {
          configurable: true,
          value: 40,
        });
        queueMicrotask(() => this.callback([], this));
      }

      disconnect(): void {}
    } as unknown as typeof ResizeObserver;

    const fields: IOrderDetailFields = {
      ...baseFields,
      ExpandAllLabel: { value: "Expand all lines" },
      CollapseAllLabel: { value: "Collapse all lines" },
    };

    const orderHeader = {
      orderId: 12345,
      orderHeaderId: 1,
      accountId: 1,
      orderDate: "2024-01-01",
      orderStatus: "placed",
    };

    render(
      <OrderItems
        fields={fields}
        lineItems={[
          { ...baseLineItem, customerPartNumber: "SHORT", partDescription: { value: "Short" } },
          {
            ...baseLineItem,
            customerPartNumber: "LONG-1",
            partDescription: { value: "A".repeat(100) },
          },
        ]}
        orderNumber="12345"
        orderHeader={orderHeader}
        canRequestDocumentation={false}
        canInitiateRfq={false}
        quoteRequest={null}
      />
    );

    const expandAllButton = await screen.findByRole("button", { name: /Expand all lines/ });
    await user.click(expandAllButton);

    expect(screen.queryByRole("button", { name: "Expand description" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse description" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Collapse all lines/ })).toBeInTheDocument();

    globalThis.ResizeObserver = OriginalResizeObserver;
  });

  it("renders Price column header branch and invokes quote action from kebab", async () => {
    const user = userEvent.setup();
    vi.mocked(useDeviceType).mockReturnValue({
      device: "desktop",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const openFromLineItem = vi.fn();
    const quoteRequest = {
      draft: { orderQuote: { quoteItems: [] } },
      lineKeyInQueue: () => false,
      openFromLineItem,
      quoteCms: null,
    } as unknown as UseQuoteRequestReturn;

    const fields: IOrderDetailFields = {
      ...baseFields,
      RequestNewQuoteLabel: { value: "Request quote" },
      ActiveColumnsSelection: [
        {
          id: "col-ext",
          displayName: "Extended Net Price",
          fields: {
            Value: { value: "EXTENDED NET PRICE" },
            ColumnHeader: { value: "Ext $" },
          },
        },
      ],
    };

    const orderHeader = {
      orderId: 12345,
      orderHeaderId: 1,
      accountId: 1,
      orderDate: "2024-01-01",
      orderStatus: "placed",
    };

    const lineItems: OrderDetailLineItem[] = [
      {
        ...baseLineItem,
        extendedNetPrice: { value: 100, currency: "USD", displayValue: "$100" },
      },
    ];

    render(
      <OrderItems
        fields={fields}
        lineItems={lineItems}
        orderNumber="12345"
        orderHeader={orderHeader}
        canRequestDocumentation={false}
        canInitiateRfq={true}
        quoteRequest={quoteRequest}
      />
    );

    expect(screen.getByText("EXTENDED NET PRICE")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Line item actions" }));
    await user.click(screen.getByRole("button", { name: "Request quote" }));
    expect(openFromLineItem).toHaveBeenCalled();
  });
});
