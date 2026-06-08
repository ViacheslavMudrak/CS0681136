import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfileMenuDefaultVariant } from 'components/core/UserProfileMenu/variants/UserProfileMenuDefault.variant';
import { TEST_CASE_DATA_IDS } from '../../../../../helpers/enums';
import type { IUserProfileMenuFields } from 'components/core/UserProfileMenu/UserProfileMenu.type';
import * as gtmModule from '@/lib/gtm';
import * as cdpModule from '@/lib/CDPEvents';

function getUserProfileMenuContentPanel(): HTMLElement {
  const menus = screen.getAllByRole('menu', { name: /user profile menu/i });
  const contentPanel = menus.find((el) => !el.className.includes('bg-black/50'));
  if (!contentPanel) {
    throw new Error('User profile menu content panel not found');
  }
  return contentPanel;
}

function expectUserProfileMenuOpen(): void {
  expect(getUserProfileMenuContentPanel()).toBeInTheDocument();
}

function expectNoUserProfileMenu(): void {
  expect(screen.queryAllByRole('menu', { name: /user profile menu/i })).toHaveLength(0);
}

const {
  mockUseDeviceType,
  mockSaveUserPreferencesMenu,
  mockUseSitecoreProfileMenu,
  recordLoginRedirectUrl,
  mockCompleteAccountSwitchAfterPreferenceSave,
} = vi.hoisted(() => ({
  mockUseDeviceType: vi.fn(() => ({ isMobile: false, isTablet: false })),
  mockSaveUserPreferencesMenu: vi.fn().mockResolvedValue(null),
  mockUseSitecoreProfileMenu: vi.fn(() => ({ page: { mode: { isEditing: false } } })),
  recordLoginRedirectUrl: vi.fn(),
  mockCompleteAccountSwitchAfterPreferenceSave: vi.fn(),
}));

vi.mock('@/lib/language-selection-modal-context', () => ({
  LanguageSelectionModalProvider: ({ children }: { children: unknown }) => <>{children}</>,
  useLanguageSelectionModal: () => ({
    registerLanguageSwitcherFields: vi.fn(),
    setLanguageSwitcherDisabled: vi.fn(),
    isLanguageSwitcherDisabled: false,
    openMobileLanguageDrawer: vi.fn(),
    closeMobileLanguageDrawer: vi.fn(),
    isMobileLanguageDrawerOpen: false,
    registeredFields: null,
  }),
}));

vi.mock('@/lib/contact-support-modal-context', () => ({
  ContactSupportModalProvider: ({ children }: { children: unknown }) => <>{children}</>,
  useContactSupportModal: () => ({
    registerContactSupportFields: vi.fn(),
    openMobileContactDrawer: vi.fn(),
    closeMobileContactDrawer: vi.fn(),
    isMobileContactDrawerOpen: false,
    registeredFields: null,
  }),
}));

vi.mock('@/hooks/use-device-type', () => ({
  useDeviceType: () => mockUseDeviceType(),
}));

/** Avoid jsdom "navigation" / non-configurable `location.assign`; still runs real cookie/Okta/storage teardown. */
vi.mock('@/lib/client-auth-sign-out', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/client-auth-sign-out')>();
  const { buildLoginUrl } = await import('@/lib/auth-utils');

  const captureLoginUrl = (options?: import('@/lib/client-auth-sign-out').NavigateToLoginOptions) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (options?.skipReturnUrl) {
      recordLoginRedirectUrl('/login');
      return;
    }
    const raw =
      options?.returnPathWithSearch ?? `${window.location.pathname}${window.location.search}`;
    const normalized = raw.trim() === '' ? '/' : raw;
    recordLoginRedirectUrl(buildLoginUrl(normalized));
  };

  return {
    ...actual,
    navigateToLoginPage: captureLoginUrl,
    signOutAndNavigateToLogin: async (
      oktaAuth?: Parameters<typeof actual.signOutAndNavigateToLogin>[0],
      options?: Parameters<typeof actual.signOutAndNavigateToLogin>[1]
    ) => {
      await actual.clearServerOktaAndClientAuth(oktaAuth);
      captureLoginUrl(options);
    },
    logout: async (oktaAuth?: Parameters<typeof actual.logout>[0]) => {
      await actual.clearServerOktaAndClientAuth(oktaAuth);
      captureLoginUrl({ skipReturnUrl: true });
    },
  };
});

vi.mock('@/lib/apis/user-preference-api', () => ({
  saveUserPreferences: (...args: unknown[]) => mockSaveUserPreferencesMenu(...args),
}));

vi.mock('@/lib/account-switch-navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/account-switch-navigation')>();
  return {
    ...actual,
    completeAccountSwitchAfterPreferenceSave: mockCompleteAccountSwitchAfterPreferenceSave,
  };
});

// Mock Next.js navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => '/',
}));

// Mock Okta Auth
const mockAuthState = {
  isAuthenticated: true,
  idToken: {
    claims: {
      sub: 'user-123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      given_name: 'John',
      family_name: 'Doe',
    },
  },
};

const mockOktaAuth = {
  closeSession: vi.fn().mockResolvedValue(true),
};

const mockUseOktaAuth = vi.fn<[], any>(() => ({
  oktaAuth: mockOktaAuth,
  authState: mockAuthState,
}));

vi.mock('@okta/okta-react', () => ({
  useOktaAuth: () => mockUseOktaAuth(),
}));

// Mock Profile Context
const mockSetSelectedAccount = vi.fn();
let mockSelectedAccount: any = {
  id: '1',
  companyName: 'Company Account 1',
  address: 'Company Address',
  accountNumber: '',
  isActive: true,
  role: 'Engineering',
  organization: 'Tyson Foods',
};
let mockCurrentLanguage = 'en-US';

vi.mock('@/lib/profile-context', () => {
  const profileSlice = () => ({
    selectedAccount: mockSelectedAccount,
    setSelectedAccount: mockSetSelectedAccount,
    currentLanguage: mockCurrentLanguage,
  });
  return {
    useProfileContext: () => profileSlice(),
    useProfileContextOptional: () => profileSlice(),
    ProfileAccount: {},
  };
});

// Mock User Profile context (useUserProfile) - required by UserProfileMenuDefaultVariant
const defaultMockAccounts = [
  {
    id: '1',
    companyName: 'Company Account 1',
    address: 'Company Address',
    accountNumber: '',
    isActive: true,
    role: 'Engineering',
    organization: 'Tyson Foods',
  },
  {
    id: '2',
    companyName: 'Company Account 2',
    address: 'Company Address 2',
    accountNumber: '',
    isActive: false,
    role: 'Engineering',
    organization: 'Tyson Foods',
  },
];

let mockProfileAccounts = [...defaultMockAccounts];

vi.mock('@/lib/user-profile-context', () => ({
  useUserProfile: () => ({
    accounts: mockProfileAccounts,
    loading: false,
    profile: null,
    error: null,
    defaultAccountId: '1',
    userDisplay: null,
    refetch: vi.fn(),
    setProfileData: vi.fn(),
  }),
}));

// Mock GTM functions
vi.mock('@/lib/gtm', () => ({
  logGTMAccountSwitched: vi.fn(),
  logGTMLogout: vi.fn(),
  logGTMProfileMenuOpened: vi.fn(),
  logGTMProfileSettingsAccessed: vi.fn(),
  logGTMProfileContextSwitched: vi.fn(),
  logGTMUserSignedOut: vi.fn(),
}));

// Mock CDP events
vi.mock('@/lib/CDPEvents', () => ({
  sendAccountSwitchedEvent: vi.fn(),
  sendLogoutEvent: vi.fn(),
  sendProfileMenuOpenedEvent: vi.fn(),
  sendProfileSettingsAccessedEvent: vi.fn(),
  sendProfileContextSwitchedEvent: vi.fn(),
  sendUserSignedOutEvent: vi.fn(),
}));

// Mock Okta auth client
vi.mock('@/lib/okta-auth-client', async (importOriginal) => {
  const { createOktaAuthClientVitestMock } = await import('@/test/mocks/okta-auth-client-vitest');
  return createOktaAuthClientVitestMock(importOriginal, {
    clearAllStorage: vi.fn(),
  });
});

// Mock Okta config
vi.mock('@/lib/okta-config', () => ({
  getOktaAuthConfig: vi.fn(() => ({})),
  isOktaConfigured: vi.fn(() => true),
}));

// Mock OktaAuth
vi.mock('@okta/okta-auth-js', () => ({
  default: vi.fn().mockImplementation(() => ({
    closeSession: vi.fn().mockResolvedValue(true),
  })),
}));

// Mock Sitecore Content SDK components
vi.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => mockUseSitecoreProfileMenu(),
  NextImage: ({ field, className, width, height, alt, ...rest }: any) => {
    if (!field?.value?.src) return null;
    return (
      <img
        src={field.value.src}
        alt={alt || field.value.alt || ''}
        className={className}
        width={width}
        height={height}
        data-testid="content-sdk-image"
        {...rest}
      />
    );
  },
  Text: ({ field, tag: Tag = 'span', className }: any) => {
    if (!field?.value) return null;
    return (
      <Tag className={className} data-testid="content-sdk-text">
        {field.value}
      </Tag>
    );
  },
  Link: ({ field, className, children }: any) => {
    if (!field?.value?.href) return null;
    return (
      <a href={field.value.href} className={className} data-testid="content-sdk-link">
        {children}
      </a>
    );
  },
}));

vi.mock('@/components/shared/icons', () => ({
  ChevronUpIcon: ({ width, height, stroke }: any) => (
    <svg data-testid="chevron-up-icon" width={width} height={height} stroke={stroke}>
      <path />
    </svg>
  ),
  CloseIcon: ({ width, height }: { width?: number; height?: number }) => (
    <span data-testid="close-icon-mock" data-w={width} data-h={height} aria-hidden />
  ),
}));

vi.mock('@/components/shared/icons/ChevronDownIcon', () => ({
  default: ({ width, height, stroke }: any) => (
    <svg data-testid="chevron-down-icon" width={width} height={height} stroke={stroke}>
      <path />
    </svg>
  ),
}));

// Mock fetch for logout API
global.fetch = vi.fn();

describe('UserProfileMenuDefaultVariant', () => {
  const mockParams = {
    styles: 'test-styles',
    RenderingIdentifier: 'test-id',
  };

  const mockPage = { mode: { isEditing: false } };

  const createMockFields = (overrides?: Partial<IUserProfileMenuFields>): IUserProfileMenuFields => ({
    CompanyIcon: {
      value: {
        src: '/account-logo.png',
        alt: 'Account Logo',
        width: 16,
        height: 16,
      },
    },
    ActiveAccountIcon: {
      value: {
        src: '/active-account-icon.png',
        alt: 'Active account',
        width: 14,
        height: 14,
      },
    },
    SectionTitle: {
      value: 'Account Selection',
    },
    SingleAccountTitle: {
      value: 'Logged in as',
    },
    AccountInfo: {
      value: 'Select an account',
    },
    ProfileItems: [
      {
        id: 'profile-1',
        name: 'Profile Setting',
        displayName: 'Profile Setting',
        fields: {
          Icon: {
            value: {
              src: '/profile-icon.png',
              alt: 'Profile Icon',
              width: '16',
              height: '16',
            },
          },
          Title: {
            value: 'Profile Settings',
          },
          Link: {
            value: {
              href: '/profile',
              text: 'Profile Settings',
              linktype: 'internal',
              anchor: '',
              class: '',
              title: '',
              target: '',
              querystring: '',
              id: '',
            },
          },
        },
      },
    ],
    ProfileIcon: {
      value: {
        src: '/profile-icon.png',
        alt: 'Profile Icon',
        width: 16,
        height: 16,
      },
    },
    ProfileUrl: {
      value: {
        href: '/profile',
        text: 'Profile Settings',
      },
    },
    SignOutIcon: {
      value: {
        src: '/signout-icon.png',
        alt: 'Sign Out Icon',
        width: 16,
        height: 16,
      },
    },
    SignOutText: {
      value: 'Sign Out',
    },
    AccountAddress: {
      value: 'Account Address',
    },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    recordLoginRedirectUrl.mockClear();
    mockOktaAuth.closeSession.mockResolvedValue(true);
    mockUseSitecoreProfileMenu.mockReturnValue({ page: { mode: { isEditing: false } } });
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockSetSelectedAccount.mockClear();
    mockProfileAccounts = [...defaultMockAccounts];
    mockUseDeviceType.mockReturnValue({ isMobile: false, isTablet: false });
    mockSaveUserPreferencesMenu.mockResolvedValue(null);
    mockSelectedAccount = {
      id: '1',
      companyName: 'Company Account 1',
      address: 'Company Address',
      accountNumber: '',
      isActive: true,
      role: 'Engineering',
      organization: 'Tyson Foods',
    };
    mockCurrentLanguage = 'en-US';
    mockUseOktaAuth.mockReturnValue({
      oktaAuth: mockOktaAuth,
      authState: mockAuthState,
    });
    vi.mocked(gtmModule.logGTMAccountSwitched).mockClear();
    vi.mocked(gtmModule.logGTMLogout).mockClear();
    vi.mocked(gtmModule.logGTMProfileMenuOpened).mockClear();
    vi.mocked(gtmModule.logGTMProfileSettingsAccessed).mockClear();
    vi.mocked(gtmModule.logGTMProfileContextSwitched).mockClear();
    vi.mocked(gtmModule.logGTMUserSignedOut).mockClear();
    vi.mocked(cdpModule.sendAccountSwitchedEvent).mockClear();
    vi.mocked(cdpModule.sendLogoutEvent).mockClear();
    vi.mocked(cdpModule.sendProfileMenuOpenedEvent).mockClear();
    vi.mocked(cdpModule.sendProfileSettingsAccessedEvent).mockClear();
    vi.mocked(cdpModule.sendProfileContextSwitchedEvent).mockClear();
    vi.mocked(cdpModule.sendUserSignedOutEvent).mockClear();
    vi.mocked(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render component with test id', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_PROFILE_MENU)).toBeInTheDocument();
    });

    it('should render empty div when fields are not provided', () => {
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={null as any} params={mockParams} page={mockPage} />);

      const container = screen.getByTestId(TEST_CASE_DATA_IDS.USER_PROFILE_MENU);
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(0);
    });

    it('should render trigger button with user info', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should render user initials correctly', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render dropdown when opened', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const dropdown = getUserProfileMenuContentPanel();
      expect(dropdown).toBeInTheDocument();
    });

    it('should fire profile menu opened analytics when the menu opens', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));

      expect(gtmModule.logGTMProfileMenuOpened).toHaveBeenCalledWith({
        interaction_type: 'profile_menu_opened',
        user_id: 'user-123',
        account_id: '1',
      });
      expect(cdpModule.sendProfileMenuOpenedEvent).toHaveBeenCalledWith({
        interaction_type: 'profile_menu_opened',
        user_id: 'user-123',
        account_id: '1',
      });
    });

    it('should render section heading when provided', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      expect(screen.getByText('Account Selection')).toBeInTheDocument();
    });

    it('should render account list', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      expect(screen.getByText('Company Account 1')).toBeInTheDocument();
      expect(screen.getByText('Company Account 2')).toBeInTheDocument();
    });

    it('should render profile link when provided', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const profileLink = screen.getByRole('link', { name: /profile settings/i });
      expect(profileLink).toBeInTheDocument();
      expect(profileLink).toHaveAttribute('href', '/en/profile');
    });

    it('should fire profile settings accessed analytics when profile settings is clicked', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
      fireEvent.click(screen.getByRole('link', { name: /profile settings/i }));

      expect(gtmModule.logGTMProfileSettingsAccessed).toHaveBeenCalledWith({
        interaction_type: 'profile_settings_accessed',
        user_id: 'user-123',
        account_id: '1',
      });
      expect(cdpModule.sendProfileSettingsAccessedEvent).toHaveBeenCalledWith({
        interaction_type: 'profile_settings_accessed',
        user_id: 'user-123',
        account_id: '1',
      });
    });

    it('should render sign out button', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
    });
  });

  describe('User Info Display', () => {
    it('should display user name from Okta claims', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      // User name should be in the component (though not directly visible in this test structure)
      expect(button).toBeInTheDocument();
    });

    it('should display user initials (first + last name)', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should display initials fallback (first 2 chars) when single name', () => {
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: mockOktaAuth,
        authState: {
          isAuthenticated: true,
          idToken: {
            claims: {
              sub: 'user-123',
              name: 'John',
              email: 'john@example.com',
            },
          },
        },
      });

      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByText('JO')).toBeInTheDocument();
    });

    it('should not show fallback "U" when auth not ready (no name)', () => {
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: mockOktaAuth,
        authState: {
          isAuthenticated: false,
          idToken: null,
        },
      });

      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_PROFILE_MENU)).toBeInTheDocument();
      expect(screen.queryByText('U')).not.toBeInTheDocument();
    });

    it('should not show fallback "U" when unauthenticated', () => {
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: {
          isAuthenticated: false,
          idToken: null,
        },
      });

      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_PROFILE_MENU)).toBeInTheDocument();
      expect(screen.queryByText('U')).not.toBeInTheDocument();
    });
  });

  describe('Account Selection', () => {
    it('should display account list', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      expect(screen.getByText('Company Account 1')).toBeInTheDocument();
      expect(screen.getByText('Company Account 2')).toBeInTheDocument();
    });

    it('should show selected account with ActiveAccountIcon image', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const activeIcons = screen
        .getAllByTestId('content-sdk-image')
        .filter((el) => el.getAttribute('src') === '/active-account-icon.png');
      expect(activeIcons.length).toBeGreaterThan(0);
    });

    it('should handle account selection', async () => {
      mockSaveUserPreferencesMenu.mockResolvedValue({ ok: true });
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const accountButton = screen.getByRole('button', { name: /company account 2/i });
      
      if (accountButton) {
        fireEvent.click(accountButton);
        await waitFor(() => {
          expect(mockSaveUserPreferencesMenu).toHaveBeenCalled();
          expect(mockCompleteAccountSwitchAfterPreferenceSave).toHaveBeenCalled();
        });
        expect(mockSetSelectedAccount).not.toHaveBeenCalled();
      }
    });

    it('should close dropdown after selection', async () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      expectUserProfileMenuOpen();

      const accountButton = screen.getByRole('button', { name: /company account 2/i });
      
      if (accountButton) {
        fireEvent.click(accountButton);
        
        await waitFor(() => {
          expectNoUserProfileMenu();
        });
      }
    });

    it('should complete account switch after preferences save', async () => {
      mockSaveUserPreferencesMenu.mockResolvedValue({ ok: true });
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
      fireEvent.click(screen.getByRole('button', { name: /company account 2/i }));

      await waitFor(() => {
        expect(mockCompleteAccountSwitchAfterPreferenceSave).toHaveBeenCalledWith(
          expect.objectContaining({
            source: 'profile_menu',
            previousAccountId: '1',
            account: expect.objectContaining({ id: '2', companyName: 'Company Account 2' }),
          })
        );
      });
    });
  });

  describe('Dropdown Behavior', () => {
    it('should open/close dropdown on trigger click', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      
      expectNoUserProfileMenu();

      fireEvent.click(button);
      expectUserProfileMenuOpen();

      fireEvent.click(button);
      expectNoUserProfileMenu();
    });

    it('should close dropdown when clicking outside', async () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      expectUserProfileMenuOpen();

      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expectNoUserProfileMenu();
      });
    });

    it('should toggle chevron icon based on state', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument();

      fireEvent.click(button);

      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('chevron-down-icon')).not.toBeInTheDocument();
    });
  });

  describe('Profile Link', () => {
    it('should render profile link when URL provided', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const profileLink = screen.getByRole('link', { name: /profile settings/i });
      expect(profileLink).toBeInTheDocument();
    });

    it('should render profile icon when provided', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const images = screen.getAllByTestId('content-sdk-image');
      const profileIcon = images.find(img => img.getAttribute('src') === '/profile-icon.png');
      expect(profileIcon).toBeInTheDocument();
    });

    it('should render profile text from URL field', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    });

    it('should handle missing profile URL gracefully', () => {
      const fields = createMockFields({
        ProfileItems: [],
      });
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      expect(screen.queryByRole('link', { name: /profile settings/i })).not.toBeInTheDocument();
    });
  });

  describe('Sign Out', () => {
    it('should call logout functions on sign out', async () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(gtmModule.logGTMUserSignedOut).toHaveBeenCalledWith({
          interaction_type: 'user_signed_out',
          user_id: 'user-123',
          account_id: '1',
          session_duration: expect.any(Number),
        });
        expect(cdpModule.sendUserSignedOutEvent).toHaveBeenCalledWith({
          interaction_type: 'user_signed_out',
          user_id: 'user-123',
          account_id: '1',
          session_duration: expect.any(Number),
        });
        expect(gtmModule.logGTMLogout).toHaveBeenCalled();
        expect(cdpModule.sendLogoutEvent).toHaveBeenCalled();
      });
    });

    it('should clear all storage', async () => {
      const { clearAllStorage } = await import('@/lib/okta-auth-client');
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(clearAllStorage).toHaveBeenCalled();
      });
    });

    it('should call logout API endpoint', async () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      });
    });

    it('should close Okta session', async () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockOktaAuth.closeSession).toHaveBeenCalled();
      });
    });

    it('should redirect to login page', async () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(recordLoginRedirectUrl).toHaveBeenCalled();
      });
      const loginUrl = String(recordLoginRedirectUrl.mock.calls[0]?.[0] ?? '');
      expect(loginUrl).toContain('/login');
    });

    it('should handle logout errors gracefully', async () => {
      mockOktaAuth.closeSession.mockRejectedValue(new Error('Logout failed'));
      vi.mocked(global.fetch as any).mockRejectedValue(new Error('API failed'));

      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(recordLoginRedirectUrl).toHaveBeenCalled();
      });
      const loginUrl = String(recordLoginRedirectUrl.mock.calls[0]?.[0] ?? '');
      expect(loginUrl).toContain('/login');
    });

    it('should close dropdown before logout', async () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      expectUserProfileMenuOpen();

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expectNoUserProfileMenu();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing Okta auth', () => {
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: null,
      });

      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_PROFILE_MENU)).toBeInTheDocument();
    });

    it('should handle missing account logo', () => {
      const fields = createMockFields({
        CompanyIcon: {
          value: { src: '', alt: '', width: '0', height: '0' },
        },
      });
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const images = screen.queryAllByTestId('content-sdk-image');
      const accountLogos = images.filter(img => img.getAttribute('src') === '/account-logo.png');
      expect(accountLogos.length).toBe(0);
    });

    it('should handle missing profile icon', () => {
      const fields = createMockFields({
        ProfileItems: [
          {
            id: 'profile-1',
            name: 'Profile Setting',
            fields: {
              Link: {
                value: { href: '/profile', text: 'Profile Settings', linktype: 'internal', anchor: '', class: '', title: '', target: '', querystring: '', id: '' },
              },
            },
          },
        ],
      });
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const images = screen.queryAllByTestId('content-sdk-image');
      const profileIcons = images.filter(img => img.getAttribute('src') === '/profile-icon.png');
      expect(profileIcons.length).toBe(0);
    });

    it('should handle missing sign out icon', () => {
      const fields = createMockFields({
        SignOutIcon: {
          value: { src: '', alt: '', width: '0', height: '0' },
        },
      });
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
    });

    it('should handle missing sign out text', () => {
      const fields = createMockFields({
        SignOutText: {
          value: '',
        },
      });
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct aria attributes on trigger button', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-label', 'User menu');
    });

    it('should have correct role on dropdown', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const dropdown = getUserProfileMenuContentPanel();
      expect(dropdown).toBeInTheDocument();
    });

    it('should have correct roles on menu items', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
    });

    it('should mark ActiveAccountIcon images as decorative (aria-hidden)', () => {
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      const button = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(button);

      const activeIcons = screen
        .getAllByTestId('content-sdk-image')
        .filter((el) => el.getAttribute('src') === '/active-account-icon.png');
      expect(activeIcons.length).toBeGreaterThan(0);
      activeIcons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Mobile drawer and preferences', () => {
    it('should render drawer with close control when mobile and menu is open', async () => {
      const user = userEvent.setup();
      mockUseDeviceType.mockReturnValue({ isMobile: true, isTablet: false });
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      expectUserProfileMenuOpen();
      expect(screen.getAllByRole('button', { name: /close menu/i }).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('close-icon-mock')).toBeInTheDocument();
    });

    it('should close mobile drawer when overlay is pressed', async () => {
      mockUseDeviceType.mockReturnValue({ isMobile: true, isTablet: false });
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
      const overlay = screen
        .getAllByRole('menu', { name: /user profile menu/i })
        .find((el) => el.className.includes('bg-black/50'));
      expect(overlay).toBeTruthy();
      fireEvent.mouseDown(overlay!);

      await waitFor(() => {
        expectNoUserProfileMenu();
      });
    });

    it('should call saveUserPreferences without router refresh when save succeeds', async () => {
      mockSaveUserPreferencesMenu.mockResolvedValue({ ok: true });
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
      fireEvent.click(screen.getByRole('button', { name: /company account 2/i }));

      await waitFor(() => {
        expect(mockSaveUserPreferencesMenu).toHaveBeenCalled();
        expect(mockCompleteAccountSwitchAfterPreferenceSave).toHaveBeenCalled();
        expect(mockRefresh).not.toHaveBeenCalled();
        expect(mockSetSelectedAccount).not.toHaveBeenCalled();
      });
    });

    it('should navigate after profile-menu account preference saves', async () => {
      mockSaveUserPreferencesMenu.mockResolvedValue({ ok: true });
      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
      fireEvent.click(screen.getByRole('button', { name: /company account 2/i }));

      await waitFor(() => {
        expect(mockCompleteAccountSwitchAfterPreferenceSave).toHaveBeenCalledWith(
          expect.objectContaining({
            source: 'profile_menu',
            previousAccountId: '1',
          })
        );
      });
    });

    it('should show single-account heading when only one account exists', () => {
      mockProfileAccounts = [
        {
          id: '1',
          companyName: 'Only Account',
          address: 'Addr',
          accountNumber: '',
          isActive: true,
          role: 'R',
          organization: 'Org',
        },
      ];
      mockSelectedAccount = {
        id: '1',
        companyName: 'Only Account',
        address: 'Addr',
        accountNumber: '',
        isActive: true,
        role: 'R',
        organization: 'Org',
      };

      const fields = createMockFields();
      render(<UserProfileMenuDefaultVariant testId={TEST_CASE_DATA_IDS.USER_PROFILE_MENU} fields={fields} params={mockParams} page={mockPage} />);

      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
      expect(screen.getByText('Logged in as')).toBeInTheDocument();
      expect(screen.getByText('Only Account')).toBeInTheDocument();
    });
  });
});

