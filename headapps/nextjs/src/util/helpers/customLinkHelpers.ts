import type { LinkField } from '@sitecore-content-sdk/nextjs';
import { CustomLinkItem, IconItem, IconItemFields } from 'ts/custom-link';
import { DirectoryEntryItem } from 'ts/directory-entry';

const PROTOCOL_PREFIXED_RE = /^https?:\/\/(tel:|mailto:|sms:|fax:)/;

function firstDirEntry(
  dir: DirectoryEntryItem | DirectoryEntryItem[] | undefined
): DirectoryEntryItem | undefined {
  if (!dir) return undefined;
  return Array.isArray(dir) ? dir[0] : dir;
}

// Helper function to cast IconItemFields to IconItem
export function createIconItem(fields: IconItemFields): IconItem {
  return {
    fields: fields,
  };
}

// Extract icon information from Icon template items
export function extractIconFromItem(iconItem: IconItem): { iconName: string; customSvg?: string } {
  if (!iconItem?.fields) {
    return { iconName: '' };
  }

  const iconName = iconItem.fields.value?.value || '';
  const customSvg = iconItem.fields.customSvg?.value;

  return {
    iconName,
    customSvg: customSvg || undefined,
  };
}

/**
 * Strips `http://` or `https://` prefixes from protocol-scheme hrefs
 * (tel:, mailto:, sms:, fax:) that Sitecore may prepend when content editors
 * enter these values in General Link fields.
 */
export function sanitizeLinkHref(field: LinkField): LinkField {
  const href = field?.value?.href;
  if (!href || !PROTOCOL_PREFIXED_RE.test(href)) return field;

  return {
    ...field,
    value: {
      ...field.value,
      href: href.replace(/^https?:\/\//, ''),
    },
  };
}

// Custom links may have directory entry selected which takes precedence.
// In such cases, pull the link and icon from the directory entry.
// Otherwise, pull link and icon from the custom link itself.
export function resolveLinkAndIcon(item: CustomLinkItem) {
  if (!item) return;

  const dirRaw = item.fields?.directoryEntry as
    | DirectoryEntryItem
    | DirectoryEntryItem[]
    | undefined;

  const dir = firstDirEntry(dirRaw);

  if (dir) {
    const linkField = dir.fields?.entryLink ?? null;
    const iconField = dir.fields?.entryIcon ?? null;
    return { linkField, iconField };
  }

  const linkField = item.fields?.generalLink ?? null;
  const iconField = item.fields?.linkIcon ?? null;
  return { linkField, iconField };
}
