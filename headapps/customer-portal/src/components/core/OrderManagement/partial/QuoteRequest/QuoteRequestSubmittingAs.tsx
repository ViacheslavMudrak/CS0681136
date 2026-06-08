"use client";

import { Image as SitecoreImage, Text, type RichTextField } from "@sitecore-content-sdk/nextjs";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import { SubmittingAsHelpTooltip } from "@/components/shared/submitting-as-help/SubmittingAsHelpTooltip";
import { sitecoreRichTextFieldHasRenderableContent } from "@/lib/documentRequestPanelUtils";
import { useProfileContext } from "@/lib/profile-context";

export interface QuoteRequestSubmittingAsProps {
  quoteCms?: QuoteRequestCmsFields;
}

export function QuoteRequestSubmittingAs({
  quoteCms,
}: QuoteRequestSubmittingAsProps): React.ReactElement {
  const { selectedAccount } = useProfileContext();

  const submittingAsTooltipField = quoteCms?.SubmittingAsTooltipDescription;
  const hasSubmittingAsHelp = sitecoreRichTextFieldHasRenderableContent(submittingAsTooltipField);
  const hasCmsIcon = Boolean(quoteCms?.SubmittingAsIcon?.value?.src);
  const labelIcon = hasCmsIcon ? (
    <SitecoreImage
      field={quoteCms?.SubmittingAsIcon}
      width={12}
      height={11}
      sizes="12px"
      className="h-[11px] w-[12px] text-[var(--color-text-secondary)]"
      alt=""
      aria-hidden
    />
  ) : (
    <Icon
      icon={faCircleInfo}
      width={12}
      height={11}
      aria-hidden
      className="h-[11px] w-[12px] text-[var(--color-text-secondary)]"
    />
  );

  return (
    <div className="border-b border-[var(--color-quote-drawer-header-border)] bg-[var(--color-quote-drawer-submitting-as-bg)] px-[16px] py-[10px] md:px-[24px]">
      <div className="flex items-start gap-[20px]">
        <div className="flex shrink-0 items-center gap-[3px] pt-px">
          {quoteCms?.SubmittingAsLabel ? (
            <Text
              field={quoteCms?.SubmittingAsLabel}
              tag="span"
              className="text-[10px] font-bold uppercase leading-none tracking-wider text-[var(--color-text-placeholder)]"
            />
          ) : null}
          {hasSubmittingAsHelp && submittingAsTooltipField ? (
            <SubmittingAsHelpTooltip
              ariaLabel="Quote request account information"
              trigger={labelIcon}
              tooltipField={submittingAsTooltipField as RichTextField}
            />
          ) : (
            labelIcon
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium leading-[1.375] text-[var(--color-text-secondary)]">
            {selectedAccount?.companyName ?? "—"}
          </p>
          <p className="text-[10px] font-normal leading-[1.375] text-[var(--color-text-secondary)]">
            {selectedAccount?.address ?? ""}
          </p>
        </div>
      </div>
    </div>
  );
}
