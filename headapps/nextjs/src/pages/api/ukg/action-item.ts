import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from 'lib/cache/redis';
import { ukgPost } from 'lib/ukg/ukgClient';

const CACHE_TTL_SECONDS = 15 * 60;

type ShiftSwapActionItem = {
  id?: number;
  employee?: { id?: number; qualifier?: string };
  creator?: { id?: number; qualifier?: string };
  createDateTime?: string;
  startDateTime?: string;
  endDateTime?: string;
  requestSubType?: {
    requestType?: { id?: number; name?: string; description?: string };
    symbol?: string;
    id?: number;
    name?: string;
  };
  currentStatus?: { id?: number; symbolicId?: string; name?: string };
  requestStatusChanges?: Array<{
    changeDateTime?: string;
    fromStatus?: { id?: number; symbolicId?: string; name?: string };
    toStatus?: { id?: number; symbolicId?: string; name?: string };
    personName?: string;
  }>;
  swapShift?: {
    offered?: {
      employee?: { id?: number; qualifier?: string };
      shift?: { id?: number; qualifier?: string | null };
      shiftVersion?: number;
    };
    requested?: Array<{
      employee?: { id?: number; qualifier?: string };
      shift?: { id?: number; qualifier?: string | null };
      shiftVersion?: number;
    }>;
  };
  position?: { id?: number; qualifier?: string };
  positionDetails?: Array<unknown>;
  marketSwapOffers?: Array<unknown>;
  swapMarketRequest?: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { employeeNumber, startDate, endDate, baseUrl } = req.body;

    if (!employeeNumber) {
      return res.status(400).json({ error: 'employeeNumber is required' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const redis = await getRedisClient();
    const cacheKey = `ukg:shift-swap-actions:${employeeNumber}:${startDate}:${endDate}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('[UKG Shift Swap Actions] Cache hit');
      return res.status(200).json(JSON.parse(cached));
    }

    console.log('[UKG Shift Swap Actions] Cache miss, fetching from UKG');

    const requestPayload = {
      where: {
        statuses: {
          employees: [
            {
              qualifier: employeeNumber,
            },
          ],
          startDate,
          endDate,
          statuses: ['REQUEST_STATE_SUBMITTED'],
        },
      },
      multiReadOptions: {
        includeShiftDetails: false,
      },
    };

    const data = await ukgPost<ShiftSwapActionItem[]>(
      '/api/v1/scheduling/manager_swap/multi_read',
      requestPayload,
      baseUrl
    );

    await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS);
    console.log('[UKG Shift Swap Actions] Result cached');

    return res.status(200).json(data);
  } catch (e: unknown) {
    console.error('[UKG Shift Swap Actions] Error:', e);
    const message = e instanceof Error ? e.message : 'Failed to fetch shift swap action items';
    return res.status(500).json({ error: message });
  }
}
