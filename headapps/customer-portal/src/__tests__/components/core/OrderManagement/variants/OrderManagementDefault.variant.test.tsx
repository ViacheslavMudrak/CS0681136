import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

import { OrderManagementDefaultVariant } from "components/core/OrderManagement/variants/OrderManagementDefault.variant";
import ToastProvider from "@/components/shared/toast/ToastProvider";
import type { IOrderManagementFields } from "components/core/OrderManagement/OrderManagement.type";
import { RETRY_ACTION_LABEL } from "components/core/OrderManagement/orderManagementLabels";
import { TEST_CASE_DATA_IDS } from "../../../../../helpers/enums";
import type { Page } from "@sitecore-content-sdk/nextjs";

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

vi.mock("@/components/core/OrderManagement/tabs/orders/OrdersManagementToolbar", () => ({
  OrdersManagementToolbar: () => <div data-testid="order-management-toolbar" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementChipRow", () => ({
  OrderManagementChipRow: () => <div data-testid="order-management-chip-row" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementMobileSheets", () => ({
  OrderManagementMobileSheets: () => <div data-testid="order-management-mobile-sheets" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementDesktopTable", () => ({
  OrderManagementDesktopTable: ({
    orderManagement,
  }: {
    orderManagement: { loadError?: string | null; fetchRemote?: () => void };
  }) =>
    orderManagement?.loadError ? (
      <div role="alert">
        <p>{orderManagement.loadError}</p>
        <button type="button" onClick={() => orderManagement.fetchRemote?.()}>
          {RETRY_ACTION_LABEL}
        </button>
      </div>
    ) : (
      <div data-testid="order-management-desktop-table" />
    ),
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementMobileCards", () => ({
  OrderManagementMobileCards: () => <div data-testid="order-management-mobile-cards" />,
}));

vi.mock("@/components/core/OrderManagement/partial/OrderManagementPagination", () => ({
  OrderManagementPagination: () => <div data-testid="order-management-pagination" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/shipments/ShipmentsToolbar", () => ({
  ShipmentsToolbar: () => <div data-testid="shipments-toolbar" />,
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

vi.mock("@/components/core/OrderManagement/tabs/quotes/QuotesSearchBarFilter", () => ({
  QuotesSearchBarFilter: () => <div data-testid="quotes-search-filter" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/quotes/QuotesDesktopTable", () => ({
  QuotesDesktopTable: () => <div data-testid="quotes-desktop-table" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/quotes/QuotesMobileCards", () => ({
  QuotesMobileCards: () => <div data-testid="quotes-mobile-cards" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/shipments/ShipmentsDesktopTable", () => ({
  ShipmentsDesktopTable: () => <div data-testid="shipments-desktop-table" />,
}));

vi.mock("@/components/core/OrderManagement/tabs/shipments/ShipmentsMobileCards", () => ({
  ShipmentsMobileCards: () => <div data-testid="shipments-mobile-cards" />,
}));

vi.mock("@/components/shared/info-banner/InfoBanner", () => ({
  default: ({ description }: { description?: ReactNode }) => (
    <div data-testid="order-management-info-banner">{description}</div>
  ),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({
    field,
  }: {
    field?: { value?: { src?: string } };
  }) => (field?.value?.src ? <img src={field.value.src} alt="" data-testid="banner-icon" /> : null),
  Text: ({ field }: { field?: { value?: string } }) =>
    field?.value != null && field.value !== "" ? <span>{field.value}</span> : null,
  RichText: ({ field }: { field?: { value?: string } }) =>
    field?.value != null && field.value !== "" ? <div>{field.value}</div> : null,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    onPress,
    type,
    className,
  }: {
    children?: ReactNode;
    onPress?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
  }) => (
    <button type={type ?? "button"} className={className} onClick={() => onPress?.()}>
      {children}
    </button>
  ),
}));

const baseParams = {
  styles: "test-styles",
  RenderingIdentifier: "order-management-rendering",
};

const baseFields: IOrderManagementFields = {
  Title: { value: "Orders" },
  SubTitle: { value: "Manage orders" },
};

const mockPage = { mode: { isEditing: false } } as Page;

function createShellMock(overrides: Record<string, unknown> = {}) {
  const fetchRemote = vi.fn();
  const { tabFields: overrideTabFields, ...restOverrides } = overrides;

  const defaultTabFields = {
    BannerDescription: { value: "" },
    BannerTitle: { value: "" },
    BannerIcon: { value: undefined },
  };

  const tabFields =
    overrideTabFields === undefined
      ? defaultTabFields
      : overrideTabFields === null
        ? null
        : { ...defaultTabFields, ...(overrideTabFields as object) };

  return {
    fields: { ...baseFields, ...(overrides.fields as object) },
    paramsStyles: "test-styles",
    renderingId: "rid-1",
    loadError: null as string | null,
    fetchRemote,
    /** Matches {@link useOrderManagementShell}: grid renders when the active tab has CMS grid fields. */
    isRenderableDataTab: true,
    tabKind: "orders" as const,
    isOnOrdersTab: true,
    tabFields,
    showBanner: false,
    visibleTabs: [],
    activeTab: null,
    canRequestQuote: true,
    ...restOverrides,
  };
}

describe("OrderManagementDefaultVariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOrderManagementShell.mockReturnValue(createShellMock());
  });

  it("renders empty hint when fields are missing", () => {
    render(
      <OrderManagementDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_MANAGEMENT}
        fields={null}
        params={baseParams}
        page={mockPage}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_MANAGEMENT)).toBeInTheDocument();
    expect(screen.getByText("Order Management")).toBeInTheDocument();
  });

  it("renders header and tab bar and passes fields into the shell hook", () => {
    const shell = createShellMock();
    mockUseOrderManagementShell.mockReturnValue(shell);

    renderWithToast(
      <OrderManagementDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_MANAGEMENT}
        fields={baseFields}
        params={baseParams}
        page={mockPage}
      />
    );

    expect(mockUseOrderManagementShell).toHaveBeenCalledWith({
      fields: baseFields,
      paramsStyles: "test-styles",
      renderingId: "order-management-rendering",
      page: mockPage,
    });
    expect(screen.getByTestId("order-management-header")).toBeInTheDocument();
    expect(screen.getByTestId("order-management-tab-bar")).toBeInTheDocument();
  });

  it("shows load error alert and retry invokes fetchRemote", async () => {
    const user = userEvent.setup();
    const shell = createShellMock({ loadError: "Network error" });
    mockUseOrderManagementShell.mockReturnValue(shell);

    renderWithToast(
      <OrderManagementDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_MANAGEMENT}
        fields={baseFields}
        params={baseParams}
        page={mockPage}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: RETRY_ACTION_LABEL }));
    expect(shell.fetchRemote).toHaveBeenCalled();
  });

  it("renders orders grid stack when there is no error and orders tab content is active", () => {
    mockUseOrderManagementShell.mockReturnValue(
      createShellMock({
        loadError: null,
        isOnOrdersTab: true,
        tabFields: { BannerDescription: { value: " " } },
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

    expect(screen.getByTestId("order-management-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("order-management-chip-row")).toBeInTheDocument();
    expect(screen.getByTestId("order-management-mobile-sheets")).toBeInTheDocument();
    expect(screen.getByTestId("order-management-desktop-table")).toBeInTheDocument();
    expect(screen.getByTestId("order-management-mobile-cards")).toBeInTheDocument();
    expect(screen.getByTestId("order-management-pagination")).toBeInTheDocument();
  });

  it("does not render orders grid when not on orders tab", () => {
    mockUseOrderManagementShell.mockReturnValue(
      createShellMock({
        loadError: null,
        isOnOrdersTab: false,
        isRenderableDataTab: false,
        tabKind: "unknown",
        tabFields: null,
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

    expect(screen.queryByTestId("order-management-toolbar")).not.toBeInTheDocument();
  });

  it("renders info banner when showBanner is true and banner description has content", () => {
    mockUseOrderManagementShell.mockReturnValue(
      createShellMock({
        loadError: null,
        isOnOrdersTab: true,
        showBanner: true,
        tabFields: {
          BannerDescription: { value: "Important notice" },
          BannerTitle: { value: "Heads up" },
          BannerIcon: {
            value: { src: "/icon.png", alt: "icon", width: 28, height: 28 },
          },
        },
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

    expect(screen.getByTestId("order-management-info-banner")).toBeInTheDocument();
    expect(screen.getByText("Important notice")).toBeInTheDocument();
  });

  it("sets section aria-label from Title field value", () => {
    mockUseOrderManagementShell.mockReturnValue(
      createShellMock({
        fields: { Title: { value: "My orders" }, SubTitle: { value: "Sub" } },
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

    expect(screen.getByRole("region", { name: "My orders" })).toBeInTheDocument();
  });
});
