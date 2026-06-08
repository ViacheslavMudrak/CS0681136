"use client";

import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { NextImage } from "@sitecore-content-sdk/nextjs";
import React, { useState } from "react";

import Button from "@/components/ui/Button";
import { openBinaryPdfInNewTab } from "@/lib/documentBinaryPdf";
import type { InvoiceRecord } from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";

import type { OrderManagementTabFields } from "../../OrderManagement.type";

function InvoiceDownloadGlyph({
  tabFields,
}: {
  tabFields: OrderManagementTabFields;
}): React.ReactElement {
  const iconField = tabFields.DownloadInvoiceActionIcon;
  const iconWrapClass =
    "inline-flex h-full w-[14px] shrink-0 items-center justify-center overflow-hidden";

  if (iconField?.value?.src?.trim()) {
    return (
      <span className={iconWrapClass}>
        <NextImage
          field={iconField}
          width={11}
          height={11}
          sizes="11px"
          className="size-[10.5px] shrink-0 object-contain"
        />
      </span>
    );
  }

  return (
    <span className={iconWrapClass}>
      <Icon
        icon={faDownload}
        width={10.5}
        height={10.5}
        className="shrink-0 text-[var(--color-action-primary)]"
        aria-hidden
      />
    </span>
  );
}

export function InvoiceDownloadButton({
  row,
  tabFields,
  showLabelAfterIcon = false,
  onDownloadStart,
}: {
  row: InvoiceRecord;
  tabFields: OrderManagementTabFields;
  showLabelAfterIcon?: boolean;
  onDownloadStart?: (invoiceNumber: string) => void;
}): React.ReactElement {
  const label = tabFields.DownloadInvoiceActionLabel?.value?.trim() || "Invoice";
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);
  const isIconOnly = !showLabelAfterIcon;
  const controlClass = cn(
    "inline-flex h-[27.5px] shrink-0 cursor-pointer items-center justify-center overflow-clip rounded-[2px] border-0",
    "bg-[var(--color-bg-basic-color)] text-[var(--color-action-primary)]",
    "shadow-[0px_0px_0px_0.875px_rgba(18,43,105,0.08)]",
    "hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)]",
    isIconOnly
      ? "min-w-0 gap-0 px-[6px] py-[5.25px] !h-[27.5px] !w-[26px]"
      : "gap-[5.25px] px-[6px] py-[5.25px]"
  );

  const handleDownload = async () => {
    if (isOpeningPdf) return;
    onDownloadStart?.(row.invoiceNumber);
    setIsOpeningPdf(true);
    try {
      await openBinaryPdfInNewTab({ documentUrl: row.downloadUrl });
    } catch {
      // Swallow to keep existing silent failure behavior for tab downloads.
    } finally {
      setIsOpeningPdf(false);
    }
  };

  return (
    <Button
      type="button"
      variant="transparent"
      btnVariant={isIconOnly ? "iconBtn" : undefined}
      className={controlClass}
      aria-label={`Download ${label} ${row.invoiceNumber}`}
      isDisabled={isOpeningPdf}
      onPress={() => void handleDownload()}
    >
      <InvoiceDownloadGlyph tabFields={tabFields} />
      {showLabelAfterIcon ? (
        <span className="shrink-0 whitespace-nowrap text-[10.5px] font-normal leading-[1.375] text-[var(--color-action-primary)]">
          {label}
        </span>
      ) : null}
    </Button>
  );
}
