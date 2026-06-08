"use client";

import { NextImage, RichText, type ImageField, type RichTextField, type TextField } from "@sitecore-content-sdk/nextjs";
import React from "react";

import { RetryButton } from "@/components/shared/empty-state/EmptyStatePanel";

export interface DashboardRecentWidgetListStateFields {
  EmptyStateIcon?: ImageField;
  EmptyStateMessage?: RichTextField;
  ErrorMessage?: RichTextField;
  RetryButtonLabel?: TextField;
}

type DashboardRecentWidgetListStateProps = {
  fields: DashboardRecentWidgetListStateFields;
  variant: "empty" | "error";
  onRetry?: () => void;
};

export function DashboardRecentWidgetListState({
  fields,
  variant,
  onRetry,
}: DashboardRecentWidgetListStateProps): React.ReactElement {
  const retryLabel = String(fields.RetryButtonLabel?.value ?? "").trim() || "Retry";

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      {fields.EmptyStateIcon?.value?.src ? (
        <NextImage
          field={fields.EmptyStateIcon}
          width={64}
          height={64}
          className="size-16 object-contain"
          sizes="64px"
        />
      ) : null}
      {variant === "error" ? (
        <>
          {fields.ErrorMessage?.value ? (
            <p className="text-[14px] text-[var(--color-gray-700,#646467)]">
              <RichText field={fields.ErrorMessage} />
            </p>
          ) : null}
          {onRetry ? <RetryButton label={retryLabel} onRetry={onRetry} /> : null}
        </>
      ) : fields.EmptyStateMessage?.value ? (
        <p className="text-[14px] text-[var(--color-gray-700,#646467)]">
          <RichText field={fields.EmptyStateMessage} />
        </p>
      ) : null}
    </div>
  );
}
