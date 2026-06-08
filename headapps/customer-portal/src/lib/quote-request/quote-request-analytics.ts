"use client";

import {
  sendQuoteDrawerOpenedEvent,
  sendQuoteItemAddedEvent,
  sendQuoteItemDeletedEvent,
  sendQuoteItemEditedEvent,
  sendQuoteReorderingBannerClickEvent,
  sendQuoteRequestDiscardedEvent,
  sendQuoteRequestInitiatedEvent,
  sendQuoteRequestSubmittedEvent,
} from "@/lib/CDPEvents";
import {
  logGTMQuoteDrawerOpened,
  logGTMQuoteItemAdded,
  logGTMQuoteItemDeleted,
  logGTMQuoteItemEdited,
  logGTMQuoteReorderingBannerClick,
  logGTMQuoteRequestDiscarded,
  logGTMQuoteRequestInitiated,
  logGTMQuoteRequestSubmitted,
} from "@/lib/gtm";

export type QuoteAnalyticsInitiationPoint = "General" | "Line_Item" | "Order_Header";
export type QuoteAnalyticsButtonState = "New" | "Modify_Pending";

export function trackQuoteDrawerOpened(params: {
  initiationPoint: QuoteAnalyticsInitiationPoint;
  buttonState: QuoteAnalyticsButtonState;
}): void {
  logGTMQuoteDrawerOpened({
    initiation_point: params.initiationPoint,
    button_state: params.buttonState,
  });
  void sendQuoteDrawerOpenedEvent({
    initiationPoint: params.initiationPoint,
    buttonState: params.buttonState,
  });
}

export function trackQuoteReorderingBannerClick(): void {
  logGTMQuoteReorderingBannerClick();
  void sendQuoteReorderingBannerClickEvent();
}

export function trackQuoteItemAdded(params: {
  initiationPoint: QuoteAnalyticsInitiationPoint;
  itemCount: number;
}): void {
  logGTMQuoteItemAdded({
    initiation_point: params.initiationPoint,
    item_count: params.itemCount,
  });
  void sendQuoteItemAddedEvent({
    initiationPoint: params.initiationPoint,
    itemCount: params.itemCount,
  });
}

export function trackQuoteItemEdited(params: {
  initiationPoint: QuoteAnalyticsInitiationPoint;
}): void {
  logGTMQuoteItemEdited({
    initiation_point: params.initiationPoint,
  });
  void sendQuoteItemEditedEvent({
    initiationPoint: params.initiationPoint,
  });
}

export function trackQuoteItemDeleted(params: {
  initiationPoint: QuoteAnalyticsInitiationPoint;
  itemCount: number;
}): void {
  logGTMQuoteItemDeleted({
    initiation_point: params.initiationPoint,
    item_count: params.itemCount,
  });
  void sendQuoteItemDeletedEvent({
    initiationPoint: params.initiationPoint,
    itemCount: params.itemCount,
  });
}

export function trackQuoteRequestInitiated(params: { itemCount: number; entryTypes: string }): void {
  logGTMQuoteRequestInitiated({
    item_count: params.itemCount,
    entry_types: params.entryTypes,
  });
  void sendQuoteRequestInitiatedEvent({
    itemCount: params.itemCount,
    entryTypes: params.entryTypes,
  });
}

export function trackQuoteRequestSubmitted(params: {
  itemCount: number;
  entryTypes: string;
  requestId: string;
}): void {
  logGTMQuoteRequestSubmitted({
    item_count: params.itemCount,
    entry_types: params.entryTypes,
    request_id: params.requestId,
  });
  void sendQuoteRequestSubmittedEvent({
    itemCount: params.itemCount,
    entryTypes: params.entryTypes,
    requestId: params.requestId,
  });
}

export function trackQuoteRequestDiscarded(params: {
  itemCount: number;
  discardStep: "Entry_Form" | "Review_Step";
}): void {
  logGTMQuoteRequestDiscarded({
    item_count: params.itemCount,
    discard_step: params.discardStep,
  });
  void sendQuoteRequestDiscardedEvent({
    itemCount: params.itemCount,
    discardStep: params.discardStep,
  });
}
