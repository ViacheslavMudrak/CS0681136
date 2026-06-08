# SPA Application Verification Guide

Since your Okta application is configured as a Single-Page App (SPA), let's verify everything is set up correctly.

## Critical Verification Steps

### 1. Verify Client ID Matches SPA Application

**This is the most common issue!**

1. Go to **Okta Admin Console** → **Applications** → Your Application
2. Check the **General** tab
3. **Copy the Client ID** (it's a long string like `0oaXXXXXXXXX`)
4. Compare it with your `.env.local` file:
   ```env
   NEXT_PUBLIC_OKTA_CLIENT_ID=0oaXXXXXXXXX
   ```
5. **They must match exactly!**
   - If you changed from Web to SPA, the Client ID likely changed
   - Web applications and SPA applications have different Client IDs

### 2. Verify Application Type is SPA

1. In Okta Admin Console → Your Application → **General** tab
2. Check **Application type**
3. Must say: **"Single-Page App"** (not "Web" or anything else)
4. If it's not SPA, change it and save

### 3. Verify Grant Types

1. In the same **General** tab
2. Scroll to **Grant types allowed**
3. Must have **Authorization Code** checked ✅
4. You can uncheck **Implicit** if not needed

### 4. Verify Client Authentication

1. Still in **General** tab
2. Look for **Client authentication** or **Client credentials**
3. For SPA, it should show:
   - **"None"** or
   - **"PKCE only"** or
   - **"Public"**
4. It should **NOT** say "Client Secret" or "Confidential"

### 5. Verify Redirect URI

1. In **General** tab → **Sign-in redirect URIs**
2. Must include exactly:
   ```
   http://localhost:3000/api/auth/callback/okta
   ```
3. Check for:
   - Exact match (no trailing slashes)
   - Correct protocol (http vs https)
   - Correct port (3000)

### 6. Check Browser Console

1. Open Developer Tools (F12) → **Console** tab
2. Look for the widget configuration log:
   ```
   Okta Widget Configuration: {
     baseUrl: 'https://trial-5381381.okta.com',
     clientId: '0oaXXXXX',
     ...
   }
   ```
3. Verify:
   - `clientId` matches your SPA application Client ID
   - `baseUrl` is correct (just domain, no path)
   - `issuer` includes `/oauth2/default` or your auth server

### 7. Check Network Tab for Actual Request

1. Open Developer Tools → **Network** tab
2. Check **Preserve log**
3. Load `/login` page
4. Look for POST to `/oauth2/default/v1/interact`
5. Check the **Request Payload**:
   - Should have `client_id` matching your SPA Client ID
   - Should have `scope` parameter
6. If the `client_id` doesn't match, that's the problem!

## Common Issues with SPA Applications

### Issue: Client ID Mismatch

**Symptom**: Grant type error even though app is SPA

**Cause**: Using Client ID from old Web application

**Fix**: 
1. Get the Client ID from the SPA application (not the old Web app)
2. Update `.env.local`
3. Restart dev server

### Issue: Multiple Applications

**Symptom**: Confusion about which application to use

**Fix**:
1. Delete or disable the old Web application
2. Use only the SPA application
3. Verify Client ID matches

### Issue: Cached Configuration

**Symptom**: Changes not taking effect

**Fix**:
1. Clear browser cache completely
2. Restart Next.js dev server
3. Hard refresh (Ctrl+Shift+R)

## SDK Version Check

Your current versions are fine:
- `@okta/okta-signin-widget`: `^7.7.0` ✅
- `@okta/okta-auth-js`: `^7.4.0` ✅

**No update needed** - these versions fully support SPA with PKCE.

## Configuration Checklist

After verifying, ensure:

- [ ] Application type is **Single-Page App**
- [ ] Client ID in `.env.local` matches SPA application Client ID
- [ ] Grant types include **Authorization Code**
- [ ] Client authentication is **None** or **PKCE only**
- [ ] Redirect URI matches exactly
- [ ] Browser console shows correct Client ID
- [ ] Network tab shows correct Client ID in requests
- [ ] No old Web application Client ID being used

## Still Getting Error?

If you've verified everything above and still get the error:

1. **Double-check Client ID**: This is the #1 cause
   - Go to Okta → Your SPA Application → General tab
   - Copy Client ID directly from there
   - Compare character-by-character with `.env.local`

2. **Check for Multiple Applications**:
   - List all applications in Okta
   - Make sure you're using the SPA one
   - Delete/disable any old Web applications

3. **Verify Environment Variables are Loaded**:
   - Check browser console for the widget config log
   - Verify the Client ID shown matches your SPA app

4. **Check Okta System Log**:
   - Go to **Reports** → **System Log**
   - Filter by your Client ID
   - Look for error details about grant types

## Quick Test

Run this in browser console on `/login` page:

```javascript
// Check what Client ID is being used
console.log('Client ID from env:', process.env.NEXT_PUBLIC_OKTA_CLIENT_ID);
```

Then compare with your SPA application's Client ID in Okta Admin Console.

