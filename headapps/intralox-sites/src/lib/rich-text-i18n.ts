import { getTranslations } from 'next-intl/server';

/** Resolved UI strings for Rich Text empty hints and region labeling. */
export type RichTextLabels = {
  emptyHint: string;
};

/** Default English copy when Sitecore dictionary keys are missing. */
export const RICH_TEXT_LABEL_FALLBACKS: RichTextLabels = {
  emptyHint: 'Rich text',
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
 * Reads labels from the Sitecore dictionary (next-intl messages). Optional key at the message root:
 * `RichText_EmptyHint`.
 * Falls back to {@link RICH_TEXT_LABEL_FALLBACKS} when keys are missing or `getTranslations` fails.
 *
 * @returns Labels for empty datasource hints and accessible region naming when rendering metadata is absent.
 */
export async function getRichTextLabels(): Promise<RichTextLabels> {
  try {
    const t = await getTranslations();
    return {
      emptyHint: readMessage(t, 'RichText_EmptyHint', RICH_TEXT_LABEL_FALLBACKS.emptyHint),
    };
  } catch {
    return { ...RICH_TEXT_LABEL_FALLBACKS };
  }
}
