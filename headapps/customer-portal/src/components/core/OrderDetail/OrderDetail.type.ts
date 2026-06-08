import type { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";

import type { QuoteSelectionFieldSource } from "@/components/core/OrderManagement/OrderManagement.type";
import type { OrderManagementCarrierSelectionItem } from "@/components/core/OrderManagement/OrderManagement.type";
import type { ComponentProps } from "@/lib/component-props";
import type { IDocumentRequestPanelFields } from "@/lib/document-request-panel-types";
import type { SitecoreDocumentRequestSelectionFieldValue } from "@/lib/document-request-cms.types";

export interface OrderDetailLocalizedText {
  value: string;
  language?: string;
}

export interface OrderDetailQuantity {
  value: number;
  unit: string;
}

export interface OrderDetailMoney {
  value: number;
  currency: string;
  displayValue: string;
}

export interface OrderDetailProductAttribute {
  key: string;
  value: string;
  unit: string;
}

export interface OrderDetailLineItem {
  customerPartNumber?: string;
  productType?: string;
  partDescription?: OrderDetailLocalizedText;
  quantity?: OrderDetailQuantity;
  intraloxPartNumber?: string;
  productAttributes?: OrderDetailProductAttribute[];
  netUnitPrice?: OrderDetailMoney;
  extendedNetPrice?: OrderDetailMoney;
}

export interface OrderDetailContact {
  name: string;
  email: string;
}

export interface OrderDetailContacts {
  csr?: OrderDetailContact[];
  customer?: OrderDetailContact[];
}

export interface OrderDetailOrderHeader {
  orderId: number;
  orderHeaderId: number;
  accountId: number;
  poNumber?: string;
  orderDate: string;
  orderStatus: string;
  quoteExpiryDate?: string | null;
  referenceId?: string;
}

/** Shared document row shape (order-level related docs, invoices, packing slips). */
export interface OrderDetailDocument {
  documentId: number | null;
  documentType: string;
  documentName?: string;
  fileType?: string;
  documentUrl: string;
  assetDetailsUrl?: string | null;
  /** Raw backend language field for localized documents; normalized to `languageCode` by API mappers. */
  language?: string;
  /** Packing slip / localized doc: ISO-ish code for CMS label (e.g. EN, TR). Defaults to profile locale in UI. */
  languageCode?: string;
}

export interface OrderDetailShipment {
  shipmentId: string;
  trackingNumber: string;
  trackingUrl?: string;
  quantity?: OrderDetailQuantity;
  deliveryStatus: string;
  carrierName: string;
  shipmentDate: string;
  deliveredDate?: string;
  /** Packing slip files (SharePoint / direct URLs); optional `languageCode` per row drives CMS download labels. */
  packingSlip?: OrderDetailDocument[];
}

export interface OrderDetailBillingAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderDetailOrderSummary {
  subTotal: OrderDetailMoney;
  tax: OrderDetailMoney;
  totalAmount: OrderDetailMoney;
}

export interface OrderDetailInvoice {
  invoiceId: number;
  invoiceNumber: string;
  dueDate: string;
  invoiceStatus: string;
  amount: OrderDetailMoney;
  invoiceUrl: string;
  invoiceUrlsByLanguage?: Record<string, string>;
}

export interface OrderDetailApiData {
  order: OrderDetailOrderHeader;
  contacts: OrderDetailContacts;
  lineItems: OrderDetailLineItem[];
  shipments: OrderDetailShipment[];
  billingAddress: OrderDetailBillingAddress;
  orderSummary: OrderDetailOrderSummary;
  invoices: OrderDetailInvoice[];
  documents: OrderDetailDocument[];
}

export interface OrderDetailApiEnvelope {
  success: boolean;
  data: OrderDetailApiData | null;
  /** True when the order/quote does not exist for the account (e.g. HTTP or envelope 404). */
  notFound?: boolean;
}

// --- CMS multilist item shapes ---

export interface OrderDetailNameValueItem {
  id: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
  };
}

export interface OrderDetailActiveColumnItem {
  id: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
    ColumnHeader?: Field<string>;
  };
}

export interface OrderDetailDocumentEntryItem {
  id: string;
  /** Sitecore item name; used with API documentType/documentName matching. */
  name?: string;
  displayName?: string;
  fields?: {
    DocumentLabel?: Field<string>;
    DocumentIcon?: ImageField;
    DownloadIcon?: ImageField;
    DocumentLink?: LinkField;
  };
}

// --- Sitecore datasource fields ---

export interface IOrderDetailFields extends QuoteSelectionFieldSource {
  OrderNumberLabel?: Field<string>;
  POLabel?: Field<string>;
  PlacedDateLabel?: Field<string>;
  ByLabel?: Field<string>;
  ReferenceIDLabel?: Field<string>;
  RequestDocumentsButtonLabel?: Field<string>;
  CreateQuoteOrderButtonLabel?: Field<string>;
  ModifyQuoteOrderButtonLabel?: Field<string>;
  RequestNewQuoteLabel?: Field<string>;
  RequestDocumentLabel?: Field<string>;
  KebabRequestNewQuoteLabel?: Field<string>;
  KebabRequestDocumentLabel?: Field<string>;
  SectionTitlePattern?: Field<string>;
  ExpandAllLabel?: Field<string>;
  CollapseAllLabel?: Field<string>;
  ColumnHeader?: Field<string>;
  CustomerPartLabel?: Field<string>;
  IntraloxPartLabel?: Field<string>;
  SubTotalLabel?: Field<string>;
  DueLabel?: Field<string>;
  PaidLabel?: Field<string>;
  TaxLabel?: Field<string>;
  TotalLabel?: Field<string>;
  HideBillingandInvoiceAmount?: Field<boolean>;
  BillingAddressLabel?: Field<string>;
  InvoiceDownloadLabelPattern?: Field<string>;
  PanelTitle?: Field<string>;
  InvoiceDisplayLimit?: Field<string>;
  ViewAllInvoicesLabel?: Field<string>;
  ShippingPanelTitle?: Field<string>;
  CarrierSelection?: OrderManagementCarrierSelectionItem[];
  ShippedDateLabel?: Field<string>;
  ETADateLabel?: Field<string>;
  ShipmentDisplayLimit?: Field<string>;
  ViewAllShipmentLabel?: Field<string>;
  PackingSlipDownloadLabelPattern?: Field<string>;
  NoShipmentMessage?: Field<string>;
  ShipmentPanelLoadErrorMessage?: Field<string>;
  PackingSlipDownloadErrorMessage?: Field<string>;
  ShipmentRetryLabel?: Field<string>;
  RelatedDocumentsPanelTitle?: Field<string>;
  SupportHelpText?: Field<string>;
  SupportLinkLabel?: Field<string>;
  FallbackSupportEmail?: Field<string>;
  EmptyStateHeading?: Field<string>;
  EmptyStateBody?: Field<string>;
  BillingAddressIcon?: ImageField;
  InvoiceKebabMenuIcon?: ImageField;
  RequestDocumentsButtonIcon?: ImageField;
  CreateQuoteOrderButtonIcon?: ImageField;
  EmptyStateImage?: ImageField;
  MobileSectionOrderSelection?: OrderDetailNameValueItem[];
  PageSizeOptionList?: OrderDetailNameValueItem[];
  DefaultPageSize?: Field<string>;
  ActiveColumnsSelection?: OrderDetailActiveColumnItem[];
  DocumentEntriesSelection?: OrderDetailDocumentEntryItem[];
  ResultSummaryPattern?: Field<string>;
  /** Document request panel CMS bundle (same template as Order Management tab `QuoteSelection`). */
  DocumentSelection?: SitecoreDocumentRequestSelectionFieldValue;
  QuoteSelection?: SitecoreDocumentRequestSelectionFieldValue;
}

export type OrderDetailProps = ComponentProps & {
  fields: IOrderDetailFields;
};
