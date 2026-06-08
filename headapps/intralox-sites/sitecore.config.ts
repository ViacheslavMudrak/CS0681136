import { defineConfig } from '@sitecore-content-sdk/nextjs/config';
/**
 * @type {import('@sitecore-content-sdk/nextjs/config').SitecoreConfig}
 * See the documentation for `defineConfig`:
 * https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html
 *
 * Edge `clientContextId` / `edgeUrl` are required for the built-in Form component (`loadForm` in the SDK).
 */
export default defineConfig({
  api: {
    edge: {
      contextId:
        process.env.SITECORE_EDGE_CONTEXT_ID ||
        process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
        '',
      clientContextId: process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID,
      edgeUrl: process.env.SITECORE_EDGE_URL || process.env.NEXT_PUBLIC_SITECORE_EDGE_URL,
    },
    local: {
      apiKey: process.env.NEXT_PUBLIC_SITECORE_API_KEY || '',
      apiHost: process.env.NEXT_PUBLIC_SITECORE_API_HOST || '',
    },
  },
  defaultSite: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME,
  defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  editingSecret: process.env.SITECORE_EDITING_SECRET,
  multisite: {
    enabled: true,
    useCookieResolution: () => process.env.VERCEL_ENV === 'preview',
  },
  redirects: {
    enabled: true,
    // Include all supported locales so Sitecore redirects resolve for every language.
    locales: ['en', 'zh', 'pt', 'pl', 'ja', 'it', 'fr', 'es', 'de'],
  },
  personalize: {
    scope: process.env.NEXT_PUBLIC_PERSONALIZE_SCOPE,
    edgeTimeout: parseInt(process.env.PERSONALIZE_MIDDLEWARE_EDGE_TIMEOUT || '400', 10),
    cdpTimeout: parseInt(process.env.PERSONALIZE_MIDDLEWARE_CDP_TIMEOUT || '400', 10),
  },
});
