export type FontAwesomeStyle = "solid" | "regular" | "light";

/**
 * Names sometimes stored in CMS (e.g. Lucide-style) that differ from Font Awesome 6 icon class suffixes.
 * @see https://fontawesome.com/icons — search by glyph when in doubt.
 */
const CMS_ICON_NAME_ALIASES: Record<string, string> = {
  mail: "envelope",
  "chevron-down-circle": "circle-chevron-down",
  /** Floating Button / utility icon droplink item names (Navigation Link With Icon folder). */
  "icon-call": "phone",
  "icon-phone": "phone",
  "icon-mail": "envelope",
  "icon-email": "envelope",
  "icon-message": "message",
  "icon-message-square": "message-square",
  headset: "headphones",
};

/**
 * CMS / FA names for “chevron inside a circle” where the free solid glyph is a filled disk.
 * For pill buttons we instead render {@link OUTLINE_CIRCLE_CHEVRON_FA_CLASS} inside a CSS ring.
 */
const CMS_KEYS_OUTLINE_CIRCLE_CHEVRON = new Set([
  "chevron-down-circle",
  "chevron-circle-down",
]);

/** Font Awesome class used inside the outline ring (matches design: stroke circle + solid chevron). */
export const OUTLINE_CIRCLE_CHEVRON_FA_CLASS = "fa-solid fa-chevron-down";

function toKebabCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Converts a CMS icon value to a valid Font Awesome 6 icon class string. Dynamically converts by transforming to kebab-case.
export function cmsIconToFontAwesome(
  cmsValue: string | null | undefined,
  style: FontAwesomeStyle = "solid",
): string {
  if (!cmsValue || typeof cmsValue !== "string") {
    return "";
  }

  const trimmed = cmsValue.trim();
  if (!trimmed) return "";

  // Pass-through: if already a valid Font Awesome class format (fa-* or fa-solid fa-*)
  if (/^fa(-\w+)+/.test(trimmed)) {
    return trimmed;
  }

  let iconName = toKebabCase(trimmed);
  if (!iconName) return "";

  iconName = CMS_ICON_NAME_ALIASES[iconName] ?? iconName;

  return `fa-${style} fa-${iconName}`;
}

/**
 * True when the icon should render as a thin outlined circle with a chevron (not the solid
 * `fa-circle-chevron-down` glyph, which draws a filled circle with a counter punched chevron).
 */
export function cmsIconIsOutlineCircleBadge(cmsValue: string | null | undefined): boolean {
  if (!cmsValue || typeof cmsValue !== "string") {
    return false;
  }
  const trimmed = cmsValue.trim();
  if (!trimmed) return false;

  if (/^fa(-\w+)+/.test(trimmed)) {
    return /\bfa-(circle-chevron-down|chevron-circle-down)\b/i.test(trimmed);
  }

  return CMS_KEYS_OUTLINE_CIRCLE_CHEVRON.has(toKebabCase(trimmed));
}
