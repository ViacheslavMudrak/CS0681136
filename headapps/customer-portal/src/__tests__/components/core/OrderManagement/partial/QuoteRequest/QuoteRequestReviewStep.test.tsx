import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ButtonHTMLAttributes, ComponentProps, ReactElement, ReactNode } from "react";

import { QuoteRequestReviewStep } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestReviewStep";
import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import { createEmptyQuoteRequestDraft } from "@/lib/quote-request/quote-request-utils";
import type { QuoteRequestDraftDto } from "@/lib/quote-request/request-quote.types";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field }: { field?: { value?: string } }): ReactElement | null =>
    field?.value ? <span>{field.value}</span> : null,
  Image: ({ field }: { field?: { value?: { src?: string } } }): ReactElement | null =>
    field?.value?.src ? <img src={field.value.src} alt="" data-testid="discard-cms-icon" /> : null,
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: (): ReactElement => <span data-testid="review-icon" />,
  Label: ({
    children,
    ...rest
  }: { children?: ReactNode } & import("react").LabelHTMLAttributes<HTMLLabelElement>): ReactElement => (
    <label {...rest}>{children}</label>
  ),
}));

vi.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onPress,
    isDisabled,
    btnVariant: _bv,
    variant: _v,
    ...rest
  }: {
    children?: ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
    btnVariant?: string;
    variant?: string;
  } & ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => (
    <button type="button" disabled={isDisabled} onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/Textarea", () => ({
  __esModule: true,
  default: (props: ComponentProps<"textarea">): ReactElement => <textarea {...props} />,
}));

function baseDraft(): QuoteRequestDraftDto {
  return createEmptyQuoteRequestDraft(42);
}

const baseCms = (): QuoteRequestCmsFields => ({
  ReviewTitle: { value: "Review queue" },
  AddReviewItemLinkLabel: { value: "Add item" },
  AdditionalQuoteInformationLabel: { value: "Extra notes" },
  AdditionalQuoteInformationPlaceholder: { value: "Notes ph" },
  DiscardRequestLabel: { value: "Discard draft" },
  SubmitRequestButtonLabel: { value: "Submit" },
  SubmitRequestRetryButtonLabel: { value: "Retry submit" },
  OrderHeaderReviewIntroPattern: { value: "PO: {poNumber} | Order: {orderNumber}" },
});

describe("QuoteRequestReviewStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const handlers = () => ({
    onReviewAdditionalChange: vi.fn(),
    onAddAnother: vi.fn(),
    onEditGeneral: vi.fn(),
    onEditLine: vi.fn(),
    onEditOrderQuoteLine: vi.fn(),
    onDeleteOrderQuoteLine: vi.fn(),
    onDelete: vi.fn(),
    onDiscard: vi.fn(),
    onSubmit: vi.fn(),
  });

  it("renders header, add link, and calls onAddAnother", async () => {
    const user = userEvent.setup();
    const h = handlers();
    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={baseDraft()}
        reviewAdditional=""
        isSaving={false}
        {...h}
      />
    );
    expect(screen.getByText("Review queue")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add item" }));
    expect(h.onAddAnother).toHaveBeenCalled();
  });

  it("renders general row and wires edit / delete", async () => {
    const user = userEvent.setup();
    const h = handlers();
    const draft = baseDraft();
    draft.general.quoteItems.push({
      sequence: 1,
      application: "App",
      productDetails: "Prod",
      comments: "Note",
    });
    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={draft}
        reviewAdditional=""
        isSaving={false}
        {...h}
      />
    );
    expect(screen.getByText("App")).toBeInTheDocument();
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editButtons[0]);
    expect(h.onEditGeneral).toHaveBeenCalledWith(1);
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);
    expect(h.onDelete).toHaveBeenCalledWith("general", 1);
  });

  it("renders single-line card and expands description to show quantity", async () => {
    const user = userEvent.setup();
    const h = handlers();
    const draft = baseDraft();
    draft.singleLineItem.quoteItems.push({
      sequence: 2,
      poNumber: "P",
      orderNumber: "O",
      orderHeaderId: 9,
      customerPartNumber: "C",
      productType: "T",
      intraloxPartNumber: "I",
      comments: "",
      lineItemKey: "9|1",
      partDescription: { value: "First line\nSecond line", language: "en" },
      quantity: { value: 5, unit: "EA" },
    });
    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={draft}
        reviewAdditional=""
        isSaving={false}
        {...h}
      />
    );
    expect(screen.queryByText(/QTY/)).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /expand to show full description/i })
    );
    expect(screen.getByText(/QTY/)).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    expect(h.onEditLine).toHaveBeenCalledWith(2);
  });

  it("renders order-quote bulk lines and intro", () => {
    const h = handlers();
    const draft = baseDraft();
    draft.orderQuote.quoteItems.push({
      sequence: 1,
      poNumber: "POX",
      orderNumber: "SOX",
      orderHeaderId: 50,
      lineItems: [
        {
          lineItemKey: "50|L1",
          customerPartNumber: "CC",
          productType: "PT",
          partDescription: { value: "Desc", language: "en" },
          quantity: { value: 1, unit: "EA" },
          intraloxPartNumber: "II",
          comments: "",
        },
      ],
    });
    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={draft}
        reviewAdditional=""
        isSaving={false}
        {...h}
      />
    );
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(
      screen.getByTitle("Customer Part #CC · Intralox Part #II")
    ).toBeInTheDocument();
    const edits = screen.getAllByRole("button", { name: "Edit" });
    expect(edits.length).toBeGreaterThan(0);
  });

  it("disables additional-comments textarea while submitting", () => {
    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={baseDraft()}
        reviewAdditional=""
        isSaving={false}
        {...handlers()}
        isSubmitting
      />
    );
    expect(screen.getByPlaceholderText("Notes ph")).toBeDisabled();
  });

  it("calls onReviewAdditionalChange when typing additional notes", async () => {
    const user = userEvent.setup();
    const onReviewAdditionalChange = vi.fn();
    render(
      <QuoteRequestReviewStep
        {...handlers()}
        quoteCms={baseCms()}
        draft={baseDraft()}
        reviewAdditional=""
        isSaving={false}
        isSubmitting={false}
        onReviewAdditionalChange={onReviewAdditionalChange}
      />
    );
    await user.type(screen.getByPlaceholderText("Notes ph"), "a");
    expect(onReviewAdditionalChange).toHaveBeenCalled();
  });

  it("shows submit error and retry label when submitError is set", () => {
    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={baseDraft()}
        reviewAdditional=""
        isSaving={false}
        {...handlers()}
        submitError="Network failed"
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Network failed");
    expect(screen.getByRole("button", { name: "Retry submit" })).toBeInTheDocument();
  });

  it("shows discard CMS icon when configured", () => {
    const cms: QuoteRequestCmsFields = {
      ...baseCms(),
      DiscardRequestIcon: { value: { src: "/trash.svg", alt: "" } },
    };
    render(
      <QuoteRequestReviewStep
        quoteCms={cms}
        draft={baseDraft()}
        reviewAdditional=""
        isSaving={false}
        {...handlers()}
      />
    );
    const discardBtn = screen.getByRole("button", { name: /discard draft/i });
    expect(within(discardBtn).getByTestId("discard-cms-icon")).toHaveAttribute(
      "src",
      "/trash.svg"
    );
  });

  it("calls discard and submit from footer", async () => {
    const user = userEvent.setup();
    const h = handlers();
    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={baseDraft()}
        reviewAdditional=""
        isSaving={false}
        {...h}
      />
    );
    await user.click(screen.getByRole("button", { name: /discard draft/i }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(h.onDiscard).toHaveBeenCalled();
    expect(h.onSubmit).toHaveBeenCalled();
  });

  it("renders em dash placeholders for empty general fields", () => {
    const draft = baseDraft();
    draft.general.quoteItems.push({
      sequence: 1,
      application: "  ",
      productDetails: "",
      comments: "",
    });

    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={draft}
        reviewAdditional=""
        isSaving={false}
        {...handlers()}
      />
    );

    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows line comments when present and collapses expanded description", async () => {
    const user = userEvent.setup();
    const draft = baseDraft();
    draft.singleLineItem.quoteItems.push({
      sequence: 3,
      poNumber: "PO",
      orderNumber: "SO",
      orderHeaderId: 1,
      customerPartNumber: "CP",
      productType: "T",
      intraloxPartNumber: "IP",
      comments: "Line note",
      lineItemKey: "1|1",
      partDescription: { value: "Line one\nLine two", language: "en" },
      quantity: { value: 2, unit: "EA" },
    });

    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={draft}
        reviewAdditional=""
        isSaving={false}
        {...handlers()}
      />
    );

    expect(screen.getByText("Line note")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /expand to show full description/i })
    );
    await user.click(screen.getByRole("button", { name: /collapse description/i }));
    expect(screen.queryByText(/QTY/)).not.toBeInTheDocument();
  });

  it("wires order-quote line edit and delete handlers", async () => {
    const user = userEvent.setup();
    const h = handlers();
    const draft = baseDraft();
    draft.orderQuote.quoteItems.push({
      sequence: 1,
      poNumber: "PO1",
      orderNumber: "SO1",
      orderHeaderId: 77,
      lineItems: [
        {
          lineItemKey: "77|1",
          customerPartNumber: "C1",
          productType: "T",
          partDescription: { value: "Bulk line", language: "en" },
          quantity: { value: 3, unit: "EA" },
          intraloxPartNumber: "I1",
          comments: "Bulk comment",
        },
      ],
    });

    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={draft}
        reviewAdditional=""
        isSaving={false}
        {...h}
      />
    );

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editButtons[editButtons.length - 1]!);
    expect(h.onEditOrderQuoteLine).toHaveBeenCalledWith(77, 0);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[deleteButtons.length - 1]!);
    expect(h.onDeleteOrderQuoteLine).toHaveBeenCalledWith(77, 0);
  });

  it("skips order-quote blocks with no line items", () => {
    const draft = baseDraft();
    draft.orderQuote.quoteItems.push({
      sequence: 1,
      poNumber: "PO",
      orderNumber: "SO",
      orderHeaderId: 1,
      lineItems: [],
    });

    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={draft}
        reviewAdditional=""
        isSaving={false}
        {...handlers()}
      />
    );

    expect(screen.queryByText("Bulk line")).not.toBeInTheDocument();
  });

  it("disables add-another and discard while saving", () => {
    render(
      <QuoteRequestReviewStep
        quoteCms={baseCms()}
        draft={baseDraft()}
        reviewAdditional=""
        isSaving
        {...handlers()}
      />
    );

    expect(screen.getByRole("button", { name: "Add item" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /discard draft/i })).toBeDisabled();
  });
});
