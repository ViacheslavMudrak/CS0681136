/**
 * Replaces the current year token used by CMS copyright fields.
 */
export function getCopyrightWithYear(text: string | undefined): string {
  if (!text) {
    return "";
  }

  return text.replace(/\{current_year\}/gi, String(new Date().getFullYear()));
}
