/** Template IDs - use format without hyphens when comparing to contextItem.template.baseTemplates */
export const TEMPLATE_ID_CONSTANTS = {
  NEWS_DETAIL_PAGE: '5EB1210F-25CA-485D-A87E-855C0834239C',
  REFLECTION_DETAIL_PAGE: '05956975-6A07-4E20-BC56-D5FC4D8D70FA',
  DEFAULT_IMAGES: 'A80DCE54-2D60-4484-9F89-F25CE8286FD8',
  ASCENSION_SITE: '7F81B515-EB46-43D6-AF06-264740F66AC3',
  MINISTRY_HOME_PAGE: 'A136831C-DD01-48D6-A08A-75E66B843D6C',
  FUNCTION_HOME_PAGE: '63156DCD-43A3-44D4-AB55-E88824D6ED21',
  RESOURCE_HOME_PAGE: 'EC3A502B-D1DF-47DE-9677-756A6A5ADB70',
  COLLAB_SPACE_TEMPLATE_FOLDER: 'CC547FBA-396B-4051-A8D9-5A4C82FCC7B1',
  COLLAB_SPACE_SITE_HOME: 'A38A830F-3202-477C-B930-2BAF5B7F357E',
  BASE_PAGE: '4DC70463-DF58-4C54-BB99-67EFBCFD887D',
} as const;

const normalizeId = (id: string) =>
  String(id || '')
    .replace(/-/g, '')
    .toUpperCase();

/** True if id matches target (handles hyphenated or compact format) */
export const matchesTemplate = (id: string | undefined, target: string) =>
  id ? normalizeId(id) === normalizeId(target) : false;

/** True if baseTemplates contains target (baseTemplates use compact format from API) */
export const hasBaseTemplate = (
  baseTemplates: Array<{ id?: string }> | undefined,
  target: string
) =>
  Array.isArray(baseTemplates) &&
  baseTemplates.some((bt) => bt.id && normalizeId(bt.id) === normalizeId(target));
