import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  queueScrollExtentSync,
  scrollListingPanelIntoView,
  syncScrollExtent,
} from "@/hooks/use-scroll-extent-sync";
import { DEVICE_VIEWPORT } from "@/lib/viewport-breakpoints";

const COMPACT_QUERY = `(max-width: ${DEVICE_VIEWPORT.DESKTOP_MIN - 1}px)`;

describe("use-scroll-extent-sync", () => {
  let scrollToMock: ReturnType<typeof vi.fn>;
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollToMock = vi.fn();
    window.scrollTo = scrollToMock as typeof window.scrollTo;

    matchMediaMock = vi.fn((query: string) => ({
      matches: query === COMPACT_QUERY,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    window.matchMedia = matchMediaMock as typeof window.matchMedia;

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 500,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 800,
    });

    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      writable: true,
      value: 900,
    });
    Object.defineProperty(document.body, "scrollHeight", {
      configurable: true,
      writable: true,
      value: 900,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clamps scrollY on compact viewports when content height shrinks", () => {
    syncScrollExtent();

    expect(scrollToMock).toHaveBeenCalledWith(0, 100);
  });

  it("does not clamp scrollY on desktop viewports", () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    syncScrollExtent();

    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it("schedules sync via queueScrollExtentSync", () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    queueScrollExtentSync();

    expect(rafCallbacks.length).toBeGreaterThan(0);
    for (const cb of rafCallbacks) {
      cb(0);
    }

    expect(scrollToMock).toHaveBeenCalled();
  });

  it("scrollListingPanelIntoView scrolls the listing anchor into view", () => {
    const scrollIntoViewMock = vi.fn();
    const anchor = document.createElement("div");
    anchor.setAttribute("data-listing-scroll-anchor", "");
    anchor.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(anchor);

    scrollListingPanelIntoView();

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ block: "start", behavior: "instant" });

    anchor.remove();
  });
});
