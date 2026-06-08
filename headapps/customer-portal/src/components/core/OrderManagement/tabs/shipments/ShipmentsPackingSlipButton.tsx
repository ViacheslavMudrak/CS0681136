"use client";

import { faFileLines } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { NextImage } from "@sitecore-content-sdk/nextjs";
import React, { useCallback, useState } from "react";

import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import Button from "@/components/ui/Button";
import { openBinaryPdfInNewTab } from "@/lib/documentBinaryPdf";
import { cn } from "@/lib/utils";

const PACKING_SLIP_ICON_PX = 12;

export function ShipmentsPackingSlipButton({
  rowId,
  documentUrl,
  className,
  tabFields,
  onDownloadStart,
}: {
  rowId: string;
  documentUrl?: string | null;
  className?: string;
  tabFields?: OrderManagementTabFields;
  onDownloadStart?: (shipmentReference: string) => void;
}): React.ReactElement {
  const href = documentUrl?.trim() ? documentUrl.trim() : null;
  const [isDownloading, setIsDownloading] = useState(false);
  const label = tabFields?.PackingSlipLabel?.value?.trim() || "Packing Slip";
  const iconField = tabFields?.PackingSlipIcon;
  const iconSrc = iconField?.value?.src?.trim();

  const handlePress = useCallback(async () => {
    if (!href) return;
    onDownloadStart?.(rowId);
    setIsDownloading(true);
    try {
      await openBinaryPdfInNewTab({ documentUrl: href, suppressErrorToast: true });
    } catch {
      // Keep the same silent failure behavior as invoice grid downloads.
    } finally {
      setIsDownloading(false);
    }
  }, [href, onDownloadStart, rowId]);

  const ariaLabel = href ? `Download ${label}` : `${label} unavailable`;

  return (
    <Button
      type="button"
      variant="transparent"
      className={cn(
        "inline-flex items-center gap-[5px] whitespace-nowrap rounded-[6px] border border-[#e6e9f1] bg-[var(--color-bg-basic-color)] px-[6px] py-[5.25px] text-[11px] font-medium leading-tight text-[var(--color-action-primary)]",
        className
      )}
      isDisabled={!href || isDownloading}
      onPress={() => void handlePress()}
      aria-label={ariaLabel}
    >
      {iconSrc ? (
        <NextImage
          field={iconField}
          width={PACKING_SLIP_ICON_PX}
          height={PACKING_SLIP_ICON_PX}
          sizes={`${PACKING_SLIP_ICON_PX}px`}
          className="shrink-0 object-contain text-[var(--color-action-primary)]"
        />
      ) : (
        <Icon
          icon={faFileLines}
          width={PACKING_SLIP_ICON_PX}
          className="shrink-0 text-[var(--color-action-primary)]"
          aria-hidden
        />
      )}
      <span className="text-[12px] font-[400] leading-[1.38]">{label}</span>
    </Button>
  );
}
