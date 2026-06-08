"use client";

import AuthCard from "@/components/shared/auth-card/AuthCard";
import ErrorMessage from "@/components/shared/error-message/ErrorMessage";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import Button from "@/components/ui/Button";
import { resolvePostLoginDestination } from "@/lib/auth-utils";
import {
  buildAuthRedirectPath,
  clearEmailVerifyFlowHint,
  getEmailVerifyFlowHint,
  parseEmailVerifySearchParams,
  resolveFlowFromIdxTransaction,
  setEmailVerifyFlowHint,
  type EmailVerifyFlow,
} from "@/lib/okta-email-verify";
import { getOktaAuth } from "@/lib/oktaAuth";
import { completeRegisterActivationSession } from "@/lib/register-activation-session";
import { LoginCallback } from "@okta/okta-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
const verifyContainerClass = "min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4";
const verifyContentClass =
  "flex flex-col gap-6 w-full p-8 items-center [&>div]:items-center [&>div]:justify-start [&>div]:gap-[10px]";

type VerifyViewState = "loading" | "fallback" | "error";

interface FallbackState {
  otp: string | null;
  flow: EmailVerifyFlow;
  continuePath: string;
}

function decodeQueryValue(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value.replace(/\+/g, " ");
  }
}

function sanitizeErrorText(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const decoded = decodeQueryValue(value).trim();
  if (!decoded) {
    return null;
  }

  return decoded.replace(/[<>]/g, "");
}

function getCallbackErrorMessage(error: string | null, errorDescription: string | null): string {
  const ERROR_CODE_MESSAGES: Record<string, string> = {
    interaction_required:
      "We could not finish sign-in from this link. Please return to login and try again.",
    invalid_token: "Link expired. Please request a new verification link.",
  };

  if (error && ERROR_CODE_MESSAGES[error]) {
    return ERROR_CODE_MESSAGES[error];
  }

  const sanitizedDescription = sanitizeErrorText(errorDescription);
  if (sanitizedDescription) {
    return sanitizedDescription;
  }

  return "Authentication could not be completed. Please restart the sign-in flow.";
}

const RESET_LINK_ERROR_QUERY_KEY = "resetLinkError";
const RESET_LINK_ERROR_MESSAGE_QUERY_KEY = "resetLinkErrorMessage";
const RESET_LINK_ERROR_CODE = "invalid_or_used";

function buildResetPasswordInvalidLinkPath(message?: string): string {
  const url = new URL("/reset-password", "http://localhost");
  url.searchParams.set(RESET_LINK_ERROR_QUERY_KEY, RESET_LINK_ERROR_CODE);
  if (message) {
    url.searchParams.set(RESET_LINK_ERROR_MESSAGE_QUERY_KEY, message);
  }
  return `${url.pathname}${url.search}`;
}

function AuthorizationVerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewState, setViewState] = useState<VerifyViewState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fallbackState, setFallbackState] = useState<FallbackState | null>(null);

  const parsedParams = useMemo(() => parseEmailVerifySearchParams(searchParams), [searchParams]);
  const hasEmailVerifyParams = !!(parsedParams.otp && parsedParams.state);
  const hasOAuthCallbackParams = !!(parsedParams.code || parsedParams.interactionCode);
  const isOAuthCallback = hasOAuthCallbackParams && !hasEmailVerifyParams;
  const shouldRecoverInteractionRequired =
    parsedParams.error === "interaction_required" &&
    !parsedParams.otp &&
    !parsedParams.code &&
    !parsedParams.interactionCode;

  useEffect(() => {
    let isMounted = true;

    const redirectToTarget = (flow: EmailVerifyFlow, withActivationMessage = false) => {
      const redirectPath = buildAuthRedirectPath(
        flow,
        { otp: parsedParams.otp, state: parsedParams.state },
        withActivationMessage ? "register-activated" : undefined,
        { includeEmailVerifyParams: false }
      );
      clearEmailVerifyFlowHint();
      router.replace(redirectPath);
    };

    const showOtpFallback = (flow: EmailVerifyFlow) => {
      if (!isMounted) {
        return;
      }
      setFallbackState({
        otp: parsedParams.otp,
        flow,
        continuePath: buildAuthRedirectPath(
          flow,
          { otp: parsedParams.otp, state: parsedParams.state },
          "otp-fallback",
          { includeEmailVerifyParams: true }
        ),
      });
      setViewState("fallback");
    };

    const resolveAuthenticatedEmail = async (oktaAuthClient: {
      authStateManager?: {
        getAuthState: () => { idToken?: { claims?: { email?: string } } } | null;
      };
      getUser?: () => Promise<{ email?: string }>;
    }): Promise<string | undefined> => {
      const authStateEmail =
        oktaAuthClient.authStateManager?.getAuthState()?.idToken?.claims?.email;
      if (authStateEmail) {
        return authStateEmail;
      }

      if (typeof oktaAuthClient.getUser !== "function") {
        return undefined;
      }

      try {
        const user = await oktaAuthClient.getUser();
        return user?.email;
      } catch {
        return undefined;
      }
    };

    const redirectToLoginSuccessDestination = async (oktaAuthClient: {
      authStateManager?: {
        getAuthState: () => { idToken?: { claims?: { email?: string } } } | null;
      };
      getUser?: () => Promise<{ email?: string }>;
    }) => {
      const userEmail = await resolveAuthenticatedEmail(oktaAuthClient);
      const targetPath = await resolvePostLoginDestination({
        userEmail,
        includeStoredReturnUrl: true,
        clearStoredReturnUrl: true,
      });

      if (targetPath) {
        clearEmailVerifyFlowHint();
        router.replace(targetPath);
      } else {
        router.replace("/login");
      }
    };

    const resolveFromTransaction = async (
      idxApi: {
        canProceed: (options?: { state?: string }) => boolean;
        proceed: () => Promise<unknown>;
      },
      oktaAuthClient: {
        authStateManager?: {
          getAuthState: () => { idToken?: { claims?: { email?: string } } } | null;
        };
        getUser?: () => Promise<{ email?: string }>;
      },
      transaction: unknown,
      fallbackFlow: EmailVerifyFlow
    ) => {
      const transactionStatus = (transaction as { status?: string } | null)?.status;
      const resolvedFlow = resolveFlowFromIdxTransaction(transaction, fallbackFlow);

      if (transactionStatus === "SUCCESS") {
        if (resolvedFlow === "login") {
          await redirectToLoginSuccessDestination(oktaAuthClient);
          return;
        }
        if (resolvedFlow === "register") {
          await completeRegisterActivationSession(getOktaAuth(), transaction);
        }
        redirectToTarget(resolvedFlow, resolvedFlow === "register");
        return;
      }

      if (transactionStatus === "PENDING") {
        const canProceed = idxApi.canProceed({
          state: parsedParams.state ?? undefined,
        });

        if (!canProceed) {
          showOtpFallback(resolvedFlow);
          return;
        }

        const proceedResult = await idxApi.proceed();
        const proceedStatus = (proceedResult as { status?: string } | null)?.status;
        const proceedFlow = resolveFlowFromIdxTransaction(proceedResult, resolvedFlow);

        if (proceedStatus === "SUCCESS") {
          if (proceedFlow === "register") {
            await completeRegisterActivationSession(getOktaAuth(), proceedResult);
          }
          redirectToTarget(proceedFlow, proceedFlow === "register");
          return;
        }

        redirectToTarget(proceedFlow);
        return;
      }

      redirectToTarget(resolvedFlow);
    };

    const runVerifyFlow = async () => {
      try {
        if (shouldRecoverInteractionRequired) {
          const recoverFlow = getEmailVerifyFlowHint(parsedParams.flow);
          clearEmailVerifyFlowHint();
          if (recoverFlow === "register") {
            router.replace("/register");
            return;
          }
          if (recoverFlow === "reset-password") {
            router.replace("/reset-password");
            return;
          }
          router.replace("/login");
          return;
        }

        if (isOAuthCallback) {
          return;
        }

        const flowHint = getEmailVerifyFlowHint(parsedParams.flow);
        setEmailVerifyFlowHint(flowHint);

        if (parsedParams.error) {
          if (!isMounted) {
            return;
          }
          const message = getCallbackErrorMessage(
            parsedParams.error,
            parsedParams.errorDescription
          );
          const isInvalidTokenError = parsedParams.error.toLowerCase() === "invalid_token";
          if (flowHint === "reset-password" || isInvalidTokenError) {
            router.replace(
              isInvalidTokenError
                ? buildResetPasswordInvalidLinkPath()
                : buildResetPasswordInvalidLinkPath(message)
            );
            return;
          }

          clearEmailVerifyFlowHint();
          setErrorMessage(message);
          setViewState("error");
          return;
        }

        const oktaAuth = getOktaAuth();
        const oktaAuthClient = oktaAuth as unknown as {
          authStateManager?: {
            getAuthState: () => { idToken?: { claims?: { email?: string } } } | null;
          };
          getUser?: () => Promise<{ email?: string }>;
          idx?: {
            isEmailVerifyCallback: (search: string) => boolean;
            handleEmailVerifyCallback: (search: string) => Promise<unknown>;
            canProceed: (options?: { state?: string }) => boolean;
            proceed: () => Promise<unknown>;
          };
        };
        const idxApi = (
          oktaAuthClient as {
            idx?: {
              isEmailVerifyCallback: (search: string) => boolean;
              handleEmailVerifyCallback: (search: string) => Promise<unknown>;
              canProceed: (options?: { state?: string }) => boolean;
              proceed: () => Promise<unknown>;
            };
          }
        ).idx;

        if (!idxApi) {
          showOtpFallback(flowHint);
          return;
        }

        const search = window.location.search;
        if (idxApi.isEmailVerifyCallback(search)) {
          const result = await idxApi.handleEmailVerifyCallback(search);
          await resolveFromTransaction(idxApi, oktaAuthClient, result, flowHint);
          return;
        }

        const canProceed = idxApi.canProceed({
          state: parsedParams.state ?? undefined,
        });
        if (!canProceed) {
          showOtpFallback(flowHint);
          return;
        }

        const proceedResult = await idxApi.proceed();
        await resolveFromTransaction(idxApi, oktaAuthClient, proceedResult, flowHint);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "We could not complete email verification automatically.";

        if (!isMounted) {
          return;
        }

        // If we still have OTP/state, provide fallback UX instead of dead-ending.
        if (parsedParams.otp && parsedParams.state) {
          const fallbackFlow = getEmailVerifyFlowHint(parsedParams.flow);
          showOtpFallback(fallbackFlow);
          return;
        }

        const failedFlow = getEmailVerifyFlowHint(parsedParams.flow);
        if (failedFlow === "reset-password") {
          clearEmailVerifyFlowHint();
          router.replace(buildResetPasswordInvalidLinkPath(message));
          return;
        }

        setErrorMessage(message);
        setViewState("error");
      }
    };

    runVerifyFlow();

    return () => {
      isMounted = false;
    };
  }, [
    isOAuthCallback,
    parsedParams.code,
    parsedParams.error,
    parsedParams.errorDescription,
    parsedParams.flow,
    parsedParams.interactionCode,
    parsedParams.otp,
    parsedParams.state,
    shouldRecoverInteractionRequired,
    router,
  ]);

  if (isOAuthCallback) {
    return (
      <LoginCallback
        errorComponent={({ error: callbackError }) => {
          const callbackMessage =
            sanitizeErrorText(callbackError?.message || null) ||
            getCallbackErrorMessage(parsedParams.error, parsedParams.errorDescription);

          return (
            <div className={verifyContainerClass}>
              <AuthCard>
                <div className={verifyContentClass}>
                  <ErrorMessage message={callbackMessage} />
                  <Button
                    className="w-full"
                    variant="primary"
                    onPress={() => router.push("/login")}
                  >
                    Return to Login
                  </Button>
                </div>
              </AuthCard>
            </div>
          );
        }}
        loadingElement={
          <div className={verifyContainerClass}>
            <LoadingSkeleton variant="spinner" size="large" message="Completing sign-in..." />
          </div>
        }
      />
    );
  }

  if (viewState === "loading") {
    return (
      <div className={verifyContainerClass}>
        <LoadingSkeleton variant="spinner" size="large" message="Verifying your email link..." />
      </div>
    );
  }

  if (viewState === "error") {
    return (
      <div className={verifyContainerClass}>
        <AuthCard>
          <div className={verifyContentClass}>
            <ErrorMessage
              message={
                errorMessage || "Email verification failed. Please restart the sign-in flow."
              }
            />
            <Button className="w-full" variant="primary" onPress={() => router.push("/login")}>
              Return to Login
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className={verifyContainerClass}>
      <AuthCard>
        <div className={verifyContentClass}>
          <h2 className={"text-[28px] leading-[34px] text-center text-[#222]"}>
            Continue verification
          </h2>
          <p className={"leading-6 text-center text-[#4d4d4f]"}>
            We could not resume this verification automatically in this browser. If you started the
            request on another screen, use the OTP code there to complete the flow.
          </p>

          {fallbackState?.otp && (
            <div className={"bg-[#eef6fb] rounded-xl py-4 px-6 border border-[#b8dbef]"}>
              <p className={"text-sm text-[#4d4d4f] uppercase tracking-[0.08em] mb-2 text-center"}>
                One-time passcode
              </p>
              <p className={"text-2xl font-bold text-[#00287b] text-center tracking-[0.2em]"}>
                {fallbackState.otp}
              </p>
            </div>
          )}

          <Button
            className="w-full"
            variant="primary"
            onPress={() => router.push(fallbackState?.continuePath ?? "/login")}
          >
            Continue to{" "}
            {fallbackState?.flow === "register"
              ? "Register"
              : fallbackState?.flow === "reset-password"
                ? "Reset Password"
                : "Login"}
          </Button>
        </div>
      </AuthCard>
    </div>
  );
}

export default function AuthorizationVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className={verifyContainerClass}>
          <LoadingSkeleton variant="card" size="medium" />
        </div>
      }
    >
      <AuthorizationVerifyPageContent />
    </Suspense>
  );
}
