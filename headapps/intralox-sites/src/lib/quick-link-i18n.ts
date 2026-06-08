import { getTranslations } from 'next-intl/server';

/** Resolved UI strings for Quick Link empty hints and link accessibility fallbacks. */
export type QuickLinkLabels = {
  emptyHint: string;
  linkAriaFallback: string;
};

/** Default English copy when Sitecore dictionary keys are missing. */
export const QUICK_LINK_LABEL_FALLBACKS: QuickLinkLabels = {
  emptyHint: 'Quick Link',
  linkAriaFallback: 'Quick Link',
};

function readMessage(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const value = t(key as never);
    if (typeof value !== 'string' || value.trim().length === 0) return fallback;
    if (value === key) return fallback;
    return value;
  } catch {
    return fallback;
  }
}

/**
 * Reads labels from the Sitecore dictionary (next-intl messages). Optional keys at the message root:
 * `QuickLink_EmptyHint`, `QuickLink_LinkAriaFallback`.
 * Falls back to {@link QUICK_LINK_LABEL_FALLBACKS} when keys are missing or `getTranslations` fails.
 *
 * @returns Labels for empty datasource hints and accessible name fallback when title/link text are empty.
 */
export async function getQuickLinkLabels(): Promise<QuickLinkLabels> {
  try {
    const t = await getTranslations();
    return {
      emptyHint: readMessage(t, 'QuickLink_EmptyHint', QUICK_LINK_LABEL_FALLBACKS.emptyHint),
      linkAriaFallback: readMessage(
        t,
        'QuickLink_LinkAriaFallback',
        QUICK_LINK_LABEL_FALLBACKS.linkAriaFallback,
      ),
    };
  } catch {
    return { ...QUICK_LINK_LABEL_FALLBACKS };
  }
}
