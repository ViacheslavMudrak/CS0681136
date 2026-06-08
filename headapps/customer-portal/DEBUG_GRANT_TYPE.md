# How to Find What Grant Type is Being Requested

This guide helps you debug the "client is not authorized to use the provided grant type" error by finding what grant type is actually being requested.

## Method 1: Check Browser Network Tab (Easiest)

1. **Open Browser Developer Tools**:
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Go to Network Tab**:
   - Click on the **Network** tab in developer tools
   - Make sure **Preserve log** is checked (to keep requests after redirects)

3. **Clear Network Log**:
   - Click the clear button (🚫) to start fresh

4. **Load the Login Page**:
   - Navigate to `/login` in your application
   - Watch the Network tab for requests

5. **Look for These Requests**:

   **a) `/interact` Request (POST)**:
   - Look for a POST request to: `https://your-domain.okta.com/oauth2/default/v1/interact`
   - Click on it to see details
   - Check the **Payload** or **Request** tab
   - Look for `grant_type` or `response_type` in the request body
   - **Expected**: Should see `response_type=code` or similar

   **b) Authorization Request (GET)**:
   - Look for a GET request to: `https://your-domain.okta.com/oauth2/default/v1/authorize`
   - Click on it to see details
   - Check the **Query String Parameters** or **URL** tab
   - Look for `response_type` parameter
   - **Expected**: Should see `response_type=code`

6. **Check the Response**:
   - If you see an error response, click on it
   - Check the **Response** tab
   - Look for error messages that mention grant types

## Method 2: Check Browser Console

1. **Open Browser Console**:
   - In Developer Tools, go to the **Console** tab

2. **Look for Configuration Log**:
   - The widget now logs its configuration
   - You should see: `Okta Widget Configuration: { ... }`
   - Verify:
     - `responseType: ['code']` ✅
     - `pkce: true` ✅
     - `clientId` matches your Okta application

3. **Look for Error Messages**:
   - Any errors will be logged here
   - Look for messages mentioning "grant type" or "authorization"

## Method 3: Check Okta System Log

1. **Log in to Okta Admin Console**

2. **Go to System Log**:
   - Navigate to **Reports** → **System Log**
   - Or go to: `https://your-domain.okta.com/admin/reports/system-log`

3. **Filter for Your Client ID**:
   - In the search/filter box, enter your Client ID
   - Or filter by **Event Type**: "OAuth authorization"

4. **Look for Recent Events**:
   - Find events from when you tried to log in
   - Click on an event to see details

5. **Check Event Details**:
   - Look for fields like:
     - `grant_type`
     - `response_type`
     - `client_id`
     - Error messages

6. **What to Look For**:
   - **Expected**: `response_type=code` or `grant_type=authorization_code`
   - **If you see**: `grant_type=interaction_code` or similar, that's the issue
   - **Error messages**: Will tell you what grant type was requested vs what's allowed

## Method 4: Check the Actual Request URL

When the widget redirects to Okta, check the URL in the address bar:

1. **Watch for Redirect**:
   - When you click sign in, the page should redirect to Okta
   - The URL will look like:
     ```
     https://your-domain.okta.com/oauth2/default/v1/authorize?
       client_id=0oaXXXXX&
       redirect_uri=http://localhost:3000/api/auth/callback/okta&
       response_type=code&
       scope=openid profile email&
       state=...&
       code_challenge=...&
       code_challenge_method=S256
     ```

2. **Check the `response_type` Parameter**:
   - Should be `response_type=code` ✅
   - If it's something else, that's the problem

3. **Check for PKCE Parameters**:
   - Should see `code_challenge` and `code_challenge_method=S256`
   - These indicate PKCE is being used

## Common Issues and What They Mean

### Issue: `response_type=code` but still getting error

**Possible Causes**:
- Application type is still "Web" instead of "Single-Page App"
- Client ID doesn't match the SPA application
- PKCE is not enabled for the application type

**Solution**: Change application to SPA type in Okta Admin Console

### Issue: `grant_type=interaction_code` in requests

**Meaning**: The widget is trying to use interaction code flow, which requires PKCE and SPA application type.

**Solution**: Ensure application is SPA type and PKCE is enabled

### Issue: No `code_challenge` in authorization URL

**Meaning**: PKCE is not being used, but widget has `pkce: true`

**Possible Causes**:
- Widget configuration issue
- Okta application doesn't support PKCE

**Solution**: Verify widget config and application type

## Quick Verification Checklist

Use this checklist to verify your setup:

- [ ] Browser Network tab shows `response_type=code` in authorization request
- [ ] Browser Network tab shows `code_challenge` and `code_challenge_method=S256` (PKCE)
- [ ] Browser Console shows widget config with `responseType: ['code']` and `pkce: true`
- [ ] Okta System Log shows `response_type=code` in events
- [ ] Okta Admin Console shows application type is "Single-Page App"
- [ ] Client ID in `.env.local` matches the SPA application Client ID
- [ ] Redirect URI in Okta matches exactly: `http://localhost:3000/api/auth/callback/okta`

## Still Can't Find It?

If you're still having trouble:

1. **Take a Screenshot**:
   - Screenshot of the Network tab showing the `/interact` or `/authorize` request
   - Screenshot of the request payload/parameters
   - Screenshot of the error response

2. **Check Okta Application Settings**:
   - Screenshot of the General tab showing:
     - Application type
     - Grant types
     - Client ID
     - Redirect URIs

3. **Share the Details**:
   - What you see in the Network tab
   - What the error message says
   - What your Okta application type is set to

This will help identify exactly what grant type is being requested vs what's configured.

