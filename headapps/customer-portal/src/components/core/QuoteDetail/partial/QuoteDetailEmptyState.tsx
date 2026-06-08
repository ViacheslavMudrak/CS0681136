"use client";

import { RichText, Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import React from "react";

import EmptyStatePanel, { RetryButton } from "@/components/shared/empty-state/EmptyStatePanel";
import type { IQuoteDetailFields } from "../QuoteDetail.type";

export interface QuoteDetailEmptyStateProps {
  fields: IQuoteDetailFields;
  /** When true, {@link IQuoteDetailFields.ApiErrorMessage} is shown when authored. */
  loadFailed?: boolean;
  notFound?: boolean;
  onRetry: () => void;
}

export function QuoteDetailEmptyState({
  fields,
  loadFailed = false,
  notFound = false,
  onRetry,
}: QuoteDetailEmptyStateProps): React.ReactElement {
  const retryLabel = (fields.EmptyStateRetryButtonLabel?.value ?? "").trim();
  const stateMessage = notFound
    ? fields.QuoteNotFoundMessage
    : loadFailed
      ? fields.ApiErrorMessage
      : fields.EmptyStateBody;

  return (
    <EmptyStatePanel
      image={
        fields.EmptyStateImage?.value?.src ? (
          <SitecoreImage
            field={fields.EmptyStateImage}
            width={200}
            height={160}
            sizes="200px"
            className="max-w-[200px] h-auto object-contain"
          />
        ) : null
      }
      heading={
        fields.EmptyStateHeading ? (
          <Text
            field={fields.EmptyStateHeading}
            tag="h3"
            className="text-[18px] font-semibold text-[var(--color-text-heading-color)] m-0"
          />
        ) : null
      }
      body={
        <>
          {stateMessage ? (
            notFound || loadFailed ? (
              <Text field={stateMessage} tag="p" />
            ) : (
              <RichText field={stateMessage} />
            )
          ) : null}
        </>
      }
      action={<RetryButton label={retryLabel || "Retry"} onRetry={onRetry} />}
    />
  );
}
