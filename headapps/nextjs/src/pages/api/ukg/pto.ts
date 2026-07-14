import { getRedisClient } from 'lib/cache/redis';
import { ukgPost } from 'lib/ukg/ukgClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '../auth/[...nextauth]';

const CACHE_TTL_SECONDS = 15 * 60;

type AccrualSummaryItem = {
  accrualCode?: {
    id?: number;
    name?: string;
    shortName?: string;
  };
  dailySummaries?: Array<{
    balanceDate?: string;
    currentBalance?: {
      vestedHoursAmount?: number;
    };
    availableBalanceHours?: number;
    plannedTakingHours?: number;
  }>;
};

type AccrualResponse = Array<{
  employeeId?: { id?: number; qualifier?: string; name?: string };
  accrualSummaryData?: AccrualSummaryItem[];
}>;

type PayCodeEdit = {
  id?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  employee?: { id?: number; qualifier?: string };
  payCodeRef?: { id?: number; qualifier?: string };
  durationInMinutes?: string;
  durationInTime?: number;
};

type ScheduleResponse = {
  shifts?: unknown[];
  payCodeEdits?: PayCodeEdit[];
  leaveEdits?: unknown[];
  availabilities?: unknown[];
  holidays?: unknown[];
  dayLocks?: unknown[];
  employees?: unknown[];
  openShifts?: unknown[];
  scheduleDayList?: unknown[];
  expandedJobs?: unknown[];
  scheduleTags?: unknown[];
};

type TimeOffRequest = {
  id?: number;
  creator?: { id?: number; qualifier?: string };
  employee?: { id?: number; qualifier?: string };
  createDateTime?: string;
  requestSubType?: {
    requestType?: { id?: number; name?: string; description?: string };
    symbol?: string;
    id?: number;
    name?: string;
    description?: string;
  };
  currentStatus?: { id?: number; symbolicId?: string; name?: string };
  periods?: Array<{
    id?: number;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    duration?: number;
    payCode?: { id?: number; qualifier?: string };
    symbolicAmount?: { id?: number; qualifier?: string };
  }>;
  approvalPeriods?: Array<unknown>;
  nextValidStatuses?: Array<{ id?: number; symbolicId?: string; name?: string }>;
  requestStatusChanges?: Array<{
    changeDateTime?: string;
    fromStatus?: { id?: number; symbolicId?: string; name?: string };
    toStatus?: { id?: number; symbolicId?: string; name?: string };
    personName?: string;
  }>;
  historical?: boolean;
  position?: { id?: number; qualifier?: string };
  positionDetails?: Array<unknown>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action = 'balance', baseUrl } = req.body;
    let { employeeNumbers, startDate, endDate } = req.body;

    if (!session?.employeeNumber || session?.voyagerMockJson?.enableMocking === 'true') {
      employeeNumbers = session?.voyagerMockJson?.ukgPtoPersonNumber
        ? [session?.voyagerMockJson?.ukgPtoPersonNumber]
        : employeeNumbers;
      startDate = session?.voyagerMockJson?.ukgPtoStartDate
        ? session?.voyagerMockJson?.ukgPtoStartDate
        : startDate;
      endDate = session?.voyagerMockJson?.ukgPtoEndDate
        ? session?.voyagerMockJson?.ukgPtoEndDate
        : endDate;
    }

    if (!employeeNumbers?.length) {
      return res.status(400).json({ error: 'employeeNumbers is required' });
    }

    const redis = await getRedisClient();
    const sortedEmployeeNumbers = [...employeeNumbers].sort();

    switch (action) {
      case 'balance': {
        // PTO Balance - Current available PTO
        if (!startDate) {
          return res.status(400).json({ error: 'startDate is required for balance' });
        }

        const cacheKey = `ukg:pto:balance:${sortedEmployeeNumbers.join(',')}:${startDate}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('[UKG PTO] Balance cache hit');
          return res.status(200).json(JSON.parse(cached));
        }

        console.log('[UKG PTO] Balance cache miss, fetching from UKG');

        const requestPayload = {
          select: ['ACCRUAL_SUMMARY'],
          where: {
            employeeSet: {
              employees: {
                qualifiers: employeeNumbers,
              },
              dateRange: {
                startDate: startDate,
                endDate: startDate,
              },
            },
          },
        };

        console.log('[UKG PTO] Balance request payload:', JSON.stringify(requestPayload, null, 2));

        const data = await ukgPost<AccrualResponse>(
          '/api/v1/timekeeping/timecard_metrics/multi_read',
          requestPayload,
          baseUrl
        );

        // Transform to extract PTO balance
        const result = data.map((emp) => {
          const ptoEntry = emp.accrualSummaryData?.find(
            (entry) =>
              entry.accrualCode?.name === 'PTO Earned' ||
              entry.accrualCode?.name === 'PTO Front Load'
          );

          const dailySummary = ptoEntry?.dailySummaries?.[0];

          return {
            employeeId: emp.employeeId?.qualifier || 'Unknown',
            ptoBalance: dailySummary?.currentBalance?.vestedHoursAmount || 0,
            balanceDate: dailySummary?.balanceDate || startDate,
          };
        });

        console.log('[UKG PTO] Balance result:', result);

        await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL_SECONDS);
        return res.status(200).json(result);
      }

      case 'remaining': {
        // PTO Remaining - Available PTO minus future requests
        if (!startDate) {
          return res.status(400).json({ error: 'startDate is required for remaining' });
        }

        const cacheKey = `ukg:pto:remaining:${sortedEmployeeNumbers.join(',')}:${startDate}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('[UKG PTO] Remaining cache hit');
          return res.status(200).json(JSON.parse(cached));
        }

        console.log('[UKG PTO] Remaining cache miss, fetching from UKG');

        const requestPayload = {
          select: ['ACCRUAL_SUMMARY'],
          where: {
            employeeSet: {
              employees: {
                qualifiers: employeeNumbers,
              },
              dateRange: {
                startDate: startDate,
                endDate: startDate,
              },
            },
          },
        };

        const data = await ukgPost<AccrualResponse>(
          '/api/v1/timekeeping/timecard_metrics/multi_read',
          requestPayload,
          baseUrl
        );

        // Transform to extract remaining PTO
        const result = data.map((emp) => {
          const ptoEntry = emp.accrualSummaryData?.find(
            (entry) =>
              entry.accrualCode?.name === 'PTO Earned' ||
              entry.accrualCode?.name === 'PTO Front Load'
          );

          const dailySummary = ptoEntry?.dailySummaries?.[0];

          return {
            employeeId: emp.employeeId?.qualifier || 'Unknown',
            ptoRemaining: dailySummary?.availableBalanceHours || 0,
            plannedTaking: dailySummary?.plannedTakingHours || 0,
            balanceDate: dailySummary?.balanceDate || startDate,
          };
        });

        console.log('[UKG PTO] Remaining result:', result);

        await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL_SECONDS);
        return res.status(200).json(result);
      }

      case 'next-pto': {
        if (!startDate || !endDate) {
          return res.status(400).json({
            error: 'startDate and endDate are required for next-pto',
          });
        }

        const cacheKey = `ukg:pto:next:${sortedEmployeeNumbers.join(',')}:${startDate}:${endDate}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('[UKG PTO] Next PTO cache hit');
          return res.status(200).json(JSON.parse(cached));
        }

        console.log('[UKG PTO] Next PTO cache miss, fetching from UKG');

        const requestPayload = {
          select: ['PAYCODEEDITS'],
          where: {
            employees: {
              startDate,
              endDate,
              employeeRefs: {
                qualifiers: employeeNumbers,
              },
            },
          },
        };

        console.log('[UKG PTO] Next PTO request payload:', JSON.stringify(requestPayload, null, 2));

        const data = await ukgPost<ScheduleResponse>(
          '/api/v1/scheduling/schedule/multi_read',
          requestPayload,
          baseUrl
        );

        console.log(
          '[UKG PTO] Next PTO response - payCodeEdits count:',
          data.payCodeEdits?.length || 0
        );

        // Filter for PTO entries only
        const ptoEdits = (data.payCodeEdits || []).filter((edit) => {
          const isPTO = edit.payCodeRef?.qualifier?.toUpperCase().includes('PTO');
          return isPTO;
        });

        console.log('[UKG PTO] Filtered PTO edits count:', ptoEdits.length);

        await redis.set(cacheKey, JSON.stringify(ptoEdits), 'EX', CACHE_TTL_SECONDS);
        console.log('[UKG PTO] Next PTO result cached');

        return res.status(200).json(ptoEdits);
      }

      case 'requests': {
        // PTO Requests - List of all future PTO requests with status
        if (!startDate || !endDate) {
          return res.status(400).json({
            error: 'startDate and endDate are required for requests',
          });
        }

        const cacheKey = `ukg:pto:requests:${sortedEmployeeNumbers.join(',')}:${startDate}:${endDate}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('[UKG PTO] Requests cache hit');
          return res.status(200).json(JSON.parse(cached));
        }

        console.log('[UKG PTO] Requests cache miss, fetching from UKG');

        const requestPayload = {
          where: {
            employees: {
              employeeRefs: {
                qualifiers: employeeNumbers,
              },
              startDate,
              endDate,
            },
          },
        };

        console.log('[UKG PTO] Requests payload:', JSON.stringify(requestPayload, null, 2));

        const data = await ukgPost<TimeOffRequest[]>(
          '/api/v1/scheduling/timeoff/multi_read',
          requestPayload,
          baseUrl
        );

        console.log('[UKG PTO] Requests response - count:', data?.length || 0);

        await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS);
        console.log('[UKG PTO] Requests result cached');

        return res.status(200).json(data);
      }

      default:
        return res.status(400).json({
          error: `Unknown action: ${action}. Valid actions: balance, remaining, next-pto, requests`,
        });
    }
  } catch (e: unknown) {
    console.error('[UKG PTO] Error:', e);
    const message = e instanceof Error ? e.message : 'Failed to fetch PTO data';
    return res.status(500).json({ error: message });
  }
}
