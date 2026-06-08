"use client";

import { Text } from "@sitecore-content-sdk/nextjs";
import React, { useMemo } from "react";

import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import type { OrderLineItem, OrderListItem } from "@/lib/apis/orders-api";
import { Label } from "@laitram-l-l-c/intralox-ui-components";

import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

function splitDescriptionLines(description: string): string[] {
  const t = String(description ?? "").replace(/\r\n/g, "\n");
  if (!t.trim()) return [];
  return t
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export interface QuoteRequestLineStepProps {
  quoteCms?: QuoteRequestCmsFields;
  order: OrderListItem;
  line: OrderLineItem;
  comments: string;
  isSaving: boolean;
  onChangeComments: (v: string) => void;
  onCancel: () => void;
  onContinue: () => void;
  isEditing?: boolean;
}

export function QuoteRequestLineStep({
  quoteCms,
  order,
  line,
  comments,
  isSaving,
  onChangeComments,
  onCancel,
  onContinue,
  isEditing = false,
}: QuoteRequestLineStepProps): React.ReactElement {
  const descriptionLines = useMemo(
    () => splitDescriptionLines(line.description),
    [line.description]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[20px] px-[16px] py-[24px] md:px-[24px]">
          {quoteCms?.AddItemTitle ? (
            <h3 className="m-0 text-[16px] font-medium leading-[1.375] text-[var(--color-text-heading-color)]">
              <Text field={quoteCms?.AddItemTitle} tag="span" />
            </h3>
          ) : null}
          <div className="flex flex-col gap-[10px] rounded-[var(--rounded-default)] bg-[#f7f8fa] p-[16px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-[400] leading-[16.5px] text-[var(--color-gray-700)]">
                PO #
              </span>
              <span className="text-[12px] font-[500] leading-[16.5px] text-[var(--color-text-secondary)]">
                {order.poNumber?.trim() || "—"}
              </span>
              <span className="text-[12px] leading-[1.25] text-[var(--color-gray-500)]" aria-hidden>
                •
              </span>
              <span className="text-[12px] font-[400] leading-[16.5px] text-[var(--color-gray-700)]">
                Order #
              </span>
              <span className="text-[12px] font-[500] leading-[16.5px] text-[var(--color-text-secondary)]">
                {order.orderNumber != null && String(order.orderNumber).length > 0
                  ? String(order.orderNumber)
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-[4px]">
              <p className="m-0 text-[12px] leading-[1.375] text-[var(--color-text-heading-color)]">
                <span className="font-semibold text-[#222]">
                  Customer Part #{line.customerPartNumber?.trim() || "—"}
                </span>
                <span className="font-normal"> | </span>
                <span className="font-semibold text-[#222]">
                  Intralox Part #{line.intraloxPartNumber?.trim() || "—"}
                </span>
              </p>
              {descriptionLines.length > 0 ? (
                <div className="flex w-full min-w-0 flex-col gap-1">
                  {descriptionLines.map((text, i) => (
                    <p
                      key={i}
                      className="m-0 text-[12px] leading-[1.375] text-[var(--color-text-heading-color)] whitespace-pre-wrap break-words"
                    >
                      {text}
                    </p>
                  ))}
                </div>
              ) : null}
              <p className="m-0 text-[12px] font-medium leading-[1.375] text-[var(--color-text-heading-color)]">
                QTY:{" "}
                {typeof line.quantity === "number" && Number.isFinite(line.quantity)
                  ? line.quantity
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {quoteCms?.LineItemComment ? (
              <Label
                htmlFor="qr-line-comments"
                className="text-[14px] font-medium text-[var(--color-text-heading-color)]"
              >
                <Text field={quoteCms?.LineItemComment} tag="span" />
              </Label>
            ) : null}
            <Textarea
              id="qr-line-comments"
              value={comments}
              onChange={(e) => onChangeComments(e.target.value)}
              placeholder={
                quoteCms?.LineItemCommentPlaceholder?.value
                  ? String(quoteCms?.LineItemCommentPlaceholder.value)
                  : ""
              }
            />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-[var(--color-quote-drawer-footer-border)] bg-[var(--color-bg-basic-color)] px-[16px] pt-5 pb-[max(20px,env(safe-area-inset-bottom,0px))] md:px-[24px]">
        <Button
          type="button"
          variant="muted"
          className="px-[20px] py-[12px]"
          isDisabled={isSaving}
          onPress={onCancel}
        >
          {quoteCms?.LineItemCancelButtonLabel ? (
            <Text field={quoteCms?.LineItemCancelButtonLabel} tag="span" />
          ) : null}
        </Button>
        <Button
          type="button"
          variant="primary"
          className="px-[20px] py-[12px]"
          isDisabled={isSaving}
          onPress={onContinue}
        >
          {isEditing ? (
            quoteCms?.LineItemSaveChangesButtonLabel ? (
              <Text field={quoteCms?.LineItemSaveChangesButtonLabel} tag="span" />
            ) : (
              <span>Save changes</span>
            )
          ) : quoteCms?.LineItemContinueButtonLabel ? (
            <Text field={quoteCms?.LineItemContinueButtonLabel} tag="span" />
          ) : null}
        </Button>
      </div>
    </div>
  );
}
