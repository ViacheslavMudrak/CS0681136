import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from 'lib/cache/redis';
import { ukgGet, ukgPost } from 'lib/ukg/ukgClient';

const CACHE_TTL_SECONDS = 15 * 60;

type UkgExceptionCategory = {
  id: number;
  name: string;
  description?: string;
  color?: string;
  exceptionTypes: Array<{ id?: number; qualifier: string }>;
  callToActions?: Array<{ id: number; qualifier: string }>;
};

type ActualTotalItem = {
  uniqueId?: string;
  employee?: { id?: number; qualifier?: string; name?: string };
  hoursAmount?: number;
  wages?: number;
  payPeriodWeek?: number;
  payPeriodNumber?: number;
  signedOff?: boolean;
};

type ActualTotalsResponse = Array<{
  employeeId?: { id?: number; qualifier?: string; name?: string };
  actualTotals?: ActualTotalItem[];
}>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action = 'exceptions', employeeNumbers, paycodes, baseUrl } = req.body;

    const redis = await getRedisClient();

    switch (action) {
      case 'exceptions': {
        const cacheKey = 'ukg:exception_categories';

        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('[UKG Team Time] Exception categories cache hit');
          return res.status(200).json(JSON.parse(cached));
        }

        console.log('[UKG Team Time] Exception categories cache miss, fetching from UKG');

        const categories = await ukgGet<UkgExceptionCategory[]>(
          '/api/v1/timekeeping/exception_categories',
          baseUrl
        );

        await redis.set(cacheKey, JSON.stringify(categories), 'EX', CACHE_TTL_SECONDS);
        console.log('[UKG Team Time] Exception categories cached');
        return res.status(200).json(categories);
      }

      case 'scorecard': {
        if (!employeeNumbers?.length) {
          return res.status(400).json({
            error: 'employeeNumbers are required for scorecard',
          });
        }

        const sortedEmployeeNumbers = [...employeeNumbers].sort();
        const sortedPaycodes = (paycodes || ['Regular', 'Overtime']).sort();

        const cacheKey = `ukg:team-time-scorecard:${sortedEmployeeNumbers.join(',')}:${sortedPaycodes.join(',')}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('[UKG Team Time] Scorecard cache hit');
          return res.status(200).json(JSON.parse(cached));
        }

        console.log('[UKG Team Time] Scorecard cache miss, fetching from UKG');

        const requestPayload = {
          select: ['ACTUAL_TOTALS'],
          where: {
            employeeSet: {
              dateRange: {
                symbolicPeriod: {
                  qualifier: 'Previous_Payperiod',
                },
              },
              employees: {
                qualifiers: employeeNumbers,
              },
            },
          },
          paycodes: {
            qualifiers: paycodes || ['Regular', 'Overtime'],
          },
          rollupContext: {
            byEmployee: true,
            byPaycode: false,
            byDate: false,
            byDateRange: true,
            byOrg: false,
            byLaborCategory: false,
          },
        };

        const data = await ukgPost<ActualTotalsResponse>(
          '/api/v1/timekeeping/timecard_metrics/multi_read',
          requestPayload,
          baseUrl
        );

        await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS);
        console.log('[UKG Team Time] Scorecard result cached');
        return res.status(200).json(data);
      }

      case 'team-exceptions': {
        // Get team exceptions for My Team Time tile (Current Pay Period)
        if (!employeeNumbers?.length) {
          return res.status(400).json({
            error: 'employeeNumbers are required for team-exceptions',
          });
        }

        const sortedEmployeeNumbers = [...employeeNumbers].sort();
        const cacheKey = `ukg:team-exceptions:current-payperiod:${sortedEmployeeNumbers.join(',')}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('[UKG Team Time] Team exceptions cache hit');
          return res.status(200).json(JSON.parse(cached));
        }

        const requestPayload = {
          select: ['EXCEPTIONS'],
          multiReadOptions: {
            exceptionOptions: {
              includeJustifications: false,
            },
          },
          where: {
            employees: {
              qualifiers: employeeNumbers,
            },
            dateRange: {
              symbolicPeriod: {
                qualifier: 'Current_Payperiod',
              },
            },
          },
        };

        console.log('[UKG Team Time] Request payload:', JSON.stringify(requestPayload, null, 2));

        const data = await ukgPost(
          '/api/v1/timekeeping/timecard/multi_read',
          requestPayload,
          baseUrl
        );

        await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS);
        return res.status(200).json(data);
      }

      default:
        return res.status(400).json({
          error: `Unknown action: ${action}. Valid actions: exceptions, scorecard, team-exceptions`,
        });
    }
  } catch (e: unknown) {
    console.error('[UKG Team Time] Error:', e);
    const message = e instanceof Error ? e.message : 'Failed to fetch team time';
    return res.status(500).json({ error: message });
  }
}
