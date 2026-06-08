import type React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrderDetailHeader } from "@/components/core/OrderDetail/partial/OrderDetailHeader";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: () => <span aria-hidden="true" />,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Image: () => null,
  Text: ({ field, tag = "span", className }: { field?: { value?: string }; tag?: string; className?: string }) =>
    tag === "p" ? <p className={className}>{field?.value}</p> : <span className={className}>{field?.value}</span>,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    onPress,
    type,
    variant,
    ...rest
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button type={type ?? "button"} onClick={onPress} variant={variant} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/shared/icons/RequestDocumentsActionIcon", () => ({
  RequestDocumentsActionIcon: () => <span aria-hidden="true" />,
}));

vi.mock("@/components/shared/icons/RequestUpdatedQuoteActionIcon", () => ({
  RequestUpdatedQuoteActionIcon: () => <span aria-hidden="true" />,
}));

describe("OrderDetailHeader mobile layout", () => {
  it("stacks status below the title and keeps icon-only actions beside the title block", () => {
    render(
      <OrderDetailHeader
        fields={{
          OrderNumberLabel: { value: "Order #" },
          RequestDocumentsButtonLabel: { value: "Request documents" },
          CreateQuoteOrderButtonLabel: { value: "Create quote from order" },
          POLabel: { value: "PO #" },
          PlacedDateLabel: { value: "Placed" },
        }}
        orderNumber="3336212"
        orderIdDisplay="3336212"
        orderStatusKey="placed"
        orderStatusLabel="Placed"
        poNumber="2D-14211084"
        orderDateFormatted="01/15/2025"
        contactName=""
        contactEmail=""
        referenceLabel=""
        referenceValue=""
        canRequestDocumentation
        canInitiateRfq
        showRequestDocument
        showCreateQuote
        onRequestDocuments={vi.fn()}
        onCreateQuoteFromOrder={vi.fn()}
      />
    );

    const heading = screen.getByRole("heading", { name: "Order # 3336212" });
    const statusBadge = screen.getByLabelText("Placed");
    const titleColumn = heading.parentElement;

    expect(titleColumn).toHaveClass("flex", "flex-col", "gap-[8px]");
    expect(statusBadge.parentElement?.parentElement).toBe(titleColumn);
    expect(statusBadge).toHaveClass("inline-flex", "border-[#A8AAAE]", "bg-[#F8F8F8]");

    const requestDocumentsButton = screen.getByLabelText("Request documents");
    expect(requestDocumentsButton).toHaveAttribute("variant", "inverse");
    expect(requestDocumentsButton).toHaveClass(
      "max-[480px]:size-[40px]",
      "max-[480px]:rounded-full"
    );
    expect(requestDocumentsButton.parentElement).not.toHaveClass("max-[480px]:w-full");
    expect(requestDocumentsButton.parentElement?.parentElement).toHaveClass(
      "flex",
      "w-full",
      "items-start",
      "justify-between",
      "gap-[4px]"
    );
  });
});
