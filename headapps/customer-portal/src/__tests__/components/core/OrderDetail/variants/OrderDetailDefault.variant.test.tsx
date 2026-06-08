import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import { OrderDetailDefaultVariant } from "components/core/OrderDetail/variants/OrderDetailDefault.variant";
import type { ComponentProps } from "@/lib/component-props";
import { ProfileContextProvider } from "@/lib/profile-context";
import ToastProvider from "@/components/shared/toast/ToastProvider";
import type { IOrderDetailFields, OrderDetailApiData } from "components/core/OrderDetail/OrderDetail.type";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { TEST_CASE_DATA_IDS } from "../../../../../helpers/enums";

const mockUseSearchParams = vi.hoisted(() => vi.fn());
const mockUsePathname = vi.hoisted(() => vi.fn());
const mockUseOrderDetail = vi.hoisted(() => vi.fn());
const mockCan = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => mockUseSearchParams(),
  usePathname: () => mockUsePathname(),
}));

vi.mock("@/hooks/use-device-type", () => ({
  default: () => ({ isMobile: false }),
}));

vi.mock("@/lib/permission-context", () => ({
  usePermissionContext: () => ({
    can: mockCan,
  }),
}));

vi.mock("@/hooks/useOrderDetail", () => ({
  useOrderDetail: (params: { orderHeaderId: string; isEditing?: boolean }) =>
    mockUseOrderDetail(params),
}));

vi.mock("@/hooks/useQuoteRequest", () => ({
  useQuoteRequest: vi.fn(() => ({
    hasPendingDraft: false,
    queueItemCount: 0,
    quoteCms: {},
    draft: { general: { quoteItems: [] }, singleLineItem: { quoteItems: [] }, orderQuote: { quoteItems: [] } },
    isOpen: false,
    closeDrawer: vi.fn(),
    openFromHeader: vi.fn(),
    openFromQuoteRow: vi.fn(),
    openFromLineItem: vi.fn(),
    openFromOrderDetailHeader: vi.fn(),
    openOrderQuoteDraftForReview: vi.fn(),
    openFromQuoteDetailAllLines: vi.fn(),
    openFromQuoteDetailAllLinesWithFetch: vi.fn(),
    openFromQuoteDetailSingleLine: vi.fn(),
    isFetchingOrderLines: false,
    orderHeaderReview: null,
    onCancelLineStep: vi.fn(),
    setIsOpen: vi.fn(),
    step: "general",
    setStep: vi.fn(),
    generalForm: { application: "", productDetails: "", comments: "" },
    setGeneralForm: vi.fn(),
    lineForm: null,
    setLineForm: vi.fn(),
    generalFieldErrors: {},
    reviewAdditional: "",
    onUpdateReviewNotes: vi.fn(),
    onContinueGeneral: vi.fn(),
    onContinueLine: vi.fn(),
    onAddAnother: vi.fn(),
    onSearchOrders: vi.fn(),
    onDeleteItem: vi.fn(),
    onEditGeneral: vi.fn(),
    onEditLine: vi.fn(),
    onEditOrderQuoteLine: vi.fn(),
    onDeleteOrderQuoteLine: vi.fn(),
    onConfirmDiscard: vi.fn(),
    discardOpen: false,
    setDiscardOpen: vi.fn(),
    hasOrdersHistory: true,
    isSaving: false,
    lineKeyInQueue: vi.fn(() => false),
    isOrderHeaderInOrderQuoteDraft: vi.fn(() => false),
    lineInQuoteDraftForListLine: vi.fn(() => false),
    getLineItemByKey: vi.fn(),
    isSubmittingRequest: false,
    submitError: null,
    submittedRequestId: null,
    onSubmitRequest: vi.fn(),
  })),
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer", () => ({
  QuoteRequestDrawer: () => null,
}));

vi.mock("@/components/shared/portal-loading/PortalShellChromeLoading", () => ({
  PortalShellMainSkeleton: () => <div data-testid="portal-shell-main-skeleton" />,
}));

vi.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({ oktaAuth: null, authState: null }),
}));

function renderWithProviders(ui: ReactElement) {
  return render(
    <ProfileContextProvider>
      <ToastProvider>{ui}</ToastProvider>
    </ProfileContextProvider>
  );
}

vi.mock("@/components/core/OrderDetail/partial/BillingInvoicesPanel", () => ({
  BillingInvoicesPanel: () => <div data-testid="billing-invoices-panel" />,
}));

vi.mock("@/components/core/OrderDetail/partial/OrderDetailEmptyState", () => ({
  OrderDetailEmptyState: ({ onRetry }: { onRetry: () => void }) => (
    <div data-testid="order-detail-empty-state">
      <button type="button" data-testid="order-detail-retry" onClick={onRetry}>
        Retry
      </button>
    </div>
  ),
}));

vi.mock("@/components/core/OrderDetail/partial/OrderDetailHeader", () => ({
  OrderDetailHeader: () => <div data-testid="order-detail-header" />,
}));

vi.mock("@/components/core/OrderDetail/partial/OrderItems", () => ({
  OrderItems: () => <div data-testid="order-items" />,
}));

vi.mock("@/components/core/OrderDetail/partial/RelatedDocumentsPanel", () => ({
  RelatedDocumentsPanel: () => <div data-testid="related-documents-panel" />,
}));

vi.mock("@/components/core/OrderDetail/partial/ShipmentInformationPanel", () => ({
  ShipmentInformationPanel: () => <div data-testid="shipment-information-panel" />,
}));

const baseParams = {
  styles: "test-styles",
  RenderingIdentifier: "order-detail-rendering",
};

const basePage = {
  mode: { isEditing: false, isPreview: false },
} as unknown as ComponentProps["page"];

const baseFields: IOrderDetailFields = {
  OrderNumberLabel: { value: "Order #" },
  ReferenceIDLabel: { value: "Reference" },
};

function createSearchParamsGet(orderHeaderId: string | null) {
  return (key: string) => (key === "orderHeaderId" ? orderHeaderId : null);
}

function minimalOrderData(overrides: Partial<OrderDetailApiData> = {}): OrderDetailApiData {
  return {
    order: {
      orderId: 12345,
      orderHeaderId: 555,
      accountId: 1020,
      poNumber: "PO-1",
      orderDate: "2024-01-15T12:00:00Z",
      orderStatus: "placed",
      referenceId: "REF-1",
    },
    contacts: {
      customer: [{ name: "Jane Doe", email: "jane@example.com" }],
    },
    lineItems: [],
    shipments: [],
    billingAddress: {},
    orderSummary: {
      subTotal: { value: 0, currency: "USD", displayValue: "$0.00" },
      tax: { value: 0, currency: "USD", displayValue: "$0.00" },
      totalAmount: { value: 0, currency: "USD", displayValue: "$0.00" },
    },
    invoices: [],
    documents: [],
    ...overrides,
  };
}

describe("OrderDetailDefaultVariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/en/site/orders/555");
    mockUseSearchParams.mockReturnValue({
      get: createSearchParamsGet(null),
    });
    mockCan.mockReturnValue(true);
    mockUseOrderDetail.mockReturnValue({
      data: null,
      loadError: null,
      isLoading: true,
      refetch: vi.fn(),
    });
  });

  it("renders empty hint when fields are missing", () => {
    render(
      <OrderDetailDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_DETAIL}
        fields={null as unknown as IOrderDetailFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_DETAIL)).toBeInTheDocument();
    expect(screen.getByText("Order Detail")).toBeInTheDocument();
  });

  it("shows loading placeholder while order detail is loading", () => {
    mockUseOrderDetail.mockReturnValue({
      data: null,
      loadError: null,
      isLoading: true,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <OrderDetailDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_DETAIL}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    const region = screen.getByRole("region", { name: "Order detail" });
    expect(region.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.getByTestId("portal-shell-main-skeleton")).toBeInTheDocument();
  });

  it("passes orderHeaderId from pathname segment to useOrderDetail", () => {
    mockUsePathname.mockReturnValue("/en/dashboard/orders/999");
    mockUseOrderDetail.mockReturnValue({
      data: null,
      loadError: "Could not load order",
      isLoading: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <OrderDetailDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_DETAIL}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(mockUseOrderDetail).toHaveBeenCalledWith({
      orderHeaderId: "999",
      isEditing: false,
    });
  });

  it("renders empty state when load fails or data is missing", () => {
    const refetch = vi.fn();
    mockUseOrderDetail.mockReturnValue({
      data: null,
      loadError: "Could not load order",
      isLoading: false,
      refetch,
    });

    renderWithProviders(
      <OrderDetailDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_DETAIL}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByTestId("order-detail-empty-state")).toBeInTheDocument();
  });

  it("calls refetch when empty state retry is pressed", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockUseOrderDetail.mockReturnValue({
      data: null,
      loadError: "Could not load order",
      isLoading: false,
      refetch,
    });

    renderWithProviders(
      <OrderDetailDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_DETAIL}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    await user.click(screen.getByTestId("order-detail-retry"));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders header, line items, billing, shipment, and documents when data loads and permissions allow", () => {
    mockCan.mockImplementation(() => true);
    mockUseOrderDetail.mockReturnValue({
      data: minimalOrderData(),
      loadError: null,
      isLoading: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <OrderDetailDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_DETAIL}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByTestId("order-detail-header")).toBeInTheDocument();
    expect(screen.getByTestId("order-items")).toBeInTheDocument();
    expect(screen.getByTestId("billing-invoices-panel")).toBeInTheDocument();
    expect(screen.getByTestId("shipment-information-panel")).toBeInTheDocument();
    expect(screen.getByTestId("related-documents-panel")).toBeInTheDocument();
  });

  it("omits billing and related documents when VIEW_INVOICES and VIEW_TECHNICAL_DOCS are denied", () => {
    mockCan.mockImplementation((code: string) => {
      if (code === PERMISSION_CODES.VIEW_INVOICES || code === PERMISSION_CODES.VIEW_TECHNICAL_DOCS) {
        return false;
      }
      return true;
    });
    mockUseOrderDetail.mockReturnValue({
      data: minimalOrderData(),
      loadError: null,
      isLoading: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <OrderDetailDefaultVariant
        testId={TEST_CASE_DATA_IDS.ORDER_DETAIL}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByTestId("billing-invoices-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("related-documents-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("shipment-information-panel")).toBeInTheDocument();
  });
});
