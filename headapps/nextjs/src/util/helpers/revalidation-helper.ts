import type { Page } from '@sitecore-content-sdk/nextjs';
import { ControlSettingItem } from 'src/ts/control-setting';
import { log } from 'src/util/helpers/log-helper';

export interface PageRevalidationFields {
  pageRevalidationInterval?: ControlSettingItem;
}

/**
 * Extracts revalidation interval from page fields
 * @param page - The Sitecore page object
 * @param defaultRevalidate - Default revalidation time in seconds (default: 30)
 * @returns Revalidation interval in seconds, or undefined for static pages (0 or undefined field)
 */
export function getPageRevalidationInterval(
  page: Page | null,
  defaultRevalidate: number = 480
): number | undefined {
  if (!page) {
    return defaultRevalidate;
  }

  const fields = page.layout.sitecore.route?.fields as PageRevalidationFields;
  const revalidateValue = fields?.pageRevalidationInterval?.fields?.value?.value;

  if (revalidateValue === undefined || revalidateValue === null) {
    return defaultRevalidate;
  }

  const parsed =
    typeof revalidateValue === 'string' ? parseInt(revalidateValue, 10) : revalidateValue;

  if (isNaN(parsed) || parsed < 0) {
    log('WARNING', 'revalidation-helper', 'Invalid revalidation interval — using default', {
      value: revalidateValue,
    });
    return defaultRevalidate;
  }

  // 0 means no revalidation (static page)
  if (parsed === 0) {
    return undefined;
  }

  return parsed;
}
