"use client";

import { Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import {
  faChevronDown,
  faChevronUp,
  faPencilAlt,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Icon, Label } from "@laitram-l-l-c/intralox-ui-components";
import React, { useMemo, useState } from "react";

import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import type {
  QuoteRequestDraftDto,
  QuoteRequestSingleLineQuoteItem,
} from "@/lib/quote-request/request-quote.types";
import {
  getOrderHeaderReviewIntroDisplayParts,
  orderQuoteLineToSingleLineItemForReview,
} from "@/lib/quote-request/quote-request-utils";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

export interface QuoteRequestReviewStepProps {
  quoteCms?: QuoteRequestCmsFields;
  draft: QuoteRequestDraftDto;
  orderHeaderReview?: { poNumber: string; orderNumber: string; orderHeaderId: number } | null;
  reviewAdditional: string;
  isSaving: boolean;
  onReviewAdditionalChange: (v: string) => void;
  onAddAnother: () => void;
  onEditGeneral: (sequence: number) => void;
  onEditLine: (sequence: number) => void;
  onEditOrderQuoteLine: (orderHeaderId: number, lineIndex: number) => void;
  onDeleteOrderQuoteLine: (orderHeaderId: number, lineIndex: number) => void;
  onDelete: (kind: "general" | "singleLineItem", sequence: number) => void;
  onDiscard: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

function GeneralReviewCard({
  application,
  productDetails,
  comments,
  onEdit,
  onDelete,
}: {
  application: string;
  productDetails: string;
  comments: string;
  onEdit: () => void;
  onDelete: () => void;
}): React.ReactElement {
  const productDisplay = productDetails?.trim() ? productDetails : "—";
  const commentsDisplay = comments?.trim() ? comments : "—";

  return (
    <div className="mb-[18px] flex flex-col gap-[12px] rounded-[var(--rounded-default)] border border-[var(--color-border-gray-300)] bg-[var(--color-bg-basic-color)] p-[16px] last:mb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <p className="m-0 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-[var(--color-text-placeholder)]">
            Application
          </p>
          <p className="m-0 whitespace-pre-wrap break-words text-[12px] font-[400] leading-[1.38] text-[var(--color-text-black)]">
            {application?.trim() || "—"}
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-[6px]">
          <Button
            type="button"
            btnVariant="iconBtn"
            variant="ghost"
            className="!min-w-0 !px-0 !py-0 text-[#99a1af] [&_svg]:!h-[13px] [&_svg]:!w-[16px]"
            onPress={onEdit}
            aria-label="Edit"
          >
            <Icon icon={faPencilAlt} width={13} height={13} />
          </Button>
          <Button
            type="button"
            variant="destroySecondary"
            className="!min-w-0 !px-0 !py-0 text-[#99a1af] [&_svg]:!h-[13px] [&_svg]:!w-[16px]"
            onPress={onDelete}
            aria-label="Delete"
          >
            <Icon icon={faTrashAlt} width={13} height={13} />
          </Button>
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-1 pr-5">
        <p className="m-0 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-[var(--color-text-placeholder)]">
          Product details
        </p>
        <p className="m-0 whitespace-pre-wrap break-words text-[12px] font-[400] leading-[1.38] text-[var(--color-text-black)]">
          {productDisplay}
        </p>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-1 pr-5">
        <p className="m-0 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-[var(--color-text-placeholder)]">
          Comments
        </p>
        <p className="m-0 whitespace-pre-wrap break-words text-[12px] font-[400] leading-[1.38] text-[var(--color-text-black)]">
          {commentsDisplay}
        </p>
      </div>
    </div>
  );
}

function LineReviewCard({
  item,
  onEdit,
  onDelete,
}: {
  item: QuoteRequestSingleLineQuoteItem;
  onEdit: () => void;
  onDelete: () => void;
}): React.ReactElement {
  const fullDesc = String(item.partDescription?.value ?? "").replace(/\r\n/g, "\n");
  const [expanded, setExpanded] = useState(false);
  const firstLine = useMemo(() => {
    const t = fullDesc.trim();
    if (!t) return "";
    return (
      t
        .split("\n")
        .map((s) => s.trim())
        .find((s) => s.length > 0) ?? ""
    );
  }, [fullDesc]);
  const qtyText =
    typeof item.quantity?.value === "number" && Number.isFinite(item.quantity.value)
      ? String(item.quantity.value)
      : "—";
  const hasComment = Boolean(item.comments?.trim());

  const showQty = expanded;
  const expandedDescText = useMemo(() => (fullDesc.trim() ? fullDesc : "—"), [fullDesc]);
  const collapsedDescText = useMemo(() => (firstLine ? firstLine : "—"), [firstLine]);

  return (
    <div className="mb-[18px] flex flex-col gap-[12px] rounded-[var(--rounded-default)] border border-[var(--color-border-gray-300)] bg-[var(--color-bg-basic-color)] p-[16px] last:mb-0">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-[12px] leading-tight text-[var(--color-gray-700)]">PO #</span>
          <span className="text-[12px] font-medium leading-tight text-[var(--color-text-secondary)]">
            {item.poNumber?.trim() || "—"}
          </span>
          <span className="text-[12px] leading-tight text-[var(--color-gray-500)]" aria-hidden>
            •
          </span>
          <span className="text-[12px] leading-tight text-[var(--color-gray-700)]">Order #</span>
          <span className="text-[12px] font-medium leading-tight text-[var(--color-text-secondary)]">
            {item.orderNumber != null && String(item.orderNumber).length > 0
              ? String(item.orderNumber)
              : "—"}
          </span>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-[6px]">
          <Button
            type="button"
            btnVariant="iconBtn"
            variant="ghost"
            className="!min-w-0 !px-0 !py-0 text-[#99a1af] [&_svg]:!h-[13px] [&_svg]:!w-[16px]"
            onPress={onEdit}
            aria-label="Edit"
          >
            <Icon icon={faPencilAlt} width={13} height={13} />
          </Button>
          <Button
            type="button"
            variant="destroySecondary"
            className="!min-w-0 !px-0 !py-0 text-[#99a1af] [&_svg]:!h-[13px] [&_svg]:!w-[16px]"
            onPress={onDelete}
            aria-label="Delete"
          >
            <Icon icon={faTrashAlt} width={13} height={13} />
          </Button>
        </div>
      </div>
      <p className="m-0 w-full min-w-0 text-[12px] leading-[1.375] text-[#222]">
        <span className="font-semibold">
          Customer Part #{item.customerPartNumber?.trim() || "—"}
        </span>
        <span> | </span>
        <span className="font-semibold">
          Intralox Part #{item.intraloxPartNumber?.trim() || "—"}
        </span>
      </p>
      <div className="flex w-full min-w-0 flex-col gap-1">
        <div className="flex w-full min-w-0 items-center gap-0.5">
          <p
            className={
              !expanded
                ? "m-0 min-w-0 flex-1 break-words text-[12px] leading-[1.375] text-[var(--color-text-black)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1] overflow-hidden whitespace-normal"
                : "m-0 min-w-0 flex-1 whitespace-pre-wrap break-words text-[12px] leading-[1.375] text-[var(--color-text-black)]"
            }
          >
            {!expanded ? collapsedDescText : expandedDescText}
          </p>
          <Button
            type="button"
            btnVariant="iconBtn"
            variant="ghost"
            className="mt-0.5 shrink-0 p-0.5 text-[#99a1af]"
            aria-expanded={expanded}
            aria-label={
              expanded ? "Collapse description" : "Expand to show full description and quantity"
            }
            onPress={() => setExpanded((v) => !v)}
          >
            <Icon
              icon={expanded ? faChevronUp : faChevronDown}
              width={14}
              height={14}
              className="block"
            />
          </Button>
        </div>
        {showQty ? (
          <p className="m-0 text-[12px] font-medium leading-[1.375] text-[var(--color-text-heading-color)]">
            <span className="font-medium">QTY</span>
            {": "}
            <span className="font-medium text-[var(--color-text-heading-color)]">{qtyText}</span>
          </p>
        ) : null}
      </div>
      {hasComment ? (
        <div className="flex w-full min-w-0 flex-col gap-1 border-t border-[#f3f4f6] pr-5 pt-[11px]">
          <p className="m-0 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-[var(--color-text-placeholder)]">
            Comments
          </p>
          <p className="m-0 whitespace-pre-wrap break-words text-[12px] font-[400] leading-[1.38] text-[var(--color-text-black)]">
            {item.comments.trim()}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function OrderHeaderBulkLineReviewCard({
  item,
  onEdit,
  onDelete,
}: {
  item: QuoteRequestSingleLineQuoteItem;
  onEdit: () => void;
  onDelete: () => void;
}): React.ReactElement {
  const fullDesc = String(item.partDescription?.value ?? "").replace(/\r\n/g, "\n");
  const [expanded, setExpanded] = useState(false);
  const firstLine = useMemo(() => {
    const t = fullDesc.trim();
    if (!t) return "";
    return (
      t
        .split("\n")
        .map((s) => s.trim())
        .find((s) => s.length > 0) ?? ""
    );
  }, [fullDesc]);
  const qtyText =
    typeof item.quantity?.value === "number" && Number.isFinite(item.quantity.value)
      ? String(item.quantity.value)
      : "—";

  const hasComment = Boolean(item.comments?.trim());
  const cust = item.customerPartNumber?.trim() || "—";
  const intra = item.intraloxPartNumber?.trim() || "—";

  const showQty = expanded;
  const expandedDescText = useMemo(() => (fullDesc.trim() ? fullDesc : "—"), [fullDesc]);
  const collapsedDescText = useMemo(() => (firstLine ? firstLine : "—"), [firstLine]);

  return (
    <div className="mb-[18px] flex flex-col gap-[12px] rounded-[var(--rounded-default)] border border-[var(--color-border-gray-300)] bg-[var(--color-bg-basic-color)] p-[16px] last:mb-0">
      <div className="flex w-full min-w-0 items-start justify-between gap-2">
        <p
          className="m-0 min-w-0 flex-1 text-left text-[12px] font-semibold leading-[1.375] text-[#222]"
          title={`Customer Part #${cust} · Intralox Part #${intra}`}
        >
          <span className="font-semibold">Customer Part #{cust}</span>
          <span className="font-normal" aria-hidden>
            {" "}
            ·{" "}
          </span>
          <span className="font-semibold">Intralox Part #{intra}</span>
        </p>
        <div className="relative h-[16px] flex shrink-0 items-center justify-end gap-[6px]">
          <Button
            type="button"
            btnVariant="iconBtn"
            variant="ghost"
            className="!min-w-0 !px-0 !py-0 text-[#99a1af] [&_svg]:!h-[13px] [&_svg]:!w-[16px]"
            onPress={onEdit}
            aria-label="Edit"
          >
            <Icon icon={faPencilAlt} width={13} height={13} />
          </Button>
          <Button
            type="button"
            variant="destroySecondary"
            className="!min-w-0 !px-0 !py-0 text-[#99a1af] [&_svg]:!h-[13px] [&_svg]:!w-[16px]"
            onPress={onDelete}
            aria-label="Delete"
          >
            <Icon icon={faTrashAlt} width={13} height={13} />
          </Button>
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-1">
        <div className="flex w-full min-w-0 items-center gap-0.5">
          <p
            className={
              !expanded
                ? "m-0 min-w-0 flex-1 break-words text-[12px] leading-[1.375] text-[var(--color-text-black)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1] overflow-hidden whitespace-normal"
                : "m-0 min-w-0 flex-1 whitespace-pre-wrap break-words text-[12px] leading-[1.375] text-[var(--color-text-black)]"
            }
          >
            {!expanded ? collapsedDescText : expandedDescText}
          </p>
          <Button
            type="button"
            btnVariant="iconBtn"
            variant="ghost"
            className="mt-0.5 shrink-0 p-0.5 text-[#99a1af]"
            aria-expanded={expanded}
            aria-label={
              expanded ? "Collapse description" : "Expand to show full description and quantity"
            }
            onPress={() => setExpanded((v) => !v)}
          >
            <Icon
              icon={expanded ? faChevronUp : faChevronDown}
              width={14}
              height={14}
              className="block"
            />
          </Button>
        </div>
        {showQty ? (
          <p className="m-0 text-[12px] font-medium leading-[1.375] text-[var(--color-text-heading-color)]">
            <span className="font-medium">QTY</span>
            {": "}
            <span className="font-medium text-[var(--color-text-heading-color)]">{qtyText}</span>
          </p>
        ) : null}
      </div>
      {hasComment ? (
        <div className="flex w-full min-w-0 flex-col gap-1 border-t border-[#f3f4f6] pr-5 pt-[11px]">
          <p className="m-0 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-[var(--color-text-placeholder)]">
            Comments
          </p>
          <p className="m-0 whitespace-pre-wrap break-words text-[12px] font-[400] leading-[1.38] text-[var(--color-text-black)]">
            {item.comments.trim()}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function QuoteRequestReviewStep({
  quoteCms,
  draft,
  orderHeaderReview: _orderHeaderReview = null,
  reviewAdditional,
  isSaving,
  onReviewAdditionalChange,
  onAddAnother,
  onEditGeneral,
  onEditLine,
  onEditOrderQuoteLine,
  onDeleteOrderQuoteLine,
  onDelete,
  onDiscard,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}: QuoteRequestReviewStepProps): React.ReactElement {
  const showRetry = Boolean(submitError);
  const orderHeaderPattern =
    quoteCms?.OrderHeaderReviewIntroPattern?.value != null
      ? String(quoteCms.OrderHeaderReviewIntroPattern.value)
      : undefined;

  const sortedGeneral = useMemo(
    () => [...draft.general.quoteItems].sort((a, b) => a.sequence - b.sequence),
    [draft.general.quoteItems]
  );
  const sortedSingleLine = useMemo(
    () => [...draft.singleLineItem.quoteItems].sort((a, b) => a.sequence - b.sequence),
    [draft.singleLineItem.quoteItems]
  );
  const sortedOrderQuote = useMemo(
    () => [...draft.orderQuote.quoteItems].sort((a, b) => a.sequence - b.sequence),
    [draft.orderQuote.quoteItems]
  );

  const hasPriorToBulk = sortedGeneral.length > 0 || sortedSingleLine.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
      <div className="mb-0 flex flex-col gap-2 px-[16px] pt-[12px] md:mb-4 md:flex-row md:shrink-0 md:items-center md:justify-between md:px-[24px]">
        {quoteCms?.ReviewTitle ? (
          <Text
            field={quoteCms?.ReviewTitle}
            tag="h2"
            className="text-[16px] font-[500] leading-[1.38] text-[var(--color-text-heading-color)]"
          />
        ) : null}
        {quoteCms?.AddReviewItemLinkLabel ? (
          <Button
            type="button"
            variant="transparent"
            className="justify-end pr-[0px] text-[11px] font-normal leading-[1.25] text-[var(--color-action-primary)] md:pr-[20px]"
            isDisabled={isSaving || isSubmitting}
            onPress={onAddAnother}
          >
            <Text field={quoteCms.AddReviewItemLinkLabel} tag="span" />
          </Button>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:overflow-hidden">
          <div className="flex shrink-0 flex-col gap-[18px] px-[16px] py-[24px] md:min-h-0 md:flex-1 md:shrink md:overflow-y-auto md:px-[24px]">
            {sortedGeneral.map((item) => (
              <GeneralReviewCard
                key={`g-${item.sequence}`}
                application={item.application}
                productDetails={item.productDetails}
                comments={item.comments}
                onEdit={() => onEditGeneral(item.sequence)}
                onDelete={() => onDelete("general", item.sequence)}
              />
            ))}
            {sortedSingleLine.map((item) => (
              <LineReviewCard
                key={`s-${item.sequence}`}
                item={item}
                onEdit={() => onEditLine(item.sequence)}
                onDelete={() => onDelete("singleLineItem", item.sequence)}
              />
            ))}
            {sortedOrderQuote.map((oq, oqIndex) => {
              const lineItems = oq.lineItems ?? [];
              if (lineItems.length === 0) return null;

              const addBulkTopSpacer = hasPriorToBulk || oqIndex > 0;

              return (
                <div
                  key={`oq-block-${oq.sequence}-${oq.orderHeaderId}`}
                  className={addBulkTopSpacer ? "mt-4 flex flex-col gap-[18px]" : undefined}
                >
                  <p className="m-0 mb-4 text-[16px] font-normal leading-[1.5] text-[var(--color-text-heading-color)]">
                    {getOrderHeaderReviewIntroDisplayParts(
                      orderHeaderPattern,
                      oq.poNumber,
                      oq.orderNumber
                    ).map((part, partIdx) =>
                      part.kind === "text" ? (
                        <span key={partIdx}>{part.value}</span>
                      ) : (
                        <span
                          key={partIdx}
                          className="font-semibold text-[var(--color-text-heading-color)]"
                        >
                          {part.value}
                        </span>
                      )
                    )}
                  </p>
                  {lineItems.map((li, idx) => (
                    <OrderHeaderBulkLineReviewCard
                      key={`oh-${oq.orderHeaderId}-li-${idx}`}
                      item={orderQuoteLineToSingleLineItemForReview(oq, li)}
                      onEdit={() => onEditOrderQuoteLine(oq.orderHeaderId, idx)}
                      onDelete={() => onDeleteOrderQuoteLine(oq.orderHeaderId, idx)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
          <div className="flex shrink-0 flex-col gap-4 border-t border-[var(--color-quote-drawer-footer-border)] bg-[var(--color-bg-basic-color)]">
            <div className="flex flex-col gap-2 border-[#EEEEF1] bg-[#FAFBFC] px-[16px] py-[20px] md:sticky md:bottom-[82px] md:z-[5] md:shrink-0 md:border-b md:px-[24px]">
              {quoteCms?.AdditionalQuoteInformationLabel ? (
                <Label
                  htmlFor="qr-review-additional"
                  className="text-[14px] font-medium leading-[1.38] text-[var(--color-text-heading-color)]"
                >
                  <Text field={quoteCms?.AdditionalQuoteInformationLabel} tag="span" />
                </Label>
              ) : null}
              <Textarea
                id="qr-review-additional"
                value={reviewAdditional}
                onChange={(e) => onReviewAdditionalChange(e.target.value)}
                placeholder={
                  quoteCms?.AdditionalQuoteInformationPlaceholder?.value
                    ? String(quoteCms?.AdditionalQuoteInformationPlaceholder.value)
                    : ""
                }
                disabled={isSubmitting}
              />
            </div>
            {submitError ? (
              <p
                className="m-0 px-[16px] pb-0 pt-0 text-[14px] leading-normal text-[var(--color-text-red)] md:px-[24px]"
                role="alert"
              >
                {submitError}
              </p>
            ) : null}
          </div>
        </div>
        <div className="sticky bottom-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#EEEEF1] bg-[var(--color-bg-basic-color)] px-[16px] pt-[20px] pb-[max(20px,env(safe-area-inset-bottom,0px))] md:border-t-0 md:px-[24px]">
          <Button
            type="button"
            variant="destroySecondary"
            isDisabled={isSaving || isSubmitting}
            onPress={onDiscard}
          >
            {quoteCms?.DiscardRequestIcon?.value?.src && quoteCms?.DiscardRequestIcon ? (
              <SitecoreImage
                field={quoteCms.DiscardRequestIcon}
                width={16}
                height={16}
                sizes="16px"
                className="shrink-0"
                alt=""
                aria-hidden
              />
            ) : null}
            {quoteCms?.DiscardRequestLabel ? (
              <Text field={quoteCms?.DiscardRequestLabel} tag="span" />
            ) : null}
          </Button>
          <Button
            onPress={onSubmit}
          >
            {showRetry && quoteCms?.SubmitRequestRetryButtonLabel ? (
              <Text field={quoteCms.SubmitRequestRetryButtonLabel} tag="span" />
            ) : quoteCms?.SubmitRequestButtonLabel ? (
              <Text field={quoteCms.SubmitRequestButtonLabel} tag="span" />
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
