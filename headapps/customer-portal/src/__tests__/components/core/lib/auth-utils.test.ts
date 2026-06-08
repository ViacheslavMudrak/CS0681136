import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isAccountSubmittedProfile,
  isContactSupportOnlyProfile,
  isPortalAccessDeniedProfile,
  isPublicRoute,
  resolvePostLoginDestination,
} from "@/lib/auth-utils";
import { fetchUserProfile } from "@/lib/apis/user-profile-api";
import { USER_PROFILE_SESSION_KEY } from "@/lib/user-profile-session-storage";

vi.mock("@/lib/apis/user-profile-api", () => ({
  fetchUserProfile: vi.fn(),
}));

vi.mock("@/lib/locale-cookie", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/locale-cookie")>();
  return {
    ...actual,
    getPreferredLocalePath: vi.fn(() => null),
  };
});

const profileWithParent = {
  isMultipleParent: false,
  isDomainRestricted: false,
  parentContact: [
    {
      id: "p1",
      childContacts: [
        {
          id: "c1",
          account: {
            id: "a1",
            displayName: "Acme",
            ebsPartyNumber: "1",
          },
          jobRole: "",
        },
      ],
    },
  ],
  leads: [],
  userPreference: { defaultLanguage: "en" },
};

const profileNoParent = {
  isMultipleParent: false,
  isDomainRestricted: false,
  parentContact: [] as { id: string; childContacts?: unknown[] }[],
  leads: [{ id: "lead-1" }],
};

describe("isContactSupportOnlyProfile", () => {
  it("returns true when isMultipleParent is set", () => {
    expect(isContactSupportOnlyProfile({ isMultipleParent: true, isDomainRestricted: false })).toBe(
      true
    );
  });

  it("returns true when isDomainRestricted is set", () => {
    expect(isContactSupportOnlyProfile({ isMultipleParent: false, isDomainRestricted: true })).toBe(
      true
    );
  });

  it("returns false for a standard profile", () => {
    expect(
      isContactSupportOnlyProfile({ isMultipleParent: false, isDomainRestricted: false })
    ).toBe(false);
  });
});

describe("isAccountSubmittedProfile", () => {
  it("returns true when profile has leads", () => {
    expect(isAccountSubmittedProfile({ leads: [{ id: "lead-1" }] } as never)).toBe(true);
  });

  it("returns false when leads are empty or missing", () => {
    expect(isAccountSubmittedProfile({ leads: [] } as never)).toBe(false);
    expect(isAccountSubmittedProfile(null)).toBe(false);
  });
});

describe("isPortalAccessDeniedProfile", () => {
  it("returns true for contact-support, sign-in-error, and lead-only profiles", () => {
    expect(
      isPortalAccessDeniedProfile({
        isMultipleParent: true,
        isDomainRestricted: false,
      } as never)
    ).toBe(true);
    expect(
      isPortalAccessDeniedProfile({
        parentContact: null,
        leads: null,
      } as never)
    ).toBe(true);
    expect(isPortalAccessDeniedProfile(profileNoParent as never)).toBe(true);
  });

  it("returns false for a standard profile with parent contact", () => {
    expect(isPortalAccessDeniedProfile(profileWithParent as never)).toBe(false);
  });
});

describe("isPublicRoute", () => {
  it("does not allow direct public access to contact-support", () => {
    expect(isPublicRoute("/contact-support")).toBe(false);
    expect(isPublicRoute("/en/contact-support")).toBe(false);
  });
});

describe("resolvePostLoginDestination", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(fetchUserProfile).mockReset();
  });

  it("returns contact-support when profile is contact-support only", async () => {
    vi.mocked(fetchUserProfile).mockResolvedValue({
      ...profileWithParent,
      isMultipleParent: true,
      isDomainRestricted: false,
    } as never);

    const destination = await resolvePostLoginDestination({
      userEmail: "restricted@example.com",
      explicitReturnUrl: "/orders-management/orders",
    });

    expect(destination).toBe("/contact-support");
  });

  it("returns account-submitted when profile has no parent contact", async () => {
    vi.mocked(fetchUserProfile).mockResolvedValue(profileNoParent as never);

    const destination = await resolvePostLoginDestination({
      userEmail: "lead@example.com",
    });

    expect(destination).toBe("/account-submitted");
  });

  it("returns default path when profile has parent contact and no explicit returnUrl", async () => {
    vi.mocked(fetchUserProfile).mockResolvedValue(profileWithParent as never);

    const destination = await resolvePostLoginDestination({
      userEmail: "employee@intralox.com",
    });

    expect(destination).toBe("/");
  });

  it("prefers explicit returnUrl when it is valid and profile has parent contact", async () => {
    vi.mocked(fetchUserProfile).mockResolvedValue(profileWithParent as never);

    const destination = await resolvePostLoginDestination({
      userEmail: "employee@intralox.com",
      explicitReturnUrl: "/profile",
    });

    expect(destination).toBe("/profile");
  });

  it("ignores explicit callback returnUrl to prevent redirect loops", async () => {
    vi.mocked(fetchUserProfile).mockResolvedValue(profileWithParent as never);

    const destination = await resolvePostLoginDestination({
      userEmail: "employee@intralox.com",
      explicitReturnUrl: "/authorization/verify?code=abc",
    });

    expect(destination).toBe("/");
  });

  it("uses stored returnUrl when explicit returnUrl is not provided", async () => {
    sessionStorage.setItem("login_return_url", "/saved-page");
    vi.mocked(fetchUserProfile).mockResolvedValue(profileWithParent as never);

    const destination = await resolvePostLoginDestination({
      userEmail: "employee@intralox.com",
    });

    expect(destination).toBe("/saved-page");
  });

  it("ignores stored callback returnUrl and falls back to default destination", async () => {
    sessionStorage.setItem("login_return_url", "/authorization/verify?state=abc");
    vi.mocked(fetchUserProfile).mockResolvedValue(profileWithParent as never);

    const destination = await resolvePostLoginDestination({
      userEmail: "employee@intralox.com",
    });

    expect(destination).toBe("/");
  });

  it("stores profile in sessionStorage after fetch (client)", async () => {
    vi.mocked(fetchUserProfile).mockResolvedValue(profileWithParent as never);

    await resolvePostLoginDestination({
      userEmail: "employee@intralox.com",
    });

    const raw = sessionStorage.getItem(USER_PROFILE_SESSION_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string) as { profile: { parentContact: unknown[] } };
    expect(parsed.profile.parentContact?.length).toBeGreaterThan(0);
  });

  it("redirects to signin-error when profile fetch throws", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(fetchUserProfile).mockRejectedValue(new Error("403"));

    const destination = await resolvePostLoginDestination({
      userEmail: "employee@intralox.com",
    });

    expect(destination).toBe("/signin-error");
    expect(sessionStorage.getItem(USER_PROFILE_SESSION_KEY)).toBeNull();
    vi.mocked(console.warn).mockRestore();
  });

  it("redirects to signin-error when parentContact and leads are null", async () => {
    vi.mocked(fetchUserProfile).mockResolvedValue({
      isMultipleParent: false,
      isDomainRestricted: false,
      parentContact: null,
      leads: null,
    } as never);

    const destination = await resolvePostLoginDestination({
      userEmail: "unknown@example.com",
    });

    expect(destination).toBe("/signin-error");
  });
});
