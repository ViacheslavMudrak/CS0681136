# Authentication

NextAuth.js v4 powered sign-in for the Ascension intranet. Uses the Google provider with database-backed sessions (Firestore adapter), plus an optional mock credentials provider for local/dev environments.

This README documents the sign-in flow end-to-end. If you're debugging a login issue, start with the **Failure modes** section.

## Key files

| File                                         | Role                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `[...nextauth].ts`                           | NextAuth handler, Google + Mock providers, session callback, Firestore adapter. |
| `src/pages/auth/signin.tsx`                  | Custom sign-in page. Implements the silent-then-consent retry pattern.          |
| `src/middleware.ts`                          | Redirects unauthenticated users to `/auth/signin?silent=true`.                  |
| `src/lib/middleware/GatekeeperMiddleware.ts` | Resolves database sessions for auth checks (Edge Runtime + self-fetch).         |
| `src/lib/auth/google-client.ts`              | `refreshAccessToken()` and service-account JWT client factory.                  |

## Sign-in flow (real Google users)

All deployed environments require authentication for every page. The `FORCE_AUTH=true` env var (set per environment in `pipeline.yaml`) tells the gatekeeper middleware to block unauthenticated requests globally. Local development runs with `FORCE_AUTH=false` so no login is required.

```
[1] Unauthenticated request to any page
        │
        ▼
[2] middleware.ts sees no session cookie (FORCE_AUTH=true)
        │  redirects to /auth/signin?silent=true&callbackUrl=<original-path>
        ▼
[3] signin.tsx useEffect sees ?silent=true, no error
        │  calls signIn('google', { callbackUrl }, { prompt: 'none' })
        ▼
[4] Google OAuth endpoint
        │
        ├── 4a. Consent current → returns code silently (no UI)
        │         │
        │         ▼
        │   [5a] NextAuth callback exchanges code → creates session →
        │        redirects to callbackUrl. User never sees the sign-in page.
        │
        └── 4b. Silent auth cannot complete (no session, stale/missing refresh
                 token, or interaction_required) → redirects to callback with
                 an OAuth error
                 │
                 ▼
           [5b] NextAuth callback logs OAUTH_CALLBACK_HANDLER_ERROR and
                redirects to /auth/signin?error=Callback&callbackUrl=…
                 │
                 ▼
           [6b] signin.tsx renders the UI (silent useEffect skipped due to
                hasError). User clicks "Sign in with Google".
                handleSignIn calls signIn('google', { callbackUrl }) with no
                extra prompt parameter — Google honors the Workspace-level
                Trusted-app setting and silently re-issues tokens. A refresh
                token is included because `access_type=offline` is set on the
                provider configuration in `[...nextauth].ts`.
                 │
                 ▼
           [7b] Google returns code (+ refresh token) without showing a
                consent screen to the user, because the OAuth client is
                marked Trusted in Workspace Admin.
                 │
                 ▼
           [8b] NextAuth callback stores tokens in Firestore `accounts`
                collection via adapter. Redirects to callbackUrl.
```

**Normal "returning user" flow** lands at step **5a** — they never see the sign-in page.
**Users with a broken/missing refresh token** land at step **8b** after one extra round-trip; with Workspace trust in place, this is invisible to the user (no consent screen).

> **Note on `prompt: 'consent'`** — we previously forced `prompt: 'consent'` on the recovery path to guarantee Google re-issued a refresh token. That conflicted with the Workspace-level Trusted-app setting (which is supposed to bypass consent) and caused the consent screen to surface under corporate proxies. The override has been removed; Workspace trust + `access_type: 'offline'` now handles refresh-token issuance silently.

## Token refresh

Google access tokens expire in 1 hour. Two callbacks in `[...nextauth].ts` keep the stored tokens fresh:

**`signIn` callback** — runs on every Google sign-in (including the consent retry). Persists the fresh `access_token`, `refresh_token`, and `expires_at` from the OAuth response to the Firestore `accounts` document. This is required because NextAuth v4's FirestoreAdapter only writes tokens on _initial_ account linking, not on subsequent sign-ins — without this, re-consent wouldn't update stored tokens and the user would stay stuck on expired credentials.

**`session` callback** — runs on every session check. Loads the stored tokens, and if the access token is expired:

- If a `refresh_token` exists → calls `refreshAccessToken()`, writes the new tokens back, attaches the fresh access token to `session.googleAccessToken`.
- If no `refresh_token` exists → sets `session.error = 'RefreshAccessTokenError'` so downstream API routes can short-circuit and signal the client to re-consent.

The Google provider is configured with `access_type: 'offline'` so _every_ consent returns a refresh token.

### Auto-recovery from a broken session

Google API routes (e.g. `/api/google/calendar/events/list`) return `{ error, requiresReauth: true }` with a 401 when the session can't recover — either `session.error === 'RefreshAccessTokenError'` or Google itself rejects the token. Client components detect this flag and redirect to `/auth/signin?error=Callback&callbackUrl=<current>`, which triggers the consent retry flow. The user re-consents once, `signIn` persists fresh tokens, and the original request succeeds on reload.

No manual intervention required. The flow self-heals within one additional round trip.

## Mock user flow (local/dev)

Enabled only when `ENABLE_MOCK_AUTH=true`. The NextAuth `CredentialsProvider` does NOT run the database adapter, so `[...nextauth].ts` intercepts mock callbacks manually:

1. User submits the mock form on the sign-in page.
2. Custom handler creates/upserts the mock user doc, creates a session record, sets the session cookie.
3. Sets a separate JWT cookie (`__Secure-next-auth.mock-token`) containing `googleGroups` so `getToken()` in Edge middleware can read it without a DB lookup.
4. Returns JSON response with the callbackUrl for client-side redirect.

The dual-cookie approach exists because real Google users use database sessions (requires internal API fetch in Edge), while mock users get direct JWT access for faster middleware checks.

## Session resolution in Edge middleware

`GatekeeperMiddleware.resolveAuth()`:

1. Tries `getToken()` → succeeds only for mock/JWT users.
2. Falls back to fetching `/api/auth/session` via `NEXTAUTH_URL_INTERNAL` (required in Kubernetes — the pod cannot reach itself through the external hostname due to DNS hairpin). In local dev, falls back to `req.nextUrl.origin`.
3. Extracts `email` and `googleGroups` for authorization checks.

## Configuration prerequisites

### Environment variables

| Variable                | Purpose                                                          | Set in                    |
| ----------------------- | ---------------------------------------------------------------- | ------------------------- |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID                                           | Vault `jenkins/<env>`     |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth client secret                                       | Vault `jenkins/<env>`     |
| `NEXTAUTH_URL`          | Public URL (used as callback origin)                             | `pipeline.yaml` per env   |
| `NEXTAUTH_URL_INTERNAL` | Internal URL for middleware self-fetch (`http://localhost:3000`) | `pipeline.yaml` top-level |
| `NEXTAUTH_SECRET`       | JWT/CSRF signing secret (must match across all pods)             | Vault `jenkins/<env>`     |
| `ENABLE_MOCK_AUTH`      | Enables the mock credentials provider                            | `pipeline.yaml` per env   |
| `FORCE_AUTH`            | When `true`, every page requires login                           | `pipeline.yaml` per env   |

### Google Cloud Console

- OAuth consent screen **User Type = Internal** (restricts to the Workspace domain; required for admin trust to apply without per-user consent).
- OAuth client's **Authorized redirect URIs** must include `<NEXTAUTH_URL>/api/auth/callback/google` for every deployed environment.

### Google Workspace Admin Console

- **Security > Access and data control > API controls > Manage Third-Party App Access**: add the OAuth Client ID as a **Trusted** app so admin-level scope trust propagates to users without individual consent.
- Required for scopes like `admin.directory.user.readonly` which are otherwise restricted.

## Failure modes

### `error=Callback` with `interaction_required` in logs

Google needs re-consent (usually after scopes changed or consent was revoked). Expected when the silent attempt can't satisfy the request. The consent retry path handles this automatically when the user clicks "Sign in with Google."

### `error=Callback` without a specific Google error

Likely a CSRF/state mismatch. Check:

- `NEXTAUTH_URL` matches the actual request origin exactly.
- `NEXTAUTH_SECRET` is identical across all pods.
- The OAuth client's authorized redirect URI matches `<NEXTAUTH_URL>/api/auth/callback/google`.

### Pages return 403 after successful login

Middleware can't resolve the database session. Check:

- `NEXTAUTH_URL_INTERNAL` is set and points to `http://localhost:3000` (or the pod's local Next.js port).
- Pod logs for `"Failed to resolve session from internal API"` — indicates the self-fetch failed.

### Google API calls return 401

Expected recovery path: the API route returns `requiresReauth: true`, the client redirects to `/auth/signin?error=Callback`, the user re-consents once, and stored tokens are refreshed by the `signIn` callback. See **Auto-recovery from a broken session** above.

If a user is stuck in a redirect loop back to `/auth/signin` immediately after consent, check `/api/auth/session`:

- If `error: 'RefreshAccessTokenError'` persists after consent → the `signIn` callback isn't persisting new tokens. Look for `"Failed to persist Google tokens on sign-in"` in the logs.
- If `googleAccessToken` is missing → the session is still pointing at a mock user. Clear all `next-auth.*` cookies and sign in fresh.

### `unauthorized_client` when service-account calls run

Not a user auth issue — this is the service account (domain-wide delegation) failing a scope authorization. See `src/lib/auth/google-client.ts` callers. Verify scopes are authorized in Workspace Admin > Domain-wide delegation using the service account's numeric **Client ID** (not client email).

## Related

- `src/lib/auth/google-client.ts` — service account / domain-wide delegation (separate from user OAuth).
- `src/lib/middleware/GatekeeperMiddleware.ts` — page-level authorization (group membership checks).
- `src/lib/google/services/google-groups-service.ts` — Google Groups fetch (uses service account, not user token).
