import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShipmentsPackingSlipButton } from "@/components/core/OrderManagement/tabs/shipments/ShipmentsPackingSlipButton";

const mockOpenBinaryPdfInNewTab = vi.hoisted(() => vi.fn());

vi.mock("@/lib/documentBinaryPdf", () => ({
  openBinaryPdfInNewTab: mockOpenBinaryPdfInNewTab,
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: () => <span aria-hidden="true" data-testid="packing-slip-icon" />,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: () => <span aria-hidden="true" data-testid="packing-slip-image" />,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    isDisabled,
    onPress,
    type,
    ...rest
  }: {
    children: ReactNode;
    isDisabled?: boolean;
    onPress?: () => void;
    type?: "button" | "submit" | "reset";
    [key: string]: unknown;
  }) => (
    <button type={type ?? "button"} disabled={isDisabled} onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

describe("ShipmentsPackingSlipButton", () => {
  const documentUrl =
    "https://objectstorage.us-ashburn-1.oraclecloud.com/AccountingInvoice/2620867_3701533.pdf";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens packing slips through the binary PDF helper", async () => {
    const user = userEvent.setup();
    const onDownloadStart = vi.fn();
    const windowOpen = vi.spyOn(window, "open").mockImplementation(() => null);
    mockOpenBinaryPdfInNewTab.mockResolvedValue(undefined);

    render(
      <ShipmentsPackingSlipButton
        rowId="shipment-123"
        documentUrl={documentUrl}
        tabFields={{ PackingSlipLabel: { value: "Packing Slip" } }}
        onDownloadStart={onDownloadStart}
      />
    );

    await user.click(screen.getByRole("button", { name: "Download Packing Slip" }));

    await waitFor(() => {
      expect(mockOpenBinaryPdfInNewTab).toHaveBeenCalledWith({
        documentUrl,
        suppressErrorToast: true,
      });
    });
    expect(onDownloadStart).toHaveBeenCalledWith("shipment-123");
    expect(windowOpen).not.toHaveBeenCalled();
  });

  it("does not direct-open the raw document URL when binary PDF open fails", async () => {
    const user = userEvent.setup();
    const windowOpen = vi.spyOn(window, "open").mockImplementation(() => null);
    mockOpenBinaryPdfInNewTab.mockRejectedValueOnce(new Error("proxy failed"));

    render(
      <ShipmentsPackingSlipButton
        rowId="shipment-123"
        documentUrl={documentUrl}
        tabFields={{ PackingSlipLabel: { value: "Packing Slip" } }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Download Packing Slip" }));

    await waitFor(() => {
      expect(mockOpenBinaryPdfInNewTab).toHaveBeenCalledWith({
        documentUrl,
        suppressErrorToast: true,
      });
    });
    expect(windowOpen).not.toHaveBeenCalled();
  });
});
