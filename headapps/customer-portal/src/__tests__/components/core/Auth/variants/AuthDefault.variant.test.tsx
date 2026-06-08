import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthDefaultVariant } from 'components/core/Auth/variants/AuthDefault.variant';
import { TEST_CASE_DATA_IDS, AUTH_TYPES, AUTH_SUCCESS_MESSAGES } from '../../../../../helpers/enums';
import type { IAuthFields } from 'components/core/Auth/Auth.type';

// Mock Next.js navigation
const mockGet = vi.fn();
const mockPathname = vi.fn(() => '/');
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => mockPathname(),
  useRouter: () => mockRouter,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      user_reset_back_to_login_text: 'Back to Login',
    };
    return map[key] ?? key;
  },
}));

// Mock Sitecore Content SDK components
vi.mock('@sitecore-content-sdk/nextjs', () => ({
  RichText: ({ field, className }: any) => {
    if (!field?.value) return null;
    return (
      <div className={className} data-testid="content-sdk-rich-text">
        {field.value}
      </div>
    );
  },
  Link: ({ className }: any) => <a data-testid="content-sdk-link" className={className} href="#">Site</a>,
}));

// Mock shared components
vi.mock('components/shared/auth-card/AuthCard', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-card">{children}</div>
  ),
}));

vi.mock('components/shared/icons/ChevronRightIcon', () => ({
  default: ({ stroke, width, height, className }: any) => (
    <svg data-testid="chevron-right-icon" className={className} stroke={stroke} width={width} height={height}>
      <path />
    </svg>
  ),
}));

// Mock Okta config to prevent configuration errors
vi.mock('@/lib/oktaAuth', () => ({
  getOktaAuth: vi.fn(() => ({
    idx: null,
  })),
}));

vi.mock('@/lib/okta-config', () => ({
  getOktaAuthConfig: vi.fn(() => ({
    issuer: 'https://test.okta.com',
    clientId: 'test-client-id',
  })),
}));

// Mock Okta React hooks
vi.mock('@okta/okta-react', () => ({
  useOktaAuth: vi.fn(() => ({
    authState: {
      isAuthenticated: false,
    },
    oktaAuth: {
      tokenManager: {
        get: vi.fn(),
      },
    },
  })),
}));

// Mock auth components
vi.mock('components/core/Auth/components/AuthLogin', () => ({
  default: () => <div data-testid="auth-login">AuthLogin</div>,
}));

vi.mock('components/core/Auth/components/AuthRegister', () => ({
  default: () => <div data-testid="auth-register">AuthRegister</div>,
}));

vi.mock('components/core/Auth/components/AuthResetPassword', async (importOriginal) => {
  const actual = await importOriginal<typeof import('components/core/Auth/components/AuthResetPassword')>();
  return {
    ...actual,
    default: () => <div data-testid="auth-reset-password">AuthResetPassword</div>,
  };
});

describe('AuthDefaultVariant', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const createMockFields = (overrides?: Partial<IAuthFields>): IAuthFields => ({
    AuthenticationType: {
      value: AUTH_TYPES.LOGIN,
    },
    AuthenticationHeader: {
      value: 'Test Authentication Header',
    },
    BottomInfo: {
      value: 'Test Bottom Info',
    },
    CopyRightText: {
      value: 'Copyright © 2025',
    },
    WebsiteURL: {
      value: {
        href: "https://example.com",
        text: "example.com",
      },
    },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
    mockPathname.mockReturnValue('/');
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { pathname: '/' };
  });

  describe('Component Rendering', () => {
    it('should render component with test id', () => {
      const fields = createMockFields();
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.AUTH)).toBeInTheDocument();
    });

    it('should render empty div when fields are not provided', () => {
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={null as any} params={mockParams} />);

      const container = screen.getByTestId(TEST_CASE_DATA_IDS.AUTH);
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(0);
    });
  });

  describe('Authentication Header', () => {
    it('should render authentication header when provided', () => {
      const fields = createMockFields();
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByText('Test Authentication Header')).toBeInTheDocument();
      const richTextElements = screen.getAllByTestId('content-sdk-rich-text');
      expect(richTextElements.length).toBeGreaterThan(0);
      expect(richTextElements.some(el => el.textContent === 'Test Authentication Header')).toBe(true);
    });

    it('should not render header when value is empty', () => {
      const fields = createMockFields({ AuthenticationHeader: { value: '' } });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.queryByText('Test Authentication Header')).not.toBeInTheDocument();
    });

    it('should not render header when value is undefined', () => {
      const fields = createMockFields({ AuthenticationHeader: { value: undefined as any } });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.queryByText('Test Authentication Header')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Type Routing', () => {
    it('should render AuthLogin for LOGIN type', () => {
      const fields = createMockFields({ AuthenticationType: { value: AUTH_TYPES.LOGIN } });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-login')).toBeInTheDocument();
      expect(screen.queryByTestId('auth-register')).not.toBeInTheDocument();
      expect(screen.queryByTestId('auth-reset-password')).not.toBeInTheDocument();
    });

    it('should render AuthRegister for REGISTER type', () => {
      const fields = createMockFields({ AuthenticationType: { value: AUTH_TYPES.REGISTER } });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-register')).toBeInTheDocument();
      expect(screen.queryByTestId('auth-login')).not.toBeInTheDocument();
      expect(screen.queryByTestId('auth-reset-password')).not.toBeInTheDocument();
    });

    it('should render AuthResetPassword for RESET type', () => {
      // Ensure pathname is not /reset-password so it uses Sitecore field
      (window as any).location.pathname = '/';
      mockPathname.mockReturnValue('/');
      mockGet.mockReturnValue(null);
      const fields = createMockFields({ AuthenticationType: { value: AUTH_TYPES.RESET } });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-reset-password')).toBeInTheDocument();
      expect(screen.queryByTestId('auth-login')).not.toBeInTheDocument();
      expect(screen.queryByTestId('auth-register')).not.toBeInTheDocument();
    });

    it('should default to AuthLogin for unknown type', () => {
      const fields = createMockFields({ AuthenticationType: { value: 'Unknown' } });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-login')).toBeInTheDocument();
    });

    it('should default to AuthLogin when AuthenticationType is empty', () => {
      const fields = createMockFields({ AuthenticationType: { value: '' } });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-login')).toBeInTheDocument();
    });
  });

  describe('Bottom Info', () => {
    it('should render bottom info when provided', () => {
      const fields = createMockFields({ CopyRightText: { value: 'Copyright © 2025' } });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByText('Copyright © 2025')).toBeInTheDocument();
    });

    it('should render chevron icon in bottom info', () => {
      const fields = createMockFields({ CopyRightText: { value: 'Test Info' } });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      const icon = screen.getByTestId('chevron-right-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('stroke', '#0377BA');
      expect(icon).toHaveAttribute('width', '6');
      expect(icon).toHaveAttribute('height', '9');
    });

    it('should not render bottom info when CopyRightText field is missing', () => {
      const fields = createMockFields({ CopyRightText: undefined as unknown as IAuthFields['CopyRightText'] });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.queryByTestId('chevron-right-icon')).not.toBeInTheDocument();
    });

    it('should not render bottom info when CopyRightText field is null', () => {
      const fields = createMockFields({ CopyRightText: null as unknown as IAuthFields['CopyRightText'] });
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.queryByTestId('chevron-right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render AuthCard wrapper', () => {
      const fields = createMockFields();
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-card')).toBeInTheDocument();
    });

    it('should render all components in correct structure', () => {
      const fields = createMockFields();
      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.AUTH)).toBeInTheDocument();
      expect(screen.getByTestId('auth-card')).toBeInTheDocument();
      expect(screen.getByTestId('auth-login')).toBeInTheDocument();
    });
  });

  describe('Reset Flow Detection', () => {
    it('should detect reset flow from pathname /reset-password', () => {
      (window as any).location.pathname = '/reset-password';
      mockPathname.mockReturnValue('/reset-password');
      const fields = createMockFields();

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-reset-password')).toBeInTheDocument();
      expect(localStorage.getItem('okta_forgot_password_flow')).toBe('true');
    });

    it('should detect reset flow from pathname starting with /reset-password/', () => {
      (window as any).location.pathname = '/reset-password/reset';
      mockPathname.mockReturnValue('/reset-password/reset');
      const fields = createMockFields();

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-reset-password')).toBeInTheDocument();
      expect(localStorage.getItem('okta_forgot_password_flow')).toBe('true');
    });

    it('should set reset flow flag when pathname is /reset-password', () => {
      (window as any).location.pathname = '/reset-password';
      mockPathname.mockReturnValue('/reset-password');
      const fields = createMockFields();

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(localStorage.getItem('okta_forgot_password_flow')).toBe('true');
    });
  });

  describe('Mode Parameter Handling', () => {
    it('should detect reset flow from mode=reset parameter', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'mode') return 'reset';
        return null;
      });
      const fields = createMockFields();

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-reset-password')).toBeInTheDocument();
      expect(localStorage.getItem('okta_forgot_password_flow')).toBe('true');
    });

    it('should set reset flow flag when mode=reset parameter is present', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'mode') return 'reset';
        return null;
      });
      const fields = createMockFields();

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(localStorage.getItem('okta_forgot_password_flow')).toBe('true');
    });

    it('should prioritize pathname over mode parameter', () => {
      (window as any).location.pathname = '/reset-password';
      mockPathname.mockReturnValue('/reset-password');
      mockGet.mockImplementation((key: string) => {
        if (key === 'mode') return 'login';
        return null;
      });
      const fields = createMockFields();

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-reset-password')).toBeInTheDocument();
    });
  });

  describe('Login Path Detection', () => {
    it('should detect login flow from pathname /login', () => {
      (window as any).location.pathname = '/login';
      mockPathname.mockReturnValue('/login');
      const fields = createMockFields();

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('auth-login')).toBeInTheDocument();
      expect(localStorage.getItem('okta_forgot_password_flow')).toBeNull();
    });
  });

  describe('Email verify callbacks', () => {
    it('shows account activated message on register page', () => {
      (window as any).location.pathname = '/register';
      mockPathname.mockReturnValue('/register');
      mockGet.mockImplementation((key: string) => {
        if (key === 'activated') return 'true';
        return null;
      });
      const fields = createMockFields({ AuthenticationType: { value: AUTH_TYPES.REGISTER } });

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByText(/Account activated/)).toBeInTheDocument();
      expect(screen.getByText('Your account has been activated successfully. You can now sign in.')).toBeInTheDocument();
      expect(screen.queryByTestId('auth-register')).not.toBeInTheDocument();
    });

    it('shows OTP fallback guidance when verifyFallback is true', () => {
      (window as any).location.pathname = '/login';
      mockPathname.mockReturnValue('/login');
      mockGet.mockImplementation((key: string) => {
        if (key === 'verifyFallback') return 'true';
        if (key === 'otp') return '135790';
        return null;
      });
      const fields = createMockFields({ AuthenticationType: { value: AUTH_TYPES.LOGIN } });

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByText('Continue verification')).toBeInTheDocument();
      expect(screen.getByText(/OTP: 135790/)).toBeInTheDocument();
      expect(screen.getByText('AuthLogin')).toBeInTheDocument();
    });
  });

  describe('REGISTER Type Styling', () => {
    it('should apply min-h-screen class for REGISTER type', () => {
      const fields = createMockFields({ AuthenticationType: { value: AUTH_TYPES.REGISTER } });
      const { container } = render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      const containerElement = container.querySelector(`[data-testid="${TEST_CASE_DATA_IDS.AUTH}"]`);
      expect(containerElement).toHaveClass('min-h-screen');
    });

    it('should not apply min-h-screen class for LOGIN type', () => {
      const fields = createMockFields({ AuthenticationType: { value: AUTH_TYPES.LOGIN } });
      const { container } = render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      const containerElement = container.querySelector(`[data-testid="${TEST_CASE_DATA_IDS.AUTH}"]`);
      expect(containerElement).not.toHaveClass('min-h-screen');
    });

    it('should not apply min-h-screen class for RESET type', () => {
      const fields = createMockFields({ AuthenticationType: { value: AUTH_TYPES.RESET } });
      const { container } = render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      const containerElement = container.querySelector(`[data-testid="${TEST_CASE_DATA_IDS.AUTH}"]`);
      expect(containerElement).not.toHaveClass('min-h-screen');
    });
  });

  describe('Success states and navigation', () => {
    it('shows reset success message when localStorage flag is set on reset flow', () => {
      localStorage.setItem('okta_reset_password_success', 'true');
      (window as any).location.pathname = '/reset-password';
      mockPathname.mockReturnValue('/reset-password');
      const fields = createMockFields({ AuthenticationHeader: { value: 'Header' } });

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByText(AUTH_SUCCESS_MESSAGES.RESET_COMPLETE_MESSAGE)).toBeInTheDocument();
      expect(
        screen
          .getAllByTestId('content-sdk-rich-text')
          .some((el) => el.textContent?.includes(AUTH_SUCCESS_MESSAGES.RESET_TITLE))
      ).toBe(true);
      expect(screen.queryByTestId('auth-reset-password')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /sign in now/i }));
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('shows register success message when localStorage flag is set', () => {
      localStorage.setItem('okta_register_success', 'true');
      (window as any).location.pathname = '/register';
      mockPathname.mockReturnValue('/register');
      mockGet.mockReturnValue(null);
      const fields = createMockFields({
        AuthenticationType: { value: AUTH_TYPES.REGISTER },
        AuthenticationHeader: { value: 'Header' },
      });

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByText(AUTH_SUCCESS_MESSAGES.REGISTER_MESSAGE)).toBeInTheDocument();
      expect(
        screen
          .getAllByTestId('content-sdk-rich-text')
          .some((el) => el.textContent?.includes(AUTH_SUCCESS_MESSAGES.REGISTER_TITLE))
      ).toBe(true);
      expect(screen.queryByTestId('auth-register')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /go to login/i }));
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  describe('RTL footer chevron', () => {
    it('applies rotate-180 to chevron when document is rtl', () => {
      document.documentElement.setAttribute('dir', 'rtl');
      const fields = createMockFields();

      render(<AuthDefaultVariant testId={TEST_CASE_DATA_IDS.AUTH} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('chevron-right-icon')).toHaveClass('rotate-180');
      document.documentElement.removeAttribute('dir');
    });
  });
});

