# Local Development Setup Guide

This guide explains how to run the Sitecore Content SDK frontend app locally.

## Two Development Modes

You can run the app in two modes:

### Option 1: Connected to XM Cloud (Recommended)

Connect to your XM Cloud environment using Edge API.

### Option 2: Connected to Local Sitecore Instance

Connect to a local Sitecore instance running in Docker containers.

---

## Option 1: XM Cloud / Edge Mode

### Prerequisites

- XM Cloud environment deployed
- Edge Context ID from XM Cloud Portal

### Setup Steps

1. **Get your Edge Context ID from XM Cloud Portal:**
   - Go to https://portal.sitecorecloud.io
   - Navigate to your project and environment
   - Copy the Edge Context ID

2. **Create `.env.local` file** in `headapps/customer-portal/`:

```env
# XM Cloud Edge Configuration
SITECORE_EDGE_CONTEXT_ID=your-edge-context-id-here
NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID=your-edge-context-id-here
SITECORE_EDGE_URL=https://edge-platform.sitecorecloud.io

# Site Configuration
NEXT_PUBLIC_DEFAULT_SITE_NAME=default
NEXT_PUBLIC_DEFAULT_LANGUAGE=en

# Editing Secret (for preview/editing mode)
SITECORE_EDITING_SECRET=your-editing-secret-here
```

3. **Install dependencies:**
```bash
npm install
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Access the site:**
   - Visit http://localhost:3000

---

## Option 2: Local Sitecore Instance Mode

### Prerequisites

- Docker Desktop installed and running
- .NET 8.0 SDK installed
- Sitecore license file
- Windows machine (for local containers)

### Setup Steps

1. **Initialize local containers** (first time only):
```powershell
cd local-containers
.\scripts\init.ps1 -InitEnv -LicenseXmlPath "C:\path\to\license.xml" -AdminPassword "YourAdminPassword"
```

2. **Start local Sitecore containers:**
```powershell
.\scripts\up.ps1
```

3. **Wait for containers to be ready** (this may take several minutes on first run)

4. **Get the API Key and Host:**
   - The API key is generated during initialization
   - Check `local-containers/.env` file for `SITECORE_API_KEY_APP_STARTER`
   - The API host is typically `https://xmcloudcm.localhost`

5. **Create `.env.local` file** in `headapps/customer-portal/`:

```env
# Local Sitecore Configuration
NEXT_PUBLIC_SITECORE_API_KEY=your-api-key-from-local-containers-env
NEXT_PUBLIC_SITECORE_API_HOST=https://xmcloudcm.localhost

# Site Configuration
NEXT_PUBLIC_DEFAULT_SITE_NAME=App-Starter
NEXT_PUBLIC_DEFAULT_LANGUAGE=en

# Editing Secret (optional for local)
SITECORE_EDITING_SECRET=your-editing-secret
```

6. **Install dependencies:**
```bash
cd headapps/customer-portal
npm install
```

7. **Run Sitecore CLI tools to generate required files:**
```bash
npm run sitecore-tools:build
```

8. **Run the development server:**
```bash
npm run dev
```

9. **Access the site:**
   - Visit http://localhost:3000 (or the hostname configured in local-containers)

---

## Troubleshooting

### Error: "provide either Edge contextId or local credentials"

**Solution:** Ensure your `.env.local` file has either:
- **For Edge mode:** `SITECORE_EDGE_CONTEXT_ID` or `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID`
- **For Local mode:** Both `NEXT_PUBLIC_SITECORE_API_KEY` and `NEXT_PUBLIC_SITECORE_API_HOST`

### Error: "Module not found: Can't resolve '.sitecore/sites.json'"

**Solution:** Run the Sitecore CLI tools to generate required files:
```bash
npm run sitecore-tools:build
```

### Local containers not starting

**Solution:**
- Ensure Docker Desktop is running
- Check that ports 443, 80, and others are not in use
- Review Docker logs: `docker compose logs`

### API connection issues

**Solution:**
- Verify the API host URL is correct
- Check that Sitecore CM is accessible at the configured host
- Verify the API key is correct
- For local: Ensure containers are fully started (check logs)

---

## Environment Variables Reference

### Required for Edge Mode
- `SITECORE_EDGE_CONTEXT_ID` or `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` - Edge Context ID from XM Cloud
- `NEXT_PUBLIC_DEFAULT_SITE_NAME` - Default site name
- `SITECORE_EDITING_SECRET` - Secret for editing mode (optional but recommended)

### Required for Local Mode
- `NEXT_PUBLIC_SITECORE_API_KEY` - API key from local Sitecore instance
- `NEXT_PUBLIC_SITECORE_API_HOST` - API host URL (e.g., `https://xmcloudcm.localhost`)
- `NEXT_PUBLIC_DEFAULT_SITE_NAME` - Default site name (usually `App-Starter` for local)

### Optional
- `SITECORE_EDGE_URL` - Edge platform URL (defaults to `https://edge-platform.sitecorecloud.io`)
- `NEXT_PUBLIC_DEFAULT_LANGUAGE` - Default language (defaults to `en`)
- `NEXT_PUBLIC_PERSONALIZE_SCOPE` - Personalization scope
- `PERSONALIZE_MIDDLEWARE_EDGE_TIMEOUT` - Timeout for personalization middleware
- `COOKIE_DOMAIN` - Domain for SSO session sharing across subdomains (e.g., `.intralox.com`). Must start with `.` to work across all subdomains. When set, authentication cookies will be shared across subdomains, enabling single sign-on (SSO) functionality.

---

## Quick Start (Minimal Setup)

For the quickest start with XM Cloud:

1. Create `.env.local`:
```env
SITECORE_EDGE_CONTEXT_ID=your-context-id
NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID=your-context-id
NEXT_PUBLIC_DEFAULT_SITE_NAME=default
SITECORE_EDITING_SECRET=your-secret
```

2. Install and run:
```bash
npm install
npm run dev
```

---

## Additional Resources

- [Sitecore Content SDK Documentation](https://doc.sitecore.com/xmc/en/developers/content-sdk/sitecore-content-sdk-for-xm-cloud.html)
- [XM Cloud Environment Variables](https://doc.sitecore.com/xmc/en/developers/xm-cloud/get-the-environment-variables-for-a-site.html)
- [Local Containers Setup](../local-containers/README.md)

