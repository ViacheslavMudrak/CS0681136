// =============================================================================
// Oracle User Actions — BPM Task API helpers
// =============================================================================

import { oracleClientWithToken } from './oracle-oauth-client';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface OracleTask {
  title: string;
  state: string;
  identificationKey: string;
  dueDate: string;
  expirationDate: string;
  tasknumber: string;
}

export interface OracleTasksResponse {
  items: OracleTask[];
  totalResults?: number;
  count?: number;
  hasMore?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetUserApprovalsOptions {
  keyword?: string;
  limit?: number;
  offset?: number;
}

// -----------------------------------------------------------------------------
// API methods
// -----------------------------------------------------------------------------

/**
 * Fetch user approval tasks from Oracle BPM.
 *
 * Default endpoint:
 * `/bpm/api/4.0/tasks?assignment=MY&fields=...&keyword=Approve%Requisition&limit=100&offset=0`
 */
export async function getUserApprovals(
  options: GetUserApprovalsOptions = {}
): Promise<OracleTasksResponse> {
  const { keyword = 'Approve%Requisition', limit = 100, offset = 0 } = options;

  return oracleClientWithToken<OracleTasksResponse>('/bpm/api/4.0/tasks', {
    params: {
      assignment: 'MY',
      fields: 'title,state,identificationKey,dueDate,expirationDate,tasknumber',
      keyword,
      limit: String(limit),
      offset: String(offset),
    },
  });
}
