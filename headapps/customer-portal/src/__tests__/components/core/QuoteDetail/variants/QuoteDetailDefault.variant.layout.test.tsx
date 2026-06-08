import type React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { QuoteDetailDefaultVariant } from "@/components/core/QuoteDetail/variants/QuoteDetailDefault.variant";
import type { ComponentProps } from "@/lib/component-props";

let mockIsMobile = false;
let mockIsCompactPhoneViewport = false;
let mockStatusKey = "order_expired";
let mockDescriptionOverflows = true;

class MockResizeObserver {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }

  unobserve() {}

  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      return mockDescriptionOverflows ? 48 : 20;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return 24;
    },
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/quotes/3336212",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams("quoteId=3336212"),
}));

vi.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({ authState: { idToken: { claims: { email: "test@example.com" } } } }),
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: () => <span aria-hidden="true" data-testid="font-awesome-icon" />,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Image: () => null,
  Text: ({ field, tag = "span", className }: { field?: { value?: string }; tag?: string; className?: string }) =>
    tag === "h3" ? <h3 className={className}>{field?.value}</h3> : <span className={className}>{field?.value}</span>,
  RichText: ({ field, tag = "div", className }: { field?: { value?: string }; tag?: string; className?: string }) =>
    tag === "span" ? <span className={className}>{field?.value}</span> : <div className={className}>{field?.value}</div>,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    btnVariant: _btnVariant,
    onPress,
    type,
    ...rest
  }: {
    children: React.ReactNode;
    btnVariant?: string;
    onPress?: () => void;
    type?: "button" | "submit" | "reset";
    [key: string]: unknown;
  }) => (
    <button type={type ?? "button"} onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/Link", () => ({
  default: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

vi.mock("@/components/core/QuoteDetail/partial/QuoteDetailHeader", () => ({
  QuoteDetailHeader: () => <header data-testid="quote-detail-header" />,
}));

vi.mock("@/components/shared/document-request-panel/DocumentRequestPanel", () => ({
  DocumentRequestPanel: () => null,
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer", () => ({
  QuoteRequestDrawer: () => null,
}));

vi.mock("@/components/shared/portal-loading/PortalShellChromeLoading", () => ({
  PortalShellMainSkeleton: () => null,
}));

vi.mock("@/hooks/use-active-locale", () => ({
  useActiveLocale: () => "en",
}));

vi.mock("@/hooks/use-device-type", () => ({
  default: () => ({ isMobile: mockIsMobile }),
}));

vi.mock("@/hooks/use-compact-phone-viewport", () => ({
  useCompactPhoneViewport: () => mockIsCompactPhoneViewport,
}));

vi.mock("@/hooks/useQuoteRequest", () => ({
  useQuoteRequest: () => ({}),
}));

vi.mock("@/lib/permission-context", () => ({
  usePermissionContext: () => ({
    can: () => true,
    isLoading: false,
    hasResolved: true,
    sitecoreEditingPermissionBypass: false,
  }),
}));

vi.mock("@/lib/profile-context", () => ({
  useProfileContext: () => ({
    selectedAccount: {
      id: "123",
      accountRep: { name: "Contact Name", email: "contact@example.com" },
      accountRepEmail: "contact@example.com",
    },
  }),
}));

vi.mock("@/hooks/useQuoteDetail", () => ({
  useQuoteDetail: () => ({
    data: {
      quoteId: "3336212",
      quoteNumber: "3336212",
      statusKey: mockStatusKey,
      createdDateIso: "2026-01-15T00:00:00Z",
      expiryDateIso: "2026-02-15T00:00:00Z",
      contactName: "Contact Name",
      contactEmail: "contact@example.com",
      lineItems: [
        {
          customerPartNumber: "58970",
          intraloxPartNumber: "A1H8HYAGJ5ZB",
          partDescription: {
            value:
              "SERIES 4500 51.9 X 1.68 RIGHT DUAL STACKED ANGLED ROLLER GREY POLYPROPYLENE BOXED BELT",
          },
          quantity: { value: 15, unit: "each" },
          netUnitPrice: { value: 12.34, currency: "USD", displayValue: "12.34" },
          extendedNetPrice: { value: 56.78, currency: "CAD", displayValue: "" },
        },
      ],
    },
    loadFailed: false,
    notFound: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

const fields = {
  QuoteNumberPrefix: { value: "Order" },
  SectionTitlePattern: { value: "Quoted Items ({count})" },
  ExpandAllLabel: { value: "Expand All Items" },
  CollapseAllLabel: { value: "Collapse All Items" },
  ColumnHeader: { value: "Part # / Description" },
  CustomerPartLabel: { value: "Customer Part" },
  IntraloxPartLabel: { value: "Intralox Part" },
  PricingSectionTitle: { value: "Pricing" },
  SubTotalLabel: { value: "Subtotal" },
  TaxLabel: { value: "Tax" },
  TotalLabel: { value: "Total" },
  ActiveColumnsSelection: [
    {
      id: "quantity",
      displayName: "Quantity",
      fields: { Value: { value: "QUANTITY" }, ColumnHeader: { value: "Quantity" } },
    },
    {
      id: "net-unit-price",
      displayName: "Net Unit Price",
      fields: { Value: { value: "NET UNIT PRICE" }, ColumnHeader: { value: "Net Unit Price" } },
    },
    {
      id: "extended-net-price",
      displayName: "Extended Net Price",
      fields: { Value: { value: "EXTENDED NET PRICE" }, ColumnHeader: { value: "Extended Net Price" } },
    },
  ],
  CostExpiredPanelHeading: { value: "Cost Estimate Expired" },
  CostExpiredPanelBody: { value: "Pricing information is no longer available for this quote." },
  CostExpiredPanelLinkLabel: { value: "Request an updated quote" },
  CostExpiredPanelPostLinkText: { value: "to view current pricing and availability." },
  KebabRequestQuoteLabel: { value: "Request quote" },
  KebabRequestDocumentLabel: { value: "Request document" },
  NotFoundStatusLabel: { value: "Not found" },
  EmptyStateHeading: { value: "Quote details unavailable" },
  EmptyStateBody: { value: "We couldn't load this quote. Please try again or contact support." },
  EmptyStateRetryButtonLabel: { value: "Retry" },
};

function renderQuoteDetail() {
  return render(
    <QuoteDetailDefaultVariant
      testId="quote-detail"
      fields={fields}
      params={{ styles: "", RenderingIdentifier: "" }}
      page={{
        locale: "en",
        mode: {
          isEditing: false,
          isDesignLibrary: false,
          name: "normal",
          designLibrary: { isVariantGeneration: false },
          isNormal: true,
          isPreview: false,
        },
        layout: { sitecore: { context: {}, route: null } },
      } as unknown as ComponentProps["page"]}
    />
  );
}

describe("QuoteDetailDefaultVariant quoted items layout", () => {
  beforeEach(() => {
    mockIsMobile = false;
    mockIsCompactPhoneViewport = false;
    mockStatusKey = "order_expired";
    mockDescriptionOverflows = true;
  });

  it("uses the Order Detail-style full-width shell without extra page padding", () => {
    renderQuoteDetail();

    const shell = screen.getByTestId("quote-detail-header").parentElement;
    expect(shell).toHaveClass("flex", "flex-col", "gap-[16px]", "md:gap-[24px]", "w-full", "min-w-0");
    expect(shell).not.toHaveClass("mx-auto", "max-w-[1200px]", "p-[16px]");

    const contentLayout = screen.getByTestId("quote-detail-header").nextElementSibling;
    expect(contentLayout).toHaveClass(
      "flex",
      "flex-col",
      "md:flex-row",
      "md:gap-[20px]",
      "gap-[24px]",
      "w-full"
    );
    expect(contentLayout?.firstElementChild).toHaveClass(
      "order-2",
      "md:order-1",
      "md:flex-1",
      "md:min-w-0"
    );
    expect(contentLayout?.lastElementChild).toHaveClass(
      "order-1",
      "md:order-2",
      "w-full",
      "md:w-[232px]",
      "md:max-w-[340px]",
      "md:shrink-0",
      "lg:shrink-0"
    );

    const expiredPanel = screen.getByText("Cost Estimate Expired").parentElement?.parentElement;
    expect(expiredPanel).toHaveClass(
      "w-full",
      "min-w-0",
      "max-w-full",
      "box-border",
      "rounded-[8px]",
      "border",
      "border-[var(--color-border-default)]",
      "px-[40px]",
      "py-[32px]"
    );
    expect(expiredPanel).not.toHaveClass(
      "max-w-[340px]",
      "flex-none",
      "md:max-lg:max-w-[220px]"
    );
    const expiredPanelContent = screen.getByText("Cost Estimate Expired").parentElement;
    expect(expiredPanelContent).toHaveClass(
      "mx-auto",
      "w-full",
      "max-w-[258px]",
      "items-center"
    );
    expect(expiredPanelContent).not.toHaveClass("self-stretch");
    expect(screen.getByText(/Pricing information/).parentElement).toHaveClass(
      "items-center",
      "gap-[14px]"
    );

    const expiredPanelLink = screen.getByRole("button", { name: "Request an updated quote" });
    expect(expiredPanelLink.parentElement).toHaveClass(
      "mt-[14px]",
      "w-full",
      "text-center",
      "whitespace-normal",
      "[overflow-wrap:anywhere]"
    );
    expect(expiredPanelLink).toHaveClass(
      "!inline",
      "!min-w-0",
      "!w-auto",
      "!rounded-none",
      "align-baseline",
      "[font:inherit]"
    );
    expect(screen.getByText("to view current pricing and availability.")).toHaveClass("inline");
  });

  it("keeps expired quote link sentence spacing and inline flow in stacked mobile/tablet layout", () => {
    mockIsMobile = true;
    renderQuoteDetail();

    const contentLayout = screen.getByTestId("quote-detail-header").nextElementSibling;
    expect(contentLayout).toHaveClass("flex", "flex-col", "gap-[16px]");
    expect(screen.getByText(/Pricing information/).parentElement).toHaveClass(
      "items-center",
      "gap-[14px]"
    );
    expect(screen.getByRole("button", { name: "Request an updated quote" }).parentElement).toHaveClass(
      "mt-[14px]",
      "w-full",
      "text-center",
      "whitespace-normal",
      "[overflow-wrap:anywhere]"
    );
    expect(screen.getByRole("button", { name: "Request an updated quote" })).toHaveClass(
      "!inline",
      "!min-w-0",
      "!w-auto",
      "align-baseline"
    );
    expect(screen.getByText("to view current pricing and availability.")).toHaveClass("inline");
  });

  it("keeps pricing or expired card first below desktop even if iOS device detection uses the desktop branch", () => {
    mockIsMobile = false;
    mockIsCompactPhoneViewport = false;
    renderQuoteDetail();

    const contentLayout = screen.getByTestId("quote-detail-header").nextElementSibling;
    const quotedItemsColumn = contentLayout?.firstElementChild;
    const sidebarColumn = contentLayout?.lastElementChild;

    expect(contentLayout).toHaveClass("flex-col", "md:flex-row");
    expect(quotedItemsColumn).toHaveClass("order-2", "md:order-1");
    expect(sidebarColumn).toHaveClass("order-1", "md:order-2");
    expect(sidebarColumn).toContainElement(screen.getByText("Cost Estimate Expired"));
  });

  it("keeps the ready quote pricing card inside the Order Detail-style sidebar", () => {
    mockStatusKey = "order_ready";
    renderQuoteDetail();

    const pricingPanel = screen.getByText("Pricing").parentElement;
    expect(pricingPanel).toHaveClass(
      "w-full",
      "min-w-0",
      "max-w-full",
      "box-border",
      "gap-[16px]",
      "md:gap-[24px]",
      "rounded-[8px]",
      "border",
      "border-[var(--color-border-default)]",
      "p-[16px]",
      "md:p-[20px]"
    );
    expect(pricingPanel).not.toHaveClass(
      "md:max-lg:max-w-[220px]"
    );
    expect(screen.getByText("Subtotal")).toHaveClass("text-[12px]", "font-[400]");
    expect(screen.getByText("Total")).toHaveClass("text-[14px]", "font-[500]");
  });

  it("renders the main expand-all button only when at least one line item is expandable", async () => {
    renderQuoteDetail();

    const expandButton = await screen.findByRole("button", { name: "Expand All Items" });
    expect(expandButton).toHaveAttribute("variant", "transparent");
    expect(expandButton).toHaveClass(
      "inline-flex",
      "rounded-sm",
      "text-[12px]",
      "font-[500]",
      "text-[var(--color-action-primary)]"
    );
    expect(expandButton.firstElementChild?.tagName.toLowerCase()).toBe("svg");
    expect(expandButton.firstElementChild).not.toHaveClass("rotate-180");

    fireEvent.click(expandButton);

    const collapseButton = await screen.findByRole("button", { name: "Collapse All Items" });
    expect(collapseButton.firstElementChild).toHaveClass("rotate-180");
  });

  it("hides main and row expand controls when no line item description overflows", async () => {
    mockDescriptionOverflows = false;
    renderQuoteDetail();

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Expand All Items" })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "Expand description" })).not.toBeInTheDocument();
  });

  it("uses Figma table header and compact row control styles on desktop", async () => {
    renderQuoteDetail();

    expect(screen.getByText("Part # / Description").closest("tr")).toHaveClass("bg-[#F8FAFD]");
    const table = screen.getByText("Part # / Description").closest("table");
    const tableScroller = table?.parentElement;
    const quotedItemsCard = tableScroller?.parentElement;
    expect(quotedItemsCard).toHaveClass(
      "flex",
      "flex-col",
      "w-full",
      "min-w-0",
      "max-w-full",
      "overflow-hidden",
      "border",
      "border-neutral-200",
      "rounded-md"
    );
    expect(tableScroller).toHaveClass("w-full", "min-w-0", "max-w-full", "overflow-x-auto");
    expect(screen.getByText("Quoted Items (1)")).toHaveClass(
      "text-[16px]",
      "font-[500]",
      "leading-[1.375]",
      "text-black"
    );
    expect(screen.getByText("Part # / Description")).toHaveClass("text-[10px]", "text-[#7A7B7F]");
    expect(screen.getByText(/Customer Part #58970/)).toHaveClass("text-[12px]", "font-[500]");
    expect(screen.getByText(/SERIES 4500/)).toHaveClass("max-w-[calc(100%-32px)]");

    const rowExpandButton = await screen.findByRole("button", { name: "Expand description" });
    expect(rowExpandButton).toHaveAttribute("variant", "ghost");
    expect(rowExpandButton).toHaveClass(
      "text-[var(--color-menu-hover-color)]",
      "bg-transparent",
      "border-0"
    );
    expect(rowExpandButton.firstElementChild).toHaveAttribute("data-testid", "font-awesome-icon");
  });

  it("uses Figma card, label, and quantity row styles on mobile", async () => {
    mockIsMobile = true;
    renderQuoteDetail();

    expect(screen.getByText("Quoted Items (1)")).toHaveClass("text-[16px]", "font-[500]");
    expect(await screen.findByRole("button", { name: "Expand All Items" })).toHaveAttribute(
      "variant",
      "transparent"
    );
    expect(screen.getByText("Quoted Items (1)").closest("div")?.parentElement).toHaveClass(
      "rounded-lg",
      "pt-[15px]",
      "pr-[15px]",
      "pb-[21px]",
      "pl-[15px]",
      "bg-[var(--color-bg-basic-color)]",
      "border",
      "border-neutral-200"
    );
    expect(screen.getByText("Part # / Description")).toHaveClass("text-[10px]", "text-[#7A7B7F]");
    expect(screen.getByText("Quantity").parentElement).toHaveClass(
      "border-b",
      "border-[#E8EAEB]"
    );
    expect(screen.getByText("15")).toHaveClass("text-[14px]", "text-black");
  });

  it("renders quote price values with a dollar sign", () => {
    mockStatusKey = "order_ready";
    renderQuoteDetail();

    expect(screen.getByText("$12.34")).toBeInTheDocument();
    expect(screen.getByText("$56.78")).toBeInTheDocument();
  });

  it("keeps quote detail item columns in Sitecore selection order", () => {
    mockStatusKey = "order_ready";
    renderQuoteDetail();

    const quantityHeader = screen.getByRole("columnheader", { name: "Quantity" });
    const netUnitPriceHeader = screen.getByRole("columnheader", { name: "Net Unit Price" });
    const extendedNetPriceHeader = screen.getByRole("columnheader", {
      name: "Extended Net Price",
    });

    expect(
      quantityHeader.compareDocumentPosition(netUnitPriceHeader) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      netUnitPriceHeader.compareDocumentPosition(extendedNetPriceHeader) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("uses the mobile stack for compact phone responsive widths that device type classifies as tablet", () => {
    mockIsMobile = false;
    mockIsCompactPhoneViewport = true;

    renderQuoteDetail();

    const contentLayout = screen.getByTestId("quote-detail-header").nextElementSibling;
    expect(contentLayout).toHaveClass("flex", "flex-col", "gap-[16px]");
    expect(contentLayout).not.toHaveClass("md:flex-row", "gap-[24px]");
    expect(screen.getByText("Quoted Items (1)")).toHaveClass("text-[16px]", "font-[500]");
  });
});
