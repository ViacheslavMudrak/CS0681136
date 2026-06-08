import type { Page } from "@sitecore-content-sdk/nextjs";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortalShellDefault from "components/core/PortalShell/variants/PortalShellDefault.variant";
import type {
  PortalShellProps,
  PortalShellFields,
} from "components/core/PortalShell/PortalShell.type";
import * as portalShellLayout from "@/lib/portal-shell-layout";
import * as userProfileContext from "@/lib/user-profile-context";

const mockGetIsRightAlignedLayout = vi.spyOn(portalShellLayout, "getIsRightAlignedLayout");

const mockAccount = {
  id: "acc-1",
  companyName: "Test Co",
  address: "",
  accountNumber: "1",
  isActive: true,
  role: "",
  organization: "",
};

function mockUserProfile(
  overrides: Partial<ReturnType<typeof userProfileContext.useUserProfile>> = {}
) {
  return {
    profile: { parentContact: [{ id: "p1" }] } as unknown as NonNullable<
      ReturnType<typeof userProfileContext.useUserProfile>["profile"]
    >,
    loading: false,
    error: null,
    accounts: [mockAccount],
    defaultAccountId: "acc-1",
    userDisplay: null,
    hasNoAccounts: false,
    refetch: vi.fn(),
    setProfileData: vi.fn(),
    ...overrides,
  } as ReturnType<typeof userProfileContext.useUserProfile>;
}

const mockUsePathname = vi.fn(() => "/en");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/shared/permissions/AccessDenied", () => ({
  default: () => (
    <section role="alert" aria-live="polite">
      <h1>Access denied</h1>
      <p>You do not have permission to view this page.</p>
    </section>
  ),
}));

vi.mock("@/hooks/useDashboardPageViewAnalytics", () => ({
  useDashboardPageViewAnalytics: vi.fn(),
}));

vi.mock("@/lib/user-profile-context", () => ({
  useUserProfile: vi.fn(() => mockUserProfile()),
}));

vi.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({ oktaAuth: null }),
}));

vi.mock("@/lib/okta-auth-client", async (importOriginal) => {
  const { createOktaAuthClientVitestMock } = await import("@/test/mocks/okta-auth-client-vitest");
  return createOktaAuthClientVitestMock(importOriginal);
});

vi.mock("next-intl", () => ({
  hasLocale: (_locales: readonly string[], locale: string) => ["en", "en-CA"].includes(locale),
  useTranslations: () => (key: string) => key,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  AppPlaceholder: ({
    name,
  }: {
    name: string;
    rendering: unknown;
    page: unknown;
    componentMap: unknown;
  }) => <div data-testid={`placeholder-${name}`}>Placeholder: {name}</div>,
}));

vi.mock("@/lib/portal-shell-layout", () => ({
  getIsRightAlignedLayout: vi.fn(),
}));

vi.mock("@/components/shared/icons/HamburgerMenuIcon", () => ({
  default: ({
    width,
    height,
    className,
  }: {
    width?: number;
    height?: number;
    className?: string;
  }) => (
    <svg data-testid="hamburger-icon" width={width} height={height} className={className}>
      <path />
    </svg>
  ),
}));

vi.mock("@/components/shared/icons/CloseIcon", () => ({
  default: ({
    width,
    height,
    className,
  }: {
    width?: number;
    height?: number;
    className?: string;
  }) => (
    <svg data-testid="close-icon" width={width} height={height} className={className}>
      <path />
    </svg>
  ),
}));

describe("PortalShellDefaultVariant", () => {
  const mockRendering = {
    componentName: "PortalShell",
    placeholders: { Top: [], SideNav: [], Content: [] },
  };

  const mockPage = {
    locale: "en",
    mode: {
      isEditing: false,
      isDesignLibrary: false,
      name: "normal",
      designLibrary: { isVariantGeneration: false },
      isNormal: true,
      isPreview: false,
    },
    layout: {
      sitecore: {
        route: { itemLanguage: "en" },
        context: { language: "en" },
      },
    },
  } as unknown as Page;

  const mockParams = {
    styles: "test-styles",
    RenderingIdentifier: "test-id",
  };

  const mockFields: PortalShellFields = {
    Title: { value: "Portal" },
    data: { item: { children: { results: [] } } },
  };

  const defaultProps: PortalShellProps = {
    rendering: mockRendering,
    page: mockPage,
    params: mockParams,
    fields: mockFields,
    componentMap: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/en");
    mockGetIsRightAlignedLayout.mockReturnValue(false);
    vi.mocked(userProfileContext.useUserProfile).mockImplementation(() => mockUserProfile());
  });

  it("should render shell structure with header, aside, and main", () => {
    render(<PortalShellDefault {...defaultProps} />);

    expect(document.querySelector("header")).toBeInTheDocument();
    expect(document.querySelector("aside")).toBeInTheDocument();
    expect(document.querySelector("main")).toBeInTheDocument();
  });

  it("should render shell skeleton chrome when profile is loading", () => {
    vi.mocked(userProfileContext.useUserProfile).mockImplementation(() =>
      mockUserProfile({ loading: true, profile: null })
    );

    render(<PortalShellDefault {...defaultProps} />);

    expect(screen.getByTestId("portal-shell-loading")).toBeInTheDocument();
    expect(document.querySelector("header")).toBeInTheDocument();
    expect(document.querySelector("aside")).toBeInTheDocument();
    const main = document.querySelector("main[aria-busy='true']");
    expect(main).toBeInTheDocument();
    expect(screen.queryByTestId("placeholder-Top")).not.toBeInTheDocument();
  });

  it("should render Top, SideNav, and Content placeholders", () => {
    render(<PortalShellDefault {...defaultProps} />);

    expect(screen.getByTestId("placeholder-Top")).toBeInTheDocument();
    expect(screen.getByTestId("placeholder-SideNav")).toBeInTheDocument();
    expect(screen.getByTestId("placeholder-Content")).toBeInTheDocument();
  });

  it("should render only Content placeholder for contact-support page", () => {
    mockUsePathname.mockReturnValue("/en/contact-support");

    render(<PortalShellDefault {...defaultProps} />);

    expect(screen.getByTestId("placeholder-Content")).toBeInTheDocument();
    expect(screen.queryByTestId("placeholder-Top")).not.toBeInTheDocument();
    expect(screen.queryByTestId("placeholder-SideNav")).not.toBeInTheDocument();
    expect(document.querySelector("header")).not.toBeInTheDocument();
    expect(document.querySelector("aside")).not.toBeInTheDocument();
  });

  it("should show menu toggle button with Open navigation menu when closed", () => {
    render(<PortalShellDefault {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /open navigation menu/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("should toggle to close icon and Close navigation menu when menu button is clicked", async () => {
    const user = userEvent.setup();
    render(<PortalShellDefault {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /open navigation menu/i });
    await user.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(menuButton).toHaveAttribute("aria-label", "Close navigation menu");
    expect(screen.getByTestId("close-icon")).toBeInTheDocument();
  });

  it("should show overlay when side nav is open", async () => {
    const user = userEvent.setup();
    render(<PortalShellDefault {...defaultProps} />);

    const menuButton = screen.getByRole("button", { name: /open navigation menu/i });
    await user.click(menuButton);

    const closeButtons = screen.getAllByRole("button", { name: /close navigation menu/i });
    const overlayButton = closeButtons.find((el) => el !== menuButton);
    expect(overlayButton).toBeInTheDocument();
  });

  it("should close side nav when overlay is clicked", async () => {
    const user = userEvent.setup();
    render(<PortalShellDefault {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /open navigation menu/i }));
    const overlayButtons = screen.getAllByRole("button", { name: /close navigation menu/i });
    const overlayButton = overlayButtons[overlayButtons.length - 1];
    await user.click(overlayButton);

    expect(screen.getByRole("button", { name: /open navigation menu/i })).toBeInTheDocument();
  });

  it('should set dir="ltr" when getIsRightAlignedLayout returns false', () => {
    mockGetIsRightAlignedLayout.mockReturnValue(false);
    render(<PortalShellDefault {...defaultProps} />);

    const shell = document.querySelector("[dir]");
    expect(shell).toHaveAttribute("dir", "ltr");
  });

  it('should set dir="rtl" when getIsRightAlignedLayout returns true', () => {
    mockGetIsRightAlignedLayout.mockReturnValue(true);
    render(<PortalShellDefault {...defaultProps} />);

    const shell = document.querySelector("[dir]");
    expect(shell).toHaveAttribute("dir", "rtl");
  });

  it("should apply RTL layout classes and open side nav when toggled in RTL", async () => {
    const user = userEvent.setup();
    mockGetIsRightAlignedLayout.mockReturnValue(true);
    render(<PortalShellDefault {...defaultProps} />);

    const shell = document.querySelector('[dir="rtl"]');
    expect(shell).toBeInTheDocument();

    const main = document.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("dir", "rtl");

    const menuButton = screen.getByRole("button", { name: /open navigation menu/i });
    await user.click(menuButton);

    const aside = document.querySelector("aside");
    expect(aside).toHaveClass("translate-x-0");
    expect(aside).toHaveAttribute("aria-hidden", "false");
  });

  it("should set aside aria-hidden to true when closed", () => {
    render(<PortalShellDefault {...defaultProps} />);

    const aside = document.querySelector("aside");
    expect(aside).toHaveAttribute("aria-hidden", "true");
  });

  it("should set aside aria-hidden to false when side nav is open", async () => {
    const user = userEvent.setup();
    render(<PortalShellDefault {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /open navigation menu/i }));

    const aside = document.querySelector("aside");
    expect(aside).toHaveAttribute("aria-hidden", "false");
  });

  it("should handle empty or missing fields gracefully", () => {
    const minimalProps: PortalShellProps = {
      ...defaultProps,
      fields: {} as PortalShellFields,
      componentMap: {},
    };

    expect(() => render(<PortalShellDefault {...minimalProps} />)).not.toThrow();
    expect(screen.getByTestId("placeholder-Top")).toBeInTheDocument();
  });

  it("should render AccessDenied when profile has leads only", () => {
    vi.mocked(userProfileContext.useUserProfile).mockImplementation(() =>
      mockUserProfile({
        profile: {
          parentContact: [],
          leads: [{ id: "lead-1" }],
          isMultipleParent: false,
          isDomainRestricted: false,
        } as unknown as NonNullable<
          ReturnType<typeof userProfileContext.useUserProfile>["profile"]
        >,
      })
    );

    render(<PortalShellDefault {...defaultProps} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.queryByTestId("placeholder-Top")).not.toBeInTheDocument();
  });

  it("should render AccessDenied when profile is contact-support only", () => {
    vi.mocked(userProfileContext.useUserProfile).mockImplementation(() =>
      mockUserProfile({
        profile: {
          parentContact: [{ id: "p1" }],
          isMultipleParent: true,
          isDomainRestricted: false,
        } as unknown as NonNullable<
          ReturnType<typeof userProfileContext.useUserProfile>["profile"]
        >,
      })
    );

    render(<PortalShellDefault {...defaultProps} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.queryByTestId("placeholder-Top")).not.toBeInTheDocument();
  });

  it("should render shell in Experience Editor when profile is contact-support only", () => {
    vi.mocked(userProfileContext.useUserProfile).mockImplementation(() =>
      mockUserProfile({
        profile: {
          parentContact: [{ id: "p1" }],
          isMultipleParent: true,
          isDomainRestricted: false,
        } as unknown as NonNullable<
          ReturnType<typeof userProfileContext.useUserProfile>["profile"]
        >,
      })
    );

    const editingProps: PortalShellProps = {
      ...defaultProps,
      page: {
        ...mockPage,
        mode: {
          isEditing: true,
          isDesignLibrary: false,
          name: "edit",
          designLibrary: { isVariantGeneration: false },
          isNormal: true,
          isPreview: true,
        } as Page["mode"],
      },
    };

    render(<PortalShellDefault {...editingProps} />);

    expect(screen.getByTestId("placeholder-Top")).toBeInTheDocument();
  });
});
