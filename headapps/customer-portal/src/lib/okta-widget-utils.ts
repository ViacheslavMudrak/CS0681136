export const OKTA_JWT_CLOCK_ERROR_MARKERS = [
  "jwt expired",
  "no longer valid",
  "token expired",
  "not yet valid",
  "lifetime validation failed",
] as const;

export function isOktaJwtClockSkewError(error: unknown): boolean {
  const message = String(
    (error as { message?: string })?.message ??
      (error as { errorSummary?: string })?.errorSummary ??
      error ??
      ""
  ).toLowerCase();
  return OKTA_JWT_CLOCK_ERROR_MARKERS.some((marker) => message.includes(marker));
}

export function recoverOktaWidgetSessionAfterJwtClockError(
  authInstance: {
    tokenManager?: { clear?: () => void | Promise<void> };
  } | null
): void {
  clearOktaTransactionStorage();
  void (async () => {
    try {
      await authInstance?.tokenManager?.clear?.();
    } catch {
      /* ignore */
    } finally {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  })();
}

export function clearOktaTransactionStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  const shouldClearKey = (key: string): boolean => {
    const lower = key.toLowerCase();
    return (
      lower.includes("okta") &&
      (lower.includes("interaction") || lower.includes("transaction") || lower.includes("idx"))
    );
  };

  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach((key) => {
    if (shouldClearKey(key)) {
      sessionStorage.removeItem(key);
    }
  });

  const localKeys = Object.keys(localStorage);
  localKeys.forEach((key) => {
    if (shouldClearKey(key)) {
      localStorage.removeItem(key);
    }
  });
}
