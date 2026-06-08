export type EmailVerifyFlow = "login" | "register" | "reset-password";

export interface EmailVerifyQueryParams {
  code: string | null;
  otp: string | null;
  state: string | null;
  interactionCode: string | null;
  error: string | null;
  errorDescription: string | null;
  flow: EmailVerifyFlow | null;
}

export interface EmailVerifyResolution {
  flow: EmailVerifyFlow;
  redirectTo: string;
  messageType?: "register-activated" | "otp-fallback";
}

const EMAIL_VERIFY_ALLOWED_PARAMS = [
  "code",
  "otp",
  "state",
  "interaction_code",
  "error",
  "error_description",
  "flow"
] as const;

const FLOW_QUERY_KEY = "okta_email_verify_flow";

export function parseEmailVerifySearchParams(
  searchParams: URLSearchParams
): EmailVerifyQueryParams {
  const rawFlow = searchParams.get("flow");
  const flow =
    rawFlow === "register" || rawFlow === "reset-password" || rawFlow === "login"
      ? rawFlow
      : null;

  return {
    code: searchParams.get("code"),
    otp: searchParams.get("otp"),
    state: searchParams.get("state"),
    interactionCode: searchParams.get("interaction_code"),
    error: searchParams.get("error"),
    errorDescription: searchParams.get("error_description"),
    flow
  };
}

export function buildClientVerifyQuery(
  searchParams: URLSearchParams
): URLSearchParams {
  const forwarded = new URLSearchParams();
  EMAIL_VERIFY_ALLOWED_PARAMS.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      forwarded.set(key, value);
    }
  });
  return forwarded;
}

export function setEmailVerifyFlowHint(flow: EmailVerifyFlow): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(FLOW_QUERY_KEY, flow);
}

export function getEmailVerifyFlowHint(
  explicitFlow?: EmailVerifyFlow | null
): EmailVerifyFlow {
  if (explicitFlow) {
    return explicitFlow;
  }

  if (typeof window !== "undefined") {
    const cachedFlow = localStorage.getItem(FLOW_QUERY_KEY);
    if (
      cachedFlow === "register" ||
      cachedFlow === "reset-password" ||
      cachedFlow === "login"
    ) {
      return cachedFlow;
    }
  }

  return "login";
}

export function clearEmailVerifyFlowHint(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(FLOW_QUERY_KEY);
}

export function buildAuthRedirectPath(
  flow: EmailVerifyFlow,
  params: Pick<EmailVerifyQueryParams, "otp" | "state">,
  messageType?: EmailVerifyResolution["messageType"],
  options?: {
    includeEmailVerifyParams?: boolean;
  }
): string {
  const includeEmailVerifyParams = options?.includeEmailVerifyParams ?? true;
  const targetPath =
    flow === "register"
      ? "/register"
      : flow === "reset-password"
        ? "/reset-password"
        : "/login";
  const url = new URL(targetPath, "http://localhost");

  if (includeEmailVerifyParams && params.otp) {
    url.searchParams.set("otp", params.otp);
  }

  if (includeEmailVerifyParams && params.state) {
    url.searchParams.set("state", params.state);
  }

  if (messageType === "register-activated") {
    url.searchParams.set("activated", "true");
  }

  if (messageType === "otp-fallback") {
    url.searchParams.set("verifyFallback", "true");
  }

  return `${url.pathname}${url.search}`;
}

export function resolveFlowFromIdxTransaction(
  transaction: unknown,
  fallbackFlow: EmailVerifyFlow
): EmailVerifyFlow {
  if (!transaction || typeof transaction !== "object") {
    return fallbackFlow;
  }

  const tx = transaction as {
    nextStep?: { name?: string; authenticator?: { key?: string } };
    availableSteps?: Array<{ name?: string }>;
    flow?: string;
  };

  const lowerFlow = tx.flow?.toLowerCase();
  if (lowerFlow?.includes("register")) {
    return "register";
  }
  if (lowerFlow?.includes("recover") || lowerFlow?.includes("reset")) {
    return "reset-password";
  }

  const nextStepName = tx.nextStep?.name?.toLowerCase();
  if (
    nextStepName?.includes("enroll-profile") ||
    nextStepName?.includes("select-enroll-profile")
  ) {
    return "register";
  }

  if (
    nextStepName?.includes("reset") ||
    tx.nextStep?.authenticator?.key === "okta_password"
  ) {
    return "reset-password";
  }

  const hasRegistrationStep = tx.availableSteps?.some((step) =>
    step.name?.toLowerCase().includes("enroll-profile")
  );
  if (hasRegistrationStep) {
    return "register";
  }

  return fallbackFlow;
}
