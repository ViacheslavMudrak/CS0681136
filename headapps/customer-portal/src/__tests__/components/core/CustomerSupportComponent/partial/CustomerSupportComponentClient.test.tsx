import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CustomerSupportComponentClient } from "components/core/CustomerSupportComponent/partial/CustomerSupportComponentClient";
import type { CustomerSupportComponentFields } from "components/core/CustomerSupportComponent/CustomerSupportComponent.type";
import * as userProfileContext from "@/lib/user-profile-context";
import { assignPostLoginNavigation } from "@/lib/auth-utils";
import { signOutAndNavigateToLogin } from "@/lib/client-auth-sign-out";

const mockOktaAuth = { tokenManager: {} };

vi.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({ oktaAuth: mockOktaAuth }),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field }: { field?: { value?: { alt?: string } } }) => (
    <img alt={field?.value?.alt ?? ""} />
  ),
  RichText: ({ field, className }: { field?: { value?: string }; className?: string }) => (
    <span className={className}>{field?.value}</span>
  ),
  Text: ({
    field,
    tag: Tag = "span",
    className,
  }: {
    field?: { value?: string };
    tag?: keyof JSX.IntrinsicElements;
    className?: string;
  }) => <Tag className={className}>{field?.value}</Tag>,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
    <button onClick={onPress}>{children}</button>
  ),
}));

vi.mock("@/components/core/Auth/components/AuthFooter/AuthFooter", () => ({
  AuthFooterInfo: () => <div>Return to Intralox.com</div>,
}));

vi.mock("@/lib/auth-utils", () => ({
  assignPostLoginNavigation: vi.fn(),
  isContactSupportOnlyProfile: (profile: {
    isMultipleParent?: boolean;
    isRestrictedDomain?: boolean;
  } | null) => Boolean(profile?.isMultipleParent || profile?.isRestrictedDomain),
  isSignInErrorProfile: (profile: {
    parentContact?: unknown;
    leads?: unknown;
  } | null) =>
    profile != null && profile.parentContact == null && profile.leads == null,
}));

vi.mock("@/lib/client-auth-sign-out", () => ({
  signOutAndNavigateToLogin: vi.fn(),
}));

vi.mock("@/lib/user-profile-context", () => ({
  useUserProfile: vi.fn(),
}));

const fields: CustomerSupportComponentFields = {
  PageIcon: { value: { src: "/icon.svg", alt: "Support icon" } },
  Headline: { value: "Unable to verify access" },
  BodyText: { value: "We encountered an issue." },
  SupportPromptText: { value: "If you need immediate assistance," },
  SupportLinkLabel: { value: "contact customer support" },
  BackSignInButtonLabel: { value: "Back to Sign In" },
  ReturnLinkLabel: { value: "Return to Intralox.com" },
  ReturnLinkURL: { value: { href: "https://www.intralox.com" } },
};

const heading = /unable to verify access/i;

function mockUserProfile(
  overrides: Partial<ReturnType<typeof userProfileContext.useUserProfile>> = {}
) {
  return {
    profile: {
      isMultipleParent: false,
      isRestrictedDomain: false,
      parentContact: [{ id: "p1" }],
      leads: null,
    } as unknown as NonNullable<ReturnType<typeof userProfileContext.useUserProfile>["profile"]>,
    loading: false,
    error: null,
    accounts: [],
    defaultAccountId: null,
    userDisplay: null,
    hasNoAccounts: false,
    refetch: vi.fn(),
    setProfileData: vi.fn(),
    ...overrides,
  } as ReturnType<typeof userProfileContext.useUserProfile>;
}

describe("CustomerSupportComponentClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userProfileContext.useUserProfile).mockReturnValue(mockUserProfile());
  });

  describe("editing mode", () => {
    it("always renders and never redirects", () => {
      vi.mocked(userProfileContext.useUserProfile).mockReturnValue(
        mockUserProfile({ profile: null, loading: false })
      );

      render(<CustomerSupportComponentClient fields={fields} isEditing={true} />);

      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      expect(assignPostLoginNavigation).not.toHaveBeenCalled();
    });
  });

  describe("website mode", () => {
    it("renders for contact-support-only profiles and does not redirect", async () => {
      vi.mocked(userProfileContext.useUserProfile).mockReturnValue(
        mockUserProfile({
          profile: {
            isMultipleParent: true,
            isRestrictedDomain: false,
            parentContact: [{ id: "p1" }],
            leads: null,
          } as unknown as NonNullable<
            ReturnType<typeof userProfileContext.useUserProfile>["profile"]
          >,
        })
      );

      render(<CustomerSupportComponentClient fields={fields} isEditing={false} />);

      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      expect(screen.getByText(/we encountered an issue/i)).toBeInTheDocument();
      await waitFor(() => {
        expect(assignPostLoginNavigation).not.toHaveBeenCalled();
      });
      expect(signOutAndNavigateToLogin).not.toHaveBeenCalled();
    });

    it("renders for sign-in error profiles and does not redirect", async () => {
      vi.mocked(userProfileContext.useUserProfile).mockReturnValue(
        mockUserProfile({
          profile: {
            isMultipleParent: false,
            isRestrictedDomain: false,
            parentContact: null,
            leads: null,
          } as unknown as NonNullable<
            ReturnType<typeof userProfileContext.useUserProfile>["profile"]
          >,
        })
      );

      render(<CustomerSupportComponentClient fields={fields} isEditing={false} />);

      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      await waitFor(() => {
        expect(assignPostLoginNavigation).not.toHaveBeenCalled();
      });
    });

    it("renders when profile is not loaded yet and does not redirect", async () => {
      vi.mocked(userProfileContext.useUserProfile).mockReturnValue(
        mockUserProfile({ profile: null, loading: false })
      );

      render(<CustomerSupportComponentClient fields={fields} isEditing={false} />);

      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      await waitFor(() => {
        expect(assignPostLoginNavigation).not.toHaveBeenCalled();
      });
    });

    it("does not render and redirects to dashboard when profile is allowed", async () => {
      render(<CustomerSupportComponentClient fields={fields} isEditing={false} />);

      expect(screen.queryByRole("heading", { name: heading })).not.toBeInTheDocument();
      await waitFor(() => {
        expect(assignPostLoginNavigation).toHaveBeenCalledWith("/");
      });
      expect(signOutAndNavigateToLogin).not.toHaveBeenCalled();
    });

    it("does not render or redirect while profile is loading", async () => {
      vi.mocked(userProfileContext.useUserProfile).mockReturnValue(
        mockUserProfile({ loading: true })
      );

      render(<CustomerSupportComponentClient fields={fields} isEditing={false} />);

      expect(screen.queryByRole("heading", { name: heading })).not.toBeInTheDocument();
      await waitFor(() => {
        expect(assignPostLoginNavigation).not.toHaveBeenCalled();
      });
    });
  });
});
