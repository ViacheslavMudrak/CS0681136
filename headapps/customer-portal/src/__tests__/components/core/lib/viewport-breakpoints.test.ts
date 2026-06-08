import { describe, expect, it } from "vitest";

import { DEVICE_VIEWPORT, MEDIA_QUERIES, TAILWIND_BREAKPOINTS } from "@/lib/viewport-breakpoints";
import { DEVICE_TYPE, getDeviceType } from "@/hooks/use-device-type";

describe("viewport-breakpoints", () => {
  it("defines ascending Tailwind breakpoint values", () => {
    expect(TAILWIND_BREAKPOINTS.SM).toBeLessThan(TAILWIND_BREAKPOINTS.MD);
    expect(TAILWIND_BREAKPOINTS.MD).toBeLessThan(TAILWIND_BREAKPOINTS.LG);
    expect(TAILWIND_BREAKPOINTS.LG).toBeLessThan(TAILWIND_BREAKPOINTS.XL);
    expect(TAILWIND_BREAKPOINTS.XL).toBeLessThan(TAILWIND_BREAKPOINTS.XXL);
  });

  it("aligns device tiers with md and lg thresholds", () => {
    expect(DEVICE_VIEWPORT.MOBILE_MAX).toBe(767);
    expect(DEVICE_VIEWPORT.TABLET_MIN).toBe(768);
    expect(DEVICE_VIEWPORT.TABLET_MAX).toBe(1024);
    expect(DEVICE_VIEWPORT.DESKTOP_MIN).toBe(1025);
  });

  it("exposes media queries that match device tier boundaries", () => {
    expect(MEDIA_QUERIES.tabletUp).toBe("(min-width: 768px)");
    expect(MEDIA_QUERIES.desktopUp).toBe("(min-width: 1025px)");
    expect(MEDIA_QUERIES.mobileOnly).toBe("(max-width: 767px)");
    expect(MEDIA_QUERIES.tabletOnly).toBe("(min-width: 768px) and (max-width: 1024px)");
  });
});

describe("getDeviceType", () => {
  it("classifies mobile below 768px", () => {
    expect(getDeviceType(375)).toBe(DEVICE_TYPE.MOBILE);
    expect(getDeviceType(767)).toBe(DEVICE_TYPE.MOBILE);
  });

  it("classifies tablet from 768px through 1024px", () => {
    expect(getDeviceType(768)).toBe(DEVICE_TYPE.TABLET);
    expect(getDeviceType(1024)).toBe(DEVICE_TYPE.TABLET);
  });

  it("classifies desktop from 1025px", () => {
    expect(getDeviceType(1025)).toBe(DEVICE_TYPE.DESKTOP);
    expect(getDeviceType(1440)).toBe(DEVICE_TYPE.DESKTOP);
  });
});
