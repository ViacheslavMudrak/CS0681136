import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ButtonHTMLAttributes, MouseEvent, ReactElement, ReactNode } from "react";

import { OrderItemRow } from "@/components/core/OrderDetail/partial/OrderItemRow";
import type {
  IOrderDetailFields,
  OrderDetailActiveColumnItem,
  OrderDetailLineItem,
} from "@/components/core/OrderDetail/OrderDetail.type";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Image: ({ field }: { field?: { value?: { src?: string } } }): ReactElement | null =>
    field?.value?.src ? <img src={field.value.src} alt="" data-testid="kebab-img" /> : null,
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: (): ReactElement => <span data-testid="row-icon" />,
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
  partDescription: { value: "Short desc" },
  quantity: { value: 1, unit: "EACH" },
};

const qtyColumn: OrderDetailActiveColumnItem = {
  id: "col-qty",
  displayName: "Qty",
  fields: {
    Value: { value: "QUANTITY" },
    ColumnHeader: { value: "QTY" },
  },
};

describe("OrderItemRow", () => {
  const OriginalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("renders CMS column values", () => {
    render(
      <table>
        <tbody>
          <OrderItemRow
            fields={baseFields}
            item={{ ...baseLineItem, quantity: { value: 99, unit: "EACH" } }}
            rowKey="rk"
            isExpanded={false}
            onExpandInteraction={() => {}}
            orderNumber="1"
            activeColumns={[qtyColumn]}
            locale="en-US"
            canRequestDocumentation={false}
            canInitiateRfq={false}
            lineActionItems={[]}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("99")).toBeInTheDocument();
  });

  it("opens kebab menu and runs line action", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <table>
        <tbody>
          <OrderItemRow
            fields={{
              ...baseFields,
              InvoiceKebabMenuIcon: { value: { src: "https://example.com/k.png" } },
            }}
            item={baseLineItem}
            rowKey="rk"
            isExpanded={false}
            onExpandInteraction={() => {}}
            orderNumber="1"
            activeColumns={[]}
            locale="en-US"
            canRequestDocumentation={false}
            canInitiateRfq={false}
            lineActionItems={[{ key: "doc", label: "Request PDF", onPress }]}
          />
        </tbody>
      </table>
    );

    expect(screen.getByTestId("kebab-img")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Line item actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Request PDF" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("keeps collapse chevron visible after expanding overflowing description", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    const longItem = {
      ...baseLineItem,
      partDescription: { value: "A".repeat(120) },
    };

    const { rerender } = render(
      <table>
        <tbody>
          <OrderItemRow
            fields={baseFields}
            item={longItem}
            rowKey="rk"
            isExpanded={false}
            onExpandInteraction={onExpand}
            orderNumber="1"
            activeColumns={[]}
            locale="en-US"
            canRequestDocumentation={false}
            canInitiateRfq={false}
            lineActionItems={[]}
          />
        </tbody>
      </table>
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Expand description" })).toBeInTheDocument()
    );

    rerender(
      <table>
        <tbody>
          <OrderItemRow
            fields={baseFields}
            item={longItem}
            rowKey="rk"
            isExpanded={true}
            onExpandInteraction={onExpand}
            orderNumber="1"
            activeColumns={[]}
            locale="en-US"
            canRequestDocumentation={false}
            canInitiateRfq={false}
            lineActionItems={[]}
          />
        </tbody>
      </table>
    );

    expect(screen.getByRole("button", { name: "Collapse description" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Collapse description" }));
    expect(onExpand).toHaveBeenCalledWith("chevron");
  });

  it("fires chevron handler when expanded (collapse description)", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    render(
      <table>
        <tbody>
          <OrderItemRow
            fields={baseFields}
            item={{
              ...baseLineItem,
              partDescription: { value: "A".repeat(120) },
            }}
            rowKey="rk"
            isExpanded={true}
            onExpandInteraction={onExpand}
            orderNumber="1"
            activeColumns={[]}
            locale="en-US"
            canRequestDocumentation={false}
            canInitiateRfq={false}
            lineActionItems={[]}
          />
        </tbody>
      </table>
    );

    const collapseBtn = await waitFor(() =>
      screen.getByRole("button", { name: "Collapse description" })
    );
    await user.click(collapseBtn);
    expect(onExpand).toHaveBeenCalledWith("chevron");
  });

  it("does not show a chevron when expanded but description does not overflow", () => {
    globalThis.ResizeObserver = class {
      observe(): void {}
      disconnect(): void {}
      constructor(_callback: ResizeObserverCallback) {}
    } as unknown as typeof ResizeObserver;

    render(
      <table>
        <tbody>
          <OrderItemRow
            fields={baseFields}
            item={baseLineItem}
            rowKey="rk"
            isExpanded={true}
            onExpandInteraction={() => {}}
            orderNumber="1"
            activeColumns={[]}
            locale="en-US"
            canRequestDocumentation={false}
            canInitiateRfq={false}
            lineActionItems={[]}
          />
        </tbody>
      </table>
    );

    expect(screen.queryByRole("button", { name: /description/i })).not.toBeInTheDocument();
  });

  it("does not fire expand handler when the row is activated", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    render(
      <table>
        <tbody>
          <OrderItemRow
            fields={baseFields}
            item={baseLineItem}
            rowKey="rk"
            isExpanded={false}
            onExpandInteraction={onExpand}
            orderNumber="1"
            activeColumns={[]}
            locale="en-US"
            canRequestDocumentation={false}
            canInitiateRfq={false}
            lineActionItems={[]}
          />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("row"));
    expect(onExpand).not.toHaveBeenCalled();
  });
});
