# Root Cause Analysis: Grant Type Authorization Error

## The Error
```
The client is not authorized to use the provided grant type. 
Configured grant types: [authorization_code, refresh_token].
```

## Root Cause

**The Okta application is configured as "Web Application" instead of "Single-Page App (SPA)"**

Even though `authorization_code` is in the configured grant types, Okta Web Applications have restrictions on how PKCE can be used with the authorization code flow. The Okta Sign-In Widget with PKCE requires a Single-Page App (SPA) application type.

## Why This Happens

1. **Widget Configuration**: The widget is correctly configured with:
   - `responseType: ['code']` ✅
   - `pkce: true` ✅

2. **Okta Application Type**: The application in Okta Admin Console is set to:
   - ❌ "Web Application" (doesn't fully support PKCE with authorization_code)
   - ✅ Should be "Single-Page App" (automatically supports PKCE)

3. **Grant Type Mismatch**: When using PKCE with a Web Application, Okta may interpret the request differently, causing the authorization to fail even though `authorization_code` is listed as an allowed grant type.

## The Fix

### Step 1: Change Application Type in Okta Admin Console

1. Log in to **Okta Admin Console**
2. Go to **Applications** → **Applications**
3. Click on your application
4. Click **Edit** (General tab)
5. **Change "Application type" from "Web" to "Single-Page App"**
6. Click **Save**

### Step 2: Verify Configuration

After changing to SPA:

1. **Grant types** should show: `Authorization Code` ✅
2. **Client authentication** should show: `None` or `PKCE only` ✅
3. **Client ID** might change - copy the new one
4. **No client secret needed** - SPA applications don't use client secrets

### Step 3: Update Environment Variables

Update your `.env.local`:

```env
NEXT_PUBLIC_OKTA_DOMAIN=trial-5381381.okta.com
NEXT_PUBLIC_OKTA_CLIENT_ID=<NEW_CLIENT_ID_FROM_SPA_APP>
NEXT_PUBLIC_OKTA_REDIRECT_URI=http://localhost:3000/api/auth/callback/okta
NEXT_PUBLIC_OKTA_ISSUER=https://trial-5381381.okta.com/oauth2/default
# OKTA_CLIENT_SECRET is NOT needed for SPA applications
```

### Step 4: Restart and Test

1. Restart your Next.js dev server
2. Clear browser cache
3. Try logging in again

## Code Issues Fixed

### Issue 1: Invalid `grantType` Parameter
- **Problem**: `grantType: "authorization_code"` is NOT a valid parameter for Okta Sign-In Widget
- **Fix**: Removed - grant type is automatically determined by `responseType` and `pkce`

### Issue 2: Wrong baseUrl Format
- **Problem**: Using `NEXT_PUBLIC_OKTA_BASE_URL` which may not exist
- **Fix**: Use `https://${config.domain}` from the config helper

### Issue 3: Bypassing Config Helper
- **Problem**: Directly using `process.env` instead of validated config
- **Fix**: Use `getOktaConfig()` helper which validates all required variables

## Verification Checklist

After making changes, verify:

- [ ] Okta application type is **"Single-Page App"** (not "Web")
- [ ] Client ID in `.env.local` matches the SPA application Client ID
- [ ] Grant types include **Authorization Code**
- [ ] Client authentication shows **None** or **PKCE only**
- [ ] Widget configuration has `responseType: ['code']` and `pkce: true`
- [ ] No `grantType` parameter in widget config (it's invalid)
- [ ] baseUrl is `https://${domain}` format
- [ ] Using `getOktaConfig()` helper (not direct env vars)

## Why SPA Application Type is Required

1. **PKCE Support**: SPA applications automatically support PKCE with authorization_code
2. **Security Model**: SPAs are designed for public clients (no client secret needed)
3. **Widget Compatibility**: Okta Sign-In Widget with PKCE is designed for SPA applications
4. **OAuth 2.0 Best Practice**: PKCE is the recommended flow for public clients (SPAs)

## If You Must Use Web Application

If your organization requires Web Application type:

1. **Disable PKCE** in the widget: `pkce: false`
2. **Use client secret** for token exchange
3. **Note**: This is less secure and not recommended for client-side applications

However, for a Next.js application with client-side widget, **SPA is the correct choice**.

## Still Getting the Error?

If you've changed to SPA and still get the error:

1. **Wait 1-2 minutes**: Okta changes can take time to propagate
2. **Verify Client ID**: Make sure it matches the SPA application (it's different from Web apps)
3. **Check Browser Console**: Look for the widget configuration log
4. **Check Network Tab**: Verify the authorization request has `response_type=code` and `code_challenge`
5. **Review Okta System Log**: Check for detailed error messages

## Summary

**Root Cause**: Application type is "Web" instead of "Single-Page App"

**Fix**: Change application type to "Single-Page App" in Okta Admin Console

**Code Fixes**: 
- Removed invalid `grantType` parameter
- Fixed baseUrl to use config helper
- Using validated configuration

The widget code is now correct. The issue is purely in the Okta Admin Console configuration.

