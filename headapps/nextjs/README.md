### Setup the Next.js Rendering Host

- Log into the Sitecore XM Cloud Deploy Portal, locate your Environment and select the `Developer Settings` tab.
- Ensure that the `Preview` toggle is enabled and DFD is selected as the target site.
- In the `Local Development` section, click to copy the sample `.env` file contents to your clipboard.
- Create a new `.env.local` file in the `./nextjs` folder of this repository and paste the contents from your clipboard.
- Rename SITECORE_EDGE_CONTEXT_ID to NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID
- Rename SITECORE_SITE_NAME to NEXT_PUBLIC_DEFAULT_SITE_NAME
- Rename JSS_EDITING_SECRET to SITECORE_EDITING_SECRET

## Run the Application

- Ensure you are running Node v24.15 (use nvm windows to manage your node versions!)
- Run the following commands in the root of the repository to start the Next.js application:
  ```bash
  cd nextjs
  npm install
  npm run dev
  ```
- You should now be able to access your site on `http://localhost:3000` and see your changes in real-time as you make them.

## Create a Component

- Run the following scaffolding command:
  ```bash
  cd nextjs
  npm run plop
  ```

## Run Storybook

- Run the following commands:
  ```bash
  cd nextjs
  npm install
  npm run storybook
  ```

## Debug The App

- The App has been configured to debug in VSCode from the `launch.json` file at the root of the application. Ensure that you have the root of the code application (outside of /nextjs) open and then head over to the Debug menu in the sidebar.
- Within the Debug window, select "Next.js: debug server-side" or "Next.js: debug client-side" or "Next.js: debug full stack" depending on your needs.

## UKG API Integration

Server-side integration with the UKG (Kronos) Workforce Management API for employee scheduling and PTO balance data.

### Architecture

```
Browser (pages/ukg.tsx)
  │  SWR hooks → POST fetch
  ▼
Next.js API Routes
  /api/ukg/schedule ─── POST ──▶ UKG /api/v1/scheduling/schedule/multi_read
  /api/ukg/pto ──────── POST ──▶ UKG /api/v1/timekeeping/timecard_metrics/multi_read
  │
  ├─ ukgClient.ts ──── OAuth token acquisition + Redis token cache
  └─ ukgHelper.ts ──── Request body builders + response transforms
```

**Caching layers (Redis):**

| Cache Key          | TTL                          | Description                       |
| ------------------ | ---------------------------- | --------------------------------- |
| `ukg:access_token` | Token `expires_in` minus 60s | OAuth bearer token                |
| `ukg:schedule:*`   | 5 minutes                    | Transformed schedule responses    |
| `ukg:pto:*`        | 5 minutes                    | Transformed PTO balance responses |

Redis strategy is determined by the `REDIS_URL` env var (see [emulators/README](../emulators/README.md#redis-local-caching) for details). When `REDIS_URL` is not set, an in-memory mock (`ioredis-mock`) is used automatically.

### Key Files

| File                            | Role                                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| `src/lib/ukg/ukgClient.ts`      | Shared HTTP client — authenticates with UKG, caches tokens in Redis |
| `src/lib/ukg/ukgHelper.ts`      | Builds request bodies, transforms raw API responses                 |
| `src/lib/ukg/types.ts`          | TypeScript types for raw and transformed UKG data                   |
| `src/pages/api/ukg/schedule.ts` | API route — employee schedule                                       |
| `src/pages/api/ukg/pto.ts`      | API route — PTO balance                                             |
| `src/pages/ukg.tsx`             | Demo / test page                                                    |

### Environment Variables

All variables are **server-side only** (no `NEXT_PUBLIC_` prefix). Add these to `.env.local`:

```bash
UKG_USERNAME=<service account username>
UKG_PASSWORD=<service account password>
UKG_CLIENT_ID=<OAuth client ID>
UKG_CLIENT_SECRET=<OAuth client secret>
```

See `.env.local.example` for default UAT values.

### API Endpoints

**POST `/api/ukg/schedule`** — Fetch employee schedule

```json
{
  "employeeNumbers": ["10000237"],
  "startDate": "2026-02-01",
  "endDate": "2026-02-02"
}
```

Returns sorted shifts and pay code edits with formatted date/time strings.

**POST `/api/ukg/pto`** — Fetch PTO balance

```json
{
  "employeeNumbers": ["10000263"],
  "startDate": "2026-01-22",
  "endDate": "2026-01-22"
}
```

Returns `ptoBalanceToday` and `ptoBalanceMinusTakings` (hours).

### Demo Page

Navigate to `http://localhost:3000/ukg` to test both endpoints with a form-driven UI.

---

## Disconnected offline development

It is possible to mock a small subset of the XM Cloud Application elements to enable offline development. This can allow for a disconnected development experience, however it is recommend to work in the default connected mode.

You can find more information about how setup the offline development experience [here](./../local-containers/README.md)

## Redis (Local Caching)

The Next.js app uses Redis for server-side caching. There are **three strategies** available depending on your environment:

| Strategy                     | When Used                          | Setup Required                    |
| ---------------------------- | ---------------------------------- | --------------------------------- |
| **ioredis-mock** (in-memory) | `REDIS_URL` is **not set**         | None — runs in-process            |
| **Local Docker Redis**       | `REDIS_URL=redis://localhost:6379` | Docker (via WSL or native)        |
| **Remote Redis (GKE)**       | `REDIS_URL` points to remote host  | None — set by deployment pipeline |

To use Local Docker Redis, review the Redis section in [emulators/README](../emulators/README.md#redis-local-caching).
