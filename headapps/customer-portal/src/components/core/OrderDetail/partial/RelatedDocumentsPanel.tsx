"use client";

import { Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import type { LinkField } from "@sitecore-content-sdk/nextjs";
import { faDownload, faFilePdf, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import LibraryIcon from "@/components/shared/icons/Icon";

import {
  trackOrderDetailRelatedDocumentDownload,
  trackOrderDetailRelatedDocumentsPanelView,
  trackOrderDetailRelatedDocumentsSupportEmailClick,
} from "@/lib/orderDetailAnalytics";
import { usePermissionContext } from "@/lib/permission-context";
import { useProfileContext } from "@/lib/profile-context";
import {
  findMatchingOrderDetailApiDocument,
  getLinkFieldHref,
  normalizeOrderDetailEventLabel,
  openLinkField,
  resolveOrderDetailDocumentFileNameFromLink,
  resolveOrderDetailDocumentOpenUrl,
  resolveOrderDetailSupportMailto,
} from "@/lib/orderDetailUtils";

import type {
  IOrderDetailFields,
  OrderDetailDocument,
  OrderDetailDocumentEntryItem,
} from "../OrderDetail.type";

import { cn } from "@/lib/utils";

export interface RelatedDocumentsPanelProps {
  fields: IOrderDetailFields;
  orderNumber: string;
  documents?: OrderDetailDocument[];
}

function DocumentEntryRow({
  entry,
  apiDocument,
  onOpenLink,
  onOpenExternalUrl,
}: {
  entry: OrderDetailDocumentEntryItem;
  apiDocument?: OrderDetailDocument;
  onOpenLink: (entry: OrderDetailDocumentEntryItem, link: LinkField) => void;
  onOpenExternalUrl: (
    entry: OrderDetailDocumentEntryItem,
    url: string,
    fileNameHint: string
  ) => void;
}) {
  const { DocumentLabel, DocumentIcon, DownloadIcon, DocumentLink } = entry.fields ?? {};
  const externalUrl = resolveOrderDetailDocumentOpenUrl(apiDocument);
  const hasCmsLink = Boolean(DocumentLink && getLinkFieldHref(DocumentLink));
  const hasTarget = Boolean(externalUrl || hasCmsLink);

  const activate = () => {
    if (externalUrl) {
      const hint =
        [apiDocument?.documentName, apiDocument?.fileType].filter(Boolean).join(".") ||
        normalizeOrderDetailEventLabel(
          String(DocumentLabel?.value ?? entry.displayName ?? "document")
        );
      onOpenExternalUrl(entry, externalUrl, hint);
      return;
    }
    if (DocumentLink && getLinkFieldHref(DocumentLink)) onOpenLink(entry, DocumentLink);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!hasTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-[10.5px] w-full min-w-0 rounded-[4px] border border-[var(--color-border-default)] p-[10px] md:p-[11px]",
        hasTarget
          ? "cursor-pointer transition-colors hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)] focus-visible:ring-offset-1"
          : "opacity-90"
      )}
      role={hasTarget ? "button" : undefined}
      tabIndex={hasTarget ? 0 : undefined}
      onClick={hasTarget ? activate : undefined}
      onKeyDown={hasTarget ? onKeyDown : undefined}
      aria-label={
        hasTarget && DocumentLabel?.value
          ? `Open document: ${DocumentLabel.value}`
          : hasTarget
            ? "Open document"
            : undefined
      }
    >
      <div className="shrink-0 flex items-center justify-center w-[28px] h-[28px] rounded-full bg-[#e3f0f5]" aria-hidden>
        {DocumentIcon?.value?.src ? (
          <SitecoreImage
            field={DocumentIcon}
            width={18}
            height={18}
            sizes="18px"
            className="w-[13.42px] h-[14px]"
          />
        ) : (
          <Icon icon={faFilePdf} width={14} height={14} className="text-[var(--color-icon-cyan)]" aria-hidden />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-[400] leading-[1.5] text-[var(--color-text-heading-color)]">
          {DocumentLabel ? <Text field={DocumentLabel} tag="span" /> : null}
        </div>
      </div>
      <div
        className="shrink-0 inline-flex items-center justify-center bg-[var(--color-bg-basic-color)] rounded-[2px] px-[2px] py-[2px] text-[var(--color-action-primary)]"
        aria-hidden
      >
        {DownloadIcon?.value?.src ? (
          <SitecoreImage
            field={DownloadIcon}
            width={14}
            height={14}
            sizes="14px"
            className="object-contain block w-[11px] h-[12px]"
          />
        ) : (
          <Icon icon={faDownload} width={11} height={11} aria-hidden />
        )}
      </div>
    </div>
  );
}

/**
 * Related Documents & Resources: CMS entries + support block.
 * Hidden entirely without View Technical Docs permission (no fetch of document URLs at this layer).
 */
export function RelatedDocumentsPanel({
  fields,
  orderNumber,
  documents = [],
}: RelatedDocumentsPanelProps): React.ReactElement | null {
  const router = useRouter();
  const { selectedAccount } = useProfileContext();

  const openLink = useCallback(
    (entry: OrderDetailDocumentEntryItem, link: LinkField) => {
      const documentLabel = normalizeOrderDetailEventLabel(
        String(entry.fields?.DocumentLabel?.value ?? "")
      );
      const fileName = resolveOrderDetailDocumentFileNameFromLink(link);

      trackOrderDetailRelatedDocumentDownload({
        fileName,
        documentLabel,
        orderNumber,
      });

      openLinkField(link, (path) => router.push(path));
    },
    [orderNumber, router]
  );

  const openExternalUrl = useCallback(
    (entry: OrderDetailDocumentEntryItem, url: string, fileNameHint: string) => {
      const documentLabel = normalizeOrderDetailEventLabel(
        String(entry.fields?.DocumentLabel?.value ?? "")
      );
      trackOrderDetailRelatedDocumentDownload({
        fileName: fileNameHint || "document",
        documentLabel,
        orderNumber,
      });
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [orderNumber]
  );

  useEffect(() => {
    if (!orderNumber) return;
    trackOrderDetailRelatedDocumentsPanelView({ orderNumber });
  }, [orderNumber]);

  const handleSupportLinkClick = useCallback(() => {
    trackOrderDetailRelatedDocumentsSupportEmailClick({ orderNumber });
  }, [orderNumber]);

  const entriesWithTargets: Array<{
    entry: OrderDetailDocumentEntryItem;
    apiDocument: OrderDetailDocument | undefined;
  }> =
    fields.DocumentEntriesSelection?.flatMap((entry) => {
      if (!entry?.fields) return [];
      const apiDocument = findMatchingOrderDetailApiDocument(entry, documents);
      const externalUrl = resolveOrderDetailDocumentOpenUrl(apiDocument);
      const cmsHref = getLinkFieldHref(entry.fields.DocumentLink);
      return externalUrl || cmsHref ? [{ entry, apiDocument }] : [];
    }) ?? [];
  const mailto = resolveOrderDetailSupportMailto(
    selectedAccount?.supportEmail,
    fields.FallbackSupportEmail
  );
  const showSupportBlock = Boolean(fields.SupportHelpText || (mailto && fields.SupportLinkLabel));

  return (
    <aside
      className="flex flex-col md:gap-[20px] gap-[16px] rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] md:p-[20px] p-[16px] w-full min-w-0"
      aria-labelledby="order-detail-docs-title"
    >
      <h3
        id="order-detail-docs-title"
        className="text-[16px] font-[500] leading-[1.38] text-[var(--color-text-black)] m-0"
      >
        {fields.RelatedDocumentsPanelTitle ? (
          <Text field={fields.RelatedDocumentsPanelTitle} tag="span" />
        ) : null}
      </h3>

      {entriesWithTargets.length > 0 && (
        <div className="flex flex-col gap-[7px] w-full min-w-0" role="list">
          {entriesWithTargets.map(({ entry, apiDocument }) => {
            return (
              <div key={entry.id} className="w-full min-w-0" role="listitem">
                <DocumentEntryRow
                  entry={entry}
                  apiDocument={apiDocument}
                  onOpenLink={openLink}
                  onOpenExternalUrl={openExternalUrl}
                />
              </div>
            );
          })}
        </div>
      )}

      {showSupportBlock ? (
        <div className="flex gap-[10px] items-start w-full min-w-0">
          <div className="flex shrink-0 text-[var(--color-link-text)]" aria-hidden>
            {/* <Icon icon={faLightbulb} fontVariant="light" width={18} height={18} /> */}

            <LibraryIcon width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M11.9527 10.0844C12.6277 9.35313 13.0496 8.36875 13.0496 7.3C13.0496 5.07813 11.2496 3.25 8.99961 3.25C6.77773 3.25 4.94961 5.07813 4.94961 7.3C4.94961 8.36875 5.37148 9.35313 6.07461 10.0844C6.66523 10.7313 7.31211 11.6031 7.56523 12.7H10.434C10.6871 11.6031 11.334 10.7313 11.9527 10.0844ZM12.909 11.0125C12.2621 11.7156 11.6996 12.5594 11.6996 13.5438V14.05C11.6996 15.2875 10.6871 16.3 9.44961 16.3H8.54961C7.31211 16.3 6.29961 15.2875 6.29961 14.05V13.5438C6.29961 12.5594 5.73711 11.7156 5.09023 11.0125C4.16211 10.0563 3.59961 8.73438 3.59961 7.3C3.59961 4.31875 6.01836 1.9 8.99961 1.9C11.9809 1.9 14.3996 4.31875 14.3996 7.3C14.3996 8.73438 13.8371 10.0563 12.909 11.0125ZM7.64961 7.075C7.64961 7.44063 7.34023 7.75 6.97461 7.75C6.60898 7.75 6.29961 7.44063 6.29961 7.075C6.29961 5.69688 7.39648 4.6 8.77461 4.6C9.14023 4.6 9.44961 4.90938 9.44961 5.275C9.44961 5.64063 9.14023 5.95 8.77461 5.95C8.15586 5.95 7.64961 6.45625 7.64961 7.075Z"
                fill="#479EBC"
              />
            </LibraryIcon>
          </div>
          <div className="flex-1 min-w-0 text-[12px] leading-[1.375] text-[var(--color-text-black)] gap-[1px]">
            {fields.SupportHelpText ? (
              <span className="text-[12px] leading-[1.38] text-[var(--color-text-black)] mr-[1px]">
                <Text field={fields.SupportHelpText} tag="span" />
              </span>
            ) : null}
            {mailto && fields.SupportLinkLabel ? (
              <>
                <a
                  className="text-[12px] font-[500] leading-[1.38] text-[var(--color-link-text)] underline-offset-2 hover:underline"
                  href={mailto}
                  onClick={handleSupportLinkClick}
                >
                  <Text field={fields.SupportLinkLabel} tag="span" />
                </a>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
