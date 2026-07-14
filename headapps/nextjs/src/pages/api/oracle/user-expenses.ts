import { getRedisClient } from 'lib/cache/redis';
import { getUserExpenses } from 'lib/oracle/user-expenses';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '../auth/[...nextauth]';

const CACHE_TTL_SECONDS = 15 * 60; // 15 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized - Please sign in' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const voyagerMockJson = session.voyagerMockJson;
    let employeeId: string | undefined = session?.user?.email || undefined;

    if (session?.voyagerMockJson?.enableMocking === 'true' && voyagerMockJson?.oracleEmployeeId) {
      employeeId = voyagerMockJson?.oracleEmployeeId;
    }

    // Check Redis cache
    const redis = await getRedisClient();
    const cacheKey = `oracle:expenses:${session?.user?.id}:${limit ?? 'all'}:${offset ?? '0'}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const data = await getUserExpenses({ limit, offset, employeeId });

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS);

    return res.status(200).json(data);
  } catch (error) {
    console.error('[API] Oracle user-expenses error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
