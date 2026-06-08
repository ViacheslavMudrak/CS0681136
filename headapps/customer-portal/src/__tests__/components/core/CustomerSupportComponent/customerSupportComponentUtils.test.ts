import { describe, expect, it } from "vitest";

import {
  getSupportHref,
  SUPPORT_LINK_FALLBACK_HREF,
} from "@/components/core/CustomerSupportComponent/customerSupportComponentUtils";
import type { UserProfileResponse } from "@/lib/types/user-profile";

const fallbackUrl = "https://www.intralox.com/support/phone-numbers/united-states";

function buildProfile(customerSupportEmail?: string): UserProfileResponse {
  return {
    customerSupportEmail,
    isMultipleParent: false,
    isRestrictedDomain: true,
    parentContact: [{ id: "27256759", firstName: "Tyson", lastName: "Bray", childContacts: [] }],
    leads: [],
  };
}

describe("getSupportHref", () => {
  it("uses customerSupportEmail from the profile when present", () => {
    const profile = buildProfile("Leslie.Landeche@Intralox.com");

    expect(getSupportHref(profile, fallbackUrl)).toBe("mailto:Leslie.Landeche@Intralox.com");
  });

  it("returns CMS fallback when customerSupportEmail is absent", () => {
    const profile = buildProfile(undefined);

    expect(getSupportHref(profile, fallbackUrl)).toBe(fallbackUrl);
  });

  it("returns CMS fallback when customerSupportEmail is empty", () => {
    const profile = buildProfile("");

    expect(getSupportHref(profile, fallbackUrl)).toBe(fallbackUrl);
  });

  it("returns placeholder fallback when profile and CMS fallback are missing", () => {
    expect(getSupportHref(null)).toBe(SUPPORT_LINK_FALLBACK_HREF);
    expect(getSupportHref(null, "")).toBe("");
  });
});
