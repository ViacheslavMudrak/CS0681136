import type React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuoteDetailHeader } from "@/components/core/QuoteDetail/partial/QuoteDetailHeader";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: () => <span aria-hidden="true" data-testid="status-fallback-icon" />,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Image: ({
    className,
    width,
    height,
    sizes,
    alt,
  }: {
    className?: string;
    width?: number;
    height?: number;
    sizes?: string;
    alt?: string;
  }) => (
    <img className={className} width={width} height={height} sizes={sizes} alt={alt ?? ""} />
  ),
  Text: ({ field, tag = "span", className }: { field?: { value?: string }; tag?: string; className?: string }) =>
    tag === "p" ? <p className={className}>{field?.value}</p> : <span className={className}>{field?.value}</span>,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    btnVariant: _btnVariant,
    onPress,
    type,
    variant,
    ...rest
  }: {
    children: React.ReactNode;
    btnVariant?: string;
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

describe("QuoteDetailHeader mobile layout", () => {
  const baseFields = {
    QuoteNumberPrefix: { value: "Order" },
    CreatedDatePrefix: { value: "Created" },
    CreatedByPrefix: { value: "by" },
    ExpiresLabel: { value: "Expires" },
    ExpiredLabel: { value: "Expired" },
    RequestDocumentsButtonLabel: { value: "Request documents" },
    RequestUpdatedQuoteButtonLabel: { value: "Request updated quote" },
  };

  it("matches Order Detail header rhythm while preserving compact phone behavior", () => {
    render(
      <QuoteDetailHeader
        fields={{
          ...baseFields,
          FilterOptions: [
            {
              id: "expired",
              fields: {
                Statuskey: { value: "expired" },
                StatusValue: { value: "Expired" },
                StatusIcon: { value: { src: "/expired.svg" } },
              },
            },
          ],
        }}
        quoteNumber="3336212"
        statusKey="order_expired"
        createdDateIso="2026-01-15T00:00:00Z"
        expiryDateIso="2026-02-15T00:00:00Z"
        contactName="Contact Name"
        contactEmail="contact@example.com"
        locale="en-US"
        canRequestDocumentation
        isExpired
        onRequestDocuments={vi.fn()}
        onRequestUpdatedQuote={vi.fn()}
      />
    );

    const heading = screen.getByRole("heading", { name: "Order 3336212" });
    expect(heading.closest("header")).toHaveClass(
      "gap-[6px]",
      "p-[0px]",
      "md:gap-[14px]",
      "md:py-[24px]",
      "lg:pt-[0px]"
    );
    expect(heading).toHaveClass(
      "m-0",
      "min-w-0",
      "whitespace-nowrap",
      "text-[24px]",
      "font-[600]",
      "leading-[30px]",
      "text-[var(--color-text-heading-color)]",
      "md:text-[30px]",
      "md:leading-[1.25]"
    );
    expect(heading.children[0]).toHaveTextContent("Order");
    expect(heading.children[1]).toHaveClass("whitespace-pre");
    expect(heading.children[2]).toHaveTextContent("3336212");

    const titleColumn = heading.parentElement;
    expect(titleColumn).toHaveClass("flex", "flex-col", "gap-[8px]", "md:flex-row");

    const expiredBadge = screen.getByLabelText("Expired");
    expect(expiredBadge.tagName.toLowerCase()).toBe("span");
    expect(expiredBadge).toHaveClass(
      "inline-flex",
      "gap-[4px]",
      "rounded-[4px]",
      "bg-[#FBDADB]",
      "text-[#970000]"
    );
    expect(expiredBadge.parentElement?.parentElement).toBe(titleColumn);

    const expiredIcon = expiredBadge.querySelector("img");
    expect(expiredIcon).toHaveClass("shrink-0", "object-contain");
    expect(expiredIcon).toHaveAttribute("width", "12");
    expect(expiredIcon).toHaveAttribute("height", "12");
    expect(expiredIcon).toHaveAttribute("sizes", "12px");
    expect(screen.getByText("Expired")).toHaveClass(
      "block",
      "min-w-0",
      "flex-1",
      "overflow-hidden",
      "text-ellipsis",
      "whitespace-nowrap",
      "text-start",
      "mt-[1px]"
    );

    const requestDocumentsButton = screen.getByLabelText("Request documents");
    const requestUpdatedQuoteButton = screen.getByLabelText("Request updated quote");

    expect(requestDocumentsButton).toHaveAttribute("variant", "inverse");
    expect(requestUpdatedQuoteButton).toHaveAttribute("variant", "primary");
    expect(requestDocumentsButton).toHaveClass(
      "max-[480px]:size-[40px]",
      "max-[480px]:rounded-full"
    );
    expect(requestDocumentsButton.parentElement).not.toHaveClass("max-[480px]:w-full");
    expect(screen.getByText("Request documents")).toHaveClass("hidden", "md:block");
    expect(screen.getByText("Request updated quote")).toHaveClass("hidden", "md:block");
    expect(screen.getByText("Created 01/15/26 by")).toBeInTheDocument();
    expect(screen.getByText("Expired 02/15/26")).toBeInTheDocument();
    expect(screen.getByText("Created 01/15/26 by").parentElement?.parentElement).toHaveClass(
      "w-full",
      "pl-[20px]",
      "text-[14px]",
      "leading-[1.38]",
      "md:hidden"
    );
    expect(screen.getByText("Expired 02/15/26")).toHaveClass(
      "font-[500]",
      "text-[var(--color-text-heading-color)]"
    );
    expect(heading.closest("header")?.nextElementSibling).toHaveClass(
      "bg-[#E8EAEB]",
      "h-[1px]",
      "ml-[-16px]",
      "mr-[-16px]"
    );
  });

  it("shows a fallback exclamation icon when the CMS expired status icon is missing", () => {
    render(
      <QuoteDetailHeader
        fields={baseFields}
        quoteNumber="3336212"
        statusKey="order_expired"
        createdDateIso="2026-01-15T00:00:00Z"
        expiryDateIso="2026-02-15T00:00:00Z"
        contactName="Contact Name"
        contactEmail="contact@example.com"
        locale="en-US"
        canRequestDocumentation
        isExpired
        onRequestDocuments={vi.fn()}
        onRequestUpdatedQuote={vi.fn()}
      />
    );

    const expiredBadge = screen.getByLabelText("Expired");
    expect(expiredBadge.querySelector("img")).not.toBeInTheDocument();
    const fallbackIcon = expiredBadge.querySelector("[data-testid='status-fallback-icon']");
    expect(fallbackIcon).toBeInTheDocument();
  });
});
