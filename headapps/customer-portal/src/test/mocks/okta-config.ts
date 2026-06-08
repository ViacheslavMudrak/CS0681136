/**
 * Mock for okta-config
 */

export const mockOktaConfig = {
  domain: 'dev-12345.okta.com',
  clientId: '0oa123456789',
  redirectUri: 'http://localhost:3000/api/auth/callback/okta',
  issuer: 'https://dev-12345.okta.com/oauth2/default',
  scopes: ["openid", "profile", "email","dxp.profile"],
};

export const getOktaConfig = vi.fn(() => mockOktaConfig);
export const getOktaClientSecret = vi.fn(() => 'mock-secret');
export const isOktaConfigured = vi.fn(() => true);

