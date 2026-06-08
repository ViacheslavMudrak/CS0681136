import { describe, expect, it } from "vitest";

import {
  isPersonalizedDashboardHomePage,
  resolveDashboardInfoPanelVisible,
  resolveDashboardPillsVisible,
  resolveDashboardUserType,
} from "@/lib/dashboard-page-view-utils";

describe("dashboard-page-view-utils", () => {
  it("detects Home route as dashboard home", () => {
    const page = {
      mode: { isEditing: false },
      layout: {
        sitecore: {
          route: { name: "Home" },
          context: { itemPath: "/" },
        },
      },
    } as Parameters<typeof isPersonalizedDashboardHomePage>[0];

    expect(isPersonalizedDashboardHomePage(page)).toBe(true);
  });

  it("resolves info panel and pills visibility from rendering tree", () => {
    const rendering = {
      placeholders: {
        Content: [
          {
            componentName: "DashboardInfoBanner",
            params: { HideBanner: "0" },
          },
          {
            componentName: "UserActionTiles",
            params: { HideUserActionTiles: "1" },
          },
        ],
      },
    };

    expect(resolveDashboardInfoPanelVisible(rendering, false)).toBe(true);
    expect(resolveDashboardPillsVisible(rendering, false)).toBe(false);
  });

  it("classifies intralox email as internal", () => {
    expect(resolveDashboardUserType("user@intralox.com")).toBe("internal");
    expect(resolveDashboardUserType("user@example.com")).toBe("external");
  });
});
