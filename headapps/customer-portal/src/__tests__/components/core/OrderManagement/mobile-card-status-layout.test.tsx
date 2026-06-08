import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrderManagementMobileCards } from "@/components/core/OrderManagement/partial/OrderManagementMobileCards";
import { InvoicesMobileCards } from "@/components/core/OrderManagement/tabs/invoices/InvoicesMobileCards";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";

vi.mock("next-intl", () => ({
  hasLocale: (locales: readonly string[], locale: string) => locales.includes(locale),
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/hooks/use-active-locale", () => ({
  useActiveLocale: () => "en",
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Image: () => null,
  Text: ({ field }: { field?: { value?: string } }) => <span>{field?.value}</span>,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    onPress,
    type,
    ...rest
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    type?: "button" | "submit" | "reset";
    [key: string]: unknown;
  }) => (
    <button type={type ?? "button"} onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

const baseShell = {
  pageSize: 10,
  appliedSearch: "",
  locale: "en-US",
  isOrdersListLoading: false,
  statusSelections: new Set<string>(),
  beltCount: 0,
  statusDisplay: () => ({ label: "Shipped" }),
} as Partial<OrderManagementShell>;

const orderGridColumns = [
  { id: "order", fields: { GridName: { value: "Order #" } } },
  { id: "status", fields: { GridName: { value: "Status" } } },
];

const invoiceGridColumns = [
  { id: "invoice", fields: { GridName: { value: "Invoice #" } } },
  { id: "status", fields: { GridName: { value: "Status" } } },
];

describe("mobile card status layout", () => {
  it("keeps order status in the right header column", () => {
    render(
      <OrderManagementMobileCards
        orderManagement={
          {
            ...baseShell,
            gridColumns: orderGridColumns,
            pageSlice: [
              {
                orderHeaderId: "42",
                orderId: "42",
                orderNumber: "3336212",
                poNumber: "PO-1",
                itemCount: 2,
                orderDate: "2025-01-15T00:00:00Z",
                totalAmount: 25,
                currency: "USD",
                statusKey: "shipped",
                lineItems: [],
                shipments: [],
                orderStatusLabel: "Shipped",
              },
            ],
            orderDetailHref: () => "/orders-management/orders/42",
          } as unknown as OrderManagementShell
        }
      />
    );

    expect(screen.getByText("Shipped")).toHaveClass("justify-self-end");
  });

  it("keeps invoice status in the right header column", () => {
    render(
      <InvoicesMobileCards
        orderManagement={
          {
            ...baseShell,
            gridColumns: invoiceGridColumns,
            invoicePageSlice: [
              {
                invoiceId: "inv-1",
                invoiceNumber: "INV-1",
                poNumber: "PO-1",
                orderNumber: "3336212",
                orderHeaderId: "42",
                statusKey: "invoice_invoiced",
                invoiceDate: "2025-01-15T00:00:00Z",
                dueDate: null,
                amount: 25,
                currency: "USD",
              },
            ],
            tabFields: {},
            invoiceDueSoonThresholdDays: 7,
            onInvoiceDownloadStart: vi.fn(),
          } as unknown as OrderManagementShell
        }
      />
    );

    expect(screen.getByText("Shipped")).toHaveClass("justify-self-end");
  });
});
