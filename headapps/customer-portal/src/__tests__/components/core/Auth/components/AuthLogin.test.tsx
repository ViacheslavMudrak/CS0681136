import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React, { act } from 'react';
import AuthLogin from 'components/core/Auth/components/AuthLogin';
import * as gtmModule from 'src/lib/gtm';
import * as cdpModule from '@/lib/CDPEvents';
import { AUTH_METHODS, AUTH_ERROR_MESSAGES } from '@/helpers/enums';
import * as localeCookie from '@/lib/locale-cookie';
import { setTokensInLocalStorage } from '@/lib/okta-auth-client';
import { fetchUserProfile } from '@/lib/apis/user-profile-api';

const { mockResolvePostLoginDestination } = vi.hoisted(() => ({
  mockResolvePostLoginDestination: vi.fn(),
}));

vi.mock('@/lib/auth-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth-utils')>();
  return {
    ...actual,
    resolvePostLoginDestination: mockResolvePostLoginDestination,
  };
});

// Mock GTM functions
vi.mock('src/lib/gtm', () => ({
  logGTMLoginPageView: vi.fn(),
  logGTMLoginSuccess: vi.fn(),
  logGTMLoginFailure: vi.fn(),
}));

// Mock CDP events
vi.mock('@/lib/CDPEvents', () => ({
  sendLoginEvent: vi.fn(),
  sendIdentityEvent: vi.fn(),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockGet = vi.fn();
const mockPathname = '/login';

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
  idToken: { claims?: { sub?: string; email?: string; name?: string } } | null;
} = {
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
  LoginCallback: ({
    errorComponent: ErrorComponent,
    loadingElement,
  }: {
    errorComponent: (props: { error: { message?: string } }) => React.ReactNode;
    loadingElement: React.ReactNode;
  }) => (
    <div data-testid="login-callback">
      <div data-testid="login-callback-loading">{loadingElement}</div>
      {ErrorComponent ? <ErrorComponent error={{ message: 'Okta callback failed' }} /> : null}
    </div>
  ),
  useOktaAuth: () => mockUseOktaAuth(),
}));

vi.mock('@/lib/okta-auth-client', async (importOriginal) => {
  const { createOktaAuthClientVitestMock } = await import('@/test/mocks/okta-auth-client-vitest');
  return createOktaAuthClientVitestMock(importOriginal, {
    setTokensInLocalStorage: vi.fn(),
  });
});

vi.mock('@/lib/apis/user-profile-api', () => ({
  fetchUserProfile: vi.fn(),
}));

vi.mock('@/lib/locale-cookie', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/locale-cookie')>();
  return {
    ...actual,
    getPreferredLocalePath: vi.fn(actual.getPreferredLocalePath),
  };
});

// Mock Okta widget - use a variable to store onSuccess callback for dynamic tokens
let mockOnSuccessCallback: ((tokens: any) => void) | null = null;
let mockOnErrorCallback: ((error: Error) => void) | null = null;

vi.mock('components/core/Auth/octa-widget/OktaSignInWidget', () => ({
  default: ({ onSuccess, onError, mode }: any) => {
    mockOnSuccessCallback = onSuccess;
    mockOnErrorCallback = onError;
    const fullTokens = {
      accessToken: 'client-access-token',
      idToken: {
        idToken: 'raw-id-token',
        claims: {
          sub: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      refreshToken: 'refresh-token',
      expiresAt: Math.floor(Date.now() / 1000) + 7200,
    };
    return (
      <div data-testid="okta-sign-in-widget" data-mode={mode}>
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
          data-testid="mock-success-with-access-token"
          onClick={() => onSuccess && onSuccess({ status: 'SUCCESS', tokens: fullTokens })}
        >
          Mock Success Full Tokens
        </button>
        <button
          data-testid="mock-success-access-no-expires"
          onClick={() =>
            onSuccess &&
            onSuccess({
              status: 'SUCCESS',
              tokens: {
                accessToken: 'client-access-token',
                idToken: fullTokens.idToken,
                refreshToken: fullTokens.refreshToken,
              },
            })
          }
        >
          Mock Success No ExpiresAt
        </button>
        <button
          data-testid="mock-error"
          onClick={() => onError && onError(new Error('Test error'))}
        >
          Mock Error
        </button>
        <button
          data-testid="mock-error-empty-message"
          onClick={() => onError && onError(new Error(''))}
        >
          Mock Error Empty Message
        </button>
      </div>
    );
  },
}));

// Mock ErrorMessage
vi.mock('components/shared/error-message/ErrorMessage', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="error-message">{message}</div>
  ),
}));

// Mock LoadingSkeleton
vi.mock('components/shared/loading-skeleton/LoadingSkeleton', () => ({
  default: ({ variant, size, message }: any) => (
    <div data-testid="loading-skeleton" data-variant={variant} data-size={size}>
      {message ?? 'Loading...'}
    </div>
  ),
}));

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('AuthLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
    localStorage.removeItem('okta_reset_flow');
    mockGet.mockReturnValue(null);
    mockAuthState.isAuthenticated = false;
    mockAuthState.idToken = null;
    vi.mocked(gtmModule.logGTMLoginPageView).mockClear();
    vi.mocked(gtmModule.logGTMLoginSuccess).mockClear();
    vi.mocked(gtmModule.logGTMLoginFailure).mockClear();
    vi.mocked(cdpModule.sendLoginEvent).mockClear();
    mockOktaAuth.handleLoginRedirect.mockClear();
    mockUseOktaAuth.mockReturnValue({
      oktaAuth: mockOktaAuth,
      authState: mockAuthState,
    });
    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:3000/login',
      origin: 'http://localhost:3000',
      assign: vi.fn(),
    };
    // Mock window.history
    (window as any).history = {
      replaceState: vi.fn(),
    };
    global.fetch = vi.fn();
    vi.mocked(setTokensInLocalStorage).mockClear();
    vi.mocked(fetchUserProfile).mockReset();
    vi.mocked(localeCookie.getPreferredLocalePath).mockClear();
    mockResolvePostLoginDestination.mockImplementation(async (options) => {
      const actual = await vi.importActual<typeof import("@/lib/auth-utils")>("@/lib/auth-utils");
      return actual.resolvePostLoginDestination(options);
    });
    /** {@link resolvePostLoginDestination} sends users without company links to /account-submitted */
    vi.mocked(fetchUserProfile).mockResolvedValue({
      parentContact: [{ id: 'parent-1' }],
      isMultipleParent: false,
      isDomainRestricted: false,
      leads: [],
    } as Awaited<ReturnType<typeof fetchUserProfile>>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render Okta sign-in widget', () => {
      render(<AuthLogin />);

      expect(screen.getByTestId('okta-sign-in-widget')).toBeInTheDocument();
      expect(screen.getByTestId('okta-sign-in-widget')).toHaveAttribute('data-mode', 'signin');
    });

    it('should not render error message initially', () => {
      render(<AuthLogin />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Success Callback', () => {
    it('should handle successful login', async () => {
      mockGet.mockReturnValue(null);

      render(<AuthLogin />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });

    it('should store returnUrl in sessionStorage on success', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'returnUrl') return '/dashboard';
        return null;
      });

      render(<AuthLogin />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockSessionStorage.getItem('login_return_url')).toBe('/dashboard');
      });
    });

    it('should use default returnUrl if not provided', async () => {
      mockGet.mockReturnValue(null);

      render(<AuthLogin />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockSessionStorage.getItem('login_return_url')).toBe('/');
      });
    });
  });

  describe('Error Callback', () => {
    it('should display error message on widget error', async () => {
      render(<AuthLogin />);

      const errorButton = screen.getByTestId('mock-error');
      await act(async () => {
        errorButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });

    it('should use default error message if error has no message', async () => {
      render(<AuthLogin />);

      // Simulate error with empty message
      const errorButton = screen.getByTestId('mock-error');
      await act(async () => {
        // Call onError directly with empty error
        errorButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });
  });

  describe('onError Callback', () => {
    it('should call onError prop when widget error occurs', async () => {
      const onError = vi.fn();
      render(<AuthLogin onError={onError} />);

      const errorButton = screen.getByTestId('mock-error');
      await act(async () => {
        errorButton.click();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should render loading skeleton when authState is null', () => {
      mockUseOktaAuth.mockReturnValueOnce({
        oktaAuth: null,
        authState: null,
      } as any);

      render(<AuthLogin />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('loading-skeleton')).toHaveAttribute('data-variant', 'card');
      expect(screen.queryByTestId('okta-sign-in-widget')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    it('should render widget when authenticated but in reset flow', () => {
      mockAuthState.isAuthenticated = true;
      mockGet.mockImplementation((key: string) => {
        if (key === 'mode') return 'reset';
        return null;
      });
      localStorage.setItem('okta_reset_flow', 'true');

      render(<AuthLogin />);

      expect(screen.getByTestId('okta-sign-in-widget')).toBeInTheDocument();
      localStorage.removeItem('okta_reset_flow');
    });

    it('should render widget when authenticated with reset flow in localStorage', () => {
      mockAuthState.isAuthenticated = true;
      mockGet.mockReturnValue(null);
      localStorage.setItem('okta_reset_flow', 'true');

      render(<AuthLogin />);

      expect(screen.getByTestId('okta-sign-in-widget')).toBeInTheDocument();
      localStorage.removeItem('okta_reset_flow');
    });
  });

  describe('GTM Logging', () => {
    it('should log GTM login success with user info on successful login', async () => {
      render(<AuthLogin />);

      const successButton = screen.getByTestId('mock-success-with-tokens');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(gtmModule.logGTMLoginSuccess)).toHaveBeenCalledWith({
          userId: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          authMethod: AUTH_METHODS.PASSWORD,
        });
      });
    });

    it('should log GTM login success without user info if token extraction fails', async () => {
      render(<AuthLogin />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(gtmModule.logGTMLoginSuccess)).toHaveBeenCalledWith({
          authMethod: AUTH_METHODS.PASSWORD,
        });
      });
    });
  });

  describe('CDP Events', () => {
    it('should send login event on successful login', async () => {
      render(<AuthLogin />);

      const successButton = screen.getByTestId('mock-success-with-tokens');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(vi.mocked(cdpModule.sendLoginEvent)).toHaveBeenCalledWith({
          type: 'customerportal:LOGIN',
          userId: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          auth_method: AUTH_METHODS.PASSWORD,
        });
      });
    });
  });

  describe('ReturnUrl Filtering', () => {
    it('should filter out callback URLs from returnUrl', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'returnUrl') return encodeURIComponent('/authorization/verify?code=123');
        return null;
      });

      render(<AuthLogin />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockSessionStorage.getItem('login_return_url')).toBe('/');
      });
    });

    it('should use returnUrl if it does not contain callback', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'returnUrl') return '/profile';
        return null;
      });

      render(<AuthLogin />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockSessionStorage.getItem('login_return_url')).toBe('/profile');
      });
    });

    it('should use default returnUrl if returnUrl is root', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'returnUrl') return '/';
        return null;
      });

      render(<AuthLogin />);

      const successButton = screen.getByTestId('mock-success');
      await act(async () => {
        successButton.click();
      });

      await waitFor(() => {
        expect(mockSessionStorage.getItem('login_return_url')).toBe('/');
      });
    });
  });

  describe('Reset Flow Handling', () => {
    it('should render widget when in reset flow and authenticated', async () => {
      mockAuthState.isAuthenticated = true;
      mockGet.mockImplementation((key: string) => {
        if (key === 'mode') return 'reset';
        return null;
      });
      localStorage.setItem('okta_reset_flow', 'true');

      render(<AuthLogin />);

      expect(screen.getByTestId('okta-sign-in-widget')).toBeInTheDocument();
      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
      localStorage.removeItem('okta_reset_flow');
    });

    it('should render widget when reset flow is in localStorage and authenticated', async () => {
      mockAuthState.isAuthenticated = true;
      mockGet.mockReturnValue(null);
      localStorage.setItem('okta_reset_flow', 'true');

      render(<AuthLogin />);

      expect(screen.getByTestId('okta-sign-in-widget')).toBeInTheDocument();
      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
      localStorage.removeItem('okta_reset_flow');
    });
  });

  describe('Force Refresh Flag', () => {
    it('should clear force refresh flag after using it', () => {
      const localStore: Record<string, string> = { okta_force_refresh: 'true' };
      const getItem = vi.fn((key: string) => localStore[key] ?? null);
      const removeItem = vi.fn((key: string) => {
        delete localStore[key];
      });
      Object.defineProperty(window, 'localStorage', {
        value: { getItem, setItem: vi.fn(), removeItem, clear: vi.fn() },
        writable: true,
      });

      render(<AuthLogin />);

      expect(removeItem).toHaveBeenCalledWith('okta_force_refresh');
    });
  });

  describe('OAuth callback UI', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
      vi.mocked(console.error).mockRestore();
    });

    it('renders LoginCallback loading when OAuth code is present', () => {
      mockGet.mockImplementation((key: string) => (key === 'code' ? 'abc' : null));
      render(<AuthLogin />);

      expect(screen.getByTestId('login-callback')).toBeInTheDocument();
      expect(screen.getByTestId('loading-skeleton')).toHaveAttribute('data-variant', 'spinner');
      expect(screen.getByText(/Validating authentication/i)).toBeInTheDocument();
    });

    it('renders error UI and returns to login from callback error state', () => {
      mockGet.mockImplementation((key: string) => (key === 'code' ? 'abc' : null));
      render(<AuthLogin />);

      expect(screen.getByText('Authentication failed. Please try again.')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /return to login/i }));
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('OAuth stale interaction_required cleanup', () => {
    it('replaces URL when error is interaction_required and no OAuth params', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'interaction_required';
        return null;
      });
      render(<AuthLogin />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Token exchange and redirect', () => {
    it('redirects via location.assign when token API returns redirectUrl and server access_token', async () => {
      vi.mocked(global.fetch as unknown as typeof fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          redirectUrl: 'http://localhost:3000/dashboard',
          access_token: 'server-at',
        }),
      } as unknown as Response);

      render(<AuthLogin />);

      await act(async () => {
        screen.getByTestId('mock-success-with-access-token').click();
      });

      await waitFor(() => {
        expect(setTokensInLocalStorage).toHaveBeenCalledWith('server-at', null, null);
        expect((window as unknown as { location: { assign: ReturnType<typeof vi.fn> } }).location.assign).toHaveBeenCalledWith('/');
      });
    });

    it('uses widget access tokens when API response has no access_token', async () => {
      vi.mocked(global.fetch as unknown as typeof fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ redirectUrl: 'http://localhost:3000/dashboard' }),
      } as unknown as Response);

      render(<AuthLogin />);

      await act(async () => {
        screen.getByTestId('mock-success-with-access-token').click();
      });

      await waitFor(() => {
        expect(setTokensInLocalStorage).toHaveBeenCalledWith(
          'client-access-token',
          expect.anything(),
          expect.anything()
        );
        expect((window as unknown as { location: { assign: ReturnType<typeof vi.fn> } }).location.assign).toHaveBeenCalledWith('/');
      });
    });

    it('applies locale from user profile for Sitecore paths', async () => {
      mockResolvePostLoginDestination.mockResolvedValue('/fr/welcome');
      vi.mocked(global.fetch as unknown as typeof fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          redirectUrl: 'http://localhost:3000/en/welcome?x=1',
          access_token: 'server-at',
        }),
      } as unknown as Response);
      vi.mocked(fetchUserProfile).mockResolvedValue({
        parentContact: [{ id: 'parent-1' }],
        userPreference: { defaultLanguage: 'fr' },
      } as Awaited<ReturnType<typeof fetchUserProfile>>);
      vi.mocked(localeCookie.getPreferredLocalePath).mockReturnValue('/fr/welcome');

      render(<AuthLogin />);

      await act(async () => {
        screen.getByTestId('mock-success-with-access-token').click();
      });

      await waitFor(() => {
        expect(mockResolvePostLoginDestination).toHaveBeenCalled();
        expect((window as unknown as { location: { assign: ReturnType<typeof vi.fn> } }).location.assign).toHaveBeenCalledWith('/fr/welcome');
      });
    });

    it('falls back to location.assign when token API fetch throws', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        vi.mocked(global.fetch as unknown as typeof fetch).mockRejectedValue(new Error('network'));

        render(<AuthLogin />);

        await act(async () => {
          screen.getByTestId('mock-success-with-access-token').click();
        });

        await waitFor(() => {
          expect((window as unknown as { location: { assign: ReturnType<typeof vi.fn> } }).location.assign).toHaveBeenCalled();
        });
      } finally {
        vi.mocked(console.warn).mockRestore();
      }
    });

    it('uses expires_in 3600 when token response omits expiresAt', async () => {
      const fetchMock = vi.mocked(global.fetch as unknown as typeof fetch);
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ redirectUrl: 'http://localhost:3000/dashboard' }),
      } as unknown as Response);

      render(<AuthLogin />);

      await act(async () => {
        screen.getByTestId('mock-success-access-no-expires').click();
      });

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
      expect(body.expires_in).toBe(3600);
    });

    it('keeps resolved path when getPreferredLocalePath returns null', async () => {
      mockResolvePostLoginDestination.mockResolvedValue('/en/welcome');
      mockGet.mockImplementation((key: string) => {
        if (key === 'returnUrl') return '/en/welcome';
        return null;
      });
      vi.mocked(global.fetch as unknown as typeof fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          redirectUrl: 'http://localhost:3000/en/welcome',
          access_token: 'server-at',
        }),
      } as unknown as Response);
      vi.mocked(fetchUserProfile).mockResolvedValue({
        parentContact: [{ id: 'parent-1' }],
        userPreference: { defaultLanguage: 'fr' },
      } as Awaited<ReturnType<typeof fetchUserProfile>>);
      vi.mocked(localeCookie.getPreferredLocalePath).mockReturnValue(null);

      render(<AuthLogin />);

      await act(async () => {
        screen.getByTestId('mock-success-with-access-token').click();
      });

      await waitFor(() => {
        expect((window as unknown as { location: { assign: ReturnType<typeof vi.fn> } }).location.assign).toHaveBeenCalledWith('/en/welcome');
      });
    });

    it('falls back to location.assign when token API returns not ok', async () => {
      vi.mocked(global.fetch as unknown as typeof fetch).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      } as unknown as Response);

      render(<AuthLogin />);

      await act(async () => {
        screen.getByTestId('mock-success-with-access-token').click();
      });

      await waitFor(() => {
        expect((window as unknown as { location: { assign: ReturnType<typeof vi.fn> } }).location.assign).toHaveBeenCalled();
      });
    });

    it('falls back to location.assign when token API ok but missing redirectUrl', async () => {
      vi.mocked(global.fetch as unknown as typeof fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as unknown as Response);

      render(<AuthLogin />);

      await act(async () => {
        screen.getByTestId('mock-success-with-access-token').click();
      });

      await waitFor(() => {
        expect((window as unknown as { location: { assign: ReturnType<typeof vi.fn> } }).location.assign).toHaveBeenCalled();
      });
    });
  });

  describe('SSO authenticated redirect', () => {
    it('logs GTM SSO success and redirects when idToken has claims', async () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.idToken = {
        claims: { sub: 'u-sso', email: 'sso@example.com', name: 'SSO User' },
      };

      render(<AuthLogin />);

      await waitFor(() => {
        expect(vi.mocked(gtmModule.logGTMLoginSuccess)).toHaveBeenCalledWith(
          expect.objectContaining({
            authMethod: AUTH_METHODS.SSO,
            email: 'sso@example.com',
            name: 'SSO User',
          })
        );
        expect((window as unknown as { location: { assign: ReturnType<typeof vi.fn> } }).location.assign).toHaveBeenCalled();
      });
    });

    it('logs GTM SSO success with minimal payload when claims are missing', async () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.idToken = { claims: undefined };

      render(<AuthLogin />);

      await waitFor(() => {
        expect(vi.mocked(gtmModule.logGTMLoginSuccess)).toHaveBeenCalledWith({
          authMethod: AUTH_METHODS.SSO,
        });
        expect((window as unknown as { location: { assign: ReturnType<typeof vi.fn> } }).location.assign).toHaveBeenCalled();
      });
    });
  });

  describe('handleError edge cases', () => {
    it('uses default login failed message when error message is empty', async () => {
      render(<AuthLogin />);

      await act(async () => {
        screen.getByTestId('mock-error-empty-message').click();
      });

      await waitFor(() => {
        expect(screen.getByText(AUTH_ERROR_MESSAGES.LOGIN_FAILED)).toBeInTheDocument();
      });
    });
  });
});