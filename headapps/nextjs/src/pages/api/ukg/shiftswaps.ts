import { getRedisClient } from 'lib/cache/redis';
import { ukgPost } from 'lib/ukg/ukgClient';
import { buildShiftSwapRequestBody } from 'lib/ukg/ukgHelper';
import type { NextApiRequest, NextApiResponse } from 'next';

const CACHE_TTL_SECONDS = 15 * 60; // 15 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      action = 'list',
      personNumbers,
      startDate,
      endDate,
      includeShiftDetails = true,
      baseUrl,
    } = req.body;

    if (!personNumbers || !Array.isArray(personNumbers) || personNumbers.length === 0) {
      return res.status(400).json({
        error: 'personNumbers array is required',
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required',
      });
    }

    const endpoint = '/api/v1/scheduling/manager_swap/multi_read';
    const redis = await getRedisClient();

    const sortedPersonNumbers = [...personNumbers].sort();
    const cacheKey = `ukg:shiftswaps:${action}:${sortedPersonNumbers.join(',')}:${startDate}:${endDate}`;

    // Check cache FIRST
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[UKG Shiftswaps] Cache hit for action=${action}`);
      return res.status(200).json(JSON.parse(cached));
    }

    let requestBody;
    let data;

    switch (action) {
      case 'list': {
        // List: Offered shift swaps (REQUEST_STATE_OFFERED)
        requestBody = buildShiftSwapRequestBody(personNumbers, {
          startDate,
          endDate,
          statuses: ['REQUEST_STATE_OFFERED'],
          includeShiftDetails,
        });
        data = await ukgPost(endpoint, requestBody, baseUrl);
        break;
      }

      case 'approved': {
        // Approved shift swaps (REQUEST_STATE_APPROVED)
        requestBody = buildShiftSwapRequestBody(personNumbers, {
          startDate,
          endDate,
          statuses: ['REQUEST_STATE_APPROVED'],
          includeShiftDetails,
        });
        data = await ukgPost(endpoint, requestBody, baseUrl);
        break;
      }

      case 'denied': {
        // Denied shift swaps (REQUEST_STATE_REFUSED, REQUEST_STATE_REJECTED)
        requestBody = buildShiftSwapRequestBody(personNumbers, {
          startDate,
          endDate,
          statuses: ['REQUEST_STATE_REFUSED', 'REQUEST_STATE_REJECTED'],
          includeShiftDetails,
        });
        data = await ukgPost(endpoint, requestBody, baseUrl);
        break;
      }

      default:
        return res.status(400).json({
          error: `Unknown action: ${action}. Valid actions: list, approved, denied`,
        });
    }

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS);
    console.log(`[UKG Shiftswaps] Cached result for action=${action}`);

    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('[UKG Shiftswaps] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process shiftswaps request';
    return res.status(500).json({ error: message });
  }
}
