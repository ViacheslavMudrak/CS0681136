"use client";
import type { LinkField } from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import OktaPasswordResetWidget from "@/components/core/Auth/octa-widget/OktaResetPasswordWidget";
import { LocalizedImageFieldLink } from "@/components/image/LocalizedImageFieldLink";
import { setEmailVerifyFlowHint } from "@/lib/okta-email-verify";
import { clearOktaTransactionStorage } from "@/lib/okta-widget-utils";
import { useOktaAuth } from "@okta/okta-react";
import ChevronLeftIcon from "components/shared/icons/ChevronLeftIcon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AUTH_ERROR_MESSAGES } from "src/helpers/enums";
import { sendResetPasswordEvent } from "@/lib/CDPEvents";
import { logGTMResetPasswordRequest } from "src/lib/gtm";
import ErrorMessage from "../../../shared/error-message/ErrorMessage";
import { cn } from "@/lib/utils";

import { I18N } from "@/lib/dictionary-keys";

interface AuthResetPasswordProps {
  onError?: (error: string) => void;
  onSuccess?: () => void;
  contactSupportLink?: LinkField;
}

type FlowState = "initial" | "email_sent";
export const RESET_LINK_ERROR_QUERY_KEY = "resetLinkError";
export const RESET_LINK_ERROR_MESSAGE_QUERY_KEY = "resetLinkErrorMessage";
export const RESET_LINK_ERROR_CODE = "invalid_or_used";
export const RESET_LINK_FALLBACK_MESSAGE =
  "Your password reset link has expired or has already been used. Request a new link to continue.";

const AuthResetPassword: React.FC<AuthResetPasswordProps> = ({
  onError,
  onSuccess,
  contactSupportLink,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("initial");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const oktaAuthContext = useOktaAuth();
  const t = useTranslations();
  const authState = oktaAuthContext?.authState || null;
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const resetLinkErrorType = searchParams.get(RESET_LINK_ERROR_QUERY_KEY);
  const resetLinkErrorMessage = searchParams.get(RESET_LINK_ERROR_MESSAGE_QUERY_KEY);
  const showInvalidLinkState = resetLinkErrorType === RESET_LINK_ERROR_CODE;

  const handleBackToLogin = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("okta_forgot_password_flow");
      localStorage.removeItem("okta_forgot_password_email_sent");
      localStorage.removeItem("okta_reset_password_success");

      clearResetPasswordParams();
      clearOktaTransactionStorage();

      localStorage.setItem("okta_force_refresh", Date.now().toString());
    }
    router.push("/login");
  };

  const clearResetPasswordParams = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("okta_forgot_password_email_sent");
      localStorage.removeItem("okta_reset_password_success");
      clearOktaTransactionStorage();
    }

    setError(null);
    setSuccess(false);
    setFlowState("initial");

    const params = new URLSearchParams(searchParams.toString());
    params.delete(RESET_LINK_ERROR_QUERY_KEY);
    params.delete(RESET_LINK_ERROR_MESSAGE_QUERY_KEY);
    params.delete("error");
    params.delete("error_description");
  };

  useEffect(() => {
    setEmailVerifyFlowHint("reset-password");
  }, []);

  const handleSuccess = (response: any) => {
    // Handle success response from widget - only email_sent flow now
    const successType = response?.type || "email_sent";
    if (successType === "email_sent") {
      const res = response?.response || response;
      const idTokenClaims = res?.tokens?.idToken?.claims;
      const accessTokenClaims = res?.tokens?.accessToken?.claims;
      const email =
        (typeof idTokenClaims?.email === "string" ? idTokenClaims.email : null) ||
        (typeof idTokenClaims?.preferred_username === "string"
          ? idTokenClaims.preferred_username
          : null) ||
        (typeof accessTokenClaims?.sub === "string" && accessTokenClaims.sub.includes("@")
          ? accessTokenClaims.sub
          : null) ||
        (typeof res?.user?.profile?.email === "string" ? res.user.profile.email : null) ||
        (typeof res?.context?.user?.identifier === "string" ? res.context.user.identifier : null) ||
        (typeof res?.user?.identifier === "string" ? res.user.identifier : null) ||
        "";

      // Password reset email sent successfully — GTM (user_email) + CDP
      logGTMResetPasswordRequest(email || undefined);
      void sendResetPasswordEvent({
        type: "customerportal:RESETPASSWORD",
        email,
      });

      setFlowState("email_sent");
      setSuccess(true);
      setError(null);

      // Mark that email was sent
      if (typeof window !== "undefined") {
        localStorage.setItem("okta_forgot_password_email_sent", "true");
        localStorage.setItem("okta_forgot_password_flow", "true");
        localStorage.setItem("okta_reset_password_success", "true");

        if (email) {
          sessionStorage.setItem("okta_reset_password_email", email);
        }
      }

      // Notify parent component of success
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const getErrorMessage = (err: Error | any): string => {
    if (err instanceof Error) {
      const message = err.message;
      if (message && !message.includes("[object") && message.trim() !== "") {
        return message;
      }
    }

    if (typeof err === "string") {
      return err;
    }

    if (err && typeof err === "object") {
      return (
        err.errorSummary ||
        err.message ||
        err.error ||
        err.errorDescription ||
        err.error_description ||
        AUTH_ERROR_MESSAGES.RESET_FAILED
      );
    }

    return AUTH_ERROR_MESSAGES.RESET_FAILED;
  };

  const handleError = (err?: Error) => {
    if (!err) {
      setError("");
      if (onError) {
        onError("");
      }
      return;
    }

    const errorMessage = getErrorMessage(err);
    setError(errorMessage);
    setSuccess(false);
    if (onError) {
      onError(errorMessage);
    }
  };

  useEffect(() => {
    if (authState?.isAuthenticated) {
      const isOnForgotPasswordPage =
        pathname === "/reset-password" || pathname.startsWith("/reset-password/");
      const forgotPasswordFlow =
        typeof window !== "undefined" ? localStorage.getItem("okta_forgot_password_flow") : null;
      const emailSent =
        typeof window !== "undefined"
          ? localStorage.getItem("okta_forgot_password_email_sent")
          : null;
      const hasForgotPasswordSuccess = searchParams.get("reset-password") === "success";
      const modeParam = searchParams.get("mode");

      // If we're on forgot password page, in forgot password flow, showing success/error, or have forgot password mode - don't redirect
      // IMPORTANT: This prevents any automatic redirects to dashboard during forgot password flow
      // Keep forgot password flow flag active while showing success/error messages
      if (
        isOnForgotPasswordPage ||
        forgotPasswordFlow === "true" ||
        emailSent === "true" ||
        hasForgotPasswordSuccess ||
        success ||
        modeParam === "reset-password" ||
        flowState !== "initial"
      ) {
        // Stay on page to show success/error message
        // This prevents automatic redirect to dashboard
        if (typeof window !== "undefined" && (success || flowState !== "initial")) {
          localStorage.setItem("okta_forgot_password_flow", "true");
        }
        return;
      }
    }
  }, [authState, pathname, searchParams, success, flowState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Restore email_sent state if email was sent
    const emailSent = localStorage.getItem("okta_forgot_password_email_sent");
    const resetSuccess = localStorage.getItem("okta_reset_password_success");
    if (
      (emailSent === "true" || resetSuccess === "true") &&
      !authState?.isAuthenticated &&
      flowState !== "email_sent"
    ) {
      setFlowState("email_sent");
      setSuccess(true);
      setError(null);
    }
  }, [searchParams, authState, flowState]);

  useEffect(() => {
    // Check for error parameters in URL
    const errorParam = searchParams.get("error");
    const errorDescriptionParam = searchParams.get("error_description");

    if (errorParam || errorDescriptionParam) {
      const errorMessage = errorDescriptionParam || errorParam || AUTH_ERROR_MESSAGES.RESET_DEFAULT;
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [searchParams, onError, router]);

  const currentError = error;
  const invalidLinkMessage = resetLinkErrorMessage || RESET_LINK_FALLBACK_MESSAGE;

  const errorId = currentError && !success ? "reset-password-error" : undefined;
  const formId = "reset-password-form";
  const contactSupportLabel =
    contactSupportLink?.value?.text?.trim() || t(I18N.ResetContactSupportText);

  return (
    <>
      {showInvalidLinkState && (
        <div
          className="flex w-full flex-col items-center justify-center"
          role="region"
          aria-label="Reset link invalid state"
        >
          <div className="w-full">
            <div className="flex w-full flex-col items-center gap-[30px] text-center">
              <div className="flex flex-col items-center justify-center gap-[12px]">
                <h2 className="m-0 text-[30px] font-normal leading-[1.25] text-[#222]">
                  This reset link is no longer valid
                </h2>
                <p className="font-normal leading-[1.25] text-[#4d4d4f]">{invalidLinkMessage}</p>
              </div>
              <div className="flex w-full flex-col items-center justify-center">
                <div className="h-px w-full bg-[#ddd]" />

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="mt-[15px] flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-[13px] font-bold leading-[1.25] text-[#0377ba]"
                  aria-label="Back to login"
                >
                  <ChevronLeftIcon
                    decorative={true}
                    width={7}
                    height={11}
                    className={isRtl ? "rotate-180" : ""}
                  />
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentError && !success && !showInvalidLinkState && (
        <div
          className="flex w-full flex-col items-center justify-center"
          role="region"
          aria-label="Forgot password error"
        >
          <div className="w-full">
            <div
              id={errorId}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              aria-relevant="additions text"
            >
              <ErrorMessage message={currentError} />
            </div>
          </div>
        </div>
      )}

      {!showInvalidLinkState && !success && flowState === "initial" && (
        <div
          id={formId}
          className="flex w-full flex-col items-center justify-center"
          role="form"
          aria-label="Forgot password email request"
          aria-describedby={currentError ? errorId : undefined}
        >
          <div className="w-full">
            <OktaPasswordResetWidget onSuccess={handleSuccess} onError={handleError} />

            <div className="flex w-full items-center justify-between border-t border-[#ddd] pt-5">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-[700] leading-[1.25] text-[#0377ba] no-underline transition-colors duration-200 ease-in-out hover:!no-underline [&_svg]:h-[11px] [&_svg]:w-[7px]"
                  aria-label={t(I18N.ResetBackToLoginText)}
                >
                  <ChevronLeftIcon
                    decorative={true}
                    width={7}
                    height={11}
                    className={isRtl ? "rotate-180" : ""}
                  />
                  {t(I18N.ResetBackToLoginText)}
                </button>
              </div>

              <div className="flex items-center">
                <span className="mr-[5px] text-[12px] font-[400] leading-[1.38] text-black">
                  {t(I18N.ResetNeedHelpText)}
                </span>
                {contactSupportLink?.value?.href?.trim() ? (
                  <LocalizedImageFieldLink
                    field={contactSupportLink}
                    className="cursor-pointer text-[13px] font-[700] leading-[1.38] text-[#0377BA]"
                  >
                    {contactSupportLabel}
                  </LocalizedImageFieldLink>
                ) : (
                  <span className="cursor-pointer text-[13px] font-[700] leading-[1.38] text-[#0377BA]">
                    {contactSupportLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthResetPassword;
