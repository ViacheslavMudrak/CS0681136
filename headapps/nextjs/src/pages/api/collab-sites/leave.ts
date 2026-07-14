import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { leaveCollabSite } from 'lib/collab-sites/services/collab-site.service';
import { log } from 'src/util/helpers/log-helper';
import { authOptions } from '../auth/[...nextauth]';
import type { LeaveGroupRequest, LeaveGroupResponse } from 'lib/collab-sites/collab-site.types';

const COMPONENT = 'api:collab-sites:leave';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaveGroupResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const body = req.body as LeaveGroupRequest;
    const { groupEmails } = body;

    if (!groupEmails || !Array.isArray(groupEmails) || groupEmails.length === 0) {
      return res.status(400).json({ success: false, error: 'groupEmails array is required' });
    }

    log('INFO', COMPONENT, 'Leave request', { userEmail, groupCount: groupEmails.length });

    const result = await leaveCollabSite(userEmail, groupEmails);

    const status = result.isOwner ? 403 : result.success ? 200 : 500;
    return res.status(status).json(result);
  } catch (error: unknown) {
    log('ERROR', COMPONENT, 'Unhandled error', { error: String(error) });
    return res.status(500).json({ success: false, error: 'An unexpected error occurred' });
  }
}
