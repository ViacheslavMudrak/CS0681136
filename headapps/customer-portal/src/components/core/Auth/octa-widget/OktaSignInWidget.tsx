/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ChevronLeftIcon from "@/components/shared/icons/ChevronLeftIcon";
import ChevronRightIcon from "@/components/shared/icons/ChevronRightIcon";
import { I18N, I18NType } from "@/lib/dictionary-keys";
import {
  clearAllStorage,
  oktaUpdateFieldValue,
  setTokensInLocalStorage,
} from "@/lib/okta-auth-client";
import { setEmailVerifyFlowHint } from "@/lib/okta-email-verify";
import { clearOktaTransactionStorage, isOktaJwtClockSkewError } from "@/lib/okta-widget-utils";
import {
  getOktaConfigForSignIn,
  getPlaceholderMappingsForSignIn,
  updateOktaInputPlaceholders,
  updateSignInFieldLabels,
  updateSignInRequiredValidationMessage,
} from "lib/okta-config";
import { getOktaAuth } from "lib/oktaAuth";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { OktaSignInResponse } from "src/lib/types/okta";
import LoadingSkeleton from "../../../shared/loading-skeleton/LoadingSkeleton";
import { WidgetBackButton } from "../components/WidgetBackButton/WidgetBackButton";
import { cn } from "@/lib/utils";

interface OktaSignInWidgetProps {
  onSuccess?: (tokens: OktaSignInResponse) => void;
  onError: (error?: Error) => void;
  mode?: "signin";
}

const LOGIN_STEPS = {
  STEP_1_ENTER_EMAIL: 1,
  STEP_2_ENTER_PASSWORD: 2,
  STEP_3_EMAIL_MAGIC_LINK: 3,
};

const REFRESH_GRANT_TYPE = "refresh_token";
const REFRESH_SESSION_ROUTE = "/api/auth/token";
const JWT_CLOCK_SKEW_FRIENDLY_ERROR =
  "Your device date and time appear to be incorrect. Please update your system clock and try signing in again.";

export default function OktaSignInWidget({
  onSuccess,
  onError,
  mode = "signin",
}: OktaSignInWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(LOGIN_STEPS.STEP_1_ENTER_EMAIL);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [widgetRefreshKey, setWidgetRefreshKey] = useState(0);
  const [hasExpiredJwtError, setHasExpiredJwtError] = useState(false);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  const t = useTranslations();
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const extractErrorMessage = (error: any): string => {
    return String(error?.message || error?.errorSummary || error?.toString() || "");
  };

  const getFriendlySignInErrorMessage = (error: any): string => {
    if (isOktaJwtClockSkewError(error)) {
      return JWT_CLOCK_SKEW_FRIENDLY_ERROR;
    }
    return extractErrorMessage(error) || "Authentication failed. Please try again.";
  };

  const clearSessionAndRedirectToLogin = async (authInstance?: any) => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn("Failed to clear server-side auth session:", error);
    }

    if (authInstance?.closeSession) {
      try {
        await authInstance.closeSession();
      } catch (error) {
        console.warn("Failed to close Okta browser session:", error);
      }
    }

    clearAllStorage();
    clearOktaTransactionStorage();

    if (typeof window !== "undefined") {
      localStorage.setItem("okta_force_refresh", Date.now().toString());
      window.location.assign("/login");
      return;
    }

    router.push("/login");
  };

  const tryRefreshSessionFromCookieToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(REFRESH_SESSION_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grant_type: REFRESH_GRANT_TYPE }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        return false;
      }

      const payload = (await response.json().catch(() => ({}))) as {
        access_token?: string;
        id_token?: string;
        refresh_token?: string;
      };

      if (!payload.access_token) {
        return false;
      }

      setTokensInLocalStorage(
        payload.access_token,
        payload.id_token ?? null,
        payload.refresh_token ?? null
      );

      return true;
    } catch (error) {
      console.warn("Refresh-token session recovery failed:", error);
      return false;
    }
  };

  const handleForgotPasswordClick = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("okta_reset_flow", "true");
    }
    setEmailVerifyFlowHint("reset-password");

    router.push("/reset-password");
  };

  const handleRegisterClick = () => {
    setEmailVerifyFlowHint("register");
    router.push("/register");
  };

  const isMagicLinkEmailStep = (context: any): boolean => {
    const controller = String(context?.controller || "").toLowerCase();
    const formName = String(context?.formName || "").toLowerCase();
    const methodType = String(context?.methodType || "").toLowerCase();
    const authenticatorKey = String(context?.authenticatorKey || "").toLowerCase();

    const isEmailAuth = authenticatorKey === "okta_email" || methodType === "email";
    const isChallengeStep =
      formName === "challenge-authenticator" ||
      controller === "mfa-verify-passcode" ||
      controller === "device-challenge-poll";

    return isEmailAuth && isChallengeStep;
  };

  const isMagicLinkPromptVisible = (container: HTMLElement): boolean => {
    const textContent = (container.textContent || "").toLowerCase();
    const hasSendEmailButton = Array.from(container.querySelectorAll("button")).some((button) =>
      (button.textContent || "").toLowerCase().includes("send me an email")
    );

    const hasMagicLinkPromptText =
      textContent.includes("send me an email") || textContent.includes("verification email");

    return hasSendEmailButton || hasMagicLinkPromptText;
  };

  const resetWidget = async () => {
    clearOktaTransactionStorage();
    onErrorRef.current();
    if (widgetInstanceRef.current) {
      try {
        widgetInstanceRef.current.remove();
      } catch (error) {
        console.warn("Error removing widget:", error);
      }
      widgetInstanceRef.current = null;
    }

    if (widgetRef.current) {
      widgetRef.current.innerHTML = "";
    }

    isInitializingRef.current = false;

    try {
      const authInstance = getOktaAuth() as any;

      if (authInstance?.idx?.cancel) {
        await authInstance.idx.cancel();
      }

      if (authInstance?.transactionManager?.clear) {
        authInstance.transactionManager.clear();
      }
    } catch (error) {
      console.warn("Failed to cancel ongoing Okta transaction:", error);
    }

    setCurrentStep(LOGIN_STEPS.STEP_1_ENTER_EMAIL);
    setHasExpiredJwtError(false);
    setWidgetRefreshKey((prev) => prev + 1);
  };

  const handleBackButtonClick = async () => {
    if (!hasExpiredJwtError) {
      await resetWidget();
      return;
    }
    onErrorRef.current();
    const authInstance = getOktaAuth() as any;
    const sessionRecovered = await tryRefreshSessionFromCookieToken();
    if (sessionRecovered) {
      try {
        authInstance?.authStateManager?.updateAuthState?.();
      } catch (error) {
        console.warn("Failed to refresh auth state after session recovery:", error);
      }

      const returnUrlParam = searchParams.get("returnUrl");
      const safeReturnUrl =
        returnUrlParam && returnUrlParam.startsWith("/") && !returnUrlParam.startsWith("//")
          ? returnUrlParam
          : "/";

      if (typeof window !== "undefined") {
        window.location.assign(safeReturnUrl);
        return;
      }

      router.push(safeReturnUrl);
      return;
    }

    await clearSessionAndRedirectToLogin(authInstance);
  };

  const getCurrentStep = (context: any) => {
    let STEP = -1;
    const { controller, formName, methodType, authenticatorKey } = context;
    if (controller === "primary-auth" && formName === "identify") {
      STEP = LOGIN_STEPS.STEP_1_ENTER_EMAIL;
    } else if (
      authenticatorKey === "okta_password" &&
      formName === "challenge-authenticator" &&
      controller === "mfa-verify-password" &&
      methodType === "password"
    ) {
      STEP = LOGIN_STEPS.STEP_2_ENTER_PASSWORD;
    } else if (isMagicLinkEmailStep(context)) {
      STEP = LOGIN_STEPS.STEP_3_EMAIL_MAGIC_LINK;
    }

    return STEP;
  };

  const renderDefaultWidget = (widget: any, authInstance: any) => {
    widget
      .showSignInToGetTokens({ el: widgetRef.current })
      .then((tokens: any) => {
        if (authInstance) {
          authInstance.tokenManager.setTokens(tokens);
        }

        onErrorRef.current();
        setIsLoading(false);
        isInitializingRef.current = false;
        if (onSuccessRef.current) {
          const response: OktaSignInResponse = {
            status: "SUCCESS",
            tokens: tokens,
          };

          onSuccessRef.current(response);
        }
      })
      .catch((err: any) => {
        console.error("Widget error:", err);

        setHasExpiredJwtError(isOktaJwtClockSkewError(err));
        setShowChangeEmail(false);
        setIsLoading(false);
        isInitializingRef.current = false;

        if (err?.name === "AuthApiError" && err?.xhr?.status === 401) {
          clearOktaTransactionStorage();
          location.reload();
          return;
        }

        if (onErrorRef.current) {
          const errorMessage = getFriendlySignInErrorMessage(err);
          onErrorRef.current(new Error(errorMessage));
        }
      });
  };

  useEffect(() => {
    if (isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    setIsLoading(true);
    setShowChangeEmail(false);

    let widget: any;
    let OktaSignIn: any;

    const initializeWidget = async () => {
      try {
        setEmailVerifyFlowHint("login");
        const otp = searchParams.get("otp");
        const state = searchParams.get("state");

        const OktaSignInModule = await import("@okta/okta-signin-widget");
        OktaSignIn = OktaSignInModule.default;
        const authInstance: any = getOktaAuth();
        const widgetConfig = getOktaConfigForSignIn((key: string) => t(key as I18NType));

        const finalConfig: any = {
          ...widgetConfig,
          authClient: authInstance,
        };

        if (state && otp) {
          finalConfig.state = state;
          finalConfig.otp = otp;
        }

        widget = new OktaSignIn(finalConfig);
        widgetInstanceRef.current = widget;

        widget.on("afterRender", function (context: any) {
          setIsLoading(false);
          isInitializingRef.current = false;

          if (widgetRef.current) {
            requestAnimationFrame(() => {
              const container = widgetRef.current;
              if (!container) return;
              onErrorRef.current();
              updateOktaInputPlaceholders(
                container,
                getPlaceholderMappingsForSignIn(),
                (key: string) => t(key as I18NType)
              );

              updateSignInRequiredValidationMessage((key: string) => t(key as I18NType));

              const step = getCurrentStep(context);

              // Update label/placeholder of next step of the login flow
              if (step === LOGIN_STEPS.STEP_2_ENTER_PASSWORD) {
                updateSignInFieldLabels((key: string) => t(key as I18NType));
              }

              setCurrentStep(() => step);
              const shouldShowChangeEmail =
                step === LOGIN_STEPS.STEP_3_EMAIL_MAGIC_LINK || isMagicLinkPromptVisible(container);
              setShowChangeEmail(shouldShowChangeEmail);

              if (shouldShowChangeEmail) {
                const submitBtn: any = document.querySelector(`div.o-form-button-bar > input`);
                if (submitBtn) {
                  submitBtn.click();
                }
              }

              if (step === LOGIN_STEPS.STEP_1_ENTER_EMAIL) {
                const prefilledEmail = localStorage.getItem("okta_prefill_email");
                if (prefilledEmail) {
                  oktaUpdateFieldValue('[name="identifier"]', prefilledEmail);
                }
              }
            });
          }
        });

        widget.on("afterError", (_context: any, error: any) => {
          const errorMessage = extractErrorMessage(error) || "Unknown widget error";

          console.log("Widget error:", errorMessage, error);

          setHasExpiredJwtError(isOktaJwtClockSkewError(error));
          setShowChangeEmail(false);
          setIsLoading(false);
          isInitializingRef.current = false;
        });

        renderDefaultWidget(widget, authInstance);
      } catch (error: any) {
        console.error("Failed to initialize Okta widget:", error);
        setShowChangeEmail(false);
        setIsLoading(false);
        isInitializingRef.current = false;
        if (error?.name === "AuthApiError" && error?.xhr?.status === 401) {
          clearOktaTransactionStorage();
          location.reload();
          return;
        }

        const err = error instanceof Error ? error : new Error("Failed to initialize Okta widget");
        if (onErrorRef.current) {
          onErrorRef.current(err);
        }
      }
    };

    initializeWidget();

    return () => {
      isInitializingRef.current = false;

      if (widgetInstanceRef.current) {
        widgetInstanceRef.current.remove();
        widgetInstanceRef.current = null;
      }

      if (widgetRef.current && widgetRef.current.parentNode) {
        widgetRef.current.innerHTML = "";
      }
    };
  }, [searchParams, widgetRefreshKey]);

  const showBackButton = useMemo(() => {
    return (
      currentStep === LOGIN_STEPS.STEP_2_ENTER_PASSWORD || showChangeEmail || hasExpiredJwtError
    );
  }, [currentStep, showChangeEmail, hasExpiredJwtError]);

  return (
    <div className={`okta-sign-in-widget-container mode-${mode}`}>
      {isLoading && (
        <LoadingSkeleton
          className="mb-[10px]"
          variant="card"
          message={t(I18N.SignInWidgetLoading)}
          size="medium"
        />
      )}

      <div
        ref={widgetRef}
        className="okta-widget-wrapper"
        data-testid="okta-widget-wrapper"
        key={`okta-widget-${mode}-${widgetRefreshKey}`}
      />

      <>
        <div className="relative mb-5 flex w-full flex-col items-center justify-center gap-10 border-b border-[#ddd] py-[30px] pb-[25px]">
          <div className="flex items-center gap-1 text-xs leading-[19.25px]">
            <button
              type="button"
              onClick={handleRegisterClick}
              className="link-btn flex cursor-pointer items-center border-none bg-none p-0 text-[13px] font-[700] leading-[1.25] text-[#0377ba] transition-colors duration-200 ease-in-out hover:text-[#025a8f] hover:underline"
            >
              {t(I18N.SignInCreateAccountText)}
              <ChevronRightIcon className={isRtl ? "rotate-180" : ""} />
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-10 items-center relative">
          <div
            className={cn(
              "flex gap-[4px] items-center leading-[19.25px] w-full",
              showBackButton ? "justify-between" : "justify-center"
            )}
          >
            {showBackButton && (
              <div>
                <div className="flex [&_button]:cursor-pointer [&_button]:border-none [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-sm [&_button]:font-medium [&_button]:leading-5 [&_button]:text-[#0377ba]">
                  <WidgetBackButton handleClick={handleBackButtonClick}>
                    <ChevronLeftIcon className={isRtl ? "rotate-180" : ""} />
                    {t(I18N.WidgetBackButton)}
                  </WidgetBackButton>
                </div>
              </div>
            )}

            <div className={cn("flex gap-[4px]", showBackButton && "flex-col items-end")}>
              <p className="text-center text-[13px] font-normal text-[#6e6e78]">
                {t(I18N.SignInNeedHelpText)}
              </p>
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="link-btn cursor-pointer bg-transparent p-0 text-left text-[12px]  font-[700] leading-[1.38] text-[#0377ba] transition-colors duration-200 ease-in-out hover:text-[#025a8f] hover:underline"
              >
                {t(I18N.SignInResetPasswordText)}
              </button>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
