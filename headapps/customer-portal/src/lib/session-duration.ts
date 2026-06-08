const SESSION_START_STORAGE_KEY = "cp_session_started_at";

function getNowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function ensureSessionStart(): number {
  if (typeof window === "undefined") {
    return getNowSeconds();
  }

  const stored = window.sessionStorage.getItem(SESSION_START_STORAGE_KEY);
  const startedAt = stored ? Number(stored) : NaN;
  if (Number.isFinite(startedAt) && startedAt > 0) {
    return startedAt;
  }

  const now = getNowSeconds();
  window.sessionStorage.setItem(SESSION_START_STORAGE_KEY, String(now));
  return now;
}

export function getSessionDurationSeconds(): number {
  const startedAt = ensureSessionStart();
  return Math.max(0, getNowSeconds() - startedAt);
}
