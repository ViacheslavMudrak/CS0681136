import type { NextApiRequest, NextApiResponse } from 'next';
import { getCompanyDirectory } from 'src/lib/google/services/people-directory-service';
import { log } from 'src/util/helpers/log-helper';

import type {
  DirectoryPerson,
  PeopleDirectoryListResponse,
} from 'src/lib/google/types/people-directory';

// ============================================================================
// Types
// ============================================================================

interface ErrorResponse {
  error: string;
  details?: string;
  code?: number;
}

type ListUsersResponse = PeopleDirectoryListResponse | ErrorResponse;

// ============================================================================
// Constants
// ============================================================================

const COMPONENT = 'PeopleDirectoryListApi';
const DEFAULT_PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 50;

// ============================================================================
// Query helpers
// ============================================================================

function parseIntParam(raw: unknown, fallback: number, max?: number): number {
  if (typeof raw !== 'string') return fallback;
  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

function parseMultiValueParam(raw: NextApiRequest['query'][string]): string[] {
  if (!raw) return [];
  return (Array.isArray(raw) ? raw : [raw]).map((v) => v.trim()).filter(Boolean);
}

function parsePreset(raw: unknown): { field: string; value: string } | null {
  if (typeof raw !== 'string') return null;
  const separatorIndex = raw.indexOf(':');
  if (separatorIndex === -1) return null;
  const field = raw.slice(0, separatorIndex).trim();
  const value = raw.slice(separatorIndex + 1).trim();
  if (!field || !value) return null;
  return { field, value };
}

// ============================================================================
// Filter / paginate
// ============================================================================

function applyFilters(
  users: DirectoryPerson[],
  selectedLocations: string[],
  selectedDepartments: string[],
  preset: { field: string; value: string } | null,
  searchQuery: string
): DirectoryPerson[] {
  let result = users;

  if (selectedLocations.length > 0) {
    const allowed = new Set(selectedLocations);
    result = result.filter((u) => u.location && allowed.has(u.location));
  }

  if (selectedDepartments.length > 0) {
    const allowed = new Set(selectedDepartments);
    result = result.filter((u) => u.department && allowed.has(u.department));
  }

  if (preset) {
    result = result.filter((u) => {
      const fieldValue = u[preset.field as keyof DirectoryPerson];
      return typeof fieldValue === 'string' && fieldValue === preset.value;
    });
  }

  const trimmedQuery = searchQuery.trim().toLowerCase();
  if (trimmedQuery) {
    result = result.filter((u) => {
      const haystack = [
        u.name.givenName,
        u.name.familyName,
        u.name.fullName,
        u.jobTitle,
        u.location,
        u.primaryEmail,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }

  return result;
}

// ============================================================================
// Handler
// ============================================================================

/**
 * GET /api/google/admin/directory/users/list
 *
 * Returns a paginated, filtered slice of Google Workspace users for the given
 * company code. The full per-company user list is cached server-side in Redis;
 * this endpoint reads from that cache and applies search / filter / pagination
 * in memory.
 *
 * Query Parameters:
 * - companyCode (required) — User_Info.Company_Code value to filter by
 * - page (default 1)
 * - pageSize (default 8, max 50)
 * - location — repeat to filter by multiple locations
 * - department — repeat to filter by multiple departments
 * - q — search term (matched against name, email, jobTitle, location)
 * - preset — `field:value` string for CTA preset filters (e.g. `department:ACRI Support`)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListUsersResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed', code: 405 });
  }

  const companyCode = typeof req.query.companyCode === 'string' ? req.query.companyCode : '';

  if (!companyCode) {
    return res.status(400).json({
      error: 'companyCode query parameter is required',
      code: 400,
    });
  }

  try {
    const collectedUsers: DirectoryPerson[] = [];
    const errorCompanyCodes: string[] = [];
    const companyCodes = [
      ...new Set(
        companyCode
          .split(',')
          .map((code) => code.trim())
          .filter(Boolean)
      ),
    ];

    if (companyCodes.length > 0) {
      await Promise.all(
        companyCodes.map(async (code) => {
          const entry = await getCompanyDirectory(code);
          if (entry) {
            collectedUsers.push(...entry.users);
          } else {
            errorCompanyCodes.push(code);
          }
        })
      );
    }

    // Deduplicate users by primaryEmail in case a user appears in multiple company directories
    const seen = new Set<string>();
    const users = collectedUsers.filter((u) => {
      if (seen.has(u.primaryEmail)) return false;
      seen.add(u.primaryEmail);
      return true;
    });

    if (errorCompanyCodes?.length > 0) {
      return res.status(503).json({
        error: `People directory is not yet available for some companies : ${errorCompanyCodes.join(', ')} — please retry in a moment`,
        code: 503,
      });
    }

    const page = parseIntParam(req.query.page, 1);
    const pageSize = parseIntParam(req.query.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const selectedLocations = parseMultiValueParam(req.query.location);
    const selectedDepartments = parseMultiValueParam(req.query.department);
    const preset = parsePreset(req.query.preset);
    const searchQuery = typeof req.query.q === 'string' ? req.query.q : '';

    const filtered = applyFilters(
      users,
      selectedLocations,
      selectedDepartments,
      preset,
      searchQuery
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const sliceStart = (safePage - 1) * pageSize;
    const slice = filtered.slice(sliceStart, sliceStart + pageSize);

    /**
     * Faceted dropdown options: each list reflects the current filter set with
     * its own selection excluded, so multi-select stays usable (selecting one
     * value within a filter doesn't remove the others from its own dropdown),
     * while the *other* filter still narrows the available options.
     */
    const filteredForFacet = applyFilters(users, [], selectedDepartments, preset, searchQuery);
    const locations = [
      ...new Set(
        filteredForFacet.map((u) => u.location).filter((loc): loc is string => Boolean(loc))
      ),
    ].sort();

    const filteredForDepartmentFacet = applyFilters(
      users,
      selectedLocations,
      [],
      preset,
      searchQuery
    );
    const departments = [
      ...new Set(
        filteredForDepartmentFacet
          .map((u) => u.department)
          .filter((dept): dept is string => Boolean(dept))
      ),
    ].sort();

    const response: PeopleDirectoryListResponse = {
      users: slice,
      totalCount: users.length,
      filteredCount: filtered.length,
      locations,
      departments,
      page: safePage,
      totalPages,
      pageSize,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    log('ERROR', COMPONENT, 'Failed to serve directory page', {
      companyCode,
      error: error instanceof Error ? error.message : String(error),
    });

    const apiError = error as { code?: number; message?: string };

    if (apiError.code === 403) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions to list users.',
        details: apiError.message || undefined,
        code: 403,
      });
    }

    if (apiError.code === 401) {
      return res.status(401).json({
        error: 'Authentication failed. Service account credentials may be invalid.',
        code: 401,
      });
    }

    return res.status(500).json({
      error: apiError.message || 'Failed to fetch users',
      details: String(error),
      code: 500,
    });
  }
}
