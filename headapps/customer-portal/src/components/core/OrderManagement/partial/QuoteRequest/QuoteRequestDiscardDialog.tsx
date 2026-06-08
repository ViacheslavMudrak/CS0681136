"use client";

import { Text } from "@sitecore-content-sdk/nextjs";
import React, { type ReactElement } from "react";

import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import Modal from "@/components/shared/modal/Modal";
import Button from "@/components/ui/Button";
export interface QuoteRequestDiscardDialogProps {
  isOpen: boolean;
  quoteCms?: QuoteRequestCmsFields;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function QuoteRequestDiscardDialog({
  isOpen,
  quoteCms,
  isSaving,
  onClose,
  onConfirm,
}: QuoteRequestDiscardDialogProps): ReactElement {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={undefined}
      size="lg"
      className="z-[var(--z-modal,1040)] max-w-md"
      bodyClassName="p-6"
    >
      <div className="flex flex-col gap-[16px]">
        {quoteCms?.DialogTitle ? (
          <Text
            field={quoteCms.DialogTitle}
            tag="h2"
            className="text-xl font-semibold text-text-heading pt-[8px]"
          />
        ) : null}
        {quoteCms?.DialogeBodyText ? (
          <Text
            field={quoteCms.DialogeBodyText}
            tag="p"
            className="text-sm leading-snug text-text-secondary"
          />
        ) : null}
        <div className="flex justify-end gap-2 [&_button]:px-5 [&_button]:py-3">
          <Button type="button" variant="muted" isDisabled={isSaving} onPress={onClose}>
            {quoteCms?.DialogeCancelButtonLabel ? (
              <Text field={quoteCms.DialogeCancelButtonLabel} tag="span" />
            ) : null}
          </Button>
          <Button type="button" variant="primary" isDisabled={isSaving} onPress={onConfirm}>
            {quoteCms?.ConfirmDiscardButtonLabel ? (
              <Text field={quoteCms.ConfirmDiscardButtonLabel} tag="span" />
            ) : null}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
