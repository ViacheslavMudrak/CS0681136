import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

import { QuoteRequestSubmittingAs } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestSubmittingAs";
import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field }: { field?: { value?: string } }): ReactElement | null =>
    field?.value ? <span>{field.value}</span> : null,
  Image: ({ field }: { field?: { value?: { src?: string } } }): ReactElement | null =>
    field?.value?.src ? <img src={field.value.src} alt="" data-testid="cms-img" /> : null,
  RichText: ({ field }: { field?: { value?: string } }): ReactElement | null =>
    field?.value ? <div data-testid="tooltip-rich-text">{field.value}</div> : null,
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: (): ReactElement => <span data-testid="fallback-icon" />,
}));

vi.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onPress,
    ...rest
  }: {
    children?: ReactNode;
    onPress?: () => void;
  } & ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => (
    <button type="button" onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

const mockUseProfileContext = vi.fn(() => ({
  selectedAccount: {
    companyName: "Acme Corp",
    address: "100 Main St",
  },
}));

vi.mock("@/lib/profile-context", () => ({
  useProfileContext: () => mockUseProfileContext(),
}));

describe("QuoteRequestSubmittingAs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProfileContext.mockReturnValue({
      selectedAccount: {
        companyName: "Acme Corp",
        address: "100 Main St",
      },
    });
  });

  it("renders label, CMS icon when configured, and selected account", () => {
    const quoteCms: QuoteRequestCmsFields = {
      SubmittingAsLabel: { value: "Submitting as" },
      SubmittingAsIcon: {
        value: { src: "/icon.svg", alt: "" },
      },
    };
    render(<QuoteRequestSubmittingAs quoteCms={quoteCms} />);
    expect(screen.getByText("Submitting as")).toBeInTheDocument();
    expect(screen.getByTestId("cms-img")).toHaveAttribute("src", "/icon.svg");
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("100 Main St")).toBeInTheDocument();
    expect(screen.queryByTestId("fallback-icon")).not.toBeInTheDocument();
  });

  it("renders fallback icon when no CMS icon src", () => {
    const quoteCms: QuoteRequestCmsFields = {
      SubmittingAsLabel: { value: "As" },
    };
    render(<QuoteRequestSubmittingAs quoteCms={quoteCms} />);
    expect(screen.getByTestId("fallback-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("cms-img")).not.toBeInTheDocument();
  });

  it("shows help button when submitting-as tooltip is configured", async () => {
    const user = userEvent.setup();
    const quoteCms: QuoteRequestCmsFields = {
      SubmittingAsLabel: { value: "As" },
      SubmittingAsTooltipDescription: { value: "<p>Account help</p>" },
    };
    render(<QuoteRequestSubmittingAs quoteCms={quoteCms} />);
    const helpBtn = screen.getByRole("button", { name: /Quote request account information/i });
    expect(helpBtn).toBeInTheDocument();
    expect(screen.getByTestId("fallback-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("tooltip-rich-text")).not.toBeInTheDocument();
    await user.click(helpBtn);
    expect(screen.getByTestId("tooltip-rich-text")).toHaveTextContent("Account help");
  });

  it("shows em dash for company when no selected account", () => {
    mockUseProfileContext.mockReturnValue({ selectedAccount: null });
    render(<QuoteRequestSubmittingAs quoteCms={{ SubmittingAsLabel: { value: "As" } }} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
