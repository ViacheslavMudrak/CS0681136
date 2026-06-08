"use client";

import { Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { useRouter } from "next/navigation";
import React from "react";

import { DetailPageHeader } from "@/components/shared/detail-page-header/DetailPageHeader";
import type { DetailPageHeaderAction } from "@/components/shared/detail-page-header/DetailPageHeader.type";
import { RequestDocumentsActionIcon } from "@/components/shared/icons/RequestDocumentsActionIcon";
import { RequestUpdatedQuoteActionIcon } from "@/components/shared/icons/RequestUpdatedQuoteActionIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatOrderDateDisplay,
  resolveStatusDisplayForOrderKey,
} from "@/lib/orderManagementUtils";
import {
  clearQuoteDetailReturnHref,
  resolveQuoteDetailReturnHref,
} from "@/lib/quote-detail-entry-point";

import type { IQuoteDetailFields } from "../QuoteDetail.type";

function formatQuoteHeaderDateDisplay(iso: string): string {
  const formatted = formatOrderDateDisplay(iso, "en-US").trim();
  const slashDate = formatted.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashDate) {
    const [, month, day, year] = slashDate;
    return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year.slice(-2)}`;
  }

  const ymdDate = formatted.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdDate) {
    const [, year, month, day] = ymdDate;
    return `${month}/${day}/${year.slice(-2)}`;
  }

  return formatted;
}

export interface QuoteDetailHeaderProps {
  fields: IQuoteDetailFields;
  quoteNumber: string;
  statusKey: string;
  createdDateIso: string;
  expiryDateIso: string;
  contactName: string;
  contactEmail: string;
  locale: string;
  canRequestDocumentation: boolean;
  isExpired: boolean;
  onRequestDocuments: () => void;
  onRequestUpdatedQuote: () => void;
  onContactEmailClick?: () => void;
}

export function QuoteDetailHeader({
  fields,
  quoteNumber,
  statusKey,
  createdDateIso,
  expiryDateIso,
  contactName,
  contactEmail,
  canRequestDocumentation,
  isExpired,
  onRequestDocuments,
  onRequestUpdatedQuote,
  onContactEmailClick,
}: QuoteDetailHeaderProps): React.ReactElement {
  const router = useRouter();

  const quotePrefix = (fields.QuoteNumberPrefix?.value ?? "").trim();
  const createdPrefix = (fields.CreatedDatePrefix?.value ?? "").trim() || "Created";
  const byLabel = (fields.CreatedByPrefix?.value ?? "").trim() || "by";
  const expiresLabel = (fields.ExpiresLabel?.value ?? "").trim() || "Expires";
  const expiredLabel = (fields.ExpiredLabel?.value ?? "").trim() || "Expired";
  const dateLine = formatQuoteHeaderDateDisplay(createdDateIso);
  const expiryLabel = isExpired ? expiredLabel : expiresLabel;
  const expiryDate = expiryDateIso.trim();
  const expiryPart = expiryDate
    ? `${expiryLabel} ${formatQuoteHeaderDateDisplay(expiryDate)}`
    : expiryLabel;

  const ready = statusKey === "order_ready";

  const handleBack = () => {
    const returnHref = resolveQuoteDetailReturnHref();
    if (returnHref) {
      clearQuoteDetailReturnHref();
      router.push(returnHref);
      return;
    }
    router.back();
  };

  const docAria =
    String(fields.RequestDocumentsButtonLabel?.value ?? "").trim() || "Request documents";
  const updAria =
    String(fields.RequestUpdatedQuoteButtonLabel?.value ?? "").trim() || "Request updated quote";

  const readyStatusAria = (fields.ReadyStatusLabel?.value ?? "").trim() || "Ready";
  const expiredStatusAria = (fields.ExpiredStatusLabel?.value ?? "").trim() || "Expired";
  const statusDisplay = resolveStatusDisplayForOrderKey(statusKey, {
    FilterOptions: fields.FilterOptions,
    StatusItemsSelection: fields.StatusItemsSelection,
  });
  const expiredStatusLabel =
    statusDisplay.labelField?.value ?? statusDisplay.label ?? expiredStatusAria;
  const statusLabel = ready ? readyStatusAria : expiredStatusLabel;

  const statusBadge = ready ? (
    <StatusBadge type="Ready" />
  ) : (
    <StatusBadge
      statusIcon={
        statusDisplay.iconField ? (
          <SitecoreImage
            field={statusDisplay.iconField}
            className="shrink-0 object-contain"
            width={12}
            height={12}
            sizes="12px"
            alt=""
          />
        ) : null
      }
      statusLabel={
        statusDisplay.labelField ? (
          <Text
            field={statusDisplay.labelField}
            tag="span"
            className="mt-[1px] block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-start"
          />
        ) : (
          (statusLabel as any)
        )
      }
      type={statusLabel as "Expired"}
    />
  );

  const actions: DetailPageHeaderAction[] = [];

  if (canRequestDocumentation) {
    actions.push({
      key: "request-documents",
      ariaLabel: docAria,
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
      onPress: onRequestDocuments,
    });
  }

  if (isExpired) {
    actions.push({
      key: "request-updated-quote",
      ariaLabel: updAria,
      variant: "primary",
      icon: fields.RequestUpdatedQuoteButtonIcon?.value?.src ? (
        <SitecoreImage
          field={fields.RequestUpdatedQuoteButtonIcon}
          width={19}
          height={19}
          sizes="19px"
          className="h-[19px] w-[19px] shrink-0 object-contain"
          alt=""
        />
      ) : (
        <RequestUpdatedQuoteActionIcon className="h-[19px] w-[19px] shrink-0 object-contain text-current" />
      ),
      label: fields.RequestUpdatedQuoteButtonLabel ? (
        <Text field={fields.RequestUpdatedQuoteButtonLabel} tag="span" />
      ) : null,
      onPress: onRequestUpdatedQuote,
    });
  }

  const metadata = (
    <div className="flex min-w-0 flex-wrap items-start gap-[10px] md:flex-row md:items-center md:gap-[6px]">
      <span className="font-[500] text-[var(--color-text-heading-color)]">
        {createdPrefix} {dateLine} {byLabel}
      </span>
      {contactEmail.trim() ? (
        <a
          className="inline-flex flex-row items-center gap-[6px] font-medium text-[var(--color-menu-hover-color)] underline-offset-2 hover:[&_.contact-link-text]:underline"
          href={`mailto:${contactEmail.trim()}`}
          onClick={() => onContactEmailClick?.()}
        >
          <span className="contact-link-text underline-offset-2">
            {contactName.trim() || contactEmail}
          </span>
          <Icon
            icon={faEnvelope}
            width={16}
            height={16}
            className="shrink-0 text-[var(--color-menu-hover-color)]"
            aria-hidden
          />
        </a>
      ) : (
        <span className="text-[var(--color-text-heading-color)]">{contactName.trim() || "—"}</span>
      )}
      {expiryPart ? (
        <>
          <span aria-hidden className="text-[var(--color-bg-black)]">
            •
          </span>
          <span className="font-[500] text-[var(--color-text-heading-color)]">{expiryPart}</span>
        </>
      ) : null}
    </div>
  );

  return (
    <DetailPageHeader
      backAriaLabel={(fields.BackLinkLabel?.value ?? "").trim() || "Back to quotes"}
      onBack={handleBack}
      headingTag="h1"
      title={
        <>
          <span>{quotePrefix}</span>
          <span className="whitespace-pre"> </span>
          <span>{quoteNumber}</span>
        </>
      }
      statusBadge={statusBadge}
      actions={actions}
      metadata={metadata}
    />
  );
}
