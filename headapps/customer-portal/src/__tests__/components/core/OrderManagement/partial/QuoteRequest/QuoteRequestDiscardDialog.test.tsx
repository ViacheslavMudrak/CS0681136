import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import { QuoteRequestDiscardDialog } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDiscardDialog";
import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field }: { field?: { value?: string } }): ReactElement | null =>
    field?.value ? <span>{field.value}</span> : null,
}));

vi.mock("@/components/shared/modal/Modal", () => ({
  __esModule: true,
  default: ({
    children,
    isOpen,
    onClose,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
  }): ReactElement | null =>
    isOpen ? (
      <div data-testid="discard-modal">
        <button type="button" data-testid="modal-overlay-close" onClick={onClose}>
          overlay-close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onPress,
    isDisabled,
    ...rest
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => (
    <button type="button" disabled={isDisabled} onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

const fullCms: QuoteRequestCmsFields = {
  DialogTitle: { value: "Discard quote?" },
  DialogeBodyText: { value: "This cannot be undone." },
  DialogeCancelButtonLabel: { value: "Keep editing" },
  ConfirmDiscardButtonLabel: { value: "Discard" },
};

describe("QuoteRequestDiscardDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title, body, and action labels when open", () => {
    render(
      <QuoteRequestDiscardDialog
        isOpen
        quoteCms={fullCms}
        isSaving={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText("Discard quote?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep editing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
  });

  it("does not render modal content when closed", () => {
    render(
      <QuoteRequestDiscardDialog
        isOpen={false}
        quoteCms={fullCms}
        isSaving={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.queryByTestId("discard-modal")).not.toBeInTheDocument();
  });

  it("calls onClose and onConfirm from actions", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <QuoteRequestDiscardDialog
        isOpen
        quoteCms={fullCms}
        isSaving={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );
    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    await user.click(screen.getByRole("button", { name: "Discard" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons while saving", () => {
    render(
      <QuoteRequestDiscardDialog
        isOpen
        quoteCms={fullCms}
        isSaving
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Keep editing" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Discard" })).toBeDisabled();
  });
});
