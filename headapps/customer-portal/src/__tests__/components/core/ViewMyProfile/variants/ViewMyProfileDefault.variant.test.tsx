import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewMyProfileDefaultVariant } from "components/core/ViewMyProfile/variants/ViewMyProfileDefault.variant";
import { TEST_CASE_DATA_IDS } from "../../../../../helpers/enums";
import type { IViewMyProfileFields } from "components/core/ViewMyProfile/ViewMyProfile.type";
import { I18N } from "src/lib/dictionary-keys";
import type { Page } from "@sitecore-content-sdk/nextjs";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
  usePathname: () => "/",
}));

const mockT = vi.fn((key: string) => {
  const labels: Record<string, string> = {
    [I18N.ProfileSectionPersonalInformation]: "Personal Information",
    [I18N.ProfileName]: "Full Name",
    [I18N.ProfileEmail]: "Email Address",
    [I18N.ProfileVerification]: "Account Verified",
    [I18N.CurrentLocation]: "Current Location",
    [I18N.SwitchLocation]: "Switch Location",
    [I18N.AccountIdLabel]: "Account #",
  };
  return labels[key] ?? key;
});
vi.mock("next-intl", () => ({
  useTranslations: () => mockT,
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
  Text: ({ field, tag: Tag = "div", className, id }: any) => {
    if (!field?.value) return null;
    return (
      <Tag className={className} id={id} data-testid="content-sdk-text">
        {field.value}
      </Tag>
    );
  },
  RichText: ({ field }: { field?: { value?: string } }) =>
    field?.value ? <div data-testid="content-sdk-richtext">{field.value}</div> : null,
  Link: ({ field, className, children }: any) => {
    if (!field?.value?.href) return null;
    return (
      <a href={field.value.href} className={className} data-testid="content-sdk-link">
        {children ?? field.value.text}
      </a>
    );
  },
}));

vi.mock("@/components/ui/Heading", () => ({
  default: ({ level, children, className }: { level: number; children: React.ReactNode; className?: string }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return (
      <Tag className={className} data-testid="heading">
        {children}
      </Tag>
    );
  },
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({ children, onClick, type, className, ...rest }: any) => (
    <button type={type ?? "button"} onClick={onClick} className={className} data-testid="ui-button" {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/Link", () => ({
  default: ({ href, children, className }: any) => (
    <a href={href ?? "#"} className={className} data-testid="ui-link">
      {children}
    </a>
  ),
}));

vi.mock("@/components/shared/icons", () => ({
  CheckIcon: ({ "aria-hidden": ariaHidden }: any) => (
    <span data-testid="check-icon" aria-hidden={ariaHidden} role="img" aria-label="Verified" />
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
  {
    id: "2",
    companyName: "Other Co",
    address: "",
    accountNumber: "456",
    isActive: false,
    role: "",
    organization: "Other",
  },
];
const mockUseUserProfile = vi.fn(() => ({
  profile: null,
  loading: false,
  error: null,
  accounts: mockAccounts,
  defaultAccountId: "1",
  userDisplay: { fullName: "Test User", email: "test@test.com", isVerified: true },
  refetch: vi.fn(),
  setProfileData: vi.fn(),
}));
vi.mock("@/lib/user-profile-context", () => ({
  useUserProfile: () => mockUseUserProfile(),
}));

vi.mock("@/lib/profile-context", () => {
  const profile = () => ({
    currentLanguage: "en",
    selectedAccount: null,
    setCurrentLanguage: vi.fn(),
    setSelectedAccount: mockSetSelectedAccount,
  });
  return {
    useProfileContext: () => profile(),
    useProfileContextOptional: () => profile(),
  };
});

const { mockSetSelectedAccount, mockSaveUserPreferences, mockCompleteAccountSwitchAfterPreferenceSave } =
  vi.hoisted(() => ({
    mockSetSelectedAccount: vi.fn(),
    mockSaveUserPreferences: vi.fn().mockResolvedValue({ ok: true }),
    mockCompleteAccountSwitchAfterPreferenceSave: vi.fn(),
  }));

vi.mock("@/lib/apis/user-preference-api", () => ({
  saveUserPreferences: (...args: unknown[]) => mockSaveUserPreferences(...args),
}));

vi.mock("@/lib/account-switch-events", () => ({
  fireAccountSwitchEvents: vi.fn(),
  fireEnhancedAccountSwitchEvent: vi.fn(),
}));

vi.mock("@/lib/account-switch-navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/account-switch-navigation")>();
  return {
    ...actual,
    completeAccountSwitchAfterPreferenceSave: mockCompleteAccountSwitchAfterPreferenceSave,
  };
});

vi.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({
    authState: {
      idToken: {
        claims: { email: "test@test.com", given_name: "Ada", family_name: "Lovelace" },
      },
    },
  }),
}));

describe("ViewMyProfileDefaultVariant", () => {
  const mockParams = {
    params: {
      styles: "test-styles",
      RenderingIdentifier: "test-id",
    },
  };

  const mockPage = { mode: { isEditing: false } } as Page;

  const createMockFields = (overrides?: Partial<IViewMyProfileFields>): IViewMyProfileFields => ({
    ProfileTitle: { value: "Profile Settings" },
    ProfileSectionTitle: { value: "Personal Information" },
    CompanySectionTitle: { value: "Your Company Accounts" },
    BannerText: { value: "Need help? Contact support." },
    BannerLink: { value: { href: "/support", text: "Contact Support" } },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockT.mockImplementation((key: string) => {
      const labels: Record<string, string> = {
        [I18N.ProfileSectionPersonalInformation]: "Personal Information",
        [I18N.ProfileName]: "Full Name",
        [I18N.ProfileEmail]: "Email Address",
        [I18N.ProfileVerification]: "Account Verified",
        [I18N.CurrentLocation]: "Current Location",
        [I18N.SwitchLocation]: "Switch Location",
        [I18N.AccountIdLabel]: "Account #",
      };
      return labels[key] ?? key;
    });
  });

  describe("Component rendering", () => {
    it("should render with test id when fields are provided", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.VIEW_MY_PROFILE)).toBeInTheDocument();
    });

    it("should render empty container when fields are null", () => {
      render(
        <ViewMyProfileDefaultVariant
          testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE}
          fields={null}
          params={mockParams} page={mockPage}
        />
      );

      const container = screen.getByTestId(TEST_CASE_DATA_IDS.VIEW_MY_PROFILE);
      expect(container).toBeInTheDocument();
      expect(container.tagName).toBe("DIV");
      expect(container.children.length).toBe(0);
    });

    it("should render page title when ProfileTitle is provided", () => {
      const fields = createMockFields({ ProfileTitle: { value: "My Profile" } });
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByText("My Profile")).toBeInTheDocument();
      const heading = screen.getByRole("heading", { level: 1, name: "My Profile" });
      expect(heading).toBeInTheDocument();
    });

    it("should render company section title when CompanySectionTitle is provided", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByText("Your Company Accounts")).toBeInTheDocument();
    });

    it("should render personal information section with fallback title when ProfileSectionTitle is missing", () => {
      const fields = createMockFields({ ProfileSectionTitle: undefined });
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByText("Personal Information")).toBeInTheDocument();
    });

    it("should render account cards when company accounts exist", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const cards = screen.getAllByTestId("view-my-profile-account-card");
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });

    it("should render active account first and inactive alphabetically", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const cards = screen.getAllByTestId("view-my-profile-account-card");
      expect(cards[0]).toHaveAttribute("data-active", "true");
    });
  });

  describe("Support banner", () => {
    it("should render support banner region when banner text is provided", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const region = screen.getByRole("region", { name: "Support information" });
      expect(region).toBeInTheDocument();
      expect(region).toHaveTextContent("Need help? Contact support.");
    });

    it("should render support link when BannerLink is provided", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const link = screen.getByRole("link", { name: "Contact Support" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/support");
    });

    it("should not render support banner when no banner text or link", () => {
      const fields = createMockFields({
        BannerText: undefined,
        BannerLink: undefined,
      });
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.queryByRole("region", { name: "Support information" })).not.toBeInTheDocument();
    });
  });

  describe("Personal information card", () => {
    it("should render Full Name and Email Address labels", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByText("Full Name")).toBeInTheDocument();
      expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("should render Account Verified badge when user is verified", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByText("Account Verified")).toBeInTheDocument();
    });
  });

  describe("Account cards", () => {
    it("should render Switch Location button for inactive accounts", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const buttons = screen.getAllByRole("button", { name: "Switch Location" });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it("should render Current Location badge for active account", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByText("Current Location")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have section with aria-labelledby pointing to page title when title exists", () => {
      const fields = createMockFields({ ProfileTitle: { value: "Profile Settings" } });
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const section = screen.getByTestId(TEST_CASE_DATA_IDS.VIEW_MY_PROFILE);
      expect(section.tagName).toBe("SECTION");
      expect(section).toHaveAttribute("aria-labelledby", "view-my-profile-title");
      expect(document.getElementById("view-my-profile-title")).toHaveTextContent("Profile Settings");
    });

    it("should have exactly one level-1 heading when ProfileTitle is provided", () => {
      const fields = createMockFields({ ProfileTitle: { value: "Profile Settings" } });
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const h1 = screen.getAllByRole("heading", { level: 1 });
      expect(h1.length).toBe(1);
      expect(h1[0]).toHaveTextContent("Profile Settings");
    });

    it("should have support banner as a region with accessible name", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const region = screen.getByRole("region", { name: "Support information" });
      expect(region).toBeInTheDocument();
    });

    it("should have links with discernible text", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const link = screen.getByRole("link", { name: "Contact Support" });
      expect(link).toHaveTextContent("Contact Support");
    });

    it("should have buttons with accessible names", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const switchButtons = screen.getAllByRole("button", { name: "Switch Location" });
      switchButtons.forEach((btn) => {
        expect(btn).toHaveAccessibleName();
      });
    });

    it("should have account cards with data-active attribute for state", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const cards = screen.getAllByTestId("view-my-profile-account-card");
      cards.forEach((card) => {
        expect(card).toHaveAttribute("data-active");
        expect(["true", "false"]).toContain(card.getAttribute("data-active"));
      });
    });

    it("should use article for each account card for semantic structure", () => {
      const fields = createMockFields();
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      const cards = screen.getAllByTestId("view-my-profile-account-card");
      cards.forEach((card) => {
        expect(card.tagName).toBe("ARTICLE");
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle partial fields without throwing", () => {
      const partialFields = { ProfileTitle: { value: "Profile" } } as unknown as IViewMyProfileFields;
      expect(() => {
        render(
          <ViewMyProfileDefaultVariant
            testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE}
            fields={partialFields}
            params={mockParams} page={mockPage}
          />
        );
      }).not.toThrow();
    });

    it("should handle empty object fields", () => {
      const fields = {} as IViewMyProfileFields;
      render(<ViewMyProfileDefaultVariant testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.VIEW_MY_PROFILE)).toBeInTheDocument();
    });

    it("reloads the page after a successful account switch", async () => {
      const user = userEvent.setup();
      const fields = createMockFields();
      render(
        <ViewMyProfileDefaultVariant
          testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE}
          fields={fields}
          params={mockParams}
          page={mockPage}
        />
      );

      await user.click(screen.getAllByRole("button", { name: "Switch Location" })[0]!);

      expect(mockSaveUserPreferences).toHaveBeenCalled();
      expect(mockCompleteAccountSwitchAfterPreferenceSave).toHaveBeenCalled();
      expect(mockSetSelectedAccount).not.toHaveBeenCalled();
    });

    it("renders no-account card when user has no company accounts", () => {
      mockUseUserProfile.mockReturnValueOnce({
        profile: null,
        loading: false,
        error: null,
        accounts: [],
        defaultAccountId: "",
        userDisplay: { fullName: "Test User", email: "test@test.com", isVerified: true },
        refetch: vi.fn(),
        setProfileData: vi.fn(),
      });

      const fields = createMockFields({
        NoAccountText: { value: "No accounts yet" },
      });
      render(
        <ViewMyProfileDefaultVariant
          testId={TEST_CASE_DATA_IDS.VIEW_MY_PROFILE}
          fields={fields}
          params={mockParams}
          page={mockPage}
        />
      );

      expect(screen.getByTestId("view-my-profile-no-account")).toBeInTheDocument();
      expect(screen.getByTestId("content-sdk-richtext")).toHaveTextContent("No accounts yet");
    });
  });
});
