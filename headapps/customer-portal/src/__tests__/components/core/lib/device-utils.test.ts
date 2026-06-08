import { describe, expect, it } from "vitest";

import { getBrowserInfo, getDeviceType } from "@/lib/device-utils";

describe("getBrowserInfo", () => {
  it("detects desktop Chrome", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    expect(getBrowserInfo(ua)).toEqual({ name: "Chrome", version: "120.0.0.0" });
  });

  it("detects iOS Chrome (CriOS token)", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1";
    expect(getBrowserInfo(ua)).toEqual({ name: "Chrome", version: "120.0.6099.119" });
  });

  it("detects iOS Safari with Version token", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
    expect(getBrowserInfo(ua)).toEqual({ name: "Safari", version: "17.4" });
  });

  it("detects iOS Safari WebView without Version token", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";
    expect(getBrowserInfo(ua)).toEqual({ name: "Safari", version: "16.6" });
  });

  it("detects Android Chrome", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
    expect(getBrowserInfo(ua)).toEqual({ name: "Chrome", version: "120.0.0.0" });
  });

  it("detects Samsung Internet", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36";
    expect(getBrowserInfo(ua)).toEqual({ name: "Samsung Internet", version: "23.0" });
  });

  it("detects iOS Firefox (FxiOS)", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15";
    expect(getBrowserInfo(ua)).toEqual({ name: "Firefox", version: "120.0" });
  });
});

describe("getDeviceType", () => {
  it("classifies iPhone as MOBILE", () => {
    expect(
      getDeviceType(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
      )
    ).toBe("MOBILE");
  });
});
