import {
  isFontAwesomeClassString,
  normalizeFontAwesomeClassList,
} from "lib/chrome-icons";
import { cmsIconToFontAwesome } from "lib/cms-icon-to-fontawesome";
import { firstNonEmptyTextField } from "components/navigation/navigationUtils";

import type {
  FloatingButtonIconReference,
  FloatingButtonReference,
  FloatingFabResolvedIcon,
} from "./FloatingActionButton.type";

export type { FloatingFabResolvedIcon };

const UNSAFE_ICON_CLASS_ATTR = /[<>"']|\bstyle\s*=/i;

/** FAB call control uses phone-with-waves (parity with CMS `fa-solid fa-phone-volume`). */
const FAB_PHONE_ICON_CLASS = "fa-solid fa-phone-volume";

/** Unwraps Sitecore `jsonValue` item refs (layout / Edge). */
export function unwrapSitecoreItemRef<T extends object>(
  raw: unknown,
): T | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  const jv = (raw as { jsonValue?: T }).jsonValue;
  if (jv != null && typeof jv === "object") {
    return jv;
  }
  return raw as T;
}

function iconSlugFromItemPath(url: string | undefined): string | undefined {
  if (!url || typeof url !== "string") {
    return undefined;
  }
  const slug = url.split("/").filter(Boolean).pop();
  return slug?.trim() || undefined;
}

/** Normalizes Sitecore item GUIDs (`{GUID}` or plain). */
export function normalizeSitecoreItemId(
  raw: string | null | undefined,
): string | undefined {
  if (!raw || typeof raw !== "string") {
    return undefined;
  }
  const t = raw.trim().replace(/^\{|\}$/g, "").toLowerCase();
  return /^[0-9a-f-]{36}$/.test(t) ? t : undefined;
}

/**
 * FAB icon droplink targets when layout service does not expand the Icon item.
 * Add entries when new icons are authored under the shared icon folder.
 */
const FAB_ICON_CLASS_BY_ITEM_ID: Record<string, string> = {
  /** Floating Button `__Standard Values` default Icon item (phone / call). */
  "4e8fad49-ea87-464f-ac7d-54e924ef187d": FAB_PHONE_ICON_CLASS,
};

function resolveFabIconFromSitecoreItemId(
  iconItem: FloatingButtonIconReference,
): FloatingFabResolvedIcon | null {
  const bag = iconItem as Record<string, unknown>;
  const id =
    normalizeSitecoreItemId(iconItem.id) ??
    normalizeSitecoreItemId(firstNonEmptyTextField(bag.value, bag.Value));
  if (!id) {
    return null;
  }
  const className = FAB_ICON_CLASS_BY_ITEM_ID[id];
  return className ? { kind: "fa-class", className } : null;
}

/** Reads `fields.Icon` / `fields.icon` from a floating-button item (layout + GraphQL shapes). */
export function pickFloatingButtonIconRef(
  floatingButtonFields: Record<string, unknown> | undefined,
): FloatingButtonIconReference | undefined {
  if (!floatingButtonFields) {
    return undefined;
  }
  const raw = floatingButtonFields.Icon ?? floatingButtonFields.icon;
  return unwrapSitecoreItemRef<FloatingButtonIconReference>(raw);
}

/** Unwraps route `FloatingButton` reference from layout / Edge JSON. */
export function resolveRouteFloatingButton(
  routeFields: Record<string, unknown> | undefined,
): FloatingButtonReference | undefined {
  if (!routeFields) {
    return undefined;
  }
  const raw =
    routeFields.FloatingButton ??
    routeFields.floatingButton ??
    routeFields.Floating_Button;
  return unwrapSitecoreItemRef<FloatingButtonReference>(raw);
}

function sanitizeFloatingFabFaClassCandidate(raw: string): string | null {
  const t = raw.trim();
  if (!t || UNSAFE_ICON_CLASS_ATTR.test(t)) {
    return null;
  }
  const normalized = normalizeFontAwesomeClassList(t).trim();
  if (!normalized || UNSAFE_ICON_CLASS_ATTR.test(normalized)) {
    return null;
  }
  return isFontAwesomeClassString(normalized) ? normalized : null;
}

/**
 * Normalizes CMS icon labels for lookup (trim, lowercase, collapse spaces).
 */
export function normalizeFloatingIconKey(
  raw: string | null | undefined,
): string {
  if (!raw || typeof raw !== "string") {
    return "";
  }
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Maps plain `fa-phone` CMS values to the FAB phone-volume glyph. */
function coerceFabPhoneIconClass(className: string): string {
  const normalized = normalizeFontAwesomeClassList(className).trim();
  if (normalized === "fa-solid fa-phone" || /\bfa-phone$/.test(normalized)) {
    return FAB_PHONE_ICON_CLASS;
  }
  return className;
}

/** Legacy FAB labels → FA class (Phone, Mail, Message Square, and common aliases). */
function floatingActionIconFaFromNormalizedKey(key: string): string | null {
  if (
    key === "phone" ||
    key === "call" ||
    key === "icon-call" ||
    key === "icon-phone"
  ) {
    return FAB_PHONE_ICON_CLASS;
  }

  if (
    key === "mail" ||
    key === "email" ||
    key.endsWith(" mail") ||
    key.startsWith("mail ") ||
    key.includes("envelope")
  ) {
    return "fa-solid fa-envelope";
  }

  if (
    key === "message" ||
    key === "message square" ||
    key.startsWith("message ") ||
    key.includes("comment")
  ) {
    return "fa-solid fa-message";
  }

  return null;
}

/**
 * Resolves CMS icon name/value to a Font Awesome class string for intralox-icon-library rendering.
 */
export function resolveFloatingActionIconFa(
  cmsValue: string | null | undefined,
): string | null {
  const key = normalizeFloatingIconKey(cmsValue);
  if (key) {
    const fromKey = floatingActionIconFaFromNormalizedKey(key);
    if (fromKey) {
      return fromKey;
    }
  }

  const fa = cmsIconToFontAwesome(cmsValue);
  if (!fa) return null;
  const sanitized = sanitizeFloatingFabFaClassCandidate(fa);
  if (!sanitized) return null;
  return coerceFabPhoneIconClass(sanitized);
}

function readFabIconClassFromFields(
  fields: FloatingButtonIconReference["fields"],
  iconItem?: FloatingButtonIconReference,
): string {
  const bag = (fields ?? {}) as Record<string, unknown>;
  const itemBag = (iconItem ?? {}) as Record<string, unknown>;
  return firstNonEmptyTextField(
    bag.CssClass,
    bag.cssClass,
    bag.IconCssClass,
    bag.iconCssClass,
    itemBag.CssClass,
    itemBag.cssClass,
    itemBag.IconCssClass,
    itemBag.iconCssClass,
  );
}

function readFabIconValueFromFields(
  fields: FloatingButtonIconReference["fields"],
  iconItem?: FloatingButtonIconReference,
): string {
  const bag = (fields ?? {}) as Record<string, unknown>;
  const itemBag = (iconItem ?? {}) as Record<string, unknown>;
  return firstNonEmptyTextField(
    bag.Value,
    bag.value,
    itemBag.Value,
    itemBag.value,
  );
}

function resolveFabIconFromRawText(raw: string): FloatingFabResolvedIcon | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const guid = normalizeSitecoreItemId(trimmed);
  if (guid) {
    const fromGuid = FAB_ICON_CLASS_BY_ITEM_ID[guid];
    if (fromGuid) {
      return { kind: "fa-class", className: fromGuid };
    }
    return null;
  }

  const fa = sanitizeFloatingFabFaClassCandidate(trimmed);
  if (fa) {
    return { kind: "fa-class", className: coerceFabPhoneIconClass(fa) };
  }

  const fromSlug = resolveFloatingActionIconFa(trimmed);
  return fromSlug ? { kind: "fa-class", className: fromSlug } : null;
}

/**
 * Resolves floating-button icon from Sitecore fields.
 */
export function resolveFloatingFabIcon(
  iconRef: FloatingButtonIconReference | undefined,
): FloatingFabResolvedIcon | null {
  const iconItem = unwrapSitecoreItemRef<FloatingButtonIconReference>(iconRef);
  if (!iconItem) {
    return null;
  }

  const fields = unwrapSitecoreItemRef<NonNullable<FloatingButtonIconReference["fields"]>>(
    iconItem.fields,
  ) ?? iconItem.fields;

  const fromClassFields = readFabIconClassFromFields(fields, iconItem);
  const fromClass = resolveFabIconFromRawText(fromClassFields);
  if (fromClass) {
    return fromClass;
  }

  const fromValue = resolveFabIconFromRawText(
    readFabIconValueFromFields(fields, iconItem),
  );
  if (fromValue) {
    return fromValue;
  }

  const fromName =
    resolveFloatingActionIconFa(iconItem.name) ??
    resolveFloatingActionIconFa(iconItem.displayName) ??
    resolveFloatingActionIconFa(iconSlugFromItemPath(iconItem.url));
  if (fromName) {
    return { kind: "fa-class", className: fromName };
  }

  return resolveFabIconFromSitecoreItemId(iconItem);
}

/**
 * Reads the best-available icon label for `aria-label` (skips raw FA class strings in `Value`).
 */
export function getFloatingIconLabel(
  iconRef: FloatingButtonIconReference | undefined,
): string | undefined {
  const iconItem = unwrapSitecoreItemRef<FloatingButtonIconReference>(iconRef);
  const fields =
    unwrapSitecoreItemRef<NonNullable<FloatingButtonIconReference["fields"]>>(
      iconItem?.fields,
    ) ?? iconItem?.fields;
  const fromValue = readFabIconValueFromFields(fields, iconItem);
  if (fromValue) {
    const fa = sanitizeFloatingFabFaClassCandidate(fromValue);
    if (!fa) {
      return fromValue.trim();
    }
  }
  if (typeof iconItem?.name === "string" && iconItem.name.trim()) {
    return iconItem.name.trim();
  }
  if (typeof iconItem?.displayName === "string" && iconItem.displayName.trim()) {
    return iconItem.displayName.trim();
  }
  return undefined;
}

export function hasUsableLinkHref(href: string | null | undefined): boolean {
  if (href == null || typeof href !== "string") {
    return false;
  }
  return href.trim().length > 0;
}

export const FLOATING_ACTION_ARIA_FALLBACK = "Action";

export interface FloatingActionAriaLabelParts {
  heading?: string;
  text?: string;
  linkText?: string;
  linkTitle?: string;
  itemDisplayName?: string;
  itemName?: string;
  iconLabel?: string;
}

export function buildFloatingActionAriaLabel(
  parts: FloatingActionAriaLabelParts,
  fallbackLabel: string,
): string {
  const {
    heading,
    text,
    linkText,
    linkTitle,
    itemDisplayName,
    itemName,
    iconLabel,
  } = parts;

  const trim = (s: string | undefined) =>
    typeof s === "string" && s.trim().length > 0 ? s.trim() : undefined;

  const h = trim(heading);
  const t = trim(text);
  const lt = trim(linkText);
  const lti = trim(linkTitle);

  const primary = [h, t, lt, lti].filter((p): p is string => p != null);
  if (primary.length > 0) {
    return primary.join(". ");
  }

  const meta = [trim(itemDisplayName), trim(itemName), trim(iconLabel)].filter(
    (p): p is string => p != null,
  );

  if (meta.length > 0) {
    return meta.join(". ");
  }

  return fallbackLabel.trim() || "Action";
}

export const FLOATING_ACTION_VIEWPORT_INSET_PX = 24;

export const FLOATING_ACTION_VIEWPORT_INSET_MOBILE_PX = 16;

export function getFloatingActionViewportInsetBottomPx(): number {
  if (typeof window === "undefined") {
    return FLOATING_ACTION_VIEWPORT_INSET_PX;
  }
  return window.innerWidth < 600
    ? FLOATING_ACTION_VIEWPORT_INSET_MOBILE_PX
    : FLOATING_ACTION_VIEWPORT_INSET_PX;
}

export const FLOATING_ACTION_HEIGHT_PX = 70.5;

export const FLOATING_ACTION_MIN_HEIGHT_PX = FLOATING_ACTION_HEIGHT_PX;

export const FLOATING_ACTION_WIDTH_PX = 291;

export const FLOATING_ACTION_WIDTH_MAX_PX = FLOATING_ACTION_WIDTH_PX;

export const FLOATING_ACTION_WIDTH_MOBILE_PX = 240;

export const FLOATING_ACTION_WIDTH_TABLET_DESKTOP_PX = FLOATING_ACTION_WIDTH_PX;

export const FLOATING_ACTION_VIEWPORT_ANCHOR_Z_INDEX = 1050;
