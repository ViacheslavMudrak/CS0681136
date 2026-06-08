"use client";

import { RichText, Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import React from "react";

import EmptyStatePanel, { RetryButton } from "@/components/shared/empty-state/EmptyStatePanel";
import type { IOrderDetailFields } from "../OrderDetail.type";

export interface OrderDetailEmptyStateProps {
  fields: IOrderDetailFields;
  onRetry: () => void;
}

/**
 * Shown when order detail fails to load or returns no usable payload.
 */
export function OrderDetailEmptyState({
  fields,
  onRetry,
}: OrderDetailEmptyStateProps): React.ReactElement {
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
      body={fields.EmptyStateBody ? <RichText field={fields.EmptyStateBody} /> : null}
      action={<RetryButton onRetry={onRetry} />}
    />
  );
}
