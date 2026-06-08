import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";

import { OrderManagementDefaultVariant } from "components/core/OrderManagement/variants/OrderManagementDefault.variant";
import ToastProvider from "@/components/shared/toast/ToastProvider";
import type { IOrderManagementFields } from "components/core/OrderManagement/OrderManagement.type";
import { TEST_CASE_DATA_IDS } from "../../../../../helpers/enums";
import type { Page } from "@sitecore-content-sdk/nextjs";

const mockPage = { mode: { isEditing: false } } as Page;

const mockUseOrderManagementShell = vi.hoisted(() => vi.fn());

vi.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({ oktaAuth: null, authState: null }),
}));

vi.mock("@/hooks/useOrderManagementShell", () => ({
  useOrderManagementShell: (input: unknown) => mockUseOrderManagementShell(input),
}));

vi.mock("@/hooks/useQuoteRequest", () => ({
  useQuoteRequest: vi.fn(() => ({
    hasPendingDraft: false,
    openFromHeader: vi.fn(),
    queueItemCount: 0,
    isOpen: false,
  })),
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer", () => ({
  QuoteRequestDrawer: () => null,
}));

function renderWithToast(ui: ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

vi.mock("@/components/core/OrderManagement/partial/OrderManagementHeader", () => ({
  OrderManagementHeader: () => <div data-testid="order-management-header" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementTabBar", () => ({
  OrderManagementTabBar: () => <div data-testid="order-management-tab-bar" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementChipRow", () => ({
  OrderManagementChipRow: () => <div data-testid="order-management-chip-row" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementMobileSheets", () => ({
  OrderManagementMobileSheets: () => <div data-testid="order-management-mobile-sheets" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementPagination", () => ({
  OrderManagementPagination: () => <div data-testid="order-management-pagination" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/quotes/QuotesSearchBarFilter", () => ({
  QuotesSearchBarFilter: ({
    orderManagement,
  }: {
    orderManagement: { quoteExpirySoonThresholdDays?: number };
  }) => (
    <div data-testid="quotes-search-filter">
      threshold-{orderManagement.quoteExpirySoonThresholdDays ?? 0}
    </div>
  ),
}));

vi.mock("@/components/core/OrderManagement/tabs/quotes/QuotesDesktopTable", () => ({
  QuotesDesktopTable: () => <div data-testid="quotes-desktop-table" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/quotes/QuotesMobileCards", () => ({
  QuotesMobileCards: () => <div data-testid="quotes-mobile-cards" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/shipments/ShipmentsToolbar", () => ({
  ShipmentsToolbar: () => <div data-testid="shipments-toolbar" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/shipments/ShipmentsDesktopTable", () => ({
  ShipmentsDesktopTable: () => <div data-testid="shipments-desktop-table" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/shipments/ShipmentsMobileCards", () => ({
  ShipmentsMobileCards: () => <div data-testid="shipments-mobile-cards" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/invoices/InvoicesSearchBarFilter", () => ({
  InvoicesSearchBarFilter: () => <div data-testid="invoices-search-filter" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/invoices/InvoicesDesktopTable", () => ({
  InvoicesDesktopTable: () => <div data-testid="invoices-desktop-table" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/invoices/InvoicesMobileCards", () => ({
  InvoicesMobileCards: () => <div data-testid="invoices-mobile-cards" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/orders/OrdersManagementToolbar", () => ({
  OrdersManagementToolbar: () => <div data-testid="orders-toolbar" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementDesktopTable", () => ({
  OrderManagementDesktopTable: () => <div data-testid="orders-desktop-table" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementMobileCards", () => ({
  OrderManagementMobileCards: () => <div data-testid="orders-mobile-cards" />,
}));

const baseParams = {
  styles: "test-styles",
  RenderingIdentifier: "order-management-rendering",
};

const baseFields: IOrderManagementFields = {
  Title: { value: "Orders" },
  SubTitle: { value: "Manage orders" },
};

function createShellMock(overrides: Record<string, unknown> = {}) {
  return {
    fields: { ...baseFields, ...(overrides.fields as object) },
    paramsStyles: "test-styles",
    renderingId: "rid-1",
    loadError: null as string | null,
    fetchRemote: vi.fn(),
    tabKind: "quotes",
    isRenderableDataTab: true,
    tabFields: { TabName: { value: "Quotes" }, ...((overrides.tabFields as object) ?? {}) },
    showBanner: false,
    visibleTabs: [],
    activeTab: null,
    canRequestQuote: true,
    quoteExpirySoonThresholdDays: 7,
    ...overrides,
  };
}

describe("QuotesTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOrderManagementShell.mockReturnValue(createShellMock());
  });

  it("renders quotes tab stack when quotes tab is active", () => {
    renderWithToast(
      <OrderManagementDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_MANAGEMENT}
        fields={baseFields}
        params={baseParams}
        page={mockPage}
      />
    );

    expect(screen.getByTestId("quotes-search-filter")).toBeInTheDocument();
    expect(screen.getByTestId("order-management-chip-row")).toBeInTheDocument();
    expect(screen.getByTestId("order-management-mobile-sheets")).toBeInTheDocument();
    expect(screen.getByTestId("quotes-desktop-table")).toBeInTheDocument();
    expect(screen.getByTestId("quotes-mobile-cards")).toBeInTheDocument();
    expect(screen.getByTestId("order-management-pagination")).toBeInTheDocument();
  });

  it("passes quote expiry threshold to quotes search/filter area", () => {
    mockUseOrderManagementShell.mockReturnValue(
      createShellMock({
        quoteExpirySoonThresholdDays: 5,
      })
    );

    renderWithToast(
      <OrderManagementDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_MANAGEMENT}
        fields={baseFields}
        params={baseParams}
        page={mockPage}
      />
    );

    expect(screen.getByText("threshold-5")).toBeInTheDocument();
  });

  it("does not render other tab controls when quotes tab is active", () => {
    renderWithToast(
      <OrderManagementDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_MANAGEMENT}
        fields={baseFields}
        params={baseParams}
        page={mockPage}
      />
    );

    expect(screen.queryByTestId("shipments-toolbar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("invoices-search-filter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("orders-toolbar")).not.toBeInTheDocument();
  });
});
