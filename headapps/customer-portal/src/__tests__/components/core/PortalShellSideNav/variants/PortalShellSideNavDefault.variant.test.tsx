import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortalShellSideNavDefault from "components/core/PortalShellSideNav/variants/PortalShellSideNavDefault.variant";
import { TEST_CASE_DATA_IDS } from "../../../../../helpers/enums";
import * as cdpModule from "@/lib/CDPEvents";
import * as gtmModule from "@/lib/gtm";
import * as accountSwitchEvents from "@/lib/account-switch-events";
import type {
  PortalShellSideNavFields,
  PortalShellNavSection,
  PortalShellNavItem,
} from "components/core/PortalShellSideNav/PortalShellSideNav.type";

const {
  mockSaveUserPreferences,
  mockPermissionContextValue,
  mockProfileSlice,
  mockCompleteAccountSwitchAfterPreferenceSave,
} = vi.hoisted(() => {
  const mockSaveUserPreferences = vi.fn().mockResolvedValue(null);
  const mockCanAny = vi.fn(() => true);
  const mockPermissionContextValue = {
    grantedCodes: new Set<string>(),
    isLoading: false,
    hasResolved: true,
    error: null,
    refresh: vi.fn(),
    can: vi.fn(() => true),
    canAny: mockCanAny,
    canAll: vi.fn(() => true),
    sitecoreEditingPermissionBypass: false,
  };
  const mockProfileSlice = {
    currentLanguage: "",
    selectedAccount: null as null | { id: string },
    setCurrentLanguage: vi.fn(),
    setSelectedAccount: vi.fn(),
  };
  const mockCompleteAccountSwitchAfterPreferenceSave = vi.fn();
  return {
    mockSaveUserPreferences,
    mockPermissionContextValue,
    mockProfileSlice,
    mockCompleteAccountSwitchAfterPreferenceSave,
  };
});

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockT = vi.fn((key: string) => key);
vi.mock("next-intl", () => ({
  useTranslations: () => mockT,
  hasLocale: vi.fn(() => false),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, alt, width, height, className }: any) => {
    if (!field?.value?.src) return null;
    return (
      <img
        src={field.value.src}
        alt={(alt ?? field.value.alt ?? "") as string}
        width={width}
        height={height}
        className={className}
        data-testid="content-sdk-image"
      />
    );
  },
  Text: ({ field, tag: Tag = "div", className }: any) => {
    if (!field?.value) return null;
    return (
      <Tag className={className} data-testid="content-sdk-text">
        {field.value}
      </Tag>
    );
  },
  Link: ({ field, className, children }: any) => {
    const href = field?.value?.href ?? field?.value?.url ?? "#";
    return (
      <a href={href} className={className} data-testid="content-sdk-link">
        {children ?? field?.value?.text}
      </a>
    );
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className, onClick, ...rest }: any) => (
    <a
      href={href ?? "#"}
      className={className}
      data-testid="next-link"
      onClick={(event: any) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

/** Avoid pulling `@laitram-l-l-c/intralox-ui-components` (very large) into the Vitest bundle. */
vi.mock("@/components/ui/Button", () => ({
  default: ({ children, onPress, className, ...rest }: any) => (
    <button type="button" onClick={onPress} className={className} data-testid="ui-button" {...rest}>
      {children}
    </button>
  ),
}));

/** Avoid `LinkRender` → Sitecore `Link` + `useActiveLocale` → `i18n/routing` in the test graph. */
vi.mock("@/components/shared/link-render/LinkRender", () => ({
  LinkRender: ({ field, children, className }: any) => {
    const href = field?.value?.href ?? field?.value?.url ?? "#";
    return (
      <a href={href} className={className} data-testid="link-render-mock">
        {children ?? field?.value?.text}
      </a>
    );
  },
}));

vi.mock("@/hooks/use-active-locale", () => ({
  useActiveLocale: () => "en",
}));

vi.mock("@/components/shared/icons", () => ({
  ChevronDownIcon: ({ width, height }: any) => (
    <span data-testid="chevron-down-icon" style={{ width, height }} aria-hidden />
  ),
}));

const mockAccounts = [
  {
    id: "1",
    companyName: "Intralox LLC",
    address: "",
    accountNumber: "123",
    isActive: true,
    role: "",
    organization: "Intralox",
  },
];
const mockUseUserProfile = vi.fn(() => ({
  profile: null,
  loading: false,
  error: null,
  accounts: mockAccounts,
  defaultAccountId: "1",
  userDisplay: null,
  refetch: vi.fn(),
  setProfileData: vi.fn(),
}));
vi.mock("@/lib/user-profile-context", () => ({
  useUserProfile: () => mockUseUserProfile(),
}));

vi.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({
    authState: { idToken: { claims: { email: "user@example.com" } } },
  }),
}));

vi.mock("@/lib/account-switch-events", () => ({
  fireAccountSwitchEvents: vi.fn(),
  fireEnhancedAccountSwitchEvent: vi.fn(),
}));

vi.mock("@/lib/CDPEvents", () => ({
  sendAccountMenuOpenedEvent: vi.fn(),
  sendNavigationMenuClickEvent: vi.fn(),
}));

vi.mock("@/lib/gtm", () => ({
  logGTMAccountMenuOpened: vi.fn(),
  logGTMNavigationMenuClick: vi.fn(),
}));

vi.mock("@/lib/account-switch-navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/account-switch-navigation")>();
  return {
    ...actual,
    completeAccountSwitchAfterPreferenceSave: mockCompleteAccountSwitchAfterPreferenceSave,
  };
});

vi.mock("@/lib/apis/user-preference-api", () => ({
  saveUserPreferences: (...args: unknown[]) => mockSaveUserPreferences(...args),
}));

vi.mock("@/lib/profile-context", () => ({
  useProfileContext: () => mockProfileSlice,
  useProfileContextOptional: () => mockProfileSlice,
}));

vi.mock("@/lib/permission-context", () => ({
  usePermissionContext: () => mockPermissionContextValue,
}));

vi.mock("components/core/PortalShellSideNav/components/SwitchCompanyModal", () => ({
  SwitchCompanyModal: ({
    isOpen,
    onClose,
    accounts,
    currentAccountId,
    onSelectAccount,
  }: any) =>
    isOpen ? (
      <div role="dialog" aria-modal="true" aria-labelledby="switch-company-title">
        <span id="switch-company-title">Switch Company Location</span>
        <button type="button" onClick={onClose} aria-label="Close">
          Close
        </button>
        {accounts.map((acc: any) => (
          <button
            key={acc.id}
            type="button"
            onClick={() => onSelectAccount(acc.id)}
            data-account-id={acc.id}
          >
            {acc.companyName} ({acc.accountNumber})
          </button>
        ))}
        <button
          type="button"
          data-testid="select-unknown-account"
          onClick={() => onSelectAccount("__unknown__")}
        >
          Select unknown account
        </button>
      </div>
    ) : null,
}));

describe("PortalShellSideNavDefaultVariant", () => {
  const createMockNavItem = (
    overrides: Partial<PortalShellNavItem> & { id: string }
  ): PortalShellNavItem => ({
    ...overrides,
    id: overrides.id,
    url: overrides.url ?? "#",
    name: overrides.name ?? "item",
    displayName: overrides.displayName ?? overrides.name ?? "Item",
    fields: {
      Title: { value: overrides.fields?.Title?.value ?? overrides.displayName ?? "Item" },
      URL: { value: { href: overrides.fields?.URL?.value?.href ?? "/item" } },
      ...overrides.fields,
    },
  });

  const createMockSection = (
    id: string,
    title: string,
    items: PortalShellNavItem[]
  ): PortalShellNavSection => ({
    id,
    url: "#",
    name: id,
    displayName: title,
    fields: {
      SectionTitle: { value: title },
      SubNavigationItems: items,
    },
  });

  const createMockFields = (overrides?: Partial<PortalShellSideNavFields>): PortalShellSideNavFields => ({
    CopyrightText: { value: "© {current_year} Intralox" },
    WebsiteURL: { value: { href: "https://www.intralox.com", text: "intralox.com" } },
    NavigationSection: [
      createMockSection("general", "General", [
        createMockNavItem({ id: "home", name: "Home", displayName: "Home", fields: { Title: { value: "Home" }, URL: { value: { href: "/" } } } }),
      ]),
    ],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockT.mockImplementation((key: string) => key);
    mockSaveUserPreferences.mockResolvedValue(null);
    mockProfileSlice.currentLanguage = "";
    mockProfileSlice.selectedAccount = null;
    mockUseUserProfile.mockImplementation(() => ({
      profile: null,
      loading: false,
      error: null,
      accounts: mockAccounts,
      defaultAccountId: "1",
      userDisplay: null,
      refetch: vi.fn(),
      setProfileData: vi.fn(),
    }));
  });

  describe("Component rendering", () => {
    it("should render empty aside with test id and aria-label when fields is null", () => {
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={null}
        />
      );

      const aside = screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV);
      expect(aside).toBeInTheDocument();
      expect(aside.tagName).toBe("ASIDE");
      expect(aside).toHaveAttribute("aria-label", "Portal navigation");
      expect(aside.children.length).toBe(0);
    });

    it("should render aside with test id and aria-label when fields are provided", () => {
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      const aside = screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV);
      expect(aside).toBeInTheDocument();
      expect(aside).toHaveAttribute("aria-label", "Portal navigation");
    });

    it("should render account context with current company name", () => {
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      expect(screen.getByText("Intralox LLC")).toBeInTheDocument();
    });

    it("should render navigation section from fields", () => {
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      expect(screen.getByText("General")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("should fire select content analytics when a main nav item is clicked", async () => {
      const user = userEvent.setup();
      const fields = createMockFields({
        NavigationSection: [
          createMockSection("general", "General", [
            createMockNavItem({
              id: "orders",
              displayName: "Orders",
              fields: { Title: { value: "Orders" }, URL: { value: { href: "/orders" } } },
            }),
          ]),
        ],
      });

      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      await user.click(screen.getByRole("link", { name: "Orders" }));

      expect(gtmModule.logGTMNavigationMenuClick).toHaveBeenCalledWith(
        expect.objectContaining({
          interaction_type: "menu_clicked",
          menu_item: "Orders",
          menu_section: "GENERAL",
        })
      );
      expect(cdpModule.sendNavigationMenuClickEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          interaction_type: "menu_clicked",
          menu_item: "Orders",
          menu_section: "GENERAL",
        })
      );
    });

    it("should render footer with copyright and website link", () => {
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      const year = new Date().getFullYear();
      expect(screen.getByText(`© ${year} Intralox`)).toBeInTheDocument();
      const websiteLink = screen.getByRole("link", { name: /intralox\.com/i });
      expect(websiteLink).toBeInTheDocument();
      expect(websiteLink).toHaveAttribute("href", "https://www.intralox.com");
    });

    it("should render section title from SectionTitle when provided", () => {
      const fields = createMockFields({
        NavigationSection: [
          createMockSection("admin", "Admin", []),
        ],
      });
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      expect(screen.getByText("Admin")).toBeInTheDocument();
    });
  });

  describe("Switch Company modal", () => {
    it("should open dialog when account context button is clicked", async () => {
      const user = userEvent.setup();
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      const accountButton = screen.getByRole("button", { name: /intralox llc/i });
      await user.click(accountButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should fire account menu opened analytics when account context opens", async () => {
      const user = userEvent.setup();
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      await user.click(screen.getByRole("button", { name: /intralox llc/i }));

      expect(gtmModule.logGTMAccountMenuOpened).toHaveBeenCalledWith({
        interaction_type: "account_menu_opened",
        source: "left_nav",
        account_count: 1,
      });
      expect(cdpModule.sendAccountMenuOpenedEvent).toHaveBeenCalledWith({
        interaction_type: "account_menu_opened",
        source: "left_nav",
        account_count: 1,
      });
    });

    it("should show modal with title when open", async () => {
      const user = userEvent.setup();
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      await user.click(screen.getByRole("button", { name: /intralox llc/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Switch Company Location")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have aside with aria-label for portal navigation", () => {
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      // <aside> has implicit role "complementary", not "navigation"
      const aside = screen.getByRole("complementary", { name: "Portal navigation" });
      expect(aside).toBeInTheDocument();
    });

    it("should have account context button with aria-haspopup dialog", () => {
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      const accountButton = screen.getByRole("button", { name: /intralox llc/i });
      expect(accountButton).toHaveAttribute("aria-haspopup", "dialog");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty NavigationSection", () => {
      const fields = createMockFields({ NavigationSection: [] });
      expect(() =>
        render(
          <PortalShellSideNavDefault
            testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
            fields={fields}
          />
        )
      ).not.toThrow();
      expect(screen.getByText("Intralox LLC")).toBeInTheDocument();
      expect(screen.getByText(`© ${new Date().getFullYear()} Intralox`)).toBeInTheDocument();
    });

    it("should handle partial fields without throwing", () => {
      const partialFields = {
        CopyrightText: { value: "© Test" },
      } as unknown as PortalShellSideNavFields;

      expect(() =>
        render(
          <PortalShellSideNavDefault
            testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
            fields={partialFields}
          />
        )
      ).not.toThrow();
    });

    it("should replace {current_year} in copyright with current year", () => {
      const fields = createMockFields({
        CopyrightText: { value: "© {current_year} Acme Corp" },
      });
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      const year = new Date().getFullYear();
      expect(screen.getByText(`© ${year} Acme Corp`)).toBeInTheDocument();
    });

    it("should render no-company block when profile has no accounts", () => {
      mockUseUserProfile.mockImplementation(() => ({
        profile: null,
        loading: false,
        error: null,
        accounts: [],
        defaultAccountId: undefined,
        userDisplay: null,
        refetch: vi.fn(),
        setProfileData: vi.fn(),
      }));

      const fields = createMockFields({
        NoCompanyIcon: {
          value: { src: "/no-company.png", alt: "No company" },
        },
        NoCompanyTitle: { value: "No locations" },
        NoCompanyUrl: {
          value: { href: "/help", text: "Get help" },
        },
      });

      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      expect(screen.queryByText("Intralox LLC")).not.toBeInTheDocument();
      expect(screen.getByText("No locations")).toBeInTheDocument();
      const cta = screen.getByRole("link", { name: "Get help" });
      expect(cta).toHaveAttribute("href", "/help");
    });

    it("should fall back to section displayName when SectionTitle is missing", () => {
      const section: PortalShellNavSection = {
        id: "sec1",
        url: "#",
        name: "sec1",
        displayName: "Fallback Section Name",
        fields: {
          SubNavigationItems: [
            createMockNavItem({
              id: "only",
              displayName: "Only Link",
              fields: { Title: { value: "Only Link" }, URL: { value: { href: "/only" } } },
            }),
          ],
        },
      };

      const fields = createMockFields({
        NavigationSection: [section],
      });

      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      expect(screen.getByText("Fallback Section Name")).toBeInTheDocument();
    });

    it("should keep ShowExpandMenu group expanded when parent row is clicked", async () => {
      const user = userEvent.setup();
      const child = createMockNavItem({
        id: "child",
        displayName: "Child",
        fields: { Title: { value: "Child Page" }, URL: { value: { href: "/child" } } },
      });
      const parent = createMockNavItem({
        id: "parent",
        displayName: "Parent",
        fields: {
          Title: { value: "Parent" },
          URL: { value: { href: "#" } },
          ShowExpandMenu: { value: true },
          SubNavigationItems: [child],
        },
      });

      const fields = createMockFields({
        NavigationSection: [createMockSection("general", "General", [parent])],
      });

      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      const expandButton = screen.getByRole("button", { name: /parent/i });
      expect(expandButton).toHaveAttribute("aria-expanded", "true");
      await user.click(expandButton);
      expect(expandButton).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("link", { name: "Child Page" })).toBeInTheDocument();
    });

    it("should render expandable nav group open by default when ShowExpandMenu is true", () => {
      const child = createMockNavItem({
        id: "child",
        displayName: "Child",
        fields: { Title: { value: "Child Page" }, URL: { value: { href: "/child" } } },
      });
      const parent = createMockNavItem({
        id: "parent",
        displayName: "Parent",
        fields: {
          Title: { value: "Parent" },
          URL: { value: { href: "#" } },
          ShowExpandMenu: { value: true },
          SubNavigationItems: [child],
        },
      });

      const fields = createMockFields({
        NavigationSection: [createMockSection("general", "General", [parent])],
      });

      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      expect(screen.getByRole("button", { name: /parent/i })).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(screen.getByRole("link", { name: "Child Page" })).toBeInTheDocument();
    });

    it("should render expandable nav group with sub-links", async () => {
      const user = userEvent.setup();
      const child = createMockNavItem({
        id: "child",
        displayName: "Child",
        fields: { Title: { value: "Child Page" }, URL: { value: { href: "/child" } } },
      });
      const parent = createMockNavItem({
        id: "parent",
        displayName: "Parent",
        fields: {
          Title: { value: "Parent" },
          URL: { value: { href: "#" } },
          SubNavigationItems: [child],
        },
      });

      const fields = createMockFields({
        NavigationSection: [createMockSection("general", "General", [parent])],
      });

      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      const expandButton = screen.getByRole("button", { name: /parent/i });
      expect(expandButton).toHaveAttribute("aria-expanded", "false");
      await user.click(expandButton);
      expect(expandButton).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("link", { name: "Child Page" })).toBeInTheDocument();
    });

    it("should include parent item in submenu click analytics", async () => {
      const user = userEvent.setup();
      const child = createMockNavItem({
        id: "child",
        displayName: "Child",
        fields: { Title: { value: "Child Page" }, URL: { value: { href: "/child" } } },
      });
      const parent = createMockNavItem({
        id: "parent",
        displayName: "Parent",
        fields: {
          Title: { value: "Order Management" },
          URL: { value: { href: "#" } },
          SubNavigationItems: [child],
        },
      });

      const fields = createMockFields({
        NavigationSection: [createMockSection("general", "General", [parent])],
      });

      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      await user.click(screen.getByRole("button", { name: /order management/i }));
      vi.mocked(gtmModule.logGTMNavigationMenuClick).mockClear();
      vi.mocked(cdpModule.sendNavigationMenuClickEvent).mockClear();
      await user.click(screen.getByRole("link", { name: "Child Page" }));

      expect(gtmModule.logGTMNavigationMenuClick).toHaveBeenCalledWith(
        expect.objectContaining({
          interaction_type: "menu_clicked",
          menu_item: "Child_Page",
          parent_item: "Order_Management",
          menu_section: "GENERAL",
        })
      );
      expect(cdpModule.sendNavigationMenuClickEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          interaction_type: "menu_clicked",
          menu_item: "Child_Page",
          parent_item: "Order_Management",
          menu_section: "GENERAL",
        })
      );
    });

    it("should show account chevron when multiple accounts exist", async () => {
      const user = userEvent.setup();
      const multiAccounts = [
        {
          id: "1",
          companyName: "Acme",
          address: "A",
          accountNumber: "1",
          isActive: true,
          role: "",
          organization: "Org",
        },
        {
          id: "2",
          companyName: "Beta",
          address: "B",
          accountNumber: "2",
          isActive: false,
          role: "",
          organization: "Org",
        },
      ];
      mockUseUserProfile.mockImplementation(() => ({
        profile: null,
        loading: false,
        error: null,
        accounts: multiAccounts,
        defaultAccountId: "1",
        userDisplay: null,
        refetch: vi.fn(),
        setProfileData: vi.fn(),
      }));

      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      expect(screen.getByTestId("chevron-down-icon")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /acme/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should call saveUserPreferences without router refresh when switching to another account", async () => {
      const user = userEvent.setup();
      mockSaveUserPreferences.mockResolvedValue({ ok: true });
      const switchAccounts = [
        {
          id: "1",
          companyName: "Acme",
          address: "A",
          accountNumber: "1",
          isActive: true,
          role: "",
          organization: "Org",
        },
        {
          id: "2",
          companyName: "Beta",
          address: "B",
          accountNumber: "2",
          isActive: false,
          role: "",
          organization: "Org",
        },
      ];
      mockUseUserProfile.mockImplementation(() => ({
        profile: null,
        loading: false,
        error: null,
        accounts: switchAccounts,
        defaultAccountId: "1",
        userDisplay: null,
        refetch: vi.fn(),
        setProfileData: vi.fn(),
      }));

      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      await user.click(screen.getByRole("button", { name: /acme/i }));
      await user.click(screen.getByRole("button", { name: /beta/i }));

      expect(mockSaveUserPreferences).toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
      expect(mockCompleteAccountSwitchAfterPreferenceSave).toHaveBeenCalledWith(
        expect.objectContaining({
          source: "left_nav",
          previousAccountId: "1",
          account: expect.objectContaining({ id: "2" }),
        })
      );
      expect(mockProfileSlice.setSelectedAccount).not.toHaveBeenCalled();
    });

    it("should refresh when selecting an unknown account id", async () => {
      const user = userEvent.setup();
      const fields = createMockFields();
      render(
        <PortalShellSideNavDefault
          testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
          fields={fields}
        />
      );

      await user.click(screen.getByRole("button", { name: /intralox llc/i }));
      await user.click(screen.getByTestId("select-unknown-account"));

      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
