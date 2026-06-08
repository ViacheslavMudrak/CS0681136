export const TAILWIND_BREAKPOINTS = {
  SM: 576,
  MD: 768,
  LG: 1025,
  XL: 1200,
  XXL: 1400,
} as const;

export const DEVICE_VIEWPORT = {
  MOBILE_MAX: TAILWIND_BREAKPOINTS.MD - 1,
  TABLET_MIN: TAILWIND_BREAKPOINTS.MD,
  TABLET_MAX: TAILWIND_BREAKPOINTS.LG - 1,
  DESKTOP_MIN: TAILWIND_BREAKPOINTS.LG,
  CONTACT_MENU_ONLY_MAX: 374,
} as const;

export const MEDIA_QUERIES = {
  tabletUp: `(min-width: ${DEVICE_VIEWPORT.TABLET_MIN}px)`,
  desktopUp: `(min-width: ${DEVICE_VIEWPORT.DESKTOP_MIN}px)`,
  mobileOnly: `(max-width: ${DEVICE_VIEWPORT.MOBILE_MAX}px)`,
  tabletOnly: `(min-width: ${DEVICE_VIEWPORT.TABLET_MIN}px) and (max-width: ${DEVICE_VIEWPORT.TABLET_MAX}px)`,
} as const;
