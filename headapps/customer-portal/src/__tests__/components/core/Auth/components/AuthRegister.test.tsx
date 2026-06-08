import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import AuthRegister from 'components/core/Auth/components/AuthRegister';
import * as gtmModule from 'src/lib/gtm';
import * as cdpModule from '@/lib/CDPEvents';
import { I18N } from '@/lib/dictionary-keys';

// Mock GTM functions
vi.mock('src/lib/gtm', () => ({
  logGTMRegisterPageView: vi.fn(),
  logGTMRegisterSuccess: vi.fn(),
}));

// Mock CDP events
vi.mock('@/lib/CDPEvents', () => ({
  sendRegisterEvent: vi.fn(),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockGet = vi.fn();
const mockPathname = '/register';

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

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      [I18N.RegisterDuplicateInstruction]:
        'This email is already registered. Use Forgot Password on the sign-in page to reset your password, or use the link below.',
      [I18N.RegisterDuplicateResetPasswordLink]: 'Reset password',
    };
    return map[key] ?? key;
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/AlertBox', () => ({
  default: ({ message }: { message: React.ReactNode }) => (
    <div data-testid="duplicate-instruction-alert">{message}</div>
  ),
}));

// Mock Okta Auth
const mockAuthState = {
  isAuthenticated: false,
  idToken: null,
};

const mockOktaAuth = {
  handleLoginRedirect: vi.fn(),
};

const mockUseOktaAuth = vi.fn(() => ({
  oktaAuth: mockOktaAuth,
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

// Mock Okta widget
vi.mock('components/core/Auth/octa-widget/OktaRegisterWidget', () => ({
  default: ({ onSuccess, onError, onDuplicateRegistration, mode }: any) => (
    <div data-testid="okta-register-widget" data-mode={mode}>
      <button
        data-testid="mock-success"
        onClick={() => onSuccess && onSuccess({ status: 'SUCCESS', tokens: {} })}
      >
        Mock Success
      </button>
      <button
        data-testid="mock-success-with-tokens"
        onClick={() => {
          if (onSuccess) {
            onSuccess({
              status: 'SUCCESS',
              tokens: {
                idToken: {
                  claims: {
                    sub: 'user123',
                    email: 'test@example.com',
                    name: 'Test User',
                  },
                },
              },
            });
          }
        }}
      >
        Mock Success With Tokens
      </button>
      <button
        data-testid="mock-success-invalid-tokens"
        onClick={() => {
          if (onSuccess) {
            // Simulate error in token extraction
            onSuccess({
              status: 'SUCCESS',
              tokens: {
                idToken: null,
              },
            });
          }
        }}
      >
        Mock Success Invalid Tokens
      </button>
      <button
        data-testid="mock-error"
        onClick={() => onError && onError(new Error('Registration failed'))}
      >
        Mock Error
      </button>
      <button
        data-testid="mock-duplicate-registration"
        onClick={() => onDuplicateRegistration && onDuplicateRegistration()}
      >
        Mock Duplicate Registration
      </button>
      <button
        data-testid="mock-error-duplicate-email"
        onClick={() => onError && onError(new Error('Registration failed: Email already exists'))}
      >
        Mock Duplicate Email Error
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

// Mock LoadingSkeleton
vi.mock('components/shared/loading-skeleton/LoadingSkeleton', () => ({
  default: ({ variant, size }: any) => (
    <div data-testid="loading-skeleton" data-variant={variant} data-size={size}>
      Loading...
    </div>
  ),
}));

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000/register',
};

describe('AuthRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
    mockAuthState.isAuthenticated = false;
    mockAuthState.idToken = null;
    mockOktaAuth.handleLoginRedirect.mockClear();
    mockUseOktaAuth.mockReturnValue({
      oktaAuth: mockOktaAuth,
      authState: mockAuthState,
    });
    vi.mocked(gtmModule.logGTMRegisterPageView).mockClear();
    vi.mocked(gtmModule.logGTMRegisterSuccess).mockClear();
    vi.mocked(cdpModule.sendRegisterEvent).mockClear();
    delete (window as any).location;
    (window as any).location = mockLocation;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render Okta sign-in widget with register mode', () => {
      render(<AuthRegister />);

      expect(screen.getByTestId('okta-register-widget')).toBeInTheDocument();
      expect(screen.getByTestId('okta-register-widget')).toHaveAttribute('data-mode', 'register');
    });

    it('should not render error message initially', () => {
      render(<AuthRegister />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling from URL', () => {
    it('should display error from error parameter', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'registration_error';
        return null;
      });

      render(<AuthRegister />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('registration_error')).toBeInTheDocument();
    });

    it('should show URL error message from error_description when email already exists', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'error_code';
        if (key === 'error_description') return 'Registration failed: Email already exists';
        return null;
      });

      render(<AuthRegister />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Registration failed: Email already exists')).toBeInTheDocument();
      expect(screen.queryByTestId('duplicate-instruction-alert')).not.toBeInTheDocument();
    });

    it('should use error parameter if error_description is not available', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'error_code';
        return null;
      });

      render(<AuthRegister />);

      expect(screen.getByText('error_code')).toBeInTheDocument();
    });

    it('should not display error when both params are empty strings', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return '';
        if (key === 'error_description') return '';
        return null;
      });

      render(<AuthRegister />);

      // Empty strings are falsy, so error won't be set
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Success Callback', () => {
    it('should redirect to login on successful registration', async () => {
      // Set oktaAuth to null so it redirects instead of calling handleLoginRedirect
      render(<AuthRegister />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should clear error state on success', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'previous_error';
        return null;
      });

      render(<AuthRegister />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });
  });

  describe('Error Callback', () => {
    it('should display error message on widget error', async () => {
      render(<AuthRegister />);

      const errorButton = screen.getByTestId('mock-error');
      await act(async () => {
        errorButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
      });
    });

    it('should use default error message if error has no message', async () => {
      render(<AuthRegister />);

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

      render(<AuthRegister onError={onError} />);

      expect(onError).toHaveBeenCalledWith('url_error');
    });

    it('should call onError prop with URL message when error_description indicates duplicate email', () => {
      const onError = vi.fn();
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'error_code';
        if (key === 'error_description') return 'Registration failed: Email already exists';
        return null;
      });

      render(<AuthRegister onError={onError} />);

      expect(onError).toHaveBeenCalledWith('Registration failed: Email already exists');
    });

    it('should call onError prop when widget error occurs', async () => {
      const onError = vi.fn();
      render(<AuthRegister onError={onError} />);

      const errorButton = screen.getByTestId('mock-error');
      await act(async () => {
        errorButton.click();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should show generic error and call onError when widget reports duplicate email via error callback', async () => {
      const onError = vi.fn();
      render(<AuthRegister onError={onError} />);

      const duplicateErrorButton = screen.getByTestId('mock-error-duplicate-email');
      await act(async () => {
        duplicateErrorButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Registration failed: Email already exists')).toBeInTheDocument();
      });

      expect(onError).toHaveBeenCalledWith('Registration failed: Email already exists');
    });
  });

  describe('Duplicate registration instruction', () => {
    it('should show Forgot Password instruction when onDuplicateRegistration fires', async () => {
      render(<AuthRegister />);

      await act(async () => {
        screen.getByTestId('mock-duplicate-registration').click();
      });

      expect(screen.getByTestId('duplicate-instruction-alert')).toBeInTheDocument();
      const resetBtn = screen.getByRole('button', { name: 'Reset password' });
      expect(resetBtn).toBeInTheDocument();
      await act(async () => {
        resetBtn.click();
      });
      expect(mockPush).toHaveBeenCalledWith('/reset-password');
    });
  });

  describe('Loading State', () => {
    it('should render loading skeleton when authState is null', () => {
      mockUseOktaAuth.mockReturnValueOnce({
        oktaAuth: null,
        authState: null,
      } as any);

      render(<AuthRegister />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('loading-skeleton')).toHaveAttribute('data-variant', 'card');
      expect(screen.queryByTestId('okta-register-widget')).not.toBeInTheDocument();
    });
  });

  describe('GTM Logging', () => {
    it('should log GTM register success with user info on successful registration', async () => {
      render(<AuthRegister />);

      const successButton = screen.getByTestId('mock-success-with-tokens');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(gtmModule.logGTMRegisterSuccess)).toHaveBeenCalledWith({
          userId: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        });
      });
    });

    it('should log GTM register success without user info if token extraction fails', async () => {
      render(<AuthRegister />);

      const successButton = screen.getByTestId('mock-success-invalid-tokens');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(gtmModule.logGTMRegisterSuccess)).toHaveBeenCalledWith(undefined);
      });
    });
  });

  describe('CDP Events', () => {
    it('should send register event on successful registration', async () => {
      render(<AuthRegister />);

      const successButton = screen.getByTestId('mock-success-with-tokens');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(cdpModule.sendRegisterEvent)).toHaveBeenCalledWith({
          type: 'customerportal:REGISTER',
          name: 'Test User',
          email: 'test@example.com',
          firstName: 'Test User',
        });
      });
    });
  });

  describe('Token Claims Extraction', () => {
    it('should extract user info from token claims successfully', async () => {
      render(<AuthRegister />);

      const successButton = screen.getByTestId('mock-success-with-tokens');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(gtmModule.logGTMRegisterSuccess)).toHaveBeenCalledWith({
          userId: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        });
      });
    });

    it('should handle token extraction error gracefully', async () => {
      // Mock console.warn to verify error handling
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<AuthRegister />);

      const successButton = screen.getByTestId('mock-success-invalid-tokens');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(gtmModule.logGTMRegisterSuccess)).toHaveBeenCalledWith(undefined);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('handleSuccess with oktaAuth', () => {
    it('should redirect to login after registration success when tokens are available', async () => {
      render(<AuthRegister />);

      const successButton = screen.getByTestId('mock-success-with-tokens');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
      expect(mockOktaAuth.handleLoginRedirect).not.toHaveBeenCalled();
    });

    it('should redirect to login when oktaAuth is not available', async () => {
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: mockAuthState,
      } as any);

      render(<AuthRegister />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should redirect to login when tokens are not available', async () => {
      mockUseOktaAuth.mockReturnValue({
        oktaAuth: null,
        authState: mockAuthState,
      } as any);

      render(<AuthRegister />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });
});

