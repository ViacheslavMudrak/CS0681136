import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from 'lib/cache/redis';
import { ukgPost } from 'lib/ukg/ukgClient';
import { buildScheduleRequestBody, transformScheduleResponse } from 'lib/ukg/ukgHelper';
import type { UkgScheduleRawResponse, ScheduleResponse } from 'ts/ukg';

interface ScheduleRequestBody {
  employeeNumbers: string[];
  startDate: string;
  endDate: string;
  baseUrl?: string;
}

const CACHE_TTL_SECONDS = 15 * 60; // 15 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScheduleResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { employeeNumbers, startDate, endDate, baseUrl } = req.body as ScheduleRequestBody;

    if (!employeeNumbers?.length || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'employeeNumbers (string[]), startDate, and endDate are required' });
    }

    // Check Redis cache
    const redis = await getRedisClient();
    const cacheKey = `ukg:schedule:${employeeNumbers.sort().join(',')}:${startDate}:${endDate}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // Fetch from UKG
    const requestBody = buildScheduleRequestBody(employeeNumbers, startDate, endDate);
    const raw = await ukgPost<UkgScheduleRawResponse>(
      '/api/v1/scheduling/schedule/multi_read',
      requestBody,
      baseUrl
    );

    const result = transformScheduleResponse(raw);

    // Cache the transformed result
    await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL_SECONDS);

    return res.status(200).json(result);
  } catch (error: unknown) {
    console.error('[UKG Schedule] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch schedule';
    return res.status(500).json({ error: message });
  }
}
