import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";

import { QuoteRequestDrawer } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer";
import type { UseQuoteRequestReturn } from "@/hooks/useQuoteRequest";
import type { OrderLineItem, OrderListItem } from "@/lib/apis/orders-api";
import { createEmptyQuoteRequestDraft } from "@/lib/quote-request/quote-request-utils";

vi.mock("@/components/shared/contextual-panel/ContextualPanel", () => ({
  __esModule: true,
  default: ({
    children,
    isOpen,
    headerFooterContent,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    headerFooterContent?: React.ReactNode;
  }): ReactElement | null =>
    isOpen ? (
      <div data-testid="quote-request-contextual-panel">
        {headerFooterContent != null ? (
          <div data-testid="contextual-panel-header-footer">{headerFooterContent}</div>
        ) : null}
        {children}
      </div>
    ) : null,
}));

vi.mock("@/components/shared/loading-skeleton/LoadingSkeleton", () => ({
  __esModule: true,
  default: ({ variant }: { variant?: string }): ReactElement => (
    <div data-testid={`loading-skeleton-${variant ?? "default"}`} role="status" />
  ),
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestGeneralStep", () => ({
  QuoteRequestGeneralStep: (): ReactElement => (
    <div data-testid="quote-request-general-step" />
  ),
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestLineStep", () => ({
  QuoteRequestLineStep: (): ReactElement => (
    <div data-testid="quote-request-line-step" />
  ),
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestReviewStep", () => ({
  QuoteRequestReviewStep: (): ReactElement => (
    <div data-testid="quote-request-review-step" />
  ),
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestConfirmationStep", () => ({
  QuoteRequestConfirmationStep: (): ReactElement => (
    <div data-testid="quote-request-confirmation-step" />
  ),
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDiscardDialog", () => ({
  QuoteRequestDiscardDialog: ({ isOpen }: { isOpen: boolean }): ReactElement | null =>
    isOpen ? <div data-testid="quote-request-discard-dialog" /> : null,
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestSubmittingAs", () => ({
  QuoteRequestSubmittingAs: (): ReactElement => (
    <div data-testid="quote-request-submitting-as" />
  ),
}));

const minimalOrder: OrderListItem = {
  orderHeaderId: "10",
  orderId: "100",
  poNumber: "PO-1",
  orderNumber: "SO-1",
  itemCount: 1,
  statusKey: "open",
  orderDate: "2024-01-15",
  totalAmount: 0,
  currency: "USD",
  lineItems: [],
  shipments: [],
};

const minimalLine: OrderLineItem = {
  id: "line-1",
  intraloxPartNumber: "IX-1",
  description: "Part",
  quantity: 1,
};

function createMockQr(overrides: Partial<UseQuoteRequestReturn> = {}): UseQuoteRequestReturn {
  const draft = createEmptyQuoteRequestDraft(1);
  const base: UseQuoteRequestReturn = {
    quoteCms: {},
    draft,
    isOpen: true,
    closeDrawer: vi.fn(),
    openFromHeader: vi.fn(),
    openFromQuoteRow: vi.fn(),
    openFromLineItem: vi.fn(),
    openFromOrderDetailHeader: vi.fn(),
    openFromQuoteDetailAllLines: vi.fn(),
    openFromQuoteDetailSingleLine: vi.fn(),
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
    queueItemCount: 0,
    hasPendingDraft: false,
    hasOrdersHistory: false,
    isSaving: false,
    lineKeyInQueue: vi.fn(() => false),
    isOrderHeaderInOrderQuoteDraft: vi.fn(() => false),
    lineInQuoteDraftForListLine: vi.fn(() => false),
    getLineItemByKey: vi.fn(),
    isSubmittingRequest: false,
    submitError: null,
    submittedRequestId: null,
    onSubmitRequest: vi.fn(),
  };
  return { ...base, ...overrides };
}

describe("QuoteRequestDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing from ContextualPanel when the drawer is closed", () => {
    const qr = createMockQr({ isOpen: false });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.queryByTestId("quote-request-contextual-panel")).not.toBeInTheDocument();
  });

  it("renders the general step when step is general", () => {
    const qr = createMockQr({ step: "general", isOpen: true });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.getByTestId("quote-request-general-step")).toBeInTheDocument();
    expect(screen.queryByTestId("quote-request-line-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("quote-request-review-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("quote-request-confirmation-step")).not.toBeInTheDocument();
  });

  it("renders submitting-as in the panel header when not on confirmation", () => {
    const qr = createMockQr({ step: "general" });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.getByTestId("quote-request-submitting-as")).toBeInTheDocument();
  });

  it("renders the line item step when step is lineItem and lineForm is set", () => {
    const qr = createMockQr({
      step: "lineItem",
      lineForm: {
        order: minimalOrder,
        line: minimalLine,
        comments: "",
        editingLineSequence: null,
        editingOrderQuoteLine: null,
      },
    });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.getByTestId("quote-request-line-step")).toBeInTheDocument();
    expect(screen.queryByTestId("quote-request-general-step")).not.toBeInTheDocument();
  });

  it("does not render line step when step is lineItem but lineForm is null", () => {
    const qr = createMockQr({ step: "lineItem", lineForm: null });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.queryByTestId("quote-request-line-step")).not.toBeInTheDocument();
  });

  it("renders the review step when step is review", () => {
    const qr = createMockQr({ step: "review" });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.getByTestId("quote-request-review-step")).toBeInTheDocument();
  });

  it("shows loading overlay on review when isSubmittingRequest is true", () => {
    const qr = createMockQr({ step: "review", isSubmittingRequest: true });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.getByTestId("loading-skeleton-spinner")).toBeInTheDocument();
    expect(screen.getByTestId("quote-request-review-step")).toBeInTheDocument();
  });

  it("shows loading overlay when isSaving is true", () => {
    const qr = createMockQr({ step: "general", isSaving: true });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.getByTestId("loading-skeleton-spinner")).toBeInTheDocument();
    expect(screen.getByTestId("quote-request-general-step")).toBeInTheDocument();
  });

  it("does not show loading overlay when idle", () => {
    const qr = createMockQr({ step: "review", isSubmittingRequest: false, isSaving: false });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.queryByTestId("loading-skeleton-spinner")).not.toBeInTheDocument();
  });

  it("renders confirmation step when step is confirmation and request id is present", () => {
    const qr = createMockQr({
      step: "confirmation",
      submittedRequestId: "REQ-999",
    });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.getByTestId("quote-request-confirmation-step")).toBeInTheDocument();
    expect(screen.queryByTestId("quote-request-submitting-as")).not.toBeInTheDocument();
  });

  it("does not render confirmation body when submittedRequestId is missing", () => {
    const qr = createMockQr({
      step: "confirmation",
      submittedRequestId: null,
    });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.queryByTestId("quote-request-confirmation-step")).not.toBeInTheDocument();
  });

  it("renders discard dialog when discardOpen is true", () => {
    const qr = createMockQr({ discardOpen: true });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.getByTestId("quote-request-discard-dialog")).toBeInTheDocument();
  });

  it("does not render discard dialog when discardOpen is false", () => {
    const qr = createMockQr({ discardOpen: false });
    render(<QuoteRequestDrawer qr={qr} />);
    expect(screen.queryByTestId("quote-request-discard-dialog")).not.toBeInTheDocument();
  });
});
