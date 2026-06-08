"use client";

import { useOktaAuth } from "@okta/okta-react";
import {
  Image as SitecoreImage,
  RichText,
  RichTextField,
  Text,
} from "@sitecore-content-sdk/nextjs";
import { faCheck, faCircleInfo, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  Heading as AriaHeading,
  ModalOverlay as DialogOverlay,
} from "react-aria-components";

import Button from "@/components/ui/Button";
import { SubmittingAsHelpTooltip } from "@/components/shared/submitting-as-help/SubmittingAsHelpTooltip";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import Modal from "@/components/shared/modal/Modal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import useDeviceType from "@/hooks/use-device-type";
import type { IDocumentRequestPanelFields } from "@/lib/document-request-panel-types";
import type { DocumentRequestUiLine } from "@/lib/document-request-panel-types";
import {
  getVisibleSortedDocumentTypes,
  resolveMultiItemSectionLabel,
  sitecoreRichTextFieldHasRenderableContent,
} from "@/lib/documentRequestPanelUtils";
import {
  buildDocumentRequestPayload,
  resolveDocumentRequestContact,
  type DocumentRequestDocTypeRow,
} from "@/lib/document-request-payload";
import { formatSubmittingAsLines } from "@/lib/documentRequestMappings";
import {
  submitDocumentRequest,
  type DocumentRequestApiResult,
  type DocumentRequestEntryPoint,
} from "@/lib/apis/document-request-api";
import {
  trackDocumentRequestAbandoned,
  trackDocumentRequestConfirmationClosed,
  trackDocumentRequestDocumentTypeSelected,
  trackDocumentRequestInitiated,
  trackDocumentRequestItemRemoved,
  trackDocumentRequestOtherDocumentTypeEntered,
  trackDocumentRequestPanelDismissed,
  trackDocumentRequestPanelOpened,
  trackDocumentRequestSubmissionError,
  trackDocumentRequestSubmitted,
} from "@/lib/documentRequestAnalytics";
import { useProfileContext } from "@/lib/profile-context";
import { useUserProfile } from "@/lib/user-profile-context";
import { cn } from "@/lib/utils";
import { ModalCloseIcon } from "@/components/ui/utility-components";

export type DocumentRequestLayoutMode = "single" | "multi";

const REQUEST_ID_PLACEHOLDER = "{requestId}";

export interface DocumentRequestPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fields: IDocumentRequestPanelFields;
  entryPoint: DocumentRequestEntryPoint;
  layoutMode: DocumentRequestLayoutMode;
  poNumber: string;
  orderNumber: string;
  initialLines: DocumentRequestUiLine[];
  /** When true, shows a loading overlay until `initialLines` are populated (e.g. recent-quote fetch). */
  isLoading?: boolean;
}

type BaselineState = {
  linesJson: string;
  docIdsJson: string;
  notes: string;
  other: string;
};

function cloneLines(lines: DocumentRequestUiLine[]): DocumentRequestUiLine[] {
  return lines.map((l) => ({ ...l }));
}

function baselineFrom(
  lines: DocumentRequestUiLine[],
  docIds: string[],
  notes: string,
  other: string
): BaselineState {
  return {
    linesJson: JSON.stringify(lines),
    docIdsJson: JSON.stringify(docIds),
    notes,
    other,
  };
}

function isDirtyState(
  baseline: BaselineState,
  lines: DocumentRequestUiLine[],
  docIds: string[],
  notes: string,
  other: string
): boolean {
  const next = baselineFrom(lines, docIds, notes, other);
  return (
    next.linesJson !== baseline.linesJson ||
    next.docIdsJson !== baseline.docIdsJson ||
    next.notes !== baseline.notes ||
    next.other !== baseline.other
  );
}

export function DocumentRequestPanel({
  isOpen,
  onClose,
  fields,
  entryPoint,
  layoutMode,
  poNumber,
  orderNumber,
  initialLines,
  isLoading = false,
}: DocumentRequestPanelProps): React.ReactElement | null {
  const { isMobile } = useDeviceType();
  useBodyScrollLock(isOpen);
  const { selectedAccount } = useProfileContext();
  const oktaAuth = useOktaAuth();
  const { profile } = useUserProfile();

  const [lines, setLines] = useState<DocumentRequestUiLine[]>(() => cloneLines(initialLines));
  const [selectedDocTypeIds, setSelectedDocTypeIds] = useState<string[]>([]);
  const [otherDocumentType, setOtherDocumentType] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [docTypeTouched, setDocTypeTouched] = useState(false);
  const [otherTouched, setOtherTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState("");

  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submissionErrorModalOpen, setSubmissionErrorModalOpen] = useState(false);
  const [submissionApiErrorText, setSubmissionApiErrorText] = useState<string | null>(null);

  const baselineRef = useRef<BaselineState>(baselineFrom([], [], "", ""));
  const prevOpenRef = useRef(false);
  const docTypeSectionRef = useRef<HTMLDivElement>(null);
  const otherFieldRef = useRef<HTMLInputElement>(null);
  const panelDismissTrackedRef = useRef(false);
  const confirmationCloseTrackedRef = useRef(false);
  const openedWhileLoadingRef = useRef(false);

  const docTypes = useMemo(
    () => getVisibleSortedDocumentTypes(fields.DocumentRequestDocumentTypeList),
    [fields.DocumentRequestDocumentTypeList]
  );

  const selectedDocRows = useMemo(
    () => docTypes.filter((d) => selectedDocTypeIds.includes(d.id)),
    [docTypes, selectedDocTypeIds]
  );

  const documentTypeRows = useMemo<DocumentRequestDocTypeRow[]>(
    () =>
      docTypes.map((row) => ({
        id: row.id,
        label: String(row.fields?.Label?.value ?? "").trim(),
        value: String(row.fields?.Value?.value ?? "").trim(),
        isOther: Boolean(row.fields?.IsOtherType?.value),
      })),
    [docTypes]
  );

  const selectedIsOther = selectedDocRows.some((row) => Boolean(row.fields?.IsOtherType?.value));

  const dirty = useMemo(
    () =>
      isDirtyState(
        baselineRef.current,
        lines,
        selectedDocTypeIds,
        additionalNotes,
        otherDocumentType
      ),
    [lines, selectedDocTypeIds, additionalNotes, otherDocumentType]
  );

  const trackPanelDismissOnce = useCallback(() => {
    if (panelDismissTrackedRef.current) return;
    panelDismissTrackedRef.current = true;
    trackDocumentRequestPanelDismissed({
      entryPoint,
      itemCount: lines.length,
    });
  }, [entryPoint, lines.length]);

  const trackConfirmationCloseOnce = useCallback(() => {
    if (confirmationCloseTrackedRef.current) return;
    confirmationCloseTrackedRef.current = true;
    trackDocumentRequestConfirmationClosed({ entryPoint });
  }, [entryPoint]);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      openedWhileLoadingRef.current = isLoading;
      const copy = isLoading ? [] : cloneLines(initialLines);
      setLines(copy);
      setSelectedDocTypeIds([]);
      setOtherDocumentType("");
      setAdditionalNotes("");
      setDocTypeTouched(false);
      setOtherTouched(false);
      setSubmitError(null);
      setSubmittedRequestId("");
      setSubmissionErrorModalOpen(false);
      setSubmissionApiErrorText(null);
      setSuccessOpen(false);
      panelDismissTrackedRef.current = false;
      confirmationCloseTrackedRef.current = false;
      baselineRef.current = baselineFrom(copy, [], "", "");
      if (!isLoading) {
        trackDocumentRequestPanelOpened({
          entryPoint,
          itemCount: copy.length,
        });
      }
    }
    if (!isOpen) {
      openedWhileLoadingRef.current = false;
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, initialLines, entryPoint, isLoading]);

  useEffect(() => {
    if (!isOpen || isLoading || initialLines.length === 0 || !openedWhileLoadingRef.current) return;
    openedWhileLoadingRef.current = false;
    const copy = cloneLines(initialLines);
    setLines(copy);
    baselineRef.current = baselineFrom(copy, [], "", "");
    trackDocumentRequestPanelOpened({
      entryPoint,
      itemCount: copy.length,
    });
  }, [isOpen, isLoading, initialLines, entryPoint]);

  useEffect(() => {
    if (!selectedIsOther && otherDocumentType) {
      setOtherDocumentType("");
    }
  }, [selectedIsOther, otherDocumentType]);

  const submittingLines = formatSubmittingAsLines(selectedAccount);

  const sectionHeading =
    layoutMode === "multi"
      ? resolveMultiItemSectionLabel(
          fields.DocumentRequestMultiItemSectionLabelPattern?.value,
          poNumber,
          orderNumber
        )
      : String(fields.DocumentRequestSingleItemSectionLabel?.value ?? "").trim() ||
        "Add request details";

  const requestClose = useCallback(() => {
    if (successOpen) {
      trackConfirmationCloseOnce();
      setSuccessOpen(false);
      onClose();
      return;
    }
    if (!dirty) {
      trackPanelDismissOnce();
      onClose();
      return;
    }
    setUnsavedOpen(true);
  }, [successOpen, dirty, onClose, trackPanelDismissOnce, trackConfirmationCloseOnce]);

  const confirmDiscard = useCallback(() => {
    trackDocumentRequestAbandoned({
      entryPoint,
      itemCount: lines.length,
      documentTypeSelected: selectedDocTypeIds.length > 0,
      hadNotes: additionalNotes.trim().length > 0,
    });
    setUnsavedOpen(false);
    onClose();
  }, [entryPoint, lines.length, selectedDocTypeIds.length, additionalNotes, onClose]);

  const removeLine = useCallback(
    (lineId: string) => {
      setLines((prev) => {
        const next = prev.filter((l) => l.lineId !== lineId);
        if (layoutMode === "multi") {
          trackDocumentRequestItemRemoved({
            entryPoint,
            itemCount: next.length,
          });
        }
        if (layoutMode === "multi" && next.length === 0) {
          window.setTimeout(() => {
            onClose();
          }, 0);
        }
        return next;
      });
    },
    [layoutMode, onClose, entryPoint]
  );

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;
    setDocTypeTouched(true);
    if (selectedDocTypeIds.length === 0) {
      docTypeSectionRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (selectedIsOther) {
      setOtherTouched(true);
      if (!otherDocumentType.trim()) {
        otherFieldRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
        return;
      }
    }
    if (lines.length === 0) {
      return;
    }

    const documentTypePayload = selectedDocTypeIds
      .map((id) => {
        const valueField = docTypes.find((row) => row.id === id)?.fields?.Value?.value;
        return String(valueField ?? "").trim();
      })
      .filter(Boolean);

    if (documentTypePayload.length !== selectedDocTypeIds.length) {
      setSubmitError("Invalid document type configuration.");
      return;
    }
    const documentTypeForEvent = documentTypePayload.join(",");

    setSubmitting(true);
    setSubmitError(null);
    setSubmissionErrorModalOpen(false);
    setSubmissionApiErrorText(null);
    trackDocumentRequestInitiated({
      entryPoint,
      itemCount: lines.length,
      documentType: documentTypeForEvent,
    });

    const oktaClaims = oktaAuth?.authState?.idToken?.claims as Record<string, unknown> | undefined;
    const contact = resolveDocumentRequestContact(profile, oktaClaims);

    let res: DocumentRequestApiResult;
    try {
      res = await submitDocumentRequest(
        buildDocumentRequestPayload({
          entryPoint,
          orderNumber,
          poNumber,
          lineItems: lines.map((l) => ({
            lineId: l.lineId,
            customerPartNumber: l.customerPartNumber,
            intraloxPartNumber: l.intraloxPartNumber,
            description: l.description,
            quantity: l.quantity,
          })),
          selectedAccount,
          contact,
          selectedDocTypeIds,
          documentTypeRows,
          otherDocumentTypeText: selectedIsOther ? otherDocumentType.trim() : "",
          comments: additionalNotes.trim(),
        })
      );
    } catch {
      res = { success: false };
    } finally {
      setSubmitting(false);
    }

    if (res.success) {
      setSubmittedRequestId(res.requestId ?? "");
      trackDocumentRequestSubmitted({
        entryPoint,
        itemCount: lines.length,
        documentType: documentTypeForEvent,
      });
      const hasCmsSuccessIcon = Boolean(fields.DocumentRequestConfirmationIcon?.value?.src);
      const hasSuccessCopy =
        Boolean(fields.DocumentRequestSuccessTitle?.value) ||
        Boolean(fields.DocumentRequestSuccessBody?.value) ||
        hasCmsSuccessIcon;
      if (hasSuccessCopy) {
        setSuccessOpen(true);
      } else {
        onClose();
      }
      return;
    }

    const cmsFallback = String(fields.DocumentRequestSubmissionErrorMessage?.value ?? "").trim();
    const message = (res.message && res.message.trim()) || cmsFallback || "Request failed";
    const errorType = /\b\d{3}\b/.exec(message)?.[0] ?? "Request_Failed";
    trackDocumentRequestSubmissionError({
      entryPoint,
      itemCount: lines.length,
      errorType,
    });
    setSubmitError(message);
    setSubmissionApiErrorText(message);
    setSubmissionErrorModalOpen(true);
  }, [
    selectedDocTypeIds,
    docTypes,
    documentTypeRows,
    selectedIsOther,
    otherDocumentType,
    lines,
    entryPoint,
    selectedAccount,
    orderNumber,
    poNumber,
    additionalNotes,
    onClose,
    oktaAuth?.authState?.idToken?.claims,
    profile,
    fields.DocumentRequestSuccessTitle?.value,
    fields.DocumentRequestSuccessBody?.value,
    fields.DocumentRequestConfirmationIcon?.value?.src,
    fields.DocumentRequestSubmissionErrorMessage?.value,
  ]);

  const docTypeInvalid = docTypeTouched && selectedDocTypeIds.length === 0;
  const otherInvalid = otherTouched && selectedIsOther && !otherDocumentType.trim();

  const successBodyField = useMemo(() => {
    const bodyField = fields.DocumentRequestSuccessBody;
    if (!submittedRequestId || typeof bodyField?.value !== "string") {
      return bodyField;
    }

    const replaceRequestId = (value: string): string =>
      value.split(REQUEST_ID_PLACEHOLDER).join(submittedRequestId);
    const editable = (bodyField as typeof bodyField & { editable?: unknown }).editable;

    return {
      ...bodyField,
      value: replaceRequestId(bodyField.value),
      ...(typeof editable === "string" ? { editable: replaceRequestId(editable) } : {}),
    };
  }, [fields.DocumentRequestSuccessBody, submittedRequestId]);

  if (!isOpen) {
    return null;
  }

  const panelTitle = String(fields.DocumentRequestPanelTitle?.value ?? "Request Document").trim();
  const submittingAsLabel = fields.DocumentRequestSubmittingAsLabel;
  const submittingAsTooltipField = fields.DocumentRequestSubmittingAsTooltip;
  const hasSubmittingAsHelp = sitecoreRichTextFieldHasRenderableContent(submittingAsTooltipField);

  const primaryActionLabelField =
    submitError && String(fields.DocumentRequestRetryLabel?.value ?? "").trim()
      ? fields.DocumentRequestRetryLabel
      : fields.DocumentRequestSubmitLabel;

  return (
    <>
      <DialogOverlay
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
        className={cn(
          "fixed inset-0 z-[1040] overscroll-y-contain",
          "bg-black/50 backdrop-blur-sm",
          "data-[entering]:animate-in data-[entering]:fade-in-0",
          "data-[exiting]:animate-out data-[exiting]:fade-out-0"
        )}
      >
        <Dialog
          className={cn(
            "flex h-dvh max-h-dvh flex-col overflow-hidden bg-white shadow-2xl outline-none",
            !isMobile && "max-w-[min(581px,100vw)]",
            !isMobile &&
              (layoutMode === "single" ? "w-[min(565px,100vw)]" : "w-[min(581px,100vw)]"),
            "fixed top-0 z-[1050] bg-white shadow-xl outline-none",
            "data-[entering]:animate-in data-[exiting]:animate-out",
            isMobile
              ? "left-0 right-0 w-full data-[entering]:fade-in-0 data-[exiting]:fade-out-0"
              : "right-0 w-full data-[entering]:slide-in-from-right data-[exiting]:slide-out-to-right"
          )}
        >
          {({ close }) => {
            const finishClose = () => {
              close();
              onClose();
            };
            const dismissSuccess = () => {
              trackConfirmationCloseOnce();
              setSuccessOpen(false);
              finishClose();
            };
            const handleCloseBtn = () => {
              if (successOpen) {
                dismissSuccess();
                return;
              }
              if (!dirty) {
                trackPanelDismissOnce();
                finishClose();
                return;
              }
              setUnsavedOpen(true);
            };

            if (successOpen) {
              return (
                <>
                  <div className="border-0 bg-transparent">
                    <div className="flex items-center justify-between gap-[13px] bg-white px-[24px] py-[20px]">
                      <div className="min-w-0 flex-1">&nbsp;</div>
                      <ModalCloseIcon handleCloseBtn={handleCloseBtn} width="36px" height="36px" />
                    </div>
                  </div>

                  <div
                    className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-y-auto"
                    role="region"
                    aria-live="polite"
                    aria-label="Request submitted"
                  >
                    <div className="box-border flex w-full max-w-[432px] flex-col items-center gap-[36px] pt-[32px] px-[24px] pb-[48px] sm:pt-[80px] sm:px-[48px] sm:pb-[64px]">
                      <div className="flex w-full flex-col items-center gap-[16px]">
                        <div
                          className="flex h-[61px] w-[61px] shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-green-light)]"
                          data-testid="document-request-success-icon"
                        >
                          {fields.DocumentRequestConfirmationIcon?.value?.src ? (
                            <SitecoreImage
                              field={fields.DocumentRequestConfirmationIcon}
                              width={21}
                              height={24}
                              className="max-h-[48px] max-w-[48px] object-contain"
                              alt=""
                            />
                          ) : (
                            <Icon
                              icon={faCheck}
                              className="h-[22px] w-[22px] text-[var(--color-text-verified)]"
                              width={21}
                              height={24}
                              aria-hidden
                            />
                          )}
                        </div>

                        <h2
                          className={`m-0 w-[336px] max-w-full text-center text-[24px] font-medium leading-[150%] text-black [font-family:"Helvetica_Neue_LT_Web","Helvetica_Neue",Helvetica,Arial,sans-serif]`}
                        >
                          {fields.DocumentRequestSuccessTitle ? (
                            <Text field={fields.DocumentRequestSuccessTitle} tag="span" />
                          ) : (
                            "Request Submitted"
                          )}
                        </h2>

                        {successBodyField?.value ? (
                          <div className="w-full text-center">
                            <RichText
                              field={successBodyField as unknown as RichTextField}
                              className="text-center text-[18px] leading-[1.5] text-[#4D4D4F] [&_p]:m-0 [&_p+p]:mt-2"
                            />
                          </div>
                        ) : (
                          <p className="text-center text-[18px] leading-[1.5] text-[#4D4D4F]">
                            Your request has been successfully sent to our team for review and will
                            be in touch by email within the next 1-2 business days.
                          </p>
                        )}
                      </div>

                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="primary"
                          className="!min-h-[42px] !rounded-full !px-[20px] !py-[12px] text-[14px] font-[400] leading-[1.25]"
                          onPress={dismissSuccess}
                        >
                          {fields.DocumentRequestSuccessCloseLabel ? (
                            <Text field={fields.DocumentRequestSuccessCloseLabel} tag="span" />
                          ) : (
                            "Close Window"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              );
            }

            return (
              <>
                <div className="border-0 bg-transparent">
                  <div className="flex items-center justify-between gap-[13px] bg-white px-[24px] py-[20px]">
                    <div className="min-w-0 flex-1">
                      <AriaHeading slot="title" className="text-xl font-semibold text-gray-900">
                        {panelTitle}
                      </AriaHeading>
                      {sitecoreRichTextFieldHasRenderableContent(
                        fields.DocumentRequestPanelSubheading
                      ) ? (
                        <div className="mt-1 text-[14px] leading-[1.375] text-[#222]">
                          <RichText
                            field={
                              fields.DocumentRequestPanelSubheading as unknown as RichTextField
                            }
                            className="m-0 text-[14px] font-normal leading-[1.375] text-[#222] [&_p]:m-0 [&_p+p]:mt-1"
                          />
                        </div>
                      ) : null}
                    </div>
                    <ModalCloseIcon handleCloseBtn={handleCloseBtn} />
                  </div>

                  <div className="border-b border-[var(--color-quote-drawer-header-border)] bg-[var(--color-quote-drawer-submitting-as-bg)] px-[16px] py-[10px] md:px-[24px]">
                    <div className="flex min-h-[31px] w-full flex-row items-start justify-start gap-[20px]">
                      <div className="flex max-w-[120px] shrink-0 flex-row items-center justify-center gap-[3px] pt-[1px]">
                        {submittingAsLabel ? (
                          <Text
                            field={submittingAsLabel}
                            tag="span"
                            className="text-[10px] font-bold uppercase leading-[14px] tracking-[0.5px] text-[#7a7b7f]"
                          />
                        ) : (
                          <span className="text-[10px] font-bold uppercase leading-[14px] tracking-[0.5px] text-[#7a7b7f]">
                            Submitting As
                          </span>
                        )}
                        {hasSubmittingAsHelp && submittingAsTooltipField ? (
                          <SubmittingAsHelpTooltip
                            ariaLabel="Document request account information"
                            trigger={
                              <Icon
                                icon={faCircleInfo}
                                width={12}
                                height={11}
                                aria-hidden
                                className="h-[11px] w-[12px] text-[var(--color-text-secondary)]"
                              />
                            }
                            tooltipField={submittingAsTooltipField as RichTextField}
                          />
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-[2px]">
                        {submittingLines.title ? (
                          <>
                            <div className="w-full text-[11px] font-medium leading-[137.5%] text-[#4d4d4f]">
                              {submittingLines.title}
                            </div>
                            {submittingLines.body ? (
                              <div className="w-full text-[10px] font-normal leading-[137.5%] text-[#4d4d4f]">
                                {submittingLines.body}
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-[11px] text-[#99a1af]">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
                  {isLoading ? (
                    <div
                      className="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      <LoadingSkeleton variant="spinner" size="medium" />
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      "shrink-0 overflow-visible gap-[20px] pt-[24px] px-[24px] pb-[20px]",
                      layoutMode === "multi" && "flex flex-col p-[21px] pb-[20px] gap-[21px]"
                    )}
                  >
                    <div className="m-0 mb-[20px] text-[16px] font-medium leading-[1.5] text-[var(--color-text-black)]">
                      {sectionHeading}
                    </div>

                    {layoutMode === "single" ? (
                      lines.map((line) => {
                        const cust = String(line.customerPartNumber ?? "").trim() || "—";
                        const intra = String(line.intraloxPartNumber ?? "").trim() || "—";
                        return (
                          <div
                            key={line.lineId}
                            className="mb-[20px] flex flex-col items-start gap-[10px] rounded-[4px] border-0 bg-[#f7f8fa] p-[16px] box-border"
                          >
                            <div className="flex flex-row flex-wrap items-center gap-[8px]">
                              <span className="text-[12px] font-normal leading-[16px] text-[#646467]">
                                PO # {poNumber}
                              </span>
                              <span
                                className="text-[12px] font-normal leading-[15px] text-[#7a7b7f]"
                                aria-hidden
                              >
                                {"\u2022"}
                              </span>
                              <span className="text-[12px] font-normal leading-[16px] text-[#646467]">
                                Order # {orderNumber}
                              </span>
                            </div>
                            <div className="w-full text-[12px] font-medium leading-[16px] text-[#222]">
                              Customer Part # {cust} | Intralox Part # {intra}
                            </div>
                            <div className="mt-0 whitespace-pre-wrap text-[12px] leading-[1.375] text-[#222]">
                              {line.description}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="shrink-0">
                        {lines.map((line) => {
                          const cust = String(line.customerPartNumber ?? "").trim() || "—";
                          const intra = String(line.intraloxPartNumber ?? "").trim() || "—";
                          return (
                            <div
                              key={line.lineId}
                              className="mb-[14px] box-border flex flex-col gap-0 rounded-[4px] border border-[#d7d9da] bg-white p-[16px] last:mb-0"
                            >
                              <div className="flex w-full flex-col items-stretch gap-[10px]">
                                <div className="flex w-full flex-row items-start justify-between gap-[10px] box-border">
                                  <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-[8px]">
                                    <span className="text-[12px] font-normal leading-[16px] text-[#646467]">
                                      PO # {poNumber}
                                    </span>
                                    <span
                                      className="text-[12px] font-normal leading-[15px] text-[#7a7b7f]"
                                      aria-hidden
                                    >
                                      {"\u2022"}
                                    </span>
                                    <span className="text-[12px] font-normal leading-[16px] text-[#646467]">
                                      Order # {orderNumber}
                                    </span>
                                  </div>
                                  <div className="flex">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      btnVariant="iconBtn"
                                      className="!h-0 !px-0 !py-0 !text-[#99a1af] hover:!text-[#6b7280]"
                                      aria-label="Remove line from request"
                                      onPress={() => removeLine(line.lineId)}
                                    >
                                      <Icon icon={faTrashAlt} width={16} height={16} aria-hidden />
                                    </Button>
                                  </div>
                                </div>
                                <div className="w-full text-[12px] font-medium leading-[16px] text-[#222]">
                                  Customer Part # {cust} | Intralox Part # {intra}
                                </div>
                                <div className="mt-0 whitespace-pre-wrap text-[12px] leading-[1.375] text-[#222]">
                                  {line.description}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 box-border flex flex-col gap-[20px] bg-white px-[24px] pt-[8px] pb-[20px]">
                    <div ref={docTypeSectionRef} className="flex flex-col gap-[8px]">
                      {fields.DocumentRequestDocumentTypeLabel ? (
                        <label className="text-[14px] font-[500] leading-[1.38] text-[#222222]">
                          <Text field={fields.DocumentRequestDocumentTypeLabel} tag="span" />
                          <span className="text-[14px] leading-none text-[#ea1c24]" aria-hidden>
                            *
                          </span>
                        </label>
                      ) : (
                        <span className="text-[14px] font-[500] leading-[1.38] text-[#222222]">
                          Document type
                          <span className="text-[14px] leading-none text-[#ea1c24]" aria-hidden>
                            *
                          </span>
                        </span>
                      )}
                      <div
                        className={cn(
                          "grid w-full auto-rows-fr grid-cols-2 gap-[6px] sm:grid-cols-4 sm:gap-[8px]",
                          docTypeInvalid && "border-[#dc2626]"
                        )}
                        role="group"
                        aria-invalid={docTypeInvalid}
                        aria-describedby={docTypeInvalid ? "doc-type-err" : undefined}
                      >
                        {docTypes.map((row) => {
                          const label = String(
                            row.fields?.Label?.value ?? row.displayName ?? ""
                          ).trim();
                          const selected = selectedDocTypeIds.includes(row.id);
                          return (
                            <button
                              key={row.id}
                              type="button"
                              role="checkbox"
                              aria-checked={selected}
                              className={cn(
                                "relative box-border flex min-h-[50px] w-full min-w-0 items-center justify-center rounded-[2px] border border-[#d7d9da] bg-white px-[6px] py-[8px] text-center text-[11px] leading-[1.25] text-[#222] cursor-pointer hover:border-[#9ca3af] sm:min-h-[52px] sm:px-[8px] sm:py-[10px] sm:text-[12px]",
                                selected &&
                                  "border-[#00287b] bg-[rgba(223,235,255,0.5)] text-[#19174f] shadow-[inset_0_0_0_1px_#00287b] after:content-['✓'] after:absolute after:top-[-7px] after:right-[-7px] after:inline-flex after:h-[20px] after:w-[20px] after:items-center after:justify-center after:rounded-full after:bg-[#00287b] after:text-[11px] after:font-bold after:text-white",
                                docTypeInvalid && "border-[#dc2626]"
                              )}
                              onClick={() => {
                                const value = String(row.fields?.Value?.value ?? "").trim();
                                setSelectedDocTypeIds((prev) =>
                                  prev.includes(row.id)
                                    ? prev.filter((id) => id !== row.id)
                                    : [...prev, row.id]
                                );
                                if (!selected && value) {
                                  trackDocumentRequestDocumentTypeSelected({
                                    entryPoint,
                                    documentType: value,
                                  });
                                }
                                setDocTypeTouched(true);
                              }}
                            >
                              {label || "—"}
                            </button>
                          );
                        })}
                      </div>
                      {docTypeInvalid ? (
                        <p
                          className="text-[14px] leading-[1.38] text-[var(--color-text-red)]"
                          role="alert"
                          id="doc-type-err"
                        >
                          Please select a document type.
                        </p>
                      ) : null}
                    </div>

                    {selectedIsOther ? (
                      <div className="flex flex-col gap-[8px]">
                        {fields.DocumentRequestOtherTypeLabel ? (
                          <label
                            className="text-[14px] font-[500] leading-[1.38] text-[#222222]"
                            htmlFor="doc-req-other-type"
                          >
                            <Text field={fields.DocumentRequestOtherTypeLabel} tag="span" />
                            <span className="text-[14px] leading-none text-[#ea1c24]" aria-hidden>
                              *
                            </span>
                          </label>
                        ) : (
                          <label
                            className="text-[14px] font-[500] leading-[1.38] text-[#222222]"
                            htmlFor="doc-req-other-type"
                          >
                            Other document type
                            <span className="text-[14px] leading-none text-[#ea1c24]" aria-hidden>
                              *
                            </span>
                          </label>
                        )}

                        <Input
                          id="doc-req-other-type"
                          className="w-full min-h-[39px] rounded-[2px] border border-[#d1d5db] px-[12px] py-[10px] text-[14px] leading-[1.375] text-[#222]"
                          value={otherDocumentType}
                          state={otherInvalid ? "error" : "base"}
                          onChange={(e) => setOtherDocumentType(e.target.value)}
                          onBlur={() => {
                            setOtherTouched(true);
                            if (otherDocumentType.trim()) {
                              trackDocumentRequestOtherDocumentTypeEntered({ entryPoint });
                            }
                          }}
                          placeholder={fields.DocumentRequestOtherTypePlaceholder?.value ?? ""}
                          aria-invalid={otherInvalid}
                          aria-describedby={otherInvalid ? "doc-req-other-type-error" : undefined}
                        />

                        {otherInvalid ? (
                          <p
                            className="text-[14px] leading-[1.38] text-[var(--color-text-red)]"
                            role="alert"
                            id="doc-req-other-type-error"
                          >
                            This field is required.
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-[8px]">
                      {fields.DocumentRequestAdditionalNotesLabel ? (
                        <label
                          className="text-[14px] font-[500] leading-[1.38] text-[#222222]"
                          htmlFor="doc-req-notes"
                        >
                          <Text field={fields.DocumentRequestAdditionalNotesLabel} tag="span" />
                        </label>
                      ) : (
                        <label
                          className="text-[14px] font-[500] leading-[1.38] text-[#222222]"
                          htmlFor="doc-req-notes"
                        >
                          Additional notes
                        </label>
                      )}
                      <Textarea
                        id="doc-req-notes"
                        className="w-full min-h-[100px] rounded-[2px] border border-[#d1d5db] px-[12px] py-[10px] text-[14px] leading-[1.375] text-[#222]"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder={String(
                          fields.DocumentRequestAdditionalNotesPlaceholder?.value ?? ""
                        )}
                      />
                    </div>
                  </div>
                </div>

                {lines.length > 0 ? (
                  <div
                    className="shrink-0 border-t border-[#e5e7eb] bg-white px-[24px] pt-[20px] flex flex-col items-stretch gap-[10px]"
                    style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom, 0px))" }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-[16px] bg-white sm:flex-nowrap">
                      <Button
                        type="button"
                        variant="muted"
                        className="min-w-[112px] !rounded-full text-[13px] font-normal leading-[1.25] !px-[20px] !py-[12px]"
                        onPress={() => {
                          if (!dirty) {
                            trackPanelDismissOnce();
                            finishClose();
                            return;
                          }
                          setUnsavedOpen(true);
                        }}
                      >
                        {fields.DocumentRequestCancelLabel ? (
                          <Text field={fields.DocumentRequestCancelLabel} tag="span" />
                        ) : (
                          "Cancel"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onPress={() => void handleSubmit()}
                        isDisabled={submitting}
                        aria-busy={submitting || undefined}
                      >
                        {submitting ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <span
                              className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white"
                              aria-hidden
                            />
                            {primaryActionLabelField ? (
                              <Text field={primaryActionLabelField} tag="span" />
                            ) : (
                              <span>Submit Request</span>
                            )}
                          </span>
                        ) : primaryActionLabelField ? (
                          <Text field={primaryActionLabelField} tag="span" />
                        ) : (
                          "Submit Request"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            );
          }}
        </Dialog>
      </DialogOverlay>

      <Modal
        isOpen={unsavedOpen}
        onClose={() => setUnsavedOpen(false)}
        title={
          fields.DocumentRequestUnsavedDialogTitle ? (
            <Text field={fields.DocumentRequestUnsavedDialogTitle} tag="span" />
          ) : (
            "Discard changes?"
          )
        }
        size="md"
      >
        <div className="flex flex-col gap-6">
          {fields.DocumentRequestUnsavedDialogBody?.value ? (
            <div className="text-[#374151]">
              <RichText
                field={fields.DocumentRequestUnsavedDialogBody as unknown as RichTextField}
                className="text-[14px] leading-[1.5] [&_p]:m-0 [&_p+p]:mt-2"
              />
            </div>
          ) : (
            <p className="text-gray-700">You have unsaved changes.</p>
          )}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              // variant="muted"
              // className="!px-[20px] !py-[12px]"
              onPress={() => setUnsavedOpen(false)}
            >
              {fields.DocumentRequestUnsavedCancelLabel ? (
                <Text field={fields.DocumentRequestUnsavedCancelLabel} tag="span" />
              ) : (
                "Cancel"
              )}
            </Button>
            <Button
              type="button"
              variant="primary"
              className="!px-[20px] !py-[12px]"
              onPress={confirmDiscard}
            >
              {fields.DocumentRequestUnsavedConfirmLabel ? (
                <Text field={fields.DocumentRequestUnsavedConfirmLabel} tag="span" />
              ) : (
                "Yes, Discard"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={submissionErrorModalOpen}
        onClose={() => {
          setSubmissionErrorModalOpen(false);
        }}
        title="Submission failed"
        size="md"
      >
        <div className="flex flex-col gap-6">
          <p className="text-[14px] leading-[1.5] text-[#374151]">
            {submissionApiErrorText ?? "The document request could not be sent. Please try again."}
          </p>
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="primary"
              onPress={() => {
                setSubmissionErrorModalOpen(false);
              }}
            >
              {fields.DocumentRequestRetryLabel ? (
                <Text field={fields.DocumentRequestRetryLabel} tag="span" />
              ) : (
                "OK"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
