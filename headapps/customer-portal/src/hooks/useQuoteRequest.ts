"use client";

import { useToast } from "@/components/shared/toast/ToastProvider";
import type { QuoteSelectionFieldSource } from "@/components/core/OrderManagement/OrderManagement.type";
import type { QuoteRequestGeneralFieldErrors } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import { getOrderDetail } from "@/lib/apis/order-detail-api";
import {
  fetchQuoteRequestDraft,
  saveQuoteRequestDraft,
  submitQuoteRequest,
} from "@/lib/apis/request-quote-api";
import {
  useQuoteRequestDraftContext,
 } from "@/contexts/QuoteRequestDraftContext";
import type { OrderLineItem, OrderListItem } from "@/lib/apis/orders-api";
import { mapOrderDetailApiToOrderListItemAndLines } from "@/lib/orderDetailUtils";
import {
  clearQuoteRequestDraftForAccount,
  writeQuoteRequestDraftForAccount,
} from "@/lib/quote-request/quote-request-local-storage";
import type {
  QuoteRequestDraftDto,
  QuoteRequestGeneralQuoteItem,
  QuoteRequestOrderQuoteItem,
  QuoteRequestOrderQuoteLineItem,
  QuoteRequestSingleLineQuoteItem,
} from "@/lib/quote-request/request-quote.types";
import {
  trackQuoteDrawerOpened,
  trackQuoteItemAdded,
  trackQuoteItemDeleted,
  trackQuoteItemEdited,
  trackQuoteReorderingBannerClick,
  trackQuoteRequestDiscarded,
  trackQuoteRequestInitiated,
  trackQuoteRequestSubmitted,
} from "@/lib/quote-request/quote-request-analytics";
import { buildSyntheticOrderListItemForQuoteRequest } from "@/lib/quote-detail-synthetic-order";
import {
  buildLineQuoteItem,
  buildOrderQuoteLineFromOrderLine,
  countQuoteQueueItems,
  createEmptyQuoteRequestDraft,
  getQuoteRequestCmsFields,
  getQuoteRequestEntryTypesCsv,
  findOrProjectSingleLineItemByKey,
  findOrderQuoteLineIndexForListLine,
  findSingleLineQuoteItemForListLine,
  lineItemKeyInDraft,
  makeLineItemQueueKey,
  nextOrderQuoteBlockSequence,
  nextSequence,
  orderQuoteLineToOrderAndLine,
  renumberGeneral,
  renumberLineItems,
  rowToFormLine,
} from "@/lib/quote-request/quote-request-utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type SetStateAction } from "react";

/** Same matching rules as `findSingleLineQuoteItemForListLine` (dedupe when moving a line into `orderQuote`). */
function singleLineQuoteItemMatchesListLine(
  q: QuoteRequestSingleLineQuoteItem,
  orderHeaderIdNum: number,
  listLineItemKey: string,
  line: OrderLineItem
): boolean {
  return Boolean(findSingleLineQuoteItemForListLine([q], orderHeaderIdNum, listLineItemKey, line));
}

export type { QuoteRequestGeneralFieldErrors } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";

export type QuoteRequestStep = "general" | "lineItem" | "review" | "confirmation";

export type { PersistQuoteDraftResult } from "@/contexts/QuoteRequestDraftContext";

export type TrackQuoteOpen = (
  initiationPoint: "Header" | "Line Item" | "OrderDetailHeader",
  requestMode: "Bulk" | "Single" | "AllOrderLines"
) => void;

export interface UseQuoteRequestParams {
  accountId: string;
  accountNumeric: number;
  fields: QuoteSelectionFieldSource;
  hasOrdersHistory: boolean;
  ordersTabHref: string;
  onTrackQuoteOpen?: TrackQuoteOpen;
}

export function useQuoteRequest({
  accountId: accountIdParam,
  accountNumeric: accountNumericParam,
  fields,
  hasOrdersHistory,
  ordersTabHref,
  onTrackQuoteOpen,
}: UseQuoteRequestParams) {
  const router = useRouter();
  const {
    draft,
    setDraft,
    persistDraft,
    accountId: sharedAccountId,
    accountNumeric: sharedAccountNumeric,
    userEmail,
  } = useQuoteRequestDraftContext();
  const accountId = accountIdParam || sharedAccountId;
  const accountNumeric = accountNumericParam || sharedAccountNumeric;
  const { showToast } = useToast();
  const quoteCms = useMemo(() => getQuoteRequestCmsFields(fields), [fields]);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<QuoteRequestStep>("general");
  const [generalForm, setGeneralForm] = useState({
    application: "",
    productDetails: "",
    comments: "",
  });
  /** When editing a general row from review, the sequence to replace. */
  const [editingGeneralSequence, setEditingGeneralSequence] = useState<number | null>(null);
  const [lineForm, setLineForm] = useState<{
    order: OrderListItem;
    line: OrderLineItem;
    comments: string;
    editingLineSequence: number | null;
    editingOrderQuoteLine: { orderHeaderId: number; lineIndex: number } | null;
  } | null>(null);
  const [reviewAdditional, setReviewAdditional] = useState("");
  const [generalFieldErrors, setGeneralFieldErrors] = useState<QuoteRequestGeneralFieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingOrderLines, setIsFetchingOrderLines] = useState(false);

  const setGeneralFormWithClear = useCallback(
    (value: SetStateAction<{ application: string; productDetails: string; comments: string }>) => {
      setGeneralForm(value);
      setGeneralFieldErrors({});
    },
    []
  );
  const [discardOpen, setDiscardOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  /**
   * When set, Review step shows the “all lines from this order” intro + compact line cards
   * (Create quote from order on Order Detail).
   */
  const [orderHeaderReview, setOrderHeaderReview] = useState<{
    poNumber: string;
    orderNumber: string;
    orderHeaderId: number;
  } | null>(null);

  const queueItemCount = useMemo(() => countQuoteQueueItems(draft), [draft]);
  const hasPendingDraft = queueItemCount > 0;

  const getLineItemByKey = useCallback(
    (lineKey: string) => findOrProjectSingleLineItemByKey(draft, lineKey),
    [draft]
  );

  const lineKeyInQueue = useCallback(
    (lineKey: string) => lineItemKeyInDraft(draft, lineKey),
    [draft]
  );

  /** `true` when the order has a full `orderQuote` block (e.g. “create quote from order” on detail). */
  const isOrderHeaderInOrderQuoteDraft = useCallback(
    (orderHeaderId: string | number) => {
      const n = Number(orderHeaderId) || 0;
      if (!n) return false;
      return draft.orderQuote.quoteItems.some((o) => o.orderHeaderId === n);
    },
    [draft]
  );

  /**
   * For Order Management (and any `makeLineItemQueueKey(orderHeaderId, line.id)`): treat the whole
   * order as “in the quote draft” if there is an `orderQuote` block, else fall back to single-line queue.
   */
  const lineInQuoteDraftForListLine = useCallback(
    (orderHeaderId: string, lineKey: string) => {
      const n = Number(orderHeaderId) || 0;
      if (n && draft.orderQuote.quoteItems.some((o) => o.orderHeaderId === n)) {
        return true;
      }
      return lineItemKeyInDraft(draft, lineKey);
    },
    [draft]
  );

  const resetFormState = useCallback(() => {
    setGeneralForm({ application: "", productDetails: "", comments: "" });
    setEditingGeneralSequence(null);
    setLineForm(null);
    setGeneralFieldErrors({});
    setOrderHeaderReview(null);
  }, []);

  const closeDrawer = useCallback(() => {
    if (step === "confirmation" && accountId) {
      clearQuoteRequestDraftForAccount(accountId);
      setDraft(createEmptyQuoteRequestDraft(accountNumeric));
      setSubmitError(null);
      setSubmittedRequestId(null);
      setIsSubmittingRequest(false);
      setReviewAdditional("");
      setStep("general");
      resetFormState();
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    resetFormState();
  }, [accountId, accountNumeric, resetFormState, step]);

  const showDraftToast = useCallback(() => {
    const title = quoteCms?.DraftToastTitle?.value
      ? String(quoteCms.DraftToastTitle.value).trim()
      : "";
    const messageField = quoteCms?.DraftToastBody;
    const message = messageField?.value ? String(messageField.value).trim() : "";
    if (!title && !message) return;
    showToast({
      title: title || undefined,
      messageField,
      type: "success",
    });
  }, [quoteCms?.DraftToastBody, quoteCms?.DraftToastTitle, showToast]);

  const showDraftSaveError = useCallback(
    (message: string) => {
      showToast({ message, type: "error" });
    },
    [showToast]
  );

  const openFromHeader = useCallback(() => {
    onTrackQuoteOpen?.("Header", "Bulk");
    trackQuoteDrawerOpened({
      initiationPoint: "General",
      buttonState: hasPendingDraft ? "Modify_Pending" : "New",
    });
    resetFormState();
    setSubmitError(null);
    setSubmittedRequestId(null);
    setIsSubmittingRequest(false);
    setStep(hasPendingDraft ? "review" : "general");
    setIsOpen(true);
  }, [hasPendingDraft, onTrackQuoteOpen, resetFormState]);

  const openFromQuoteRow = useCallback(() => {
    onTrackQuoteOpen?.("Line Item", "Single");
    trackQuoteDrawerOpened({
      initiationPoint: "Line_Item",
      buttonState: hasPendingDraft ? "Modify_Pending" : "New",
    });
    resetFormState();
    setSubmitError(null);
    setSubmittedRequestId(null);
    setIsSubmittingRequest(false);
    setStep(hasPendingDraft ? "review" : "general");
    setIsOpen(true);
  }, [hasPendingDraft, onTrackQuoteOpen, resetFormState]);

  const openFromLineItem = useCallback(
    (order: OrderListItem, line: OrderLineItem) => {
      onTrackQuoteOpen?.("Line Item", "Single");
      const key = makeLineItemQueueKey(String(order.orderHeaderId), line.id);
      const orderHeaderIdNum = Number(order.orderHeaderId) || 0;
      const orderBlock = draft.orderQuote.quoteItems.find(
        (o) => o.orderHeaderId === orderHeaderIdNum
      );
      const lineIndexInOrder = orderBlock
        ? findOrderQuoteLineIndexForListLine(orderBlock, key, line)
        : -1;
      const existing = findSingleLineQuoteItemForListLine(
        draft.singleLineItem.quoteItems,
        orderHeaderIdNum,
        key,
        line
      );
      resetFormState();
      setSubmitError(null);
      setSubmittedRequestId(null);
      setIsSubmittingRequest(false);
      if (orderBlock && lineIndexInOrder >= 0) {
        const li = orderBlock.lineItems[lineIndexInOrder];
        setLineForm({
          order,
          line,
          comments: li.comments?.trim() ?? "",
          editingLineSequence: null,
          editingOrderQuoteLine: {
            orderHeaderId: orderBlock.orderHeaderId,
            lineIndex: lineIndexInOrder,
          },
        });
      } else if (orderBlock) {
        // Append a line back onto an existing “quote from order” block (e.g. after some lines were removed).
        setLineForm({
          order,
          line,
          comments: existing?.comments?.trim() ?? "",
          editingLineSequence: null,
          editingOrderQuoteLine: { orderHeaderId: orderBlock.orderHeaderId, lineIndex: -1 },
        });
      } else if (existing) {
        setLineForm({
          order,
          line,
          comments: existing.comments,
          editingLineSequence: existing.sequence,
          editingOrderQuoteLine: null,
        });
      } else {
        setLineForm({
          order,
          line,
          comments: "",
          editingLineSequence: null,
          editingOrderQuoteLine: null,
        });
      }
      setStep("lineItem");
      setIsOpen(true);
      const isLineModify = Boolean(orderBlock) || Boolean(existing);
      trackQuoteDrawerOpened({
        initiationPoint: "Line_Item",
        buttonState: isLineModify ? "Modify_Pending" : "New",
      });
    },
    [draft, onTrackQuoteOpen, resetFormState]
  );

  /**
   * Order Detail “Create quote from order”: one {@link orderQuote} block for the full order.
   * Removes **all** {@link singleLineItem} rows for this `orderHeaderId`. Comments from those
   * rows are applied to the new block by exact key when possible, else by part-number match to
   * `lines` from the detail API. Other orders’ single-line rows are unchanged.
   *
   * When a block for this order already exists (Modify Quote From Order), **line membership**
   * comes from the saved draft so removed lines stay removed; each kept line is refreshed from
   * `lines` when the order line still exists (by key or part/qty fallback).
   */
  const openFromOrderDetailHeader = useCallback(
    (order: OrderListItem, lines: OrderLineItem[]) => {
      onTrackQuoteOpen?.("OrderDetailHeader", "AllOrderLines");
      setSubmitError(null);
      setSubmittedRequestId(null);
      setIsSubmittingRequest(false);
      setLineForm(null);
      setGeneralFieldErrors({});
      setGeneralForm({ application: "", productDetails: "", comments: "" });
      setEditingGeneralSequence(null);
      let next: QuoteRequestDraftDto = { ...draft };
      const oh = String(order.orderHeaderId);
      const orderHeaderIdNum = Number(order.orderHeaderId) || 0;
      const keysInOrder = new Set(lines.map((l) => makeLineItemQueueKey(oh, l.id)));

      const existingBlock = next.orderQuote.quoteItems.find(
        (o) => o.orderHeaderId === orderHeaderIdNum
      );
      const commentByKey = new Map<string, string>();
      if (existingBlock) {
        for (const li of existingBlock.lineItems) {
          if (li.lineItemKey && (li.comments?.trim() ?? "") !== "") {
            commentByKey.set(li.lineItemKey, li.comments!.trim());
          }
        }
      }
      for (const q of next.singleLineItem.quoteItems) {
        if (Number(q.orderHeaderId) !== orderHeaderIdNum) continue;
        const c = q.comments?.trim() ?? "";
        if (q.lineItemKey && keysInOrder.has(q.lineItemKey) && c) {
          commentByKey.set(q.lineItemKey, c);
          continue;
        }
        if (!c) continue;
        const line = lines.find(
          (l) =>
            (l.intraloxPartNumber?.trim() ?? "") === (q.intraloxPartNumber?.trim() ?? "") &&
            (l.customerPartNumber?.trim() ?? "") === (q.customerPartNumber?.trim() ?? "")
        );
        if (line) {
          const k = makeLineItemQueueKey(oh, line.id);
          commentByKey.set(k, c);
        }
      }

      const orderLineByKey = new Map(lines.map((l) => [makeLineItemQueueKey(oh, l.id), l]));

      let lineItems: QuoteRequestOrderQuoteLineItem[];
      if (existingBlock) {
        lineItems = existingBlock.lineItems.map((existingLi) => {
          const keyFromRow = existingLi.lineItemKey;
          let orderLine: OrderLineItem | undefined = keyFromRow
            ? orderLineByKey.get(keyFromRow)
            : undefined;
          if (!orderLine && keyFromRow) {
            const pipe = keyFromRow.indexOf("|");
            const lineId = pipe >= 0 ? keyFromRow.slice(pipe + 1) : keyFromRow;
            orderLine = lines.find((l) => String(l.id) === lineId);
          }
          if (!orderLine) {
            orderLine = lines.find(
              (l) =>
                (l.intraloxPartNumber ?? "").trim() ===
                  (existingLi.intraloxPartNumber ?? "").trim() &&
                (l.customerPartNumber ?? "").trim() ===
                  (existingLi.customerPartNumber ?? "").trim() &&
                (l.quantity ?? 0) === (existingLi.quantity?.value ?? 0)
            );
          }
          if (orderLine) {
            const k = makeLineItemQueueKey(oh, orderLine.id);
            const mergedComments =
              commentByKey.get(k) ??
              (keyFromRow ? commentByKey.get(keyFromRow) : undefined) ??
              existingLi.comments ??
              "";
            return {
              ...buildOrderQuoteLineFromOrderLine(orderLine, k, mergedComments),
              quoteOrderLineItemId: existingLi.quoteOrderLineItemId ?? 0,
            };
          }
          return {
            ...existingLi,
            comments:
              (keyFromRow ? commentByKey.get(keyFromRow) : undefined) ?? existingLi.comments,
          };
        });
      } else {
        lineItems = lines.map((line) => {
          const k = makeLineItemQueueKey(oh, line.id);
          return {
            ...buildOrderQuoteLineFromOrderLine(line, k, commentByKey.get(k) ?? ""),
            quoteOrderLineItemId: 0,
          };
        });
      }

      const newBlock: QuoteRequestOrderQuoteItem = {
        quoteOrderItemId: existingBlock?.quoteOrderItemId ?? 0,
        poNumber: order.poNumber ?? "",
        orderNumber: String(order.orderNumber ?? ""),
        orderHeaderId: orderHeaderIdNum,
        sequence: existingBlock?.sequence ?? nextOrderQuoteBlockSequence(next),
        lineItems,
      };

      const otherOrders = next.orderQuote.quoteItems.filter(
        (o) => o.orderHeaderId !== orderHeaderIdNum
      );
      next = {
        ...next,
        singleLineItem: {
          quoteItems: renumberLineItems(
            next.singleLineItem.quoteItems.filter(
              (q) => Number(q.orderHeaderId) !== orderHeaderIdNum
            )
          ),
        },
        orderQuote: {
          quoteItems: [...otherOrders, newBlock],
        },
      };
      void (async () => {
        setIsSaving(true);
        setIsOpen(true);
        try {
          const result = await persistDraft(next);
          if (!result.ok) {
            showDraftSaveError(result.errorMessage);
            setIsOpen(false);
            return;
          }
          setReviewAdditional(result.draft.additionalComments ?? "");
          setOrderHeaderReview({
            poNumber: order.poNumber?.trim() ?? "",
            orderNumber: String(order.orderNumber ?? "").trim(),
            orderHeaderId: orderHeaderIdNum,
          });
          setStep("review");
          setIsOpen(true);
          trackQuoteDrawerOpened({
            initiationPoint: "Order_Header",
            buttonState: existingBlock ? "Modify_Pending" : "New",
          });
          trackQuoteItemAdded({
            initiationPoint: "Order_Header",
            itemCount: countQuoteQueueItems(result.draft),
          });
        } finally {
          setIsSaving(false);
        }
      })();
    },
    [draft, onTrackQuoteOpen, persistDraft, showDraftSaveError]
  );

  const openFromQuoteDetailAllLines = useCallback(
    (quoteId: string, quoteNumber: string, lines: OrderLineItem[]) => {
      const order = buildSyntheticOrderListItemForQuoteRequest(quoteId, quoteNumber, lines.length);
      openFromOrderDetailHeader(order, lines);
    },
    [openFromOrderDetailHeader]
  );

  /**
   * Opens review for an existing `orderQuote` block without fetching lines or rebuilding the draft.
   */
  const openOrderQuoteDraftForReview = useCallback(
    (orderHeaderId: string | number, orderMeta?: { poNumber?: string; orderNumber?: string }) => {
      const orderHeaderIdNum = Number(orderHeaderId) || 0;
      if (!orderHeaderIdNum) return;
      const existingBlock = draft.orderQuote.quoteItems.find(
        (o) => o.orderHeaderId === orderHeaderIdNum
      );
      if (!existingBlock) return;

      onTrackQuoteOpen?.("OrderDetailHeader", "AllOrderLines");
      setSubmitError(null);
      setSubmittedRequestId(null);
      setIsSubmittingRequest(false);
      setLineForm(null);
      setGeneralFieldErrors({});
      setReviewAdditional(draft.additionalComments ?? "");
      setOrderHeaderReview({
        poNumber: orderMeta?.poNumber?.trim() ?? existingBlock.poNumber?.trim() ?? "",
        orderNumber:
          orderMeta?.orderNumber?.trim() ?? String(existingBlock.orderNumber ?? "").trim(),
        orderHeaderId: orderHeaderIdNum,
      });
      setStep("review");
      setIsOpen(true);
      trackQuoteDrawerOpened({
        initiationPoint: "Order_Header",
        buttonState: "Modify_Pending",
      });
    },
    [draft, onTrackQuoteOpen]
  );

  /**
   * Opens the quote drawer immediately, loads lines via order detail, then seeds the draft
   * (recent-quote dashboard rows where line items are not on the list payload).
   */
  const openFromQuoteDetailAllLinesWithFetch = useCallback(
    async (quoteId: string, quoteNumber: string, orderHeaderId: number) => {
      onTrackQuoteOpen?.("OrderDetailHeader", "AllOrderLines");
      setSubmitError(null);
      setSubmittedRequestId(null);
      setIsSubmittingRequest(false);
      setIsOpen(true);
      setIsFetchingOrderLines(true);
      try {
        const res = await getOrderDetail({ orderHeaderId, accountId: accountNumeric });
        if (!res.success || !res.data) {
          closeDrawer();
          return;
        }
        const { lines } = mapOrderDetailApiToOrderListItemAndLines(res.data);
        if (lines.length === 0) {
          closeDrawer();
          return;
        }
        openFromQuoteDetailAllLines(quoteId, quoteNumber, lines);
      } finally {
        setIsFetchingOrderLines(false);
      }
    },
    [accountNumeric, closeDrawer, onTrackQuoteOpen, openFromQuoteDetailAllLines]
  );

  const openFromQuoteDetailSingleLine = useCallback(
    (quoteId: string, quoteNumber: string, line: OrderLineItem) => {
      const order = buildSyntheticOrderListItemForQuoteRequest(quoteId, quoteNumber, 1);
      openFromLineItem(order, line);
    },
    [openFromLineItem]
  );

  const onCancelLineStep = useCallback(() => {
    if (lineForm?.editingLineSequence != null || lineForm?.editingOrderQuoteLine != null) {
      setLineForm(null);
      setStep("review");
    } else {
      closeDrawer();
    }
  }, [lineForm, closeDrawer]);

  const onContinueGeneral = useCallback(async () => {
    const applicationRequired = (quoteCms?.ApplicationRequiredIndicator?.value ?? false) === true;
    const productDetailsRequired = (quoteCms?.ProductDetailsIndicator?.value ?? false) === true;
    const commentsRequired =
      (quoteCms?.GeneralEntryCommentsRequiredIndicator?.value ?? false) === true;

    const nextErrors: QuoteRequestGeneralFieldErrors = {};
    if (applicationRequired && !generalForm.application.trim()) {
      nextErrors.application =
        String(quoteCms?.ApplicationLabel?.value ?? "Application") + " is required";
    }
    if (productDetailsRequired && !generalForm.productDetails.trim()) {
      nextErrors.productDetails =
        String(quoteCms?.ProductDetailsLabel?.value ?? "Product details") + " is required";
    }
    if (commentsRequired && !generalForm.comments.trim()) {
      nextErrors.comments =
        String(quoteCms?.GeneralEntryCommentsFieldLabel?.value ?? "Comments") + " is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setGeneralFieldErrors(nextErrors);
      return;
    }
    setGeneralFieldErrors({});
    let next: QuoteRequestDraftDto = { ...draft };
    if (editingGeneralSequence != null) {
      const items = next.general.quoteItems.map((x) =>
        x.sequence === editingGeneralSequence
          ? {
              ...x,
              application: generalForm.application.trim(),
              productDetails: generalForm.productDetails.trim(),
              comments: generalForm.comments.trim(),
            }
          : x
      );
      next = { ...next, general: { quoteItems: renumberGeneral(items) } };
    } else {
      const item: QuoteRequestGeneralQuoteItem = {
        quoteGeneralItemId: 0,
        application: generalForm.application.trim(),
        productDetails: generalForm.productDetails.trim(),
        comments: generalForm.comments.trim(),
        sequence: nextSequence(next),
      };
      next = {
        ...next,
        general: { quoteItems: renumberGeneral([...next.general.quoteItems, item]) },
      };
    }

    setIsSaving(true);
    try {
      const result = await persistDraft(next);
      if (!result.ok) {
        showDraftSaveError(result.errorMessage);
        return;
      }
      if (editingGeneralSequence != null) {
        trackQuoteItemEdited({ initiationPoint: "General" });
      } else {
        trackQuoteItemAdded({
          initiationPoint: "General",
          itemCount: countQuoteQueueItems(result.draft),
        });
      }
      showDraftToast();
      setGeneralForm({ application: "", productDetails: "", comments: "" });
      setEditingGeneralSequence(null);
      setStep("review");
    } finally {
      setIsSaving(false);
    }
  }, [
    draft,
    editingGeneralSequence,
    generalForm,
    persistDraft,
    quoteCms,
    showDraftSaveError,
    showDraftToast,
  ]);

  const onContinueLine = useCallback(async () => {
    if (!lineForm) return;
    const { order, line, comments, editingLineSequence, editingOrderQuoteLine } = lineForm;
    let next = { ...draft };
    if (editingOrderQuoteLine) {
      const { orderHeaderId, lineIndex } = editingOrderQuoteLine;
      const c = comments.trim();
      const listKey = makeLineItemQueueKey(String(order.orderHeaderId), line.id);
      if (lineIndex < 0) {
        const newLi = buildOrderQuoteLineFromOrderLine(line, listKey, c);
        next = {
          ...next,
          singleLineItem: {
            quoteItems: renumberLineItems(
              next.singleLineItem.quoteItems.filter(
                (q) => !singleLineQuoteItemMatchesListLine(q, orderHeaderId, listKey, line)
              )
            ),
          },
          orderQuote: {
            quoteItems: next.orderQuote.quoteItems.map((o) => {
              if (o.orderHeaderId !== orderHeaderId) return o;
              const dupIdx = findOrderQuoteLineIndexForListLine(o, listKey, line);
              if (dupIdx >= 0) {
                return {
                  ...o,
                  lineItems: o.lineItems.map((li, i) =>
                    i === dupIdx ? { ...li, comments: c } : li
                  ),
                };
              }
              return { ...o, lineItems: [...o.lineItems, newLi] };
            }),
          },
        };
      } else {
        next = {
          ...next,
          orderQuote: {
            quoteItems: next.orderQuote.quoteItems.map((o) => {
              if (o.orderHeaderId !== orderHeaderId) return o;
              return {
                ...o,
                lineItems: o.lineItems.map((li, i) =>
                  i === lineIndex ? { ...li, comments: c } : li
                ),
              };
            }),
          },
        };
      }
    } else if (editingLineSequence != null) {
      const items = next.singleLineItem.quoteItems.map((q) => {
        if (q.sequence !== editingLineSequence) return q;
        return { ...q, comments: comments.trim() };
      });
      next = { ...next, singleLineItem: { quoteItems: renumberLineItems(items) } };
    } else {
      const item = buildLineQuoteItem(order, line, nextSequence(next), comments.trim());
      next = {
        ...next,
        singleLineItem: {
          quoteItems: renumberLineItems([...next.singleLineItem.quoteItems, item]),
        },
      };
    }
    setIsSaving(true);
    try {
      const result = await persistDraft(next);
      if (!result.ok) {
        showDraftSaveError(result.errorMessage);
        return;
      }
      if (editingOrderQuoteLine) {
        if (editingOrderQuoteLine.lineIndex < 0) {
          trackQuoteItemAdded({
            initiationPoint: "Line_Item",
            itemCount: countQuoteQueueItems(result.draft),
          });
        } else {
          trackQuoteItemEdited({ initiationPoint: "Order_Header" });
        }
      } else if (editingLineSequence != null) {
        trackQuoteItemEdited({ initiationPoint: "Line_Item" });
      } else {
        trackQuoteItemAdded({
          initiationPoint: "Line_Item",
          itemCount: countQuoteQueueItems(result.draft),
        });
      }
      showDraftToast();
      setLineForm(null);
      setStep("review");
    } finally {
      setIsSaving(false);
    }
  }, [draft, lineForm, persistDraft, showDraftSaveError, showDraftToast]);

  const onAddAnother = useCallback(() => {
    setGeneralForm({ application: "", productDetails: "", comments: "" });
    setGeneralFieldErrors({});
    setEditingGeneralSequence(null);
    setLineForm(null);
    setStep("general");
  }, []);

  const onSearchOrders = useCallback(() => {
    trackQuoteReorderingBannerClick();
    closeDrawer();
    router.push(ordersTabHref);
  }, [closeDrawer, ordersTabHref, router]);

  const onDeleteItem = useCallback(
    async (kind: "general" | "singleLineItem", sequence: number) => {
      setIsSaving(true);
      try {
        const initiationPoint = kind === "general" ? "General" : "Line_Item";
        let next = { ...draft };
        if (kind === "general") {
          next = {
            ...next,
            general: {
              quoteItems: renumberGeneral(
                next.general.quoteItems.filter((x) => x.sequence !== sequence)
              ),
            },
          };
        } else {
          next = {
            ...next,
            singleLineItem: {
              quoteItems: renumberLineItems(
                next.singleLineItem.quoteItems.filter((x) => x.sequence !== sequence)
              ),
            },
          };
        }
        const remaining = countQuoteQueueItems(next);
        if (remaining === 0) {
          const result = await persistDraft(createEmptyQuoteRequestDraft(accountNumeric));
          if (!result.ok) {
            showDraftSaveError(result.errorMessage);
            return;
          }
          trackQuoteItemDeleted({ initiationPoint, itemCount: 0 });
          setIsOpen(false);
          resetFormState();
        } else {
          const result = await persistDraft(next);
          if (!result.ok) {
            showDraftSaveError(result.errorMessage);
            return;
          }
          trackQuoteItemDeleted({ initiationPoint, itemCount: remaining });
        }
      } finally {
        setIsSaving(false);
      }
    },
    [accountNumeric, draft, persistDraft, resetFormState, showDraftSaveError]
  );

  const onEditGeneral = useCallback(
    (sequence: number) => {
      const row = draft.general.quoteItems.find((x) => x.sequence === sequence);
      if (!row) return;
      setGeneralFieldErrors({});
      setGeneralForm({
        application: row.application,
        productDetails: row.productDetails,
        comments: row.comments,
      });
      setEditingGeneralSequence(sequence);
      setStep("general");
    },
    [draft.general.quoteItems]
  );

  const onEditLine = useCallback(
    (sequence: number) => {
      const row = draft.singleLineItem.quoteItems.find((x) => x.sequence === sequence);
      if (!row) return;
      const { order, line } = rowToFormLine(row);
      setLineForm({
        order,
        line,
        comments: row.comments,
        editingLineSequence: sequence,
        editingOrderQuoteLine: null,
      });
      setStep("lineItem");
    },
    [draft.singleLineItem.quoteItems]
  );

  const onEditOrderQuoteLine = useCallback(
    (orderHeaderId: number, lineIndex: number) => {
      const block = draft.orderQuote.quoteItems.find((o) => o.orderHeaderId === orderHeaderId);
      if (!block) return;
      const li = block.lineItems[lineIndex];
      if (!li) return;
      const { order, line } = orderQuoteLineToOrderAndLine(block, li);
      setLineForm({
        order,
        line,
        comments: li.comments?.trim() ?? "",
        editingLineSequence: null,
        editingOrderQuoteLine: { orderHeaderId, lineIndex },
      });
      setStep("lineItem");
    },
    [draft.orderQuote.quoteItems]
  );

  const onDeleteOrderQuoteLine = useCallback(
    async (orderHeaderId: number, lineIndex: number) => {
      setIsSaving(true);
      try {
        let next = { ...draft };
        const oi = next.orderQuote.quoteItems.findIndex((o) => o.orderHeaderId === orderHeaderId);
        if (oi < 0) return;
        const block = next.orderQuote.quoteItems[oi];
        const newLines = block.lineItems.filter((_, i) => i !== lineIndex);
        const quoteItems =
          newLines.length === 0
            ? next.orderQuote.quoteItems.filter((_, i) => i !== oi)
            : next.orderQuote.quoteItems.map((o, i) =>
                i === oi ? { ...block, lineItems: newLines } : o
              );
        next = { ...next, orderQuote: { quoteItems } };
        if (orderHeaderReview?.orderHeaderId === orderHeaderId) {
          const stillHas = next.orderQuote.quoteItems.some(
            (o) => o.orderHeaderId === orderHeaderId
          );
          if (!stillHas) {
            setOrderHeaderReview(null);
          }
        }
        const remaining = countQuoteQueueItems(next);
        if (remaining === 0) {
          const result = await persistDraft(createEmptyQuoteRequestDraft(accountNumeric));
          if (!result.ok) {
            showDraftSaveError(result.errorMessage);
            return;
          }
          trackQuoteItemDeleted({ initiationPoint: "Order_Header", itemCount: 0 });
          setIsOpen(false);
          resetFormState();
        } else {
          const result = await persistDraft(next);
          if (!result.ok) {
            showDraftSaveError(result.errorMessage);
            return;
          }
          trackQuoteItemDeleted({ initiationPoint: "Order_Header", itemCount: remaining });
        }
      } finally {
        setIsSaving(false);
      }
    },
    [accountNumeric, draft, orderHeaderReview, persistDraft, resetFormState, showDraftSaveError]
  );

  const onConfirmDiscard = useCallback(async () => {
    if (!accountId) return;
    setIsSaving(true);
    try {
      const preDiscardCount = countQuoteQueueItems(draft);
      const discardStep: "Entry_Form" | "Review_Step" =
        step === "review" ? "Review_Step" : "Entry_Form";
      const empty = createEmptyQuoteRequestDraft(accountNumeric);
      const result = await persistDraft(empty);
      if (!result.ok) {
        showDraftSaveError(result.errorMessage);
        return;
      }
      setSubmitError(null);
      setSubmittedRequestId(null);
      setIsSubmittingRequest(false);
      setDiscardOpen(false);
      setIsOpen(false);
      resetFormState();
      trackQuoteRequestDiscarded({
        itemCount: preDiscardCount,
        discardStep,
      });
    } finally {
      setIsSaving(false);
    }
  }, [accountId, accountNumeric, draft, persistDraft, resetFormState, showDraftSaveError, step]);

  const onUpdateReviewNotes = useCallback(
    (value: string) => {
      setReviewAdditional(value);
      setDraft((d) => {
        const next = { ...d, additionalComments: value };
        if (accountId) writeQuoteRequestDraftForAccount(accountId, next);
        return next;
      });
    },
    [accountId]
  );

  useEffect(() => {
    if (isOpen && step === "review") {
      setReviewAdditional(draft.additionalComments ?? "");
    }
  }, [isOpen, step, draft.additionalComments]);

  /**
   * Awaits submit; `isSubmittingRequest` stays true until this handler finishes (including
   * post-success draft refetch). The confirmation step is shown only when `result.success` is true.
   */
  const onSubmitRequest = useCallback(async () => {
    if (queueItemCount < 1 || !accountId) return;
    setSubmitError(null);
    setIsSubmittingRequest(true);
    const body: QuoteRequestDraftDto = {
      ...draft,
      accountID: accountNumeric,
      additionalComments: reviewAdditional,
      ...(userEmail ? { email: userEmail } : {}),
    };
    const submitItemCount = countQuoteQueueItems(body);
    const submitEntryTypes = getQuoteRequestEntryTypesCsv(body);
    trackQuoteRequestInitiated({
      itemCount: submitItemCount,
      entryTypes: submitEntryTypes,
    });
    const cleared = createEmptyQuoteRequestDraft(accountNumeric);
    try {
      let quoteRequestId = body.quoteRequestId;
      if ((quoteRequestId == null || quoteRequestId <= 0) && userEmail) {
        const saved = await saveQuoteRequestDraft(accountId, body, userEmail);
        quoteRequestId = saved.quoteRequestId;
        if (quoteRequestId != null && quoteRequestId > 0) {
          setDraft((d) => ({
            ...d,
            ...saved,
            quoteRequestId: saved.quoteRequestId,
            additionalComments: reviewAdditional,
          }));
        }
      }
      if (quoteRequestId == null || quoteRequestId <= 0) {
        setSubmitError(
          userEmail
            ? "Could not resolve quote id. Try again or contact support."
            : "Sign in to submit a quote request."
        );
        return;
      }
      const result = await submitQuoteRequest(quoteRequestId, {
        additionalComments: reviewAdditional,
      });
      if (result.success) {
        setSubmittedRequestId(result.requestId);
        setIsSubmittingRequest(false);
        setStep("confirmation");
        trackQuoteRequestSubmitted({
          itemCount: submitItemCount,
          entryTypes: submitEntryTypes,
          requestId: result.requestId,
        });
        try {
          if (userEmail) {
            const refreshed = await fetchQuoteRequestDraft(accountId, userEmail);
            const merged: QuoteRequestDraftDto = {
              ...refreshed,
              accountID: accountNumeric,
              ...(userEmail ? { email: userEmail } : {}),
            };
            setDraft(merged);
            writeQuoteRequestDraftForAccount(accountId, merged);
          } else {
            setDraft(cleared);
            writeQuoteRequestDraftForAccount(accountId, cleared);
          }
        } catch {
          setDraft(cleared);
          writeQuoteRequestDraftForAccount(accountId, cleared);
        }
      } else {
        setSubmitError(
          String(
            quoteCms?.SubmissionErrorMessage?.value ??
              result.errorMessage ??
              "Failed to submit quote request."
          )
        );
      }
    } catch {
      setSubmitError(
        String(quoteCms?.SubmissionErrorMessage?.value ?? "Failed to submit quote request.")
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  }, [
    accountId,
    accountNumeric,
    draft,
    queueItemCount,
    quoteCms?.SubmissionErrorMessage?.value,
    reviewAdditional,
    userEmail,
  ]);

  return {
    quoteCms,
    draft,
    isOpen,
    closeDrawer,
    openFromHeader,
    openFromQuoteRow,
    openFromLineItem,
    openFromOrderDetailHeader,
    openOrderQuoteDraftForReview,
    openFromQuoteDetailAllLines,
    openFromQuoteDetailAllLinesWithFetch,
    openFromQuoteDetailSingleLine,
    isFetchingOrderLines,
    orderHeaderReview,
    onCancelLineStep,
    setIsOpen,
    step,
    setStep,
    generalForm,
    setGeneralForm: setGeneralFormWithClear,
    lineForm,
    setLineForm,
    generalFieldErrors,
    reviewAdditional,
    onUpdateReviewNotes,
    onContinueGeneral,
    onContinueLine,
    onAddAnother,
    onSearchOrders,
    onDeleteItem,
    onEditGeneral,
    onEditLine,
    onEditOrderQuoteLine,
    onDeleteOrderQuoteLine,
    onConfirmDiscard,
    discardOpen,
    setDiscardOpen,
    queueItemCount,
    hasPendingDraft,
    hasOrdersHistory,
    isSaving,
    lineKeyInQueue,
    isOrderHeaderInOrderQuoteDraft,
    lineInQuoteDraftForListLine,
    getLineItemByKey,
    isSubmittingRequest,
    submitError,
    submittedRequestId,
    onSubmitRequest,
  };
}

export type UseQuoteRequestReturn = ReturnType<typeof useQuoteRequest>;
