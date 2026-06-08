# Okta Admin Console Setup Guide

This guide provides step-by-step instructions for configuring your Okta application to work with PKCE and the authorization code flow.

## Critical Configuration Steps

### Step 1: Change Application Type to Single-Page App (SPA)

**This is the most important step and likely the cause of your error.**

1. Log in to your **Okta Admin Console**
2. Navigate to **Applications** → **Applications** (in the left sidebar)
3. Find your application in the list and click on it
4. Click the **General** tab (should be selected by default)
5. Click the **Edit** button (usually in the top right)
6. Look for **Application type** dropdown
7. **Change it from "Web" to "Single-Page App"**
8. Click **Save**

**Why this matters:**
- Single-Page App (SPA) applications automatically support PKCE
- Web applications may not allow PKCE in some Okta org configurations
- SPA applications don't require client secrets (which is correct for PKCE)

### Step 2: Verify Grant Types

1. Still in the **General** tab of your application
2. Scroll down to **Grant types allowed**
3. Ensure **Authorization Code** is checked ✅
4. You can uncheck **Implicit** if you're not using it
5. Click **Save** if you made changes

### Step 3: Configure Sign-in Redirect URIs

1. In the same **General** tab
2. Find **Sign-in redirect URIs**
3. Add your callback URLs (one per line):
   ```
   http://localhost:3000/api/auth/callback/okta
   https://yourdomain.com/api/auth/callback/okta
   ```
4. Make sure the URLs match **exactly** (including http vs https, trailing slashes, etc.)
5. Click **Save**

### Step 4: Verify Client Authentication

1. Still in the **General** tab
2. Look for **Client authentication** or **Client credentials**
3. For SPA applications, this should show:
   - **"None"** or
   - **"PKCE only"** or
   - **"Public"**
4. It should **NOT** say "Client Secret" or "Confidential"

### Step 5: Get Your Client ID

1. In the **General** tab
2. Find **Client ID** (it's a long string like `0oaXXXXXXXXX`)
3. Copy this value
4. Update your `.env.local` file:
   ```env
   NEXT_PUBLIC_OKTA_CLIENT_ID=0oaXXXXXXXXX
   ```
5. **Note**: After changing from Web to SPA, the Client ID might change - verify it matches

### Step 6: Remove Client Secret (If Using SPA)

1. If you changed to SPA application type, you **don't need** a client secret
2. You can remove or comment out this line in `.env.local`:
   ```env
   # OKTA_CLIENT_SECRET=  (Not needed for SPA with PKCE)
   ```
3. The callback route will handle this gracefully

### Step 7: Verify Trusted Origins (For CORS)

1. In Okta Admin Console, go to **Security** → **API** → **Trusted Origins**
2. Click **Add Origin**
3. Add your application origin:
   - **Origin URL**: `http://localhost:3000` (for development)
   - **Type**: Check both **CORS** and **Redirect**
   - Click **Save**
4. Repeat for production URL if needed

## Verification Checklist

After making these changes, verify:

- [ ] Application type is **Single-Page App** (not Web)
- [ ] Grant types include **Authorization Code**
- [ ] Sign-in redirect URIs match your callback URL exactly
- [ ] Client authentication shows **None** or **PKCE only** (not Client Secret)
- [ ] Client ID in `.env.local` matches the application
- [ ] Trusted Origins are configured for CORS
- [ ] Waited 30-60 seconds for changes to propagate

## Common Issues

### Issue: "Still getting grant type error after changing to SPA"

**Solutions:**
1. **Wait longer**: Okta changes can take 1-2 minutes to propagate
2. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check Client ID**: Make sure it matches the SPA application (it might have changed)
4. **Verify redirect URI**: Must match exactly, including protocol (http vs https)
5. **Check application status**: Ensure the application is **Active**

### Issue: "Can't find PKCE setting"

**Solution:** If you're using SPA application type, PKCE is automatically enabled. You don't need to find a separate PKCE setting.

### Issue: "Application type dropdown is grayed out"

**Solution:** You may need to delete and recreate the application, or contact your Okta administrator if you don't have permissions to change application types.

## Alternative: If You Must Use Web Application

If your organization requires Web Application type:

1. Keep application as **Web Application**
2. Look for **"PKCE"** or **"Proof Key for Code Exchange"** in application settings
3. Enable PKCE explicitly
4. You may still need a client secret for server-side token exchange
5. **Note**: Some Okta orgs don't allow PKCE on Web applications - in this case, you must use SPA type

## Testing After Configuration

1. Restart your Next.js development server
2. Clear browser cache and cookies
3. Navigate to `/login`
4. The widget should load without the grant type error
5. Try signing in with valid credentials

## Error: 400 Bad Request on /interact Endpoint

If you're seeing a 400 error when the widget tries to POST to `/oauth2/default/v1/interact`:

**Root Cause**: The `/interact` endpoint is used by Okta's interaction code flow (required for PKCE). A 400 error means the request is malformed or the application isn't properly configured.

**Solution Steps**:

1. **Verify Application Type is SPA**:
   - Must be "Single-Page App" (not Web)
   - SPA applications automatically support interaction code flow

2. **Check Client ID**:
   - Ensure the Client ID in your `.env.local` matches the SPA application
   - Client IDs are different for Web vs SPA applications

3. **Verify Issuer URL**:
   - Check that `NEXT_PUBLIC_OKTA_ISSUER` matches your authorization server
   - Should be: `https://your-domain.okta.com/oauth2/default` or `https://your-domain.okta.com/oauth2/{authServerId}`

4. **Check Redirect URI**:
   - Must match exactly in Okta Admin Console
   - Include the full path: `http://localhost:3000/api/auth/callback/okta`

5. **Verify Widget Configuration**:
   - Ensure `responseType: ['code']` is set (not commented out)
   - Ensure `pkce: true` is set
   - Do NOT use `grantType` parameter (it's not valid)

6. **Check Browser Console**:
   - Look for the exact error message in the Network tab
   - Check the request payload to see what's being sent

7. **Review Okta System Log**:
   - Go to **Reports** → **System Log** in Okta Admin Console
   - Filter for your Client ID
   - Look for detailed error messages about the `/interact` request

## Still Having Issues?

If you're still getting the error after following these steps:

1. **Double-check application type**: It must be "Single-Page App"
2. **Verify Client ID**: Copy it fresh from Okta Admin Console
3. **Check browser console**: Look for any additional error messages
4. **Review Okta logs**: Go to **Reports** → **System Log** in Okta Admin Console to see detailed error messages
5. **Contact Okta support**: If the issue persists, there might be org-level restrictions

