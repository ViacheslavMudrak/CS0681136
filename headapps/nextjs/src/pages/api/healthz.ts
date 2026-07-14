import type { NextApiRequest, NextApiResponse } from 'next';
import { HealthcheckMiddleware } from '@sitecore-content-sdk/nextjs/monitoring';
import { triggerWarmOnce } from 'src/lib/google/warm-people-directory';

/**
 * This Next.js API route is used to handle healthz check request.
 * By default this is used only by Sitecore XM Cloud (when running as editing host),
 * but could be used in other deployment scenarios.
 *
 * GKE startup/liveness/readiness probes hit this endpoint immediately on pod
 * boot, so it doubles as a reliable "server is up" trigger for one-shot
 * background warmers (e.g. the People Directory cache pre-fetch).
 */

const sitecoreHandler = new HealthcheckMiddleware().getHandler();

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  triggerWarmOnce();
  return sitecoreHandler(req, res);
}
