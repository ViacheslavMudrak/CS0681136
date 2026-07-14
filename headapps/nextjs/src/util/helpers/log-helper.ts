type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

const isLocalOrDev =
  process.env.NEXT_PUBLIC_ENV === 'LOCAL' || process.env.NEXT_PUBLIC_ENV === 'DEV';

/**
 * Structured JSON log helper for GKE Cloud Logging.
 * Outputs a JSON object with `severity`, `message`, `component`, and optional context
 * so Cloud Logging correctly parses severity and enables structured queries.
 * @see https://cloud.google.com/logging/docs/structured-logging
 *
 * @param onlyLocalAndDev - When true, only logs in LOCAL and DEV environments.
 */
export function log(
  severity: LogSeverity,
  component: string,
  message: string,
  data?: Record<string, unknown>,
  onlyLocalAndDev?: boolean
): void {
  // do not log if onlyLocalAndDev is true and we're not in a local or dev environment
  if (onlyLocalAndDev && !isLocalOrDev) return;

  const entry = JSON.stringify({
    severity,
    message,
    component,
    timestamp: new Date().toISOString(),
    ...data,
  });
  if (severity === 'ERROR' || severity === 'CRITICAL') {
    console.error(entry);
  } else {
    console.log(entry);
  }
}
