"use client";

import AlertBox from "@/components/ui/AlertBox";
import { sendRegisterEvent } from "@/lib/CDPEvents";
import { I18N } from "@/lib/dictionary-keys";
import { setEmailVerifyFlowHint } from "@/lib/okta-email-verify";
import { runPostRegisterApi } from "@/lib/apis/register-apis";
import { isRegistrationDuplicateError } from "@/lib/registration-duplicate-error";
import { useOktaAuth } from "@okta/okta-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";
import { AUTH_ERROR_MESSAGES } from "src/helpers/enums";
import { logGTMRegisterSuccess } from "src/lib/gtm";
import type { OktaSignInResponse } from "src/lib/types/okta";
import ErrorMessage from "../../../shared/error-message/ErrorMessage";
import LoadingSkeleton from "../../../shared/loading-skeleton/LoadingSkeleton";
import { cn } from "@/lib/utils";
import OktaRegisterWidget from "../octa-widget/OktaRegisterWidget";

interface AuthRegisterProps {
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

const AuthRegister: React.FC<AuthRegisterProps> = ({ onError, onSuccess }) => {
  const router = useRouter();
  const t = useTranslations();
  const [genericError, setGenericError] = useState<string | null>(null);
  const [showDuplicateInstruction, setShowDuplicateInstruction] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const oktaAuthContext = useOktaAuth();
  const authState = oktaAuthContext?.authState || null;

  const handleDuplicateRegistration = useCallback(() => {
    setGenericError(null);
    setShowDuplicateInstruction(true);
  }, []);

  useEffect(() => {
    setEmailVerifyFlowHint("register");
  }, []);

  useEffect(() => {
    // Check for error parameters in URL
    const errorParam = searchParams.get("error");
    const errorDescriptionParam = searchParams.get("error_description");

    if (errorParam || errorDescriptionParam) {
      const errorMessage =
        errorDescriptionParam || errorParam || AUTH_ERROR_MESSAGES.REGISTER_DEFAULT;

      setShowDuplicateInstruction(false);
      setGenericError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [searchParams, onError]);

  const handleSuccess = async (tokens: OktaSignInResponse) => {
    setShowDuplicateInstruction(false);
    setGenericError(null);

    // Extract user info from ID token if available
    let userInfo: { userId?: string; email?: string; name?: string } | undefined;
    try {
      if (tokens.tokens?.idToken?.claims) {
        const claims = tokens.tokens.idToken.claims;
        userInfo = {
          userId: claims.sub,
          email: claims.email,
          name: claims.name,
        };
      }
    } catch (err) {
      console.warn("Failed to extract user info from token:", err);
    }

    // Log GTM register success event
    logGTMRegisterSuccess(userInfo);

    // Registration successful - redirect to check email page
    // User will receive email and click link to complete verification
    // If tokens are available, handle login redirect

    sendRegisterEvent({
      type: "customerportal:REGISTER",
      name: userInfo?.name || "",
      email: userInfo?.email || "",
      firstName: userInfo?.name || "",
    });

    // Store success flag for page reload persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("okta_register_success", "true");
      // Save email to sessionStorage for login page prefilling
      if (userInfo?.email) {
        localStorage.setItem("okta_prefill_email", userInfo.email);
      }
    }

    // Extract access token for Okta userinfo + lead APIs (same shape as AuthLogin)
    const rawTokens = tokens.tokens as
      | { accessToken?: string | { accessToken?: string }; idToken?: unknown }
      | undefined;
    const accessToken =
      typeof rawTokens?.accessToken === "string"
        ? rawTokens.accessToken
        : (rawTokens?.accessToken as { accessToken?: string } | undefined)?.accessToken;

    if (accessToken) {
      try {
        await runPostRegisterApi({ email: userInfo?.email || "", authIdentity: accessToken });
      } catch (err) {
        console.warn("Post-register API failed:", err);
      }
    }

    router.push("/login");
    // Notify parent component of success
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleError = (err?: Error) => {
    if (!err) {
      setGenericError("");
      if (onError) {
        onError("");
      }

      return;
    }

    const errorMessage = err.message || AUTH_ERROR_MESSAGES.REGISTER_FAILED;
    setShowDuplicateInstruction(false);
    setGenericError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };

  const handleRedirectToReset = () => {
    router.push("/reset-password");
  };

  // Show loading state while checking auth
  if (!authState) {
    return (
      <div
        className={cn("flex w-full flex-col items-center justify-center")}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading registration"
      >
        <div className={cn("w-full")}>
          <LoadingSkeleton variant="card" size="medium" />
        </div>
      </div>
    );
  }

  const duplicateAlertId = showDuplicateInstruction ? "register-duplicate-hint" : undefined;
  const genericErrorId = genericError ? "register-error" : undefined;
  const alertRegionId = duplicateAlertId ?? genericErrorId;
  const formId = "register-form";

  return (
    <div
      className={cn("flex w-full flex-col items-center justify-center")}
      role="region"
      aria-label="User registration form"
      aria-live="polite"
      aria-atomic="false"
    >
      {showDuplicateInstruction && (
        <div
          id={duplicateAlertId}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          aria-relevant="additions text"
          className="mb-[25px]"
        >
          <AlertBox
            className="gap-[12px]"
            variant="warning"
            message={
              <span className="font-roboto">
                <span className="text-[14px] text-[#d93934] block">
                  {t(I18N.RegisterDuplicateInstruction)}
                </span>

                <button
                  type="button"
                  onClick={handleRedirectToReset}
                  className="text-menu-hover-color cursor-pointer mt-2 inline-block text-[12px] focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  {t(I18N.RegisterDuplicateResetPasswordLink)}
                </button>
              </span>
            }
          />
        </div>
      )}
      {genericError && (
        <div
          id={genericErrorId}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          aria-relevant="additions text"
        >
          <ErrorMessage message={genericError} />
        </div>
      )}
      <div
        id={formId}
        className={cn("w-full")}
        role="form"
        aria-label="Registration credentials"
        aria-describedby={alertRegionId}
      >
        <OktaRegisterWidget
          key={pathname}
          mode="register"
          onSuccess={handleSuccess}
          onError={handleError}
          onDuplicateRegistration={handleDuplicateRegistration}
        />
      </div>
    </div>
  );
};

export default AuthRegister;
