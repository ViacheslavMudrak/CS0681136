"use client";

import {
  sendDocumentRequestAbandonedEvent,
  sendDocumentRequestInitiatedEvent,
  sendDocumentRequestItemRemovedEvent,
  sendDocumentRequestPanelOpenedEvent,
  sendDocumentRequestSelectContentEvent,
  sendDocumentRequestSubmissionErrorEvent,
  sendDocumentRequestSubmittedEvent,
} from "@/lib/CDPEvents";
import type { DocumentRequestEntryPoint } from "@/lib/apis/document-request-api";
import {
  logGTMDocumentRequestAbandoned,
  logGTMDocumentRequestInitiated,
  logGTMDocumentRequestItemRemoved,
  logGTMDocumentRequestPanelOpened,
  logGTMDocumentRequestSelectContent,
  logGTMDocumentRequestSubmissionError,
  logGTMDocumentRequestSubmitted,
} from "@/lib/gtm";
import type { DocumentRequestInitiationPoint } from "@/lib/types/EventTypes";

export function mapDocRequestEntryPointToInitiationPoint(
  entryPoint: DocumentRequestEntryPoint
): DocumentRequestInitiationPoint {
  if (entryPoint === "EP1") return "Listing_Line_Item";
  if (entryPoint === "EP2a") return "Detail_Header";
  return "Detail_Line_Item";
}

export function trackDocumentRequestPanelOpened(params: {
  entryPoint: DocumentRequestEntryPoint;
  itemCount: number;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestPanelOpened({
    initiation_point: initiationPoint,
    item_count: params.itemCount,
  });
  void sendDocumentRequestPanelOpenedEvent({
    type: "customerportal:DOC_REQUEST_PANEL_OPENED",
    initiationPoint,
    itemCount: params.itemCount,
  });
}

export function trackDocumentRequestDocumentTypeSelected(params: {
  entryPoint: DocumentRequestEntryPoint;
  documentType: string;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestSelectContent({
    initiation_point: initiationPoint,
    interaction_type: "document_type_selected",
    document_type: params.documentType,
  });
  void sendDocumentRequestSelectContentEvent({
    type: "customerportal:SELECT_CONTENT",
    initiationPoint,
    interactionType: "document_type_selected",
    documentType: params.documentType,
  });
}

export function trackDocumentRequestOtherDocumentTypeEntered(params: {
  entryPoint: DocumentRequestEntryPoint;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestSelectContent({
    initiation_point: initiationPoint,
    interaction_type: "other_document_type_entered",
  });
  void sendDocumentRequestSelectContentEvent({
    type: "customerportal:SELECT_CONTENT",
    initiationPoint,
    interactionType: "other_document_type_entered",
  });
}

export function trackDocumentRequestItemRemoved(params: {
  entryPoint: DocumentRequestEntryPoint;
  itemCount: number;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestItemRemoved({
    initiation_point: initiationPoint,
    item_count: params.itemCount,
  });
  void sendDocumentRequestItemRemovedEvent({
    type: "customerportal:DOC_REQUEST_ITEM_REMOVED",
    initiationPoint,
    itemCount: params.itemCount,
  });
}

export function trackDocumentRequestAbandoned(params: {
  entryPoint: DocumentRequestEntryPoint;
  itemCount: number;
  documentTypeSelected: boolean;
  hadNotes: boolean;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestAbandoned({
    initiation_point: initiationPoint,
    item_count: params.itemCount,
    document_type_selected: params.documentTypeSelected,
    had_notes: params.hadNotes,
  });
  void sendDocumentRequestAbandonedEvent({
    type: "customerportal:DOC_REQUEST_ABANDONED",
    initiationPoint,
    itemCount: params.itemCount,
    documentTypeSelected: params.documentTypeSelected,
    hadNotes: params.hadNotes,
  });
}

export function trackDocumentRequestPanelDismissed(params: {
  entryPoint: DocumentRequestEntryPoint;
  itemCount: number;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestSelectContent({
    initiation_point: initiationPoint,
    interaction_type: "doc_request_panel_dismissed",
    item_count: params.itemCount,
  });
  void sendDocumentRequestSelectContentEvent({
    type: "customerportal:SELECT_CONTENT",
    initiationPoint,
    interactionType: "doc_request_panel_dismissed",
    itemCount: params.itemCount,
  });
}

export function trackDocumentRequestInitiated(params: {
  entryPoint: DocumentRequestEntryPoint;
  itemCount: number;
  documentType: string;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestInitiated({
    initiation_point: initiationPoint,
    item_count: params.itemCount,
    document_type: params.documentType,
  });
  void sendDocumentRequestInitiatedEvent({
    type: "customerportal:DOC_REQUEST_INITIATED",
    initiationPoint,
    itemCount: params.itemCount,
    documentType: params.documentType,
  });
}

export function trackDocumentRequestSubmitted(params: {
  entryPoint: DocumentRequestEntryPoint;
  itemCount: number;
  documentType: string;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestSubmitted({
    initiation_point: initiationPoint,
    item_count: params.itemCount,
    document_type: params.documentType,
  });
  void sendDocumentRequestSubmittedEvent({
    type: "customerportal:DOC_REQUEST_SUBMITTED",
    initiationPoint,
    itemCount: params.itemCount,
    documentType: params.documentType,
  });
}

export function trackDocumentRequestSubmissionError(params: {
  entryPoint: DocumentRequestEntryPoint;
  itemCount: number;
  errorType: string;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestSubmissionError({
    initiation_point: initiationPoint,
    item_count: params.itemCount,
    error_type: params.errorType,
  });
  void sendDocumentRequestSubmissionErrorEvent({
    type: "customerportal:DOC_REQUEST_SUBMISSION_ERROR",
    initiationPoint,
    itemCount: params.itemCount,
    errorType: params.errorType,
  });
}

export function trackDocumentRequestConfirmationClosed(params: {
  entryPoint: DocumentRequestEntryPoint;
}): void {
  const initiationPoint = mapDocRequestEntryPointToInitiationPoint(params.entryPoint);
  logGTMDocumentRequestSelectContent({
    initiation_point: initiationPoint,
    interaction_type: "doc_request_confirmation_closed",
  });
  void sendDocumentRequestSelectContentEvent({
    type: "customerportal:SELECT_CONTENT",
    initiationPoint,
    interactionType: "doc_request_confirmation_closed",
  });
}
