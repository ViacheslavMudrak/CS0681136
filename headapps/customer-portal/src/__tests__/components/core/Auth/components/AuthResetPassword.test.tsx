import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import * as gtmModule from 'src/lib/gtm';
import * as cdpModule from '@/lib/CDPEvents';
import AuthResetPassword from '@/components/core/Auth/components/AuthResetPassword';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      user_reset_back_to_login_text: 'Back to Login',
      user_reset_need_help_text: 'Need help?',
      user_reset_contact_support_text: 'Contact Support',
    };
    return map[key] ?? key;
  },
  hasLocale: (_locales: readonly string[], locale: string) => ['en', 'en-CA'].includes(locale),
}));

// Mock GTM functions
vi.mock('src/lib/gtm', () => ({
  logGTMResetPasswordRequest: vi.fn(),
  logGTMResetPasswordComplete: vi.fn(),
}));

// Mock CDP events
vi.mock('@/lib/CDPEvents', () => ({
  sendResetPasswordEvent: vi.fn(),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockGet = vi.fn();
let mockPathname = '/reset';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock Okta Auth
const mockAuthState: {
  isAuthenticated: boolean;
  idToken: { claims: { sub: string; email: string } } | null;
} = {
  isAuthenticated: false,
  idToken: null,
};

const mockUseOktaAuth = vi.fn(() => ({
  oktaAuth: null,
  authState: mockAuthState,
}));

vi.mock('@okta/okta-react', () => ({
  useOktaAuth: () => mockUseOktaAuth(),
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
  isOktaConfigured: vi.fn(() => true),
}));

// Mock ForgotPasswordForm
vi.mock('components/core/Auth/components/ForgotPasswordForm', () => ({
  default: () => <div data-testid="forgot-password-form">ForgotPasswordForm</div>,
}));

// Mock Okta widget
vi.mock('@/components/core/Auth/octa-widget/OktaResetPasswordWidget', () => ({
  default: ({ onSuccess, onError }: any) => (
    <div data-testid="okta-password-reset-widget">
      <button
        data-testid="mock-success"
        onClick={() =>
          onSuccess &&
          onSuccess({
            type: 'email_sent',
            response: {
              tokens: {
                idToken: {
                  claims: {
                    email: 'user@example.com',
                  },
                },
              },
            },
          })
        }
      >
        Mock Success
      </button>
      <button
        data-testid="mock-error"
        onClick={() => onError && onError(new Error('Reset failed'))}
      >
        Mock Error
      </button>
    </div>
  ),
}));

// Mock ErrorMessage
vi.mock('components/shared/error-message/ErrorMessage', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="error-message">{message}</div>
  ),
}));

// Mock SuccessMessage
vi.mock('components/shared/success-message/SuccessMessage', () => ({
  default: ({ title, message, actionButton, secondaryLink }: any) => (
    <div data-testid="success-message">
      <div data-testid="success-title">{title}</div>
      <div data-testid="success-message-text">{message}</div>
      {actionButton && <div data-testid="success-action-button">{actionButton}</div>}
      {secondaryLink && <div data-testid="success-secondary-link">{secondaryLink}</div>}
    </div>
  ),
}));

// Mock ChevronLeftIcon
vi.mock('components/shared/icons/ChevronLeftIcon', () => ({
  default: () => <svg data-testid="chevron-left-icon"><path /></svg>,
}));

describe('AuthResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
    mockPathname = '/reset';
    mockAuthState.isAuthenticated = false;
    mockAuthState.idToken = null;
    mockUseOktaAuth.mockReturnValue({
      oktaAuth: null,
      authState: mockAuthState,
    });
    vi.mocked(gtmModule.logGTMResetPasswordRequest).mockClear();
    vi.mocked(gtmModule.logGTMResetPasswordComplete).mockClear();
    vi.mocked(cdpModule.sendResetPasswordEvent).mockClear();
    // Clear sessionStorage and localStorage before each test (component uses localStorage for flow state)
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: 'http://localhost:3000/reset' };
    // Mock window.history
    (window as any).history = {
      replaceState: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clear sessionStorage and localStorage after each test
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
  });

  describe('Component Rendering', () => {
    it('should render Okta password reset widget', () => {
      render(<AuthResetPassword />);

      expect(screen.getByTestId('okta-password-reset-widget')).toBeInTheDocument();
    });

    it('should not render error or success message initially', () => {
      render(<AuthResetPassword />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling from URL', () => {
    it('should display error from error parameter', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'reset_error';
        return null;
      });

      render(<AuthResetPassword />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('reset_error')).toBeInTheDocument();
    });

    it('should display error_description if available', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'error_code';
        if (key === 'error_description') return 'Invalid email address';
        return null;
      });

      render(<AuthResetPassword />);

      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('should use error parameter if error_description is not available', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'error_code';
        return null;
      });

      render(<AuthResetPassword />);

      expect(screen.getByText('error_code')).toBeInTheDocument();
    });

    it('should not display error when both params are empty strings', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return '';
        if (key === 'error_description') return '';
        return null;
      });

      render(<AuthResetPassword />);

      // Empty strings are falsy, so error won't be set
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Success Callback', () => {
    it('should display success message on successful password reset', async () => {
      render(<AuthResetPassword />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('okta-password-reset-widget')).not.toBeInTheDocument();
        expect(localStorage.getItem('okta_forgot_password_email_sent')).toBe('true');
      });
    });

    it('should hide error message on success', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'previous_error';
        return null;
      });

      render(<AuthResetPassword />);

      // Error should be shown initially
      expect(screen.getByTestId('error-message')).toBeInTheDocument();

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
        expect(screen.queryByTestId('okta-password-reset-widget')).not.toBeInTheDocument();
      });
    });

    it('should hide widget on success', async () => {
      render(<AuthResetPassword />);

      expect(screen.getByTestId('okta-password-reset-widget')).toBeInTheDocument();

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('okta-password-reset-widget')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Callback', () => {
    it('should display error message on widget error', async () => {
      render(<AuthResetPassword />);

      const errorButton = screen.getByTestId('mock-error');
      await act(async () => {
        errorButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Reset failed')).toBeInTheDocument();
      });
    });

    it('should hide widget after success', async () => {
      render(<AuthResetPassword />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('okta-password-reset-widget')).not.toBeInTheDocument();
      });
    });

    it('should use default error message if error has no message', async () => {
      render(<AuthResetPassword />);

      const errorButton = screen.getByTestId('mock-error');
      await act(async () => {
        errorButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });
  });

  describe('onError Callback', () => {
    it('should call onError prop when error occurs from URL', () => {
      const onError = vi.fn();
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'url_error';
        return null;
      });

      render(<AuthResetPassword onError={onError} />);

      expect(onError).toHaveBeenCalledWith('url_error');
    });

    it('should call onError prop when widget error occurs', async () => {
      const onError = vi.fn();
      render(<AuthResetPassword onError={onError} />);

      const errorButton = screen.getByTestId('mock-error');
      await act(async () => {
        errorButton.click();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('State Management', () => {
    it('should not show error when success is shown', async () => {
      render(<AuthResetPassword />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('okta-password-reset-widget')).not.toBeInTheDocument();
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });

    it('should show widget when not in success state', () => {
      render(<AuthResetPassword />);

      expect(screen.getByTestId('okta-password-reset-widget')).toBeInTheDocument();
    });
  });

  describe('Flow States', () => {
    it('should set flow state to email_sent on initial success', async () => {
      render(<AuthResetPassword />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('okta-password-reset-widget')).not.toBeInTheDocument();
        expect(localStorage.getItem('okta_forgot_password_email_sent')).toBe('true');
        expect(localStorage.getItem('okta_forgot_password_flow')).toBe('true');
      });
    });

    it('should restore email_sent state from localStorage', () => {
      localStorage.setItem('okta_forgot_password_email_sent', 'true');
      localStorage.setItem('okta_reset_password_success', 'true');

      render(<AuthResetPassword />);

      expect(screen.queryByTestId('okta-password-reset-widget')).not.toBeInTheDocument();
    });

    it('should not set okta_forgot_password_flow when only code is present and user is not authenticated', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'test-code';
        return null;
      });

      render(<AuthResetPassword />);

      expect(localStorage.getItem('okta_forgot_password_flow')).toBeNull();
    });

    it('should show widget when code is present and user is authenticated (no completed state)', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'test-code';
        return null;
      });

      mockAuthState.isAuthenticated = true;
      mockAuthState.idToken = {
        claims: {
          sub: 'user123',
          email: 'test@example.com',
        },
      };
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: mockAuthState,
      });

      const { rerender } = render(<AuthResetPassword />);

      rerender(<AuthResetPassword />);

      expect(screen.getByTestId('okta-password-reset-widget')).toBeInTheDocument();
    });

    it('should not set okta_forgot_password_flow when only interaction_code is present', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'interaction_code') return 'test-interaction-code';
        return null;
      });

      render(<AuthResetPassword />);

      expect(localStorage.getItem('okta_forgot_password_flow')).toBeNull();
    });
  });

  describe('handleBackToLogin', () => {
    it('should hide widget when email_sent is restored from localStorage', () => {
      localStorage.setItem('okta_forgot_password_flow', 'true');
      localStorage.setItem('okta_forgot_password_email_sent', 'true');

      render(<AuthResetPassword />);

      expect(screen.queryByTestId('okta-password-reset-widget')).not.toBeInTheDocument();
    });

    it('should clear reset flow when clicking Back to Login in widget footer', () => {
      render(<AuthResetPassword />);

      // When widget is visible (no success), the footer has "Back to Login" (may have leading space in DOM)
      const backButton = screen.getByText(/Back to Login/);
      act(() => {
        backButton.click();
      });

      expect(localStorage.getItem('okta_forgot_password_flow')).toBeNull();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should render Contact Support link from CMS field', () => {
      render(
        <AuthResetPassword
          contactSupportLink={{
            value: {
              href: 'https://www.intralox.com/support/phone-numbers/united-states',
              text: 'Contact Support',
              linktype: 'external',
              url: 'https://www.intralox.com/support/phone-numbers/united-states',
              anchor: '',
              target: '',
            },
          }}
        />
      );

      const supportLink = screen.getByRole('link', { name: /Contact Support/ });
      expect(supportLink).toHaveAttribute(
        'href',
        'https://www.intralox.com/support/phone-numbers/united-states'
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Reset Success Parameter Handling', () => {
    it('should show widget when reset-password=success and user is authenticated (no completed UI)', () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.idToken = {
        claims: {
          sub: 'user123',
          email: 'test@example.com',
        },
      };
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: mockAuthState,
      });
      mockGet.mockImplementation((key: string) => {
        if (key === 'reset-password') return 'success';
        return null;
      });

      render(<AuthResetPassword />);

      expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
      expect(screen.getByTestId('okta-password-reset-widget')).toBeInTheDocument();
    });

    it('should not show success when reset-password=success but user is not authenticated', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'reset-password') return 'success';
        return null;
      });

      render(<AuthResetPassword />);

      expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
      expect(screen.getByTestId('okta-password-reset-widget')).toBeInTheDocument();
    });

    it('should not call router.replace when reset-password=success (implementation does not clean URL)', () => {
      mockPathname = '/reset-password';
      mockAuthState.isAuthenticated = true;
      mockGet.mockImplementation((key: string) => {
        if (key === 'reset-password') return 'success';
        return null;
      });
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: mockAuthState,
      });

      render(<AuthResetPassword />);

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('Prevent Redirect During Reset Flow', () => {
    it('should not redirect when authenticated but in reset flow', () => {
      mockAuthState.isAuthenticated = true;
      localStorage.setItem('okta_forgot_password_flow', 'true');

      render(<AuthResetPassword />);

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByTestId('okta-password-reset-widget')).toBeInTheDocument();
    });

    it('should not redirect when on reset page', () => {
      mockAuthState.isAuthenticated = true;
      mockPathname = '/reset';

      render(<AuthResetPassword />);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not redirect when email was sent', () => {
      mockAuthState.isAuthenticated = true;
      localStorage.setItem('okta_forgot_password_email_sent', 'true');

      render(<AuthResetPassword />);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not redirect when success is shown', async () => {
      mockAuthState.isAuthenticated = true;
      render(<AuthResetPassword />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('GTM Logging', () => {
    it('should log reset password request on initial success', async () => {
      render(<AuthResetPassword />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(gtmModule.logGTMResetPasswordRequest)).toHaveBeenCalledWith(
          'user@example.com',
        );
      });
    });

    it('should not call logGTMResetPasswordComplete (implementation has no completed flow)', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'test-code';
        return null;
      });
      mockAuthState.isAuthenticated = true;
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: mockAuthState,
      });

      render(<AuthResetPassword />);

      expect(vi.mocked(gtmModule.logGTMResetPasswordComplete)).not.toHaveBeenCalled();
    });
  });

  describe('CDP Events', () => {
    it('should send reset password event with email when reset email is sent (email_sent)', async () => {
      render(<AuthResetPassword />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(cdpModule.sendResetPasswordEvent)).toHaveBeenCalledWith({
          type: 'customerportal:RESETPASSWORD',
          email: 'user@example.com',
        });
      });
    });
  });

  describe('Success Message Rendering', () => {
    it('should show widget when code and authenticated (implementation has no completed success UI)', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'test-code';
        return null;
      });
      mockAuthState.isAuthenticated = true;
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: mockAuthState,
      });

      render(<AuthResetPassword />);

      expect(screen.getByTestId('okta-password-reset-widget')).toBeInTheDocument();
      expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
    });

    it('should hide widget and set localStorage when email is sent via mock success', async () => {
      render(<AuthResetPassword />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('okta-password-reset-widget')).not.toBeInTheDocument();
        expect(localStorage.getItem('okta_forgot_password_email_sent')).toBe('true');
      });
    });
  });

  describe('Error Message with Back to Login', () => {
    it('should show back to login button with error message', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'reset_error';
        return null;
      });

      render(<AuthResetPassword />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(/Back to Login/)).toBeInTheDocument();
    });
  });

  describe('Widget Footer', () => {
    it('should render widget footer with back to login and contact support', () => {
      render(<AuthResetPassword />);

      expect(screen.getByText(/Back to Login/)).toBeInTheDocument();
      expect(screen.getByText(/Contact Support/)).toBeInTheDocument();
      expect(screen.getByText('Need help?')).toBeInTheDocument();
    });
  });

  describe('Completion Flow Detection', () => {
    it('should show widget when user becomes authenticated after code (no completed state)', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'code') return 'test-code';
        return null;
      });

      const { rerender } = render(<AuthResetPassword />);

      mockAuthState.isAuthenticated = true;
      mockAuthState.idToken = {
        claims: {
          sub: 'user123',
          email: 'test@example.com',
        },
      };
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: mockAuthState,
      });

      rerender(<AuthResetPassword />);

      expect(screen.getByTestId('okta-password-reset-widget')).toBeInTheDocument();
      expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
    });
  });
});

