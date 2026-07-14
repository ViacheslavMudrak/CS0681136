import { admin, type admin_directory_v1 } from '@googleapis/admin';
import { getServiceAccountClient } from 'lib/auth/google-client';
import { getRedisClient } from 'src/lib/cache/redis';
import { log } from 'src/util/helpers/log-helper';
import type {
  DirectoryPerson,
  PeopleDirectoryCacheEntry,
} from 'src/lib/google/types/people-directory';

// ============================================================================
// Constants
// ============================================================================

const COMPONENT = 'PeopleDirectoryService';

const DIRECTORY_USER_READONLY_SCOPE =
  'https://www.googleapis.com/auth/admin.directory.user.readonly';

/** Custom schema in Google Workspace where companyCode is defined. */
const CUSTOM_SCHEMA_NAME = 'User_Info';
const CUSTOM_SCHEMA_FIELD = 'Company_Code';

/**
 * Allowlist of Google Workspace OU prefixes that contain real people.
 * Everything else (shared mailboxes, service accounts, room resources, etc.)
 * is excluded from the People Directory even when it carries a `Company_Code`.
 * - `/EMP/`    - employees
 * - `/CWR/`    - contingent workers
 * - `/Custom/` - custom roles
 */
const PERSON_OU_PREFIXES = ['/EMP/', '/CWR/', '/Custom/'] as const;

const USER_FIELDS = [
  'users(id,primaryEmail,name,thumbnailPhotoUrl,organizations,phones,locations,addresses,suspended,customSchemas,orgUnitPath)',
  'nextPageToken',
].join(',');

/** Hard TTL — beyond this the cache entry is dropped and a fresh fetch is required. */
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Soft freshness window. A cache entry older than this is still served, but a
 * background refresh is kicked off behind a Redis lock so the next request gets
 * fresh data without anyone waiting on the slow Google fetch.
 */
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Lock TTL — must comfortably exceed the worst-case Google fetch (~minutes for 80k users). */
const LOCK_TTL_SECONDS = 10 * 60;

/** Polling cadence + ceiling when waiting on another worker's in-flight refresh. */
const WAIT_POLL_MS = 500;
const WAIT_TIMEOUT_MS = 60 * 1000;

// ============================================================================
// Cache key helpers
// ============================================================================

function cacheKey(companyCode: string): string {
  return `people-directory:users:${companyCode.toLowerCase()}`;
}

function lockKey(companyCode: string): string {
  return `people-directory:lock:${companyCode.toLowerCase()}`;
}

// ============================================================================
// Mapping
// ============================================================================

function mapToDirectoryPerson(user: admin_directory_v1.Schema$User): DirectoryPerson {
  const customSchema = user.customSchemas?.[CUSTOM_SCHEMA_NAME] as
    | Record<string, unknown>
    | undefined;

  return {
    id: user.id || '',
    primaryEmail: user.primaryEmail || '',
    name: {
      givenName: user.name?.givenName || undefined,
      familyName: user.name?.familyName || undefined,
      fullName: user.name?.fullName || undefined,
    },
    thumbnailPhotoUrl: user.thumbnailPhotoUrl || undefined,
    jobTitle: user.organizations?.[0]?.title || undefined,
    department: user.organizations?.[0]?.department || undefined,
    phone: user.phones?.[0]?.value || undefined,
    location: user.organizations?.[0]?.location
      ? user.addresses?.[0]?.region
        ? `${user.organizations[0].location}, ${user.addresses[0].region}`
        : user.organizations[0].location
      : undefined,
    orgUnitPath: user.orgUnitPath || undefined,
    businessUnit:
      customSchema?.Business_Unit != null ? String(customSchema.Business_Unit) : undefined,
    employeeClass:
      customSchema?.Employee_Class != null ? String(customSchema.Employee_Class) : undefined,
    employeeNumber:
      customSchema?.Employee_Number != null ? String(customSchema.Employee_Number) : undefined,
    isManager: customSchema?.Is_Manager != null ? String(customSchema.Is_Manager) : undefined,
    managerLevel:
      customSchema?.Manager_Level != null ? String(customSchema.Manager_Level) : undefined,
    workLocationCode:
      customSchema?.Work_Location_Code != null
        ? String(customSchema.Work_Location_Code)
        : undefined,
  };
}

// ============================================================================
// Google fetch
// ============================================================================

async function fetchAllUsersFromGoogle(companyCode: string): Promise<DirectoryPerson[]> {
  const jwtClient = getServiceAccountClient({
    scopes: [DIRECTORY_USER_READONLY_SCOPE],
  });
  const directoryClient = admin({ version: 'directory_v1', auth: jwtClient });

  const allUsers: admin_directory_v1.Schema$User[] = [];
  let pageToken: string | undefined;

  /**
   * Restrict the fetch to active employees at the source: `isSuspended=false`
   * drops disabled accounts and `isArchived=false` drops former employees whose
   * accounts have been archived. The custom-schema clause is ANDed implicitly.
   */
  const query = `${CUSTOM_SCHEMA_NAME}.${CUSTOM_SCHEMA_FIELD}='${companyCode}' isSuspended=false isArchived=false`;

  do {
    const response = await directoryClient.users.list({
      customer: 'my_customer',
      query,
      projection: 'full',
      maxResults: 500,
      pageToken,
      orderBy: 'givenName',
      fields: USER_FIELDS,
    });

    if (response.data.users) {
      allUsers.push(...response.data.users);
    }
    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  const realUsers = allUsers.filter(
    (u) => !!u.orgUnitPath && PERSON_OU_PREFIXES.some((prefix) => u.orgUnitPath!.startsWith(prefix))
  );

  return realUsers.map(mapToDirectoryPerson);
}

function buildCacheEntry(users: DirectoryPerson[]): PeopleDirectoryCacheEntry {
  return {
    users,
    totalCount: users.length,
    refreshedAt: Date.now(),
  };
}

// ============================================================================
// Cache read / write
// ============================================================================

async function readCache(companyCode: string): Promise<PeopleDirectoryCacheEntry | null> {
  try {
    const redis = await getRedisClient();
    const raw = await redis.get(cacheKey(companyCode));
    if (!raw) return null;
    return JSON.parse(raw) as PeopleDirectoryCacheEntry;
  } catch (err) {
    log('ERROR', COMPONENT, 'Cache read failed', {
      companyCode,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

async function writeCache(companyCode: string, entry: PeopleDirectoryCacheEntry): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.set(cacheKey(companyCode), JSON.stringify(entry), 'EX', CACHE_TTL_SECONDS);
  } catch (err) {
    log('ERROR', COMPONENT, 'Cache write failed', {
      companyCode,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Acquire a per-company-code refresh lock. Returns true if the caller owns the
 * lock and should proceed with the Google fetch. Returns false if another pod
 * (or a previous in-flight refresh) already holds it.
 */
async function acquireRefreshLock(companyCode: string): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    const result = await redis.set(lockKey(companyCode), '1', 'EX', LOCK_TTL_SECONDS, 'NX');
    return result === 'OK';
  } catch (err) {
    log('ERROR', COMPONENT, 'Lock acquire failed', {
      companyCode,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

async function releaseRefreshLock(companyCode: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.del(lockKey(companyCode));
  } catch (err) {
    log('ERROR', COMPONENT, 'Lock release failed', {
      companyCode,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Polls Redis until the cache entry appears or `WAIT_TIMEOUT_MS` elapses. Used
 * when another worker holds the refresh lock so the caller can return the
 * freshly-populated entry instead of failing immediately.
 */
async function waitForCacheEntry(companyCode: string): Promise<PeopleDirectoryCacheEntry | null> {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, WAIT_POLL_MS));
    const entry = await readCache(companyCode);
    if (entry) return entry;
  }
  return null;
}

interface RefreshOptions {
  /** When true, callers blocked on another worker's refresh wait for the result. */
  waitIfLocked?: boolean;
}

/**
 * Fetches users from Google for the given company code, caches the result, and
 * returns the populated cache entry. The Redis lock ensures only one worker
 * actually runs the slow Google fetch per company code at a time.
 *
 * When the lock is already held, behavior depends on `waitIfLocked`:
 * - `true` (user-initiated) → poll Redis until the in-flight refresh writes
 *   the entry (or the wait timeout elapses).
 * - `false` (background warmer) → return the existing cache (likely null) and
 *   let the lock-holder do the work.
 */
export async function refreshCompanyDirectory(
  companyCode: string,
  options: RefreshOptions = {}
): Promise<PeopleDirectoryCacheEntry | null> {
  const acquired = await acquireRefreshLock(companyCode);
  if (!acquired) {
    log('INFO', COMPONENT, 'Refresh skipped — lock held by another worker', {
      companyCode,
      waitIfLocked: !!options.waitIfLocked,
    });
    if (options.waitIfLocked) {
      const cached = await readCache(companyCode);
      if (cached) return cached;
      return waitForCacheEntry(companyCode);
    }
    return readCache(companyCode);
  }

  try {
    const start = Date.now();
    const users = await fetchAllUsersFromGoogle(companyCode);
    const entry = buildCacheEntry(users);
    await writeCache(companyCode, entry);

    log('INFO', COMPONENT, 'Directory refreshed', {
      companyCode,
      userCount: entry.totalCount,
      durationMs: Date.now() - start,
    });

    return entry;
  } catch (err) {
    log('ERROR', COMPONENT, 'Directory refresh failed', {
      companyCode,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  } finally {
    await releaseRefreshLock(companyCode);
  }
}

/**
 * Returns a cached directory entry for the given company code, refreshing if
 * absent or beyond the soft staleness window.
 *
 * - **Cache hit, fresh** → returns cached entry immediately.
 * - **Cache hit, stale** → returns cached entry immediately *and* fires a
 *   background refresh (no await). The next request gets fresh data.
 * - **Cache miss** → awaits a synchronous refresh and returns the result.
 */
export async function getCompanyDirectory(
  companyCode: string
): Promise<PeopleDirectoryCacheEntry | null> {
  const cached = await readCache(companyCode);

  if (cached) {
    const ageMs = Date.now() - cached.refreshedAt;
    if (ageMs > STALE_AFTER_MS) {
      log('INFO', COMPONENT, 'Stale cache — kicking background refresh', {
        companyCode,
        ageMs,
      });
      // Fire-and-forget. The lock inside refreshCompanyDirectory ensures only
      // one pod actually runs the fetch even when many requests fire at once.
      void refreshCompanyDirectory(companyCode).catch(() => {
        /* errors already logged inside refresh */
      });
    }
    return cached;
  }

  return refreshCompanyDirectory(companyCode, { waitIfLocked: true });
}
