import type { NextApiRequest, NextApiResponse } from 'next';
import { ukgGet } from 'lib/ukg/ukgClient';

type CurrentUserInfo = {
  id: number;
  qualifier: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  contactInformation?: {
    email?: string;
    phone?: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CurrentUserInfo | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseUrl = typeof req.query.baseUrl === 'string' ? req.query.baseUrl : undefined;

    console.log('[UKG Current User] Fetching current user info');

    const data = await ukgGet<CurrentUserInfo>(
      '/api/v1/commons/persons/current_user_info?include_contact_information=true',
      baseUrl
    );

    console.log('[UKG Current User] Response:', data);

    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error('[UKG Current User] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch current user info';
    const statusCode = message.includes('403') || message.includes('Forbidden') ? 403 : 500;

    return res.status(statusCode).json({ error: message });
  }
}
