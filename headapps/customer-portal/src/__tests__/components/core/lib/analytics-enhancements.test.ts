import { beforeEach, describe, expect, it, vi } from "vitest";
import { event } from "@sitecore-cloudsdk/events/browser";
import { sendNavigationMenuClickEvent } from "@/lib/CDPEvents";
import { logGTMNavigationMenuClick } from "@/lib/gtm";

vi.mock("@sitecore-cloudsdk/events/browser", () => ({
  event: vi.fn().mockResolvedValue({ ok: true }),
}));

describe("analytics enhancement helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.dataLayer = [];
  });

  it("pushes the navigation select_content payload to GTM", () => {
    logGTMNavigationMenuClick({
      interaction_type: "menu_clicked",
      menu_item: "Orders",
      parent_item: "Order_Management",
      menu_section: "GENERAL",
      destination_url: "/en/orders",
    });

    expect(window.dataLayer?.[0]).toEqual(
      expect.objectContaining({
        event: "select_content",
        event_category: "engagement",
        interaction_type: "menu_clicked",
        menu_item: "Orders",
        parent_item: "Order_Management",
        menu_section: "GENERAL",
        destination_url: "/en/orders",
      })
    );
  });

  it("sends SELECT_CONTENT payloads to Sitecore CDP", async () => {
    await sendNavigationMenuClickEvent({
      interaction_type: "menu_clicked",
      menu_item: "Orders",
      parent_item: "Order_Management",
      menu_section: "GENERAL",
      destination_url: "/en/orders",
    });

    expect(event).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SELECT_CONTENT",
        extensionData: expect.objectContaining({
          app_name: "customer-portal",
          interaction_type: "menu_clicked",
          menu_item: "Orders",
          parent_item: "Order_Management",
          menu_section: "GENERAL",
          destination_url: "/en/orders",
        }),
      })
    );
  });
});
