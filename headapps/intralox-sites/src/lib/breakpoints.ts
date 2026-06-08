/**
 * Layout breakpoints — aligned with https://www.intralox.com/ production CSS and @theme:
 * - Mobile:        width &lt; 600px
 * - Tablet:        600px ≤ width &lt; 992px
 * - Desktop:       992px ≤ width &lt; 1200px
 * - Large desktop: width ≥ 1200px (`xl:` and --layout-desktop-large-start)
 */
export const LAYOUT_BREAKPOINT_PX = {
  TABLET_MIN: 600,
  DESKTOP_MIN: 992,
  DESKTOP_LARGE_MIN: 1200,
} as const;

export type LayoutBreakpoint = 'mobile' | 'tablet' | 'desktop';

export const LAYOUT_MEDIA = {
  mobileOnly: '(max-width: 599px)',
  tabletOnly: '(min-width: 600px) and (max-width: 991px)',
  tabletUp: '(min-width: 600px)',
  belowDesktop: '(max-width: 991px)',
  desktopUp: '(min-width: 992px)',
  belowLargeDesktop: '(max-width: 1199px)',
  largeDesktopUp: '(min-width: 1200px)',
} as const;

/**
 * @param width - Viewport width in CSS pixels
 */
export function getLayoutBreakpoint(width: number): LayoutBreakpoint {
  if (width < LAYOUT_BREAKPOINT_PX.TABLET_MIN) return 'mobile';
  if (width < LAYOUT_BREAKPOINT_PX.DESKTOP_MIN) return 'tablet';
  return 'desktop';
}

/** True when viewport is at or above large-desktop (1200px), i.e. Tailwind `xl` and up. */
export function isLargeDesktopViewport(width: number): boolean {
  return width >= LAYOUT_BREAKPOINT_PX.DESKTOP_LARGE_MIN;
}
