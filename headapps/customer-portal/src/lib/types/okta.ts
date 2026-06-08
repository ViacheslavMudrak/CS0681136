/**
 * Type definitions for Okta authentication tokens and responses
 */

export interface OktaTokens {
  status?: string;
  tokens?: {
    accessToken?: string;
    idToken?: {
      claims: {
        sub: string;
        name: string;
        email: string;
      };
    };
    refreshToken?: string;
  };
  [key: string]: unknown;
}

export interface OktaSignInResponse {
  status: string;
  tokens?: OktaTokens["tokens"];
  [key: string]: unknown;
}

export interface UserInfo {
  userId?: string;
  email?: string;
  name?: string;
}
