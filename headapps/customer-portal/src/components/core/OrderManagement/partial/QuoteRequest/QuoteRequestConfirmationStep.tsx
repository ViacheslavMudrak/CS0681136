"use client";

import { RichText, RichTextField, Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import Button from "@/components/ui/Button";

export interface QuoteRequestConfirmationStepProps {
  quoteCms?: QuoteRequestCmsFields;
  requestId: string;
  onClose: () => void;
}

export function QuoteRequestConfirmationStep({
  quoteCms,
  requestId,
  onClose,
}: QuoteRequestConfirmationStepProps): React.ReactElement {
  const hasCmsIcon =
    Boolean(quoteCms?.ConfirmationIcon?.value?.src) && Boolean(quoteCms?.ConfirmationIcon);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-[16px]">
        <div className="flex size-[61px] shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-green-light)]">
          {hasCmsIcon && quoteCms?.ConfirmationIcon ? (
            <SitecoreImage
              field={quoteCms.ConfirmationIcon}
              width={48}
              height={48}
              className="max-h-12 max-w-12 object-contain"
              alt=""
            />
          ) : (
            <Icon
              icon={faCheck}
              className="h-[22px] w-[22px] text-[var(--color-text-verified)]"
              width={22}
              height={22}
              aria-hidden
            />
          )}
        </div>
        {quoteCms?.ConfirmationTitle ? (
          <Text
            field={quoteCms.ConfirmationTitle}
            tag="h2"
            className="m-0 text-center text-[24px] font-medium leading-[1.5] text-[var(--color-text-black)]"
          />
        ) : null}
        {quoteCms?.ConfirmationDescription ? (
          <RichText
            field={quoteCms.ConfirmationDescription as unknown as RichTextField}
            className="m-0 w-full text-center text-[18px] font-normal leading-[1.5] text-[var(--color-text-secondary)]"
          />
        ) : null}
        <div className="mt-[20px] flex w-full flex-col items-center gap-1 text-center">
          {quoteCms?.RequestIDLabel ? (
            <Text
              field={quoteCms.RequestIDLabel}
              tag="p"
              className="text-[14px] font-medium text-[var(--color-text-heading-color)]"
            />
          ) : null}
          <p className="break-all font-mono text-[16px] text-[var(--color-text-secondary)]">
            {requestId}
          </p>
        </div>
        {quoteCms?.ConfirmationButtonText ? (
          <Button
            type="button"
            variant="primary"
            onPress={onClose}
            className="mt-[20px] min-h-[42px] rounded-full px-[20px] py-[12px]"
          >
            <Text field={quoteCms.ConfirmationButtonText} tag="span" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
