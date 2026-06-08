"use client";

import {
  sendOrderDetailDocRequestInitiatedEvent,
  sendOrderDetailDocumentDownloadEvent,
  sendOrderDetailPackingSlipDownloadEvent,
  sendOrderDetailPackingSlipLanguageSelectedEvent,
  sendOrderDetailQuoteRequestInitiatedEvent,
  sendOrderDetailRelatedDocumentsPanelViewEvent,
  sendOrderDetailSelectContentEvent,
  sendOrderDetailShipmentInformationPanelViewEvent,
  sendOrderDetailShipmentViewAllClickEvent,
  sendOrderDetailSupportContactClickEvent,
  sendOrderDetailTrackingLinkClickEvent,
} from "@/lib/CDPEvents";
import {
  logGTMOrderDetailCollapseAll,
  logGTMOrderDetailDocumentDownload,
  logGTMOrderDetailPackingSlipDownload,
  logGTMOrderDetailPackingSlipLanguageSelected,
  logGTMOrderDetailRelatedDocumentsPanelView,
  logGTMOrderDetailSelectContent,
  logGTMOrderDetailShipmentInformationPanelView,
  logGTMOrderDetailShipmentViewAllClick,
  logGTMOrderDetailSubheaderContactClick,
  logGTMOrderDetailSupportContactClick,
  logGTMOrderDetailTrackingLinkClick,
} from "@/lib/gtm";

const PANEL_VIEW_DEDUPE_MS = 2000;
let lastRelatedDocumentsPanelViewKey: string | null = null;
let lastRelatedDocumentsPanelViewAt = 0;
let lastShipmentInformationPanelViewKey: string | null = null;
let lastShipmentInformationPanelViewAt = 0;

/**
 * Fires GTM `page_view` and CDP `VIEW` when the Related Documents & Resources panel loads.
 */
export function trackOrderDetailRelatedDocumentsPanelView(params: {
  orderNumber: string;
}): void {
  if (!params.orderNumber) return;
  const now = Date.now();
  const key = params.orderNumber;
  if (
    lastRelatedDocumentsPanelViewKey === key &&
    now - lastRelatedDocumentsPanelViewAt < PANEL_VIEW_DEDUPE_MS
  ) {
    return;
  }
  lastRelatedDocumentsPanelViewKey = key;
  lastRelatedDocumentsPanelViewAt = now;

  logGTMOrderDetailRelatedDocumentsPanelView({
    order_number: params.orderNumber,
  });
  void sendOrderDetailRelatedDocumentsPanelViewEvent({
    orderNumber: params.orderNumber,
  });
}

/**
 * Fires GTM `page_view` and CDP `VIEW` when the Shipment Information panel loads.
 */
export function trackOrderDetailShipmentInformationPanelView(params: {
  orderNumber: string;
}): void {
  if (!params.orderNumber) return;
  const now = Date.now();
  const key = params.orderNumber;
  if (
    lastShipmentInformationPanelViewKey === key &&
    now - lastShipmentInformationPanelViewAt < PANEL_VIEW_DEDUPE_MS
  ) {
    return;
  }
  lastShipmentInformationPanelViewKey = key;
  lastShipmentInformationPanelViewAt = now;

  logGTMOrderDetailShipmentInformationPanelView({
    order_number: params.orderNumber,
  });
  void sendOrderDetailShipmentInformationPanelViewEvent({
    orderNumber: params.orderNumber,
  });
}

export function trackOrderDetailShipmentTrackingLinkClick(params: {
  orderNumber: string;
  carrierName: string;
}): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailTrackingLinkClick({
    order_number: params.orderNumber,
    carrier_name: params.carrierName,
  });
  void sendOrderDetailTrackingLinkClickEvent({
    orderNumber: params.orderNumber,
    carrierName: params.carrierName,
  });
}

export function trackOrderDetailPackingSlipDownload(params: {
  orderNumber: string;
  fileName: string;
  languageCode: string;
}): void {
  if (!params.orderNumber || !params.fileName) return;
  logGTMOrderDetailPackingSlipDownload({
    order_number: params.orderNumber,
    file_name: params.fileName,
    language_code: params.languageCode,
  });
  void sendOrderDetailPackingSlipDownloadEvent({
    orderNumber: params.orderNumber,
    fileName: params.fileName,
    languageCode: params.languageCode,
  });
}

/** When the packing slip menu has more than two language options and the user picks one. */
export function trackOrderDetailPackingSlipLanguageSelected(params: {
  orderNumber: string;
  languageCode: string;
}): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailPackingSlipLanguageSelected({
    order_number: params.orderNumber,
    language_code: params.languageCode,
  });
  void sendOrderDetailPackingSlipLanguageSelectedEvent({
    orderNumber: params.orderNumber,
    languageCode: params.languageCode,
  });
}

export function trackOrderDetailShipmentViewAllClick(params: {
  orderNumber: string;
  shipmentCount: number;
}): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailShipmentViewAllClick({
    order_number: params.orderNumber,
    shipment_count: params.shipmentCount,
  });
  void sendOrderDetailShipmentViewAllClickEvent({
    orderNumber: params.orderNumber,
    shipmentCount: params.shipmentCount,
  });
}

export function trackOrderDetailInvoiceViewAllClick(params: { orderNumber: string }): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailSelectContent({
    order_number: params.orderNumber,
    interaction_type: "View_All_Invoice",
  });
  void sendOrderDetailSelectContentEvent({
    orderNumber: params.orderNumber,
    interactionType: "View_All_Invoice",
  });
}

/**
 * Fires GTM `file_download` and CDP `DOCUMENT_DOWNLOAD` for a related-document action.
 */
export function trackOrderDetailRelatedDocumentDownload(params: {
  fileName: string;
  documentLabel: string;
  orderNumber: string;
}): void {
  logGTMOrderDetailDocumentDownload(params);
  void sendOrderDetailDocumentDownloadEvent({
    fileName: params.fileName,
    documentLabel: params.documentLabel,
    orderNumber: params.orderNumber,
  });
}

/**
 * Fires GTM `select_content` and CDP `SUPPORT_CONTACT_CLICK` for the support mailto link.
 */
export function trackOrderDetailRelatedDocumentsSupportEmailClick(params: { orderNumber: string }): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailSupportContactClick(params);
  void sendOrderDetailSupportContactClickEvent({ orderNumber: params.orderNumber });
}

export function trackOrderDetailLineItemDescriptionExpand(params: {
  orderNumber: string;
  interactionType: "Chevron_Click" | "Row_Click";
}): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailSelectContent({
    order_number: params.orderNumber,
    interaction_type: params.interactionType,
  });
  void sendOrderDetailSelectContentEvent({
    orderNumber: params.orderNumber,
    interactionType: params.interactionType,
  });
}

export function trackOrderDetailExpandAllItems(params: { orderNumber: string }): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailSelectContent({
    order_number: params.orderNumber,
    interaction_type: "Expand_All_Items",
  });
  void sendOrderDetailSelectContentEvent({
    orderNumber: params.orderNumber,
    interactionType: "Expand_All_Items",
  });
}

export function trackOrderDetailCollapseAllItems(params: { orderNumber: string }): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailCollapseAll({ order_number: params.orderNumber });
  void sendOrderDetailSelectContentEvent({
    orderNumber: params.orderNumber,
    interactionType: "Collapse_All_Items",
  });
}

export function trackOrderDetailDocRequestInitiated(params: {
  orderNumber: string;
  initiationPoint: "Line_Item" | "Order_Header";
}): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailSelectContent({
    order_number: params.orderNumber,
    interaction_type: "Doc_Request_Initiated",
    initiation_point: params.initiationPoint,
  });
  void sendOrderDetailDocRequestInitiatedEvent({
    orderNumber: params.orderNumber,
    interactionType: "Doc_Request_Initiated",
    initiationPoint: params.initiationPoint,
  });
}

export function trackOrderDetailQuoteRequestInitiated(params: {
  orderNumber: string;
  initiationPoint: "Line_Item" | "Order_Header";
}): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailSelectContent({
    order_number: params.orderNumber,
    interaction_type: "Quote_Request_Initiated",
    initiation_point: params.initiationPoint,
  });
  void sendOrderDetailQuoteRequestInitiatedEvent({
    orderNumber: params.orderNumber,
    interactionType: "Quote_Request_Initiated",
    initiationPoint: params.initiationPoint,
  });
}

/** Placed-by contact mailto in order detail sub-header. */
export function trackOrderDetailSubheaderContactClick(params: { orderNumber: string }): void {
  if (!params.orderNumber) return;
  logGTMOrderDetailSubheaderContactClick({ order_number: params.orderNumber });
  void sendOrderDetailSelectContentEvent({
    orderNumber: params.orderNumber,
    interactionType: "Contact_Click",
  });
}
