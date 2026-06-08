export const ALERT_BOX_EMPTY_HINT = 'Alert box';

/** Last-resort `aria-label` when CMS fields yield no usable text. */
export const ALERT_BOX_ARIA_FALLBACK = 'Alert message';
/** Strip element id for layout/tests. */
export const LAYOUT_ALERT_BOX_STRIP_ID = 'layout-alert-box-strip';

export interface AlertAriaLabelParts {
  text?: string;
  linkText?: string;
  linkTitle?: string
  itemDisplayName?: string;
  itemName?: string;
}

export function hasUsableLinkHref(href: string | null | undefined): boolean {
  if (href == null || typeof href !== 'string') {
    return false;
  }
  return href.trim().length > 0;
}

export function buildAlertAriaLabel(
  parts: AlertAriaLabelParts,
  fallbackLabel: string,
): string {
  const trim = (s: string | undefined) =>
    typeof s === 'string' && s.trim().length > 0 ? s.trim() : undefined;


  const segments = [
    trim(parts.text),
    trim(parts.linkText),
    trim(parts.linkTitle),
    trim(parts.itemDisplayName),
    trim(parts.itemName),
  ].filter(Boolean) as string[];

  if (segments.length === 0) {
    return fallbackLabel;
  }
  return segments.join('. ');
}