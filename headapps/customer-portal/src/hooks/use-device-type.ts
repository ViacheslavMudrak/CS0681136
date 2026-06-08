import { useSyncExternalStore } from "react";

import { DEVICE_VIEWPORT, MEDIA_QUERIES } from "@/lib/viewport-breakpoints";

export const DEVICE_TYPE = {
  MOBILE: "mobile",
  TABLET: "tablet",
  DESKTOP: "desktop",
} as const;

export type DeviceType = (typeof DEVICE_TYPE)[keyof typeof DEVICE_TYPE] | null;

export interface UseDeviceTypeResult {
  device: DeviceType;
  isNarrowContactViewport: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function getDeviceType(width: number): Exclude<DeviceType, null> {
  if (width >= DEVICE_VIEWPORT.DESKTOP_MIN) {
    return DEVICE_TYPE.DESKTOP;
  }

  if (width >= DEVICE_VIEWPORT.TABLET_MIN) {
    return DEVICE_TYPE.TABLET;
  }

  return DEVICE_TYPE.MOBILE;
}

function subscribeMediaQuery(query: string, onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener("change", onStoreChange);
  return () => mediaQueryList.removeEventListener("change", onStoreChange);
}

function getMediaQuerySnapshot(query: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(query).matches;
}

export function useDeviceType(): UseDeviceTypeResult {
  const isTabletUp = useSyncExternalStore(
    (onStoreChange) => subscribeMediaQuery(MEDIA_QUERIES.tabletUp, onStoreChange),
    () => getMediaQuerySnapshot(MEDIA_QUERIES.tabletUp),
    () => false
  );

  const isDesktopUp = useSyncExternalStore(
    (onStoreChange) => subscribeMediaQuery(MEDIA_QUERIES.desktopUp, onStoreChange),
    () => getMediaQuerySnapshot(MEDIA_QUERIES.desktopUp),
    () => false
  );

  const isNarrowContactViewport = useSyncExternalStore(
    (onStoreChange) =>
      subscribeMediaQuery(`(max-width: ${DEVICE_VIEWPORT.CONTACT_MENU_ONLY_MAX}px)`, onStoreChange),
    () => getMediaQuerySnapshot(`(max-width: ${DEVICE_VIEWPORT.CONTACT_MENU_ONLY_MAX}px)`),
    () => false
  );

  const isMobile = !isTabletUp;
  const isTablet = isTabletUp && !isDesktopUp;
  const isDesktop = isDesktopUp;

  const device: Exclude<DeviceType, null> = isDesktop
    ? DEVICE_TYPE.DESKTOP
    : isTablet
      ? DEVICE_TYPE.TABLET
      : DEVICE_TYPE.MOBILE;

  return {
    device,
    isNarrowContactViewport,
    isMobile,
    isTablet,
    isDesktop,
  };
}

export default useDeviceType;
