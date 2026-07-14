/**
 * Client-safe shape for a news site choice. The `visibleBy` group emails that
 * gate each site are intentionally absent — visibility filtering happens
 * server-side in the news-site-options service so gated metadata never reaches
 * the browser.
 */
export type PublicSiteOption = {
  id?: string;
  name?: string;
  title?: { value?: string };
};

/** Response returned by GET /api/user-preferences/news-site-options. */
export type NewsSiteOptionsResponse = {
  home: PublicSiteOption[];
  supplemental: PublicSiteOption[];
};
