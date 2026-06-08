"use client";

import {
  RichText,
  RichTextField,
  Image as SitecoreImage,
  Text,
} from "@sitecore-content-sdk/nextjs";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { Icon, Label } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

import type {
  QuoteRequestCmsFields,
  QuoteRequestGeneralFieldErrors,
} from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

export interface QuoteRequestGeneralStepProps {
  quoteCms?: QuoteRequestCmsFields;
  hasOrdersHistory: boolean;
  application: string;
  productDetails: string;
  comments: string;
  fieldErrors: QuoteRequestGeneralFieldErrors;
  isSaving: boolean;
  onChange: (next: { application: string; productDetails: string; comments: string }) => void;
  onCancel: () => void;
  onContinue: () => void;
  onSearchOrders: () => void;
}

export function QuoteRequestGeneralStep({
  quoteCms,
  hasOrdersHistory,
  application,
  productDetails,
  comments,
  fieldErrors,
  isSaving,
  onChange,
  onCancel,
  onContinue,
  onSearchOrders,
}: QuoteRequestGeneralStepProps): React.ReactElement {
  const showBanner = hasOrdersHistory && quoteCms?.HideBanner?.value !== true;
  const commentsRequired =
    (quoteCms?.GeneralEntryCommentsRequiredIndicator?.value ?? false) === true;
  const applicationRequired = (quoteCms?.ApplicationRequiredIndicator?.value ?? false) === true;
  const productDetailsRequired = (quoteCms?.ProductDetailsIndicator?.value ?? false) === true;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pt-[24px] md:px-[24px]">
        <div className="flex flex-col gap-10">
          {showBanner ? (
            <div
              className="flex items-start gap-3 overflow-hidden rounded-[4px] border border-solid p-4 bg-[var(--color-gray-100)] border-[var(--color-quote-drawer-info-banner-border)]"
              role="status"
            >
              <div className="flex shrink-0 items-start pt-[2px]">
                {quoteCms?.BannerIcon?.value?.src && quoteCms?.BannerIcon ? (
                  <SitecoreImage
                    field={quoteCms.BannerIcon}
                    width={18}
                    height={18}
                    sizes="18px"
                    className="h-[18px] w-[18px] shrink-0 text-[var(--color-cyan-default)]"
                    alt=""
                    aria-hidden
                  />
                ) : (
                  <Icon
                    icon={faCircleInfo}
                    width={18}
                    className="h-[18px] w-[18px] shrink-0 text-[var(--color-cyan-default)]"
                    aria-hidden
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {quoteCms?.BannerHeading ? (
                  <Text
                    field={quoteCms?.BannerHeading}
                    tag="p"
                    className="m-0 text-[14px] font-medium leading-[1.375] text-[var(--color-text-heading-color)]"
                  />
                ) : null}
                <div className="m-0 w-full min-w-0 text-left text-[12px] font-normal leading-[1.375] text-[var(--color-text-heading-color)]">
                  {quoteCms?.BannerText ? (
                    <RichText field={quoteCms.BannerText as unknown as RichTextField} tag="span" />
                  ) : null}
                  {quoteCms?.BannerText && quoteCms?.BannerLinkLabel ? " " : null}
                  {quoteCms?.BannerLinkLabel ? (
                    <Button
                      type="button"
                      variant="transparent"
                      className="inline cursor-pointer border-0 bg-transparent p-0 align-baseline text-[12px] font-normal leading-[1.375] text-[var(--color-link-text)] underline [text-decoration-skip-ink:none] hover:text-[var(--color-menu-hover-color)]"
                      onPress={onSearchOrders}
                    >
                      <Text field={quoteCms.BannerLinkLabel} tag="span" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex flex-col gap-[28px]">
            {quoteCms?.FormIntroText ? (
              <RichText
                field={quoteCms?.FormIntroText as unknown as RichTextField}
                className="m-0 text-[16px] font-[400] leading-[1.375] text-[var(--color-text-black)]"
              />
            ) : null}
            <div className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[10px]">
                {quoteCms?.ApplicationLabel ? (
                  <Label
                    htmlFor="qr-general-application"
                    className="text-[14px] font-medium leading-[1.375] text-[var(--color-text-heading-color)]"
                    isRequired={applicationRequired}
                    state={fieldErrors.application ? "error" : "base"}
                  >
                    <Text field={quoteCms?.ApplicationLabel} tag="span" />
                  </Label>
                ) : null}
                <Input
                  id="qr-general-application"
                  className="!h-[43px] !rounded-[2px] !px-[12px] !py-[10px] border-[#D1D5DB] text-[14px] font-[400] leading-[1.25] focus-visible:ring-0"
                  value={application}
                  state={fieldErrors.application ? "error" : "base"}
                  aria-invalid={Boolean(fieldErrors.application)}
                  aria-describedby={
                    fieldErrors.application ? "qr-general-application-error" : undefined
                  }
                  onChange={(e) =>
                    onChange({ application: e.target.value, productDetails, comments })
                  }
                  placeholder={
                    quoteCms?.ApplicationPlaceholder?.value
                      ? String(quoteCms?.ApplicationPlaceholder.value)
                      : ""
                  }
                />
                {fieldErrors.application ? (
                  <p
                    className="text-[12px] text-[var(--color-text-red)]"
                    role="alert"
                    id="qr-general-application-error"
                  >
                    {fieldErrors.application}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                {quoteCms?.ProductDetailsLabel ? (
                  <Label
                    htmlFor="qr-general-product-details"
                    className="text-[14px] font-medium leading-[1.375] text-[var(--color-text-heading-color)]"
                    isRequired={productDetailsRequired}
                    state={fieldErrors.productDetails ? "error" : "base"}
                  >
                    <Text field={quoteCms?.ProductDetailsLabel} tag="span" />
                  </Label>
                ) : null}
                <Input
                  id="qr-general-product-details"
                  className="!h-[43px] !rounded-[2px] !px-[12px] !py-[10px] border-[#D1D5DB] text-[14px] font-[400] leading-[1.25] focus-visible:ring-0"
                  value={productDetails}
                  state={fieldErrors.productDetails ? "error" : "base"}
                  aria-invalid={Boolean(fieldErrors.productDetails)}
                  aria-describedby={
                    fieldErrors.productDetails ? "qr-general-product-details-error" : undefined
                  }
                  onChange={(e) =>
                    onChange({ application, productDetails: e.target.value, comments })
                  }
                  placeholder={
                    quoteCms?.ProductDetailsPlaceholder?.value
                      ? String(quoteCms?.ProductDetailsPlaceholder.value)
                      : ""
                  }
                />
                {fieldErrors.productDetails ? (
                  <p
                    className="text-[12px] text-[var(--color-text-red)]"
                    role="alert"
                    id="qr-general-product-details-error"
                  >
                    {fieldErrors.productDetails}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="qr-general-comments"
                  className="text-[14px] font-medium leading-[1.375] text-[var(--color-text-heading-color)]"
                  isRequired={commentsRequired}
                  state={fieldErrors.comments ? "error" : "base"}
                >
                  {quoteCms?.GeneralEntryCommentsFieldLabel ? (
                    <Text field={quoteCms?.GeneralEntryCommentsFieldLabel} tag="span" />
                  ) : null}
                </Label>
                <Textarea
                  id="qr-general-comments"
                  className="!h-[114px] !min-h-[114px] !rounded-[2px] !px-[12px] !py-[10px] text-[14px] font-[400] leading-[1.25] focus-visible:ring-0"
                  value={comments}
                  onChange={(e) =>
                    onChange({ application, productDetails, comments: e.target.value })
                  }
                  state={fieldErrors.comments ? "error" : "base"}
                  aria-invalid={Boolean(fieldErrors.comments)}
                  aria-describedby={fieldErrors.comments ? "qr-general-comments-error" : undefined}
                  placeholder={
                    quoteCms?.GeneralEntryCommentsFieldPlaceholder?.value
                      ? String(quoteCms?.GeneralEntryCommentsFieldPlaceholder.value)
                      : ""
                  }
                />
                {fieldErrors.comments ? (
                  <p
                    className="text-[12px] text-[var(--color-text-red)]"
                    role="alert"
                    id="qr-general-comments-error"
                  >
                    {fieldErrors.comments}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[var(--color-quote-drawer-footer-border)] bg-[var(--color-bg-basic-color)] px-[16px] pt-[20px] pb-[max(20px,env(safe-area-inset-bottom,0px))] md:px-[24px]">
        <Button
          type="button"
          variant="muted"
          className="min-w-[112px] !rounded-full text-[13px] font-normal leading-[1.25] !py-[12px] !px-[20px]"
          isDisabled={isSaving}
          onPress={onCancel}
        >
          {quoteCms?.GeneralEntryCancelButtonLabel ? (
            <Text field={quoteCms?.GeneralEntryCancelButtonLabel} tag="span" />
          ) : null}
        </Button>
        <Button
          type="button"
          variant="primary"
          className="!rounded-full text-[13px] font-normal leading-[1.25] !py-[12px] !px-[20px]"
          isDisabled={isSaving}
          onPress={onContinue}
        >
          {quoteCms?.GeneralEntrySubmitButtonLabel ? (
            <Text field={quoteCms?.GeneralEntrySubmitButtonLabel} tag="span" />
          ) : null}
        </Button>
      </div>
    </div>
  );
}
