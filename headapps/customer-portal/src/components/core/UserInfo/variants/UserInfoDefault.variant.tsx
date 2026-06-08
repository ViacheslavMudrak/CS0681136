"use client";

import { Image as SitecoreImage, Text } from "@sitecore-content-sdk/nextjs";
import React, { useCallback, useMemo } from "react";

import Button from "@/components/ui/Button";
import { QuoteRequestDrawer } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { useDeviceType } from "@/hooks/use-device-type";
import { useQuoteRequest } from "@/hooks/useQuoteRequest";
import type { ComponentProps } from "@/lib/component-props";
import { trackDashboardRequestQuoteHeaderClick } from "@/lib/dashboardAnalytics";
import { localizeHref } from "@/lib/locale-path";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { usePermissionContext } from "@/lib/permission-context";
import { useProfileContext } from "@/lib/profile-context";
import { useUserProfile } from "@/lib/user-profile-context";
import { joinUserGreetingPrefixAndFirstName, resolveUserInfoFirstName } from "@/lib/userInfoUtils";

import type { IUserInfoFields } from "../UserInfo.type";

interface UserInfoDefaultVariantProps {
  testId: string;
  fields: IUserInfoFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

function prefixFirstNameSeparator(prefix: string): string {
  const p = prefix.trim();
  if (!p) {
    return "";
  }
  return p.endsWith(",") ? " " : ", ";
}

/**
 * Client subtree: personalized greeting, request-quote CTA with permissions, and quote drawer.
 */
function UserInfoDefaultVariantContent({
  fields,
  paramsStyles,
  renderingId,
  isEditing,
  hideRequestQuoteButton,
}: {
  fields: IUserInfoFields;
  paramsStyles: string;
  renderingId?: string;
  isEditing: boolean;
  hideRequestQuoteButton?: boolean;
}): React.ReactElement {
  const { profile } = useUserProfile();
  const firstName = useMemo(() => resolveUserInfoFirstName(profile), [profile]);

  const { can } = usePermissionContext();
  const canRequestQuote = can(PERMISSION_CODES.INITIATE_RFQ);
  const showRequestQuoteButton = isEditing || (canRequestQuote && !hideRequestQuoteButton);

  const { selectedAccount } = useProfileContext();
  const accountId = selectedAccount?.id ?? "";
  const accountNumeric = Number.parseInt(String(accountId), 10) || 0;

  const activeLocale = useActiveLocale();
  const ordersTabHref = useMemo(
    () => localizeHref("/orders-management/orders", activeLocale),
    [activeLocale]
  );

  const quoteRequest = useQuoteRequest({
    accountId,
    accountNumeric,
    fields,
    hasOrdersHistory: false,
    ordersTabHref,
  });

  const { device, isMobile, isTablet } = useDeviceType();
  const headerQuoteDeviceType = useMemo((): "desktop" | "tablet" | "mobile" => {
    if (device == null) return "desktop";
    if (isMobile) return "mobile";
    if (isTablet) return "tablet";
    return "desktop";
  }, [device, isMobile, isTablet]);

  const onRequestQuoteHeaderPress = useCallback(() => {
    if (!isEditing) {
      trackDashboardRequestQuoteHeaderClick({ deviceType: headerQuoteDeviceType });
    }
    quoteRequest.openFromHeader();
  }, [isEditing, headerQuoteDeviceType, quoteRequest]);

  const requestQuoteLabelDesktop = quoteRequest.hasPendingDraft
    ? fields.ModifyPendingQuoteTitle
    : fields.RequestQuoteLabelDesktop;
  const useModifyIcon =
    quoteRequest.hasPendingDraft && Boolean(fields.ModifyPendingQuoteIcon?.value?.src);

  const prefixRaw = String(fields.UserTitle?.value ?? "");
  const greetingPlain = joinUserGreetingPrefixAndFirstName(prefixRaw, firstName);

  const buttonAriaLabel = String(
    requestQuoteLabelDesktop?.value ??
      fields.RequestQuoteLabelMobile?.value ??
      fields.RequestQuoteLabelDesktop?.value ??
      ""
  );

  return (
    <section
      className={`component user-info ${paramsStyles ?? ""}`.trim()}
      id={renderingId}
      aria-label={greetingPlain || "User info"}
    >
      <div className="component-content">
        <div
          className={
            "flex h-[42px] min-h-[42px] w-full min-w-0 flex-row items-center justify-between gap-[16px] mb-[16px]"
          }
        >
          <h2
            className={
              "min-w-0 flex-1 text-[24px] lg:text-[30px] leading-[100%] font-[700] text-[var(--color-bg-black)]"
            }
          >
            {(fields.UserTitle?.value != null && fields.UserTitle.value !== "") || isEditing ? (
              <Text field={fields.UserTitle} tag="span" />
            ) : null}
            {firstName ? (
              <span>
                {prefixFirstNameSeparator(prefixRaw)}
                {firstName}
              </span>
            ) : null}
          </h2>

          {showRequestQuoteButton ? (
            <Button
              type="button"
              variant="primary"
              // className={"static flex shrink-0 items-center justify-center self-center max-md:min-h-[48px] max-md:min-w-[48px] max-md:rounded-full max-md:p-0 md:min-h-[40px] md:min-w-[112px] md:gap-[8px] md:rounded-full md:px-[16px] md:py-[12px] bg-[var(--color-action-primary)] text-[var(--color-text-white)] text-[14px] font-normal leading-[1.25] shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action-primary)]"}
              onPress={onRequestQuoteHeaderPress}
              aria-label={buttonAriaLabel}
            >
              <span
                className={
                  "inline-flex shrink-0 items-center justify-center text-[16px] text-[var(--color-text-white)]"
                }
                aria-hidden={useModifyIcon ? undefined : true}
              >
                {useModifyIcon ? (
                  <span className={"relative inline-flex items-center justify-center"}>
                    <SitecoreImage
                      field={fields.ModifyPendingQuoteIcon}
                      width={16}
                      height={16}
                      sizes="20px"
                    />
                    {quoteRequest.queueItemCount > 0 ? (
                      <span
                        className={
                          "absolute -right-[8px] -top-[8px] flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-text-white)] px-1 text-[10px] font-bold leading-none text-[var(--color-action-primary)]"
                        }
                        aria-hidden
                      >
                        {quoteRequest.queueItemCount > 99 ? "99+" : quoteRequest.queueItemCount}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className={"relative inline-flex items-center justify-center"}>
                    <SitecoreImage
                      field={fields.RequestQuoteIcon}
                      width={16}
                      height={16}
                      sizes="20px"
                    />
                    {quoteRequest.queueItemCount > 0 ? (
                      <span
                        className={
                          "absolute -right-[8px] -top-[8px] flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-text-white)] px-1 text-[10px] font-bold leading-none text-[var(--color-action-primary)]"
                        }
                        aria-hidden
                      >
                        {quoteRequest.queueItemCount > 99 ? "99+" : quoteRequest.queueItemCount}
                      </span>
                    ) : null}
                  </span>
                )}
              </span>
              {(requestQuoteLabelDesktop?.value != null &&
                String(requestQuoteLabelDesktop.value).trim() !== "") ||
              isEditing ? (
                <span className={"max-md:hidden"}>
                  <Text field={requestQuoteLabelDesktop} tag="span" />
                </span>
              ) : null}
            </Button>
          ) : null}
        </div>
        {canRequestQuote ? <QuoteRequestDrawer qr={quoteRequest} /> : null}
      </div>
    </section>
  );
}

const UserInfoDefaultVariantBase = ({
  testId,
  fields,
  params,
  page,
}: UserInfoDefaultVariantProps): React.ReactElement => {
  const { styles, RenderingIdentifier: id, HideRequestQuoteButton } = params;
  const { isEditing } = page.mode;

  if (!fields) {
    return (
      <div className={`component user-info ${styles ?? ""}`.trim()} id={id} data-testid={testId}>
        <div className="component-content">
          <span className="is-empty-hint">User info</span>
        </div>
      </div>
    );
  }

  return (
    <div data-testid={testId}>
      <UserInfoDefaultVariantContent
        fields={fields}
        paramsStyles={styles ?? ""}
        renderingId={id}
        isEditing={isEditing}
        hideRequestQuoteButton={Boolean(Number(HideRequestQuoteButton))}
      />
    </div>
  );
};

export const UserInfoDefaultVariant = React.memo(UserInfoDefaultVariantBase);
