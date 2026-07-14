import { getRedisClient } from 'lib/cache/redis';
import { ukgGet, ukgPost } from 'lib/ukg/ukgClient';
import { buildMyTimeMetricsRequestBody } from 'lib/ukg/ukgHelper';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '../auth/[...nextauth]';

const CACHE_TTL_SECONDS = 15 * 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const session = await getServerSession(req, res, authOptions);

  try {
    const { employeeNumbers, symbolicPeriodQualifier, paycodes, baseUrl } = req.body as {
      employeeNumbers: string[];
      symbolicPeriodQualifier?: 'Previous_Payperiod' | 'Current_Payperiod';
      paycodes?: string[];
      baseUrl?: string;
    };

    let personNumbers = employeeNumbers;

    if (
      (!session?.employeeNumber || session?.voyagerMockJson?.enableMocking === 'true') &&
      session?.voyagerMockJson?.ukgMyTimeSchedulePersonNumber
    ) {
      personNumbers = [session?.voyagerMockJson?.ukgMyTimeSchedulePersonNumber];
    }

    if (!personNumbers?.length) {
      return res.status(400).json({ error: 'employeeNumbers is required' });
    }

    const sortedEmployeeNumbers = [...personNumbers].sort();
    const sortedPaycodes = (paycodes || ['Regular', 'Overtime']).sort();
    const period = symbolicPeriodQualifier || 'Previous_Payperiod';

    const cacheKey = `ukg:mytime:${sortedEmployeeNumbers.join(',')}:${period}:${sortedPaycodes.join(',')}`;

    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('[UKG My Time] Cache hit');
      return res.status(200).json(JSON.parse(cached));
    }

    console.log('[UKG My Time] Cache miss, fetching from UKG');
    const payPeriod = await ukgGet<{ spanEndDate?: string }>('/api/v1/commons/pay_period', baseUrl);

    const requestBody = buildMyTimeMetricsRequestBody({
      employeeNumbers: personNumbers,
      symbolicPeriodQualifier,
      paycodes,
    });

    const metrics = await ukgPost(
      '/api/v1/timekeeping/timecard_metrics/multi_read',
      requestBody,
      baseUrl
    );

    const result = {
      spanEndDate: payPeriod?.spanEndDate ?? null,
      metrics,
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL_SECONDS);

    return res.status(200).json(result);
  } catch (e: unknown) {
    console.error('[UKG My Time] Error:', e);
    const message = e instanceof Error ? e.message : 'Failed to fetch My Time';
    return res.status(500).json({ error: message });
  }
}
