"use client";

import {
  sendQuoteDetailContactEmailClickEvent,
  sendQuoteDetailExpandAllToggleEvent,
  sendQuoteDetailExpiredPanelRfqClickEvent,
  sendQuoteDetailItemMenuOpenEvent,
  sendQuoteDetailLineItemToggleEvent,
  sendQuoteDetailPageViewEvent,
  sendQuoteDetailRequestDocInitiatedEvent,
  sendQuoteDetailRequestDocsClickEvent,
  sendQuoteDetailRequestQuoteInitiatedEvent,
  sendQuoteDetailRequestUpdatedQuoteClickEvent,
  sendQuoteDetailSupportEmailClickEvent,
} from "@/lib/CDPEvents";
import {
  logGTMQuoteDetailGenerateLead,
  logGTMQuoteDetailPageView,
  logGTMQuoteDetailSelectContent,
} from "@/lib/gtm";
import type { QuoteDetailEntryPoint } from "@/lib/quote-detail-entry-point";
import type { QuoteDetailQuoteStatus } from "@/lib/types/EventTypes";

export function trackQuoteDetailPageView(params: {
  quoteNumber: string;
  entryPoint: QuoteDetailEntryPoint;
  quoteStatus: QuoteDetailQuoteStatus;
  userType: "external" | "internal";
  itemsCount: number;
  pagePath?: string;
}): void {
  logGTMQuoteDetailPageView({
    quote_number: params.quoteNumber,
    entry_point: params.entryPoint,
    quote_status: params.quoteStatus,
    user_type: params.userType,
    items_count: params.itemsCount,
    page_path: params.pagePath,
  });
  void sendQuoteDetailPageViewEvent({
    quoteNumber: params.quoteNumber,
    entryPoint: params.entryPoint,
    quoteStatus: params.quoteStatus,
    userType: params.userType,
    itemsCount: params.itemsCount,
  });
}

export function trackQuoteDetailContactEmailClick(params: {
  quoteStatus: QuoteDetailQuoteStatus;
}): void {
  logGTMQuoteDetailSelectContent({
    content_type: "contact_email",
    quote_status: params.quoteStatus,
    initiation_point: "quote_detail_header",
  });
  void sendQuoteDetailContactEmailClickEvent({
    contentType: "contact_email",
    quoteStatus: params.quoteStatus,
    initiationPoint: "quote_detail_header",
  });
}

export function trackQuoteDetailRequestDocsClick(params: {
  quoteStatus: QuoteDetailQuoteStatus;
}): void {
  logGTMQuoteDetailSelectContent({
    content_type: "request_documents_button",
    quote_status: params.quoteStatus,
    initiation_point: "quote_detail_header",
    scope: "all_items",
  });
  void sendQuoteDetailRequestDocsClickEvent({
    contentType: "request_documents_button",
    quoteStatus: params.quoteStatus,
    initiationPoint: "quote_detail_header",
    scope: "all_items",
  });
}

export function trackQuoteDetailRequestUpdatedQuoteClick(params: { itemsCount: number }): void {
  logGTMQuoteDetailGenerateLead({
    initiation_point: "quote_detail_header",
    items_count: params.itemsCount,
  });
  void sendQuoteDetailRequestUpdatedQuoteClickEvent({
    initiationPoint: "quote_detail_header",
    itemsCount: params.itemsCount,
  });
}

export function trackQuoteDetailExpiredPanelRfqClick(params: { itemsCount: number }): void {
  logGTMQuoteDetailGenerateLead({
    initiation_point: "quote_detail_expired_panel",
    items_count: params.itemsCount,
  });
  void sendQuoteDetailExpiredPanelRfqClickEvent({
    initiationPoint: "quote_detail_expired_panel",
    itemsCount: params.itemsCount,
  });
}

export function trackQuoteDetailSupportEmailClick(): void {
  logGTMQuoteDetailSelectContent({
    content_type: "support_info_panel",
    initiation_point: "quote_detail_pricing_panel",
  });
  void sendQuoteDetailSupportEmailClickEvent({
    contentType: "support_info_panel",
    initiationPoint: "quote_detail_pricing_panel",
  });
}

export function trackQuoteDetailLineItemToggle(params: {
  action: "expand" | "collapse";
  trigger: "chevron" | "row_click";
}): void {
  logGTMQuoteDetailSelectContent({
    content_type: "line_item_description",
    action: params.action,
    trigger: params.trigger,
  });
  void sendQuoteDetailLineItemToggleEvent({
    contentType: "line_item_description",
    action: params.action,
    trigger: params.trigger,
  });
}

export function trackQuoteDetailExpandAllToggle(params: {
  action: "expand_all" | "collapse_all";
  itemsCount: number;
}): void {
  logGTMQuoteDetailSelectContent({
    content_type: "expand_all_toggle",
    action: params.action,
    items_count: params.itemsCount,
  });
  void sendQuoteDetailExpandAllToggleEvent({
    contentType: "expand_all_toggle",
    action: params.action,
    itemsCount: params.itemsCount,
  });
}

export function trackQuoteDetailItemMenuOpen(params: {
  quoteStatus: QuoteDetailQuoteStatus;
}): void {
  logGTMQuoteDetailSelectContent({
    content_type: "overflow_menu",
    section: "quoted_items",
    quote_status: params.quoteStatus,
  });
  void sendQuoteDetailItemMenuOpenEvent({
    contentType: "overflow_menu",
    section: "quoted_items",
    quoteStatus: params.quoteStatus,
  });
}

export function trackQuoteDetailRequestQuoteInitiated(): void {
  logGTMQuoteDetailSelectContent({
    content_type: "overflow_menu_action",
    action: "request_quote",
    initiation_point: "quote_detail_item_menu",
  });
  void sendQuoteDetailRequestQuoteInitiatedEvent({
    contentType: "overflow_menu_action",
    action: "request_quote",
    initiationPoint: "quote_detail_item_menu",
  });
}

export function trackQuoteDetailRequestDocInitiated(params: {
  quoteStatus: QuoteDetailQuoteStatus;
}): void {
  logGTMQuoteDetailSelectContent({
    content_type: "overflow_menu_action",
    action: "request_document",
    initiation_point: "quote_detail_item_menu",
    quote_status: params.quoteStatus,
  });
  void sendQuoteDetailRequestDocInitiatedEvent({
    contentType: "overflow_menu_action",
    action: "request_document",
    initiationPoint: "quote_detail_item_menu",
    quoteStatus: params.quoteStatus,
  });
}
