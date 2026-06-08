"use client";

import { LocalizedImageFieldLink } from "@/components/image/LocalizedImageFieldLink";
import { trackDashboardNavigationPillClick } from "@/lib/dashboardAnalytics";
import { LinkField } from "@sitecore-content-sdk/nextjs";
import { useCallback } from "react";

interface RenderLocalizedLinkProps {
  ariaLabel: string;
  linkField: LinkField;
  body: React.ReactNode;
  isEditing?: boolean;
  pillLabelForAnalytics?: string;
  pillPosition: number;
}

export const RenderLocalizedLink = (props: RenderLocalizedLinkProps) => {
  const { ariaLabel, linkField, body, isEditing, pillLabelForAnalytics, pillPosition } = props;

  const onLinkedTileClickCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isEditing) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (!target?.closest("a")) return;
      trackDashboardNavigationPillClick({
        pillLabel: pillLabelForAnalytics || ariaLabel,
        pillPosition,
      });
    },
    [isEditing, pillLabelForAnalytics, ariaLabel, pillPosition]
  );

  return (
    <div
      className="box-border flex min-w-[140px] flex-1 flex-col rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)]"
      role="listitem"
      aria-label={ariaLabel}
      onClickCapture={onLinkedTileClickCapture}
    >
      <LocalizedImageFieldLink
        field={linkField}
        className="box-border flex min-h-0 min-w-0 flex-1 flex-col px-[18px] py-[20px] text-inherit no-underline outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action-primary)] lg:p-[24px]"
      >
        {body}
      </LocalizedImageFieldLink>
    </div>
  );
};
