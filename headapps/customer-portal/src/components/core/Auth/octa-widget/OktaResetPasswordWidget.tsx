/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { I18N, I18NType } from "@/lib/dictionary-keys";
import { setEmailVerifyFlowHint } from "@/lib/okta-email-verify";
import {
  getEmailFromResponse,
  getErrorMessageFromError,
  getOktaConfigForResetPassword,
  getPlaceholderMappingsForResetPassword,
  isOktaConfigured,
  updateOktaInputPlaceholders,
} from "lib/okta-config";
import { getOktaAuth } from "lib/oktaAuth";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LoadingSkeleton from "../../../shared/loading-skeleton/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { clearOktaTransactionStorage } from "@/lib/okta-widget-utils";

const RESET_STEPS = {
  STEP_1_ENTER_EMAIL: 1,
  STEP_2_SEND_EMAIL: 2,
  STEP_3_ENTER_CODE: 3,
  STEP_4_ENTER_PASSWORD: 4,
};

interface OktaResetPasswordWidgetProps {
  onSuccess?: (tokens: any) => void;
  onError?: (error?: Error) => void;
}

let widgetPreloadPromise: Promise<any> | null = null;

function preloadOktaWidget(): Promise<any> {
  if (!widgetPreloadPromise) {
    widgetPreloadPromise = import("@okta/okta-signin-widget");
  }
  return widgetPreloadPromise;
}

if (typeof window !== "undefined") {
  preloadOktaWidget();
}

export default function OktaPasswordResetWidget({
  onSuccess,
  onError,
}: OktaResetPasswordWidgetProps) {
  const searchParams = useSearchParams();
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const t = useTranslations();
  const otp = useMemo(() => searchParams.get("otp"), [searchParams]);
  const state = useMemo(() => searchParams.get("state"), [searchParams]);
  const hasEmailLinkParams = useMemo(() => Boolean(state && otp), [state, otp]);

  const getCurrentStep = (context: any) => {
    let STEP = -1;
    const { controller, formName, methodType, authenticatorKey } = context;
    if (controller === "primary-auth" && formName === "identify") {
      STEP = RESET_STEPS.STEP_1_ENTER_EMAIL;
    } else if (
      authenticatorKey === "okta_email" &&
      formName === "authenticator-verification-data" &&
      methodType === "email"
    ) {
      STEP = RESET_STEPS.STEP_2_SEND_EMAIL;
    } else if (
      authenticatorKey === "okta_email" &&
      controller === "mfa-verify-passcode" &&
      formName === "challenge-authenticator" &&
      methodType === "email"
    ) {
      STEP = RESET_STEPS.STEP_3_ENTER_CODE;
    } else if (
      authenticatorKey === "okta_password" &&
      controller === "forgot-password" &&
      formName === "reset-authenticator" &&
      methodType === "password"
    ) {
      STEP = RESET_STEPS.STEP_4_ENTER_PASSWORD;
    }

    return STEP;
  };

  const initializeWidget = useCallback(async () => {
    if (isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    setIsLoading(true);

    if (typeof window !== "undefined") {
      localStorage.removeItem("okta_register_flow");
      localStorage.setItem("okta_reset_flow", "true");
    }
    setEmailVerifyFlowHint("reset-password");

    let widget: any;
    let OktaSignIn: any;

    try {
      const OktaSignInModule = await preloadOktaWidget();
      OktaSignIn = OktaSignInModule.default;
      const authInstance = getOktaAuth();

      const widgetConfig: any = getOktaConfigForResetPassword((key: string) => t(key as I18NType));
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

      widget.on("afterRender", (_context: any) => {
        setIsLoading(false);
        isInitializingRef.current = false;

        if (widgetInstanceRef.current && !hasEmailLinkParams) {
          requestAnimationFrame(() => {
            if (
              widgetInstanceRef.current &&
              typeof widgetInstanceRef.current.showForgotPassword === "function"
            ) {
              widgetInstanceRef.current.showForgotPassword();
            }
          });
        }

        if (widgetRef.current) {
          requestAnimationFrame(() => {
            const container = widgetRef.current;
            if (!container) return;

            updateOktaInputPlaceholders(
              container,
              getPlaceholderMappingsForResetPassword(),
              (key: string) => t(key as I18NType)
            );

            const step = getCurrentStep(_context);

            // if (step === RESET_STEPS.STEP_1_ENTER_EMAIL) {
            //   const prefilledEmail = localStorage.getItem("okta_prefill_email");
            //   if (prefilledEmail) {
            //     oktaUpdateFieldValue('[name="identifier"]', prefilledEmail);
            //   }
            // }

            if (!hasEmailLinkParams && step === RESET_STEPS.STEP_2_SEND_EMAIL) {
              const submitBtn: any = document.querySelector(".o-form-button-bar input");
              if (submitBtn) {
                submitBtn.click();
              }
            }

            // else if (step === RESET_STEPS.STEP_3_ENTER_CODE) {
            //   const enterCodeLink: any = document.querySelector(
            //     ".enter-auth-code-instead-link"
            //   );
            //   if (enterCodeLink) {
            //     enterCodeLink.click();
            //   }
            // }
          });
        }
      });

      widget.on("afterError", (_context: any, error: any) => {
        const errorMessage = getErrorMessageFromError(error, (key: string) => {
          try {
            const translation = t(key as I18NType);
            return translation && translation !== key ? translation : key;
          } catch {
            return key;
          }
        });

        setIsLoading(false);
        isInitializingRef.current = false;

        if (error && !error?.remediation) {
          onError?.(new Error(errorMessage));
        }
      });

      const widgetElement = widgetRef.current;
      if (!widgetElement) {
        setIsLoading(false);
        isInitializingRef.current = false;
        if (onError) {
          onError(new Error("Widget container is not available"));
        }
        return;
      }

      widget.renderEl(
        { el: widgetElement, flow: "resetPassword" },
        (res: any) => {
          setIsLoading(false);
          isInitializingRef.current = false;
          onError?.();

          const remediation = res?.remediation as any;
          const isResetSuccess =
            res.status === "SUCCESS" ||
            remediation?.name === "reset-password" ||
            remediation?.type === "reset-password";

          if (isResetSuccess || res.status === "SUCCESS") {
            if (typeof window !== "undefined") {
              const email = getEmailFromResponse(res);

              if (email) {
                sessionStorage.setItem("okta_reset_password_email", email);
              }
            }

            if (onSuccess) {
              onSuccess({
                type: "email_sent",
                status: "SUCCESS",
                response: res,
              });
            }
          } else {
            if (res.status === "SUCCESS" && onSuccess) {
              if (typeof window !== "undefined") {
                const email = getEmailFromResponse(res);

                if (email) {
                  sessionStorage.setItem("okta_reset_password_email", email);
                }
              }

              onSuccess({
                type: "email_sent",
                status: "SUCCESS",
                response: res,
              });
            }
          }
        },
        (err: any) => {
          console.log("Password reset email error:", JSON.stringify(err));
          setIsLoading(false);
          isInitializingRef.current = false;

          if (err?.name === "AuthApiError" && err?.xhr?.status === 401) {
            clearOktaTransactionStorage();
            location.reload();
            return;
          }

          if (err?.remediation) {
            setIsLoading(true);
            return;
          }

          if (
            err?.error === "interaction_required" ||
            err?.errorSummary?.includes("interaction_required")
          ) {
            console.warn("Interaction required - widget will handle resuming flow");
            setIsLoading(true);
            return;
          }

          if (onError) {
            const errorMessage = getErrorMessageFromError(err);
            onError(new Error(errorMessage));
          }
        }
      );
    } catch (error) {
      setIsLoading(false);
      isInitializingRef.current = false;
      if (loadingTimeoutRef.current) {
        loadingTimeoutRef.current = null;
      }
      const errorMessage = getErrorMessageFromError(error);
      const err = new Error(errorMessage || "Failed to initialize Okta password reset widget");

      if (onError) {
        onError(err);
      }

      console.error("Failed to initialize Okta password reset widget:", err);
    }
  }, [hasEmailLinkParams, onError, onSuccess, otp, state, t]);

  const cleanup = useCallback(() => {
    isInitializingRef.current = false;

    try {
      if (widgetInstanceRef.current) {
        if (typeof widgetInstanceRef.current.remove === "function") {
          widgetInstanceRef.current.remove();
        }

        widgetInstanceRef.current = null;
      }

      if (widgetRef.current && widgetRef.current.parentNode) {
        widgetRef.current.innerHTML = "";
      }
    } catch (error) {
      console.log("Cleanup error:", error);
    }
  }, []);

  useEffect(() => {
    if (isInitializingRef.current) {
      return;
    }

    if (widgetInstanceRef.current) {
      widgetInstanceRef.current.remove();
      widgetInstanceRef.current = null;
    }

    if (widgetRef.current) {
      widgetRef.current.innerHTML = "";
    }

    setIsLoading(true);

    initializeWidget();

    return () => {
      cleanup();
    };
  }, [initializeWidget, cleanup]);

  const isOktaConfigurationAvailable = useMemo(() => {
    return isOktaConfigured();
  }, []);

  if (!isOktaConfigurationAvailable) {
    return (
      <div className="p-4 text-red-600">
        <p>Okta is not configured. Please check your environment variables.</p>
      </div>
    );
  }

  return (
    <div className="okta-reset-password-widget-container">
      {isLoading && (
        <LoadingSkeleton
          variant="card"
          message={t(I18N.ResetPasswordWidgetLoading)}
          size="medium"
        />
      )}

      <div
        ref={widgetRef}
        className="okta-widget-wrapper"
        data-testid="okta-password-reset-widget"
        key="okta-password-reset-widget"
      />
    </div>
  );
}
