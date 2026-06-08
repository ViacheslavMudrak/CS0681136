import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import { QuoteRequestConfirmationStep } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestConfirmationStep";
import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field }: { field?: { value?: string } }): ReactElement | null =>
    field?.value ? <span>{field.value}</span> : null,
  RichText: ({ field }: { field?: { value?: string } }): ReactElement | null =>
    field?.value ? <div>{field.value}</div> : null,
  Image: ({ field }: { field?: { value?: { src?: string } } }): ReactElement | null =>
    field?.value?.src ? <img src={field.value.src} alt="" data-testid="confirm-cms-icon" /> : null,
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: (): ReactElement => <span data-testid="confirm-fa-icon" />,
}));

vi.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onPress,
    ...rest
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => (
    <button type="button" onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

describe("QuoteRequestConfirmationStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders CMS confirmation icon when src is set", () => {
    const quoteCms: QuoteRequestCmsFields = {
      ConfirmationIcon: { value: { src: "/check.svg", alt: "" } },
      ConfirmationTitle: { value: "Done" },
      ConfirmationDescription: { value: "Thanks" },
      RequestIDLabel: { value: "Request ID" },
      ConfirmationButtonText: { value: "Close" },
    };
    const onClose = vi.fn();
    render(
      <QuoteRequestConfirmationStep quoteCms={quoteCms} requestId="REQ-1" onClose={onClose} />
    );
    expect(screen.getByTestId("confirm-cms-icon")).toHaveAttribute("src", "/check.svg");
    expect(screen.queryByTestId("confirm-fa-icon")).not.toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Thanks")).toBeInTheDocument();
    expect(screen.getByText("REQ-1")).toBeInTheDocument();
  });

  it("renders Font Awesome check icon when no CMS icon", () => {
    const quoteCms: QuoteRequestCmsFields = {
      ConfirmationTitle: { value: "Sent" },
      ConfirmationButtonText: { value: "OK" },
    };
    render(<QuoteRequestConfirmationStep quoteCms={quoteCms} requestId="R2" onClose={vi.fn()} />);
    expect(screen.getByTestId("confirm-fa-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("confirm-cms-icon")).not.toBeInTheDocument();
  });

  it("calls onClose when the primary button is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <QuoteRequestConfirmationStep
        quoteCms={{ ConfirmationButtonText: { value: "Close drawer" } }}
        requestId="X"
        onClose={onClose}
      />
    );
    await user.click(screen.getByRole("button", { name: /close drawer/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
