import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import UserProfileMenuContent from "components/core/UserProfileMenu/variants/UserProfileMenuContent";
import type { IUserProfileMenuFields } from "components/core/UserProfileMenu/UserProfileMenu.type";
import type { UseDeviceTypeResult } from "@/hooks/use-device-type";
import type { ProfileAccount } from "@/lib/profile-context";

const { mockOpenMobileLanguageDrawer, mockOpenMobileContactDrawer, mockUseDeviceType } = vi.hoisted(() => ({
  mockOpenMobileLanguageDrawer: vi.fn(),
  mockOpenMobileContactDrawer: vi.fn(),
  mockUseDeviceType: vi.fn(
    (): UseDeviceTypeResult => ({
      device: "desktop",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    })
  ),
}));

vi.mock("@/hooks/use-device-type", () => ({
  useDeviceType: () => mockUseDeviceType(),
}));

vi.mock("@/lib/language-selection-modal-context", () => ({
  LanguageSelectionModalProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useLanguageSelectionModal: () => ({
    registerLanguageSwitcherFields: vi.fn(),
    setLanguageSwitcherDisabled: vi.fn(),
    isLanguageSwitcherDisabled: false,
    openMobileLanguageDrawer: mockOpenMobileLanguageDrawer,
    closeMobileLanguageDrawer: vi.fn(),
    isMobileLanguageDrawerOpen: false,
    registeredFields: null,
  }),
}));

vi.mock("@/lib/contact-support-modal-context", () => ({
  ContactSupportModalProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useContactSupportModal: () => ({
    registerContactSupportFields: vi.fn(),
    openMobileContactDrawer: mockOpenMobileContactDrawer,
    closeMobileContactDrawer: vi.fn(),
    isMobileContactDrawerOpen: false,
    registeredFields: null,
  }),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, className, width, height, alt, ...rest }: any) =>
    field?.value?.src ? (
      <img
        src={field.value.src}
        alt={alt || field.value.alt || ""}
        className={className}
        width={width}
        height={height}
        data-testid="content-sdk-image"
        {...rest}
      />
    ) : null,
  Text: ({ field, tag: Tag = "span", className }: any) =>
    field?.value ? (
      <Tag className={className} data-testid="content-sdk-text">
        {field.value}
      </Tag>
    ) : null,
  Link: ({ field, className, children }: any) =>
    field?.value?.href ? (
      <a href={field.value.href} className={className} data-testid="content-sdk-link">
        {children}
      </a>
    ) : null,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({ children, onPress, className, role, type, ...rest }: any) => (
    <button type={type ?? "button"} onClick={onPress} className={className} role={role} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className, onClick, ...rest }: any) => {
    const nextHref = typeof href === "string" ? href : href?.pathname;
    return (
      <a
        href={nextHref ?? "#"}
        className={className}
        onClick={(event: any) => {
          event.preventDefault();
          onClick?.(event);
        }}
        {...rest}
      >
        {children}
      </a>
    );
  },
}));

vi.mock("@/components/ui/Heading", () => ({
  default: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
}));

const baseFields = (): IUserProfileMenuFields => ({
  CompanyIcon: {
    value: { src: "/co.png", alt: "Co", width: 16, height: 16 },
  },
  ActiveAccountIcon: {
    value: { src: "/active-account.png", alt: "Selected", width: 14, height: 14 },
  },
  SectionTitle: { value: "Accounts" },
  SingleAccountTitle: { value: "Logged in as" },
  AccountInfo: { value: "Info" },
  SignOutIcon: { value: { src: "/so.png", alt: "Out", width: 16, height: 16 } },
  SignOutText: { value: "Sign Out" },
  AccountAddress: { value: "" },
  ProfileItems: [],
});

const account = (id: string, companyName: string): ProfileAccount => ({
  id,
  companyName,
  address: "Addr",
  accountNumber: "",
  isActive: true,
  role: "R",
  organization: "O",
});

describe("UserProfileMenuContent", () => {
  const onAccountSelect = vi.fn();
  const onCloseMenu = vi.fn();
  const onProfileItemActivate = vi.fn();
  const onSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeviceType.mockReturnValue({
      device: "desktop",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });

  it("renders single-account layout with ActiveAccountIcon and company icon", () => {
    render(
      <UserProfileMenuContent
        accounts={[account("1", "Solo Co")]}
        fields={baseFields()}
        selectedAccount={account("1", "Solo Co")}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByText("Logged in as")).toBeInTheDocument();
    expect(screen.getByText("Solo Co")).toBeInTheDocument();
    const imgs = screen.getAllByTestId("content-sdk-image");
    expect(imgs.some((img) => img.getAttribute("src") === "/co.png")).toBe(true);
    expect(imgs.some((img) => img.getAttribute("src") === "/active-account.png")).toBe(true);
  });

  it("uses custom single-account heading when provided", () => {
    render(
      <UserProfileMenuContent
        accounts={[account("1", "Solo Co")]}
        fields={{ ...baseFields(), SingleAccountTitle: { value: "Signed in" } }}
        selectedAccount={account("1", "Solo Co")}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByText("Signed in")).toBeInTheDocument();
  });

  it("renders multi-account list with section title and selection", async () => {
    const user = userEvent.setup();
    render(
      <UserProfileMenuContent
        accounts={[account("1", "A1"), account("2", "A2")]}
        fields={baseFields()}
        selectedAccount={account("1", "A1")}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByText("Accounts")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /a2/i }));
    expect(onAccountSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "2" }));
  });

  it("shows ActiveAccountIcon only on selected account in multi-account mode", () => {
    render(
      <UserProfileMenuContent
        accounts={[account("1", "A1"), account("2", "A2")]}
        fields={baseFields()}
        selectedAccount={account("1", "A1")}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
      />
    );

    const activeMarkers = screen
      .getAllByTestId("content-sdk-image")
      .filter((img) => img.getAttribute("src") === "/active-account.png");
    expect(activeMarkers).toHaveLength(1);
  });

  it("renders empty state with icon, title, and CTA", () => {
    render(
      <UserProfileMenuContent
        accounts={[]}
        fields={{
          ...baseFields(),
          NoLocationIcon: { value: { src: "/empty.png", alt: "Empty", width: 22, height: 22 } },
          NoLocationTitle: { value: "No sites" },
          NoLocationCTA: { value: { href: "/add", text: "Add location" } },
        }}
        selectedAccount={null}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
      />
    );

    const emptyImgs = screen.getAllByTestId("content-sdk-image");
    expect(emptyImgs.some((img) => img.getAttribute("src") === "/empty.png")).toBe(true);
    expect(screen.getByText("No sites")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add location/i })).toHaveAttribute("href", "/en/add");
  });

  it("hides empty-state CTA when HideCTA rendering parameter is enabled", () => {
    render(
      <UserProfileMenuContent
        accounts={[]}
        fields={{
          ...baseFields(),
          NoLocationIcon: { value: { src: "/empty.png", alt: "Empty", width: 22, height: 22 } },
          NoLocationTitle: { value: "No sites" },
          NoLocationCTA: { value: { href: "/add", text: "Add location" } },
        }}
        selectedAccount={null}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
        showEmptyStateCTA={false}
      />
    );

    expect(screen.getByText("No sites")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /add location/i })).not.toBeInTheDocument();
  });

  it("hides account section while profileLoading", () => {
    render(
      <UserProfileMenuContent
        accounts={[account("1", "A1"), account("2", "A2")]}
        fields={baseFields()}
        selectedAccount={account("1", "A1")}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
        profileLoading
      />
    );

    expect(screen.queryByText("A1")).not.toBeInTheDocument();
    expect(screen.queryByText("Accounts")).not.toBeInTheDocument();
  });

  it("renders header row with headerAction", () => {
    render(
      <UserProfileMenuContent
        accounts={[account("1", "A1"), account("2", "A2")]}
        fields={baseFields()}
        selectedAccount={account("1", "A1")}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
        headerAction={<button type="button">Close</button>}
      />
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(screen.getByText("Accounts")).toBeInTheDocument();
  });

  it("renders profile link items and sign out", () => {
    render(
      <UserProfileMenuContent
        accounts={[]}
        fields={{
          ...baseFields(),
          ProfileItems: [
            {
              id: "p1",
              name: "Profile",
              fields: {
                Link: { value: { href: "/me", text: "My profile" } },
                Title: { value: "My profile" },
                Icon: { value: { src: "/pi.png", alt: "i", width: 16, height: 16 } },
              },
            },
          ],
        }}
        selectedAccount={null}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByRole("link", { name: /my profile/i })).toHaveAttribute("href", "/en/me");
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("calls profile item analytics callback for profile settings links", async () => {
    const user = userEvent.setup();
    render(
      <UserProfileMenuContent
        accounts={[]}
        fields={{
          ...baseFields(),
          ProfileItems: [
            {
              id: "p1",
              name: "Profile Setting",
              fields: {
                Link: { value: { href: "/profile", text: "Profile Settings" } },
                Title: { value: "Profile Settings" },
                Icon: { value: { src: "/pi.png", alt: "i", width: 16, height: 16 } },
              },
            },
          ],
        }}
        selectedAccount={null}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onProfileItemActivate={onProfileItemActivate}
        onSignOut={onSignOut}
      />
    );

    await user.click(screen.getByRole("link", { name: /profile settings/i }));

    expect(onProfileItemActivate).toHaveBeenCalledWith({
      href: "/profile",
      title: "Profile Settings",
    });
    expect(onCloseMenu).toHaveBeenCalledTimes(1);
  });

  it("renders language row as button when LanguagePopup and opens language modal on click", async () => {
    mockUseDeviceType.mockReturnValue({
      device: "mobile",
      isNarrowContactViewport: true,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });
    const user = userEvent.setup();
    render(
      <UserProfileMenuContent
        accounts={[]}
        fields={{
          ...baseFields(),
          ProfileItems: [
            {
              id: "lang-item-1",
              name: "Language",
              displayName: "Language",
              fields: {
                LanguagePopup: { value: true },
                Title: { value: "Language" },
                Link: { value: { href: "" } },
                Icon: {
                  value: { src: "/lang-icon.png", alt: "Language", width: 16, height: 16 },
                },
              },
            },
          ],
        }}
        selectedAccount={null}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
      />
    );

    await user.click(screen.getByRole("button", { name: /language/i }));
    expect(onCloseMenu).toHaveBeenCalledTimes(1);
    expect(mockOpenMobileLanguageDrawer).toHaveBeenCalledTimes(1);
  });

  it("renders contact row as button when ContactPopup and opens contact modal on click", async () => {
    mockUseDeviceType.mockReturnValue({
      device: "mobile",
      isNarrowContactViewport: true,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });
    const user = userEvent.setup();
    render(
      <UserProfileMenuContent
        accounts={[]}
        fields={{
          ...baseFields(),
          ProfileItems: [
            {
              id: "contact-item-1",
              name: "Contact",
              displayName: "Contact",
              fields: {
                ContactPopup: { value: true },
                Title: { value: "Contact support" },
                Link: { value: { href: "" } },
                Icon: {
                  value: { src: "/contact-icon.png", alt: "Contact", width: 16, height: 16 },
                },
              },
            },
          ],
        }}
        selectedAccount={null}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
      />
    );

    await user.click(screen.getByRole("button", { name: /contact support/i }));
    expect(onCloseMenu).toHaveBeenCalledTimes(1);
    expect(mockOpenMobileContactDrawer).toHaveBeenCalledTimes(1);
    expect(mockOpenMobileLanguageDrawer).not.toHaveBeenCalled();
  });

  it("hides language and contact profile rows on tablet/desktop", () => {
    mockUseDeviceType.mockReturnValue({
      device: "tablet",
      isNarrowContactViewport: false,
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    });
    render(
      <UserProfileMenuContent
        accounts={[]}
        fields={{
          ...baseFields(),
          ProfileItems: [
            {
              id: "lang-item-1",
              name: "Language",
              fields: {
                LanguagePopup: { value: true },
                Title: { value: "Language" },
                Link: { value: { href: "" } },
                Icon: {
                  value: { src: "/lang-icon.png", alt: "Language", width: 16, height: 16 },
                },
              },
            },
          ],
        }}
        selectedAccount={null}
        onAccountSelect={onAccountSelect}
        onCloseMenu={onCloseMenu}
        onSignOut={onSignOut}
      />
    );

    expect(screen.queryByRole("button", { name: /language/i })).not.toBeInTheDocument();
  });
});
