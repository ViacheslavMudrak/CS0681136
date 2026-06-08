import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

import { QuoteRequestLineStep } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestLineStep";
import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import type { OrderLineItem, OrderListItem } from "@/lib/apis/orders-api";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field }: { field?: { value?: string } }) =>
    field?.value ? <span>{field.value}</span> : null,
}));

vi.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onPress,
    isDisabled,
    ...rest
  }: {
    children?: ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
  } & ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" disabled={isDisabled} onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/Textarea", () => ({
  __esModule: true,
  default: (props: ComponentProps<"textarea">) => <textarea {...props} />,
}));

const order = (overrides: Partial<OrderListItem> = {}): OrderListItem => ({
  orderHeaderId: "1",
  orderId: "99",
  poNumber: " PO-1 ",
  orderNumber: "SO-9",
  itemCount: 1,
  statusKey: "open",
  orderDate: "2024-01-01",
  totalAmount: 0,
  currency: "USD",
  lineItems: [],
  shipments: [],
  ...overrides,
});

const line = (overrides: Partial<OrderLineItem> = {}): OrderLineItem => ({
  id: "L1",
  customerPartNumber: "CP",
  intraloxPartNumber: "IX",
  description: "Line one\n\nLine two",
  quantity: 3,
  ...overrides,
});

describe("QuoteRequestLineStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const cms: QuoteRequestCmsFields = {
    AddItemTitle: { value: "Add line" },
    LineItemComment: { value: "Note" },
    LineItemCommentPlaceholder: { value: "Optional" },
    LineItemCancelButtonLabel: { value: "Back" },
    LineItemContinueButtonLabel: { value: "Next" },
    LineItemSaveChangesButtonLabel: { value: "Save changes CMS" },
  };

  it("renders PO / order meta, splits multi-line description, and quantity", () => {
    render(
      <QuoteRequestLineStep
        quoteCms={cms}
        order={order()}
        line={line()}
        comments=""
        isSaving={false}
        onChangeComments={vi.fn()}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText("Add line")).toBeInTheDocument();
    expect(screen.getByText(/PO-1/)).toBeInTheDocument();
    expect(screen.getByText("SO-9")).toBeInTheDocument();
    expect(screen.getByText("Line one")).toBeInTheDocument();
    expect(screen.getByText("Line two")).toBeInTheDocument();
    expect(screen.getByText(/QTY:\s*3/)).toBeInTheDocument();
  });

  it("shows em dash placeholders when PO / order / parts missing", () => {
    render(
      <QuoteRequestLineStep
        quoteCms={cms}
        order={order({ poNumber: "", orderNumber: "" })}
        line={line({
          customerPartNumber: "",
          intraloxPartNumber: "",
          description: "",
          quantity: Number.NaN,
        })}
        comments=""
        isSaving={false}
        onChangeComments={vi.fn()}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
      />
    );
    const em = screen.getAllByText("—");
    expect(em.length).toBeGreaterThanOrEqual(2);
  });

  it("uses continue label when not editing", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(
      <QuoteRequestLineStep
        quoteCms={cms}
        order={order()}
        line={line()}
        comments=""
        isSaving={false}
        onChangeComments={vi.fn()}
        onCancel={vi.fn()}
        onContinue={onContinue}
        isEditing={false}
      />
    );
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onContinue).toHaveBeenCalled();
  });

  it("uses save label when editing and falls back to literal when CMS missing", () => {
    render(
      <QuoteRequestLineStep
        quoteCms={{
          ...cms,
          LineItemSaveChangesButtonLabel: undefined,
        }}
        order={order()}
        line={line()}
        comments=""
        isSaving={false}
        onChangeComments={vi.fn()}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
        isEditing
      />
    );
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("updates comments via onChangeComments", async () => {
    const user = userEvent.setup();
    const onChangeComments = vi.fn();
    render(
      <QuoteRequestLineStep
        quoteCms={cms}
        order={order()}
        line={line()}
        comments="start"
        isSaving={false}
        onChangeComments={onChangeComments}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
      />
    );
    await user.clear(screen.getByPlaceholderText("Optional"));
    await user.type(screen.getByPlaceholderText("Optional"), "hi");
    expect(onChangeComments).toHaveBeenCalled();
  });
});
