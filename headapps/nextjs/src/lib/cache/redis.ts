import Redis, { Cluster } from 'ioredis';
import { IAMCredentialsClient } from '@google-cloud/iam-credentials';
import { GoogleAuth } from 'google-auth-library';
import { log } from 'src/util/helpers/log-helper';

/**
 * Redis Client Factory
 *
 * Provides a singleton Redis client with three strategies:
 *
 * 1. **ioredis-mock** (in-process mock) — used when REDIS_URL is not set.
 *    Ideal for developers who cannot run Docker. All data is held in-memory
 *    and is lost when the process exits.
 *
 * 2. **Standalone ioredis** — used when REDIS_URL points to a non-cluster instance
 *    (e.g. local Docker redis://localhost:6379, or a single-node Memorystore).
 *
 * 3. **Cluster ioredis** — used when REDIS_CLUSTER=true. Parses the seed node
 *    from REDIS_URL; ioredis discovers remaining cluster nodes automatically.
 *
 * IAM Auth (REDIS_AUTH_IAM=true) works with both standalone and cluster strategies.
 * For cluster, token refresh recreates the client so all node connections (including
 * newly discovered ones) authenticate with the latest token.
 *
 * Strategy selection:
 *   - REDIS_URL absent                        → ioredis-mock
 *   - REDIS_URL + REDIS_CLUSTER               → Cluster ioredis
 *   - REDIS_URL + REDIS_AUTH_IAM              → standalone ioredis with IAM token auth
 *   - REDIS_URL + REDIS_CLUSTER + REDIS_AUTH_IAM → Cluster ioredis with IAM token auth
 *   - REDIS_URL only                          → standalone ioredis (local Docker or password-in-URL)
 */

const COMPONENT = 'RedisClient';
const REDIS_AUTH_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const DEFAULT_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

let clientPromise: Promise<Redis | Cluster> | null = null;

let iamClient: IAMCredentialsClient | null = null;
let serviceAccountEmail: string | null = null;

function getIamClient(): IAMCredentialsClient {
  if (!iamClient) {
    iamClient = new IAMCredentialsClient();
  }
  return iamClient;
}

async function resolveServiceAccountEmail(): Promise<string> {
  if (!serviceAccountEmail) {
    const auth = new GoogleAuth();
    const credentials = await auth.getCredentials();
    if (!credentials.client_email) {
      throw new Error('Unable to resolve service account email from Workload Identity');
    }
    serviceAccountEmail = credentials.client_email;
  }
  log('INFO', COMPONENT, 'Resolved service account email for IAM Auth', { serviceAccountEmail });
  return serviceAccountEmail;
}

/**
 * Generates a short-lived access token via the IAM Credentials API
 * (generateAccessToken), which is the method required by Memorystore IAM Auth.
 * The pod's Workload Identity service account must have roles/redis.dbConnectionUser.
 */
async function getIamAccessToken(): Promise<{ token: string; expiresInMs: number }> {
  const email = await resolveServiceAccountEmail();

  const [response] = await getIamClient().generateAccessToken({
    name: `projects/-/serviceAccounts/${email}`,
    scope: [REDIS_AUTH_SCOPE],
  });

  const token = response.accessToken;
  if (!token) throw new Error('IAM Credentials API returned no access token');

  const expireTime = response.expireTime;
  let expiresInMs = DEFAULT_TOKEN_LIFETIME_MS;
  if (expireTime?.seconds) {
    const expireMs = Number(expireTime.seconds) * 1000;
    expiresInMs = Math.max(expireMs - Date.now(), 30_000);
  }

  return { token, expiresInMs };
}

function scheduleStandaloneTokenRefresh(instance: Redis, expiresInMs: number): void {
  const refreshMs = Math.max(expiresInMs - TOKEN_REFRESH_BUFFER_MS, 30_000);

  setTimeout(async () => {
    try {
      const { token, expiresInMs: nextExpiresInMs } = await getIamAccessToken();
      await instance.auth(token);
      log('INFO', COMPONENT, 'IAM token refreshed');
      scheduleStandaloneTokenRefresh(instance, nextExpiresInMs);
    } catch (err) {
      log('ERROR', COMPONENT, 'IAM token refresh failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      scheduleStandaloneTokenRefresh(instance, 30_000 + TOKEN_REFRESH_BUFFER_MS);
    }
  }, refreshMs).unref();
}

function scheduleClusterTokenRefresh(expiresInMs: number): void {
  // For cluster, reset the singleton so the next getRedisClient() call creates a
  // fresh Cluster instance with the new IAM token in redisOptions. Calling
  // cluster.auth() only updates existing node connections — new nodes discovered
  // after the refresh would still connect with the stale token.
  const refreshMs = Math.max(expiresInMs - TOKEN_REFRESH_BUFFER_MS, 30_000);

  setTimeout(() => {
    log('INFO', COMPONENT, 'IAM token refresh due — resetting cluster client');
    clientPromise = null;
    // createRedisClient() will fetch a fresh token on the next getRedisClient() call
  }, refreshMs).unref();
}

const retryStrategy = (times: number): number | null => {
  if (times > 3) {
    log('ERROR', COMPONENT, 'Max retries reached — giving up', { retryAttempt: times });
    return null;
  }
  return Math.min(times * 200, 2000);
};

async function createRedisClient(): Promise<Redis | Cluster> {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    // Strategy 1: in-process mock for local dev without Docker
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RedisMock = require('ioredis-mock');
    log('INFO', COMPONENT, 'No REDIS_URL found — using ioredis-mock (in-memory)');
    return new RedisMock();
  }

  const useIamAuth = !!process.env.REDIS_AUTH_IAM;
  let password: string | undefined;
  let tokenExpiresInMs = 0;

  if (useIamAuth) {
    log('INFO', COMPONENT, 'IAM Auth enabled — fetching access token');
    const result = await getIamAccessToken();
    password = result.token;
    tokenExpiresInMs = result.expiresInMs;
  }

  const requiresTls = redisUrl.startsWith('rediss://');
  const nodeOptions = {
    ...(password ? { password } : {}),
    ...(requiresTls ? { tls: {} } : {}),
  };

  const isCluster = !!process.env.REDIS_CLUSTER;

  if (isCluster) {
    const parsed = new URL(redisUrl);
    const seedNode = { host: parsed.hostname, port: parseInt(parsed.port || '6379', 10) };
    log('INFO', COMPONENT, 'Connecting to Redis Cluster', {
      seedNode,
      tls: requiresTls,
    });

    const instance = new Cluster([seedNode], {
      redisOptions: { ...nodeOptions, maxRetriesPerRequest: 3 },
      clusterRetryStrategy: retryStrategy,
    });

    instance.on('connect', () => log('INFO', COMPONENT, 'Cluster connected'));
    instance.on('error', (err: Error) =>
      log('ERROR', COMPONENT, 'Cluster connection error', { error: err.message })
    );

    if (useIamAuth && tokenExpiresInMs > 0) {
      scheduleClusterTokenRefresh(tokenExpiresInMs);
    }

    return instance;
  }

  // Strategy 2 & 3: standalone ioredis (local Docker, password-in-URL, or IAM)
  log('INFO', COMPONENT, 'Connecting to standalone Redis', { redisUrl, tls: requiresTls });
  const instance = new Redis(redisUrl, {
    ...nodeOptions,
    maxRetriesPerRequest: 3,
    retryStrategy,
    lazyConnect: true,
  });

  instance.on('connect', () => log('INFO', COMPONENT, 'Connected'));
  instance.on('error', (err: Error) =>
    log('ERROR', COMPONENT, 'Connection error', { error: err.message })
  );

  await instance.connect();

  if (useIamAuth && tokenExpiresInMs > 0) {
    scheduleStandaloneTokenRefresh(instance, tokenExpiresInMs);
  }

  return instance;
}

/**
 * Returns the singleton Redis client.
 * Safe to call multiple times — the client is created once and reused.
 */
export async function getRedisClient(): Promise<Redis | Cluster> {
  if (!clientPromise) {
    clientPromise = createRedisClient().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}
