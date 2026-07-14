import { NextApiRequest, NextApiResponse } from 'next';
import { JWT } from 'google-auth-library';

interface RequestBody {
  entraToken: string;
  email: string;
}

interface SuccessResponse {
  googleToken: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { entraToken, email } = req.body as RequestBody;
  if (!entraToken || !email) {
    return res.status(400).json({ error: 'Entra token and user email are required' });
  }

  const poolId = process.env.WORKFORCE_POOL_ID;
  const providerId = process.env.PROVIDER_ID;
  const serviceAccountEmail = process.env.SERVICE_ACCOUNT_EMAIL;
  const projectId = process.env.GCP_PROJECT_ID;

  if (!projectId) {
    return res.status(500).json({ error: 'GCP_PROJECT_ID is not configured.' });
  }

  try {
    // Step 1: Get federated token for the service account
    console.log('Attempting to exchange Entra token with Google STS...');
    const audience = `//iam.googleapis.com/locations/global/workforcePools/${poolId}/providers/${providerId}`;

    const stsResponse = await fetch('https://sts.googleapis.com/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
        requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        subject_token: entraToken,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        audience,
      }),
    });

    if (!stsResponse.ok) {
      const errorText = await stsResponse.text();
      console.error('STS Error:', errorText);
      throw new Error(`STS error (${stsResponse.status}): ${errorText}`);
    }

    const stsData = await stsResponse.json();
    const federatedToken = stsData.access_token;

    console.log('=== IMPERSONATION DEBUG ===');
    console.log('User email from session:', email);
    console.log('Service account:', serviceAccountEmail);
    console.log('Federated token acquired:', !!federatedToken);

    // Step 2: Use federated token to sign a JWT for domain-wide delegation
    const jwtClient = new JWT({
      email: serviceAccountEmail,
      subject: email, // The Workspace user to impersonate
      scopes: [
        'https://www.googleapis.com/auth/admin.directory.group.readonly',
        'https://www.googleapis.com/auth/admin.directory.user.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/contacts.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/cloud-identity.groups.readonly',
      ],
    });

    // Sign the JWT using the federated token to call signJwt API
    const now = Math.floor(Date.now() / 1000);
    const jwtClaims = {
      iss: serviceAccountEmail,
      sub: email,
      scope: Array.isArray(jwtClient.scopes) ? jwtClient.scopes.join(' ') : jwtClient.scopes,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    // After creating jwtClaims in your code, add:
    console.log('=== JWT CLAIMS ===');
    console.log('Issuer (iss):', jwtClaims.iss);
    console.log('Subject (sub):', jwtClaims.sub);
    console.log('Scopes:', jwtClaims.scope);
    console.log('Audience:', jwtClaims.aud);
    console.log('==================');

    // Create the JWT payload
    // const header = { alg: 'RS256', typ: 'JWT' };
    // const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    // const encodedClaims = Buffer.from(JSON.stringify(jwtClaims)).toString('base64url');
    // const unsignedJwt = `${encodedHeader}.${encodedClaims}`;

    // Call signJwt API to sign the JWT using the service account's private key
    const signJwtUrl = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:signJwt`;

    const signJwtResponse = await fetch(signJwtUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${federatedToken}`,
        'Content-Type': 'application/json',
        'X-Goog-User-Project': projectId,
      },
      body: JSON.stringify({
        payload: JSON.stringify(jwtClaims),
      }),
    });

    if (!signJwtResponse.ok) {
      const errorDetails = await signJwtResponse.text();
      console.error('=== SIGN JWT ERROR ===');
      console.error('Status:', signJwtResponse.status);
      console.error('Error details:', errorDetails);
      throw new Error(`JWT signing failed: ${errorDetails}`);
    }

    const signJwtData = await signJwtResponse.json();
    const signedJwt = signJwtData.signedJwt;

    // Step 3: Exchange the signed JWT for the user-impersonated access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signedJwt,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const googleToken = tokenData.access_token;
    console.log(`Successfully obtained google access token for ${email}.`);

    res.status(200).json({ googleToken });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Exchange Token Error:', error.message);
      res.status(500).json({ error: error.message });
    }
    console.error('Unknown error type:', error);
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
}
