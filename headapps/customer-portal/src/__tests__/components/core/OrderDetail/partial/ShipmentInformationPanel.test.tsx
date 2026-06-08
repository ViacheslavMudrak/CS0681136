import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShipmentInformationPanel } from "@/components/core/OrderDetail/partial/ShipmentInformationPanel";
import type {
  IOrderDetailFields,
  OrderDetailApiData,
} from "@/components/core/OrderDetail/OrderDetail.type";

const mockOpenBinaryPdfInNewTab = vi.hoisted(() => vi.fn());
const mockTrackPackingSlipDownload = vi.hoisted(() => vi.fn());
const mockTrackPackingSlipLanguageSelected = vi.hoisted(() => vi.fn());

vi.mock("@/lib/documentBinaryPdf", () => ({
  openBinaryPdfInNewTab: mockOpenBinaryPdfInNewTab,
}));

vi.mock("@/lib/orderDetailAnalytics", () => ({
  trackOrderDetailPackingSlipDownload: mockTrackPackingSlipDownload,
  trackOrderDetailPackingSlipLanguageSelected: mockTrackPackingSlipLanguageSelected,
  trackOrderDetailShipmentInformationPanelView: vi.fn(),
  trackOrderDetailShipmentTrackingLinkClick: vi.fn(),
  trackOrderDetailShipmentViewAllClick: vi.fn(),
}));

vi.mock("@/hooks/use-active-locale", () => ({
  useActiveLocale: () => "en",
}));

vi.mock("@/lib/profile-context", () => ({
  useProfileContext: () => ({
    currentLanguage: "en-US",
  }),
}));

vi.mock("@/lib/locale-path", () => ({
  localizeHref: (href: string) => href,
}));

vi.mock("@/lib/orderManagementUtils", () => ({
  ORDERS_MANAGEMENT_SHIPMENTS_TAB_HREF: "/orders-management/shipments",
  formatOrderDateDisplay: () => "May 18, 2026",
  resolveTrackingUrl: () => null,
}));

vi.mock("@/hooks/useClickOutside", () => ({
  default: vi.fn(),
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    className,
    isDisabled,
    onPress,
    role,
    type = "button",
    "aria-expanded": ariaExpanded,
    "aria-haspopup": ariaHasPopup,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    className?: string;
    isDisabled?: boolean;
    onPress?: () => void;
    role?: React.AriaRole;
    type?: "button" | "submit" | "reset";
    "aria-expanded"?: boolean;
    "aria-haspopup"?: boolean | "dialog" | "menu" | "listbox" | "tree" | "grid";
    "aria-label"?: string;
  }) => (
    <button
      type={type}
      className={className}
      disabled={isDisabled}
      role={role}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      aria-label={ariaLabel}
      onClick={onPress}
    >
      {children}
    </button>
  ),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field, tag: Tag = "span" }: { field?: { value?: string }; tag?: keyof React.JSX.IntrinsicElements }) => (
    <Tag>{field?.value ?? ""}</Tag>
  ),
  Image: () => null,
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: () => null,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const fields = {
  ShippingPanelTitle: { value: "Shipping Information" },
  ShippedDateLabel: { value: "Shipped" },
  PackingSlipDownloadLabelPattern: { value: "Download {Language}" },
  ViewAllShipmentLabel: { value: "View all shipments" },
} as IOrderDetailFields;

const data = {
  order: {
    orderId: 100,
    orderHeaderId: 42,
    accountId: 1,
    orderDate: "2026-05-18T14:43:12.000-05:00",
    orderStatus: "Shipped",
  },
  contacts: { customer: [] },
  lineItems: [],
  shipments: [
    {
      shipmentId: "44046793",
      trackingNumber: "757856758",
      deliveryStatus: "Shipped",
      carrierName: "SAIA",
      shipmentDate: "2026-05-18T14:43:12.000-05:00",
      packingSlip: [
        {
          documentId: 51026076,
          documentType: "Web Page",
          documentName: "",
          fileType: "",
          documentUrl: "https://objectstorage.example.com/PackingSlip/ja.pdf",
          languageCode: "JA",
        },
        {
          documentId: 51026077,
          documentType: "Web Page",
          documentName: "",
          fileType: "",
          documentUrl: "https://objectstorage.example.com/PackingSlip/us.pdf",
          languageCode: "US",
        },
        {
          documentId: 51026078,
          documentType: "Web Page",
          documentName: "",
          fileType: "",
          documentUrl: "https://objectstorage.example.com/PackingSlip/zht.pdf",
          languageCode: "ZHT",
        },
      ],
    },
  ],
  billingAddress: {},
  orderSummary: {
    subTotal: { value: 0, currency: "USD", displayValue: "" },
    tax: { value: 0, currency: "USD", displayValue: "" },
    totalAmount: { value: 0, currency: "USD", displayValue: "" },
  },
  invoices: [],
  documents: [],
} as OrderDetailApiData;

function renderShipmentInformationPanel() {
  return render(
    <ShipmentInformationPanel
      fields={fields}
      data={data}
      locale="en-US"
      orderNumberForFilter="3806093"
      orderHeaderIdForViewAll="42"
    />
  );
}

describe("ShipmentInformationPanel packing slip languages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenBinaryPdfInNewTab.mockResolvedValue(undefined);
  });

  it("renders packing slip labels from each document language", async () => {
    const user = userEvent.setup();
    renderShipmentInformationPanel();

    await user.click(screen.getByRole("button", { name: "Packing slip download options" }));

    expect(screen.getByRole("menuitem", { name: "Download JA" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Download US" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Download ZHT" })).toBeInTheDocument();
  });

  it("passes the selected packing slip language to the binary PDF request", async () => {
    const user = userEvent.setup();
    renderShipmentInformationPanel();

    await user.click(screen.getByRole("button", { name: "Packing slip download options" }));
    await user.click(screen.getByRole("menuitem", { name: "Download ZHT" }));

    expect(mockOpenBinaryPdfInNewTab).toHaveBeenCalledWith({
      documentUrl: "https://objectstorage.example.com/PackingSlip/zht.pdf",
      language: "ZHT",
      suppressErrorToast: true,
    });
    expect(mockTrackPackingSlipDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "packing-slip-44046793-ZHT.pdf",
        languageCode: "ZHT",
      })
    );
    expect(mockTrackPackingSlipLanguageSelected).toHaveBeenCalledWith({
      orderNumber: "3806093",
      languageCode: "ZHT",
    });
  });
});
