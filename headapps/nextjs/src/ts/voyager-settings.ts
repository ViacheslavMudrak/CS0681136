import { Field } from '@sitecore-content-sdk/nextjs';

export type VoyagerSettingsItem = {
  oracleOAuthBaseUrl: Field<string>;
  oracleTokenUrl: Field<string>;
  oracleScope: Field<string>;
  oracleJWTAudience: Field<string>;
};
