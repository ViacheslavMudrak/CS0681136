"use client";

import { Image as SitecoreImage, Text, type TextField } from "@sitecore-content-sdk/nextjs";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { DetailPageHeader } from "@/components/shared/detail-page-header/DetailPageHeader";
import type { DetailPageHeaderAction } from "@/components/shared/detail-page-header/DetailPageHeader.type";
import { RequestDocumentsActionIcon } from "@/components/shared/icons/RequestDocumentsActionIcon";
import { RequestUpdatedQuoteActionIcon } from "@/components/shared/icons/RequestUpdatedQuoteActionIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  trackOrderDetailDocRequestInitiated,
  trackOrderDetailQuoteRequestInitiated,
  trackOrderDetailSubheaderContactClick,
} from "@/lib/orderDetailAnalytics";
import {
  resolveOrderDetailHeaderStatusVariant,
  type OrderDetailHeaderStatusVariant,
} from "@/lib/orderDetailUtils";

import type { IOrderDetailFields } from "../OrderDetail.type";

function orderStatusBadgeType(
  variant: OrderDetailHeaderStatusVariant
): "Shipped" | "Placed" | "Cancelled" {
  switch (variant) {
    case "shipped":
      return "Shipped";
    case "cancelled":
      return "Cancelled";
    default:
      return "Placed";
  }
}

export interface OrderDetailHeaderProps {
  fields: IOrderDetailFields;
  orderNumber: string;
  orderIdDisplay: string;
  orderStatusKey: string;
  orderStatusLabel: string;
  poNumber: string;
  orderDateFormatted: string;
  contactName: string;
  contactEmail: string;
  referenceLabel: string;
  referenceValue: string;
  canRequestDocumentation: boolean;
  canInitiateRfq: boolean;
  onRequestDocuments?: () => void;
  onCreateQuoteFromOrder?: () => void;
  orderCreateQuoteIsModifyMode?: boolean;
  modifyQuoteOrderButtonLabel?: IOrderDetailFields["ModifyQuoteOrderButtonLabel"] | TextField;
  showCreateQuote: boolean;
  showRequestDocument: boolean;
}

export function OrderDetailHeader({
  fields,
  orderNumber,
  orderIdDisplay,
  orderStatusKey,
  orderStatusLabel,
  poNumber,
  orderDateFormatted,
  contactName,
  contactEmail,
  referenceLabel,
  referenceValue,
  canRequestDocumentation,
  canInitiateRfq,
  onRequestDocuments,
  onCreateQuoteFromOrder,
  orderCreateQuoteIsModifyMode = false,
  modifyQuoteOrderButtonLabel,
  showCreateQuote,
  showRequestDocument,
}: OrderDetailHeaderProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderNumberTrimmed = orderNumber.trim();
  const returnUrl = searchParams.get("returnUrl");

  const handleBack = () => {
    if (returnUrl && returnUrl.startsWith("/")) {
      router.push(returnUrl);
      return;
    }
    router.back();
  };

  const showReference = referenceLabel.trim().length > 0 && referenceValue.trim().length > 0;

  const createQuoteFromOrderButtonLabelField = orderCreateQuoteIsModifyMode
    ? (modifyQuoteOrderButtonLabel ?? { value: "Modify Quote From Order" })
    : fields.CreateQuoteOrderButtonLabel;

  const statusVariant = resolveOrderDetailHeaderStatusVariant(orderStatusKey);
  const statusBadge = (
    <StatusBadge type={orderStatusBadgeType(statusVariant)} statusLabel={orderStatusLabel} />
  );

  const actions: DetailPageHeaderAction[] = [];

  if (canRequestDocumentation && showRequestDocument) {
    actions.push({
      key: "request-documents",
      ariaLabel: String(fields.RequestDocumentsButtonLabel?.value ?? "Request documents"),
      variant: "inverse",
      border: true,
      icon: fields.RequestDocumentsButtonIcon?.value?.src ? (
        <SitecoreImage
          field={fields.RequestDocumentsButtonIcon}
          width={16}
          height={16}
          sizes="16px"
          className="h-[16px] w-[18px] shrink-0 object-contain"
          alt=""
        />
      ) : (
        <RequestDocumentsActionIcon className="h-[16px] w-[18px] shrink-0 object-contain text-current" />
      ),
      label: fields.RequestDocumentsButtonLabel ? (
        <Text field={fields.RequestDocumentsButtonLabel} tag="span" />
      ) : null,
      onPress: () => {
        if (orderNumberTrimmed) {
          trackOrderDetailDocRequestInitiated({
            orderNumber: orderNumberTrimmed,
            initiationPoint: "Order_Header",
          });
        }
        onRequestDocuments?.();
      },
    });
  }

  if (canInitiateRfq && showCreateQuote) {
    actions.push({
      key: "create-quote",
      ariaLabel: String(createQuoteFromOrderButtonLabelField?.value ?? "Create quote from order"),
      variant: "primary",
      icon: fields.CreateQuoteOrderButtonIcon?.value?.src ? (
        <SitecoreImage
          field={fields.CreateQuoteOrderButtonIcon}
          width={19}
          height={19}
          sizes="19px"
          className="h-[19px] w-[19px] shrink-0 object-contain"
          alt=""
        />
      ) : (
        <RequestUpdatedQuoteActionIcon className="h-[19px] w-[19px] shrink-0 object-contain text-current" />
      ),
      label: createQuoteFromOrderButtonLabelField ? (
        <Text field={createQuoteFromOrderButtonLabelField} tag="span" />
      ) : null,
      onPress: () => {
        if (orderNumberTrimmed) {
          trackOrderDetailQuoteRequestInitiated({
            orderNumber: orderNumberTrimmed,
            initiationPoint: "Order_Header",
          });
        }
        onCreateQuoteFromOrder?.();
      },
    });
  }

  const metadata = (
    <div className="flex min-w-0 flex-col items-start gap-[10px] md:flex-row md:items-center md:gap-[6px]">
      <div className="flex gap-[6px]">
        <span className="font-[500] text-[var(--color-text-black)]">
          {fields.POLabel ? <Text field={fields.POLabel} tag="span" /> : null}
          {fields.POLabel ? " " : null}
          <span >
            {poNumber}
          </span>
        </span>
        <span aria-hidden className="text-[var(--color-bg-black)]">
          •
        </span>
        <span className="font-[400] text-[var(--color-text-black)]">
          {fields.PlacedDateLabel ? <Text field={fields.PlacedDateLabel} tag="span" /> : null}{" "}
          <span>{orderDateFormatted}</span>
        </span>
      </div>
      {contactName ? (
        <span className="font-[400] text-[var(--color-text-black)]">
          {fields.ByLabel ? <Text field={fields.ByLabel} tag="span" c /> : null}{" "}
          {contactEmail ? (
            <a
              className="inline-flex flex-row items-center gap-[6px] font-medium text-[var(--color-menu-hover-color)] underline-offset-2 hover:[&_.contact-link-text]:underline"
              href={`mailto:${contactEmail}`}
              onClick={() => {
                if (orderNumberTrimmed) {
                  trackOrderDetailSubheaderContactClick({
                    orderNumber: orderNumberTrimmed,
                  });
                }
              }}
            >
              <span className="contact-link-text underline-offset-2">{contactName}</span>
              <Icon
                icon={faEnvelope}
                width={16}
                height={16}
                className="shrink-0 text-[var(--color-menu-hover-color)]"
                aria-hidden
              />
            </a>
          ) : (
            <span className="text-[var(--color-text-heading-color)]">{contactName}</span>
          )}
        </span>
      ) : null}
    </div>
  );

  const reference = showReference ? (
    <>
      {fields.ReferenceIDLabel ? (
        <Text field={fields.ReferenceIDLabel} tag="span" className="font-[500]" />
      ) : null}
      : <span className="font-[400]">{referenceValue}</span>
    </>
  ) : undefined;

  return (
    <DetailPageHeader
      backAriaLabel="Back to orders"
      onBack={handleBack}
      headingTag="h2"
      title={
        <>
          {fields.OrderNumberLabel ? <Text field={fields.OrderNumberLabel} tag="span" /> : null}
          <span className="whitespace-pre"> </span>
          <span>{orderIdDisplay}</span>
        </>
      }
      statusBadge={statusBadge}
      actions={actions}
      metadata={metadata}
      reference={reference}
    />
  );
}
