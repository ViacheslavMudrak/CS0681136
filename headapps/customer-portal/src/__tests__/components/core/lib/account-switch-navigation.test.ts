import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import * as accountSwitchEvents from "@/lib/account-switch-events";
import {
  completeAccountSwitchAfterPreferenceSave,
  reloadOrOrdersManagementListAfterAccountSwitch,
} from "@/lib/account-switch-navigation";

vi.mock("@/lib/account-switch-events", () => ({
  fireAccountSwitchEvents: vi.fn(),
  fireEnhancedAccountSwitchEvent: vi.fn(),
}));

describe("completeAccountSwitchAfterPreferenceSave", () => {
  const assign = vi.fn();
  const reload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, pathname: "/dashboard", assign, reload },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fires analytics then reloads on non-detail routes", () => {
    completeAccountSwitchAfterPreferenceSave({
      account: {
        id: "2",
        companyName: "Beta",
        address: "",
        accountNumber: "2",
        isActive: true,
        role: "",
        organization: "",
      },
      previousAccountId: "1",
      source: "profile_menu",
      currentLanguage: "en",
      pathname: "/dashboard",
    });

    expect(accountSwitchEvents.fireAccountSwitchEvents).toHaveBeenCalled();
    expect(accountSwitchEvents.fireEnhancedAccountSwitchEvent).toHaveBeenCalledWith({
      previousAccountId: "1",
      newAccountId: "2",
      source: "profile_menu",
    });
    expect(reload).toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });

  it("navigates to orders listing when on order detail", () => {
    completeAccountSwitchAfterPreferenceSave({
      account: {
        id: "2",
        companyName: "Beta",
        address: "",
        accountNumber: "2",
        isActive: true,
        role: "",
        organization: "",
      },
      currentLanguage: "en",
      pathname: "/en/orders-management/orders/12345",
    });

    expect(assign).toHaveBeenCalledWith("/en/orders-management/orders");
    expect(reload).not.toHaveBeenCalled();
  });
});

describe("reloadOrOrdersManagementListAfterAccountSwitch", () => {
  it("is a no-op outside the browser", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error test stub
    delete globalThis.window;
    expect(() => reloadOrOrdersManagementListAfterAccountSwitch("/dashboard")).not.toThrow();
    globalThis.window = originalWindow;
  });
});
