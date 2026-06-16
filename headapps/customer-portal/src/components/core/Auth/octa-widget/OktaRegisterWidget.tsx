/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ChevronRightIcon from "@/components/shared/icons/ChevronRightIcon";
import { I18N, I18NType } from "@/lib/dictionary-keys";
import { setEmailVerifyFlowHint } from "@/lib/okta-email-verify";
import {
  getOktaConfigForRegister,
  getPlaceholderMappingsForRegister,
  updateOktaInputPlaceholders,
  updateRegisterFieldLabels,
  updateRegistrationRequiredValidationMessage,
} from "lib/okta-config";
import { getOktaAuth } from "lib/oktaAuth";
import { isRegistrationDuplicateError } from "lib/registration-duplicate-error";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { OktaSignInResponse } from "src/lib/types/okta";
import LoadingSkeleton from "../../../shared/loading-skeleton/LoadingSkeleton";
import { cn } from "@/lib/utils";
import {
  clearOktaTransactionStorage,
  isOktaJwtClockSkewError,
  recoverOktaWidgetSessionAfterJwtClockError,
} from "@/lib/okta-widget-utils";

interface OktaRegisterWidgetProps {
  onSuccess?: (tokens: OktaSignInResponse) => void;
  onError?: (error?: Error) => void;
  onDuplicateRegistration?: () => void;
  mode?: "register";
}

export default function OktaRegisterWidget({
  onSuccess,
  onError,
  onDuplicateRegistration,
  mode = "register",
}: OktaRegisterWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onDuplicateRegistrationRef = useRef(onDuplicateRegistration);

  const t = useTranslations();
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onDuplicateRegistrationRef.current = onDuplicateRegistration;
  }, [onSuccess, onError, onDuplicateRegistration]);

  const handleSignInClick = () => {
    setEmailVerifyFlowHint("login");
    router.push("/login");
  };

  useEffect(() => {
    if (isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    setIsLoading(true);

    let widget: any;
    let OktaSignIn: any;

    const initializeWidget = async () => {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("okta_reset_flow");
          localStorage.removeItem("okta_forgot_password_flow");
          localStorage.setItem("okta_register_flow", "true");
        }
        setEmailVerifyFlowHint("register");

        const OktaSignInModule = await import("@okta/okta-signin-widget");
        OktaSignIn = OktaSignInModule.default;
        const authInstance = getOktaAuth();
        const widgetConfig = getOktaConfigForRegister((key: string) => t(key as I18NType));

        const otp = searchParams.get("otp");
        const state = searchParams.get("state");

        const finalConfig: any = {
          ...widgetConfig,
          features: { ...widgetConfig.features, registration: true },
          flow: "signup",
          authClient: authInstance,
        };

        if (state && otp) {
          finalConfig.state = state;
          finalConfig.otp = otp;
        }
        widget = new OktaSignIn(finalConfig);
        widgetInstanceRef.current = widget;

        widget.on("afterRender", function () {
          setIsLoading(false);
          isInitializingRef.current = false;

          if (widgetRef.current) {
            requestAnimationFrame(() => {
              const container = widgetRef.current;
              if (!container) return;
              const MarketingOptInCheckbox = container.querySelectorAll(
                `[data-se-for-name="userProfile.marketingOptIn"]`
              );

              if (MarketingOptInCheckbox.length > 0) {
                const label = MarketingOptInCheckbox[0];
                if (label) {
                  label.innerHTML = t(I18N.RegisterMarketingOptInLabel);
                }
              }

              updateOktaInputPlaceholders(
                container,
                getPlaceholderMappingsForRegister(),
                (key: string) => t(key as I18NType)
              );

              updateRegisterFieldLabels((key: string) => t(key as I18NType));

              Array.from(document.getElementsByTagName("label")).forEach((item, index) => {
                if (
                  item.hasAttribute("data-se-for-name") &&
                  item.getAttribute("data-se-for-name") === "userProfile.agreedToTerms"
                ) {
                  item.innerHTML =
                    'I agree to the <a href="https://www.intralox.com/terms-of-use" style="color: #007bff; text-decoration: underline;" target="_blank">terms and conditions</a>';
                }
              });

              updateRegistrationRequiredValidationMessage((key: string) => t(key as I18NType));
            });
          }
        });

        widget.on("afterError", (_context: any, error: any) => {
          const errorMessage =
            error?.message || error?.errorSummary || error?.toString() || "Unknown widget error";
          console.error("Widget error:", errorMessage, error);

          setIsLoading(false);
          isInitializingRef.current = false;

          if (isOktaJwtClockSkewError(error)) {
            recoverOktaWidgetSessionAfterJwtClockError(authInstance);
            return;
          }

          if (typeof window !== "undefined") {
            localStorage.removeItem("okta_register_flow");
          }

          if (isRegistrationDuplicateError(error)) {
            if (widgetRef.current) {
              const emailInput =
                widgetRef.current.querySelector<HTMLInputElement>(
                  'input[name="userProfile.email"]'
                ) || widgetRef.current.querySelector<HTMLInputElement>('input[name="email"]');
              const email = emailInput?.value?.trim();
              if (email) {
                localStorage.setItem("okta_prefill_email", email);
              }
            }
            onDuplicateRegistrationRef.current?.();
          }
        });

        widget
          .showSignInToGetTokens({ el: widgetRef.current })
          .then((tokens: any) => {
            if (authInstance) {
              authInstance.tokenManager.setTokens(tokens);
            }

            if (tokens) {
              if (onSuccessRef.current) {
                const response: OktaSignInResponse = {
                  status: "SUCCESS",
                  tokens: tokens,
                };

                onSuccessRef.current(response);
              }
              return;
            }

            setIsLoading(false);
            isInitializingRef.current = false;
          })
          .catch((err: any) => {
            console.error("Widget error:", err);
            setIsLoading(false);
            isInitializingRef.current = false;

            if (err?.name === "AuthApiError" && err?.xhr?.status === 401) {
              clearOktaTransactionStorage();
              location.reload();
              return;
            }

            if (isOktaJwtClockSkewError(err)) {
              recoverOktaWidgetSessionAfterJwtClockError(authInstance);
              return;
            }

            if (typeof window !== "undefined") {
              localStorage.removeItem("okta_register_flow");
            }

            const errorMessage =
              err?.errorSummary || err?.message || `Authentication failed. Please try again.`;

            if (onErrorRef.current) {
              onErrorRef.current(new Error(errorMessage));
            }
          });
      } catch (error) {
        console.error("Failed to initialize Okta widget:", error);
        setIsLoading(false);
        isInitializingRef.current = false;

        if (isOktaJwtClockSkewError(error)) {
          recoverOktaWidgetSessionAfterJwtClockError(getOktaAuth());
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem("okta_register_flow");
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

      if (widgetRef.current) {
        widgetRef.current.innerHTML = "";
      }
    };
  }, [mode]);
  
  
  console.log('[---TEST---] ' + t('user_register_already_registered_text'));

  return (
    <div className={`okta-sign-in-widget-container mode-${mode}`}>
      {isLoading && (
        <LoadingSkeleton
          className="mb-[50px]"
          variant="card"
          message={t(I18N.RegisterWidgetLoading)}
          size="medium"
        />
      )}

      <div
        ref={widgetRef}
        className="okta-widget-wrapper"
        data-testid="okta-widget-wrapper"
        key={`okta-widget-${mode}`}
      />

      <div className="relative -mt-5 mb-[10px] flex w-full flex-col items-center justify-center gap-10 pt-2.5">
        <div className="flex flex-wrap items-center justify-center gap-1 text-xs leading-[19.25px]">
          <p className="text-center text-[14px] font-[400] leading-[1.38] text-[#374151]">
            {t(I18N.RegisterAlreadyRegisteredText)}
          </p>
		  <p>[---TEST---]</p>
          <button
            type="button"
            onClick={handleSignInClick}
            className="link-btn cursor-pointer text-[13px] font-[700] leading-[125%] text-[var(--color-link-text)] transition-colors duration-200 ease-in-out hover:text-[#025a8f] hover:underline"
          >
            {t(I18N.RegisterSigninText)}
            <ChevronRightIcon width={7} height={11} className={isRtl ? "rotate-180" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
