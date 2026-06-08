"use client";

import { useOktaAuth } from "@okta/okta-react";
import {
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
} from "@sitecore-content-sdk/nextjs";
import { type JSX, type MouseEvent, useEffect } from "react";

import Button from "@/components/ui/Button";
import AuthCard from "@/components/shared/auth-card/AuthCard";
import { signOutAndNavigateToLogin } from "@/lib/client-auth-sign-out";
import { assignPostLoginNavigation, isContactSupportOnlyProfile, isSignInErrorProfile } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile-context";

import type { CustomerSupportComponentFields } from "../CustomerSupportComponent.type";
import {
  BACK_SIGN_IN_FALLBACK_LABEL,
  CUSTOMER_SUPPORT_SECTION_LABEL,
  SUPPORT_LINK_ARIA_LABEL,
  SUPPORT_LINK_FALLBACK_HREF,
  getSupportHref,
} from "../customerSupportComponentUtils";
import { AuthFooterInfo } from "../../Auth/components/AuthFooter/AuthFooter";

interface CustomerSupportComponentClientProps {
  fields: CustomerSupportComponentFields;
  isEditing: boolean;
}

/**
 * Renders the blocked-access support card and handles post-authentication navigation actions.
 */
export function CustomerSupportComponentClient({
  fields,
  isEditing,
}: CustomerSupportComponentClientProps): JSX.Element {
  const oktaAuth = useOktaAuth();
  const { profile, loading } = useUserProfile();
  const {
    PageIcon,
    Headline,
    BodyText,
    SupportPromptText,
    SupportLinkLabel,
    BackSignInButtonLabel,
    CopyRightText,
    WebsiteURL,
    SupportLink,
  } = fields;

  const supportFallbackHref = SupportLink?.value?.href?.trim() || SUPPORT_LINK_FALLBACK_HREF;
  const supportHref = getSupportHref(profile, supportFallbackHref);
  const showSupportLink = Boolean((SupportLinkLabel?.value ?? "").trim() || isEditing);
  const shouldRenderIcon = Boolean(PageIcon?.value?.src || isEditing);
  const shouldRenderHeadline = Boolean(Headline?.value || isEditing);
  const shouldRenderBodyText = Boolean(BodyText?.value || isEditing);
  const shouldRenderSupportText = Boolean(
    SupportPromptText?.value || SupportLinkLabel?.value || isEditing
  );

  const shouldShowPage =
    isEditing ||
    !profile ||
    isContactSupportOnlyProfile(profile) || isSignInErrorProfile(profile);

  useEffect(() => {
    if (isEditing || loading || !profile) return;
    if (isContactSupportOnlyProfile(profile) || isSignInErrorProfile(profile)) return;
    assignPostLoginNavigation("/");
  }, [isEditing, loading, profile]);

  const handleBackToSignIn = () => {
    void signOutAndNavigateToLogin(oktaAuth?.oktaAuth, { skipReturnUrl: true });
  };

  const handleSupportClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!supportHref || supportHref === SUPPORT_LINK_FALLBACK_HREF) {
      event.preventDefault();
    }
  };

  if (!shouldShowPage) {
    return <></>;
  }

  return (
    <div
      className={cn(
        "flex gap-[10px] rounded-none min-h-full py-10 lg:min-h-screen lg:items-center lg:p-0",
      )}
      role="main"
      aria-label={CUSTOMER_SUPPORT_SECTION_LABEL}
    >
      <div className="absolute -mt-10 flex w-full flex-col items-center gap-[50px] px-4 lg:relative lg:mt-0">
        <AuthCard>
          <div
            className={cn(
              "flex w-full flex-col items-center bg-[white] z-[999] rounded-[8px] gap-[30px] p-[20px] pb-[26px] md:pb-[26px] lg:p-[36px] lg:pb-[26px]",
            )} role="region"
            aria-label={CUSTOMER_SUPPORT_SECTION_LABEL}
          >
            <div className="flex w-full flex-col items-center gap-[12px] rounded-none">
              {shouldRenderIcon && (
                <div className="flex h-[67.53px] w-full items-center justify-center">
                  <div className="flex h-[67px] w-[67px] items-center justify-center rounded-full bg-bg-submenu">
                    <ContentSdkImage
                      field={PageIcon}
                      width={30}
                      height={30}
                      sizes="30px"
                      className="h-[30px] w-[30px] object-contain"
                      priority
                    />
                  </div>
                </div>
              )}

              {shouldRenderHeadline && (
                <ContentSdkText
                  field={Headline}
                  tag="h1"
                  className="m-0 w-full text-center text-[30px] font-normal leading-[125%] text-text-heading-color"
                />
              )}

              {(shouldRenderBodyText || shouldRenderSupportText) && (
                <div className="flex w-full flex-col items-center justify-center gap-5 text-center text-[16px] font-normal leading-[125%] text-text-basic">
                  {shouldRenderBodyText && (
                    <ContentSdkRichText field={BodyText} className="w-full [&_p]:m-0" />
                  )}

                  {shouldRenderSupportText && (
                    <p className="m-0 w-full text-center leading-[125%] [&>*]:inline [&_.rich-text]:inline [&_div]:m-0 [&_div]:inline [&_p]:m-0 [&_p]:inline">
                      {SupportPromptText?.value || isEditing ? (
                        <ContentSdkRichText field={SupportPromptText} tag="span" />
                      ) : null}
                      {showSupportLink ? (
                        <>
                          {SupportPromptText?.value ? "\u00a0" : null}
                          <a
                            href={supportHref}
                            className="inline font-medium text-link-text no-underline outline-none hover:no-underline focus:outline-none focus:ring-0 focus-visible:outline-none [&_.rich-text]:inline [&_div]:m-0 [&_div]:inline [&_*]:font-medium [&_*]:text-link-text [&_p]:m-0 [&_p]:inline"
                            aria-label={SUPPORT_LINK_ARIA_LABEL}
                            onClick={handleSupportClick}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ContentSdkRichText field={SupportLinkLabel} tag="span" />
                          </a>
                        </>
                      ) : null}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="primary"
              className="h-[42px] min-h-[42px] w-full rounded-full !px-3 !py-3 text-[14px] font-normal leading-[125%]"
              onPress={handleBackToSignIn}
            >
              {BackSignInButtonLabel?.value || isEditing ? (
                <ContentSdkText field={BackSignInButtonLabel} tag="span" />
              ) : (
                BACK_SIGN_IN_FALLBACK_LABEL
              )}
            </Button>
          </div>
        </AuthCard>

        <AuthFooterInfo WebsiteURL={WebsiteURL} CopyRightText={CopyRightText} />
      </div>
    </div>
  );
}
