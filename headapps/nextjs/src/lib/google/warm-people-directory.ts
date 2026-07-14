import { getCompanyCodes } from 'src/lib/google/services/company-codes-service';
import { refreshCompanyDirectory } from 'src/lib/google/services/people-directory-service';
import { log } from 'src/util/helpers/log-helper';

const COMPONENT = 'WarmPeopleDirectory';

/**
 * Concurrency cap for the startup warm. Google Admin Directory pagination is
 * already serial per company code, so this caps how many companies we fetch in
 * parallel — keeps total startup load bounded on big tenants like MOSTL.
 */
const CONCURRENCY = 2;

/**
 * Module-scoped guard so multiple healthz pings (or any other trigger) within
 * the same Node process kick off the warm exactly once.
 */
let warmTriggered = false;

async function warmOne(companyCode: string): Promise<void> {
  try {
    await refreshCompanyDirectory(companyCode);
  } catch (err) {
    log('ERROR', COMPONENT, 'Warm failed for company code', {
      companyCode,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Pre-populates the per-company-code Redis cache for every company code defined
 * in Sitecore. Safe to call concurrently across pods — each company code is
 * gated by a Redis lock inside `refreshCompanyDirectory`, so only one pod
 * actually fetches any given code at a time. Other pods either skip or wait on
 * the existing cache entry.
 */
export async function warmPeopleDirectory(): Promise<void> {
  const start = Date.now();
  log('INFO', COMPONENT, 'Starting people directory warm');

  const codes = await getCompanyCodes();
  if (codes.length === 0) {
    log('WARNING', COMPONENT, 'No company codes returned from Sitecore — skipping warm');
    return;
  }

  log('INFO', COMPONENT, 'Warming directory caches', { codeCount: codes.length });

  // Simple bounded-concurrency queue.
  const queue = [...codes];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      await warmOne(next);
    }
  });
  await Promise.all(workers);

  log('INFO', COMPONENT, 'People directory warm complete', {
    codeCount: codes.length,
    durationMs: Date.now() - start,
  });
}

/**
 * Triggers `warmPeopleDirectory` exactly once per Node process. Subsequent
 * calls are no-ops, so this is safe to invoke from frequently-hit endpoints
 * like `/api/healthz`. The actual warm runs fire-and-forget — callers never
 * block on the slow Google fetch.
 */
export function triggerWarmOnce(): void {
  if (warmTriggered) return;
  warmTriggered = true;

  void warmPeopleDirectory().catch((err) => {
    // Reset so a transient failure (e.g. Redis flap) can be retried by the
    // next caller rather than leaving the cache cold for the pod's lifetime.
    warmTriggered = false;
    log('ERROR', COMPONENT, 'Warm trigger failed — will retry on next call', {
      error: err instanceof Error ? err.message : String(err),
    });
  });
}
