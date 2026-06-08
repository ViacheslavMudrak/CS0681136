"use client";

import { RichText, RichTextField, Text } from "@sitecore-content-sdk/nextjs";
import React from "react";

import ContextualPanel from "@/components/shared/contextual-panel/ContextualPanel";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import type { UseQuoteRequestReturn } from "@/hooks/useQuoteRequest";

import { QuoteRequestConfirmationStep } from "./QuoteRequestConfirmationStep";
import { QuoteRequestDiscardDialog } from "./QuoteRequestDiscardDialog";
import { QuoteRequestGeneralStep } from "./QuoteRequestGeneralStep";
import { QuoteRequestLineStep } from "./QuoteRequestLineStep";
import { QuoteRequestReviewStep } from "./QuoteRequestReviewStep";
import { QuoteRequestSubmittingAs } from "./QuoteRequestSubmittingAs";

export type QuoteRequestController = UseQuoteRequestReturn;

export interface QuoteRequestDrawerProps {
  qr: QuoteRequestController;
}

export function QuoteRequestDrawer({ qr }: QuoteRequestDrawerProps): React.ReactElement {
  const {
    quoteCms,
    draft,
    isOpen,
    closeDrawer,
    step,
    generalForm,
    setGeneralForm,
    lineForm,
    setLineForm,
    generalFieldErrors,
    reviewAdditional,
    onUpdateReviewNotes,
    onContinueGeneral,
    onContinueLine,
    onAddAnother,
    onSearchOrders,
    onDeleteItem,
    onEditGeneral,
    onEditLine,
    onEditOrderQuoteLine,
    onDeleteOrderQuoteLine,
    onCancelLineStep,
    orderHeaderReview,
    onConfirmDiscard,
    discardOpen,
    setDiscardOpen,
    hasOrdersHistory,
    isSaving,
    isFetchingOrderLines,
    isSubmittingRequest,
    submitError,
    submittedRequestId,
    onSubmitRequest,
  } = qr;

  return (
    <>
      <ContextualPanel
        isOpen={isOpen}
        onClose={closeDrawer}
        className="!rounded-none !bg-white !shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
        titleContent={
          step === "confirmation" ? undefined : quoteCms?.DrawerTitle ? (
            <Text field={quoteCms.DrawerTitle} tag="span" />
          ) : undefined
        }
        descriptionContent={
          step !== "confirmation" && quoteCms?.DrawerSubheading ? (
            <RichText
              field={quoteCms.DrawerSubheading as unknown as RichTextField}
              className="m-0 mt-1 text-[14px] font-normal leading-[1.375] text-[var(--color-text-heading-color)]"
            />
          ) : undefined
        }
        headerFooterContent={
          step !== "confirmation" ? <QuoteRequestSubmittingAs quoteCms={quoteCms} /> : undefined
        }
        width="w-full sm:max-w-[560px] sm:w-[560px]"
        headerShellClassName={
          step !== "confirmation" ? "!m-0 !bg-[var(--color-quote-drawer-header-bg)] !p-0" : undefined
        }
        headerTopClassName={
          step !== "confirmation"
            ? "border-0 border-b border-solid !border-b-[var(--color-quote-drawer-header-border)] bg-transparent px-[16px] md:px-[24px] py-[20px]"
            : undefined
        }
        titleClassName={
          step !== "confirmation"
            ? "text-[20px] font-bold leading-[1.5] text-[var(--color-text-black)]"
            : undefined
        }
        closeButtonClassName={
          step !== "confirmation"
            ? "!h-[32px] !w-[32px] !rounded-full !border-0 !bg-[#e8eaeb] !text-[#7a7b7f] cursor-pointer hover:!bg-[var(--color-bg-light-gray-active)] hover:!text-[var(--color-text-heading-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-basic-color)] focus-visible:ring-offset-1 [&>span]:text-[14px] [&>span]:leading-[14px]"
            : undefined
        }
        contentClassName="!flex !min-h-0 !flex-1 !flex-col !overflow-hidden !p-0"
      >
        <>
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {isFetchingOrderLines || isSaving || isSubmittingRequest ? (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
                aria-live="polite"
                aria-busy="true"
              >
                <LoadingSkeleton variant="spinner" size="medium" />
              </div>
            ) : null}
            {step === "general" ? (
              <QuoteRequestGeneralStep
                quoteCms={quoteCms}
                hasOrdersHistory={hasOrdersHistory}
                application={generalForm.application}
                productDetails={generalForm.productDetails}
                comments={generalForm.comments}
                fieldErrors={generalFieldErrors}
                isSaving={isSaving}
                onChange={setGeneralForm}
                onCancel={closeDrawer}
                onContinue={onContinueGeneral}
                onSearchOrders={onSearchOrders}
              />
            ) : null}
            {step === "lineItem" && lineForm ? (
              <QuoteRequestLineStep
                quoteCms={quoteCms}
                order={lineForm.order}
                line={lineForm.line}
                comments={lineForm.comments}
                isSaving={isSaving}
                isEditing={
                  lineForm.editingLineSequence != null || lineForm.editingOrderQuoteLine != null
                }
                onChangeComments={(v) =>
                  setLineForm((prev) => (prev ? { ...prev, comments: v } : null))
                }
                onCancel={onCancelLineStep}
                onContinue={onContinueLine}
              />
            ) : null}
            {step === "review" ? (
              <QuoteRequestReviewStep
                quoteCms={quoteCms}
                draft={draft}
                orderHeaderReview={orderHeaderReview}
                reviewAdditional={reviewAdditional}
                isSaving={isSaving}
                isSubmitting={isSubmittingRequest}
                submitError={submitError}
                onReviewAdditionalChange={onUpdateReviewNotes}
                onAddAnother={onAddAnother}
                onEditGeneral={onEditGeneral}
                onEditLine={onEditLine}
                onEditOrderQuoteLine={onEditOrderQuoteLine}
                onDeleteOrderQuoteLine={onDeleteOrderQuoteLine}
                onDelete={onDeleteItem}
                onDiscard={() => setDiscardOpen(true)}
                onSubmit={() => {
                  void onSubmitRequest();
                }}
              />
            ) : null}
            {step === "confirmation" && submittedRequestId ? (
              <QuoteRequestConfirmationStep
                quoteCms={quoteCms}
                requestId={submittedRequestId}
                onClose={closeDrawer}
              />
            ) : null}
          </div>
        </>
      </ContextualPanel>
      <QuoteRequestDiscardDialog
        isOpen={discardOpen}
        quoteCms={quoteCms}
        isSaving={isSaving}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => {
          void onConfirmDiscard();
        }}
      />
    </>
  );
}
