"use client";

import { normalizeAuthPath } from "@/lib/auth-utils";
import { RichText as ContentSdkRichText, RichTextField } from "@sitecore-content-sdk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { AUTH_SUCCESS_MESSAGES, AUTH_TYPES, AuthTypeValue } from "src/helpers/enums";
import { IParams } from "src/helpers/interface";
import AuthCard from "../../../shared/auth-card/AuthCard";
import SuccessMessage from "../../../shared/success-message/SuccessMessage";
import { IAuthFields } from "../Auth.type";

import { RESET_LINK_ERROR_CODE, RESET_LINK_ERROR_QUERY_KEY } from "../components/AuthResetPassword";
import { AuthFooterInfo } from "../components/AuthFooter/AuthFooter";
import { cn } from "@/lib/utils";
import { RenderAuthComponent } from "../components/AuthComponent/AuthComponent";
import { ResetPasswordSuccess } from "../components/ResetPasswordSuccess";
import { RegisterSuccess } from "../components/RegisterSuccess";

interface IAuthVariantProps {
  testId: string;
  fields: IAuthFields;
  params: IParams;
}

const AuthDefaultVariantBase = ({ testId, fields }: IAuthVariantProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<
    "reset" | "register" | "register-activated" | null
  >(null);
  const [verifyFallbackOtp, setVerifyFallbackOtp] = useState<string | null>(null);
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const modeParam = searchParams.get("mode");
  const activatedParam = searchParams.get("activated");
  const verifyFallbackParam = searchParams.get("verifyFallback");
  const otpParam = searchParams.get("otp");
  const normalizedPath = normalizeAuthPath(pathname || "/");

  const resetLinkErrorType = searchParams.get(RESET_LINK_ERROR_QUERY_KEY);
  const hideWidgetHeader = resetLinkErrorType === RESET_LINK_ERROR_CODE;

  const authType = useMemo<AuthTypeValue>(() => {
    if (
      normalizedPath === "/reset-password" ||
      modeParam === "reset" ||
      normalizedPath.startsWith("/reset-password/")
    ) {
      return AUTH_TYPES.RESET;
    }

    if (normalizedPath === "/login") {
      return AUTH_TYPES.LOGIN;
    }

    const sitecoreAuthType = fields?.AuthenticationType?.value || AUTH_TYPES.LOGIN;
    return sitecoreAuthType as AuthTypeValue;
  }, [normalizedPath, modeParam, fields?.AuthenticationType?.value]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!fields) {
      return;
    }

    if (authType === AUTH_TYPES.RESET) {
      localStorage.setItem("okta_forgot_password_flow", "true");
    } else if (authType === AUTH_TYPES.LOGIN) {
      localStorage.removeItem("okta_forgot_password_flow");
      localStorage.removeItem("okta_reset_flow");
      localStorage.removeItem("okta_reset_password_success");
      localStorage.removeItem("okta_register_success");
      setShowSuccess(false);
      setSuccessType(null);
    }

    if (verifyFallbackParam === "true") {
      setVerifyFallbackOtp(otpParam);
    } else {
      setVerifyFallbackOtp(null);
    }

    const resetSuccess = localStorage.getItem("okta_reset_password_success");
    const registerSuccess = localStorage.getItem("okta_register_success");
    const registerActivated = activatedParam === "true";

    if (registerActivated && authType === AUTH_TYPES.REGISTER) {
      setShowSuccess(true);
      setSuccessType("register-activated");
    } else if (resetSuccess === "true" && authType === AUTH_TYPES.RESET) {
      setShowSuccess(true);
      setSuccessType("reset");
    } else if (registerSuccess === "true" && authType === AUTH_TYPES.REGISTER) {
      setShowSuccess(true);
      setSuccessType("register");
    } else {
      setShowSuccess(false);
      setSuccessType(null);
    }
  }, [authType, verifyFallbackParam, otpParam, activatedParam, fields]);

  const handleResetPasswordSuccess = () => {
    setShowSuccess(true);
    setSuccessType("reset");
  };

  const handleRegisterSuccess = () => {
    setShowSuccess(true);
    setSuccessType("register");
  };

  if (!fields) {
    return (
      <div
        data-testid={testId}
        className="flex gap-[10px] rounded-none min-h-full py-10 lg:min-h-screen lg:items-center lg:p-0"
      />
    );
  }

  return (
    <div
      data-testid={testId}
      className={cn({
        "flex gap-[10px] rounded-none min-h-full py-10 lg:min-h-screen lg:items-center lg:p-0": true,
        "lg:mt-[50px]": authType === AUTH_TYPES.REGISTER,
      })}
      role="main"
      aria-label="Authentication"
    >
      <div className="absolute -mt-10 flex w-full flex-col items-center gap-[50px] px-4 lg:relative lg:mt-0">
        <AuthCard>
          <div
            className={cn(
              "flex w-full flex-col items-center bg-[white] z-[999] rounded-[8px] gap-[30px] p-[20px] pb-[26px] md:pb-[26px] lg:p-[36px] lg:pb-[26px]",
              authType === AUTH_TYPES.REGISTER && "!pb-[30px]"
            )}
            role="region"
            aria-label="Authentication form"
          >
            {showSuccess && successType === "reset" ? (
              fields.AuthenticationHeader?.value && <ResetPasswordSuccess />
            ) : showSuccess &&
              (successType === "register" || successType === "register-activated") ? (
              <>
                {fields.AuthenticationHeader?.value && (
                  <RegisterSuccess successType={successType} />
                )}
              </>
            ) : (
              <>
                {verifyFallbackOtp && (
                  <SuccessMessage
                    title="Continue verification"
                    message={`Use the OTP below on the screen where you started this request.\n\nOTP: ${verifyFallbackOtp}\n\n${AUTH_SUCCESS_MESSAGES.OTP_FALLBACK_MESSAGE}`}
                  />
                )}

                {fields.AuthenticationHeader?.value && !hideWidgetHeader && (
                  <div
                    className="w-full [&_h2]:text-center [&_h2]:text-[24px] [&_h2]:font-[400] [&_h2]:leading-normal [&_h2]:tracking-[-0.5px] md:[&_h2]:text-[30px] [&_h2]:text-[#222] [&_p]:text-center [&_p]:text-[14px] [&_p]:font-normal [&_p]:leading-[125%] [&_p]:tracking-[-0.16px] [&_p]:text-[#4D4D4F] md:[&_p]:text-[16px]"
                    role="region"
                    aria-label="Authentication header"
                  >
                    <ContentSdkRichText field={fields.AuthenticationHeader} />
                  </div>
                )}

                <RenderAuthComponent
                  authType={authType}
                  onResetPasswordSuccess={handleResetPasswordSuccess}
                  onRegisterSuccess={handleRegisterSuccess}
                  contactSupportLink={fields.ContactSupportLink}
                  key={authType}
                />
              </>
            )}
          </div>
        </AuthCard>

        <AuthFooterInfo WebsiteURL={fields.WebsiteURL} CopyRightText={fields.CopyRightText} />
      </div>
    </div>
  );
};

export const AuthDefaultVariant = React.memo(AuthDefaultVariantBase);
